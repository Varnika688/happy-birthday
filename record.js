const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

(async ()=>{
  const outDir = path.join(__dirname, 'videos');
  if(!fs.existsSync(outDir)) fs.mkdirSync(outDir);

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: outDir, size: { width: 1280, height: 720 } }
  });
  const page = await context.newPage();

  const fileUrl = 'file://' + path.resolve(__dirname, 'byVARNIKA<!DOCTYPE html>.html');
  console.log('Opening', fileUrl);
  await page.goto(fileUrl);

  // Interact: open envelope
  await page.waitForSelector('.envelope');
  await page.click('.envelope');
  await page.waitForTimeout(800);

  // Move to cake scene and blow
  await page.waitForSelector('#blowBtn');
  await page.click('#blowBtn');
  await page.waitForTimeout(2200);

  // close context to flush video
  await context.close();
  await browser.close();

  // find the generated video file
  const files = fs.readdirSync(outDir).filter(f=>f.endsWith('.webm')||f.endsWith('.mkv')||f.endsWith('.mp4'));
  if(files.length===0){
    console.error('No video file produced in', outDir);
    process.exit(1);
  }
  // pick most recent
  const file = files.map(f=>({f, m:fs.statSync(path.join(outDir,f)).mtime})).sort((a,b)=>b.m - a.m)[0].f;
  const src = path.join(outDir, file);
  const dest = path.join(__dirname, 'happy-birthday.webm');
  fs.copyFileSync(src, dest);
  console.log('Saved video to', dest);
})();
