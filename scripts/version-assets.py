"""Give the static CSS/JS URLs a content version before publishing."""
from hashlib import sha256
from pathlib import Path
import re

root = Path(__file__).resolve().parent.parent
page = root / 'index.html'
html = page.read_text()
for asset in ('styles/cinematic.css', 'styles/orbital-toolkit.css', 'components/ui/radial-orbital-timeline.js', 'js/portfolio.js'):
    version = sha256((root / asset).read_bytes()).hexdigest()[:12]
    pattern = rf'({re.escape(asset)})(?:\?[^"\s]*)?(?=")'
    html, count = re.subn(pattern, lambda match: f'{asset}?v={version}', html)
    if count != 1:
        raise ValueError(f'Expected one reference to {asset}; got {count}')
    print(f'{asset}: {version}')
page.write_text(html)
