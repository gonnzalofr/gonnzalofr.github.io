"""Parity check between two builds of the site. Usage: python dist_diff.py <golden-dist> <new-dist> [--max N] [--islands]
Exit code 1 if the builds differ. Used by the migration (docs/migration-plan.md, section 6): every phase must
produce the same site as the build before it.

What counts as the same:
- Every .html page parses to the same element tree: same tags in the same order, same attributes (order ignored; a bare
  boolean attribute is the same as one set to ""), same text with runs of whitespace collapsed and whitespace-only
  text between elements dropped. Comments are dropped, and the text on either side of one is read as one run (React
  writes `<!-- -->` between adjacent text nodes).
- Spaces inside inline content count: every element that holds no block-level element (a <p>, <a>, <span>, <dd>, an
  SVG <text> …) must have the same text content, with each whitespace run read as one space (or one newline, if it
  has one) and the ends trimmed. A space lost between "<span>01</span> <span>←</span>" is a difference, although the
  element tree is the same.
- References to bundled assets (/_astro/<name>.<hash>.<ext>) are compared without their file names, because the
  bundler names a file after the component that imports it and a hash changes whenever any input changes.
- The bundled assets themselves are compared by content (with their own /_astro/ references normalized the same way),
  as a multiset: a renamed file with the same content is not a difference; changed content is.
- Stylesheets are compared as rules: comments dropped and whitespace collapsed, so splitting a stylesheet into files
  or moving a comment is not a difference, but any change to a selector, a declaration or the order of rules is
  (the cascade depends on that order). A changed stylesheet is reported with the first place it differs.
- Every other file (public/ copies: images, fonts, PDF, .nojekyll) is compared byte for byte at the same path.

With --islands, pages are compared without what makes them interactive: Astro's island elements (<astro-island>,
<astro-slot>, <astro-static-slot>) are unwrapped, keeping what they hold, and every <script> and <style> element is left
out with its content. That compares the server-rendered contents of an island with the markup a page script used to
enhance (phase 5), and lists each island found, with its component and directive."""
import argparse, hashlib, os, re, sys
from collections import Counter
from html.parser import HTMLParser

ISLAND_TAGS = {"astro-island", "astro-slot", "astro-static-slot"}
ASTRO_REF = re.compile(r"(_astro/)[^\"'()\s]+?\.(css|js|mjs)\b")
VOID = {"area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"}


def norm_refs(s):
    return ASTRO_REF.sub(r"\1*.\2", s)


# Elements whose own text content is not compared, because the whitespace between their children does not render
# (or is not text): only the inline elements inside them are compared.
CONTAINER = {"html","head","body","main","header","footer","nav","section","article","aside","div","ul","ol","dl",
             "figure","table","thead","tbody","tr","form","fieldset","details","svg","g","defs","pattern","marker",
             "clippath","symbol","script","style"}
# Block-level elements: an element that holds one of these is not compared either.
BLOCK = CONTAINER | {"p","li","dt","dd","h1","h2","h3","h4","h5","h6","figcaption","summary","pre","blockquote","td","th"}


def spaced(text):
    """Text content with each whitespace run written as one space, or one newline if it has one; ends trimmed."""
    return re.sub(r"\s+", lambda m: "\n" if "\n" in m.group(0) else " ", text).strip()


