"""Mechanical checks for the portfolio site. Usage: python check_site.py <site-root>
Exit code 1 if any ERROR. Warnings do not fail."""
import os, re, sys
from html.parser import HTMLParser

ROOT = os.path.abspath(sys.argv[1] if len(sys.argv) > 1 else ".")
VOID = {"area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"}
BANNED = [
    (r"\[TODO", "shipped [TODO] text"),
    (r"[☐☑☒]", "Unicode checkbox glyph"),
    (r"[\U0001F300-\U0001FAFF☀-➿]", "emoji"),
    (r"\+31\s?6|\+1\s?646|\btel:", "phone number"),
    (r"auto-appl|autoappl|applies to listings", "auto-apply mention"),
    (r"\bcolour|\bhonourable|\bauthorised|\bparameterised|\bminimis|\bde-duplicated|\bcentre\b|\bcentred", "British spelling (site is American)"),
    (r"passionate|innovative|cutting-edge|leverag|seamless|\bdelve|\bjourney\b", "hype vocabulary"),
    (r"aria-live", "aria-live is banned"),
    (r"Fraunces|Newsreader|IBM Plex|Inter\b|Roboto|Poppins|Montserrat|Space Grotesk|JetBrains", "banned/unspecified typeface"),
    (r"text-align:\s*center", "centred text"),
    (r"prefers-color-scheme", "dark scheme (allowed only in favicon.svg)"),
    (r"TODO\(|PHOTO SLOT|<user>|<repo>", "authoring note in shipped HTML"),
]
# Strings that must never ship but must not be written in this file either (it is public with the repo): set CHECK_PRIVATE
# to a regex, locally or as the repository secret the deploy workflow passes in. A match is an ERROR reported without the text.
PRIVATE = os.environ.get("CHECK_PRIVATE", "").strip()

