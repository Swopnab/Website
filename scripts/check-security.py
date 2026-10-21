"""Static release guardrails, not a penetration-test or security guarantee."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import json
import re
import subprocess

root = Path(__file__).resolve().parent.parent


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta_policy = ''
        self.inline_script = False
        self.errors = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if any(key.lower().startswith('on') for key in attrs):
            self.errors.append('Inline event handler found')
        if tag == 'script' and not attrs.get('src'):
            self.errors.append('Inline script found')
        if tag == 'script' and attrs.get('src') and urlsplit(attrs['src']).scheme:
            self.errors.append('Unexpected external script in source')
        if tag == 'meta' and attrs.get('http-equiv', '').lower() == 'content-security-policy':
            self.meta_policy = attrs.get('content', '')
        if attrs.get('target') == '_blank' and 'noopener' not in attrs.get('rel', '').split():
            self.errors.append('New-tab link without opener protection')
        for key in ('href', 'src', 'action'):
            value = attrs.get(key, '')
            if urlsplit(value).scheme not in ('', 'https', 'mailto'):
                self.errors.append(f'Unexpected URL protocol in {key}')


page = Page()
page.feed((root / 'index.html').read_text())
config = json.loads((root / 'vercel.json').read_text())
headers = {h['key'].lower(): h['value'] for group in config['headers'] if group['source'] == '/(.*)' for h in group['headers']}
policy = headers.get('content-security-policy', '')
for directive in ("default-src 'self'", "script-src-attr 'none'", "object-src 'none'", "base-uri 'self'", "form-action 'none'", "frame-src 'none'"):
    if directive not in policy or directive not in page.meta_policy:
        page.errors.append(f'Missing enforced directive: {directive}')
if "'unsafe-inline'" in re.search(r'(?:^|;)\s*script-src\s+([^;]+)', policy).group(1):
    page.errors.append('Inline scripts allowed by policy')
if "'unsafe-eval'" in policy:
    page.errors.append('Dynamic code evaluation allowed')
if "frame-ancestors 'none'" not in policy:
    page.errors.append('Missing embedding restriction')
for name in ('permissions-policy', 'referrer-policy', 'strict-transport-security', 'x-content-type-options', 'x-frame-options'):
    if name not in headers:
        page.errors.append(f'Missing response header: {name}')
secret = re.compile(r'(?:sk-[A-Za-z0-9_-]{25,}|ghp_[A-Za-z0-9]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)')
tracked = subprocess.check_output(['git', 'ls-files'], cwd=root, text=True).splitlines()
for filename in tracked:
    if re.search(r'(^|/)(\.env(?:\..*)?|id_rsa|id_ed25519)$', filename):
        page.errors.append(f'Potential private configuration tracked: {filename}')
    path = root / filename
    if path.suffix in ('.html', '.js', '.json') and path.is_file() and secret.search(path.read_text()):
        page.errors.append(f'Potential secret in {filename}; inspect privately')
if page.errors:
    raise SystemExit('\n'.join(page.errors))
print('Static security guardrails passed: CSP, safe links, browser capability restrictions, and tracked-secret patterns.')
