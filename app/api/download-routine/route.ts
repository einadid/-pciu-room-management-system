// app/api/download-routine/route.ts
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  let browser;
  try {
    const { html } = (await req.json()) as { html: string };
    if (!html) {
      return NextResponse.json({ error: 'No HTML provided' }, { status: 400 });
    }

    if (process.env.NODE_ENV === 'production') {
      const chromium = (await import('@sparticuz/chromium')).default;
      const puppeteer = (await import('puppeteer-core')).default;

      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
        defaultViewport: { width: 1600, height: 900 },
      });
    } else {
      const puppeteer = (await import('puppeteer-core')).default;

      browser = await puppeteer.launch({
        executablePath:
          process.platform === 'win32'
            ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
            : process.platform === 'darwin'
              ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
              : '/usr/bin/google-chrome',
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 1600, height: 900 },
      });
    }

    const page = await browser.newPage();

    await page.setViewport({
      width: 1600,
      height: 900,
      deviceScaleFactor: 2,
    });

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const bodyHeight = await page.evaluate(
      () => document.body.scrollHeight
    );

    await page.setViewport({
      width: 1600,
      height: bodyHeight,
      deviceScaleFactor: 2,
    });

    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true,
      omitBackground: false,
    });

    await browser.close();

    // ── Fix: convert to Uint8Array so NextResponse accepts it ──
    const uint8 = new Uint8Array(screenshot);

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="Routine.png"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    if (browser) await browser.close().catch(() => {});
    console.error('Screenshot error:', err);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}