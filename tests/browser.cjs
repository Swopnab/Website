const assert=require('node:assert/strict'),path=require('node:path');const {chromium}=require('playwright');const {serve}=require('./server.cjs');
(async()=>{const site=await serve(path.resolve(__dirname,'..'));const browser=await chromium.launch({headless:true});try{
for(const [width,height] of [[390,844],[768,1024],[1440,900]]){
 const c=await browser.newContext({viewport:{width,height},reducedMotion:'reduce'});await c.route('https://**/*',r=>r.abort());const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(site.url);
 assert.equal(await p.locator('.project-card').count(),4);assert.equal(await p.locator('.project-card h3').first().textContent(),'WORKLIKEADOG');assert.equal(await p.locator('.project-card h3').nth(2).textContent(),'MUSIC PLAYER');
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.equal(await p.locator('#intro-video').getAttribute('preload'),'none');
 const carousel=p.locator('#projects .squeeze-carousel');assert.equal(await carousel.locator('.squeeze-tab').count(),5);await carousel.getByRole('button',{name:'Next project'}).click();await carousel.getByRole('button',{name:'Next project'}).click();assert.match(await carousel.locator('.squeeze-detail').textContent(),/MUSIC PLAYER/);
 await p.getByRole('link',{name:/ENGINEERING NOTES/}).click();assert.match(await p.title(),/Engineering/);assert.equal(await p.locator('article').count(),4);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));assert.deepEqual(errors,[]);
 await c.close();
}
console.log('PASS portfolio original-project links, carousel navigation, engineering notes, deferred video and three responsive viewports without external assets');
}finally{await browser.close();site.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
