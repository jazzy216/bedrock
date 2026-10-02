/* Course content. Each lesson: id, title, summary, minutes, body (HTML), keypoints, quiz. */
(function () {
  const H = window.Highlight;
  const dedent = (s) => {
    const lines = s.replace(/^\n/, "").replace(/\s+$/, "").split("\n");
    const ind = Math.min(...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)[0].length));
    return lines.map((l) => l.slice(ind)).join("\n");
  };
  const code = (src, lang = "csharp") => `<pre class="code"><span class="lang">${lang}</span><code>${H.html(dedent(src), lang)}</code></pre>`;
  const attr = (s) => s.replace(/&/g, "&amp;").replace(/'/g, "&#39;").replace(/</g, "&lt;");
  const widget = (name, opts) => `<div data-widget="${name}"${opts ? ` data-opts='${attr(JSON.stringify(opts))}'` : ""}></div>`;
  const note = (title, html, kind = "") => `<div class="callout ${kind}"><strong>${title}</strong>${html}</div>`;

  const MODULES = [
    /* ===================================================== */
    {
      id: "m1", num: "01", title: "Bits & Logic",
      blurb: "Everything a computer does is on/off switches. Learn how switches become numbers, text, and arithmetic.",
      lessons: [
        {
          id: "1-1", title: "Bits: the only thing a computer has", minutes: 10,
          summary: "A bit is one switch. Eight of them make a byte. Every number, letter, photo and program is a pattern of bits.",
          body: `
<h2>Why on and off?</h2>
<p>Inside a chip are billions of <strong>transistors</strong>: tiny electrically controlled switches. A transistor is either letting current through or it isn't. Engineers could try to measure ten different voltage levels, but noise makes that unreliable. Two levels, high and low, are easy to tell apart even when the signal is messy. So we call high <code>1</code> and low <code>0</code>, and build everything from that.</p>
<p>One of those 0-or-1 values is a <strong>bit</strong> (binary digit). Alone, a bit can answer one yes/no question. Group them and the number of patterns doubles with every bit you add: 2 bits give 4 patterns, 3 bits give 8, and 8 bits give 256.</p>

<h2>Place value, but in base 2</h2>
<p>You already use place value. In decimal, <code>347</code> means 3 hundreds + 4 tens + 7 ones. Each place is worth 10 times the one to its right.</p>
<p>Binary is the same idea with 2 instead of 10. Reading right to left, the places are worth 1, 2, 4, 8, 16, 32, 64, 128. So <code>00000101</code> is 4 + 1 = <strong>5</strong>.</p>
${widget("bits")}
<p>Try making 2 and 3, the numbers from our earlier conversation. 2 is <code>00000010</code>, 3 is <code>00000011</code>. Then try 255: every bit on. That's the largest value one byte can hold, which is why so many limits in computing are 255 or 256.</p>

<h2>Bytes and bigger</h2>
<table>
<tr><th>Unit</th><th>Size</th><th>Patterns</th><th>Where you've seen it</th></tr>
<tr><td>bit</td><td class="mono">1</td><td class="mono">2</td><td>a flag: on/off, true/false</td></tr>
<tr><td>byte</td><td class="mono">8 bits</td><td class="mono">256</td><td>one character of English text; one octet of an IPv4 address</td></tr>
<tr><td>32-bit word</td><td class="mono">4 bytes</td><td class="mono">~4.29 billion</td><td>a C# <code>int</code>; a whole IPv4 address</td></tr>
<tr><td>64-bit word</td><td class="mono">8 bytes</td><td class="mono">~1.8 × 10<sup>19</sup></td><td>a C# <code>long</code>; the "64-bit" in your CPU</td></tr>
</table>
${note("Field connection", "An IPv4 address like <code>192.168.1.37</code> is just 32 bits split into four bytes. That's why each part tops out at 255. A subnet mask like <code>255.255.255.0</code> is 24 one-bits followed by 8 zero-bits, written as <code>/24</code>.")}

<h2>Shifting</h2>
<p>Press <em>Shift left</em> in the widget. Every bit moves one place left, so every bit is worth double, so the whole number doubles. Shifting right halves it. CPUs use this trick constantly because a shift is far cheaper than a general multiply.</p>`,
          keypoints: [
            "A bit is one on/off value. Hardware uses two states because two states survive electrical noise.",
            "Binary place values double right to left: 1, 2, 4, 8, 16, 32, 64, 128.",
            "8 bits = 1 byte = 256 possible values (0 to 255).",
            "n bits give 2ⁿ patterns. Adding one bit doubles the range.",
          ],
          quiz: [
            { q: "What is <span class='mono'>00001010</span> in decimal?", o: ["8", "10", "12", "1010"], a: 1, why: "Places worth 8 and 2 are on: 8 + 2 = 10." },
            { q: "Why does each part of an IPv4 address max out at 255?", o: ["It's a rule from the 1970s with no technical reason", "Each part is one byte, and a byte has 256 values: 0 to 255", "Routers can't count higher", "255 is a prime number"], a: 1, why: "Four bytes, each 0 to 255, make the 32-bit address." },
            { q: "If you shift <span class='mono'>00000110</span> (6) left by one, you get:", o: ["3", "7", "12", "60"], a: 2, why: "Shifting left doubles: 00001100 = 12." },
          ],
        },
        {
          id: "1-2", title: "Hex: binary's shorthand", minutes: 8,
          summary: "Long binary strings are hard to read. Hexadecimal packs every 4 bits into one character, so a byte is always exactly two hex digits.",
          body: `
<h2>The problem with binary</h2>
<p>Quick: is <code>1101011010011110</code> the same as <code>1101011001011110</code>? Hard to tell. Humans lose their place in long runs of 1s and 0s. Decimal is easier to read but doesn't line up with the bits at all.</p>
<p><strong>Hexadecimal</strong> (base 16) fixes this. It uses 16 symbols: <code>0-9</code> then <code>A-F</code> for 10 through 15. Four bits have exactly 16 patterns, so <strong>one hex digit = four bits</strong>, always.</p>
<table>
<tr><th>Binary</th><th>Hex</th><th>Decimal</th><th>Binary</th><th>Hex</th><th>Decimal</th></tr>
<tr><td class="mono">0000</td><td class="mono">0</td><td>0</td><td class="mono">1000</td><td class="mono">8</td><td>8</td></tr>
<tr><td class="mono">0001</td><td class="mono">1</td><td>1</td><td class="mono">1001</td><td class="mono">9</td><td>9</td></tr>
<tr><td class="mono">0010</td><td class="mono">2</td><td>2</td><td class="mono">1010</td><td class="mono">A</td><td>10</td></tr>
<tr><td class="mono">0011</td><td class="mono">3</td><td>3</td><td class="mono">1011</td><td class="mono">B</td><td>11</td></tr>
<tr><td class="mono">0100</td><td class="mono">4</td><td>4</td><td class="mono">1100</td><td class="mono">C</td><td>12</td></tr>
<tr><td class="mono">0101</td><td class="mono">5</td><td>5</td><td class="mono">1101</td><td class="mono">D</td><td>13</td></tr>
<tr><td class="mono">0110</td><td class="mono">6</td><td>6</td><td class="mono">1110</td><td class="mono">E</td><td>14</td></tr>
<tr><td class="mono">0111</td><td class="mono">7</td><td>7</td><td class="mono">1111</td><td class="mono">F</td><td>15</td></tr>
</table>
<p>To convert binary to hex, chop it into groups of four from the right and look each group up: <code>1101 0110 1001 1110</code> → <code>D69E</code>. No arithmetic needed.</p>
${widget("convert")}

<h2>Where you'll see hex</h2>
<ul>
<li><strong>MAC addresses:</strong> <code>a4:83:e7:2c:91:0f</code> is six bytes, two hex digits each.</li>
<li><strong>Colors:</strong> <code>#5CCF8A</code> is three bytes: red 5C, green CF, blue 8A. That's this site's accent green.</li>
<li><strong>Memory addresses and crash dumps:</strong> <code>0x7FFE3A10</code>. The <code>0x</code> prefix means "this is hex."</li>
<li><strong>IPv6:</strong> <code>2001:db8::1</code> is 128 bits written in hex groups.</li>
<li><strong>File hashes:</strong> a SHA-256 hash is 32 bytes, shown as 64 hex characters.</li>
</ul>
${note("Remember", "Hex isn't a different kind of data. It's a different way of <em>writing</em> the same bits. The computer only ever stores the bits.")}`,
          keypoints: [
            "Hex is base 16: digits 0-9 and A-F.",
            "One hex digit = exactly 4 bits, so one byte = exactly 2 hex digits.",
            "Convert binary to hex by grouping into fours from the right.",
            "0x means hex. You'll see it in MACs, colors, memory addresses and hashes.",
          ],
          quiz: [
            { q: "What is <span class='mono'>0xFF</span> in decimal?", o: ["15", "16", "255", "256"], a: 2, why: "FF = 1111 1111 = every bit of a byte on = 255." },
            { q: "How many bytes is the MAC address <span class='mono'>60:38:e0:11:aa:42</span>?", o: ["6", "12", "17", "48"], a: 0, why: "Six pairs of hex digits, each pair one byte. (That's 48 bits.)" },
            { q: "Binary <span class='mono'>1010 0011</span> in hex is:", o: ["0xA3", "0x3A", "0x103", "0xAB"], a: 0, why: "1010 = A, 0011 = 3." },
          ],
        },
        {
          id: "1-3", title: "Logic gates", minutes: 12,
          summary: "Wire transistors together the right way and you get gates: circuits that take bits in and produce a bit out according to a fixed rule.",
          body: `
<h2>From switches to decisions</h2>
<p>Put two switches in a line (series) and current only flows if <em>both</em> are closed. That's an <strong>AND</strong> gate. Put them side by side (parallel) and current flows if <em>either</em> is closed. That's <strong>OR</strong>. Build these from transistors instead of light switches and you can make one circuit control another, at billions of times per second.</p>
<p>Each gate is fully described by a <strong>truth table</strong>: every possible input combination and the output it produces. There's no judgment involved. The gate doesn't "know" anything; the wiring just happens to produce the rule.</p>
${widget("gates")}

<h2>The ones that matter</h2>
<table>
<tr><th>Gate</th><th>Rule</th><th>Why it matters</th></tr>
<tr><td class="mono">AND</td><td>1 if both are 1</td><td>Carry bit in addition. Masking bits (subnet math).</td></tr>
<tr><td class="mono">OR</td><td>1 if either is 1</td><td>Combining flags or permissions.</td></tr>
<tr><td class="mono">XOR</td><td>1 if they differ</td><td>Sum bit in addition. Encryption. Parity checks.</td></tr>
<tr><td class="mono">NOT</td><td>flip it</td><td>Inverting any signal.</td></tr>
<tr><td class="mono">NAND</td><td>NOT of AND</td><td>Universal: you can build every other gate from NANDs alone.</td></tr>
</table>
${note("Field connection", "Subnetting is AND. Your IP <code>192.168.1.37</code> ANDed with mask <code>255.255.255.0</code> keeps the first three bytes and zeros the last, giving the network address <code>192.168.1.0</code>. Your device does this bitwise AND to decide whether a destination is local or must go to the router.")}
${note("Security connection", "XOR has a magic property: <code>(A XOR K) XOR K = A</code>. XOR data with a key to scramble it, XOR again with the same key to get it back. Real ciphers like AES use XOR as one of their core steps.")}

<h2>Gates in C#</h2>
<p>You can use these operations directly on numbers in C#. They operate on every bit position at once:</p>
${code(`
int a = 0b1100;          // 12
int b = 0b1010;          // 10
Console.WriteLine(a & b); // AND -> 0b1000 = 8
Console.WriteLine(a | b); // OR  -> 0b1110 = 14
Console.WriteLine(a ^ b); // XOR -> 0b0110 = 6
Console.WriteLine(~a);    // NOT -> flips all 32 bits = -13
`)}`,
          keypoints: [
            "A gate is a small circuit with a fixed rule mapping input bits to an output bit.",
            "AND = both, OR = either, XOR = differ, NOT = flip.",
            "NAND alone can build any digital circuit, including a whole CPU.",
            "Subnet masking is a bitwise AND. XOR is the basis of a lot of cryptography.",
          ],
          quiz: [
            { q: "Which gate outputs 1 only when its two inputs are different?", o: ["AND", "OR", "XOR", "NAND"], a: 2, why: "XOR = exclusive OR: one or the other, not both." },
            { q: "An AND gate gets A=1, B=0. Output?", o: ["0", "1", "It depends on the previous output", "Undefined"], a: 0, why: "AND needs both inputs to be 1." },
            { q: "Your device is <span class='mono'>10.0.5.20</span> with mask <span class='mono'>255.255.0.0</span>. What does the AND give as the network address?", o: ["10.0.5.0", "10.0.0.0", "10.0.5.20", "0.0.5.20"], a: 1, why: "255 keeps a byte, 0 clears it. 10.0 kept, 5.20 cleared." },
          ],
        },
        {
          id: "1-4", title: "Building an adder", minutes: 12,
          summary: "Combine XOR and AND and you can add one column. Chain columns and you can add any numbers. This is the ALU's first job.",
          body: `
<h2>Adding one column</h2>
<p>Binary addition has only four cases for a single column:</p>
<table>
<tr><th>A</th><th>B</th><th>A + B</th><th>sum bit</th><th>carry</th></tr>
<tr><td>0</td><td>0</td><td class="mono">0</td><td>0</td><td>0</td></tr>
<tr><td>0</td><td>1</td><td class="mono">1</td><td>1</td><td>0</td></tr>
<tr><td>1</td><td>0</td><td class="mono">1</td><td>1</td><td>0</td></tr>
<tr><td>1</td><td>1</td><td class="mono">10</td><td>0</td><td>1</td></tr>
</table>
<p>Look at the sum column: it's 1 when the inputs differ. That's <strong>XOR</strong>. Look at the carry column: it's 1 only when both are 1. That's <strong>AND</strong>. One XOR plus one AND is called a <strong>half adder</strong>.</p>

<h2>Handling a carry coming in</h2>
<p>Every column except the rightmost also has to add the carry from the column to its right. A <strong>full adder</strong> takes three inputs (A, B, carry-in) and is built from two half adders and an OR gate:</p>
${code(`
sum       = A XOR B XOR carryIn
carryOut  = (A AND B) OR (carryIn AND (A XOR B))
`, "text")}
<p>Line up four full adders, wire each carry-out into the next column's carry-in, and you have a 4-bit adder. The carry "ripples" from right to left, just like when you carry the 1 on paper.</p>
${widget("adder")}
<p>The widget starts at <strong>2 + 3</strong>. Trace it: rightmost column is 0 + 1 = 1, no carry. Next column 1 + 1 = 10, so sum 0, carry 1. Third column 0 + 0 + carry 1 = 1. Result <code>0101</code> = 5.</p>
<p>Now set A and B both to 15 (<code>1111</code>). The answer, 30, needs 5 bits. A real 4-bit register only has 4, so the top carry falls off. That's <strong>overflow</strong>, and it's the exact same thing that happens to a C# <code>int</code> when it passes about 2.1 billion.</p>

<h2>What else lives in the ALU</h2>
<p>The <strong>Arithmetic Logic Unit</strong> is the part of the CPU that does math and logic. It's built from adders and gates like these:</p>
<ul>
<li><strong>Subtraction</strong> is adding a negative. Negatives are stored in <em>two's complement</em> (flip all bits, add 1), which lets the same adder circuit subtract.</li>
<li><strong>Comparison</strong> (is A less than B?) is a subtraction where you only keep the flags: was the result zero, was it negative.</li>
<li><strong>Multiplication</strong> is repeated shifting and adding.</li>
</ul>
${note("The big idea", "There is no point where the computer \"understands\" math. Electricity flows through gates arranged so that the output pattern matches what we'd get doing arithmetic by hand. Understanding is in the design, not the machine.")}`,
          keypoints: [
            "Half adder: sum = XOR, carry = AND.",
            "Full adder adds a carry-in too. Chain them for multi-bit numbers.",
            "Overflow happens when the result needs more bits than the register has.",
            "The ALU builds subtraction, comparison and multiplication out of adders and gates.",
          ],
          quiz: [
            { q: "In a half adder, which gate produces the carry bit?", o: ["XOR", "AND", "OR", "NOT"], a: 1, why: "Carry is only 1 when both bits are 1, which is AND." },
            { q: "A 4-bit adder computes 9 + 8. What's left in the 4-bit result?", o: ["17", "1", "0", "15"], a: 1, why: "17 = 10001. The top bit overflows away, leaving 0001 = 1." },
            { q: "How does a CPU typically compare two numbers?", o: ["A separate comparison chip with its own memory", "Subtract them and check the result's flags (zero? negative?)", "Convert both to text and compare characters", "It asks the operating system"], a: 1, why: "Compare = subtract and look at flags, then a conditional jump uses those flags." },
          ],
        },
        {
          id: "1-5", title: "Text, images and everything else", minutes: 8,
          summary: "Bits have no meaning on their own. Text, colors and instructions are agreements about what a pattern means.",
          body: `
<h2>Encoding is an agreement</h2>
<p>The byte <code>01000001</code> is 65. It's also the letter <code>A</code>. It could be a shade of gray in a photo, or part of a machine instruction. The bits don't know. Meaning comes from an <strong>encoding</strong>: an agreement between whoever writes the data and whoever reads it.</p>

<h2>Text: ASCII and UTF-8</h2>
<p><strong>ASCII</strong> (1960s) assigned numbers 0 to 127 to English letters, digits, punctuation and control codes. <code>A</code> = 65, <code>a</code> = 97, <code>0</code> = 48, space = 32, newline = 10.</p>
<p>That left out most of the world's writing. <strong>Unicode</strong> gives every character in every script a number called a <em>code point</em> (there are over 150,000 assigned). <strong>UTF-8</strong> is the most common way to store those code points as bytes. Its clever design: anything in the ASCII range is stored as the same single byte, and everything else takes 2 to 4 bytes.</p>
${widget("textbytes")}
<p>Try typing an emoji or a word in another script. Watch the byte count climb. This is why "string length" is a slippery idea: characters, code points and bytes can all be different numbers.</p>
${note("Field connection", "Ever seen <code>cafÃ©</code> instead of <code>café</code>? That's UTF-8 bytes being read as if they were an older single-byte encoding. The bytes were fine; the agreement wasn't.")}

<h2>Everything else</h2>
<ul>
<li><strong>Images:</strong> a grid of pixels, each usually 3 bytes (red, green, blue, 0-255 each). A 1920×1080 screen is about 6.2 million bytes per frame before compression.</li>
<li><strong>Sound:</strong> the speaker position sampled tens of thousands of times per second, each sample a number.</li>
<li><strong>Files:</strong> just a sequence of bytes. The first few bytes often identify the format. PDFs start with <code>%PDF</code>, PNGs with <code>0x89 50 4E 47</code>. Forensic tools use these "magic numbers" to identify files with fake extensions.</li>
<li><strong>Programs:</strong> also bytes. The next module is about how the CPU reads bytes as instructions.</li>
</ul>`,
          keypoints: [
            "Bits mean nothing until an encoding says what they represent.",
            "ASCII covers 128 English characters. UTF-8 extends it to all of Unicode using 1-4 bytes per character.",
            "Garbled text usually means data was decoded with the wrong encoding.",
            "Files start with magic bytes that identify their real type regardless of extension.",
          ],
          quiz: [
            { q: "In UTF-8, how many bytes does the letter <span class='mono'>A</span> take?", o: ["1", "2", "4", "It depends on the font"], a: 0, why: "ASCII-range characters are a single byte in UTF-8." },
            { q: "A file named invoice.pdf starts with the bytes <span class='mono'>4D 5A</span> (\"MZ\", the Windows executable header). What should you conclude?", o: ["It's a PDF", "The extension lies: it's actually a Windows executable", "The file is corrupted beyond use", "PDFs always start with MZ"], a: 1, why: "Magic bytes reveal the real format. A disguised .exe is a classic phishing trick." },
          ],
        },
      ],
    },

    /* ===================================================== */
    {
      id: "m2", num: "02", title: "The CPU & Machine Language",
      blurb: "Run a working CPU in your browser. See exactly how bytes in memory become instructions that execute.",
      lessons: [
        {
          id: "2-1", title: "Inside the CPU", minutes: 10,
          summary: "A CPU is a few registers, an ALU, a control unit and a clock, hooked up to memory. That's it.",
          body: `
<h2>The parts</h2>
<table>
<tr><th>Part</th><th>Job</th><th>Analogy</th></tr>
<tr><td><strong>Registers</strong></td><td>A handful of tiny, extremely fast storage slots inside the CPU.</td><td>What's in your hands right now.</td></tr>
<tr><td><strong>ALU</strong></td><td>Does math and logic on register values.</td><td>The calculator.</td></tr>
<tr><td><strong>Control unit</strong></td><td>Reads instructions and routes signals to make them happen.</td><td>The foreman reading the work order.</td></tr>
<tr><td><strong>Clock</strong></td><td>A steady pulse. Each tick advances the work one step.</td><td>The metronome. 4 GHz = 4 billion ticks per second.</td></tr>
<tr><td><strong>Memory (RAM)</strong></td><td>Outside the CPU. Holds both the program and its data, each byte at a numbered address.</td><td>The warehouse shelves, each with a bin number.</td></tr>
</table>

<h2>Special registers</h2>
<ul>
<li><strong>Program Counter (PC)</strong>, called the Instruction Pointer (<code>RIP</code>) on x86-64: holds the address of the next instruction to run.</li>
<li><strong>Instruction Register (IR):</strong> holds the instruction currently being worked on.</li>
<li><strong>Accumulator / general registers:</strong> hold the values being calculated. Simple CPUs have one accumulator (ACC). x86-64 has 16 general registers like <code>RAX</code>, <code>RBX</code>, <code>RSP</code>.</li>
<li><strong>Flags:</strong> single bits set by the ALU, such as "the last result was zero" or "the last result overflowed." Conditional jumps read these.</li>
</ul>

<h2>The stored-program idea</h2>
<p>Early computers were "programmed" by rewiring them. The breakthrough (1940s, often credited to von Neumann's design) was to store the <em>program itself</em> in memory as numbers, right next to the data. Change the bytes in memory and you change what the machine does. No rewiring.</p>
${note("Security connection", "Because code and data live in the same memory, an attacker who can write data into the right place can sometimes get the CPU to execute it. That's the root of buffer-overflow exploits, and why modern systems mark memory pages as either writable or executable, never both (DEP/NX).", "warn")}

<h2>Speed: the memory hierarchy</h2>
<p>Registers take about one clock tick. Main RAM takes on the order of a hundred. So CPUs keep recently used memory in <strong>caches</strong> (L1, L2, L3) that sit between them. Much of what makes code fast or slow in practice is whether its data is already in cache.</p>`,
          keypoints: [
            "Registers hold working values; the ALU computes; the control unit orchestrates; the clock paces it.",
            "The Program Counter always points at the next instruction.",
            "Programs are stored in memory as bytes, alongside data (stored-program design).",
            "Registers are fastest, then caches, then RAM, then disk.",
          ],
          quiz: [
            { q: "What does the Program Counter hold?", o: ["The number of programs running", "The address of the next instruction to execute", "The result of the last calculation", "The clock speed"], a: 1, why: "PC = where to fetch from next." },
            { q: "Why is \"code and data share the same memory\" a security concern?", o: ["It makes RAM more expensive", "If an attacker can write data where the CPU will fetch instructions, that data can run as code", "It doesn't matter for security", "It slows down encryption"], a: 1, why: "This is the core of code-injection attacks and the reason for NX/DEP protections." },
          ],
        },
        {
          id: "2-2", title: "Fetch, decode, execute", minutes: 15,
          summary: "The CPU does one thing forever: grab the next instruction, figure out what it is, do it. Run a real one below.",
          body: `
<h2>The cycle</h2>
<ol>
<li><strong>Fetch:</strong> read the byte at memory[PC] into the Instruction Register. Add 1 to PC.</li>
<li><strong>Decode:</strong> split the instruction's bits into fields. Which operation? Which address or register?</li>
<li><strong>Execute:</strong> route values through the ALU, read or write memory, or change PC (a jump).</li>
</ol>
<p>Then repeat. Billions of times per second. Every app you've ever used is this loop.</p>

<h2>Meet BEDROCK-4</h2>
<p>Below is a complete, working 8-bit computer. It's deliberately tiny so you can see every bit: 16 bytes of memory, one accumulator, a program counter, and 10 instructions. Each instruction is one byte: the <strong>top 4 bits are the opcode</strong> (which operation) and the <strong>bottom 4 bits are the operand</strong> (usually a memory address 0-15).</p>
<table>
<tr><th>Opcode</th><th>Bits</th><th>Meaning</th></tr>
<tr><td class="mono">LDA a</td><td class="mono">0001</td><td>ACC = memory[a]</td></tr>
<tr><td class="mono">ADD a</td><td class="mono">0010</td><td>ACC = ACC + memory[a]</td></tr>
<tr><td class="mono">SUB a</td><td class="mono">0011</td><td>ACC = ACC − memory[a]</td></tr>
<tr><td class="mono">STA a</td><td class="mono">0100</td><td>memory[a] = ACC</td></tr>
<tr><td class="mono">LDI n</td><td class="mono">0101</td><td>ACC = n (the value is in the instruction)</td></tr>
<tr><td class="mono">JMP a</td><td class="mono">0110</td><td>PC = a (go to)</td></tr>
<tr><td class="mono">JZ a</td><td class="mono">0111</td><td>if ACC == 0 then PC = a</td></tr>
<tr><td class="mono">OUT</td><td class="mono">1110</td><td>show ACC on the output port</td></tr>
<tr><td class="mono">HLT</td><td class="mono">1111</td><td>stop</td></tr>
</table>
${widget("cpu")}
<p>Start with <strong>Add 2 + 3</strong> and press Step slowly. Watch the first instruction, <code>LDA x</code>. It's stored as <code>00010100</code>: opcode <code>0001</code> (LDA), operand <code>0100</code> (address 4, where <code>x</code> lives). Notice the amber cell lights up when memory is touched.</p>
<p>Then load <strong>Count down</strong>. There's no "loop" instruction. A loop is just <code>JMP</code> sending PC backward. There's no "if" either: <code>JZ</code> conditionally changes PC. <strong>Every loop and every if-statement you'll ever write in C# compiles down to jumps like these.</strong></p>
<p>Finally try <strong>Multiply 3 x 4</strong>. This CPU has no multiply instruction, so the program adds 3 to itself 4 times. It fills all 16 bytes of memory exactly.</p>
${note("Try it", "Edit the source. Change <code>DB 2</code> to <code>DB 200</code> and <code>DB 3</code> to <code>DB 100</code>, assemble, and run. 300 doesn't fit in 8 bits. What comes out?")}`,
          keypoints: [
            "The CPU loops forever: fetch (memory[PC] → IR, PC+1), decode (split the bits), execute.",
            "An instruction is just a byte. Some bits pick the operation, others pick the operand.",
            "Loops are backward jumps. If-statements are conditional jumps based on flags.",
            "Anything not built into the hardware (like multiply here) is built from simpler instructions.",
          ],
          quiz: [
            { q: "In BEDROCK-4, what does the byte <span class='mono'>0010 0111</span> do?", o: ["LDA 7", "ADD memory[7] to ACC", "STA 2", "JMP 7"], a: 1, why: "Opcode 0010 = ADD, operand 0111 = address 7." },
            { q: "After FETCH, why does the PC already point to the next instruction?", o: ["It doesn't; it waits until execute finishes", "Fetch increments PC immediately, so a jump during execute simply overwrites it", "The clock resets it", "The program tells it to every time"], a: 1, why: "PC+1 happens at fetch. Jumps replace PC during execute." },
            { q: "How does a C# <span class='mono'>while</span> loop exist at the machine level?", o: ["A special WHILE instruction", "A conditional jump out plus an unconditional jump back to the top", "The OS repeats the code", "It's interpreted, never compiled"], a: 1, why: "Loops are jumps. That's exactly the Count down program." },
          ],
        },
        {
          id: "2-3", title: "Machine code and assembly", minutes: 10,
          summary: "Machine code is the raw bytes. Assembly is the same instructions with human-readable names. An assembler translates one to one.",
          body: `
<h2>Two views of the same thing</h2>
<p>In the simulator you wrote <code>ADD y</code> and the assembler produced the byte <code>00100101</code>. That byte is <strong>machine code</strong>: what the CPU actually reads. <code>ADD y</code> is <strong>assembly language</strong>: a text spelling of the same instruction, with names (mnemonics) for opcodes and labels for addresses.</p>
<p>The key fact: assembly maps <strong>one line to one instruction</strong>. There's no cleverness, no hidden work. That's what makes it "low level."</p>
${code(`
; BEDROCK-4          address  machine code
      LDA x        ;   0      0001 0100
      ADD y        ;   1      0010 0101
      OUT          ;   2      1110 0000
      HLT          ;   3      1111 0000
x:    DB 2         ;   4      0000 0010
y:    DB 3         ;   5      0000 0011
`, "asm")}

<h2>The same idea on a real CPU</h2>
<p>Your laptop's x86-64 CPU works the same way, just with far more instructions, more registers, and variable-length instructions (1 to 15 bytes). Here's real x86-64 assembly for adding two numbers:</p>
${code(`
mov  eax, 2        ; put 2 in register EAX     bytes: B8 02 00 00 00
add  eax, 3        ; EAX = EAX + 3             bytes: 83 C0 03
`, "asm")}
<p>ARM chips (phones, Apple Silicon MacBooks) have a completely different instruction set, so the same program compiles to different bytes. That's why software has to be built separately for "x64" and "ARM64."</p>
${note("Security connection", "Malware analysts read assembly all day. Tools like Ghidra and IDA take a compiled .exe's machine code and turn it back into assembly (disassembly), then try to reconstruct higher-level code (decompilation). Understanding this layer is the foundation of reverse engineering.")}

<h2>Why not write everything in assembly?</h2>
<p>Because it's slow to write, easy to get wrong, and tied to one CPU family. A single line of C# like <code>total += prices[i] * qty;</code> might become a dozen instructions. Higher-level languages let a compiler handle that translation, which is the next lesson.</p>`,
          keypoints: [
            "Machine code = the bytes the CPU executes. Assembly = readable names for those exact instructions.",
            "Assembly is 1:1 with machine instructions. An assembler translates it.",
            "Each CPU family (x86-64, ARM64) has its own instruction set.",
            "Disassemblers turn machine code back into assembly for reverse engineering.",
          ],
          quiz: [
            { q: "What's the relationship between assembly and machine code?", o: ["Assembly is compiled into many machine instructions per line", "Each assembly instruction corresponds to one machine instruction", "Machine code is a newer version of assembly", "They are unrelated"], a: 1, why: "One to one. That's the defining feature of assembly." },
            { q: "Why can't you run an x86-64 .exe natively on an ARM processor?", o: ["Different file system", "The bytes encode instructions for a different instruction set", "ARM doesn't support executables", "Licensing"], a: 1, why: "Different ISA = different meaning for the same bytes. (Translation layers like Rosetta convert them.)" },
          ],
        },
        {
          id: "2-4", title: "Memory, the stack and the heap", minutes: 12,
          summary: "Programs organize memory into regions. The stack handles function calls; the heap holds objects that live longer.",
          body: `
<h2>Addresses and pointers</h2>
<p>Memory is one huge array of bytes. Each byte has an address. On a 64-bit system an address is a 64-bit number, usually written in hex like <code>0x00007FFE3A10C2D8</code>. A value that holds an address is called a <strong>pointer</strong> or <strong>reference</strong>: it doesn't hold the thing, it says where the thing is.</p>

<h2>The stack</h2>
<p>When a function is called, the CPU needs to remember where to return, and the function needs room for its parameters and local variables. That space is a <strong>stack frame</strong>, pushed onto the <strong>call stack</strong>. When the function returns, its frame is popped and the space is instantly reused.</p>
<ul>
<li>Fast: allocating is just moving the stack pointer register (<code>RSP</code>).</li>
<li>Automatic: locals vanish when the function returns.</li>
<li>Limited: usually around 1 MB per thread. Infinite recursion fills it: a <strong>stack overflow</strong>.</li>
</ul>

<h2>The heap</h2>
<p>Some data needs to outlive the function that made it, or is too big or variable-sized for the stack: a list of 10,000 devices, a downloaded file. That goes on the <strong>heap</strong>, a large pool managed separately. The function keeps a reference (an address) on its stack that points to the heap object.</p>
<p>Someone has to free heap memory when it's no longer needed. In C you do it by hand, and getting it wrong causes leaks and security bugs. <strong>C# uses a garbage collector</strong>: the runtime periodically finds heap objects nothing references any more and frees them for you.</p>
${code(`
void Example()
{
    int count = 5;                       // value type: lives in this stack frame
    var names = new List<string>();      // object on the heap; 'names' (a reference) is on the stack
    names.Add("VU-04417");
}   // frame popped: 'count' and the 'names' reference are gone.
    // The List is now unreachable, so the garbage collector will reclaim it later.
`)}
${note("Security connection", "Classic C vulnerabilities live here: writing past the end of a stack buffer can overwrite the saved return address (stack smashing), and using heap memory after freeing it (use-after-free) lets attackers control what's there. C# avoids most of these by checking array bounds and managing memory for you.", "warn")}`,
          keypoints: [
            "Memory is an array of bytes; a pointer/reference is a value holding an address.",
            "The stack holds function frames: return address, parameters, locals. Fast and automatic.",
            "The heap holds longer-lived and variable-size objects, accessed by reference.",
            "C# frees heap memory automatically with a garbage collector.",
          ],
          quiz: [
            { q: "What usually causes a stack overflow?", o: ["Too many files open", "A function that calls itself forever, pushing frames until the stack is full", "Running out of disk space", "A slow network"], a: 1, why: "Each call adds a frame. Unbounded recursion exhausts the stack." },
            { q: "In C#, where does a <span class='mono'>new List&lt;int&gt;()</span> object live?", o: ["In a CPU register", "On the heap, with a reference to it on the stack", "On disk", "Inside the instruction"], a: 1, why: "Objects created with new go on the heap; the variable holds a reference." },
          ],
        },
        {
          id: "2-5", title: "From C# to machine code", minutes: 10,
          summary: "Compilers, interpreters and C#'s two-stage approach: compile to IL, then the JIT turns IL into native machine code at runtime.",
          body: `
<h2>Three ways to run code</h2>
<table>
<tr><th>Approach</th><th>How it works</th><th>Examples</th></tr>
<tr><td><strong>Ahead-of-time compiled</strong></td><td>A compiler translates the whole program to machine code before you run it. You ship the .exe.</td><td>C, C++, Rust, Go</td></tr>
<tr><td><strong>Interpreted</strong></td><td>A program (the interpreter) reads your source and carries it out line by line.</td><td>Bash, classic Python, PowerShell</td></tr>
<tr><td><strong>Bytecode + JIT</strong></td><td>Compile to a portable middle language. At runtime, a Just-In-Time compiler turns it into native machine code for whatever CPU it lands on.</td><td>C#, Java</td></tr>
</table>

<h2>C#'s pipeline</h2>
<ol>
<li>You write <code>Program.cs</code>.</li>
<li>The C# compiler (Roslyn) checks it and emits <strong>IL</strong> (Intermediate Language) into a <code>.dll</code>. IL is like assembly for an imaginary CPU, so the same .dll runs on x64 and ARM.</li>
<li>You run it. The <strong>.NET runtime (CLR)</strong> loads the .dll.</li>
<li>The first time each method is called, the <strong>JIT</strong> compiles its IL into real machine code for your CPU and caches it.</li>
<li>Your CPU fetches, decodes and executes those instructions, exactly like BEDROCK-4 but faster.</li>
</ol>
<p>Here's <code>a + b</code> at each level:</p>
${code(`
// C#
static int Add(int a, int b) => a + b;
`)}
${code(`
; IL (what's in the .dll)
ldarg.0      ; push a
ldarg.1      ; push b
add          ; pop both, push sum
ret
`, "asm")}
${code(`
; x86-64 after the JIT on Windows (what the CPU runs)
; a arrives in ECX, b in EDX
lea  eax, [rcx+rdx]   ; eax = a + b in one instruction
ret
`, "asm")}
${note("Why this matters to you", "When something is \"slow the first time,\" that's often JIT warm-up. When a tool like dnSpy or ILSpy opens a .NET .dll and shows you near-perfect C#, that's because IL keeps a lot of structure. That's great for debugging and a reason .NET malware is easier to reverse than C malware.")}
<p>You now know the full path from the code you'll write down to electrons in gates. Next: writing that code.</p>`,
          keypoints: [
            "Compiled languages ship machine code; interpreted ones are run by another program.",
            "C# compiles to IL inside a .dll; the CLR's JIT turns IL into native code at runtime.",
            "IL is CPU-independent, which is why one .NET build runs on x64 and ARM.",
            "Tools like ILSpy can read IL back into C#.",
          ],
          quiz: [
            { q: "What does the C# compiler produce?", o: ["x86-64 machine code only", "IL (Intermediate Language) in a .dll", "JavaScript", "Assembly text files"], a: 1, why: "Roslyn emits IL. The JIT produces machine code later." },
            { q: "What does the JIT do?", o: ["Downloads updates", "Translates IL into native machine code for the current CPU when methods first run", "Collects garbage", "Checks your spelling"], a: 1, why: "Just-In-Time compilation." },
          ],
        },
      ],
    },

    /* ===================================================== */
    {
      id: "m3", num: "03", title: "C# Fundamentals",
      blurb: "Write real programs. Every concept is tied back to what the machine is doing underneath.",
      lessons: [
        {
          id: "3-1", title: "Setup and your first program", minutes: 12,
          summary: "Install the .NET SDK, create a console app, and understand every piece of what just happened.",
          body: `
<h2>Install the .NET SDK</h2>
<p>The SDK includes the compiler, the runtime, and the <code>dotnet</code> command-line tool. Grab the current LTS (long-term support) version.</p>
${code(`
# Arch / Omarchy
sudo pacman -S dotnet-sdk

# macOS
brew install --cask dotnet-sdk

# Windows
winget install Microsoft.DotNet.SDK.10

# Check it worked
dotnet --version
`, "bash")}
${note("Version note", "Package names follow the version number. If <code>SDK.10</code> isn't found, check <a href=\"https://dotnet.microsoft.com/download\" target=\"_blank\" rel=\"noopener\">dotnet.microsoft.com/download</a> for the current LTS and adjust.")}
<p>For an editor, VS Code with the <strong>C# Dev Kit</strong> extension works everywhere. Visual Studio (Windows) and JetBrains Rider are also good.</p>

<h2>Create and run</h2>
${code(`
dotnet new console -n Hello
cd Hello
dotnet run
`, "bash")}
<p>That made a folder with two files that matter:</p>
<ul>
<li><code>Hello.csproj</code>: the project file. Says which .NET version to target and what packages to use.</li>
<li><code>Program.cs</code>: your code.</li>
</ul>
${code(`
// Program.cs
Console.WriteLine("Hello, Bedrock!");
`)}
<p>That one line is the whole program. Modern C# uses <strong>top-level statements</strong>: the compiler wraps your code in a hidden <code>Main</code> method, which is where the program starts.</p>

<h2>What <code>dotnet run</code> did</h2>
<ol>
<li><strong>Restore:</strong> fetched any packages listed in the .csproj.</li>
<li><strong>Build:</strong> compiled Program.cs to IL in <code>bin/Debug/net10.0/Hello.dll</code>.</li>
<li><strong>Run:</strong> started the .NET runtime, which JIT-compiled your code and executed it.</li>
</ol>
<p><code>Console</code> is a <strong>class</strong> from the .NET library, <code>WriteLine</code> is a <strong>method</strong> on it, and <code>"Hello, Bedrock!"</code> is a <strong>string</strong> argument. Under the hood, WriteLine encodes your text as bytes and asks the operating system to write them to the terminal.</p>

<h2>Reading input</h2>
${code(`
Console.Write("What's your name? ");
string? name = Console.ReadLine();
Console.WriteLine($"Nice to meet you, {name}.");
`)}
<p>The <code>$</code> before the string turns on <strong>interpolation</strong>: anything in <code>{ }</code> is evaluated and inserted. The <code>?</code> in <code>string?</code> says "this might be null" (no input, e.g. if input is closed). C# warns you when you might use a null value carelessly.</p>`,
          keypoints: [
            "Install the .NET SDK; dotnet new console creates a project; dotnet run builds and runs it.",
            "Top-level statements: your code in Program.cs is the program's entry point.",
            "Build output is an IL .dll in bin/; the runtime JITs it.",
            "$\"...{expr}...\" is string interpolation.",
          ],
          quiz: [
            { q: "Which file says which .NET version and packages a project uses?", o: ["Program.cs", "Hello.csproj", "bin/Hello.dll", "launch.json"], a: 1, why: "The .csproj is the project's configuration." },
            { q: "What does this print? <span class='mono'>int n = 4; Console.WriteLine($\"n is {n * 2}\");</span>", o: ["n is {n * 2}", "n is 8", "n is 4 * 2", "Error"], a: 1, why: "Interpolation evaluates the expression inside the braces." },
          ],
        },
        {
          id: "3-2", title: "Variables and types", minutes: 14,
          summary: "A type tells the compiler how many bits to reserve and what they mean. You've already met the bits; now name them.",
          body: `
<h2>A variable is a named slot of bits</h2>
<p>When you write <code>int age = 34;</code> you're telling the compiler: reserve 32 bits, call them <code>age</code>, and store the bit pattern for 34. The <strong>type</strong> decides how many bits and how to interpret them.</p>
<table>
<tr><th>Type</th><th>Bits</th><th>Range / meaning</th><th>Use for</th></tr>
<tr><td class="mono">bool</td><td>8*</td><td>true / false</td><td>flags, conditions</td></tr>
<tr><td class="mono">byte</td><td>8</td><td>0 to 255</td><td>raw data, file bytes</td></tr>
<tr><td class="mono">int</td><td>32</td><td>about ±2.1 billion</td><td>the default for whole numbers</td></tr>
<tr><td class="mono">long</td><td>64</td><td>about ±9.2 × 10<sup>18</sup></td><td>big counts, timestamps, file sizes</td></tr>
<tr><td class="mono">double</td><td>64</td><td>floating point, ~15 digits precision</td><td>measurements, science</td></tr>
<tr><td class="mono">decimal</td><td>128</td><td>exact base-10, 28 digits</td><td>money</td></tr>
<tr><td class="mono">char</td><td>16</td><td>one UTF-16 code unit</td><td>a single character</td></tr>
<tr><td class="mono">string</td><td>varies</td><td>text, stored on the heap</td><td>names, messages</td></tr>
</table>
<p class="status-line">* A bool only needs 1 bit, but it's stored in a byte because memory is addressed by bytes.</p>
${code(`
int devicesToday = 37;
long bytesCopied = 4_812_339_201;   // underscores are just for readability
double cpuTempC = 61.5;
decimal laborRate = 85.00m;          // m suffix = decimal literal
bool isImaged = true;
char grade = 'A';                    // single quotes for char
string assetTag = "VU-04417";        // double quotes for string
var model = "OptiPlex 7020";         // var: compiler infers string
`)}

<h2>Static typing</h2>
<p>C# is <strong>statically typed</strong>: every variable's type is fixed at compile time. Try <code>int x = "hello";</code> and it won't build. That feels strict, but it means a whole category of bugs is caught before the program ever runs. <code>var</code> doesn't change this; the type is still fixed, you just let the compiler figure it out.</p>

<h2>Overflow: the adder, again</h2>
<p>An <code>int</code> is 32 bits, so it has a maximum. Go past it and the extra carry falls off, exactly like the 4-bit adder. Because the top bit means "negative" in signed types, the number wraps to the most negative value.</p>
${widget("overflow")}
${code(`
int big = int.MaxValue;      // 2147483647
big++;
Console.WriteLine(big);      // -2147483648  (wrapped!)

checked
{
    int safe = int.MaxValue;
    safe++;                  // throws OverflowException instead of wrapping
}
`)}

<h2>Floating point surprise</h2>
${code(`
Console.WriteLine(0.1 + 0.2 == 0.3);   // False
Console.WriteLine(0.1 + 0.2);          // 0.30000000000000004
`)}
<p>A <code>double</code> stores numbers in binary fractions (halves, quarters, eighths...). 0.1 can't be represented exactly in binary, just like 1/3 can't be written exactly in decimal. That's why money uses <code>decimal</code>.</p>

<h2>Converting between types</h2>
${code(`
int whole = 7;
double d = whole;              // implicit: no data lost
int back = (int)9.99;          // explicit cast: truncates to 9

string input = "42";
int parsed = int.Parse(input); // throws if input isn't a number
if (int.TryParse("abc", out int n))
    Console.WriteLine(n);
else
    Console.WriteLine("Not a number");   // safer: no exception
`)}`,
          keypoints: [
            "A type = how many bits + how to interpret them. int is 32 bits, long is 64.",
            "C# is statically typed; var still has a fixed type, just inferred.",
            "Integer overflow wraps silently unless you use checked.",
            "double is binary floating point (inexact for 0.1); use decimal for money.",
            "Prefer int.TryParse over int.Parse for user input.",
          ],
          quiz: [
            { q: "Which type should you use for a dollar amount on an invoice?", o: ["double", "float", "decimal", "int"], a: 2, why: "decimal is exact in base 10. double can produce 0.30000000000000004." },
            { q: "<span class='mono'>var x = 5;</span> What is x's type?", o: ["var", "object", "int", "It can change later"], a: 2, why: "var infers int from the literal 5, and it's fixed forever." },
            { q: "What does <span class='mono'>(int)3.9</span> evaluate to?", o: ["4", "3", "3.9", "Error"], a: 1, why: "Casting to int truncates toward zero; it doesn't round." },
          ],
        },
        {
          id: "3-3", title: "Decisions and loops", minutes: 14,
          summary: "if, switch, for, while and foreach. All of them compile down to comparisons and jumps.",
          body: `
<h2>if / else</h2>
${code(`
int diskFreeGb = 12;

if (diskFreeGb < 5)
{
    Console.WriteLine("CRITICAL: image will fail");
}
else if (diskFreeGb < 20)
{
    Console.WriteLine("Warning: low space");
}
else
{
    Console.WriteLine("OK");
}
`)}
<p>Comparison operators: <code>==</code> <code>!=</code> <code>&lt;</code> <code>&lt;=</code> <code>&gt;</code> <code>&gt;=</code>. Combine with <code>&amp;&amp;</code> (and), <code>||</code> (or), <code>!</code> (not). Note <code>=</code> assigns and <code>==</code> compares.</p>
${note("Under the hood", "<code>if (diskFreeGb &lt; 5)</code> becomes: compare (subtract and set flags), then a conditional jump past the block if the flags say \"not less.\" Same as <code>JZ</code> in BEDROCK-4.")}

<h2>switch expressions</h2>
<p>When you're choosing between many values, a switch expression is cleaner than a chain of ifs:</p>
${code(`
string status = "Staged";

string color = status switch
{
    "Deployed" => "green",
    "Staged"   => "amber",
    "Retired"  => "gray",
    _          => "red"        // _ means "anything else"
};
`)}

<h2>Loops</h2>
${code(`
// for: when you know how many times
for (int i = 1; i <= 3; i++)
{
    Console.WriteLine($"Pass {i}");
}

// while: repeat until a condition changes
int retries = 0;
while (retries < 3 && !Connected())
{
    retries++;
}

// foreach: once per item in a collection
string[] sites = { "Nashville", "Clarksville", "Tullahoma" };
foreach (string site in sites)
{
    Console.WriteLine(site);
}
`)}
<p>Step through the loop below and watch the variables change. Each pass is a compare, a conditional jump, the body, an increment, and a jump back.</p>
${widget("trace", { id: "loop" })}
<p><code>break</code> exits a loop early. <code>continue</code> skips to the next pass.</p>`,
          keypoints: [
            "== compares, = assigns. && is and, || is or, ! is not.",
            "switch expressions map a value to a result cleanly; _ is the default.",
            "for = counted, while = condition-driven, foreach = each item in a collection.",
            "All of these compile to compares and jumps.",
          ],
          quiz: [
            { q: "How many times does this print? <span class='mono'>for (int i = 0; i &lt; 5; i += 2) Console.WriteLine(i);</span>", o: ["2", "3", "5", "Infinite"], a: 1, why: "i = 0, 2, 4. At 6 the condition fails." },
            { q: "What does <span class='mono'>continue</span> do in a loop?", o: ["Exits the loop", "Skips the rest of this pass and moves to the next", "Pauses the program", "Restarts from the first item"], a: 1, why: "continue jumps to the next iteration; break exits." },
          ],
        },
        {
          id: "3-4", title: "Methods", minutes: 12,
          summary: "Methods package code into named, reusable units with inputs and an output. Each call gets its own stack frame.",
          body: `
<h2>Defining and calling</h2>
${code(`
static int Square(int n)
{
    int result = n * n;
    return result;
}

int area = Square(7);   // 49
`)}
<ul>
<li><code>static</code>: belongs to the program itself, not to an object (more on that in classes).</li>
<li><code>int</code> before the name: the <strong>return type</strong>. Use <code>void</code> if it returns nothing.</li>
<li><code>(int n)</code>: the <strong>parameters</strong>, each with a type.</li>
<li><code>return</code>: hands a value back and ends the method.</li>
</ul>
<p>Short methods can use an expression body: <code>static int Square(int n) =&gt; n * n;</code></p>
${widget("trace", { id: "method" })}
<p>Notice in the trace that <code>n</code> gets a <em>copy</em> of <code>side</code>. Changing <code>n</code> inside the method wouldn't change <code>side</code>. That's called <strong>pass by value</strong>, and it's the default for numbers, bools and other value types.</p>

<h2>A more useful example</h2>
${code(`
static bool IsValidAssetTag(string tag)
{
    if (string.IsNullOrWhiteSpace(tag)) return false;
    if (!tag.StartsWith("VU-")) return false;
    string digits = tag.Substring(3);
    return digits.Length == 5 && digits.All(char.IsDigit);
}

Console.WriteLine(IsValidAssetTag("VU-04417"));  // True
Console.WriteLine(IsValidAssetTag("VU-44"));     // False
Console.WriteLine(IsValidAssetTag("DELL123"));   // False
`)}

<h2>Optional and named parameters</h2>
${code(`
static string Label(string tag, string site = "Nashville", bool urgent = false)
    => $"{(urgent ? "!! " : "")}{tag} @ {site}";

Label("VU-04417");                         // "VU-04417 @ Nashville"
Label("VU-04417", "Tullahoma");            // "VU-04417 @ Tullahoma"
Label("VU-04417", urgent: true);           // "!! VU-04417 @ Nashville"
`)}
${note("Design habit", "A good method does one job and its name says what that job is. If you find yourself writing \"and\" in a method name, it probably wants to be two methods.")}`,
          keypoints: [
            "A method has a return type, a name, parameters and a body. void returns nothing.",
            "Each call pushes a stack frame; locals disappear when it returns.",
            "Value-type arguments are copied (pass by value).",
            "Default and named parameters make calls clearer.",
          ],
          quiz: [
            { q: "What's the return type of <span class='mono'>static void Log(string msg)</span>?", o: ["string", "void (returns nothing)", "Log", "static"], a: 1, why: "void means no return value." },
            { q: "After <span class='mono'>int x = 5; Bump(x);</span> where Bump does <span class='mono'>n = n + 1</span> to its int parameter, what is x?", o: ["5", "6", "0", "Error"], a: 0, why: "ints are passed by value. Bump changed its own copy." },
          ],
        },
        {
          id: "3-5", title: "Collections", minutes: 12,
          summary: "Arrays, Lists and Dictionaries hold many values. Pick the right one and a lot of code writes itself.",
          body: `
<h2>Arrays: fixed size, contiguous memory</h2>
${code(`
int[] scores = new int[3];          // three ints, all 0
scores[0] = 88;
string[] sites = { "Nashville", "Clarksville", "Tullahoma" };
Console.WriteLine(sites.Length);    // 3
Console.WriteLine(sites[3]);        // throws IndexOutOfRangeException
`)}
<p>An array is one block of memory with items side by side. <code>sites[i]</code> is computed as "start address + i × item size," which is why indexing is instant. Indexes start at <strong>0</strong> because index 0 means "zero items past the start."</p>
${note("Security connection", "That <code>IndexOutOfRangeException</code> is C# protecting you. In C, reading <code>sites[3]</code> would silently read whatever bytes come next in memory. That's how bugs like Heartbleed leaked secrets.")}

<h2>List&lt;T&gt;: grows as needed</h2>
${code(`
var queue = new List<string>();
queue.Add("VU-04417");
queue.Add("VU-05120");
queue.Remove("VU-04417");
Console.WriteLine(queue.Count);     // 1
bool has = queue.Contains("VU-05120");
`)}
<p>The <code>&lt;string&gt;</code> is a <strong>generic type parameter</strong>: "a List of strings." Inside, a List is an array that quietly gets replaced by a bigger one when it fills up.</p>

<h2>Dictionary&lt;TKey, TValue&gt;: look things up by key</h2>
${code(`
var location = new Dictionary<string, string>
{
    ["VU-04417"] = "MCN 4th floor",
    ["VU-05120"] = "Clarksville clinic",
};

location["VU-06001"] = "Tullahoma depot";      // add or replace

if (location.TryGetValue("VU-05120", out string? where))
    Console.WriteLine(where);
`)}
<p>A dictionary uses <strong>hashing</strong> to jump straight to the right slot, so looking up one tag among a million is about as fast as looking up one among ten.</p>

<h2>LINQ: querying collections</h2>
${code(`
var devices = new List<(string Tag, string Site, int AgeYears)>
{
    ("VU-04417", "Nashville", 6),
    ("VU-05120", "Clarksville", 2),
    ("VU-06001", "Nashville", 5),
};

var oldNashville = devices
    .Where(d => d.Site == "Nashville" && d.AgeYears >= 5)
    .OrderBy(d => d.Tag)
    .Select(d => d.Tag)
    .ToList();
// ["VU-04417", "VU-06001"]
`)}
<p><code>d =&gt; d.Site == "Nashville"</code> is a <strong>lambda</strong>: a tiny unnamed method. "Given d, return whether its site is Nashville."</p>`,
          keypoints: [
            "Arrays are fixed-size and contiguous; indexes start at 0.",
            "List<T> grows automatically. Dictionary<K,V> finds values by key via hashing.",
            "C# checks bounds, preventing a whole class of memory bugs.",
            "LINQ (Where, Select, OrderBy...) queries collections; lambdas (x => ...) are inline methods.",
          ],
          quiz: [
            { q: "You need to look up a device's location by asset tag thousands of times. Best structure?", o: ["string[]", "List<string>", "Dictionary<string, string>", "A long if/else chain"], a: 2, why: "Dictionaries give near-instant lookup by key." },
            { q: "What's the index of the last item in an array of length 10?", o: ["10", "9", "11", "-1"], a: 1, why: "Zero-based: 0 through 9." },
          ],
        },
        {
          id: "3-6", title: "Classes and objects", minutes: 15,
          summary: "A class is a blueprint that bundles data and behavior. Objects are instances built from it, living on the heap.",
          body: `
<h2>Why classes</h2>
<p>So far, a device was three loose variables: a tag, a site, an age. A <strong>class</strong> bundles related data (<em>properties</em>) and the actions on it (<em>methods</em>) into one type you define.</p>
${code(`
public class Device
{
    // Properties: the data
    public string AssetTag { get; }
    public string Model { get; set; }
    public string Status { get; private set; } = "Received";

    // Constructor: runs when you create one
    public Device(string assetTag, string model)
    {
        AssetTag = assetTag;
        Model = model;
    }

    // Methods: the behavior
    public void Deploy(string location)
    {
        if (Status == "Retired")
            throw new InvalidOperationException("Can't deploy a retired device.");
        Status = $"Deployed: {location}";
    }

    public override string ToString() => $"{AssetTag} ({Model}) - {Status}";
}
`)}
${code(`
var d = new Device("VU-04417", "OptiPlex 7020");
d.Deploy("MCN 4th floor");
Console.WriteLine(d);    // VU-04417 (OptiPlex 7020) - Deployed: MCN 4th floor
// d.Status = "Retired";  // won't compile: the setter is private
`)}

<h2>Encapsulation</h2>
<p><code>public</code> means any code can use it. <code>private</code> means only code inside the class can. Making <code>Status</code>'s setter private forces everyone to go through <code>Deploy()</code>, which enforces the rules. That's <strong>encapsulation</strong>: the object protects its own valid state.</p>

<h2>Reference types</h2>
<p>Classes are <strong>reference types</strong>. <code>new Device(...)</code> builds the object on the heap; the variable <code>d</code> holds its address.</p>
${code(`
var a = new Device("VU-04417", "OptiPlex 7020");
var b = a;               // copies the reference, not the object
b.Model = "Latitude 5550";
Console.WriteLine(a.Model);   // Latitude 5550 - same object!
`)}
<p>Compare with ints, which are <strong>value types</strong> and get copied. This difference trips up almost everyone once.</p>

<h2>Records: data-first types</h2>
<p>When a type is mostly just data, a <code>record</code> gives you a constructor, properties, equality and a nice ToString in one line:</p>
${code(`
public record Ticket(string Id, string AssetTag, string Issue);

var t1 = new Ticket("INC0091", "VU-04417", "No POST");
var t2 = new Ticket("INC0091", "VU-04417", "No POST");
Console.WriteLine(t1 == t2);   // True: records compare by value
Console.WriteLine(t1);         // Ticket { Id = INC0091, AssetTag = VU-04417, Issue = No POST }
`)}

<h2>Inheritance and interfaces (preview)</h2>
<p>A class can <strong>inherit</strong> from another (<code>class Laptop : Device</code>) to reuse and extend it, or implement an <strong>interface</strong> (<code>class Device : IAuditable</code>) to promise it has certain methods. You'll lean on interfaces heavily once you build APIs.</p>`,
          keypoints: [
            "A class bundles properties (data) and methods (behavior). An object is one instance.",
            "Constructors set up a new object. public/private control access (encapsulation).",
            "Classes are reference types: copying the variable copies the address, not the object.",
            "record is a concise type for data, with value-based equality.",
          ],
          quiz: [
            { q: "<span class='mono'>var b = a;</span> where a is a class instance. Then <span class='mono'>b.Model = \"X\";</span>. What's <span class='mono'>a.Model</span>?", o: ["Unchanged", "\"X\"", "null", "Compile error"], a: 1, why: "Both variables reference the same heap object." },
            { q: "Why make a property's setter private?", o: ["It makes the program faster", "So outside code must use the class's methods, which can enforce rules", "Private properties use less memory", "Required by C#"], a: 1, why: "Encapsulation: the object guards its own valid state." },
          ],
        },
        {
          id: "3-7", title: "Errors, exceptions and async", minutes: 12,
          summary: "Real programs fail: missing files, bad input, dropped connections. Handle it cleanly, and don't block while waiting.",
          body: `
<h2>Exceptions</h2>
<p>When something goes wrong that the code can't handle locally, C# <strong>throws an exception</strong>. It unwinds up the call stack until something <strong>catches</strong> it. If nothing does, the program crashes with a stack trace showing exactly which methods were active.</p>
${code(`
try
{
    string text = File.ReadAllText("devices.csv");
    Console.WriteLine($"Read {text.Length} characters");
}
catch (FileNotFoundException)
{
    Console.WriteLine("devices.csv isn't here. Export it first.");
}
catch (UnauthorizedAccessException ex)
{
    Console.WriteLine($"Permission denied: {ex.Message}");
}
finally
{
    Console.WriteLine("Done.");   // always runs
}
`)}
${note("Habits", "Catch specific exceptions you can actually do something about. Don't wrap everything in <code>catch (Exception) { }</code>; that hides bugs. And for expected problems like bad user input, use TryParse-style checks instead of exceptions.")}

<h2>Reading a stack trace</h2>
${code(`
Unhandled exception. System.InvalidOperationException: Can't deploy a retired device.
   at Device.Deploy(String location) in /src/Device.cs:line 19
   at Program.<Main>$(String[] args) in /src/Program.cs:line 7
`, "text")}
<p>Read it top to bottom: the error type and message, then the call stack from where it was thrown (Device.cs line 19) back out to who called it (Program.cs line 7). That's literally the stack frames from module 2.</p>

<h2>async and await</h2>
<p>Network and disk operations take thousands to millions of times longer than CPU instructions. If your code just waits, the thread sits idle. <code>async</code>/<code>await</code> lets the method pause, free the thread to do other work, and resume when the data arrives.</p>
${code(`
using var http = new HttpClient();

string html = await http.GetStringAsync("https://example.com");
Console.WriteLine($"Got {html.Length} characters");
`)}
<ul>
<li>Methods ending in <code>Async</code> return a <code>Task</code> (a promise of a future result).</li>
<li><code>await</code> pauses this method until the task finishes, without freezing the program.</li>
<li>A method that uses await must be marked <code>async</code> and return <code>Task</code> or <code>Task&lt;T&gt;</code>. Top-level statements handle this for you.</li>
</ul>
${code(`
static async Task<int> CountDevicesAsync(string path)
{
    string[] lines = await File.ReadAllLinesAsync(path);
    return lines.Length - 1;   // minus the header row
}
`)}
<p>You'll use async constantly in web code, which is exactly where we're going next.</p>`,
          keypoints: [
            "Exceptions unwind the stack until caught; uncaught ones crash with a stack trace.",
            "Catch specific exceptions you can handle; use finally for cleanup.",
            "Stack traces read from where it broke outward to the callers.",
            "async/await lets slow I/O run without blocking the thread.",
          ],
          quiz: [
            { q: "When does a <span class='mono'>finally</span> block run?", o: ["Only when there's no exception", "Only when there's an exception", "Always, after try (and any catch)", "Never in release builds"], a: 2, why: "finally always runs. Good for cleanup." },
            { q: "What's the main benefit of <span class='mono'>await</span> on a network call?", o: ["The download is faster", "The thread isn't stuck waiting and can do other work", "It encrypts the request", "It retries automatically"], a: 1, why: "The bytes arrive at the same speed; the program just doesn't waste a thread waiting." },
          ],
        },
      ],
    },

    /* ===================================================== */
    {
      id: "m4", num: "04", title: "Networks & Web Protocols",
      blurb: "Follow a single web request from your keyboard to a server and back, layer by layer.",
      lessons: [
        {
          id: "4-1", title: "Layers and encapsulation", minutes: 12,
          summary: "Networking is split into layers. Each one wraps the data from the layer above with its own header, then hands it down.",
          body: `
<h2>Why layers</h2>
<p>A web browser shouldn't care whether you're on Wi-Fi or Ethernet. A router shouldn't care whether you're loading a web page or sending email. Splitting the problem into <strong>layers</strong> lets each part do one job and ignore the rest.</p>
<table>
<tr><th>TCP/IP layer</th><th>OSI layers</th><th>Job</th><th>Addresses</th><th>Examples</th></tr>
<tr><td><strong>Application</strong></td><td>7, 6, 5</td><td>What the program is saying</td><td>URLs</td><td>HTTP, DNS, TLS, SSH, SMTP</td></tr>
<tr><td><strong>Transport</strong></td><td>4</td><td>Which program; reliability</td><td>Ports</td><td>TCP, UDP</td></tr>
<tr><td><strong>Internet</strong></td><td>3</td><td>Which machine, across networks</td><td>IP addresses</td><td>IPv4, IPv6, ICMP</td></tr>
<tr><td><strong>Link</strong></td><td>2, 1</td><td>The next hop on this wire/radio</td><td>MAC addresses</td><td>Ethernet, Wi-Fi</td></tr>
</table>
${note("Network+ connection", "You memorized the OSI model's 7 layers for Network+. Real-world protocols follow the 4-layer TCP/IP model; OSI is the vocabulary everyone uses to talk about it (\"that's a layer 2 problem\").")}

<h2>Encapsulation</h2>
<p>Sending works like nesting envelopes. Each layer adds its own header around what it was handed:</p>
${widget("encap")}
<p>Receiving runs it in reverse: each layer reads its header, strips it, and passes the rest up. The link-layer envelope is replaced at every router, but the IP envelope stays the same end to end (NAT aside).</p>

<h2>Ports</h2>
<p>An IP address gets data to the right machine. A <strong>port</strong> (a 16-bit number, 0-65535) gets it to the right program on that machine. Servers listen on well-known ports; your side uses a random high port for each connection.</p>
<table>
<tr><th>Port</th><th>Protocol</th><th>Port</th><th>Protocol</th></tr>
<tr><td class="mono">22</td><td>SSH</td><td class="mono">443</td><td>HTTPS</td></tr>
<tr><td class="mono">53</td><td>DNS</td><td class="mono">3389</td><td>RDP</td></tr>
<tr><td class="mono">80</td><td>HTTP</td><td class="mono">5000-5299</td><td>common for local .NET dev servers</td></tr>
</table>`,
          keypoints: [
            "Four TCP/IP layers: application, transport, internet, link.",
            "Each layer wraps the data from above in its own header (encapsulation).",
            "IP addresses find the machine; ports find the program.",
            "Link-layer (MAC) headers change every hop; IP headers go end to end.",
          ],
          quiz: [
            { q: "Which layer uses port numbers?", o: ["Application", "Transport", "Internet", "Link"], a: 1, why: "TCP and UDP headers carry source and destination ports." },
            { q: "As a packet crosses three routers, which header gets rewritten at each hop?", o: ["HTTP", "TCP", "IP", "Ethernet / link layer"], a: 3, why: "Link-layer addressing only covers one hop." },
          ],
        },
        {
          id: "4-2", title: "IP addresses and DNS", minutes: 12,
          summary: "Machines are found by IP address. Humans use names. DNS is the distributed phone book that translates.",
          body: `
<h2>IP addresses</h2>
<p><strong>IPv4</strong> addresses are 32 bits (four bytes): <code>76.76.21.21</code>. That's only about 4.3 billion addresses, which ran out. <strong>IPv6</strong> addresses are 128 bits written in hex: <code>2606:4700::6810:84e5</code>.</p>
<p>Private ranges (<code>10.x.x.x</code>, <code>172.16-31.x.x</code>, <code>192.168.x.x</code>) are for internal networks. Your router uses <strong>NAT</strong> to let many private devices share one public IP.</p>

<h2>Routing in one paragraph</h2>
<p>Your device ANDs the destination with its subnet mask (lesson 1-3). Same network? Send directly. Different? Send to the <strong>default gateway</strong> (your router). Each router looks up the destination in its routing table and forwards to the next router that's closer. Repeat until it arrives. <code>traceroute</code> (or <code>tracert</code>) shows you each hop.</p>

<h2>DNS: names to numbers</h2>
<p>You type <code>darkfiresecurity.com</code>. Before anything can connect, that name has to become an IP address. <strong>DNS</strong> (Domain Name System) is a hierarchy of servers that answers that question.</p>
${widget("seq", { id: "dns" })}
<p>Answers are cached at every level for their <strong>TTL</strong> (time to live), so most lookups never go past your local resolver.</p>
<table>
<tr><th>Record</th><th>Holds</th><th>Example</th></tr>
<tr><td class="mono">A</td><td>IPv4 address</td><td class="mono">76.76.21.21</td></tr>
<tr><td class="mono">AAAA</td><td>IPv6 address</td><td class="mono">2606:4700::6810:84e5</td></tr>
<tr><td class="mono">CNAME</td><td>alias to another name</td><td class="mono">www → darkfiresecurity.com</td></tr>
<tr><td class="mono">MX</td><td>mail server</td><td class="mono">10 mail.example.com</td></tr>
<tr><td class="mono">TXT</td><td>arbitrary text: SPF, DKIM, domain verification</td><td class="mono">v=spf1 include:_spf.google.com ~all</td></tr>
</table>
${code(`
nslookup darkfiresecurity.com
dig darkfiresecurity.com A +short
dig darkfiresecurity.com MX
`, "bash")}
${note("Security connection", "DNS is a goldmine for both sides. Attackers enumerate subdomains to find forgotten servers (your SUBFIND tool does exactly this). Defenders watch DNS logs because nearly all malware has to look up its command server.")}

<h2>Querying DNS from C#</h2>
${code(`
using System.Net;

IPAddress[] ips = await Dns.GetHostAddressesAsync("example.com");
foreach (var ip in ips)
    Console.WriteLine($"{ip} ({ip.AddressFamily})");
`)}`,
          keypoints: [
            "IPv4 = 32 bits, IPv6 = 128 bits. Private ranges + NAT stretch IPv4.",
            "Local destination: send directly. Remote: send to the default gateway.",
            "DNS resolves names via root → TLD → authoritative servers, with caching by TTL.",
            "A, AAAA, CNAME, MX and TXT are the records you'll touch most.",
          ],
          quiz: [
            { q: "Which DNS record type points a name to an IPv4 address?", o: ["MX", "AAAA", "A", "TXT"], a: 2, why: "A = IPv4. AAAA = IPv6." },
            { q: "Why do most DNS lookups finish quickly?", o: ["DNS servers are very close to everyone", "Answers are cached for their TTL, so the full chain is rarely needed", "Browsers guess IPs", "DNS uses TCP"], a: 1, why: "Caching at the resolver, OS and browser." },
          ],
        },
        {
          id: "4-3", title: "TCP and UDP", minutes: 12,
          summary: "TCP turns an unreliable network into a reliable, ordered stream. UDP skips all that for speed.",
          body: `
<h2>The problem</h2>
<p>IP makes no promises. Packets can arrive out of order, duplicated, or not at all. A web page missing a few bytes in the middle is useless, so something has to fix that.</p>

<h2>TCP: reliable streams</h2>
<p><strong>TCP</strong> numbers every byte it sends (the <em>sequence number</em>). The receiver replies with <em>acknowledgements</em> saying which bytes it has. Anything not acknowledged in time gets resent. The receiver reassembles everything in order. Your program just sees a clean stream of bytes.</p>
<p>Before any data, the two sides agree on starting sequence numbers with the <strong>three-way handshake</strong>:</p>
${widget("seq", { id: "tcp" })}
<p>TCP also does <strong>flow control</strong> (don't send faster than the receiver can read) and <strong>congestion control</strong> (slow down when the network is overloaded).</p>

<h2>UDP: fire and forget</h2>
<p><strong>UDP</strong> just sends datagrams. No handshake, no acknowledgements, no ordering. That sounds worse, but for some jobs it's exactly right:</p>
<ul>
<li><strong>DNS:</strong> one small question, one small answer. If it's lost, just ask again.</li>
<li><strong>Voice, video calls, games:</strong> a late packet is useless. Better to skip it than wait for a resend.</li>
<li><strong>QUIC / HTTP/3:</strong> builds its own reliability on top of UDP to avoid some of TCP's delays.</li>
</ul>
<table>
<tr><th></th><th>TCP</th><th>UDP</th></tr>
<tr><td>Connection setup</td><td>3-way handshake</td><td>none</td></tr>
<tr><td>Delivery</td><td>guaranteed, in order</td><td>best effort</td></tr>
<tr><td>Overhead</td><td>higher</td><td>minimal</td></tr>
<tr><td>Used by</td><td>HTTP/1.1, HTTP/2, SSH, SMTP, RDP</td><td>DNS, DHCP, VoIP, HTTP/3 (QUIC)</td></tr>
</table>
${note("Security connection", "A SYN flood sends thousands of SYNs and never completes the handshake, filling the server's table of half-open connections. A port scanner like nmap's default SYN scan sends a SYN and watches the reply: SYN-ACK means open, RST means closed.")}`,
          keypoints: [
            "TCP: sequence numbers + acks + retransmission = reliable, ordered byte stream.",
            "The 3-way handshake (SYN, SYN-ACK, ACK) sets up a TCP connection.",
            "UDP: no setup, no guarantees, minimal overhead. Good for DNS, real-time media, QUIC.",
          ],
          quiz: [
            { q: "Order of the TCP handshake?", o: ["ACK, SYN, SYN-ACK", "SYN, SYN-ACK, ACK", "SYN, ACK, FIN", "HELLO, OK, DONE"], a: 1, why: "SYN, SYN-ACK, ACK." },
            { q: "Why do video calls usually use UDP?", o: ["UDP is encrypted", "A late packet is worthless; waiting for retransmits causes lag", "TCP can't carry video", "UDP has bigger packets"], a: 1, why: "Real-time traffic prefers dropping data over waiting." },
          ],
        },
        {
          id: "4-4", title: "HTTP", minutes: 16,
          summary: "HTTP is the language of the web: plain text requests and responses with a method, a path, headers, a status code and a body.",
          body: `
<h2>It's just text</h2>
<p>Once TCP has a connection open, the browser writes a request into it. In HTTP/1.1 that request is literally readable text:</p>
${code(`
GET /services HTTP/1.1
Host: darkfiresecurity.com
User-Agent: Mozilla/5.0
Accept: text/html
`, "http")}
<p>A blank line ends the headers. The server writes back:</p>
${code(`
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 4821
Cache-Control: max-age=3600

<!doctype html>
<html>...
`, "http")}
<p>HTTP/2 and HTTP/3 send the same information in a compact binary format, but the concepts (method, path, headers, status, body) are identical.</p>

<h2>Methods</h2>
<table>
<tr><th>Method</th><th>Meaning</th><th>Has body?</th><th>Safe to repeat?</th></tr>
<tr><td class="mono">GET</td><td>read a resource</td><td>no</td><td>yes</td></tr>
<tr><td class="mono">POST</td><td>create / submit</td><td>yes</td><td>no</td></tr>
<tr><td class="mono">PUT</td><td>replace a resource</td><td>yes</td><td>yes (idempotent)</td></tr>
<tr><td class="mono">PATCH</td><td>partially update</td><td>yes</td><td>depends</td></tr>
<tr><td class="mono">DELETE</td><td>remove</td><td>usually no</td><td>yes (idempotent)</td></tr>
</table>

<h2>Status codes</h2>
<table>
<tr><th>Range</th><th>Meaning</th><th>Common ones</th></tr>
<tr><td class="mono">2xx</td><td>success</td><td>200 OK, 201 Created, 204 No Content</td></tr>
<tr><td class="mono">3xx</td><td>go somewhere else</td><td>301 Moved Permanently, 302 Found, 304 Not Modified</td></tr>
<tr><td class="mono">4xx</td><td>you (the client) did something wrong</td><td>400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests</td></tr>
<tr><td class="mono">5xx</td><td>the server broke</td><td>500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable</td></tr>
</table>
<p>Build some requests and send them to a pretend device API. Try every path. Try POST with broken JSON. Try <code>/admin</code> with and without the Authorization header to see the difference between 401 and 403.</p>
${widget("http")}

<h2>Stateless, plus cookies</h2>
<p>Each HTTP request stands alone; the server doesn't inherently remember you. To stay "logged in," the server sends a <code>Set-Cookie</code> header (or your app stores a token), and the client includes it on every following request. That's why stealing a session cookie or token is as good as stealing a login.</p>

<h2>JSON</h2>
<p>Web APIs mostly speak <strong>JSON</strong>, a text format for structured data:</p>
${code(`
{"assetTag": "VU-04417", "model": "OptiPlex 7020", "status": "Deployed", "ageYears": 6}
`, "text")}`,
          keypoints: [
            "An HTTP request = method + path + headers + optional body. A response = status + headers + body.",
            "GET reads, POST creates, PUT replaces, PATCH updates, DELETE removes.",
            "2xx success, 3xx redirect, 4xx client error, 5xx server error. 401 = who are you, 403 = not allowed.",
            "HTTP is stateless; cookies and tokens carry identity between requests.",
          ],
          quiz: [
            { q: "You send valid credentials but get a 403. What does that mean?", o: ["Your password is wrong", "The server knows who you are, but you don't have permission", "The page doesn't exist", "The server crashed"], a: 1, why: "401 = not authenticated. 403 = authenticated but not authorized." },
            { q: "Which method should create a new device record?", o: ["GET", "POST", "DELETE", "HEAD"], a: 1, why: "POST to the collection creates; the server typically replies 201 Created." },
            { q: "A 502 Bad Gateway usually means:", o: ["Your browser is outdated", "A proxy or load balancer couldn't get a valid response from the server behind it", "You typed the URL wrong", "The page moved"], a: 1, why: "5xx = server side. 502 specifically points at the upstream server." },
          ],
        },
        {
          id: "4-5", title: "HTTPS and TLS", minutes: 12,
          summary: "TLS wraps HTTP in encryption and proves you're talking to the real server. HTTPS = HTTP inside TLS.",
          body: `
<h2>Three guarantees</h2>
<ul>
<li><strong>Confidentiality:</strong> nobody on the path (coffee-shop Wi-Fi, ISP) can read the content.</li>
<li><strong>Integrity:</strong> nobody can change it in transit without detection.</li>
<li><strong>Authentication:</strong> you're really talking to <code>darkfiresecurity.com</code>, not an impostor.</li>
</ul>

<h2>The handshake</h2>
${widget("seq", { id: "tls" })}

<h2>The two kinds of crypto</h2>
<p><strong>Asymmetric</strong> (public/private keys) solves "how do two strangers agree on a secret over a public channel" and "how do I prove I own this certificate." It's slow. <strong>Symmetric</strong> (one shared key, e.g. AES) is fast, so TLS uses asymmetric crypto only during the handshake to agree on a symmetric session key, then encrypts all the actual data with AES or ChaCha20.</p>

<h2>Certificates and trust</h2>
<p>A <strong>certificate</strong> says "this public key belongs to darkfiresecurity.com," signed by a <strong>Certificate Authority</strong> (CA) like Let's Encrypt. Your OS and browser ship with a list of trusted root CAs. If the chain of signatures leads back to one of them, and the name and dates match, the browser trusts it.</p>
${note("What HTTPS hides and doesn't", "Hidden: the path, query string, headers, cookies and body. Visible: your IP, the server's IP, timing and size, and usually the domain name (via DNS and the TLS SNI field). HTTPS is not anonymity.", "warn")}
${note("Field connection", "Corporate networks often run TLS inspection: a firewall decrypts and re-encrypts traffic using the company's own CA, which is pushed to managed devices. That's why some apps break on hospital or enterprise networks until the internal CA is trusted.")}`,
          keypoints: [
            "TLS provides confidentiality, integrity and server authentication.",
            "Asymmetric crypto sets up a shared key; fast symmetric crypto (AES) encrypts the data.",
            "Certificates bind a domain to a public key, signed by a trusted CA.",
            "HTTPS hides content and paths, not IPs, timing or (usually) the domain.",
          ],
          quiz: [
            { q: "Why doesn't TLS encrypt everything with public-key crypto?", o: ["It's illegal", "It's much slower than symmetric crypto, so it's only used to set up a shared key", "Public keys are too short", "Browsers don't support it"], a: 1, why: "Asymmetric for the handshake, symmetric for bulk data." },
            { q: "On HTTPS, can someone on the same Wi-Fi see the full URL path you visit?", o: ["Yes, always", "No, the path is encrypted; they can typically see the domain and IP", "Only on Tuesdays", "Only if it's a GET"], a: 1, why: "The path is inside the encrypted HTTP request." },
          ],
        },
        {
          id: "4-6", title: "Speaking HTTP from C#", minutes: 14,
          summary: "Use HttpClient to call any API, and ASP.NET Core Minimal APIs to become one.",
          body: `
<h2>Calling an API</h2>
${code(`
using System.Net.Http.Json;
using System.Text.Json;

using var http = new HttpClient { BaseAddress = new Uri("https://api.github.com/") };
http.DefaultRequestHeaders.UserAgent.ParseAdd("Bedrock/1.0");   // GitHub requires a UA

// GitHub's JSON uses snake_case (full_name), so tell the parser
var json = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower };

HttpResponseMessage res = await http.GetAsync("repos/dotnet/runtime");
Console.WriteLine($"{(int)res.StatusCode} {res.StatusCode}");

if (res.IsSuccessStatusCode)
{
    var repo = await res.Content.ReadFromJsonAsync<Repo>(json);
    Console.WriteLine($"{repo!.FullName}: {repo.StargazersCount} stars");
}

record Repo(string FullName, int StargazersCount);
`)}
<p>Map that back to everything you've learned. <code>GetAsync</code> triggers a DNS lookup for <code>api.github.com</code>, a TCP handshake to port 443, a TLS handshake, then writes <code>GET /repos/dotnet/runtime HTTP/1.1</code> plus headers into the encrypted stream. <code>ReadFromJsonAsync</code> reads the body bytes, decodes UTF-8, parses the JSON and fills in your record.</p>
${note("Gotcha", "JSON property names have to line up with your C# property names. Most .NET APIs use camelCase, which works by default. Others, like GitHub, use snake_case and need the naming policy shown above.", "warn")}
${note("Habit", "Reuse one HttpClient instead of creating one per request. Creating many can exhaust sockets. In ASP.NET Core apps, inject <code>IHttpClientFactory</code> instead.")}

<h2>Becoming an API</h2>
<p>Flip it around: now <em>you're</em> the server. ASP.NET Core's <strong>Minimal APIs</strong> map an HTTP method and path to a C# method.</p>
${code(`
dotnet new web -n HelloApi
cd HelloApi
`, "bash")}
${code(`
// Program.cs
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello from Bedrock");
app.MapGet("/api/time", () => new { utc = DateTime.UtcNow });
app.MapGet("/api/square/{n:int}", (int n) => new { n, square = n * n });

app.Run();
`)}
${code(`
dotnet run
# in another terminal, using the URL dotnet prints:
curl http://localhost:5123/api/square/7
# {"n":7,"square":49}
`, "bash")}
<p>When you <code>dotnet run</code>, <strong>Kestrel</strong> (the built-in web server) opens a TCP socket and listens on a port. Each incoming request gets parsed, matched to a route, your lambda runs, and whatever you return is serialized to JSON with a <code>200 OK</code>. Returning a string sends <code>text/plain</code>.</p>`,
          keypoints: [
            "HttpClient sends requests; await it, check status, read JSON with ReadFromJsonAsync.",
            "Every HttpClient call performs DNS, TCP, TLS and HTTP under the hood.",
            "Minimal APIs: app.MapGet/MapPost(path, handler). Return objects to send JSON.",
            "Kestrel is the web server that listens on a port and runs your handlers.",
          ],
          quiz: [
            { q: "In a Minimal API, what does returning <span class='mono'>new { n = 7 }</span> from a handler send?", o: ["Plain text \"7\"", "JSON {\"n\":7} with 200 OK", "Nothing", "An HTML page"], a: 1, why: "Objects are serialized to JSON automatically." },
            { q: "What does <span class='mono'>{n:int}</span> in a route pattern do?", o: ["Comments", "Captures that path segment as a parameter n, only matching integers", "Sets a header", "Multiplies by n"], a: 1, why: "Route parameter with an int constraint." },
          ],
        },
      ],
    },

    /* ===================================================== */
    {
      id: "m5", num: "05", title: "Build: Device Tracker API",
      blurb: "Put it all together. Build, run and test a real C# web API, then trace one request through every layer.",
      lessons: [
        {
          id: "5-1", title: "Build the Device Tracker API", minutes: 45,
          summary: "A working REST API for tracking devices, in about 40 lines of C#. Then you trace a request from keystroke to transistor.",
          body: `
<h2>What you're building</h2>
<p>A small API that tracks devices by asset tag. It holds data in memory (a database is the natural next step), and supports listing, looking up, adding, updating status, and deleting.</p>
<table>
<tr><th>Method</th><th>Path</th><th>Does</th><th>Returns</th></tr>
<tr><td class="mono">GET</td><td class="mono">/devices</td><td>list all, optional ?site= filter</td><td>200 + array</td></tr>
<tr><td class="mono">GET</td><td class="mono">/devices/{tag}</td><td>one device</td><td>200 or 404</td></tr>
<tr><td class="mono">POST</td><td class="mono">/devices</td><td>add one</td><td>201, 400 or 409</td></tr>
<tr><td class="mono">PATCH</td><td class="mono">/devices/{tag}/status</td><td>change status</td><td>200 or 404</td></tr>
<tr><td class="mono">DELETE</td><td class="mono">/devices/{tag}</td><td>remove</td><td>204 or 404</td></tr>
</table>

<h2>1. Create the project</h2>
${code(`
dotnet new web -n DeviceTracker
cd DeviceTracker
`, "bash")}

<h2>2. Replace Program.cs</h2>
${code(`
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// In-memory store, keyed by asset tag (case-insensitive)
var devices = new Dictionary<string, Device>(StringComparer.OrdinalIgnoreCase)
{
    ["VU-04417"] = new("VU-04417", "OptiPlex 7020", "Nashville", "Deployed"),
    ["VU-05120"] = new("VU-05120", "Latitude 5550", "Clarksville", "Staged"),
};

app.MapGet("/devices", (string? site) =>
    devices.Values
        .Where(d => site is null || d.Site.Equals(site, StringComparison.OrdinalIgnoreCase))
        .OrderBy(d => d.AssetTag));

app.MapGet("/devices/{tag}", (string tag) =>
    devices.TryGetValue(tag, out var found)
        ? Results.Ok(found)
        : Results.NotFound(new { error = $"No device {tag}" }));

app.MapPost("/devices", (Device input) =>
{
    if (string.IsNullOrWhiteSpace(input.AssetTag))
        return Results.BadRequest(new { error = "assetTag is required" });
    if (devices.ContainsKey(input.AssetTag))
        return Results.Conflict(new { error = $"{input.AssetTag} already exists" });

    devices[input.AssetTag] = input;
    return Results.Created($"/devices/{input.AssetTag}", input);
});

app.MapPatch("/devices/{tag}/status", (string tag, StatusUpdate update) =>
{
    if (!devices.TryGetValue(tag, out var existing))
        return Results.NotFound();

    var changed = existing with { Status = update.Status };
    devices[tag] = changed;
    return Results.Ok(changed);
});

app.MapDelete("/devices/{tag}", (string tag) =>
    devices.Remove(tag) ? Results.NoContent() : Results.NotFound());

app.Run();

record Device(string AssetTag, string Model, string Site, string Status);
record StatusUpdate(string Status);
`)}
${note("What's new here", "<code>Results.Ok / NotFound / Created / Conflict</code> choose the status code. <code>existing with { Status = ... }</code> makes a copy of a record with one property changed (records are immutable by default). The <code>string? site</code> parameter is automatically filled from the query string <code>?site=</code>.")}

<h2>3. Run it</h2>
${code(`
dotnet run
# Note the URL it prints, e.g. http://localhost:5123
`, "bash")}

<h2>4. Test every endpoint</h2>
${code(`
BASE=http://localhost:5123   # use your port

curl -i $BASE/devices
curl -i "$BASE/devices?site=nashville"
curl -i $BASE/devices/VU-04417
curl -i $BASE/devices/VU-99999

curl -i -X POST $BASE/devices \\
  -H "Content-Type: application/json" \\
  -d '{"assetTag":"VU-06001","model":"OptiPlex 7020","site":"Tullahoma","status":"Received"}'

curl -i -X PATCH $BASE/devices/VU-06001/status \\
  -H "Content-Type: application/json" \\
  -d '{"status":"Deployed"}'

curl -i -X DELETE $BASE/devices/VU-06001
`, "bash")}
<p>The <code>-i</code> flag shows response headers, so you can see the raw status line and <code>Location</code> header you learned about in 4-4.</p>
${widget("checklist", { id: "capstone", title: "Capstone checklist", items: [
  "Installed the .NET SDK and <code>dotnet --version</code> works",
  "Created the DeviceTracker project and replaced Program.cs",
  "<code>dotnet run</code> starts without errors",
  "GET /devices returns the two seed devices",
  "Got a 404 for a tag that doesn't exist",
  "POSTed a new device and got 201 Created with a Location header",
  "POSTed the same tag again and got 409 Conflict",
  "PATCHed a status and saw it change",
  "DELETEd a device and got 204",
  "Pushed the project to your own GitHub repo",
] })}

<h2>5. Trace one request through everything</h2>
<p>You type <code>curl $BASE/devices/VU-04417</code> and press Enter. Here's what happens, using every lesson in this course:</p>
<ol>
<li><strong>Keystrokes to bytes (1-5):</strong> each key becomes a character; the command line is stored as UTF-8 bytes.</li>
<li><strong>Name lookup (4-2):</strong> <code>localhost</code> resolves to <code>127.0.0.1</code> from your hosts file. No DNS servers needed.</li>
<li><strong>TCP handshake (4-3):</strong> curl opens a socket; SYN, SYN-ACK, ACK on the loopback interface. Kestrel accepts the connection.</li>
<li><strong>HTTP request (4-4):</strong> curl writes <code>GET /devices/VU-04417 HTTP/1.1</code> and headers into the stream.</li>
<li><strong>Encapsulation (4-1):</strong> the OS wraps it in TCP (ports), then IP (127.0.0.1), and loops it straight back up the stack.</li>
<li><strong>Routing in your app (4-6):</strong> Kestrel parses the request; routing matches <code>/devices/{tag}</code>, binds <code>tag = "VU-04417"</code>.</li>
<li><strong>Your code runs (3-4, 3-5):</strong> a stack frame is pushed for your lambda; <code>TryGetValue</code> hashes the string and finds the record on the heap (2-4).</li>
<li><strong>Machine level (2-2, 2-5):</strong> all of that is JIT-compiled x86-64 or ARM64 instructions: fetch, decode, execute, with compares and conditional jumps for every <code>if</code>.</li>
<li><strong>Gates (1-3, 1-4):</strong> each compare is a subtraction in the ALU's adders; each bit is a transistor on or off.</li>
<li><strong>Back out:</strong> the record serializes to JSON, gets UTF-8 encoded, written as the body of <code>HTTP/1.1 200 OK</code>, wrapped in TCP/IP, and printed by curl.</li>
</ol>
<p>That's the whole stack. You can now explain every layer of it.</p>

<h2>Where to go next</h2>
<ul>
<li><strong>Persist the data:</strong> add SQLite with Entity Framework Core so devices survive a restart.</li>
<li><strong>Add auth:</strong> require an API key header and return 401/403 correctly.</li>
<li><strong>Add a front end:</strong> a small HTML page that calls your API with <code>fetch()</code>.</li>
<li><strong>Containerize:</strong> <code>dotnet publish</code> plus a Dockerfile, then run it on your home server.</li>
<li><strong>Break it on purpose:</strong> point a scanner at it in your lab, read the logs, and harden it. That's where this meets Security+.</li>
</ul>`,
          keypoints: [
            "Minimal APIs map HTTP methods and paths straight to C# lambdas.",
            "Results.* helpers set the right status code: 200, 201, 204, 400, 404, 409.",
            "Records + with-expressions make safe, immutable updates easy.",
            "Every request travels through every layer you learned, from UTF-8 bytes to transistors and back.",
          ],
          quiz: [
            { q: "In this API, what should POST /devices return when the tag already exists?", o: ["200 OK", "201 Created", "409 Conflict", "500 Internal Server Error"], a: 2, why: "409 = request conflicts with current state. It's the client's problem, not a server failure." },
            { q: "Where does the <span class='mono'>site</span> parameter in <span class='mono'>MapGet(\"/devices\", (string? site) =&gt; ...)</span> come from?", o: ["The request body", "The query string, e.g. ?site=nashville", "A cookie", "The route path"], a: 1, why: "Simple parameters not in the route template bind from the query string." },
            { q: "Why does <span class='mono'>curl localhost</span> not need a DNS server?", o: ["curl has DNS built in", "localhost resolves to 127.0.0.1 from the local hosts file", "DNS is only for HTTPS", "It does need one"], a: 1, why: "The hosts file is checked before DNS." },
          ],
        },
      ],
    },
  ];

  const GLOSSARY = [
    ["Bit", "A single 0 or 1. The smallest unit of data.", "1-1"],
    ["Byte", "8 bits. 256 possible values (0-255).", "1-1"],
    ["Binary", "Base-2 number system. Place values double: 1, 2, 4, 8...", "1-1"],
    ["Hexadecimal", "Base-16 (0-9, A-F). One hex digit = 4 bits. Prefixed 0x.", "1-2"],
    ["Transistor", "An electrically controlled switch. The physical building block of all chips.", "1-1"],
    ["Logic gate", "A circuit that outputs a bit based on a fixed rule over its inputs (AND, OR, XOR, NOT, NAND).", "1-3"],
    ["Truth table", "A table listing a gate's output for every possible input combination.", "1-3"],
    ["Half adder", "XOR (sum) + AND (carry). Adds two bits.", "1-4"],
    ["Full adder", "Adds two bits plus a carry-in. Chained to add multi-bit numbers.", "1-4"],
    ["Overflow", "A result too big for the available bits; the extra carry is lost and the value wraps.", "1-4"],
    ["Two's complement", "How signed integers are stored: the top bit indicates negative. Lets one adder do subtraction.", "3-2"],
    ["ASCII", "7-bit text encoding for 128 English characters and control codes.", "1-5"],
    ["UTF-8", "Variable-length Unicode encoding: 1 byte for ASCII, up to 4 for other characters.", "1-5"],
    ["Magic bytes", "The first bytes of a file that identify its real format.", "1-5"],
    ["CPU", "Central Processing Unit. Fetches, decodes and executes instructions.", "2-1"],
    ["Register", "A tiny, very fast storage slot inside the CPU.", "2-1"],
    ["ALU", "Arithmetic Logic Unit. Performs math and logic operations.", "2-1"],
    ["Program Counter", "Register holding the address of the next instruction (RIP on x86-64).", "2-1"],
    ["Clock", "The steady pulse that paces the CPU. Measured in GHz.", "2-1"],
    ["Cache", "Small fast memory between the CPU and RAM holding recently used data.", "2-1"],
    ["Fetch-decode-execute", "The loop every CPU runs: get the instruction, work out what it is, do it.", "2-2"],
    ["Opcode", "The bits of an instruction that select which operation to perform.", "2-2"],
    ["Operand", "The bits of an instruction that say what to operate on (address, register, value).", "2-2"],
    ["Machine code", "The raw instruction bytes a CPU executes.", "2-3"],
    ["Assembly", "Human-readable text for machine instructions, one line per instruction.", "2-3"],
    ["Instruction set (ISA)", "The set of instructions a CPU family understands: x86-64, ARM64.", "2-3"],
    ["Disassembler", "A tool that converts machine code back into assembly (Ghidra, IDA).", "2-3"],
    ["Stack", "Memory region for function call frames: return address, parameters, locals.", "2-4"],
    ["Heap", "Memory region for longer-lived objects, accessed by reference.", "2-4"],
    ["Pointer / reference", "A value that holds a memory address rather than the data itself.", "2-4"],
    ["Garbage collector", "The .NET runtime component that frees heap objects no longer referenced.", "2-4"],
    ["Compiler", "Translates source code into another form (machine code or IL) before running.", "2-5"],
    ["Interpreter", "A program that executes source code directly, line by line.", "2-5"],
    ["IL", "Intermediate Language. The CPU-independent bytecode C# compiles to.", "2-5"],
    ["JIT", "Just-In-Time compiler. Turns IL into native machine code at runtime.", "2-5"],
    ["CLR", "Common Language Runtime. Loads and runs .NET code (JIT, GC, type safety).", "2-5"],
    [".NET SDK", "The toolkit containing the C# compiler, runtime and dotnet CLI.", "3-1"],
    ["Static typing", "Every variable's type is fixed at compile time and checked by the compiler.", "3-2"],
    ["Value type", "A type whose variable holds the data directly and is copied on assignment (int, bool, struct).", "3-6"],
    ["Reference type", "A type whose variable holds a reference to a heap object (class, string, arrays).", "3-6"],
    ["Method", "A named block of code with parameters and an optional return value.", "3-4"],
    ["Class", "A blueprint bundling properties and methods. Instances are objects.", "3-6"],
    ["Record", "A concise C# type for data, with value-based equality and with-expressions.", "3-6"],
    ["Encapsulation", "Hiding internal state so it can only change through controlled methods.", "3-6"],
    ["Lambda", "An inline, unnamed method: x => x * 2.", "3-5"],
    ["LINQ", "C# query methods for collections: Where, Select, OrderBy...", "3-5"],
    ["Exception", "An error object thrown up the call stack until caught.", "3-7"],
    ["async / await", "C# keywords for non-blocking waits on I/O, built on Task.", "3-7"],
    ["Encapsulation (network)", "Each layer wrapping the data from above in its own header.", "4-1"],
    ["Port", "16-bit number identifying a program/service on a host. HTTPS = 443.", "4-1"],
    ["IP address", "Identifies a host. IPv4 = 32 bits, IPv6 = 128 bits.", "4-2"],
    ["NAT", "Network Address Translation: many private addresses share one public IP.", "4-2"],
    ["Default gateway", "The router a host sends traffic to when the destination isn't local.", "4-2"],
    ["DNS", "Domain Name System. Resolves names to IP addresses through a hierarchy of servers.", "4-2"],
    ["TTL (DNS)", "How long a DNS answer may be cached.", "4-2"],
    ["TCP", "Reliable, ordered, connection-based transport using sequence numbers and acks.", "4-3"],
    ["UDP", "Connectionless, best-effort transport with minimal overhead.", "4-3"],
    ["Three-way handshake", "SYN, SYN-ACK, ACK: how a TCP connection is opened.", "4-3"],
    ["HTTP", "The application protocol of the web: method, path, headers, status, body.", "4-4"],
    ["Status code", "Three-digit HTTP result: 2xx success, 3xx redirect, 4xx client error, 5xx server error.", "4-4"],
    ["JSON", "Text format for structured data used by most web APIs.", "4-4"],
    ["Cookie", "Small value the server asks the client to send back on every request, used for sessions.", "4-4"],
    ["TLS", "Transport Layer Security. Encrypts and authenticates a connection. HTTPS = HTTP over TLS.", "4-5"],
    ["Certificate", "Binds a domain to a public key, signed by a Certificate Authority.", "4-5"],
    ["Certificate Authority", "A trusted organization that signs certificates (e.g. Let's Encrypt).", "4-5"],
    ["HttpClient", "The .NET class for sending HTTP requests.", "4-6"],
    ["Minimal API", "ASP.NET Core style mapping HTTP routes directly to handlers with app.MapGet etc.", "4-6"],
    ["Kestrel", "The cross-platform web server built into ASP.NET Core.", "4-6"],
    ["REST", "API style using HTTP methods on resource URLs: GET /devices, POST /devices.", "5-1"],
  ].map(([term, def, lesson]) => ({ term, def, lesson }));

  window.COURSE = { MODULES, GLOSSARY };
})();
