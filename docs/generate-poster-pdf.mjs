import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DPI = 200;
const POSTER_W_IN = 48;
const POSTER_H_IN = 36;
const IMG_W = POSTER_W_IN * DPI;  // 9600
const IMG_H = POSTER_H_IN * DPI;  // 7200

const CSS_W = 1200;
const CSS_H = CSS_W * (POSTER_H_IN / POSTER_W_IN); // 900 (4:3)
const SCALE = IMG_W / CSS_W; // 8

(async () => {
  console.log(`Poster: ${POSTER_W_IN}"x${POSTER_H_IN}" at ${DPI} DPI = ${IMG_W}x${IMG_H}px`);
  console.log(`Viewport: ${CSS_W}x${CSS_H} @ ${SCALE}x deviceScaleFactor`);

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setViewport({
    width: CSS_W,
    height: CSS_H,
    deviceScaleFactor: SCALE,
  });

  const htmlPath = path.resolve(__dirname, 'trifold-poster.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

  // Wait for the CDN-loaded QR code SVG to appear
  await page.waitForFunction(() => {
    const c = document.getElementById('qr-container');
    return c && c.querySelector('svg');
  }, { timeout: 15000 });

  // Adjust layout so poster fills the viewport exactly
  await page.evaluate((w, h) => {
    const inst = document.querySelector('.instructions');
    if (inst) inst.remove();

    document.body.style.cssText = 'margin:0; padding:0; background:white; overflow:hidden;';
    document.documentElement.style.cssText = 'margin:0; padding:0;';

    const poster = document.querySelector('.poster');
    poster.style.cssText = `
      display: flex;
      width: ${w}px;
      height: ${h}px;
      max-width: none;
      border: none;
      border-radius: 0;
      overflow: hidden;
      margin: 0;
    `;

    document.querySelectorAll('.panel-left, .panel-right, .panel-center').forEach(el => {
      el.style.overflow = 'hidden';
    });
  }, CSS_W, CSS_H);

  // Small delay to let layout settle
  await new Promise(r => setTimeout(r, 500));

  const screenshot = await page.screenshot({
    type: 'png',
    clip: { x: 0, y: 0, width: CSS_W, height: CSS_H },
    omitBackground: false,
  });

  await browser.close();

  // Save the screenshot too for reference
  fs.writeFileSync(path.resolve(__dirname, 'poster-screenshot.png'), screenshot);
  console.log(`Screenshot: ${screenshot.length} bytes`);

  // Create the PDF at exact poster dimensions
  const pdfDoc = await PDFDocument.create();
  const img = await pdfDoc.embedPng(screenshot);

  // PDF uses points: 1 inch = 72 points
  const pageW = POSTER_W_IN * 72;  // 3456 pt
  const pageH = POSTER_H_IN * 72;  // 2592 pt

  const pdfPage = pdfDoc.addPage([pageW, pageH]);
  pdfPage.drawImage(img, {
    x: 0,
    y: 0,
    width: pageW,
    height: pageH,
  });

  const pdfBytes = await pdfDoc.save();
  const outPath = path.resolve(__dirname, 'bramble-poster-48x36.pdf');
  fs.writeFileSync(outPath, pdfBytes);

  console.log(`PDF: ${outPath}`);
  console.log(`PDF size: ${pdfBytes.length} bytes (${(pdfBytes.length / 1024 / 1024).toFixed(1)} MB)`);
  console.log(`Page: ${POSTER_W_IN}"x${POSTER_H_IN}" (${pageW}x${pageH} points)`);
  console.log('Done!');
})();
