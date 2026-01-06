import { KVKScraper } from './scraper';

async function testScraper() {
    const scraper = new KVKScraper();

    try {
        console.log('🚀 Starting KVK scraper test...\n');

        await scraper.initialize();
        console.log('✅ Browser initialized\n');

        const results = await scraper.scrape({
            query: 'burger',
            category: 'trade-register',
            filters: {
                mainBranches: false,
                legalPersons: false,
                registered: false,
                existingNames: false
            },
            maxPages: 3
        });

        console.log(`✅ Scraping completed! Found ${results.length} results\n`);

        if (results.length > 0) {
            console.log('📊 Sample result:');
            console.log(JSON.stringify(results[0], null, 2));
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        console.log('\n⏳ Keeping browser open for 10 seconds...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        await scraper.close();
        console.log('\n✅ Browser closed');
    }
}

testScraper();