class Tree(HTMLParser):
    """Flattens a page into a list of tokens, each carrying the element path it sits on (for the report), and collects
    the text content of every element that holds only inline content (`texts`)."""
    def __init__(self, islands=False):
        super().__init__(convert_charrefs=True)
        self.islands, self.skip, self.found = islands, 0, []   # --islands: depth inside <script>/<style>; islands seen
        self.tokens, self.path, self.texts = [], [], []
        self.run = ""      # text since the last tag (comments do not end it)
        self.open = []     # one [tag, text content so far, holds a block element] per open element
    def _attrs(self, attrs):
        # a bare boolean attribute (`disabled`) is the same attribute as `disabled=""`
        return tuple(sorted((k, norm_refs(v) if v is not None else "") for k, v in attrs))
    def _flush(self):
        t = " ".join(self.run.split())
        if t: self.tokens.append(("/".join(self.path), "#text", norm_refs(t)))
        self.run = ""
    def _tag(self, tag, attrs):
        self._flush()
        self.tokens.append(("/".join(self.path), "<" + tag, self._attrs(attrs)))
        if tag in BLOCK and self.open: self.open[-1][2] = True
    def _ignored(self, tag, attrs, start):
        """--islands: whether this tag is left out (an island wrapper, or a script or style and what is inside it)."""
        if not self.islands: return False
        if tag in ("script", "style"):
            self.skip += 1 if start else -1
            return True
        if tag in ISLAND_TAGS:
            a = dict(attrs)
            if start and tag == "astro-island":
                url = norm_refs(a.get("component-url") or "")
                self.found.append(f"{a.get('component-export')} from {url} (client:{a.get('client')}, props {a.get('props')})")
            return True
        return self.skip > 0
    def handle_starttag(self, tag, attrs):
        if self._ignored(tag, attrs, True): return
        self._tag(tag, attrs)
        if tag not in VOID:
            self.path.append(tag)
            self.open.append([tag, "", False])
    def handle_startendtag(self, tag, attrs):
        if self.islands and (self.skip or tag in ISLAND_TAGS): return
        self._tag(tag, attrs)
    def handle_endtag(self, tag):
        if tag in VOID or self._ignored(tag, (), False): return
        self._flush()
        # pop to the matching open tag (tolerates the implicit closes HTML allows)
        if tag in self.path:
            while self.path and self.path.pop() != tag: pass
            while self.open:
                name, text, block = self.open.pop()
                if name not in CONTAINER and not block: self.texts.append(("/".join(self.path + [name]), spaced(text)))
                if self.open:
                    self.open[-1][1] += text
                    self.open[-1][2] = self.open[-1][2] or block
                if name == tag: break
        self.tokens.append(("/".join(self.path), "</" + tag, ()))
    def handle_data(self, data):
        if self.skip: return
        self.run += data
        if self.open: self.open[-1][1] += data
    def handle_comment(self, data):
        pass  # comments are authoring notes, not output; the text around one stays one run
    def handle_decl(self, decl):
        self._flush()
        self.tokens.append(("", "<!" + decl.lower(), ()))
    def close(self):
        super().close()
        self._flush()


def parse(path, islands=False):
    p = Tree(islands)
    with open(path, encoding="utf-8") as f: p.feed(f.read())
    p.close()
    return p


def files(root):
    out = {}
    for d, _, fs in os.walk(root):
        for f in fs:
            full = os.path.join(d, f)
            out[os.path.relpath(full, root).replace(os.sep, "/")] = full
    return out


def fmt(tok):
    where, kind, val = tok
    if kind == "#text": return f"{where}: text {val[:120]!r}"
    if kind.startswith("</"): return f"{where}: {kind}>"
    attrs = " ".join(f'{k}="{v}"' if v is not None else k for k, v in val)
    return f"{where}: {kind}{(' ' + attrs) if attrs else ''}>"[:240]


def diff_page(a, b, maxn, islands=False):
    pa, pb = parse(a, islands), parse(b, islands)
    ta, tb = pa.tokens, pb.tokens
    out, i = [], 0
    for i, (x, y) in enumerate(zip(ta, tb)):
        if x[1:] != y[1:]:
            out.append(f"    token {i}\n      - {fmt(x)}\n      + {fmt(y)}")
            if len(out) >= maxn: break
    if not out and len(ta) != len(tb):
        n = min(len(ta), len(tb))
        extra, sign = (ta[n:], "-") if len(ta) > len(tb) else (tb[n:], "+")
        out.append(f"    {len(extra)} extra token(s) at the end of {'golden' if sign == '-' else 'new'}:\n      {sign} {fmt(extra[0])}")
    if not out:   # same tree: compare the spacing inside inline content
        for (where, x), (_, y) in zip(pa.texts, pb.texts):
            if x != y:
                out.append(f"    text of {where}\n      - {x[:160]!r}\n      + {y[:160]!r}")
                if len(out) >= maxn: break
    return out, [f"    island in golden: {i}" for i in pa.found] + [f"    island: {i}" for i in pb.found]


