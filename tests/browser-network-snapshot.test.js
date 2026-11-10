/* Static local browser QA. Every external request is mocked or blocked. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const vm=require('node:vm');
const root=path.resolve(process.env.SNAPSHOT_SITE_ROOT||path.join(__dirname,'..'));
const before=process.env.SNAPSHOT_BEFORE_ROOT;
async function serve(directory){
 const server=http.createServer((req,res)=>{
  const file=path.resolve(directory,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));
  if(!file.startsWith(directory+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404).end();return;}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html');res.end(data);});
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));return server;
}
function catalogue(directory){const sandbox={window:{}};vm.runInNewContext(fs.readFileSync(path.join(directory,'assets/servers.js'),'utf8'),sandbox);return sandbox.window.SERVERS;}
(async()=>{
 const server=await serve(root);let prior=before?await serve(path.resolve(before)):null;let browser;
 try{
  const current=catalogue(root);
  if(before){const old=catalogue(before);assert.equal(current.length,old.length);for(let i=0;i<old.length;i++){const c=JSON.parse(JSON.stringify(current[i]));delete c.networkSnapshot;assert.deepEqual(c,JSON.parse(JSON.stringify(old[i])));}}
  browser=await chromium.launch({headless:true});const context=await browser.newContext({timezoneId:'America/New_York'});
  await context.route('**/*',async route=>{
   const req=route.request();if(new URL(req.url()).hostname==='127.0.0.1')return route.continue();
   if(req.url().includes('script.google.com')&&req.method()==='GET')return route.fulfill({json:{ok:true,servers:current,config:{}}});
   return route.abort();
  });
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  const url='http://127.0.0.1:'+server.address().port+'/';
  for(const lang of ['en','ko']){
   await page.setViewportSize({width:1280,height:900});await page.goto(url+'?lang='+lang);await page.waitForSelector('.plan');
   const card=page.locator('[data-id="elgrim-gfx-a4000"]'),panel=card.locator('.network-performance');
   const text=await panel.innerText();assert.match(text,/940\.29/);assert.match(text,/941\.31/);assert.match(text,/Last Updated: 2026-11-10 23:00/);
   assert.doesNotMatch(text,/MB\/s|Ping|패킷 손실|packet loss|iperf|speedtest|https?:/i);
   assert.equal(await panel.locator('.network-snapshot-metric').count(),2);
   assert.equal(await panel.locator('.network-snapshot-download .network-snapshot-arrow').evaluate(e=>getComputedStyle(e).color),'rgb(52, 211, 153)');
   assert.equal(await panel.locator('.network-snapshot-upload .network-snapshot-arrow').evaluate(e=>getComputedStyle(e).color),'rgb(96, 165, 250)');
   await panel.screenshot({path:'/tmp/ellion-a4000-'+lang+'-desktop.png'});
   await card.locator('[data-open]').click();assert.equal(await page.locator('#fServerId').inputValue(),'elgrim-gfx-a4000');await page.locator('#modal [data-close]').first().click();
   for(const width of [320,375]){
    await page.setViewportSize({width,height:812});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    const columns=await panel.locator('.network-snapshot-grid').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length);assert.equal(columns,2);
   }
   await panel.screenshot({path:'/tmp/ellion-a4000-'+lang+'-mobile.png'});
  }
  await page.goto(url+'?lang=en');await page.waitForSelector('.plan');
  for(const [id,down,up] of [['ellion-xeon-gold-6154-dual','943.79','941.24'],['ellion-web-db-6140','942.29','941.28']]){
   const panel=page.locator('[data-id="'+id+'"] .network-performance');const text=await panel.innerText();
   assert.ok(text.includes(down));assert.ok(text.includes(up));assert.match(text,/Last Updated: 2026-11-10 23:00/);assert.doesNotMatch(text,/Ping|MB\/s|packet loss|speedtest|https?:/i);
   assert.equal(await panel.locator('.network-snapshot-metric').count(),2);
   await panel.screenshot({path:'/tmp/ellion-network-'+id+'-preview.png'});
  }
  if(prior){
   const oldPage=await context.newPage();await page.goto(url+'?lang=en');await oldPage.goto('http://127.0.0.1:'+prior.address().port+'/?lang=en');await oldPage.waitForSelector('.plan');
   for(const product of current.filter(s=>!s.networkSnapshot))assert.equal(await page.locator('[data-id="'+product.id+'"]').innerText(),await oldPage.locator('[data-id="'+product.id+'"]').innerText());
  }
  assert.deepEqual(errors,[]);console.log('Snapshot Chromium PASS: exact fixed values/date, KO/EN, colors, 2 columns,320/375px,no forbidden fields,request modal,unchanged peer products.');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));if(prior)await new Promise(r=>prior.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
