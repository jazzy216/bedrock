/* Interactive widgets. Each widget: Widgets[name](el, opts) renders into el. */
(function () {
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const bin = (n, w = 8) => (n >>> 0).toString(2).padStart(w, "0").slice(-w);
  const hex = (n, w = 2) => (n >>> 0).toString(16).toUpperCase().padStart(w, "0");

  function frame(el, title, tag) {
    el.classList.add("widget");
    el.innerHTML = `<div class="w-head"><span>${esc(title)}</span><span class="tag">${esc(tag || "interactive")}</span></div><div class="w-body"></div>`;
    return el.querySelector(".w-body");
  }

  const W = {};

  /* ---------------- 1. Bit toggler ---------------- */
  W.bits = (el) => {
    const body = frame(el, "One byte = 8 switches", "click a bit");
    let v = 0b00000101;
    body.innerHTML = `
      <div class="bits"></div>
      <p class="w-out" style="margin:16px 0 0">decimal <b data-d></b> &nbsp; hex <b data-h></b> &nbsp; binary <b data-b></b></p>
      <div class="w-row" style="margin-top:12px">
        <button class="btn small" data-act="clr">Clear</button>
        <button class="btn small" data-act="max">All on (255)</button>
        <button class="btn small" data-act="shl">Shift left</button>
        <button class="btn small" data-act="shr">Shift right</button>
      </div>
      <p class="w-note" data-note></p>`;
    const grid = body.querySelector(".bits");
    const render = () => {
      grid.innerHTML = "";
      for (let i = 7; i >= 0; i--) {
        const on = (v >> i) & 1;
        const b = document.createElement("button");
        b.type = "button";
        b.className = "bit" + (on ? " on" : "");
        b.innerHTML = `<span class="v">${on}</span><span class="pv">${1 << i}</span>`;
        b.setAttribute("aria-label", `bit worth ${1 << i}, currently ${on}`);
        b.onclick = () => { v ^= 1 << i; render(); };
        grid.appendChild(b);
      }
      body.querySelector("[data-d]").textContent = v;
      body.querySelector("[data-h]").textContent = "0x" + hex(v);
      body.querySelector("[data-b]").textContent = bin(v);
      const parts = [];
      for (let i = 7; i >= 0; i--) if ((v >> i) & 1) parts.push(1 << i);
      body.querySelector("[data-note]").textContent = parts.length
        ? `${parts.join(" + ")} = ${v}`
        : "Every switch is off: the value is 0.";
    };
    body.querySelector('[data-act="clr"]').onclick = () => { v = 0; render(); };
    body.querySelector('[data-act="max"]').onclick = () => { v = 255; render(); };
    body.querySelector('[data-act="shl"]').onclick = () => {
      const lost = (v >> 7) & 1; v = (v << 1) & 0xff; render();
      body.querySelector("[data-note]").textContent += lost ? "  (the top bit fell off the end: overflow)" : "  (shifting left doubles the value)";
    };
    body.querySelector('[data-act="shr"]').onclick = () => { v = v >> 1; render(); body.querySelector("[data-note]").textContent += "  (shifting right halves it, dropping any remainder)"; };
    render();
  };

  /* ---------------- 2. Base converter ---------------- */
  W.convert = (el) => {
    const body = frame(el, "Base converter", "type in any box");
    body.innerHTML = `
      <div class="w-row" style="align-items:flex-start">
        <div class="w-field"><label for="cv-d">Decimal</label><input id="cv-d" class="w-input" inputmode="numeric" value="2026" size="12"></div>
        <div class="w-field"><label for="cv-b">Binary</label><input id="cv-b" class="w-input" size="20"></div>
        <div class="w-field"><label for="cv-h">Hex</label><input id="cv-h" class="w-input" size="10"></div>
      </div>
      <p class="w-error" data-err></p>
      <p class="w-note" data-note></p>`;
    const d = body.querySelector("#cv-d"), b = body.querySelector("#cv-b"), h = body.querySelector("#cv-h");
    const err = body.querySelector("[data-err]"), note = body.querySelector("[data-note]");
    const set = (n, src) => {
      err.textContent = "";
      if (src !== d) d.value = n;
      if (src !== b) b.value = n.toString(2);
      if (src !== h) h.value = n.toString(16).toUpperCase();
      const bits = n === 0 ? 1 : n.toString(2).length;
      const bytes = Math.ceil(bits / 8);
      note.textContent = `Needs ${bits} bit${bits > 1 ? "s" : ""}, so it fits in ${bytes} byte${bytes > 1 ? "s" : ""}. Each hex digit is exactly 4 bits, which is why hex is the shorthand for binary.`;
    };
    const parse = (src, re, base, name) => () => {
      const t = src.value.trim().replace(/^0x|^0b/i, "").replace(/[\s_]/g, "");
      if (!t) { err.textContent = ""; return; }
      if (!re.test(t)) { err.textContent = `That is not valid ${name}.`; return; }
      const n = parseInt(t, base);
      if (n > 4294967295) { err.textContent = "Keep it under 4,294,967,295 (32 bits) for this demo."; return; }
      set(n, src);
    };
    d.oninput = parse(d, /^\d+$/, 10, "decimal");
    b.oninput = parse(b, /^[01]+$/, 2, "binary (only 0 and 1)");
    h.oninput = parse(h, /^[0-9a-f]+$/i, 16, "hex (0-9, A-F)");
    set(2026, null);
  };

  /* ---------------- 3. Logic gates ---------------- */
  const GATES = {
    AND: (a, b) => a & b, OR: (a, b) => a | b, XOR: (a, b) => a ^ b,
    NAND: (a, b) => 1 - (a & b), NOR: (a, b) => 1 - (a | b), NOT: (a) => 1 - a,
  };
  const GATE_NOTES = {
    AND: "Output is 1 only when A and B are both 1. Think: two switches in series.",
    OR: "Output is 1 when at least one input is 1. Think: two switches in parallel.",
    XOR: "Output is 1 when the inputs differ. This is the sum bit of binary addition.",
    NAND: "AND, then flipped. Every other gate can be built from NAND alone, which is why chips are full of them.",
    NOR: "OR, then flipped. Like NAND, NOR alone can build any circuit.",
    NOT: "One input, flipped. Also called an inverter.",
  };
  function gateSVG(g) {
    const stroke = 'stroke="currentColor" stroke-width="2" fill="none"';
    let shape;
    if (g === "AND" || g === "NAND") shape = `<path d="M60 20 h40 a40 40 0 0 1 0 80 h-40 z" ${stroke}/>`;
    else if (g === "NOT") shape = `<path d="M60 22 L130 60 L60 98 Z" ${stroke}/>`;
    else shape = `<path d="M55 20 q30 40 0 80 q60 0 90 -40 q-30 -40 -90 -40 z" ${stroke}/>` + (g === "XOR" ? `<path d="M45 20 q30 40 0 80" ${stroke}/>` : "");
    const bubble = (g === "NAND" || g === "NOR" || g === "NOT") ? `<circle cx="${g === "NOT" ? 137 : 152}" cy="60" r="6" ${stroke}/>` : "";
    const ins = g === "NOT" ? `<path d="M0 60 h60" ${stroke}/>` : `<path d="M0 40 h62 M0 80 h62" ${stroke}/>`;
    return `<svg viewBox="0 0 200 120" class="gate-svg" style="color:var(--text-2)">${ins}${shape}${bubble}<path d="M${g === "NOT" ? 143 : 158} 60 H200" ${stroke}/><text x="100" y="66" text-anchor="middle" fill="currentColor" font-family="Geist Mono" font-size="13">${g}</text></svg>`;
  }
  W.gates = (el) => {
    const body = frame(el, "Logic gate bench", "flip the inputs");
    let g = "AND", A = 0, B = 0;
    body.innerHTML = `
      <div class="w-row" style="margin-bottom:16px" data-gsel></div>
      <div class="gate-board">
        <div style="display:grid;gap:8px" data-ins></div>
        <div data-svg></div>
        <div class="lamp" data-lamp>0</div>
      </div>
      <table class="tt" data-tt></table>
      <p class="w-note" data-note></p>`;
    const sel = body.querySelector("[data-gsel]");
    Object.keys(GATES).forEach((k) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "btn small"; b.textContent = k;
      b.onclick = () => { g = k; render(); };
      sel.appendChild(b);
    });
    const render = () => {
      sel.querySelectorAll("button").forEach((b) => b.classList.toggle("primary", b.textContent === g));
      const ins = body.querySelector("[data-ins]");
      ins.innerHTML = "";
      const mk = (name, val, set) => {
        const t = document.createElement("button");
        t.type = "button"; t.className = "toggle" + (val ? " on" : "");
        t.innerHTML = `<span class="sw"></span>${name} = ${val}`;
        t.onclick = () => { set(); render(); };
        ins.appendChild(t);
      };
      mk("A", A, () => { A ^= 1; });
      if (g !== "NOT") mk("B", B, () => { B ^= 1; });
      body.querySelector("[data-svg]").innerHTML = gateSVG(g);
      const out = GATES[g](A, B);
      const lamp = body.querySelector("[data-lamp]");
      lamp.textContent = out; lamp.classList.toggle("on", !!out);
      const rows = g === "NOT" ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
      body.querySelector("[data-tt]").innerHTML =
        `<tr><th>A</th>${g === "NOT" ? "" : "<th>B</th>"}<th>out</th></tr>` +
        rows.map((r) => {
          const cur = r[0] === A && (g === "NOT" || r[1] === B);
          return `<tr class="${cur ? "cur" : ""}">${r.map((x) => `<td>${x}</td>`).join("")}<td>${GATES[g](r[0], r[1])}</td></tr>`;
        }).join("");
      body.querySelector("[data-note]").textContent = GATE_NOTES[g];
    };
    render();
  };

  /* ---------------- 4. 4-bit ripple adder ---------------- */
  W.adder = (el) => {
    const body = frame(el, "4-bit ripple-carry adder", "click A and B bits");
    let a = 2, b = 3;
    body.innerHTML = `<div class="adder" data-g></div><p class="w-note" data-note></p>`;
    const render = () => {
      const carries = [0]; const sums = [];
      for (let i = 0; i < 4; i++) {
        const x = (a >> i) & 1, y = (b >> i) & 1, c = carries[i];
        sums[i] = x ^ y ^ c;
        carries[i + 1] = (x & y) | (c & (x ^ y));
      }
      const total = a + b;
      const cells = (fn) => [4, 3, 2, 1, 0].map(fn).join("");
      const g = body.querySelector("[data-g]");
      g.innerHTML = `
        <div class="adder-row"><span class="lab">carry</span>${cells((i) => i === 0 ? `<div class="cell carry blank"></div>` : `<div class="cell carry ${carries[i] ? "on" : ""}">${carries[i]}</div>`)}<span></span></div>
        <div class="adder-row"><span class="lab">A</span>${cells((i) => i === 4 ? `<div class="cell blank"></div>` : `<div class="cell btnc ${(a >> i) & 1 ? "on" : ""}" data-a="${i}">${(a >> i) & 1}</div>`)}<span class="dec">${a}</span></div>
        <div class="adder-row"><span class="lab">+ B</span>${cells((i) => i === 4 ? `<div class="cell blank"></div>` : `<div class="cell btnc ${(b >> i) & 1 ? "on" : ""}" data-b="${i}">${(b >> i) & 1}</div>`)}<span class="dec">${b}</span></div>
        <hr>
        <div class="adder-row"><span class="lab">sum</span>${cells((i) => { const v = i === 4 ? carries[4] : sums[i]; return `<div class="cell ${v ? "on" : ""}">${v}</div>`; })}<span class="dec">${total}</span></div>`;
      g.querySelectorAll("[data-a]").forEach((c) => c.onclick = () => { a ^= 1 << +c.dataset.a; render(); });
      g.querySelectorAll("[data-b]").forEach((c) => c.onclick = () => { b ^= 1 << +c.dataset.b; render(); });
      const nc = carries.slice(1).filter(Boolean).length;
      body.querySelector("[data-note]").textContent =
        `${a} + ${b} = ${total}. Each column is one full adder: sum = A XOR B XOR carry-in, carry-out = (A AND B) OR (carry-in AND (A XOR B)). ` +
        (nc ? `${nc} carr${nc > 1 ? "ies" : "y"} rippled left.` : "No carries this time.") +
        (carries[4] ? " The leftmost carry became a 5th bit: in a strict 4-bit machine that bit is lost, which is overflow." : "");
    };
    render();
  };

  /* ---------------- 5. Text to bytes ---------------- */
  W.textbytes = (el) => {
    const body = frame(el, "Text is just numbers", "type anything");
    body.innerHTML = `
      <div class="w-field"><label for="tb-in">Your text</label><input id="tb-in" class="w-input" value="Hi! café" style="width:100%"></div>
      <div class="bytes-grid" data-g></div>
      <p class="w-note" data-note></p>`;
    const inp = body.querySelector("#tb-in");
    const enc = new TextEncoder();
    const render = () => {
      const g = body.querySelector("[data-g]");
      g.innerHTML = "";
      let total = 0;
      for (const ch of inp.value) {
        const bytes = enc.encode(ch);
        total += bytes.length;
        const chip = document.createElement("div");
        chip.className = "byte-chip" + (bytes.length > 1 ? " multi" : "");
        const shown = ch === " " ? "space" : ch;
        chip.innerHTML = `<span class="ch">${esc(shown)}</span><span class="hx">${[...bytes].map((x) => hex(x)).join(" ")}</span><span class="bn">${[...bytes].map((x) => bin(x)).join(" ")}</span>`;
        chip.title = `Code point U+${ch.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;
        g.appendChild(chip);
      }
      body.querySelector("[data-note]").textContent = inp.value
        ? `${[...inp.value].length} characters became ${total} bytes of UTF-8. Plain English letters are 1 byte each (the old ASCII range). Accented letters and symbols take 2 to 4 bytes, outlined in amber.`
        : "Empty string: zero bytes. Type something above.";
    };
    inp.oninput = render;
    render();
  };

  /* ---------------- 6. CPU simulator ---------------- */
  const OPS = { NOP: 0x0, LDA: 0x1, ADD: 0x2, SUB: 0x3, STA: 0x4, LDI: 0x5, JMP: 0x6, JZ: 0x7, OUT: 0xE, HLT: 0xF };
  const OPNAME = Object.fromEntries(Object.entries(OPS).map(([k, v]) => [v, k]));
  const NO_ARG = new Set(["NOP", "OUT", "HLT"]);
  const PROGRAMS = {
    "Add 2 + 3": `; Load x, add y, show the result
      LDA x      ; ACC = memory[x]
      ADD y      ; ACC = ACC + memory[y]
      OUT        ; display ACC
      HLT        ; stop
x:    DB 2
y:    DB 3`,
    "Count down": `; Print 5, 4, 3, 2, 1, 0
      LDA start
loop: OUT
      JZ done    ; if ACC == 0, jump to done
      SUB one
      JMP loop
done: HLT
start: DB 5
one:  DB 1`,
    "Multiply 3 x 4": `; No MUL instruction? Add 3 to itself 4 times.
      LDA count
loop: JZ done
      LDA result
      ADD a
      STA result
      LDA count
      SUB one
      STA count
      JMP loop
done: LDA result
      OUT
      HLT
a:    DB 3
count: DB 4
result: DB 0
one:  DB 1`,
  };
  function assemble(src) {
    const lines = src.split("\n");
    const items = []; const labels = {}; const errors = [];
    lines.forEach((raw, ln) => {
      let line = raw.replace(/;.*/, "").trim();
      if (!line) return;
      const lm = line.match(/^([A-Za-z_]\w*):\s*(.*)$/);
      if (lm) { labels[lm[1].toLowerCase()] = items.length; line = lm[2].trim(); if (!line) return; }
      const [opRaw, argRaw] = line.split(/\s+/);
      const op = opRaw.toUpperCase();
      items.push({ op, arg: argRaw, ln: ln + 1, text: line });
    });
    if (items.length > 16) errors.push(`Program uses ${items.length} bytes but memory only has 16.`);
    const mem = new Array(16).fill(0); const asmText = new Array(16).fill("");
    items.slice(0, 16).forEach((it, addr) => {
      const resolve = (a) => {
        if (a === undefined) return null;
        if (/^\d+$/.test(a)) return +a;
        if (/^0x[0-9a-f]+$/i.test(a)) return parseInt(a, 16);
        const k = a.toLowerCase();
        if (k in labels) return labels[k];
        errors.push(`Line ${it.ln}: unknown label "${a}".`); return 0;
      };
      if (it.op === "DB") {
        const v = resolve(it.arg);
        if (v === null || v > 255) errors.push(`Line ${it.ln}: DB needs a value 0-255.`);
        mem[addr] = (v || 0) & 0xff; asmText[addr] = `DB ${mem[addr]}`;
        return;
      }
      if (!(it.op in OPS)) { errors.push(`Line ${it.ln}: unknown instruction "${it.op}".`); return; }
      let operand = 0;
      if (!NO_ARG.has(it.op)) {
        const v = resolve(it.arg);
        if (v === null) errors.push(`Line ${it.ln}: ${it.op} needs an operand.`);
        else if (v > 15) errors.push(`Line ${it.ln}: operand must be 0-15 (4 bits).`);
        operand = (v || 0) & 0xf;
      }
      mem[addr] = (OPS[it.op] << 4) | operand;
      asmText[addr] = it.op + (NO_ARG.has(it.op) ? "" : " " + it.arg);
    });
    return { mem, asmText, errors };
  }
  W.cpu = (el) => {
    const body = frame(el, "BEDROCK-4 CPU simulator", "step or run");
    body.innerHTML = `
      <div class="w-row" style="margin-bottom:12px">
        <select class="w-select" data-prog aria-label="Example program">${Object.keys(PROGRAMS).map((k) => `<option>${k}</option>`).join("")}</select>
        <button class="btn small" data-act="asm">Assemble &amp; load</button>
        <button class="btn small primary" data-act="step">Step</button>
        <button class="btn small" data-act="run">Run</button>
        <button class="btn small" data-act="reset">Reset</button>
      </div>
      <div class="cpu">
        <div class="cpu-col">
          <div class="w-field"><label for="cpu-src">Assembly source</label><textarea id="cpu-src" class="w-textarea" rows="15" spellcheck="false"></textarea></div>
          <p class="w-error" data-err></p>
        </div>
        <div class="cpu-col">
          <div class="phase"><span data-ph="fetch">FETCH</span><span data-ph="decode">DECODE</span><span data-ph="execute">EXECUTE</span></div>
          <div class="regs">
            <div class="reg" data-r="pc"><div class="k">PC</div><div class="val"></div><div class="sub"></div></div>
            <div class="reg" data-r="ir"><div class="k">IR</div><div class="val"></div><div class="sub"></div></div>
            <div class="reg" data-r="acc"><div class="k">ACC</div><div class="val"></div><div class="sub"></div></div>
            <div class="reg" data-r="z"><div class="k">ZERO</div><div class="val"></div><div class="sub">flag</div></div>
          </div>
          <div class="mem" data-mem></div>
          <div class="cpu-log" data-log></div>
          <div><div class="w-field"><label>Output port</label></div><div class="cpu-out" data-out></div></div>
        </div>
      </div>`;
    const $ = (s) => body.querySelector(s);
    const src = $("#cpu-src"), progSel = $("[data-prog]");
    let S, timer = null, prog = null;
    const fresh = () => ({ pc: 0, ir: 0, acc: 0, phase: "fetch", halted: false, out: [], mem: prog ? prog.mem.slice() : new Array(16).fill(0), touched: -1, flash: "", steps: 0 });
    const stop = () => { if (timer) { clearInterval(timer); timer = null; $('[data-act="run"]').textContent = "Run"; } };
    const load = () => {
      stop();
      prog = assemble(src.value);
      $("[data-err]").textContent = prog.errors.join(" ");
      S = fresh();
      S.log = prog.errors.length ? "Fix the errors, then assemble again." : "Program loaded into memory. Each cell is one byte: high 4 bits = opcode, low 4 bits = address. Press Step.";
      draw();
    };
    const draw = () => {
      $('[data-r="pc"] .val').textContent = S.pc;
      $('[data-r="pc"] .sub').textContent = bin(S.pc, 4);
      $('[data-r="ir"] .val').textContent = "0x" + hex(S.ir);
      $('[data-r="ir"] .sub').textContent = bin(S.ir);
      $('[data-r="acc"] .val').textContent = S.acc;
      $('[data-r="acc"] .sub').textContent = bin(S.acc);
      $('[data-r="z"] .val').textContent = S.acc === 0 ? 1 : 0;
      body.querySelectorAll(".reg").forEach((r) => r.classList.toggle("flash", r.dataset.r === S.flash));
      body.querySelectorAll("[data-ph]").forEach((p) => p.classList.toggle("on", !S.halted && p.dataset.ph === S.phase));
      $("[data-mem]").innerHTML = S.mem.map((m, i) => `
        <div class="mcell ${i === S.pc && !S.halted ? "pc" : ""} ${i === S.touched ? "touched" : ""}">
          <div class="ad">[${i}] ${bin(i, 4)}</div><div class="bv">${bin(m)}</div><div class="as">${esc(prog ? prog.asmText[i] || "" : "")}</div>
        </div>`).join("");
      $("[data-log]").textContent = S.log || "";
      $("[data-out]").textContent = S.out.join("  ") || "—";
    };
    const step = () => {
      if (!prog || prog.errors.length) return;
      if (S.halted) { S.log = "CPU is halted. Press Reset to run again."; draw(); return; }
      if (++S.steps > 600) { S.halted = true; S.log = "Stopped after 600 steps. Probably an infinite loop."; stop(); draw(); return; }
      S.touched = -1;
      if (S.phase === "fetch") {
        S.ir = S.mem[S.pc];
        S.log = `FETCH: copy memory[${S.pc}] (${bin(S.ir)}) into the Instruction Register, then PC goes to ${(S.pc + 1) & 15}.`;
        S.pc = (S.pc + 1) & 15; S.flash = "ir"; S.phase = "decode";
      } else if (S.phase === "decode") {
        const op = S.ir >> 4, arg = S.ir & 15, name = OPNAME[op];
        S.log = name
          ? `DECODE: top 4 bits ${bin(op, 4)} = opcode ${name}. Bottom 4 bits ${bin(arg, 4)} = ${NO_ARG.has(name) ? "unused" : "operand " + arg}.`
          : `DECODE: ${bin(op, 4)} is not a valid opcode. The CPU halts.`;
        if (!name) S.halted = true;
        S.flash = ""; S.phase = "execute";
      } else {
        const op = OPNAME[S.ir >> 4], a = S.ir & 15;
        switch (op) {
          case "NOP": S.log = "EXECUTE: NOP does nothing."; break;
          case "LDA": S.acc = S.mem[a]; S.touched = a; S.flash = "acc"; S.log = `EXECUTE: ACC = memory[${a}] = ${S.acc}.`; break;
          case "ADD": { const r = S.acc + S.mem[a]; S.touched = a; S.log = `EXECUTE: ALU adds ${S.acc} + ${S.mem[a]} = ${r}${r > 255 ? " (overflow, wraps to " + (r & 255) + ")" : ""}.`; S.acc = r & 255; S.flash = "acc"; break; }
          case "SUB": { const r = S.acc - S.mem[a]; S.touched = a; S.log = `EXECUTE: ALU subtracts ${S.acc} - ${S.mem[a]} = ${r}${r < 0 ? " (underflow, wraps to " + (r & 255) + ")" : ""}.`; S.acc = r & 255; S.flash = "acc"; break; }
          case "STA": S.mem[a] = S.acc; S.touched = a; S.log = `EXECUTE: memory[${a}] = ACC (${S.acc}).`; break;
          case "LDI": S.acc = a; S.flash = "acc"; S.log = `EXECUTE: ACC = ${a} (the number is inside the instruction itself).`; break;
          case "JMP": S.pc = a; S.flash = "pc"; S.log = `EXECUTE: PC = ${a}. Next fetch comes from there. This is how loops exist.`; break;
          case "JZ": if (S.acc === 0) { S.pc = a; S.flash = "pc"; S.log = `EXECUTE: ACC is 0, so jump: PC = ${a}.`; } else S.log = `EXECUTE: ACC is ${S.acc}, not 0, so no jump. This is how "if" exists.`; break;
          case "OUT": S.out.push(S.acc); S.log = `EXECUTE: send ACC (${S.acc}) to the output port.`; break;
          case "HLT": S.halted = true; S.log = "EXECUTE: HLT. The clock stops. Program finished."; stop(); break;
        }
        S.phase = "fetch";
      }
      draw();
    };
    progSel.onchange = () => { src.value = PROGRAMS[progSel.value]; load(); };
    $('[data-act="asm"]').onclick = load;
    $('[data-act="step"]').onclick = () => { stop(); step(); };
    $('[data-act="reset"]').onclick = () => { stop(); S = fresh(); S.log = "Reset: PC = 0, ACC = 0, memory reloaded."; draw(); };
    $('[data-act="run"]').onclick = () => {
      if (timer) { stop(); return; }
      if (S.halted) { S = fresh(); }
      $('[data-act="run"]').textContent = "Pause";
      timer = setInterval(() => { step(); if (S.halted) stop(); }, 260);
    };
    src.value = PROGRAMS["Add 2 + 3"];
    load();
    el._cleanup = stop;
  };

  /* ---------------- 7. Generic stepper (sequence diagrams) ---------------- */
  const SEQS = {
    tcp: {
      title: "TCP three-way handshake", left: "Your laptop", right: "Server :443",
      steps: [
        ["l", "SYN  seq=4271", "I want to talk. My starting sequence number is 4271."],
        ["r", "SYN-ACK  seq=9902 ack=4272", "Heard you (expecting 4272 next). My starting number is 9902."],
        ["l", "ACK  ack=9903", "Heard you too. Connection is open."],
        ["l", "DATA  seq=4272  [517 bytes]", "Now real data flows, e.g. the start of a TLS handshake."],
        ["r", "ACK  ack=4789", "Got all 517 bytes (4272 + 517 = 4789). Missing bytes would be re-sent."],
        ["l", "FIN", "Later: I'm done sending."],
        ["r", "FIN-ACK", "Me too. Connection closes."],
      ],
    },
    dns: {
      title: "DNS lookup for darkfiresecurity.com", left: "Your resolver", right: "Name servers",
      steps: [
        ["l", "Where is darkfiresecurity.com?", "Your computer asks its configured resolver (often your router or 1.1.1.1). If it is cached, we are done instantly."],
        ["r", "Root: ask the .com servers", "Not cached, so the resolver asks a root server. Root only knows who runs each top-level domain."],
        ["l", "Where is darkfiresecurity.com?", "Resolver asks a .com TLD server."],
        ["r", ".com: ask that domain's name server", "The TLD knows which authoritative name server holds this domain's records."],
        ["l", "A record for darkfiresecurity.com?", "Resolver asks the authoritative server directly."],
        ["r", "A 76.76.21.21  TTL 300", "Example answer: an IPv4 address, cacheable for 300 seconds. Your browser can now open a TCP connection."],
      ],
    },
    tls: {
      title: "TLS 1.3 handshake (simplified)", left: "Browser", right: "Server",
      steps: [
        ["l", "ClientHello + key share", "Supported ciphers, a random number, and half of a key exchange (Diffie-Hellman)."],
        ["r", "ServerHello + key share", "Server picks a cipher and sends its half. Both sides can now compute the same secret key without ever sending it."],
        ["r", "Certificate + signature (encrypted)", "Proves the server owns the domain. Signed by a Certificate Authority your device already trusts."],
        ["l", "Verify cert chain", "Browser checks: right domain name, not expired, signed by a trusted CA. If any check fails, you get the warning page."],
        ["l", "Finished", "Handshake done in one round trip. Everything after this is encrypted."],
        ["l", "GET / HTTP/1.1 (encrypted)", "HTTP rides inside the TLS tunnel. Observers see IPs and the domain name, not the path or content."],
      ],
    },
  };
  W.seq = (el, opts) => {
    const d = SEQS[opts.id];
    const body = frame(el, d.title, "step through");
    let n = 0;
    body.innerHTML = `
      <div class="seq"><div class="seq-col-h">${esc(d.left)}</div><div class="seq-col-h r">${esc(d.right)}</div><div class="seq-msgs" data-m></div></div>
      <div class="w-row" style="margin-top:14px"><button class="btn small primary" data-act="next">Next</button><button class="btn small" data-act="reset">Restart</button><span class="status-line" data-c></span></div>`;
    const render = () => {
      body.querySelector("[data-m]").innerHTML = d.steps.slice(0, n).map(([side, m, why]) =>
        `<div class="msg ${side}"><span class="arrow">${side === "l" ? "→ " : "← "}</span>${esc(m)}<small>${esc(why)}</small></div>`).join("") ||
        `<div class="status-line">Press Next to send the first message.</div>`;
      body.querySelector("[data-c]").textContent = `${n} / ${d.steps.length}`;
      body.querySelector('[data-act="next"]').disabled = n >= d.steps.length;
    };
    body.querySelector('[data-act="next"]').onclick = () => { n++; render(); };
    body.querySelector('[data-act="reset"]').onclick = () => { n = 0; render(); };
    render();
  };

  /* ---------------- 8. Encapsulation ---------------- */
  W.encap = (el) => {
    const body = frame(el, "Encapsulation: wrapping a request", "wrap / unwrap");
    const L = [
      { n: "Application", proto: "HTTP", hdr: "" },
      { n: "Transport", proto: "TCP", hdr: "src port 51544 → dst port 443 · seq 4272 · flags ACK,PSH" },
      { n: "Internet", proto: "IP", hdr: "src 192.168.1.37 → dst 76.76.21.21 · TTL 64 · proto TCP" },
      { n: "Link", proto: "Ethernet / Wi-Fi", hdr: "src MAC a4:83:e7:2c:91:0f → dst MAC (your router) 60:38:e0:11:aa:42" },
    ];
    const notes = [
      "Your app has data to send: an HTTP request. It knows nothing about cables or addresses.",
      "TCP wraps it with ports (which program) and sequence numbers (ordering, retransmits).",
      "IP wraps that with addresses (which machine on the internet). Routers only read this layer.",
      "The link layer wraps it for the next hop only. This header is replaced at every router along the way.",
    ];
    let depth = 0;
    body.innerHTML = `<div data-v></div><div class="w-row" style="margin-top:14px"><button class="btn small primary" data-act="wrap">Wrap (send)</button><button class="btn small" data-act="unwrap">Unwrap (receive)</button></div><p class="w-note" data-note></p>`;
    const render = () => {
      let inner = `<div class="payload">GET /services HTTP/1.1  Host: darkfiresecurity.com</div>`;
      for (let i = 1; i <= depth; i++) {
        inner = `<div class="layer-box"><div class="lh"><span>Layer ${5 - i} · ${L[i].n}</span><b>${L[i].proto}</b></div><div class="hdr">${esc(L[i].hdr)}</div><div class="inner">${inner}</div></div>`;
      }
      body.querySelector("[data-v]").innerHTML = inner;
      body.querySelector("[data-note]").textContent = notes[depth];
      body.querySelector('[data-act="wrap"]').disabled = depth >= 3;
      body.querySelector('[data-act="unwrap"]').disabled = depth <= 0;
    };
    body.querySelector('[data-act="wrap"]').onclick = () => { depth++; render(); };
    body.querySelector('[data-act="unwrap"]').onclick = () => { depth--; render(); };
    render();
  };

  /* ---------------- 9. HTTP request builder ---------------- */
  W.http = (el) => {
    const body = frame(el, "HTTP request builder", "send to a fake server");
    body.innerHTML = `
      <div class="w-row" style="margin-bottom:12px">
        <select class="w-select" data-m aria-label="Method"><option>GET</option><option>POST</option><option>DELETE</option></select>
        <select class="w-select" data-p aria-label="Path">
          <option>/</option><option>/api/devices</option><option>/api/devices/VU-04417</option><option>/api/devices/VU-99999</option><option>/admin</option><option>/old-page</option><option>/api/crash</option>
        </select>
        <label class="toggle" style="cursor:pointer"><input type="checkbox" data-auth style="accent-color:var(--accent)"> Authorization header</label>
        <button class="btn small primary" data-act="send">Send</button>
      </div>
      <div class="w-field" data-bodywrap style="margin-bottom:12px;display:none"><label for="http-body">JSON body</label><textarea id="http-body" class="w-textarea" rows="3" spellcheck="false">{"assetTag":"VU-05120","model":"Latitude 5550","status":"Staged"}</textarea></div>
      <div class="http-grid">
        <div class="w-field"><label>Request (what actually goes over the wire)</label><pre class="raw" data-req></pre></div>
        <div class="w-field"><label>Response</label><pre class="raw" data-res>Press Send.</pre></div>
      </div>
      <p class="w-note" data-note></p>`;
    const $ = (s) => body.querySelector(s);
    const devices = [{ assetTag: "VU-04417", model: "OptiPlex 7020", status: "Deployed" }];
    const buildReq = () => {
      const m = $("[data-m]").value, p = $("[data-p]").value;
      $("[data-bodywrap]").style.display = m === "POST" ? "" : "none";
      const lines = [`${m} ${p} HTTP/1.1`, "Host: api.bedrock.dev", "User-Agent: Bedrock/1.0", "Accept: application/json"];
      if ($("[data-auth]").checked) lines.push("Authorization: Bearer 7f3e…c91a");
      let bodyTxt = "";
      if (m === "POST") { bodyTxt = $("#http-body").value; lines.push("Content-Type: application/json", `Content-Length: ${new TextEncoder().encode(bodyTxt).length}`); }
      $("[data-req]").innerHTML = `<span class="hl">${esc(lines[0])}</span>\n${esc(lines.slice(1).join("\n"))}\n\n${esc(bodyTxt)}`;
      return { m, p, bodyTxt, auth: $("[data-auth]").checked };
    };
    const reply = (code, text, headers, payload, note) => {
      const h = [`HTTP/1.1 ${code} ${text}`, `Date: ${new Date().toUTCString()}`, ...headers];
      const pl = payload == null ? "" : (typeof payload === "string" ? payload : JSON.stringify(payload, null, 2));
      if (pl) h.push(`Content-Length: ${new TextEncoder().encode(pl).length}`);
      $("[data-res]").innerHTML = `<span class="status-pill s${String(code)[0]}">${code} ${esc(text)}</span>\n${esc(h.slice(1).join("\n"))}\n\n${esc(pl)}`;
      $("[data-note]").textContent = note;
    };
    const send = () => {
      const r = buildReq();
      const J = ["Content-Type: application/json"];
      const tag = r.p.startsWith("/api/devices/") ? r.p.split("/").pop() : null;
      if (r.p === "/api/crash") return reply(500, "Internal Server Error", J, { error: "NullReferenceException" }, "5xx means the server broke. Your request may have been fine.");
      if (r.p === "/old-page") return reply(301, "Moved Permanently", ["Location: /"], null, "3xx is a redirect. Browsers automatically follow the Location header.");
      if (r.p === "/admin") return r.auth
        ? reply(403, "Forbidden", J, { error: "insufficient role" }, "403: the server knows who you are (you sent credentials) but you are not allowed. Compare with 401.")
        : reply(401, "Unauthorized", ["WWW-Authenticate: Bearer"], null, "401: no credentials. Tick the Authorization header and send again.");
      if (r.p === "/") {
        if (r.m !== "GET") return reply(405, "Method Not Allowed", ["Allow: GET"], null, "405: this path exists but does not accept that method.");
        return reply(200, "OK", ["Content-Type: text/html; charset=utf-8"], "<!doctype html><h1>Bedrock API</h1>", "200 OK with an HTML body. A browser would render this.");
      }
      if (r.p === "/api/devices") {
        if (r.m === "GET") return reply(200, "OK", J, devices, "200 with JSON. This is what a C# Minimal API returns from app.MapGet(\"/api/devices\", ...).");
        if (r.m === "POST") {
          let d; try { d = JSON.parse(r.bodyTxt); } catch (e) { return reply(400, "Bad Request", J, { error: "Body is not valid JSON" }, "400: the server could not parse what you sent. Check the quotes and braces."); }
          if (!d.assetTag) return reply(400, "Bad Request", J, { error: "assetTag is required" }, "400: valid JSON but missing a required field.");
          devices.push(d);
          return reply(201, "Created", [...J, `Location: /api/devices/${d.assetTag}`], d, `201 Created. GET /api/devices again and you will see it. (${devices.length} devices now, held in memory.)`);
        }
        return reply(405, "Method Not Allowed", ["Allow: GET, POST"], null, "405: collection supports GET and POST here.");
      }
      if (tag) {
        const i = devices.findIndex((x) => x.assetTag === tag);
        if (i < 0) return reply(404, "Not Found", J, { error: `No device ${tag}` }, "404: the path pattern is valid but that record does not exist.");
        if (r.m === "DELETE") { devices.splice(i, 1); return reply(204, "No Content", [], null, "204: deleted, nothing to send back."); }
        if (r.m === "GET") return reply(200, "OK", J, devices[i], "200: a single resource.");
        return reply(405, "Method Not Allowed", ["Allow: GET, DELETE"], null, "405.");
      }
      reply(404, "Not Found", [], null, "404.");
    };
    ["[data-m]", "[data-p]", "[data-auth]"].forEach((s) => $(s).onchange = buildReq);
    $("#http-body").oninput = buildReq;
    $('[data-act="send"]').onclick = send;
    buildReq();
  };

  /* ---------------- 10. C# tracer ---------------- */
  const TRACES = {
    loop: {
      title: "Trace a for loop",
      code: [
        "int total = 0;",
        "for (int i = 1; i <= 3; i++)",
        "{",
        "    total = total + i;",
        "}",
        'Console.WriteLine($"Total: {total}");',
      ],
      steps: [
        [0, { total: 0 }, "", "Reserve 32 bits for total and store 0."],
        [1, { total: 0, i: 1 }, "", "Loop starts: i = 1. Check i <= 3: true."],
        [3, { total: 1, i: 1 }, "", "total = 0 + 1."],
        [1, { total: 1, i: 2 }, "", "i++ makes i 2. Check 2 <= 3: true. Under the hood: an ADD and a conditional jump, exactly like the CPU simulator."],
        [3, { total: 3, i: 2 }, "", "total = 1 + 2."],
        [1, { total: 3, i: 3 }, "", "i = 3. 3 <= 3: true."],
        [3, { total: 6, i: 3 }, "", "total = 3 + 3."],
        [1, { total: 6, i: 4 }, "", "i = 4. 4 <= 3: false. Jump past the loop body. i goes out of scope."],
        [5, { total: 6 }, "Total: 6", "String interpolation builds the text, then it is written to the console."],
      ],
    },
    method: {
      title: "Trace a method call",
      code: [
        "static int Square(int n)",
        "{",
        "    int result = n * n;",
        "    return result;",
        "}",
        "",
        "int side = 7;",
        "int area = Square(side);",
        "Console.WriteLine(area);",
      ],
      steps: [
        [6, { side: 7 }, "", "Program starts at the top-level statements."],
        [7, { side: 7 }, "", "Call Square. The CPU saves where to come back to and pushes a new stack frame."],
        [0, { "side (caller)": 7, n: 7 }, "", "In the new frame, parameter n gets a COPY of side's value."],
        [2, { "side (caller)": 7, n: 7, result: 49 }, "", "n * n = 49, stored in a local variable that only exists inside this frame."],
        [3, { "side (caller)": 7, n: 7, result: 49 }, "", "return hands 49 back. This frame is popped off the stack; n and result disappear."],
        [7, { side: 7, area: 49 }, "", "Back in the caller: area = 49."],
        [8, { side: 7, area: 49 }, "49", "Print it."],
      ],
    },
  };
  W.trace = (el, opts) => {
    const d = TRACES[opts.id];
    const body = frame(el, d.title, "step through");
    let n = 0; let prev = {};
    body.innerHTML = `
      <div class="trace">
        <div class="trace-code" data-code></div>
        <div><table class="vars" data-vars></table><div class="console" data-con></div></div>
      </div>
      <div class="w-row" style="margin-top:12px"><button class="btn small" data-act="back">Back</button><button class="btn small primary" data-act="next">Step</button><span class="status-line" data-c></span></div>
      <p class="w-note" data-note></p>`;
    const render = () => {
      const [line, vars, out, note] = d.steps[n];
      body.querySelector("[data-code]").innerHTML = d.code.map((c, i) => `<div class="${i === line ? "cur" : ""}">${Highlight.html(c || " ", "csharp")}</div>`).join("");
      body.querySelector("[data-vars]").innerHTML = `<tr><td>variable</td><td>value</td></tr>` +
        Object.entries(vars).map(([k, v]) => `<tr class="${prev[k] !== v ? "chg" : ""}"><td>${esc(k)}</td><td>${esc(v)}</td></tr>`).join("");
      const con = d.steps.slice(0, n + 1).map((s) => s[2]).filter(Boolean).join("\n");
      body.querySelector("[data-con]").textContent = con || "console output appears here";
      body.querySelector("[data-note]").textContent = note;
      body.querySelector("[data-c]").textContent = `${n + 1} / ${d.steps.length}`;
      body.querySelector('[data-act="back"]').disabled = n === 0;
      body.querySelector('[data-act="next"]').disabled = n === d.steps.length - 1;
    };
    body.querySelector('[data-act="next"]').onclick = () => { prev = d.steps[n][1]; n++; render(); };
    body.querySelector('[data-act="back"]').onclick = () => { n--; prev = n > 0 ? d.steps[n - 1][1] : {}; render(); };
    render();
  };

  /* ---------------- 11. Checklist (persists) ---------------- */
  W.checklist = (el, opts) => {
    const body = frame(el, opts.title || "Checklist", "saved as you go");
    const key = "bedrock.check." + opts.id;
    let state = {};
    try { state = JSON.parse(localStorage.getItem(key) || "{}"); } catch (e) {}
    body.innerHTML = `<ul class="checklist">${opts.items.map((t, i) => `<li><label><input type="checkbox" data-i="${i}" ${state[i] ? "checked" : ""}><span>${t}</span></label></li>`).join("")}</ul><p class="w-note" data-note></p>`;
    const upd = () => {
      const done = Object.values(state).filter(Boolean).length;
      body.querySelector("[data-note]").textContent = `${done} of ${opts.items.length} done.` + (done === opts.items.length ? " You built and shipped a real API." : "");
    };
    body.querySelectorAll("input").forEach((c) => c.onchange = () => {
      state[c.dataset.i] = c.checked;
      try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) {}
      upd();
    });
    upd();
  };

  /* ---------------- 12. Two's complement / overflow ---------------- */
  W.overflow = (el) => {
    const body = frame(el, "Why int.MaxValue + 1 goes negative", "8-bit version");
    let v = 125;
    body.innerHTML = `<p class="w-out" data-o></p><div class="w-row"><button class="btn small" data-act="dec">- 1</button><button class="btn small primary" data-act="inc">+ 1</button></div><p class="w-note" data-note></p>`;
    const render = () => {
      const u = v & 255, s = u > 127 ? u - 256 : u;
      body.querySelector("[data-o]").innerHTML = `bits <b>${bin(u)}</b> &nbsp; as byte (unsigned) <b>${u}</b> &nbsp; as sbyte (signed) <b>${s}</b>`;
      body.querySelector("[data-note]").textContent = u === 128
        ? "Overflow. The bits went from 01111111 to 10000000. Unsigned, that is 128. Signed, the top bit means negative, so it reads -128. C# int does the same thing at 32 bits: 2,147,483,647 + 1 = -2,147,483,648."
        : "In signed types the leftmost bit is the sign bit (two's complement). Keep pressing +1 past 127.";
    };
    body.querySelector('[data-act="inc"]').onclick = () => { v = (v + 1) & 255; render(); };
    body.querySelector('[data-act="dec"]').onclick = () => { v = (v - 1) & 255; render(); };
    render();
  };

  window.Widgets = W;
  window.mountWidgets = (root) => {
    root.querySelectorAll("[data-widget]").forEach((el) => {
      const name = el.dataset.widget;
      let opts = {};
      if (el.dataset.opts) { try { opts = JSON.parse(el.dataset.opts); } catch (e) {} }
      if (W[name]) {
        try { W[name](el, opts); }
        catch (e) { el.innerHTML = `<p class="w-error">This widget failed to load: ${esc(e.message)}</p>`; console.error(e); }
      }
    });
  };
})();
