import os
import re
from pathlib import Path

# Directory setup
frontend_dir = Path("src").resolve()

# List of precise directory/file moves
# Format: (old_relative_to_src, new_relative_to_src)
move_rules = [
    ("components/page/ForoPage.jsx", "features/foro/ForoPage.jsx"),
    ("components/page/Foro", "features/foro/components/page"),
    ("components/organisms/Foro", "features/foro/components/organisms"),
    ("components/molecules/Foro", "features/foro/components/molecules"),
    ("components/atoms/Foro", "features/foro/components/atoms"),
    ("hooks/Foro", "features/foro/hooks"),
    ("services/Foro", "features/foro/services_old"),
    ("services/endpoints/foro.js", "features/foro/services/foroApi.js"),
    ("styles/Foro", "features/foro/styles"),
    ("utils/Foro", "features/foro/utils"),
]

# 1. Map all individual files that are moving
moved_files = {} # old_abs_path -> new_abs_path

for old_rel, new_rel in move_rules:
    old_path = frontend_dir / old_rel
    new_path = frontend_dir / new_rel
    
    if old_path.is_file():
        moved_files[old_path] = new_path
    elif old_path.is_dir():
        for root, _, files in os.walk(old_path):
            for file in files:
                if file.endswith(('.js', '.jsx', '.ts', '.tsx', '.css')):
                    old_file = Path(root) / file
                    rel_to_old_dir = old_file.relative_to(old_path)
                    new_file = new_path / rel_to_old_dir
                    moved_files[old_file] = new_file

# 2. Get all JS/JSX files in the project
all_js_files = []
for root, _, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
            all_js_files.append(Path(root) / file)

# 3. Create directories and move files
os.makedirs(frontend_dir / "features" / "foro" / "components" / "page", exist_ok=True)
os.makedirs(frontend_dir / "features" / "foro" / "components" / "organisms", exist_ok=True)
os.makedirs(frontend_dir / "features" / "foro" / "components" / "molecules", exist_ok=True)
os.makedirs(frontend_dir / "features" / "foro" / "components" / "atoms", exist_ok=True)
os.makedirs(frontend_dir / "features" / "foro" / "hooks", exist_ok=True)
os.makedirs(frontend_dir / "features" / "foro" / "services_old", exist_ok=True)
os.makedirs(frontend_dir / "features" / "foro" / "services", exist_ok=True)
os.makedirs(frontend_dir / "features" / "foro" / "styles", exist_ok=True)
os.makedirs(frontend_dir / "features" / "foro" / "utils", exist_ok=True)

import shutil

for old_path, new_path in moved_files.items():
    if old_path.exists():
        os.makedirs(new_path.parent, exist_ok=True)
        shutil.move(str(old_path), str(new_path))

# Also move any non-js files in those folders just in case (like .css, .md)
for old_rel, new_rel in move_rules:
    old_path = frontend_dir / old_rel
    if old_path.is_dir() and old_path.exists():
        # anything left?
        pass

# We must map old files to new files so we know where everything IS NOW
# Current absolute path -> old absolute path
current_to_old = {}
for old, new in moved_files.items():
    current_to_old[new] = old

for f in all_js_files:
    if f not in moved_files:
        current_to_old[f] = f

# 4. Refactor imports
# Pattern to match import statements
pattern = re.compile(r'(from\s*|import\s*)([\'"])((\.\./|\./)[^\'"]+)([\'"])')

def resolve_target(old_source_file, rel_import):
    target = (old_source_file.parent / rel_import).resolve()
    # Try exact, then .js, .jsx
    if target.is_file(): return target
    if target.with_suffix('.js').is_file(): return target.with_suffix('.js')
    if target.with_suffix('.jsx').is_file(): return target.with_suffix('.jsx')
    if (target / 'index.js').is_file(): return target / 'index.js'
    if (target / 'index.jsx').is_file(): return target / 'index.jsx'
    
    # Check if target was moved (it might exist in moved_files keys)
    for old_path in moved_files.keys():
        if old_path.with_suffix('') == target or old_path == target:
            return old_path
        if target.name == old_path.parent.name and old_path.name.startswith('index'):
            return old_path
            
    return target # Best effort

for current_path, old_path in current_to_old.items():
    if not current_path.exists(): continue
    
    try:
        with open(current_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        continue
        
    def replacer(match):
        prefix = match.group(1)
        quote_open = match.group(2)
        rel_import = match.group(3)
        quote_close = match.group(5)
        
        # Where did this import historically point?
        old_target_path = resolve_target(old_path, rel_import)
        
        # Where is the target NOW?
        new_target_path = moved_files.get(old_target_path, old_target_path)
        
        # If neither the source nor the target moved, no change needed
        if current_path == old_path and new_target_path == old_target_path:
            return match.group(0)
            
        # Compute new relative path from current_path.parent to new_target_path
        try:
            rel = os.path.relpath(new_target_path, current_path.parent)
            rel = rel.replace('\\', '/')
            if not rel.startswith('.'):
                rel = './' + rel
            
            # Remove extension if it was omitted originally
            if not rel_import.endswith('.js') and not rel_import.endswith('.jsx'):
                if rel.endswith('.js') or rel.endswith('.jsx'):
                    rel = rel.rsplit('.', 1)[0]
                    
            return f"{prefix}{quote_open}{rel}{quote_close}"
        except ValueError:
            return match.group(0)

    new_content = pattern.sub(replacer, content)
    if new_content != content:
        with open(current_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
print("Refactor complete.")
