import os
import re
import sys

BASE_DIR = r"C:\Users\redru\OneDrive\Desktop\novo olimpio\microservices\basico\src\main\java\br\com\sol7\olimpio\basico"
BASE_PKG = "br.com.sol7.olimpio.basico"

# Step 1: Scan all Java files and build a map of class name -> correct package
class_map = {}  # className -> correct_package
file_list = []

for root, dirs, files in os.walk(BASE_DIR):
    for fname in files:
        if not fname.endswith(".java"):
            continue
        fpath = os.path.join(root, fname)
        file_list.append(fpath)

        # Compute correct package from path
        rel = os.path.relpath(fpath, BASE_DIR)
        parts = rel.split(os.sep)
        # Remove the filename
        pkg_parts = parts[:-1]
        # The last part before the filename is the subdirectory (entity, repository, etc.)
        # The package is br.com.sol7.olimpio.basico + all subdirectory parts
        correct_pkg = BASE_PKG + "." + ".".join(pkg_parts)

        # Extract class name from file
        with open(fpath, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()

        # Find class/interface/enum/record declaration
        m = re.search(r'(?:public\s+)?(?:class|interface|enum|record)\s+(\w+)', content)
        if m:
            class_name = m.group(1)
            class_map[class_name] = correct_pkg

print(f"Found {len(class_map)} classes in {len(file_list)} files")

# Step 2: Fix each file
fixed_count = 0
for fpath in file_list:
    with open(fpath, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()

    original = content

    # Compute correct package from path
    rel = os.path.relpath(fpath, BASE_DIR)
    parts = rel.split(os.sep)
    pkg_parts = parts[:-1]
    correct_pkg = BASE_PKG + "." + ".".join(pkg_parts)

    # Fix package declaration
    content = re.sub(
        r'^package\s+br\.com\.sol7\.olimpio\.basico\.[A-Za-z0-9_]+;',
        f"package {correct_pkg};",
        content,
        count=1,
        flags=re.MULTILINE
    )

    # Fix imports of br.com.sol7.olimpio.basico classes
    def fix_import(m):
        import_line = m.group(0)
        # Extract the class name from the import
        m2 = re.search(r'import\s+br\.com\.sol7\.olimpio\.basico\.([^;]+);', import_line)
        if not m2:
            return import_line
        import_path = m2.group(1)
        # The last part is the class name
        import_parts = import_path.split(".")
        class_name = import_parts[-1]

        # Check if we know the correct package for this class
        if class_name in class_map:
            correct_pkg_for_class = class_map[class_name]
            return f"import {correct_pkg_for_class}.{class_name};"
        return import_line

    content = re.sub(
        r'^import\s+br\.com\.sol7\.olimpio\.basico\.[A-Za-z0-9_.]+;',
        fix_import,
        content,
        flags=re.MULTILINE
    )

    if content != original:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        fixed_count += 1

print(f"Fixed {fixed_count} files")