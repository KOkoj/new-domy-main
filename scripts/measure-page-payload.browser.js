// Read-only: run in a local production page with agent-browser eval --stdin.
// Counts DOM elements in parsed server HTML, before hydration; bytes are uncompressed.
(async () => { const rows = []; for (const path of ['/', '/regions', '/properties']) {
    const response = await fetch(path, { cache: 'no-store' });
    const html = await response.text();
    const d = new DOMParser().parseFromString(html, 'text/html');
    const scripts = [...d.querySelectorAll('script[src]')].map(s => s.getAttribute('src'));
    let js = 0;
    for (const s of new Set(scripts)) {
        js += (await (await fetch(s, { cache: 'no-store' })).arrayBuffer()).byteLength;
    }
    rows.push({ path, status: response.status, htmlBytes: new TextEncoder().encode(html).length, domNodes: d.querySelectorAll('*').length, images: d.images.length, jsBytes: js, jsFiles: new Set(scripts).size, rscBytes: [...d.scripts].filter(s => s.textContent.includes('self.__next_f.push')).reduce((n, s) => n + new TextEncoder().encode(s.textContent).length, 0), propertyLinks: [...d.querySelectorAll('a[href^="/properties/"]')].map(a => a.getAttribute('href')), canonical: d.querySelector('link[rel=canonical]')?.href, title: d.title, description: d.querySelector('meta[name=description]')?.content, h1: [...d.querySelectorAll('h1')].map(h => h.textContent), editorial: (() => { const clone = d.body.cloneNode(true); clone.querySelectorAll('script,style,section.bg-gray-50.border-t.border-gray-100.py-16').forEach(n => n.remove()); return clone.textContent.replace(/\s+/g, ' ').trim(); })(), regionLinks: [...d.querySelectorAll('a[href^="/regions/"]')].map(a => a.getAttribute('href')), preloads: d.querySelectorAll('link[rel=preload][as=image]').length, schema: [...d.querySelectorAll('script[type="application/ld+json"]')].map(s => JSON.parse(s.textContent)) });
} return rows; })();
