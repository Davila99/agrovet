import os
import re
import shutil
from pathlib import Path

frontend_dir = Path("src").resolve()

move_rules = [
    # Profiles
    ("components/page/profile", "features/profiles/components/page"),
    ("services/endpoints/profiles.js", "features/profiles/services/profilesApi.js"),
    ("services/adapters/profileAdapter.js", "features/profiles/services/profileAdapter.js"),
    ("services/adapters/profileAdapter.test.js", "features/profiles/services/profileAdapter.test.js"),
    ("__tests__/profiles.test.js", "features/profiles/__tests__/profiles.test.js"),

    # Marketplace (Add)
    ("components/atoms/add", "features/marketplace/components/atoms"),
    ("components/molecules/add", "features/marketplace/components/molecules"),
    ("components/organisms/add", "features/marketplace/components/organisms"),
    ("components/page/add", "features/marketplace/components/page"),
    ("components/page/AddPage.jsx", "features/marketplace/AddPage.jsx"),
    ("styles/add", "features/marketplace/styles"),
    ("services/endpoints/adds.js", "features/marketplace/services/addsApi.js"),
    ("services/adapters/addAdapter.js", "features/marketplace/services/addAdapter.js"),
    ("services/adapters/addAdapter.test.js", "features/marketplace/services/addAdapter.test.js"),
    ("__tests__/AddFormImagePicker.test.jsx", "features/marketplace/__tests__/AddFormImagePicker.test.jsx"),

    # AI
    ("components/page/AIAgent", "features/ai/components/page/AIAgent"),
    ("components/page/Orb", "features/ai/components/page/Orb"),
    ("components/atoms/Orb", "features/ai/components/atoms/Orb"),
    ("components/atoms/OrbButton", "features/ai/components/atoms/OrbButton"),
    ("components/molecules/Orb", "features/ai/components/molecules/Orb"),
    ("components/organisms/Orb", "features/ai/components/organisms/Orb"),
    ("styles/Orb", "features/ai/styles/Orb"),
    ("components/atoms/voice", "features/ai/components/atoms/voice"),
    ("components/molecules/voice", "features/ai/components/molecules/voice"),
    ("components/organisms/voice", "features/ai/components/organisms/voice"),
    ("services/voice", "features/ai/services/voice"),
    ("services/endpoints/ai.js", "features/ai/services/aiApi.js"),
    ("__tests__/AIAgentPage.test.jsx", "features/ai/__tests__/AIAgentPage.test.jsx"),
    ("components/ui/AVAIntro.jsx", "features/ai/components/ui/AVAIntro.jsx"),
]

moved_files = {}

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

all_js_files = []
for root, _, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith(('.js', '.jsx', '.ts', '.tsx', '.css')):
            all_js_files.append(Path(root) / file)

for old_path, new_path in moved_files.items():
    if old_path.exists():
        os.makedirs(new_path.parent, exist_ok=True)
        shutil.move(str(old_path), str(new_path))

current_to_old = {}
for old, new in moved_files.items():
    current_to_old[new] = old

for f in all_js_files:
    if f not in moved_files:
        current_to_old[f] = f

pattern_static = re.compile(r'(from\s*|import\s*)([\'"])((\.\./|\./)[^\'"]+)([\'"])')
pattern_dynamic = re.compile(r'(import\s*\(\s*)([\'"])((\.\./|\./)[^\'"]+)([\'"])')

def resolve_target(old_source_file, rel_import):
    target = (old_source_file.parent / rel_import).resolve()
    if target.is_file(): return target
    if target.with_suffix('.js').is_file(): return target.with_suffix('.js')
    if target.with_suffix('.jsx').is_file(): return target.with_suffix('.jsx')
    if target.with_suffix('.css').is_file(): return target.with_suffix('.css')
    if (target / 'index.js').is_file(): return target / 'index.js'
    if (target / 'index.jsx').is_file(): return target / 'index.jsx'
    
    for old_path in moved_files.keys():
        if old_path.with_suffix('') == target or old_path == target:
            return old_path
        if target.name == old_path.parent.name and old_path.name.startswith('index'):
            return old_path
            
    return target

for current_path, old_path in current_to_old.items():
    if not current_path.exists(): continue
    if current_path.suffix == '.css': continue # Don't rewrite css content for now, too risky with url()
    
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
        
        old_target_path = resolve_target(old_path, rel_import)
        new_target_path = moved_files.get(old_target_path, old_target_path)
        
        if current_path == old_path and new_target_path == old_target_path:
            return match.group(0)
            
        try:
            rel = os.path.relpath(new_target_path, current_path.parent)
            rel = rel.replace('\\', '/')
            if not rel.startswith('.'):
                rel = './' + rel
            
            if not rel_import.endswith('.js') and not rel_import.endswith('.jsx') and not rel_import.endswith('.css'):
                if rel.endswith('.js') or rel.endswith('.jsx') or rel.endswith('.css'):
                    rel = rel.rsplit('.', 1)[0]
                    
            return f"{prefix}{quote_open}{rel}{quote_close}"
        except ValueError:
            return match.group(0)

    new_content = pattern_static.sub(replacer, content)
    new_content = pattern_dynamic.sub(replacer, new_content)
    
    if new_content != content:
        with open(current_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
print("Final Refactor complete.")