CSS_COMMENT = re.compile(r"/\*.*?\*/", re.S)


def norm_css(s):
    s = " ".join(CSS_COMMENT.sub(" ", s).split())
    return re.sub(r"\s*([{};])\s*", r"\1", s)


def asset_text(path):
    with open(path, "rb") as f: data = f.read()
    try: text = norm_refs(data.decode("utf-8"))
    except UnicodeDecodeError: return data
    return norm_css(text) if path.endswith(".css") else text


def asset_digest(path):
    data = asset_text(path)
    return hashlib.sha256(data if isinstance(data, bytes) else data.encode("utf-8")).hexdigest()[:16]


def first_css_difference(a, b):
    x, y = asset_text(a), asset_text(b)
    i = next((i for i, (p, q) in enumerate(zip(x, y)) if p != q), min(len(x), len(y)))
    lo = max(0, i - 80)
    return f"      - ...{x[lo:i + 80]}...\n      + ...{y[lo:i + 80]}..."


def main():
    ap = argparse.ArgumentParser(description="Parity check between two builds of the site.")
    ap.add_argument("golden"); ap.add_argument("new")
    ap.add_argument("--max", type=int, default=5, help="differences shown per page (default 5)")
    ap.add_argument("--islands", action="store_true", help="unwrap Astro's islands and leave out scripts and styles")
    args = ap.parse_args()
    maxn = args.max
    ga, gb = os.path.abspath(args.golden), os.path.abspath(args.new)
    fa, fb = files(ga), files(gb)
    problems = 0

    def report(msg):
        nonlocal problems
        problems += 1
        print(msg)

    astro_a = {k: v for k, v in fa.items() if k.startswith("_astro/")}
    astro_b = {k: v for k, v in fb.items() if k.startswith("_astro/")}
    plain = lambda fs: {k: v for k, v in fs.items() if not k.startswith("_astro/")}
    pa, pb = plain(fa), plain(fb)

    for k in sorted(pa.keys() - pb.keys()): report(f"MISSING  {k}")
    for k in sorted(pb.keys() - pa.keys()): report(f"ADDED    {k}")
    for k in sorted(pa.keys() & pb.keys()):
        if k.endswith(".html"):
            d, found = diff_page(pa[k], pb[k], maxn, args.islands)
            if d: report(f"CHANGED  {k}\n" + "\n".join(d + found))
            elif found: print(f"SAME     {k}, scripts and styles aside\n" + "\n".join(found))
        else:
            with open(pa[k], "rb") as x, open(pb[k], "rb") as y:
                if x.read() != y.read(): report(f"CHANGED  {k} (bytes)")

    ca = Counter(asset_digest(v) for v in astro_a.values())
    cb = Counter(asset_digest(v) for v in astro_b.values())
    if ca != cb:
        by_a = {asset_digest(v): k for k, v in astro_a.items()}
        by_b = {asset_digest(v): k for k, v in astro_b.items()}
        only_a, only_b = sorted((ca - cb).keys()), sorted((cb - ca).keys())
        for h in only_a: report(f"ASSET    only in golden: {by_a[h]}")
        for h in only_b: report(f"ASSET    only in new:    {by_b[h]}")
        css_a = [by_a[h] for h in only_a if by_a[h].endswith(".css")]
        css_b = [by_b[h] for h in only_b if by_b[h].endswith(".css")]
        if len(css_a) == 1 and len(css_b) == 1:
            print("    first difference in the stylesheet (comments and whitespace removed):\n"
                  + first_css_difference(astro_a[css_a[0]], astro_b[css_b[0]]))

    pages = sum(k.endswith(".html") for k in pa)
    print(f"{pages} page(s), {len(pa) - pages} other file(s), {len(astro_a)} bundled asset(s) compared: "
          + ("identical" if not problems else f"{problems} difference(s)"))
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
