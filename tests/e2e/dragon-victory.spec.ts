import { expect, test } from '@playwright/test';

for(const [theme,animationName] of [['dragon','dragon-stomp'],['alien','alien-moonwalk'],['kitten','kitten-boogie'],['christmas','christmas-jig'],['unicorn','unicorn-prance']])test(`${theme} retains its victory animation for the entire celebration`,async({page})=>{
 await page.addInitScript(theme=>localStorage.setItem('multipli-party:v1',JSON.stringify({theme})),theme);
 await page.goto('/');
 await page.keyboard.press('Control+Alt+v');
 await expect(page.locator('#victory')).toBeVisible();
 const dance=page.locator('#dance-mascot');
 expect(await dance.evaluate(el=>getComputedStyle(el).animationName)).toBe(animationName);
 const frames=await dance.evaluate(async el=>{
  const animation=el.getAnimations()[0];
  animation.pause();
  const values=[];
  for(const time of [100,350,5200,5500]){animation.currentTime=time;values.push(getComputedStyle(el).transform);}
  return values;
 });
 expect(frames[0]).not.toBe(frames[1]);expect(frames[2]).not.toBe(frames[3]);
});


