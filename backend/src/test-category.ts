import { chromium } from 'playwright';

async function testCategoryClick() {
    console.log('🚀 Testing category click...\n');

    const browser = await chromium.launch({
        headless: false,
        args: ['--no-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    try {
        // Navigate to KVK
        console.log('Navigating to KVK...');
        await page.goto('https://www.kvk.nl/zoeken/', { waitUntil: 'networkidle' });

        // Handle cookie consent
        try {
            await page.click('button:has-text("Accepteren")', { timeout: 3000 });
            console.log('✓ Cookie consent clicked');
        } catch (e) {
            console.log('No cookie modal');
        }

        await page.waitForTimeout(1000);

        // Enter search query
        console.log('\nEntering search query...');
        await page.fill('input[type="search"]', 'burger');
        console.log('✓ Query entered');

        await page.waitForTimeout(1000);

        // Click Handelsregister category
        console.log('\nClicking Handelsregister category...');
        const categoryButton = await page.locator('button[aria-label="Handelsregister"]');
        const isVisible = await categoryButton.isVisible();
        console.log(`Category button visible: ${isVisible}`);

        if (isVisible) {
            await categoryButton.click();
            console.log('✓ Handelsregister clicked');
        }

        await page.waitForTimeout(2000);

        // Click search button
        console.log('\nClicking search button...');
        await page.click('button:has-text("Zoeken")');
        console.log('✓ Search button clicked');

        await page.waitForTimeout(3000);

        // Check for results
        console.log('\nChecking for results...');
        const resultsList = await page.locator('ul[data-ui-test-class="search-results-list"]');
        const resultsVisible = await resultsList.isVisible().catch(() => false);
        console.log(`Results list visible: ${resultsVisible}`);

        if (resultsVisible) {
            const count = await page.locator('ul[data-ui-test-class="search-results-list"] > li').count();
            console.log(`Found ${count} result items`);
        }

        console.log('\n✅ Test complete. Browser will stay open for 30 seconds...');
        await page.waitForTimeout(30000);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await browser.close();
    }
}

testCategoryClick();
