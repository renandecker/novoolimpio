import os
import re
import sys
import io

MODULES_ROOT = r"C:\Users\redru\OneDrive\Desktop\novo olimpio\microservices"
SRC_SUFFIX = os.path.join("src", "main", "java")

APPLY = "--apply" in sys.argv
ONLY_MODULES = None
for a in sys.argv:
    if a.startswith("--module="):
        ONLY_MODULES = a.split("=", 1)[1].split(",")


def strip_comments_and_strings(code):
    out = []
    i = 0
    n = len(code)
    while i < n:
        c = code[i]
        nxt = code[i + 1] if i + 1 < n else ""
        if c == "/" and nxt == "/":
            while i < n and code[i] != "\n":
                i += 1
            continue
        if c == "/" and nxt == "*":
            i += 2
            while i < n and not (code[i] == "*" and i + 1 < n and code[i + 1] == "/"):
                i += 1
            i += 2
            continue
        if c == '"':
            if nxt == '"' and i + 2 < n and code[i + 2] == '"':
                i += 3
                while i < n:
                    if code[i] == '"' and i + 2 < n and code[i + 1] == '"' and code[i + 2] == '"':
                        i += 3
                        break
                    i += 1
                continue
            i += 1
            while i < n:
                if code[i] == "\\":
                    i += 2
                    continue
                if code[i] == '"':
                    i += 1
                    break
                i += 1
            continue
        if c == "'":
            i += 1
            while i < n:
                if code[i] == "\\":
                    i += 2
                    continue
                if code[i] == "'":
                    i += 1
                    break
                i += 1
            continue
        out.append(c)
        i += 1
    return "".join(out)


KEYWORD = re.compile(r"\b(class|interface|enum|record)\b")


def find_top_level_types(code):
    types = []
    depth = 0
    i = 0
    n = len(code)
    idre = re.compile(r"[A-Za-z_$][A-Za-z0-9_$]*")
    while i < n:
        c = code[i]
        if c == "{":
            depth += 1
            i += 1
            continue
        if c == "}":
            depth -= 1
            i += 1
            continue
        m = KEYWORD.match(code, i)
        if m and depth == 0:
            j = m.end()
            while j < n and code[j] in " \t\r\n":
                j += 1
            nm = idre.match(code, j)
            if nm:
                types.append((m.group(1), nm.group(0), m.start()))
                i = nm.end()
                continue
        i += 1
    return types


def parse_imports(code):
    imports = []
    for m in re.finditer(r"^\s*import\s+(?:static\s+)?([\w.*]+)\s*;", code, re.MULTILINE):
        imports.append(m.group(1))
    return imports


def module_packages(module_dir):
    files = []
    base = os.path.join(module_dir, SRC_SUFFIX)
    if not os.path.isdir(base):
        return files
    for root, dirs, fnames in os.walk(base):
        for f in fnames:
            if f.endswith(".java"):
                files.append(os.path.join(root, f))
    return files


def build_class_map(files):
    class_map = {}
    for fpath in files:
        fname = os.path.splitext(os.path.basename(fpath))[0]
        with io.open(fpath, "r", encoding="utf-8", errors="replace") as fh:
            raw = fh.read()
        stripped = strip_comments_and_strings(raw)
        pkg_m = re.search(r"^\s*package\s+([\w.]+)\s*;", stripped, re.MULTILINE)
        pkg = pkg_m.group(1) if pkg_m else ""
        for kind, name, pos in find_top_level_types(stripped):
            if name == fname:
                if name not in class_map:
                    class_map[name] = []
                if pkg not in class_map[name]:
                    class_map[name].append(pkg)
    return class_map


def fix_file(fpath, class_map, report):
    with io.open(fpath, "r", encoding="utf-8", errors="replace") as fh:
        raw = fh.read()
    stripped = strip_comments_and_strings(raw)

    pkg_m = re.search(r"^\s*package\s+([\w.]+)\s*;", stripped, re.MULTILINE)
    pkg = pkg_m.group(1) if pkg_m else ""

    declared = {name for kind, name, pos in find_top_level_types(stripped)}
    imports = parse_imports(stripped)

    explicit = set()
    wildcards = set()
    for imp in imports:
        if imp.endswith(".*"):
            wildcards.add(imp[:-1])
        else:
            explicit.add(imp)

    missing = []
    for ident in re.findall(r"[A-Za-z_$][A-Za-z0-9_$]*", stripped):
        if ident not in class_map or ident in declared:
            continue
        pkgs = class_map[ident]
        if len(pkgs) != 1:
            continue
        tpkg = pkgs[0]
        if tpkg == pkg:
            continue
        if tpkg + "." + ident in explicit:
            continue
        if tpkg in wildcards:
            continue
        entry = (tpkg, ident)
        if entry not in missing:
            missing.append(entry)

    if not missing:
        return False

    report.append((fpath, missing))
    if not APPLY:
        return False

    lines = raw.split("\n")
    insert_at = None
    last_import_idx = None
    pkg_idx = None
    for idx, line in enumerate(lines):
        s = line.strip()
        if s.startswith("package ") and pkg_idx is None:
            pkg_idx = idx
        if s.startswith("import ") and (s.endswith(";") or ";" in s):
            last_import_idx = idx
    if last_import_idx is not None:
        insert_at = last_import_idx + 1
    elif pkg_idx is not None:
        insert_at = pkg_idx + 1
    else:
        insert_at = 0

    new_imports = ["import %s.%s;" % (tpkg, ident) for tpkg, ident in missing]
    new_imports.sort()
    lines[insert_at:insert_at] = new_imports
    with io.open(fpath, "w", encoding="utf-8", newline="") as fh:
        fh.write("\n".join(lines))
    return True


def main():
    total_files = 0
    total_missing = 0
    for mod in sorted(os.listdir(MODULES_ROOT)):
        mod_dir = os.path.join(MODULES_ROOT, mod)
        if not os.path.isdir(mod_dir):
            continue
        if ONLY_MODULES and mod not in ONLY_MODULES:
            continue
        files = module_packages(mod_dir)
        class_map = build_class_map(files)
        ambiguous = {k for k, v in class_map.items() if len(v) > 1}
        if ambiguous:
            print("[%s] ambiguous class names: %s" % (mod, ", ".join(sorted(ambiguous))))
        report = []
        fixed = 0
        for fpath in files:
            if fix_file(fpath, class_map, report):
                fixed += 1
        n_missing = sum(len(m) for _, m in report)
        total_files += len(files)
        total_missing += n_missing
        mode = "APPLIED" if APPLY else "REPORT"
        print("[%s] %s: %d files with missing imports (%d imports) of %d files" % (
            mod, mode, len(report), n_missing, len(files)))
        if not APPLY:
            for fpath, missing in report[:5]:
                rel = os.path.relpath(fpath, mod_dir)
                names = ", ".join("%s.%s" % m for m in missing[:4])
                print("    %s -> %s" % (rel, names))
            if len(report) > 5:
                print("    ... and %d more" % (len(report) - 5))
    print("TOTAL files=%d missing_imports=%d" % (total_files, total_missing))


if __name__ == "__main__":
    main()
