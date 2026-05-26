import puppeteer from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DPI = 300;
const W_IN = 8.5;
const H_IN = 11;
const CSS_W = 816;  // 8.5 * 96
const CSS_H = 1056; // 11 * 96
const SCALE = Math.round((W_IN * DPI) / CSS_W); // ~3

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  await page.setViewport({ width: CSS_W, height: CSS_H, deviceScaleFactor: SCALE });

  const htmlPath = path.resolve(__dirname, 'qr-handout.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 15000 });

  await new Promise(r => setTimeout(r, 300));

  const screenshot = await page.screenshot({
    type: 'png',
    clip: { x: 0, y: 0, width: CSS_W, height: CSS_H },
  });

  await browser.close();

  const pdfDoc = await PDFDocument.create();
  const img = await pdfDoc.embedPng(screenshot);
  const pdfPage = pdfDoc.addPage([W_IN * 72, H_IN * 72]);
  pdfPage.drawImage(img, { x: 0, y: 0, width: W_IN * 72, height: H_IN * 72 });

  const pdfBytes = await pdfDoc.save();
  const outPath = path.resolve(__dirname, 'bramble-qr-handout.pdf');
  fs.writeFileSync(outPath, pdfBytes);
  console.log(`Done! ${outPath} (${(pdfBytes.length/1024).toFixed(0)} KB)`);
})();
