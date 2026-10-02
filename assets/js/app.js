/* BEDROCK app shell: hash router, progress, quizzes, glossary, review deck. */
(function () {
  const { MODULES, GLOSSARY } = window.COURSE;
  const LESSONS = MODULES.flatMap((m) => m.lessons.map((l) => ({ ...l, mod: m })));
  const byId = Object.fromEntries(LESSONS.map((l) => [l.id, l]));
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const view = document.getElementById("view");

  /* ---------- progress (localStorage, guarded) ---------- */
  const KEY = "bedrock.progress.v1";
  let P = { done: {}, quiz: {} };
  try { P = Object.assign(P, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(P)); } catch (e) {} };
  const isDone = (id) => !!P.done[id];
  const pct = () => Math.round((LESSONS.filter((l) => isDone(l.id)).length / LESSONS.length) * 100);

  /* ---------- nav ---------- */
  function renderNav(activeId) {
    document.getElementById("nav").innerHTML = MODULES.map((m) => `
      <div>
        <div class="nav-mod-title"><span class="mono">${m.num}</span><span>${esc(m.title)}</span></div>
        <ul class="nav-list">${m.lessons.map((l) => `
          <li><a href="#/lesson/${l.id}" class="${l.id === activeId ? "active" : ""}">
            <span class="dot ${isDone(l.id) ? "done" : ""}"></span><span>${esc(l.title)}</span></a></li>`).join("")}
        </ul>
      </div>`).join("");
    const p = pct();
    document.getElementById("progressPct").textContent = p + "%";
    document.getElementById("progressBar").style.width = p + "%";
  }
  function crumbs(parts) {
    document.getElementById("crumbs").innerHTML = parts.map((p, i) =>
      (i ? `<span class="sep">/</span>` : "") + (p.href ? `<a href="${p.href}">${esc(p.t)}</a>` : `<span>${esc(p.t)}</span>`)).join("");
  }

  /* ---------- home ---------- */
  function home() {
    const next = LESSONS.find((l) => !isDone(l.id)) || LESSONS[0];
    const started = LESSONS.some((l) => isDone(l.id));
    const rows = [
      ["05", "Your app", "app.MapGet(\"/devices\")", true],
      ["04", "HTTP over TLS over TCP/IP", "GET /devices HTTP/1.1"],
      ["03", "C# compiled to IL", "ldarg.0  ldarg.1  add"],
      ["02", "Machine code", "0010 0101  →  ADD [5]"],
      ["01", "Gates & bits", "XOR · AND · 0 / 1"],
    ];
    view.innerHTML = `
      <section class="hero fade-in">
        <div>
          <p class="eyebrow">// an interactive course · ${LESSONS.length} lessons · ${MODULES.length} modules</p>
          <h1>How computers actually work. <em>From one switch to a working web API.</em></h1>
          <p class="lede">Start with a single bit. Build an adder out of logic gates. Run a CPU and watch it fetch, decode and execute. Then write C#, follow a request across the network, and ship your own API, knowing what happens at every layer.</p>
          <div class="hero-actions">
            <a class="btn primary" href="#/lesson/${next.id}">${started ? "Continue: " + esc(next.title) : "Start with bits"} →</a>
            <a class="btn" href="#/lesson/2-2">Jump to the CPU simulator</a>
          </div>
        </div>
        <div class="hero-panel" aria-label="The stack you'll learn">
          <div class="label"><span>THE STACK</span><span><span class="pulse"></span>top to bottom</span></div>
          <div class="stack-diagram">
            ${rows.map((r, i) => `<div class="stack-row ${r[3] ? "live" : ""}" style="--i:${i}"><span class="n">${r[0]}</span><span>${r[1]}</span><code>${esc(r[2])}</code></div>`).join("")}
          </div>
        </div>
      </section>
      <section class="mod-index">
        <h2>// modules</h2>
        ${MODULES.map((m) => {
          const d = m.lessons.filter((l) => isDone(l.id)).length;
          const mins = m.lessons.reduce((a, l) => a + l.minutes, 0);
          return `<a class="mod-row" href="#/lesson/${m.lessons[0].id}">
            <span class="num">${m.num}</span>
            <div><h3>${esc(m.title)}</h3><p>${esc(m.blurb)}</p></div>
            <div class="lessons">${m.lessons.map((l) => esc(l.title)).join(" · ")}</div>
            <div class="mod-meta"><span>${d}/${m.lessons.length} complete</span><div class="bar"><div class="bar-fill" style="width:${(d / m.lessons.length) * 100}%"></div></div><span>~${mins} min</span></div>
          </a>`;
        }).join("")}
      </section>
      <section class="why">
        <h2>How to use this</h2>
        <ol>
          <li>Go in order. Every module builds on the one before it, and later lessons point back to earlier ones.</li>
          <li>Play with every widget before reading past it. Predict what will happen, then check.</li>
          <li>Answer each lesson's check questions. Getting them all right marks the lesson complete.</li>
          <li>Type the C# yourself. Copying teaches your clipboard; typing teaches you.</li>
          <li>Use the Review deck between sessions to keep the vocabulary fresh.</li>
        </ol>
      </section>`;
    crumbs([{ t: "Home" }]);
    renderNav(null);
  }

  /* ---------- lesson ---------- */
  function lesson(id) {
    const l = byId[id];
    if (!l) return notFound();
    const idx = LESSONS.indexOf(l);
    const prev = LESSONS[idx - 1], next = LESSONS[idx + 1];
    view.innerHTML = `
      <article class="lesson fade-in">
        <div>
          <header class="lesson-head">
            <p class="eyebrow">// module ${l.mod.num} · lesson ${l.id} · ~${l.minutes} min</p>
            <h1>${esc(l.title)}</h1>
            <p class="summary">${esc(l.summary)}</p>
          </header>
          <div class="prose" data-body>${l.body}</div>
          <section class="keypoints prose"><h2>Key points</h2><ul>${l.keypoints.map((k) => `<li>${esc(k)}</li>`).join("")}</ul></section>
          <section class="quiz prose"><h2>Check yourself</h2><div data-quiz></div></section>
          <footer class="lesson-foot">
            <div>${prev ? `<a class="btn" href="#/lesson/${prev.id}">← ${esc(prev.title)}</a>` : `<a class="btn" href="#/">← Home</a>`}</div>
            <div data-status></div>
            <div class="next">${next ? `<a class="btn primary" href="#/lesson/${next.id}">${esc(next.title)} →</a>` : `<a class="btn primary" href="#/review">Review deck →</a>`}</div>
          </footer>
        </div>
        <aside class="toc"><h4>On this page</h4><nav data-toc></nav></aside>
      </article>`;

    // TOC from h2s
    const hs = [...view.querySelectorAll("[data-body] h2")];
    hs.forEach((h, i) => { h.id = `s${i}`; });
    view.querySelector("[data-toc]").innerHTML = hs.map((h) => `<a href="#/lesson/${id}" data-jump="${h.id}">${esc(h.textContent)}</a>`).join("") +
      `<a href="#/lesson/${id}" data-jump="quiz">Check yourself</a>`;
    view.querySelector(".quiz").id = "quiz";
    view.querySelectorAll("[data-jump]").forEach((a) => a.onclick = (e) => {
      e.preventDefault();
      document.getElementById(a.dataset.jump).scrollIntoView({ behavior: "smooth", block: "start" });
    });

    // copy buttons
    view.querySelectorAll("pre.code").forEach((pre) => {
      const b = document.createElement("button");
      b.className = "copy"; b.type = "button"; b.textContent = "copy";
      b.onclick = async () => {
        const txt = pre.querySelector("code").innerText;
        try { await navigator.clipboard.writeText(txt); b.textContent = "copied"; }
        catch (e) { b.textContent = "select + copy"; }
        setTimeout(() => (b.textContent = "copy"), 1400);
      };
      pre.appendChild(b);
    });

    mountWidgets(view);
    renderQuiz(l);
    renderStatus(l);
    crumbs([{ t: "Home", href: "#/" }, { t: `${l.mod.num} ${l.mod.title}` }, { t: l.title }]);
    renderNav(id);
  }

  function renderQuiz(l) {
    const host = view.querySelector("[data-quiz]");
    const st = P.quiz[l.id] || (P.quiz[l.id] = {});
    host.innerHTML = l.quiz.map((q, qi) => `
      <div class="q" data-q="${qi}">
        <p class="q-text"><span class="mono" style="color:var(--muted)">${qi + 1}.</span> ${q.q}</p>
        <div class="q-opts">${q.o.map((o, oi) => `<button type="button" class="q-opt" data-o="${oi}">${esc(o)}</button>`).join("")}</div>
        <div data-fb></div>
      </div>`).join("");
    host.querySelectorAll(".q").forEach((qel) => {
      const qi = +qel.dataset.q, q = l.quiz[qi];
      const show = (choice) => {
        qel.querySelectorAll(".q-opt").forEach((b) => {
          const oi = +b.dataset.o;
          b.disabled = true;
          b.classList.toggle("right", oi === q.a && choice === q.a);
          b.classList.toggle("wrong", oi === choice && choice !== q.a);
        });
        const ok = choice === q.a;
        qel.querySelector("[data-fb]").innerHTML = `<p class="q-why ${ok ? "ok" : ""}">${ok ? "Correct. " : "Not quite. "}${ok ? esc(q.why) : "Think it through and try again."}</p>` +
          (ok ? "" : `<button type="button" class="btn small q-retry">Try again</button>`);
        const r = qel.querySelector(".q-retry");
        if (r) r.onclick = () => { delete st[qi]; save(); qel.querySelectorAll(".q-opt").forEach((b) => { b.disabled = false; b.className = "q-opt"; }); qel.querySelector("[data-fb]").innerHTML = ""; };
      };
      qel.querySelectorAll(".q-opt").forEach((b) => b.onclick = () => {
        const c = +b.dataset.o;
        st[qi] = c;
        if (l.quiz.every((qq, i) => st[i] === qq.a)) P.done[l.id] = true;
        save(); show(c); renderStatus(l); renderNav(l.id);
      });
      if (st[qi] !== undefined) show(st[qi]);
    });
  }

  function renderStatus(l) {
    const el = view.querySelector("[data-status]");
    if (isDone(l.id)) {
      el.innerHTML = `<span class="done-badge"><span class="dot done"></span>lesson complete</span>`;
    } else {
      el.innerHTML = `<button type="button" class="btn small" data-mark>Mark complete</button>`;
      el.querySelector("[data-mark]").onclick = () => { P.done[l.id] = true; save(); renderStatus(l); renderNav(l.id); };
    }
  }

  /* ---------- glossary ---------- */
  function glossary() {
    view.innerHTML = `
      <section class="page fade-in">
        <p class="eyebrow">// reference</p>
        <h1>Glossary</h1>
        <p class="summary">${GLOSSARY.length} terms, each linked to the lesson that teaches it.</p>
        <div class="w-field"><label for="gl-q">Search</label><input id="gl-q" class="w-input gl-search" placeholder="Try: stack, DNS, opcode" autocomplete="off"></div>
        <div data-list></div>
      </section>`;
    const input = view.querySelector("#gl-q");
    const draw = () => {
      const q = input.value.trim().toLowerCase();
      const items = GLOSSARY.filter((g) => !q || g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q))
        .sort((a, b) => a.term.localeCompare(b.term));
      view.querySelector("[data-list]").innerHTML = items.length
        ? `<dl class="gl-list">${items.map((g) => `<dt>${esc(g.term)}</dt><dd>${esc(g.def)}<a href="#/lesson/${g.lesson}">${g.lesson} →</a></dd>`).join("")}</dl>`
        : `<div class="empty"><strong>No matches for "${esc(input.value)}"</strong>Try a shorter word, or browse the full list by clearing the search.</div>`;
    };
    input.oninput = draw;
    draw();
    crumbs([{ t: "Home", href: "#/" }, { t: "Glossary" }]);
    renderNav(null);
  }

  /* ---------- review deck ---------- */
  function review() {
    const doneIds = new Set(LESSONS.filter((l) => isDone(l.id)).map((l) => l.id));
    let pool = GLOSSARY.filter((g) => doneIds.has(g.lesson));
    const scope = pool.length ? "from lessons you've completed" : "from the whole course (complete lessons to focus it)";
    if (!pool.length) pool = GLOSSARY.slice();
    let deck = pool.map((g) => ({ ...g })).sort(() => Math.random() - 0.5);
    let shown = false, right = 0, seen = 0;
    view.innerHTML = `
      <section class="page fade-in" style="max-width:720px">
        <p class="eyebrow">// active recall</p>
        <h1>Review deck</h1>
        <p class="summary">${pool.length} cards ${scope}. Say the definition out loud before you reveal it. Cards you miss go to the back of the deck.</p>
        <div data-card></div>
      </section>`;
    const draw = () => {
      const host = view.querySelector("[data-card]");
      if (!deck.length) {
        host.innerHTML = `<div class="flash-card"><div class="fq">Deck cleared.</div><div class="fa">${right} of ${seen} answered right on the first try.</div><div class="w-row"><button class="btn primary" data-again>Shuffle and go again</button><a class="btn" href="#/">Home</a></div></div>`;
        host.querySelector("[data-again]").onclick = review;
        return;
      }
      const c = deck[0];
      host.innerHTML = `
        <div class="flash-card">
          <div class="meta"><span>${deck.length} left</span><a href="#/lesson/${c.lesson}">lesson ${c.lesson}</a></div>
          <div class="fq">${esc(c.term)}</div>
          ${shown ? `<div class="fa">${esc(c.def)}</div>` : ""}
          <div class="w-row">${shown
            ? `<button class="btn primary" data-k="got">Got it</button><button class="btn" data-k="again">Again</button>`
            : `<button class="btn primary" data-k="show">Reveal</button>`}</div>
        </div>`;
      host.querySelectorAll("[data-k]").forEach((b) => b.onclick = () => {
        const k = b.dataset.k;
        if (k === "show") { shown = true; }
        else {
          const card = deck.shift();
          if (!card.retry) seen++;
          if (k === "got") { if (!card.retry) right++; }
          else { card.retry = true; deck.push(card); }
          shown = false;
        }
        draw();
      });
    };
    draw();
    crumbs([{ t: "Home", href: "#/" }, { t: "Review deck" }]);
    renderNav(null);
  }

  function notFound() {
    view.innerHTML = `<section class="page"><div class="empty"><strong>That page doesn't exist.</strong><a href="#/">Back to the start</a></div></section>`;
    crumbs([{ t: "Not found" }]);
    renderNav(null);
  }

  /* ---------- router ---------- */
  let lastCleanup = [];
  function route() {
    lastCleanup.forEach((f) => { try { f(); } catch (e) {} });
    const h = location.hash.replace(/^#/, "") || "/";
    const m = h.match(/^\/lesson\/([\w-]+)$/);
    if (m) lesson(m[1]);
    else if (h === "/glossary") glossary();
    else if (h === "/review") review();
    else if (h === "/" || h === "") home();
    else notFound();
    lastCleanup = [...view.querySelectorAll(".widget")].map((w) => w._cleanup).filter(Boolean);
    window.scrollTo(0, 0);
    closeMenu();
    view.focus({ preventScroll: true });
  }

  /* ---------- mobile menu ---------- */
  const sidebar = document.getElementById("sidebar"), scrim = document.getElementById("scrim"), menuBtn = document.getElementById("menuBtn");
  function closeMenu() { sidebar.classList.remove("open"); scrim.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }
  menuBtn.onclick = () => { const o = !sidebar.classList.contains("open"); sidebar.classList.toggle("open", o); scrim.classList.toggle("open", o); menuBtn.setAttribute("aria-expanded", String(o)); };
  scrim.onclick = closeMenu;
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  document.getElementById("resetBtn").onclick = () => {
    if (!confirm("Clear all lesson progress and quiz answers?")) return;
    P = { done: {}, quiz: {} }; save();
    try { Object.keys(localStorage).filter((k) => k.startsWith("bedrock.")).forEach((k) => localStorage.removeItem(k)); } catch (e) {}
    route();
  };

  window.addEventListener("hashchange", route);
  route();
})();
