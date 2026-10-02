# Bedrock

An interactive course on how computers actually work, from a single bit to a working C# web API.

**Modules**
1. Bits & Logic: binary, hex, logic gates, a ripple-carry adder, text encoding
2. The CPU & Machine Language: a working 8-bit CPU simulator with an assembler, the stack and heap, how C# becomes machine code
3. C# Fundamentals: types, control flow, methods, collections, classes, exceptions, async
4. Networks & Web Protocols: layers, IP/DNS, TCP/UDP, HTTP, TLS, HttpClient and Minimal APIs
5. Build: a Device Tracker REST API, then trace one request through every layer

Every lesson has interactive widgets, key points, and check questions. Progress saves in your browser.

## Run locally

No build step. Open `index.html`, or:

```bash
python3 -m http.server 8080
```

## Deploy

Static site. Push to GitHub and import into Vercel (framework: Other, no build command), or enable GitHub Pages on `main` / root. See `CLAUDE.md` for exact commands.
