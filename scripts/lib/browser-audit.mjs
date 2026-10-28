import { createServer } from 'node:http';
import { spawnSync, spawn } from 'node:child_process';
import { existsSync, readFileSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, extname, sep, win32, isAbsolute } from 'node:path';
import { pagesConfig } from './pages-config.mjs';

const DEFAULT_ROUTES = [
  '/', '/concept-index/', '/about/',
  '/programming-language-concepts/idiomatic-programming/',
  '/concurrency-parallelism/atomic-operation/',
  '/distributed-systems/idempotency/',
  '/type-systems/type-inference/',
  '/functional-programming/pure-function/',
  '/oop-design-patterns/observer-pattern/',
  '/operating-systems-memory/virtual-memory/',
  '/io-networking/input-output/',
  '/databases-transactions/transaction-isolation-levels/',
  '/compilers-runtimes/abstract-syntax-tree/',
  '/http-api-integration/http-method-semantics/',
  '/data-structures-algorithms/bloom-filter/',
  '/testing-verification/mutation-testing/',
];
const SEARCHES = [
  ['idiomatic', '/programming-language-concepts/idiomatic-programming/'],
  ['atomic operation', '/concurrency-parallelism/atomic-operation/'],
  ['idempotency', '/distributed-systems/idempotency/'],
  ['type inference', '/type-systems/type-inference/'],
  ['pure function', '/functional-programming/pure-function/'],
  ['observer pattern', '/oop-design-patterns/observer-pattern/'],
  ['virtual memory', '/operating-systems-memory/virtual-memory/'],
  ['input output', '/io-networking/input-output/'],
  ['transaction isolation levels', '/databases-transactions/transaction-isolation-levels/'],
  ['abstract syntax tree', '/compilers-runtimes/abstract-syntax-tree/'],
  ['http method semantics', '/http-api-integration/http-method-semantics/'],
  ['bloom filter', '/data-structures-algorithms/bloom-filter/'],
  ['mutation testing', '/testing-verification/mutation-testing/'],
];
const PILOT_TITLES = new Map([
  ['/programming-language-concepts/idiomatic-programming/', 'Idiomatic Programming'],
  ['/concurrency-parallelism/atomic-operation/', 'Atomic Operation'],
  ['/distributed-systems/idempotency/', 'Idempotency'],
  ['/type-systems/type-inference/', 'Type Inference'],
  ['/functional-programming/pure-function/', 'Pure Function'],
  ['/oop-design-patterns/observer-pattern/', 'Observer Pattern'],
  ['/operating-systems-memory/virtual-memory/', 'Virtual Memory'],
  ['/io-networking/input-output/', 'Input/Output (I/O)'],
  ['/databases-transactions/transaction-isolation-levels/', 'Transaction Isolation Levels'],
  ['/compilers-runtimes/abstract-syntax-tree/', 'Abstract Syntax Tree (AST)'],
  ['/http-api-integration/http-method-semantics/', 'HTTP Method Semantics'],
  ['/data-structures-algorithms/bloom-filter/', 'Bloom Filter'],
  ['/testing-verification/mutation-testing/', 'Mutation Testing'],
]);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// The HTML must visibly communicate editorial status and provide inspectable evidence;
// checking that a route returned HTTP 200 alone is not sufficient.
export function validatePilotPage(page, expectedTitle) {
  const errors = [];
  if (page.title !== expectedTitle) errors.push(`expected heading ${expectedTitle}, got ${page.title ?? '<missing>'}`);
  if (page.hasDraftNotice !== true) errors.push('missing editorial draft notice');
  if (page.hasReferences !== true) errors.push('missing References heading');
  if (page.hasCodeSample !== true) errors.push('missing code example');
  if (!Number.isInteger(page.externalSourceLinks) || page.externalSourceLinks < 1) errors.push('missing external source link');
  return errors;
}


