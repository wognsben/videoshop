import {test, expect, type Page} from '@playwright/test';
import {mkdirSync,readFileSync} from 'node:fs';

for (const width of [1920,1440,1280,1024,768,430,390,375]) {
  test(`HOME WORKS ${width}px`, async ({page}) => {
    const exceptions: string[] = [];
    page.on('pageerror', error => exceptions.push(error.message));
    await page.setViewportSize({width,height:width<768?844:1000});
    await page.goto('/');
    const section = page.locator('.home-works');
    await section.scrollIntoViewIfNeeded();
    await expect(section.locator('h2')).toHaveText('WORKS');
    await expect(section.locator('.home-work-card')).toHaveCount(6);
    const columns = await section.locator('.home-works-grid').evaluate(element => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(width>=1280?3:2);
    for (const frame of await section.locator('.home-work-thumbnail').all()) {
      const bounds = await frame.boundingBox();
      expect(bounds!.width/bounds!.height).toBeCloseTo(16/9,1);
      const image = frame.locator('img');
      await expect(image).toBeVisible();
      await expect.poll(()=>image.evaluate((element:HTMLImageElement)=>element.complete&&element.naturalWidth>0)).toBe(true);
    }
    for (const caption of await section.locator('.home-work-caption').all()) {
      const title = await caption.locator('h3').boundingBox();
      const arrow = await caption.locator('svg').boundingBox();
      expect(title!.x+title!.width).toBeLessThanOrEqual(arrow!.x);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await expect(section.locator('button')).toHaveCount(0);
    await expect(section.locator('video')).toHaveCount(0);
    await expect(section).not.toContainText('SELECTED');
    await expect(section).not.toContainText('PORTFOLIO');
    await expect(page.locator('.hero')).toBeAttached();
    if(width>=768)await expect(page.locator('.sidebar')).toBeVisible();
    mkdirSync('verification/works',{recursive:true});
    await section.screenshot({path:`verification/works/home-works-${width}.png`});
    if(width===1440||width===390)await page.screenshot({path:`verification/works/home-works-context-${width}.png`});
    expect(exceptions).toEqual([]);
  });
}

test('샘플 카드와 전체 보기 링크, noindex',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/');
  const section=page.locator('.home-works');
  await section.getByRole('link',{name:'VIEW ALL WORKS'}).click();
  await expect(page).toHaveURL(/\/works$/);
  await page.goto('/');
  const cards=page.locator('.home-work-card');
  const urls=await cards.evaluateAll(elements=>elements.map(element=>element.getAttribute('href')));
  for(const url of urls){
    await page.goto(url!);
    await expect(page.locator('.preview-banner')).toBeVisible();
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex,follow');
  }
  await page.goto('/');
  await page.locator('.home-work-card').first().click();
  await expect(page).toHaveURL(/\/works\/reference-dpr-ian-iqos$/);
});

// 고정된 2초 테스트 패턴입니다. public/ 및 dist/에 포함하지 않습니다.
const fixture = readFileSync(new URL('./fixtures/preview.webm', import.meta.url));
async function injectPreview(page:Page, fail=false){
  await page.route('**/src/data/homeWorks.ts',async route=>{
    const response=await route.fetch();
    const body=(await response.text()).replace('thumbnail:', 'previewVideo: "/__test-preview.webm", thumbnail:');
    await route.fulfill({response,body});
  });
  await page.route('**/__test-preview.webm',route=>fail?route.fulfill({status:404}):route.fulfill({contentType:'video/webm',body:fixture}));
}

test('실제 media 요소: 지연 로드, 단일 재생, 이탈 즉시 정지·0초, 재진입, 화면 밖 정지',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await injectPreview(page);
  await page.goto('/');const section=page.locator('.home-works');await section.scrollIntoViewIfNeeded();
  await expect(section.locator('video')).toHaveCount(0);
  const cards=section.locator('.home-work-card');
  await cards.nth(0).hover();const video=cards.nth(0).locator('video');
  await expect(video).toHaveClass('is-playing');
  expect(await video.evaluate((element:HTMLVideoElement)=>element.muted&&!element.paused&&element.playsInline&&element.loop)).toBe(true);
  await expect(video).toHaveAttribute('preload','none');
  await expect.poll(()=>video.evaluate((element:HTMLVideoElement)=>element.currentTime)).toBeGreaterThan(0.05);
  await cards.nth(1).hover();
  expect(await video.evaluate((element:HTMLVideoElement)=>element.paused&&element.currentTime===0)).toBe(true);
  await expect(cards.nth(1).locator('video')).toHaveClass('is-playing');
  expect(await section.locator('video').evaluateAll(elements=>elements.filter(element=>!(element as HTMLVideoElement).paused).length)).toBe(1);
  await cards.nth(0).hover();await expect(video).toHaveClass('is-playing');
  expect(await video.evaluate((element:HTMLVideoElement)=>element.currentTime)).toBeLessThan(0.5);
  await page.locator('footer').scrollIntoViewIfNeeded();
  await expect.poll(()=>video.evaluate((element:HTMLVideoElement)=>element.paused&&element.currentTime===0)).toBe(true);
});

test('미디어 실패는 포스터 유지',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await injectPreview(page,true);await page.goto('/');
  const card=page.locator('.home-work-card').first();await card.hover();
  await expect.poll(()=>card.locator('video').evaluate((element:HTMLVideoElement)=>!!element.error)).toBe(true);
  await expect(card.locator('video')).not.toHaveClass('is-playing');await expect(card.locator('img')).toBeVisible();
});

test('reduced motion에서는 미리보기 로드 없음',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await injectPreview(page);await page.goto('/');
  await page.locator('.home-work-card').first().hover();await expect(page.locator('.home-works video')).toHaveCount(0);
});

test('터치 탭은 미리보기 없이 상세 이동',async({browser})=>{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage();await injectPreview(page);let requests=0;
  page.on('request',request=>{if(request.url().includes('__test-preview'))requests++});
  await page.goto('http://127.0.0.1:5173/');await page.locator('.home-work-card').first().tap();
  await expect(page).toHaveURL(/\/works\/reference-dpr-ian-iqos$/);expect(requests).toBe(0);await context.close();
});





