import {test,expect,type Page,type Locator} from '@playwright/test';
import {mkdirSync} from 'node:fs';

const sizes=[{width:1920,height:1080},{width:1440,height:900},{width:1280,height:800},{width:1024,height:768},{width:768,height:1024},{width:430,height:932},{width:390,height:844},{width:375,height:812}];
const documentBox=(locator:Locator)=>locator.evaluate(element=>{const rect=element.getBoundingClientRect();return {x:rect.x+scrollX,y:rect.y+scrollY,width:rect.width,height:rect.height};});
async function chooseDate(page:Page){
  await page.getByRole('button',{name:'희망 납품일 선택',exact:true}).click();
  const day=page.locator('.hc-calendar td button:not(:disabled)').first();
  const value=await day.getAttribute('data-date');await day.click();return value!;
}
for(const size of sizes){test(`HOME CONTACT ${size.width}x${size.height}`,async({page})=>{
  const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.setViewportSize(size);await page.goto('/');
  const section=page.locator('.home-contact-section');await section.scrollIntoViewIfNeeded();
  expect(await page.locator('.process-section').evaluate(element=>element.nextElementSibling?.id)).toBe('home-contact');
  await expect(section.getByRole('heading',{name:'CONTACT',exact:true})).toBeVisible();
  expect(await page.locator('#home-contact-heading').evaluate(element=>element.scrollWidth<=element.clientWidth)).toBe(true);
  await expect(section.locator('input[type=radio]:checked')).toHaveCount(0);
  await expect(section.locator('.hc-calendar')).toHaveCount(0);
  if(size.width>=768)await expect(page.locator('.sidebar nav a.active')).toContainText('HOME');
  if(size.width>=1024){
    await expect(section.locator('.hc-shooting-image')).toBeVisible();
    await expect.poll(()=>section.locator('.hc-shooting-image img').evaluate((img:HTMLImageElement)=>img.complete&&img.naturalWidth>0)).toBe(true);
    const name=await section.locator('#hc-name').boundingBox();const company=await section.locator('#hc-company').boundingBox();
    expect(name!.y).toBeCloseTo(company!.y,0);expect(name!.x).toBeLessThan(company!.x);
  }else await expect(section.locator('.hc-shooting-image')).toBeHidden();
  mkdirSync('verification/contact',{recursive:true});
  await section.screenshot({path:`verification/contact/contact-${size.width}-closed.png`});
  const positions=await Promise.all([page.locator('#home-contact-heading'),section.locator('.hc-form'),section.locator('.hc-submit')].map(documentBox));
  await page.getByRole('button',{name:'희망 납품일 선택',exact:true}).click();
  const calendar=page.getByRole('dialog',{name:'희망 납품일 선택 달력'});await expect(calendar).toBeVisible();
  if(size.width>=1024){
    await expect(page.locator('.hc-calendar-host .hc-calendar')).toBeVisible();
    const after=await Promise.all([page.locator('#home-contact-heading'),section.locator('.hc-form'),section.locator('.hc-submit')].map(documentBox));
    for(let i=0;i<positions.length;i++)for(const key of ['x','y','width','height'] as const)expect(after[i]![key]).toBeCloseTo(positions[i]![key],0);
  }else{
    const picker=await calendar.boundingBox();const trigger=await section.locator('.hc-date-trigger').boundingBox();const budget=await section.locator('.hc-budget').boundingBox();
    expect(picker!.y).toBeGreaterThanOrEqual(trigger!.y+trigger!.height);expect(budget!.y).toBeGreaterThanOrEqual(picker!.y+picker!.height);
    expect(picker!.x).toBeGreaterThanOrEqual(0);expect(picker!.x+picker!.width).toBeLessThanOrEqual(size.width);
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await section.screenshot({path:`verification/contact/contact-${size.width}-calendar.png`});
  const day=calendar.locator('td button:not(:disabled)').first();const selected=await day.getAttribute('data-date');await day.click();
  await expect(calendar).toBeHidden();await expect(section.locator('.hc-date-trigger')).toContainText(selected!.split('-').join('. ')+'.');
  await page.getByRole('button',{name:'희망 납품일 선택',exact:true}).click();await expect(calendar.locator('[aria-pressed=true]')).toHaveAttribute('data-date',selected!);
  await page.keyboard.press('Escape');await expect(calendar).toBeHidden();
  expect(errors).toEqual([]);
});}

test('캘린더 월 이동·과거 제한·키보드·외부 클릭·포커스 복원',async({page})=>{
  await page.setViewportSize({width:1440,height:900});await page.goto('/');
  const trigger=page.getByRole('button',{name:'희망 납품일 선택',exact:true});await trigger.click();
  const calendar=page.locator('.hc-calendar');const month=await calendar.locator('strong').textContent();
  await expect(calendar.getByRole('button',{name:'이전 달',exact:true})).toBeDisabled();
  const firstDay=calendar.locator('td button:not(:disabled)').first();const start=await firstDay.getAttribute('data-date');
  await expect(firstDay).toBeFocused();await page.keyboard.press('ArrowRight');
  expect(await page.evaluate(()=>document.activeElement?.getAttribute('data-date'))).not.toBe(start);
  await calendar.getByRole('button',{name:'다음 달',exact:true}).click();expect(await calendar.locator('strong').textContent()).not.toBe(month);
  await calendar.getByRole('button',{name:'이전 달',exact:true}).click();await expect(calendar.locator('strong')).toHaveText(month!);
  for(const button of await calendar.locator('td button:disabled').all())expect(await button.getAttribute('data-date')).toBeTruthy();
  await page.keyboard.press('Escape');await expect(calendar).toBeHidden();await expect(trigger).toBeFocused();
  await trigger.click();await page.locator('#hc-company').click();await expect(calendar).toBeHidden();await expect(page.locator('#hc-company')).toBeFocused();
});

test('필수값·연락처 검증·오류 해제·프로젝트 단일 선택',async({page})=>{
  await page.goto('/');const section=page.locator('.home-contact-section');
  await section.getByRole('button',{name:'제출하기',exact:true}).click();
  await expect(page.locator('#hc-name')).toBeFocused();await expect(page.locator('#hc-name')).toHaveAttribute('aria-invalid','true');
  await page.locator('#hc-name').fill('담당자');await expect(page.locator('#hc-name')).toHaveAttribute('aria-invalid','false');
  await page.locator('#hc-company').fill('검증 회사');await page.locator('#hc-contact').fill('hello@invalid');
  await expect(section.getByText('이메일 형식을 확인해주세요.')).toBeVisible();
  await page.locator('#hc-contact').fill('not a phone');await expect(section.getByText('전화번호 또는 이메일 형식을 확인해주세요.')).toBeVisible();
  await page.locator('#hc-contact').fill('010-1234-5678');await expect(page.locator('#hc-contact')).toHaveAttribute('aria-invalid','false');
  await page.locator('#hc-type-0').check();await page.locator('#hc-type-2').check();
  await expect(section.locator('input[type=radio]:checked')).toHaveCount(1);await expect(page.locator('#hc-type-2')).toBeChecked();
});

for(const contact of ['010-1234-5678','test@example.com'])test(`정상 입력 검증 및 실제 미전송: ${contact}`,async({page})=>{
  let posts=0;page.on('request',request=>{if(request.method()==='POST')posts++});
  await page.goto('/');await page.locator('#hc-name').fill('테스트 담당자');await page.locator('#hc-company').fill('테스트 회사');
  await page.locator('#hc-contact').fill(contact);await page.locator('#hc-type-1').check();await chooseDate(page);
  await page.locator('#hc-description').fill('로컬 UI 검증을 위한 테스트입니다. 외부로 전송하지 않습니다.');
  await page.locator('.hc-form').getByRole('button',{name:'제출하기',exact:true}).click();
  await expect(page.locator('.hc-status')).toContainText('전송되지 않았습니다');await expect(page.locator('#hc-budget')).toHaveValue('');
  expect(posts).toBe(0);await expect(page.locator('#hc-name')).toHaveValue('테스트 담당자');
});

test('CONTACT의 기존 모바일 메뉴 유지 및 페이지 이동',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto('/');
  await page.locator('.home-contact-section').scrollIntoViewIfNeeded();
  await page.getByRole('button',{name:'메뉴 열기'}).click();const dialog=page.getByRole('dialog',{name:'전체 메뉴'});await expect(dialog).toBeVisible();
  await dialog.getByRole('link',{name:'03 ABOUT'}).click();await expect(page).toHaveURL(/\/about$/);
  expect(await page.evaluate(()=>document.body.classList.contains('home-contact-header-pinned'))).toBe(false);
});
