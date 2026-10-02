/* Tiny syntax highlighter — tokenizes raw text, escapes every token. */
(function () {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const CS_KW = new Set(("abstract as async await base bool break byte case catch char checked class const continue decimal default delegate do double else enum event explicit false finally float for foreach get goto if implicit in init int interface internal is lock long namespace new null object operator out override params private protected public readonly record ref return sbyte sealed set short sizeof static string struct switch this throw true try typeof uint ulong unchecked using var virtual void volatile when where while with yield").split(" "));
  const ASM_OPS = new Set(["LDA","ADD","SUB","STA","LDI","JMP","JZ","OUT","HLT","NOP","DB","MOV","PUSH","POP","CALL","RET","CMP","JNE","JE","INC","DEC"]);

  function tokenize(src, rules) {
    let out = "";
    let i = 0;
    outer: while (i < src.length) {
      for (const [re, cls] of rules) {
        re.lastIndex = i;
        const m = re.exec(src);
        if (m && m.index === i && m[0].length) {
          const t = m[0];
          const c = typeof cls === "function" ? cls(t) : cls;
          out += c ? `<span class="${c}">${esc(t)}</span>` : esc(t);
          i += t.length;
          continue outer;
        }
      }
      out += esc(src[i]);
      i++;
    }
    return out;
  }

  const csharp = [
    [/\/\/[^\n]*/y, "tk-com"],
    [/\$?@?"(?:[^"\\\n]|\\.)*"/y, "tk-str"],
    [/'(?:[^'\\]|\\.)'/y, "tk-str"],
    [/\b\d+(\.\d+)?[fFdDmMuUlL]?\b|\b0x[0-9a-fA-F]+\b/y, "tk-num"],
    [/[A-Za-z_][A-Za-z0-9_]*/y, (t) => CS_KW.has(t) ? "tk-kw" : (/^[A-Z]/.test(t) ? "tk-ty" : "")],
  ];
  const bash = [
    [/#[^\n]*/y, "tk-com"],
    [/"(?:[^"\\]|\\.)*"|'[^']*'/y, "tk-str"],
    [/^\$ |(?<=\n)\$ /y, "tk-com"],
    [/\b(dotnet|curl|git|gh|vercel|sudo|pacman|brew|winget|cd|python3?|npx|ssh|ping|nslookup|dig)\b/y, "tk-kw"],
    [/\s--?[a-zA-Z][\w-]*/y, "tk-ty"],
  ];
  const asm = [
    [/;[^\n]*/y, "tk-com"],
    [/[A-Za-z_][A-Za-z0-9_]*:/y, "tk-ty"],
    [/\b(0x[0-9a-fA-F]+|\d+)\b/y, "tk-num"],
    [/[A-Za-z_][A-Za-z0-9_]*/y, (t) => ASM_OPS.has(t.toUpperCase()) ? "tk-kw" : ""],
  ];
  const http = [
    [/^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\b/my, "tk-kw"],
    [/HTTP\/[\d.]+/y, "tk-ty"],
    [/(?<=HTTP\/[\d.]+ )\d{3}/y, "tk-num"],
    [/^[A-Za-z-]+(?=:)/my, "tk-ty"],
    [/"(?:[^"\\]|\\.)*"/y, "tk-str"],
  ];
  const LANGS = { csharp, cs: csharp, bash, sh: bash, asm, http, text: [] };

  window.Highlight = {
    esc,
    html(src, lang) {
      const rules = LANGS[lang] || [];
      return rules.length ? tokenize(src, rules) : esc(src);
    },
  };
})();
