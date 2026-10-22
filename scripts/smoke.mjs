// Loads the built web app in Chromium and fails on console errors, requests to other hosts,
// missing fonts or legal pages, a broken game start or a game that does not start offline.
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const srv = await serve();
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const problems = [];
const check = (ok, msg) => { if (!ok) problems.push(msg); };

for (const viewport of [{ width: 390, height: 844 }, { width: 1366, height: 768 }]) {
  const ctx = await browser.newContext({ viewport }), page = await ctx.newPage(), tag = `${viewport.width}×${viewport.height}`;
  page.on('pageerror', e => problems.push(`${tag}: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error') problems.push(`${tag}: ${m.text()}`); });
  page.on('request', r => { if (!r.url().startsWith(srv.url) && !r.url().startsWith('data:')) problems.push(`${tag}: fremder Host ${r.url()}`); });

  await page.goto(srv.url);
  await page.evaluate(() => document.fonts.ready);
  check(await page.evaluate(() => document.fonts.check('16px "Bagel Fat One"') && document.fonts.check('800 16px "Bricolage Grotesque"')), `${tag}: Schriften nicht geladen`);
  check(await page.isVisible('#legal'), `${tag}: Impressum-Links fehlen`);
  await page.click('#startBtn');
  // Pause only works once the level is playable, after the intro transition.
  for (let i = 0; i < 20 && !(await page.isVisible('#pause')); i++) { await page.waitForTimeout(250); await page.click('#pauseBtn'); }
  check(/^Szene \d+-\d+$/.test(await page.textContent('#pauseScene')), `${tag}: keine Szenen-Kennung in der Pause`);

  for (const f of ['impressum.html', 'datenschutz.html']) {
    const res = await page.goto(srv.url + f);
    check(res.ok() && await page.isVisible('h1'), `${tag}: ${f} fehlt`);
  }

  // Offline: once the service worker has cached the shell, the game must start without network.
  await page.goto(srv.url);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForTimeout(500);
  await ctx.setOffline(true);
  await page.reload();
  check(await page.isVisible('#startBtn'), `${tag}: startet offline nicht`);
  await ctx.close();
}
await browser.close(); srv.close();

if (problems.length) { console.log(problems.join('\n')); process.exit(1); }
console.log('Smoke-Test ok.');