// Browser teardown must not hide the actionable result of a navigation/search failure.
export function cleanupBrowserProfile(profile, remove = rmSync) {
  try {
    remove(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
    return null;
  } catch (error) {
    return `${error.code ?? 'CLEANUP_FAILED'}: ${error.message}`;
  }
}

// Windows installations are normally outside PATH; support standard Chrome/Edge paths.
export function browserCandidates(env = process.env, platform = process.platform) {
  const paths = [env.CHROME_BIN];
  if (platform === 'win32') {
    for (const base of [env.ProgramFiles, env['PROGRAMFILES(X86)']].filter(Boolean)) {
      paths.push(win32.join(base, 'Google', 'Chrome', 'Application', 'chrome.exe'));
      paths.push(win32.join(base, 'Microsoft', 'Edge', 'Application', 'msedge.exe'));
    }
    if (env.LOCALAPPDATA) paths.push(win32.join(env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe'));
    paths.push('chrome.exe', 'msedge.exe');
  } else {
    paths.push('/usr/bin/chromium', '/usr/bin/google-chrome', '/opt/google/chrome/chrome', 'chromium', 'google-chrome', 'chrome');
  }
  return [...new Set(paths.filter(Boolean))];
}

export function findBrowser() {
  for (const path of browserCandidates()) {
    if ((isAbsolute(path) || win32.isAbsolute(path)) && !existsSync(path)) continue;
    const found = spawnSync(path, ['--version'], { encoding: 'utf8', timeout: 2000 });
    if (found.status === 0) return path;
  }
  return null;
}

function serveDist(root, basePath = '') {
  const base = resolve(root);
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.wasm': 'application/wasm', '.png': 'image/png' };
  const server = createServer((req, res) => {
    let path;
    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
      if (basePath && pathname !== basePath && !pathname.startsWith(`${basePath}/`)) { res.writeHead(404).end('Outside site base'); return; }
      const sitePath = basePath ? pathname.slice(basePath.length) || '/' : pathname;
      path = resolve(base, '.' + sitePath);
    } catch { res.writeHead(400).end(); return; }
    if (path !== base && !path.startsWith(base + sep)) { res.writeHead(403).end(); return; }
    if (!existsSync(path)) { res.writeHead(404).end('Not found'); return; }
    if (statSync(path).isDirectory()) path = join(path, 'index.html');
    if (!existsSync(path) || !statSync(path).isFile()) { res.writeHead(404).end('Not found'); return; }
    res.setHeader('Content-Type', types[extname(path)] ?? 'application/octet-stream');
    res.end(readFileSync(path));
  });
  return server;
}

async function until(fn, label, ms = 12000) {
  const stop = Date.now() + ms;
  let last;
  while (Date.now() < stop) {
    try { const value = await fn(); if (value) return value; }
    catch (err) { last = err; }
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${label}${last ? `: ${last.message}` : ''}`);
}

async function openDevTools(chrome) {
  const profile = mkdtempSync(join(tmpdir(), 'atlas-chromium-'));
  const proc = spawn(chrome, [
    '--headless=new', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
    '--no-first-run', '--no-default-browser-check', '--remote-allow-origins=*',
    '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' });
  try {
    const portFile = join(profile, 'DevToolsActivePort');
    const port = await until(() => existsSync(portFile) && readFileSync(portFile, 'utf8').split('\n')[0], 'Chromium DevTools port');
    const tabs = await until(async () => {
      const response = await fetch(`http://127.0.0.1:${port}/json/list`);
      const items = await response.json();
      return items.find(item => item.type === 'page' && item.webSocketDebuggerUrl);
    }, 'Chromium tab');
    return { proc, profile, url: tabs.webSocketDebuggerUrl };
  } catch (err) {
    proc.kill('SIGKILL');
    const warning = cleanupBrowserProfile(profile);
    if (warning) console.warn(`Chromium startup cleanup warning: ${warning}`);
    throw err;
  }
}

function makeCdp(url) {
  const ws = new WebSocket(url);
  const pending = new Map();
  let id = 0;
  ws.addEventListener('message', event => {
    let response;
    try { response = JSON.parse(event.data); } catch { return; }
    if (!response.id || !pending.has(response.id)) return;
    const { resolve, reject } = pending.get(response.id); pending.delete(response.id);
    if (response.error) reject(new Error(JSON.stringify(response.error)));
    else resolve(response.result);
  });
  ws.addEventListener('close', () => { for (const { reject } of pending.values()) reject(new Error('DevTools connection closed')); pending.clear(); });
  const opened = new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', reject, { once: true });
  });
  return {
    async send(method, params = {}) {
      await opened;
      const requestId = ++id;
      return new Promise((resolve, reject) => {
        pending.set(requestId, { resolve, reject });
        ws.send(JSON.stringify({ id: requestId, method, params }));
      });
    },
    close() { ws.close(); },
  };
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
  if (result.exceptionDetails) throw new Error(`Browser exception: ${result.exceptionDetails.text} ${result.exceptionDetails.exception?.description ?? ''}`);
  return result.result?.value;
}

