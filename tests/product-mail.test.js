const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function boot(catalogue) {
  const elements = new Map(), posts = [], events = [];
  function element(dataset = {}) {
    const classes = new Set();
    return {
      dataset, value: '', selectedIndex: 0, innerHTML: '', textContent: '', style: {}, disabled: false,
      classList: { contains: c => classes.has(c), add: c => classes.add(c), remove: c => classes.delete(c), toggle(c, on) { on ? classes.add(c) : classes.delete(c); } },
      listeners: {}, addEventListener(event, fn) { this.listeners[event] = fn; },
      setAttribute(k, v) { this[k] = v; }, focus() {}, reset() {}, reportValidity: () => true
    };
  }
  const get = selector => {
    if (!elements.has(selector)) elements.set(selector, element());
    return elements.get(selector);
  };
  const buttons = ['ko', 'en'].map(lang => element({ lang }));
  const context = {
    URL, URLSearchParams, Intl, Date, console, AbortSignal,
    screen: { width: 1200, height: 800 }, navigator: {},
    location: { search: '?lang=en', href: 'http://localhost/?lang=en' },
    history: { replaceState() {} },
    localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
    setTimeout: () => 0, clearTimeout() {},
    fetch: async (url, options) => {
      if (options?.method === 'POST') posts.push(url);
      if (!catalogue) throw Error('offline');
      return { ok: true, json: async () => catalogue };
    },
    gtag: (...args) => events.push(args),
    IntersectionObserver: class { observe() {} },
    document: {
      documentElement: {}, referrer: '',
      body: { style: {}, appendChild(node) { (context.notices = context.notices || []).push(node); } },
      createElement: () => ({ ...element(), setAttribute() {}, querySelector: () => element() }),
      querySelector: get, querySelectorAll: s => s === '#langSeg button' ? buttons : [],
      getElementById: () => null, listeners: {},
      addEventListener(event, fn) { this.listeners[event] = fn; }
    },
    FormData: class {
      entries() {
        return [['type', get('#fType').value], ['serverId', get('#fServerId').value],
          ['serverName', get('#fServerName').value], ['email', 'test@example.invalid'], ['username', get('#fUsername').value]];
      }
    }
  };
  context.window = context;
  vm.createContext(context);
  for (const file of ['servers.js', 'i18n.js', 'network-snapshot.js', 'backup-pricing.js', 'app.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets', file), 'utf8'), context);
  }
  return {
    context, get, posts, events,
    open(id, type = 'request') { context.document.listeners.click({ preventDefault() {}, target: { closest: s => s === '[data-open]' ? { dataset: { open: type, server: id } } : null } }); },
    language(lang) { get('#langSeg').listeners.click({ target: { closest: () => buttons.find(button => button.dataset.lang === lang) } }); }
  };
}

const id = 'ellion-xeon-gold-6426y';
const card = app => app.get('#plans-grid').innerHTML.match(new RegExp('<article[^>]*data-id="' + id + '"[\\s\\S]*?</article>'))[0];
const tick = () => new Promise(resolve => setImmediate(resolve));

test('new product renders approved details and handles missing, present and unavailable sheet data', async () => {
  const missing = boot({ ok: true, servers: [], config: {} });
  await tick();
  for (const value of ['Intel Xeon Gold 6426Y', '16 Cores / 32 Threads', '62 GiB', '16 TB', '945.39', '944.47', '$299']) {
    assert.ok(card(missing).includes(value), value);
  }
  assert.match(card(missing), /class="status available"/);
  assert.doesNotMatch(card(missing), /Last Updated/);
  const listed = boot({ ok: true, servers: [{ id, status: 'soldout', priceUsd: 1 }], config: {} });
  await tick();
  assert.match(card(listed), /class="status soldout"/);
  assert.match(card(listed), /\$299/);
  const offline = boot(null);
  await tick();
  assert.match(card(offline), /class="status on-request"/);
});

