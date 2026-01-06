import { chromium } from 'playwright';

async function inspectResults() {
    console.log('🔍 Inspecting KVK results structure...\n');

    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    try {
        // Navigate
        await page.goto('https://www.kvk.nl/zoeken/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(2000);

        // Accept cookies
        try {
            const saveButton = await page.waitForSelector('button[data-ui-test-class="toestemming"]', { timeout: 5000 });
            if (saveButton) {
                await saveButton.click();
                await page.waitForSelector('.kvk-modal-overlay', { state: 'hidden', timeout: 5000 });
                await page.waitForTimeout(1000);
            }
        } catch (e) {
            console.log('No cookie modal');
        }

        // Click category
        await page.click('button[aria-label="Handelsregister"]', { force: true });
        await page.waitForTimeout(1000);

        // Search
        await page.fill('input[type="search"]', 'burger');
        await page.click('button:has-text("Zoeken")', { force: true });
        await page.waitForSelector('ul[data-ui-test-class="search-results-list"]', { timeout: 15000 });
        await page.waitForTimeout(2000);

        // Get the HTML of the first result item
        const firstItemHTML = await page.$eval('ul[data-ui-test-class="search-results-list"] > li:first-child', el => el.outerHTML);

        console.log('First result item HTML:');
        console.log('='.repeat(80));
        console.log(firstItemHTML);
        console.log('='.repeat(80));

        // Count items
        const count = await page.$$eval('ul[data-ui-test-class="search-results-list"] > li', items => items.length);
        console.log(`\nTotal items found: ${count}`);

        console.log('\n✅ Inspection complete. Browser will stay open for 30 seconds...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await browser.close();
    }
}

inspectResults();
