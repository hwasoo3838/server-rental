const {chromium}=require('playwright');
const assert=require('node:assert/strict'),http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{let browser;const requests=[],errors=[];
 const server=http.createServer((req,res)=>{const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/\/$/,'/index.html'));if(!f.startsWith(root+path.sep))return res.writeHead(403).end();fs.readFile(f,(err,data)=>{if(err)return res.writeHead(404).end();res.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':'text/html');res.end(data);});});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 try{browser=await chromium.launch();const context=await browser.newContext();const page=await context.newPage();
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(r.method()!=='GET')requests.push(r.url());});
 await page.route('**/*',r=>new URL(r.request().url()).hostname==='127.0.0.1'?r.continue():r.abort());
 await page.goto(base+'/');await page.waitForSelector('.plan');if(await page.locator('.cookie-notice button').count())await page.locator('.cookie-notice button').click();
 assert.equal(await page.locator('.plan').count(),7);assert.equal(await page.locator('.a4000-trial-offer').count(),0);
 assert.match(await page.locator('.hero h1').innerText(),/NVIDIA RTX A4000\.[\s\S]*10-hour free GPU trial/);
 assert.doesNotMatch(await page.locator('.hero').innerText(),/AMD MI325X Reservations|Dedicated Hardware|Transparent Pricing/);
 assert.equal(await page.locator('.plan a[href="a4000-trial.html"]').count(),0);
 const card=page.locator('[data-id="elgrim-gfx-a4000"]');assert.match(await card.locator('h3').innerText(),/^NVIDIA RTX A4000/);assert.match(await card.innerText(),/\$199/);
 for(const width of [320,375,768,1440]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`homepage overflow ${width}`);}
 await card.screenshot({path:'/tmp/ellion-a4000-trial-card.png'});
 await page.locator('.hero').screenshot({path:'/tmp/ellion-a4000-trial-hero-desktop.png'});
 await page.setViewportSize({width:375,height:900});await page.locator('.hero').screenshot({path:'/tmp/ellion-a4000-trial-hero-mobile.png'});
 await page.locator('.hero-trial-button').click();await page.waitForURL('**/a4000-trial.html');
 const submit=page.locator('#trial-form button[type="submit"]');await submit.click();assert.equal(await page.locator('#trial-review').isVisible(),false);
 await page.fill('#trialEmail','trial@example.com');await page.fill('#trialName','Example & Co');await page.selectOption('#trialPurpose','CUDA development');await page.fill('#trialDetails','Evaluate inference & memory use with a small model.');
 await submit.click();assert.equal(await page.locator('#trial-review').isVisible(),false);
 await page.check('#trialConsent');await submit.click();await page.waitForSelector('#trial-review',{state:'visible'});
 const mail=new URL(await page.locator('#trialMailLink').getAttribute('href'));
 assert.equal(mail.pathname,'help@elliongpu.com');assert.match(mail.searchParams.get('subject'),/Free 10-hour trial application/);
 assert.match(mail.searchParams.get('body'),/Type: Free 10-hour GPU trial application/);assert.match(await page.locator('#review-title').innerText(),/not yet sent/);
 assert.doesNotMatch(await page.locator('#trialDraft').inputValue(),/Monthly Price:|Backup Plan:/);
 await page.fill('#trialSchedule','Tomorrow UTC+1');assert.equal(await page.locator('#trial-review').isVisible(),false);
 await submit.click();assert.match(new URL(await page.locator('#trialMailLink').getAttribute('href')).searchParams.get('body'),/Tomorrow UTC\+1/);
 for(const width of [320,375,768,1440]){await page.setViewportSize({width,height:1000});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`trial overflow ${width}`);}
 await page.screenshot({path:'/tmp/ellion-a4000-trial-desktop.png',fullPage:true});
 await page.setViewportSize({width:375,height:900});await page.screenshot({path:'/tmp/ellion-a4000-trial-mobile.png',fullPage:true});
 await page.reload();assert.equal(await page.locator('#trialEmail').inputValue(),'');assert.equal(await page.locator('#trial-review').isVisible(),false);
 assert.equal(await page.evaluate(()=>Object.keys(localStorage).some(k=>/trial|email/i.test(k))),false);
 assert.deepEqual(requests,[]);assert.deepEqual(errors,[]);
 console.log('PASS: hero-only trial CTA/old hero removed, NVIDIA title/7 products/$199 preserved, application validation/consent, email/review/edit invalidation, no PII persistence or POST, 320/375/768/1440px');
 }finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}
})().catch(e=>{console.error(e);process.exitCode=1;});
