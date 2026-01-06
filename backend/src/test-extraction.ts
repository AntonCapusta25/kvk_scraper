import { KVKScraper } from './scraper';

async function testExtraction() {
    const scraper = new KVKScraper();

    try {
        console.log('🚀 Starting extraction debug test...\n');

        await scraper.initialize();
        console.log('✅ Browser initialized\n');

        // Navigate and search
        await (scraper as any).page.goto('https://www.kvk.nl/zoeken/', { waitUntil: 'networkidle' });
        await (scraper as any).handleModals();
        await (scraper as any).page.fill('input[type="search"]', 'burger');
        await (scraper as any).page.click('button:has-text("Zoeken")');
        await (scraper as any).page.waitForSelector('ul[data-ui-test-class="search-results-list"]', { timeout: 15000 });
        await (scraper as any).page.waitForTimeout(3000);

        // Test extraction with detailed logging
        const testResult = await (scraper as any).page.$$eval('ul[data-ui-test-class="search-results-list"] > li', (items: any[]) => {
            console.log('Items found:', items.length);

            const firstItem = items[0];
            if (firstItem) {
                const link = firstItem.querySelector('a.TextLink-module_textlink__1SZwI');
                console.log('Link found:', !!link);
                console.log('Link text:', link?.textContent);
                console.log('Link href:', link?.getAttribute('href'));

                const activityDiv = firstItem.querySelector('[data-ui-test-class="activiteitomschrijving"]');
                console.log('Activity div found:', !!activityDiv);

                const activitySpan = firstItem.querySelector('[data-ui-test-class="activiteitomschrijving"] span[data-ui-test-class="visible-text"]');
                console.log('Activity span found:', !!activitySpan);
                console.log('Activity text:', activitySpan?.textContent);

                const listItems = firstItem.querySelectorAll('ul.List-module_generic-list__eILOq.List-module_icons__aKWLT > li');
                console.log('List items found:', listItems.length);

                listItems.forEach((li: any, index: number) => {
                    console.log(`  Item ${index}:`, li.className, '-', li.textContent?.substring(0, 50));
                });
            }

            return items.length;
        });

        console.log('\n✅ Test completed, found', testResult, 'items');

        // Keep browser open for inspection
        console.log('\nBrowser will stay open for 30 seconds for inspection...');
        await (scraper as any).page.waitForTimeout(30000);

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await scraper.close();
        console.log('\n✅ Browser closed');
    }
}

testExtraction();
