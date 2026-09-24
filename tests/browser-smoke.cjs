// Run: npm exec --yes --package=playwright -- node tests/browser-smoke.cjs
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const candidate = process.env.PATH.split(path.delimiter).map(p => path.resolve(p, '../playwright/index.js')).find(p => fs.existsSync(p));
if (!candidate) throw new Error('Run with npm exec --package=playwright.');
const { chromium } = require(candidate);

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    const page = await browser.newPage({viewport:{width:1280,height:900}});
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://localhost:3000/');
    await page.getByRole('switch',{name:'Use dark mode'}).waitFor();
    assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
    const origin=await page.evaluate(()=>performance.timeOrigin);
    await page.getByRole('switch',{name:'Use dark mode'}).click();
    await page.locator('a.practice-button[href="/play/drill"]').click();
    await page.getByRole('button',{name:'Start game',exact:true}).waitFor();
    assert.equal(await page.evaluate(()=>performance.timeOrigin),origin);
    assert.equal(await page.locator('html').getAttribute('data-theme'),'dark');
    await page.getByRole('button',{name:'Start game',exact:true}).click();
    await page.locator('.heat-meter').waitFor();
    await page.getByRole('button',{name:'Faster'}).click();
    await page.waitForFunction(()=>Number(document.querySelector('.drill-instruments meter')?.value)>0);
    assert.ok(Number(await page.locator('.drill-instruments meter').first().getAttribute('value'))>0);
    const drilling=await page.evaluate(async()=>{
      const wait=ms=>new Promise(r=>setTimeout(r,ms));
      const key=(type,key)=>window.dispatchEvent(new KeyboardEvent(type,{key,bubbles:true}));
      for(let i=0;i<3;i++){key('keydown','d');await wait(30);key('keyup','d');await wait(30);}
      let held=false;const start=performance.now();
      while(performance.now()-start<28000){
        await wait(25);
        const result=document.querySelector('.run-result');
        if(result){key('keyup','w');return result.innerText;}
        const push=document.querySelector('.heat-meter').value<.16;
        if(push!==held){key(push?'keydown':'keyup','w');held=push;}
      }
      key('keyup','w');return 'Timed out';
    });
    assert.match(drilling,/Complete/);
    console.log('Drill successful:',drilling.replace(/\n+/g,' | '));
    await page.getByRole('link',{name:'Back to games',exact:false}).click();
    await page.locator('a.practice-button[href="/play/data"]').click();
    assert.equal(await page.getByLabel('Bar speed').inputValue(),'5');
    assert.deepEqual(await page.getByLabel('Bar speed').locator('option').evaluateAll(options=>options.map(option=>Number(option.value))),[5,6,7,8,9,10]);
    await page.getByRole('button',{name:'Start game',exact:true}).click();
    await page.locator('.data-pc').waitFor();
    const geometry=await page.evaluate(()=>{
      const box=document.querySelector('.data-pc').getBoundingClientRect();
      const pieces=document.querySelectorAll('.split-bar i');
      return {ratio:box.width/box.height,bar:pieces[0].getBoundingClientRect().height/box.height,gap:(pieces[1].getBoundingClientRect().top-pieces[0].getBoundingClientRect().bottom)/box.height};
    });
    assert.ok(Math.abs(geometry.ratio-1472/825)<.01);
    assert.ok(Math.abs(geometry.bar-.138)<.005);
    assert.ok(Math.abs(geometry.gap-.036)<.005);
    await page.locator('.data-field').click();
    await page.locator('.run-result.failure').waitFor();
    assert.match(await page.locator('.run-result.failure').innerText(),/First bar missed/);
    await page.getByRole('switch').click();
    await page.getByRole('link',{name:'Back to games',exact:false}).click();
    await page.locator('a.practice-button[href="/play/data"]').waitFor();
    assert.equal(await page.locator('html').getAttribute('data-theme'),'light');
    assert.equal(await page.evaluate(()=>performance.timeOrigin),origin);
    await page.setViewportSize({width:390,height:844});
    await page.locator('a.practice-button[href="/play/data"]').click();
    await page.getByRole('button',{name:'Start game',exact:true}).click();
    await page.locator('.data-pc').waitFor();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await page.keyboard.press('Escape');
    await page.getByRole('link',{name:'Back to games',exact:false}).click();
    await page.getByRole('link',{name:'View All Videos'}).click();
    await page.waitForURL('**/videos');
    await page.getByRole('heading',{name:'Video Guides'}).waitFor();
    assert.equal(await page.locator('.gallery-card').count(),4);
    assert.equal(await page.evaluate(()=>performance.timeOrigin),origin);
    assert.deepEqual(errors,[]);
    console.log('PASS: themes, client navigation, mouse drill, drill completion, Data Crack speed 5 and first miss, video gallery, mobile overflow, no runtime errors.');
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
