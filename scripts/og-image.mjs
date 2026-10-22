// Renders the title screen at 1200×630 into icons/og.png, the preview image for shared links.
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const srv = await serve();
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(srv.url);
await page.evaluate(() => document.fonts.ready);
await page.addStyleTag({ content: '#legal,#howto,#record,.toggles,#installBtn,#appLink{display:none!important}' });
await page.waitForTimeout(1200);
await page.screenshot({ path: new URL('../icons/og.png', import.meta.url).pathname });
await browser.close(); srv.close();
console.log('icons/og.png written');
