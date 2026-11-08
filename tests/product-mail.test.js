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
      documentElement: {}, body: { style: {} }, referrer: '',
      querySelector: get, querySelectorAll: s => s === '#langSeg button' ? buttons : [],
      getElementById: () => null, listeners: {},
      addEventListener(event, fn) { this.listeners[event] = fn; }
    },
    FormData: class {
      entries() {
        return [['type', get('#fType').value], ['serverId', get('#fServerId').value],
          ['serverName', get('#fServerName').value], ['email', 'test@example.invalid']];
      }
    }
  };
  context.window = context;
  vm.createContext(context);
  for (const file of ['servers.js', 'i18n.js', 'network-snapshot.js', 'app.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets', file), 'utf8'), context);
  }
  return {
    context, get, posts, events,
    open(id) { context.document.listeners.click({ preventDefault() {}, target: { closest: s => s === '[data-open]' ? { dataset: { open: 'request', server: id } } : null } }); }
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

test('request prepares a priced email without sending or claiming a conversion', async () => {
  const app = boot({ ok: true, servers: [], config: {} });
  await tick();
  app.open(id);
  app.get('#reqForm').listeners.submit({ preventDefault() {} });
  assert.equal(app.get('#mailDraft').hidden, false);
  assert.match(new URL(app.get('#draftLink').href).searchParams.get('body'), /Monthly Price: 299 USD/);
  assert.notEqual(app.get('#done').style.display, 'block');
  assert.deepEqual(app.posts, []);
  assert.deepEqual(app.events, []);
  app.get('#reqForm').listeners.input();
  assert.equal(app.get('#mailDraft').hidden, true);
});
