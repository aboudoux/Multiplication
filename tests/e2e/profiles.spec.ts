import {test,expect} from '@playwright/test';
test('un nouveau joueur a une classe et des progrès isolés',async({page})=>{
 await page.goto('/');await page.locator('#player-picker').click();
 await page.locator('#new-player [name=name]').fill('Lina');await page.locator('#new-player [name=age]').selectOption('5');await page.locator('#new-player button[type=submit]').click();
 await expect(page.locator('#player-picker')).toContainText('Lina · GS');await page.locator('#open-training').click();
 await expect(page.locator('#learning-panel')).toBeVisible();await expect(page.locator('#learning-grade')).toHaveValue('GS');
 await page.locator('#player-picker').click();await page.locator('[data-player=current]').click();await expect(page.locator('#player-picker')).toContainText('Joueur actuel · Classique');
 await page.reload();await expect(page.locator('#player-picker')).toContainText('Joueur actuel');
});
