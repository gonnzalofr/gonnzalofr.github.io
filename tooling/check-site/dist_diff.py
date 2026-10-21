"""Parity check between two builds of the site. Usage: python dist_diff.py <golden-dist> <new-dist> [--max N]
Exit code 1 if the builds differ. Used by the migration (docs/migration-plan.md, section 6): every phase must
produce the same site as the build before it.

What counts as the same:
- Every .html page parses to the same element tree: same tags in the same order, same attributes (order ignored),
  same text with runs of whitespace collapsed and whitespace-only text between elements dropped.
- References to bundled assets (/_astro/<name>.<hash>.<ext>) are compared without their file names, because the
  bundler names a file after the component that imports it and a hash changes whenever any input changes.
- The bundled assets themselves are compared by content (with their own /_astro/ references normalized the same way),
  as a multiset: a renamed file with the same content is not a difference; changed content is.
- Every other file (public/ copies: images, fonts, PDF, .nojekyll) is compared byte for byte at the same path."""
import argparse, hashlib, os, re, sys
from collections import Counter
from html.parser import HTMLParser

ASTRO_REF = re.compile(r"(_astro/)[^\"'()\s]+?\.(css|js|mjs)\b")
VOID = {"area","base","br","col","embed","hr","img","input","link","meta","param","source","track","wbr"}


def norm_refs(s):
    return ASTRO_REF.sub(r"\1*.\2", s)


class Tree(HTMLParser):
    """Flattens a page into a list of tokens, each carrying the element path it sits on (for the report)."""
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tokens, self.path = [], []
    def _attrs(self, attrs):
        return tuple(sorted((k, norm_refs(v) if v is not None else None) for k, v in attrs))
    def handle_starttag(self, tag, attrs):
        self.tokens.append(("/".join(self.path), "<" + tag, self._attrs(attrs)))
        if tag not in VOID: self.path.append(tag)
    def handle_startendtag(self, tag, attrs):
        self.tokens.append(("/".join(self.path), "<" + tag, self._attrs(attrs)))
    def handle_endtag(self, tag):
        if tag in VOID: return
        # pop to the matching open tag (tolerates the implicit closes HTML allows)
        if tag in self.path:
            while self.path and self.path.pop() != tag: pass
        self.tokens.append(("/".join(self.path), "</" + tag, ()))
    def handle_data(self, data):
        t = " ".join(data.split())
        if t: self.tokens.append(("/".join(self.path), "#text", norm_refs(t)))
    def handle_comment(self, data):
        pass  # comments are authoring notes, not output
    def handle_decl(self, decl):
        self.tokens.append(("", "<!" + decl.lower(), ()))


def tokens(path):
    p = Tree()
    with open(path, encoding="utf-8") as f: p.feed(f.read())
    p.close()
    return p.tokens


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


def diff_page(a, b, maxn):
    ta, tb = tokens(a), tokens(b)
    out, i = [], 0
    for i, (x, y) in enumerate(zip(ta, tb)):
        if x[1:] != y[1:]:
            out.append(f"    token {i}\n      - {fmt(x)}\n      + {fmt(y)}")
            if len(out) >= maxn: break
    if not out and len(ta) != len(tb):
        n = min(len(ta), len(tb))
        extra, sign = (ta[n:], "-") if len(ta) > len(tb) else (tb[n:], "+")
        out.append(f"    {len(extra)} extra token(s) at the end of {'golden' if sign == '-' else 'new'}:\n      {sign} {fmt(extra[0])}")
    return out


def asset_digest(path):
    with open(path, "rb") as f: data = f.read()
    try: data = norm_refs(data.decode("utf-8")).encode("utf-8")
    except UnicodeDecodeError: pass
    return hashlib.sha256(data).hexdigest()[:16]


def main():
    ap = argparse.ArgumentParser(description="Parity check between two builds of the site.")
    ap.add_argument("golden"); ap.add_argument("new")
    ap.add_argument("--max", type=int, default=5, help="differences shown per page (default 5)")
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
            d = diff_page(pa[k], pb[k], maxn)
            if d: report(f"CHANGED  {k}\n" + "\n".join(d))
        else:
            with open(pa[k], "rb") as x, open(pb[k], "rb") as y:
                if x.read() != y.read(): report(f"CHANGED  {k} (bytes)")

    ca = Counter(asset_digest(v) for v in astro_a.values())
    cb = Counter(asset_digest(v) for v in astro_b.values())
    if ca != cb:
        by_a = {asset_digest(v): k for k, v in astro_a.items()}
        by_b = {asset_digest(v): k for k, v in astro_b.items()}
        for h in sorted((ca - cb).keys()): report(f"ASSET    only in golden: {by_a[h]}")
        for h in sorted((cb - ca).keys()): report(f"ASSET    only in new:    {by_b[h]}")

    pages = sum(k.endswith(".html") for k in pa)
    print(f"{pages} page(s), {len(pa) - pages} other file(s), {len(astro_a)} bundled asset(s) compared: "
          + ("identical" if not problems else f"{problems} difference(s)"))
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    main()