test('request opens a priced email to the approved address without claiming delivery', async () => {
  const app = boot({ ok: true, servers: [], config: {} });
  await tick();
  app.open(id);
  assert.equal(app.get('#fUsername').required, true);
  assert.equal(app.get('#passwordPolicy').hidden, true);
  assert.equal(app.get('#usernameLabel').textContent, 'Preferred Login ID (Required)');
  app.get('#fUsername').value = 'customer01';
  app.get('#reqForm').listeners.submit({ preventDefault() {} });
  assert.equal(app.get('#mailDraft').hidden, true);
  const mail = new URL(app.context.location.href);
  assert.equal(mail.pathname, 'help@elliongpu.com');
  assert.match(mail.searchParams.get('body'), /Monthly Price: 299 USD/);
  assert.match(mail.searchParams.get('body'), /Preferred Login ID: customer01/);
  assert.equal(app.get('#formHint').hidden, true);
  assert.notEqual(app.get('#done').style.display, 'block');
  assert.deepEqual(app.posts, []);
  assert.deepEqual(app.events, []);
  assert.equal(app.get('#usernameLabel').textContent, 'Preferred Login ID (Required)');
  assert.equal(app.get('#submitBtn').textContent, 'Submit request');
});

test('reservation keeps optional login and the existing manual draft', async () => {
  const app = boot({ ok: true, servers: [], config: {} });
  await tick();
  app.open('elgrim-mi325x-8', 'reserve');
  assert.equal(app.get('#fUsername').required, false);
  assert.equal(app.get('#passwordPolicy').hidden, false);
  assert.equal(app.get('#usernameLabel').textContent, 'Preferred Login ID (Optional)');
  app.get('#reqForm').listeners.submit({ preventDefault() {} });
  assert.equal(app.get('#mailDraft').hidden, false);
  assert.match(new URL(app.get('#draftLink').href).searchParams.get('body'), /Reservation \(upcoming\)/);
  assert.equal(new URL(app.get('#draftLink').href).pathname, 'help@elliongpu.com');
  assert.notEqual(app.get('#done').style.display, 'block');
  assert.deepEqual(app.posts, []);
});

test('overseas site is English-only with unified contact email and privacy links', () => {
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.doesNotMatch(html, /data-lang="ko"|langSeg|class="statusbar"/);
  assert.match(html, /href="privacy\.html"/);
  assert.match(fs.readFileSync(path.join(root, 'privacy.html'), 'utf8'), /help@elliongpu\.com/);
  for (const f of ['index.html', 'privacy.html', 'assets/app.js', 'assets/servers.js', 'assets/i18n.js'])
    assert.doesNotMatch(fs.readFileSync(path.join(root, f), 'utf8'), /gmail\.com/);
});

test('cookie notice is shown once for first-time visitors', async () => {
  const app = boot({ ok: true, servers: [], config: {} });
  await tick();
  assert.equal(app.context.notices.length, 1);
});

// BACKUP-001: real manual-email application flow, with no external sends.
test('backup add-on combines server and backup on the monthly invoice request', () => {
  const app=boot(null);
  app.open('ellion-xeon-gold-6154-dual');
  assert.equal(app.get('#fBackupPlan').value,'none');
  app.get('#fBackupPlan').value='standard';
  app.get('#fBackupPlan').listeners.change();
  assert.match(app.get('#backupBillingSummary').textContent,/Monthly total: 200 USD/);
  app.get('#reqForm').listeners.submit({preventDefault(){}});
  const body=new URL(app.context.location.href).searchParams.get('body');
  assert.match(body,/Server Monthly Price: 175 USD/);
  assert.match(body,/Backup Monthly Price: 25 USD/);
  assert.match(body,/Combined Monthly Price: 200 USD/);
  assert.equal(app.posts.length,0);
  app.open('elgrim-gfx-a4000');
  assert.equal(app.get('#fBackupPlan').value,'none');
});