class Balance(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack, self.errors, self.h1 = [], [], 0
        self.svg_widths, self.ids, self.hrefs, self.srcs, self.imgs = [], [], [], [], []
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "h1": self.h1 += 1
        if tag == "svg" and "viewBox" in a: self.svg_widths.append((a["viewBox"], a.get("class",""), self.getpos()[0]))
        if "id" in a: self.ids.append(a["id"])
        if tag == "a" and "href" in a: self.hrefs.append((a["href"], self.getpos()[0]))
        if tag in ("link","script","img") and (a.get("href") or a.get("src")): self.srcs.append((a.get("href") or a.get("src"), self.getpos()[0]))
        if tag == "img": self.imgs.append((a, self.getpos()[0]))
        if tag not in VOID: self.stack.append((tag, self.getpos()[0]))
    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID and self.stack and self.stack[-1][0] == tag: self.stack.pop()
    def handle_endtag(self, tag):
        if tag in VOID: return
        if not self.stack: self.errors.append(f"line {self.getpos()[0]}: stray </{tag}>"); return
        if self.stack[-1][0] == tag: self.stack.pop(); return
        # try to recover: find tag in stack
        names = [t for t, _ in self.stack]
        if tag in names:
            while self.stack and self.stack[-1][0] != tag:
                t, ln = self.stack.pop(); self.errors.append(f"line {ln}: <{t}> never closed (closed by </{tag}> at line {self.getpos()[0]})")
            self.stack.pop()
        else:
            self.errors.append(f"line {self.getpos()[0]}: unexpected </{tag}> (open: {names[-3:]})")

errors, warns = [], []
pages = []
for dp, dn, fn in os.walk(ROOT):
    if any(p.startswith(".") and p != ".nojekyll" for p in dp[len(ROOT):].split(os.sep)): continue
    if any(p in ("node_modules", "src") for p in dp[len(ROOT):].split(os.sep)): continue
    for f in fn:
        if f.endswith(".html"): pages.append(os.path.join(dp, f))
if not pages: errors.append("no .html pages found")
for p in sorted(pages):
    rel = os.path.relpath(p, ROOT).replace("\\", "/")
    src = open(p, encoding="utf-8").read()
    b = Balance(); b.feed(src)
    for t, ln in b.stack: b.errors.append(f"line {ln}: <{t}> never closed (EOF)")
    for e in b.errors: errors.append(f"{rel}: {e}")
    if b.h1 != 1: errors.append(f"{rel}: {b.h1} <h1> elements (need exactly 1)")
    if "<html lang=" not in src: errors.append(f"{rel}: missing <html lang>")
    if '<main id="main"' not in src and "<main id='main'" not in src: errors.append(f"{rel}: missing <main id=\"main\">")
    if 'class="skip"' not in src: errors.append(f"{rel}: missing skip link")
    # JavaScript only where an island needs it: a page without one carries the site script and nothing else
    scripts = re.findall(r"<script\b[^>]*>", src)
    if "<astro-island" not in src and len(scripts) > 1:
        errors.append(f"{rel}: {len(scripts)} <script> elements on a page without an island (only the site script may be there)")
    for pat, why in BANNED:
        for m in re.finditer(pat, src, flags=re.I):
            ln = src.count("\n", 0, m.start()) + 1
            # allow British in <title>/proper nouns? no — flag and let reviewer decide
            (warns if why.startswith("British") or why.startswith("hype") else errors).append(f"{rel}:{ln}: {why}: '{m.group(0)}'")
    if PRIVATE:
        for m in re.finditer(PRIVATE, src, flags=re.I):
            errors.append(f"{rel}:{src.count(chr(10), 0, m.start()) + 1}: private string (CHECK_PRIVATE); match not shown")
    for vb, cls, ln in b.svg_widths:
        parts = vb.split()
        if len(parts) == 4 and parts[2] != "800" and "chk" not in cls and "scale" not in cls and "favicon" not in rel:
            warns.append(f"{rel}:{ln}: svg viewBox width {parts[2]} (spec: 800 unless .chk or scale bar)")
    # links
    for href, ln in b.hrefs + b.srcs:
        if href.startswith(("http:", "https:", "mailto:", "#")): continue
        path, _, frag = href.partition("#")
        path = path.partition("?")[0]
        if path.startswith("/"):
            target = os.path.normpath(os.path.join(ROOT, path.lstrip("/")))
        else:
            target = os.path.normpath(os.path.join(os.path.dirname(p), path)) if path else p
        if path and not os.path.exists(target):
            errors.append(f"{rel}:{ln}: broken link {href}")
        elif frag and target.endswith(".html") and os.path.exists(target):
            tsrc = open(target, encoding="utf-8").read()
            if f'id="{frag}"' not in tsrc and f"id='{frag}'" not in tsrc:
                errors.append(f"{rel}:{ln}: link {href} — no id=\"{frag}\" in target")
    for a, ln in b.imgs:
        if "alt" not in a: errors.append(f"{rel}:{ln}: <img> without alt")
        if "width" not in a or "height" not in a: warns.append(f"{rel}:{ln}: <img> without width/height")
    # duplicate ids
    seen = set()
    for i in b.ids:
        if i in seen: errors.append(f"{rel}: duplicate id \"{i}\"")
        seen.add(i)
# placeholder images: the five labeled placeholders in public/assets/work/ must never ship in a page
import hashlib
PLACEHOLDERS = {"7e27c48b7e4b49e2", "2e8a531eff2526bb", "ae34e15c4f0881e5", "8d1c7d574d8b3db3", "ba04bb0303424caa"}
for p in sorted(pages):
    rel = os.path.relpath(p, ROOT).replace("\\", "/")
    for m in re.finditer(r'<img[^>]+src="([^"]+)"', open(p, encoding="utf-8").read()):
        src = m.group(1)
        if src.startswith(("http:", "https:", "data:")): continue
        f = os.path.normpath(os.path.join(ROOT, src.lstrip("/")) if src.startswith("/") else os.path.join(os.path.dirname(p), src))
        if os.path.exists(f) and hashlib.sha256(open(f, "rb").read()).hexdigest()[:16] in PLACEHOLDERS:
            errors.append(f"{rel}: placeholder image shipped: {src}")
# css/js size
import glob as _g
css = _g.glob(os.path.join(ROOT, "css", "site.css")) + _g.glob(os.path.join(ROOT, "_astro", "*.css"))
if not css: errors.append("no stylesheet found (css/site.css or _astro/*.css)")
for f in css:
    if os.path.getsize(f) > 60_000: warns.append(f"{os.path.relpath(f, ROOT)} is {os.path.getsize(f)} bytes (budget 60000)")
# the dev kit (/dev/kit, the living style guide) exists under `pnpm dev` only (apps/web/tools/dev-routes.mjs): nothing of it may reach a build
if os.path.exists(os.path.join(ROOT, "dev")): errors.append("dev/ reached the build: the dev kit is for `pnpm dev` only")
for f in pages + css:
    if "devkit" in open(f, encoding="utf-8").read(): errors.append(f"{os.path.relpath(f, ROOT).replace(os.sep, '/')}: dev kit markup or CSS in the build (the class prefix is devkit)")
# share-card.png is every page's og:image: an absolute URL, which the link check above skips
for f in (".nojekyll", "assets/favicon.svg", "assets/hdmi-frame-640x480.png", "assets/share-card.png"):
    if not os.path.exists(os.path.join(ROOT, f)): errors.append(f"missing {f}")

print(f"pages: {len(pages)}")
for w in warns: print("WARN ", w)
for e in errors: print("ERROR", e)
print(f"{len(errors)} errors, {len(warns)} warnings")
sys.exit(1 if errors else 0)