async function navigate(cdp, url, route, basePath = '') {
  const nav = await cdp.send('Page.navigate', { url: `${url}${basePath}${route}` });
  if (nav.errorText) throw new Error(`${route}: browser navigation error ${nav.errorText}`);
  const page = await until(async () => {
    const result = await evaluate(cdp, '({ready: document.readyState, path: location.pathname, heading: document.querySelector("h1")?.textContent?.trim() ?? "", main: Boolean(document.querySelector("main"))})');
    return result?.ready === 'complete' && result.path === `${basePath}${route}` && result.heading && result.main ? result : null;
  }, `page ${route}`);
  return page;
}

export async function runBrowserAudit(distRoot, { routes = DEFAULT_ROUTES, basePath = pagesConfig().base } = {}) {
  if (!existsSync(join(distRoot, 'index.html'))) throw new Error('Missing static site: build first');
  const chrome = findBrowser();
  if (!chrome) throw new Error('Chromium/Chrome not found; set CHROME_BIN');
  const server = serveDist(distRoot, basePath);
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  let browser, cdp;
  try {
    browser = await openDevTools(chrome);
    cdp = makeCdp(browser.url);
    await cdp.send('Page.enable');
    await cdp.send('Runtime.enable');
    let pilotPagesChecked = 0;
    for (const route of routes) {
      await navigate(cdp, baseUrl, route, basePath);
      const expectedTitle = PILOT_TITLES.get(route);
      if (!expectedTitle) continue;
      const page = await evaluate(cdp, `(() => {
        const main = document.querySelector('main');
        const content = main?.textContent ?? '';
        return {
          title: main?.querySelector('h1')?.textContent?.trim() ?? '',
          hasDraftNotice: content.includes('Editorial preview') && content.includes('not approved for publication'),
          hasReferences: [...(main?.querySelectorAll('h2') ?? [])].some(h => h.textContent?.trim().startsWith('References')),
          hasCodeSample: Boolean(main?.querySelector('pre code, .expressive-code')),
          externalSourceLinks: main?.querySelectorAll('a[href^="https://"]').length ?? 0,
        };
      })()`);
      const errors = validatePilotPage(page ?? {}, expectedTitle);
      if (errors.length) throw new Error(`${route}: pilot article audit failed: ${errors.join('; ')}`);
      pilotPagesChecked++;
    }
    if (pilotPagesChecked !== PILOT_TITLES.size) {
      throw new Error(`Expected ${PILOT_TITLES.size} pilot articles in browser routes; checked ${pilotPagesChecked}`);
    }
    await navigate(cdp, baseUrl, '/', basePath);
    for (const [term, expected] of SEARCHES) {
      const actual = await evaluate(cdp, `(async () => {
        const pagefind = await import(${JSON.stringify(`${basePath}/pagefind/pagefind.js`)});
        const result = await pagefind.search(${JSON.stringify(term)});
        return await Promise.all((result.results || []).slice(0, 10).map(entry => entry.data()));
      })()`);
      if (!actual?.some(item => new URL(item.url, locationStub).pathname === `${basePath}${expected}`)) {
        throw new Error(`Pagefind search for ${term} did not return ${expected} in first 10 results`);
      }
    }
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 375, height: 812, deviceScaleFactor: 1, mobile: true });
    await navigate(cdp, baseUrl, '/', basePath);
    const mobile = await evaluate(cdp, '({innerWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth})');
    if (mobile.scrollWidth > mobile.innerWidth + 2) throw new Error(`Mobile horizontal layout overflow: ${mobile.scrollWidth} > ${mobile.innerWidth}`);
    return { pagesChecked: routes.length, pilotPagesChecked, searchesChecked: SEARCHES.length, mobileWidth: mobile.innerWidth, mobileScrollWidth: mobile.scrollWidth, basePath, browser: chrome };
  } finally {
    if (cdp) cdp.close();
    if (browser) {
      if (browser.proc.exitCode === null) {
        browser.proc.kill('SIGKILL');
        await Promise.race([new Promise(resolve => browser.proc.once('exit', resolve)), sleep(3000)]);
      }
      const cleanupError = cleanupBrowserProfile(browser.profile);
      if (cleanupError) console.warn(`Chromium profile cleanup warning: ${cleanupError}`);
    }
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
}

// A constant base is sufficient when interpreting local Pagefind result URLs.
const locationStub = 'https://atlas.invalid/';
