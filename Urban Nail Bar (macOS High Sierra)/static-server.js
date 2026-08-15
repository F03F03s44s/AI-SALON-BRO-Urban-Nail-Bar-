/**
 * AI Salon Pro - tiny static dev server (no dependencies)
 * Usage: npm run dev -- --port 7100 --host 127.0.0.1
 * Forwards CLI host/port arguments; defaults to port 7100.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
function argValue(flag, fallback) {
    const i = args.indexOf(flag);
    return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
}
const PORT = parseInt(argValue('--port', process.env.PORT || '7100'), 10);
const HOST = argValue('--host', process.env.HOST || '127.0.0.1');
const ROOT = __dirname;

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.bat': 'text/plain; charset=utf-8'
};

http.createServer((req, res) => {
    try {
        let urlPath = decodeURIComponent(req.url.split('?')[0]);
        if (urlPath === '/') urlPath = '/index.html';
        const filePath = path.normalize(path.join(ROOT, urlPath));
        if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }
        fs.readFile(filePath, (err, data) => {
            if (err) { res.writeHead(404); res.end('Not found'); return; }
            res.writeHead(200, {
                'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
                'Cache-Control': 'no-cache'
            });
            res.end(data);
        });
    } catch (e) {
        res.writeHead(500); res.end('Server error');
    }
}).listen(PORT, HOST, () => {
    console.log(`AI Salon Pro dev server running at http://${HOST}:${PORT}/`);
});
