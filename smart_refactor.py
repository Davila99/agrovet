import os
import re
import shutil
from pathlib import Path

frontend_dir = Path("src").resolve()

move_rules = [
    ("components/page/Chat.jsx", "features/chat/ChatPage.jsx"),
    ("components/page/chat", "features/chat/components/page"),
    ("components/organisms/chat", "features/chat/components/organisms"),
    ("components/molecules/chat", "features/chat/components/molecules"),
    ("components/atoms/chat", "features/chat/components/atoms"),
    ("hooks/chat", "features/chat/hooks"),
    ("services/chat", "features/chat/services_old"),
    ("services/endpoints/chat.js", "features/chat/services/chatApi.js"),
    ("services/adapters/chatAdapter.js", "features/chat/services/chatAdapter.js"),
    ("services/adapters/chatAdapter.test.js", "features/chat/services/chatAdapter.test.js"),
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
        if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
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

pattern = re.compile(r'(from\s*|import\s*)([\'"])((\.\./|\./)[^\'"]+)([\'"])')

def resolve_target(old_source_file, rel_import):
    target = (old_source_file.parent / rel_import).resolve()
    if target.is_file(): return target
    if target.with_suffix('.js').is_file(): return target.with_suffix('.js')
    if target.with_suffix('.jsx').is_file(): return target.with_suffix('.jsx')
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
            
print("Chat refactor complete.")
