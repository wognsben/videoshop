import {test,expect,type Page} from '@playwright/test';
import {mkdirSync} from 'node:fs';

const sizes=[{width:1920,height:1080},{width:1920,height:900},{width:1440,height:900},{width:1280,height:800},{width:1024,height:768},{width:768,height:1024},{width:430,height:932},{width:390,height:844},{width:375,height:812}];
const titles=['CONTACT','PRE-PRODUCTION','PRODUCTION','POST-PRODUCTION'];
async function scrollStep(page:Page,index:number){
  await page.evaluate(index=>{
    const section=document.querySelector<HTMLElement>('.process-section')!;
    const stage=document.querySelector<HTMLElement>('.process-stage')!;
    const top=window.scrollY+section.getBoundingClientRect().top;
    window.scrollTo({top:top+(section.offsetHeight-stage.offsetHeight)*(index+0.2)/4,behavior:'instant'});
  },index);
  await expect(page.locator('.process-section')).toHaveAttribute('data-step',String(index+1));
}

for(const size of sizes){test(`PROCESS scroll ${size.width}x${size.height}`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize(size);await page.goto('/');
  await expect(page.locator('.process-section')).toHaveCount(1);
  expect(await page.locator('.home-works').evaluate(element=>element.nextElementSibling?.id)).toBe('process');
  for(const image of await page.locator('.process-v-frame img').all())await expect.poll(()=>image.evaluate((image:HTMLImageElement)=>image.complete&&image.naturalWidth>0)).toBe(true);
  let fixed:{x:number;y:number;width:number;height:number}|null=null;
  for(const index of [0,1,2,3,2,1,0]){
    await scrollStep(page,index);
    const frame=await page.locator('.process-v-frame').boundingBox();
    if(!fixed)fixed=frame;
    for(const key of ['x','y','width','height'] as const)expect(frame![key]).toBeCloseTo(fixed![key],0);
    expect((await page.locator('.process-stage').boundingBox())!.y).toBeCloseTo(0,0);
    const panel=page.locator('.process-copy-panel.is-active');
    await expect(panel.locator('h3')).toHaveText(titles[index]);
    const title=panel.locator('h3');
    expect(await title.evaluate(element=>element.scrollWidth<=element.clientWidth+1)).toBe(true);
    const description=await panel.locator('p').boundingBox();
    const copyArea=await page.locator('.process-copy').boundingBox();
    const descriptionBottom=description!.y+description!.height;
    expect(descriptionBottom).toBeLessThanOrEqual(copyArea!.y+copyArea!.height+1);
    if(size.width>=901){
      const list=await page.locator('.process-steps-desktop').boundingBox();
      expect(list!.y-descriptionBottom).toBeGreaterThanOrEqual(20);
    }else expect(frame!.y-descriptionBottom).toBeGreaterThanOrEqual(4);
    const navigation=page.locator(size.width<901?'.process-steps-mobile':'.process-steps-desktop');
    await expect(navigation.locator('[aria-current=step]')).toContainText(String(index+1).padStart(2,'0'));
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    const stage=await page.locator('.process-stage').boundingBox();
    const note=await page.locator('.process-image-note').boundingBox();
    expect(note!.y+note!.height).toBeLessThanOrEqual(size.height+1);
    expect(stage!.height).toBeLessThanOrEqual(size.height+1);
    if(size.width<768){
      await expect(page.locator('.mobile-header')).toHaveCSS('position','fixed');
      const header=await page.locator('.mobile-header').boundingBox();
      const heading=await page.locator('#process-heading').boundingBox();
      expect(header!.y+header!.height).toBeLessThanOrEqual(heading!.y+1);
      const copy=await panel.boundingBox();
      expect(copy!.y+copy!.height).toBeLessThanOrEqual(frame!.y+1);
    }else await expect(page.locator('.sidebar nav a.active')).toContainText('HOME');
    if(index===0||index===3||size.width===390){
      mkdirSync('verification/process',{recursive:true});
      // Motion reduction makes the screenshot represent the settled state without timing assumptions.
      await page.emulateMedia({reducedMotion:'reduce'});
      await page.screenshot({path:`verification/process/process-${size.width}-step-${index+1}.png`});
      await page.emulateMedia({reducedMotion:'no-preference'});
    }
  }
  await page.evaluate(()=>{
    const section=document.querySelector<HTMLElement>('.process-section')!;
    const stage=document.querySelector<HTMLElement>('.process-stage')!;
    window.scrollTo({top:window.scrollY+section.getBoundingClientRect().top+section.offsetHeight-stage.offsetHeight+innerHeight*.6,behavior:'instant'});
  });
  await expect.poll(async()=> (await page.locator('.process-stage').boundingBox())!.y).toBeLessThan(0);
  await expect.poll(()=>page.evaluate(()=>document.body.classList.contains('process-header-pinned'))).toBe(false);
  expect((await page.locator('footer').boundingBox())!.y).toBeLessThan(size.height);
  expect(errors).toEqual([]);
});}

test('단계 버튼 키보드 이동, reduced motion, 이미지 실패 fallback',async({page})=>{
  await page.route('**/assets/process-production-provided.png',route=>route.fulfill({status:404}));
  await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:1440,height:900});await page.goto('/');
  await scrollStep(page,1);
  await expect(page.locator('.process-image-layer.is-visible img')).toHaveAttribute('src','/assets/process-pre-production-provided.png');
  await scrollStep(page,2);
  await expect(page.locator('.process-image-layer.is-visible img')).toHaveAttribute('src','/assets/process-pre-production-provided.png');
  expect(await page.locator('.process-image-layer').first().evaluate(element=>getComputedStyle(element).transitionDuration)).toBe('0s');
  const button=page.locator('.process-steps-desktop button').last();await button.focus();await page.keyboard.press('Enter');
  await expect(page.locator('.process-section')).toHaveAttribute('data-step','4');await expect(button).toBeFocused();
  await page.locator('.sidebar').getByRole('link',{name:'03 ABOUT'}).click();
  await expect(page).toHaveURL(/\/about$/);expect(await page.evaluate(()=>document.body.classList.contains('process-header-pinned'))).toBe(false);
});


