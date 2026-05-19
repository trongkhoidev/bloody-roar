import os
import re

replacements = {
    r'bg-\[\#000(000)?\]': 'bg-bg-primary',
    r'bg-\[\#0a0a0a\]': 'bg-bg-secondary',
    r'bg-\[\#050505\]': 'bg-bg-tertiary',
    r'bg-\[\#111(111)?\]': 'bg-bg-tertiary',
    r'bg-\[\#171717\]': 'bg-bg-elevated',
    r'bg-\[\#1a1a1a\]': 'bg-bg-elevated',
    r'border-\[\#262626\]': 'border-border',
    r'border-\[\#333(333)?\]': 'border-border-light',
    r'border-\[\#404040\]': 'border-border-hover',
    r'text-\[\#a1a1aa\]': 'text-text-secondary',
    r'text-\[\#71717a\]': 'text-text-muted',
    r'text-\[\#e5e5e5\]': 'text-text-primary',
    r'text-\[\#ededed\]': 'text-text-primary',
    r'text-white': 'text-text-primary',
    r'hover:text-white': 'hover:text-text-primary',
    r'hover:bg-\[\#171717\]': 'hover:bg-bg-elevated',
    r'hover:bg-\[\#1a1a1a\]': 'hover:bg-bg-elevated',
    r'hover:bg-\[\#262626\]': 'hover:bg-bg-elevated',
}

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for pattern, repl in replacements.items():
        new_content = re.sub(pattern, repl, new_content)
        
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk('apps/web/src'):
    for file in files:
        if file.endswith(('.jsx', '.tsx', '.js', '.ts')):
            process_file(os.path.join(root, file))

