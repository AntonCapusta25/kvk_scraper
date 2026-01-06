import { chromium, Browser, Page } from 'playwright';
import { SearchParams, CompanyData } from './types';

const KVK_SEARCH_URL = 'https://www.kvk.nl/zoeken/';

export class KVKScraper {
    private browser: Browser | null = null;
    private page: Page | null = null;

    async initialize() {
        console.log('Initializing browser...');
        this.browser = await chromium.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        this.page = await this.browser.newPage();
        await this.page.setViewportSize({ width: 1920, height: 1080 });
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            this.page = null;
        }
    }

    async scrape(params: SearchParams): Promise<CompanyData[]> {
        if (!this.page) {
            throw new Error('Browser not initialized. Call initialize() first.');
        }

        const allResults: CompanyData[] = [];

        try {
            // Step 1: Navigate to KVK
            console.log('Navigating to KVK search page...');
            await this.page.goto(KVK_SEARCH_URL, { waitUntil: 'networkidle' });

            // Step 2: CRITICAL - Handle cookies FIRST
            console.log('Handling cookie consent...');
            try {
                await this.page.waitForTimeout(2000);
                const saveButton = await this.page.waitForSelector('button[data-ui-test-class="toestemming"]', { timeout: 5000 });
                if (saveButton) {
                    await saveButton.click();
                    console.log('✓ Cookie choice saved');
                    await this.page.waitForSelector('.kvk-modal-overlay', { state: 'hidden', timeout: 5000 });
                    console.log('✓ Cookie modal overlay disappeared');
                    await this.page.waitForTimeout(1000);
                }
            } catch (e) {
                console.log('No cookie modal or already accepted');
            }

            // Step 3: Wait for search input
            await this.page.waitForSelector('input[type="search"]', { timeout: 10000 });
            console.log('✓ Search input ready');

            // Step 4: Click category BEFORE entering search query
            if (params.category !== 'all') {
                await this.applyCategoryFilter(params.category);
            }

            // Step 5: Enter search query
            console.log(`Entering search query: ${params.query}`);
            await this.page.fill('input[type="search"]', params.query);
            await this.page.waitForTimeout(500);

            // Step 6: Click search button
            console.log('Clicking search button...');
            await this.page.click('button:has-text("Zoeken")', { force: true });

            // Step 7: Wait for results to load
            await this.page.waitForSelector('ul[data-ui-test-class="search-results-list"]', { timeout: 15000 });
            console.log('✓ Results loaded');

            // Scrape pages
            const maxPages = params.maxPages || 5;
            let currentPage = 1;

            while (currentPage <= maxPages) {
                console.log(`Scraping page ${currentPage}...`);
                await this.page.waitForTimeout(2000);

                const pageResults = await this.extractResults();
                allResults.push(...pageResults);

                console.log(`Extracted ${pageResults.length} results from page ${currentPage}`);

                // Check if there's a next page
                const hasNextPage = await this.hasNextPage();
                if (!hasNextPage || currentPage >= maxPages) {
                    break;
                }

                // Click next page
                await this.goToNextPage();
                currentPage++;
                await this.page.waitForTimeout(2000);
            }

            console.log(`Total results scraped: ${allResults.length}`);
            return allResults;

        } catch (error) {
            console.error('Scraping error:', error);
            throw error;
        }
    }

    private async applyCategoryFilter(category: 'trade-register' | 'advice') {
        if (!this.page) return;

        try {
            const categoryMap = {
                'trade-register': 'Handelsregister',
                'advice': 'Advies en inspiratie'
            };

            const buttonText = categoryMap[category];
            const selector = `button[aria-label="${buttonText}"]`;

            console.log(`Clicking category: ${buttonText}`);
            await this.page.click(selector, { force: true });
            await this.page.waitForTimeout(1000);
            console.log(`✓ Category ${buttonText} selected`);
        } catch (error) {
            console.warn(`Could not apply category filter: ${category}`, error);
        }
    }

    private async extractResults(): Promise<CompanyData[]> {
        if (!this.page) return [];

        const results = await this.page.$$eval('ul[data-ui-test-class="search-results-list"] > li', (items) => {
            return items.map((item) => {
                try {
                    // Extract company name and URL
                    const linkElement = item.querySelector('a.TextLink-module_textlink__1SZwI') as HTMLAnchorElement | null;
                    const tradeName = linkElement?.textContent?.trim() || '';
                    const url = linkElement?.getAttribute('href') || '';

                    // Extract activity description
                    const activityElement = item.querySelector('[data-ui-test-class="activiteitomschrijving"] span[data-ui-test-class="visible-text"]');
                    const activityDescription = activityElement?.textContent?.trim().replace(/\n/g, ' ') || '';

                    // Extract list items
                    const listItems = Array.from(item.querySelectorAll('ul.List-module_generic-list__eILOq > li')) as HTMLLIElement[];

                    let kvkNumber = '';
                    let companyType = '';
                    let branchType = '';
                    let establishmentNumber = '';
                    let address = '';

                    listItems.forEach((li) => {
                        const text = li.textContent?.trim() || '';

                        if (li.classList.contains('icon-fileCertificateIcon')) {
                            const match = text.match(/KVK-nummer:\s*(\d+)/);
                            kvkNumber = match ? match[1] : '';
                        } else if (li.classList.contains('icon-stampIcon')) {
                            companyType = text;
                        } else if (li.classList.contains('icon-officeBuildingsIcon')) {
                            branchType = text;
                        } else if (li.classList.contains('icon-officeBuildingIcon')) {
                            const match = text.match(/Vestigingsnummer:\s*(\d+)/);
                            establishmentNumber = match ? match[1] : '';
                        } else if (li.classList.contains('icon-locationLargeIcon')) {
                            address = text;
                        }
                    });

                    return {
                        tradeName,
                        kvkNumber,
                        companyType,
                        branchType,
                        establishmentNumber,
                        address,
                        activityDescription,
                        statutoryName: undefined,
                        url: url.startsWith('http') ? url : `https://www.kvk.nl${url}`
                    };
                } catch (error) {
                    console.error('Error extracting item:', error);
                    return null;
                }
            }).filter((item): item is NonNullable<typeof item> => item !== null);
        });

        return results as CompanyData[];
    }

    private async hasNextPage(): Promise<boolean> {
        if (!this.page) return false;

        try {
            const nextButton = await this.page.$('button[data-testid="next"]:not([aria-disabled="true"])');
            return nextButton !== null;
        } catch {
            return false;
        }
    }

    private async goToNextPage() {
        if (!this.page) return;

        try {
            await this.page.click('button[data-testid="next"]');
            await this.page.waitForTimeout(1500);
        } catch (error) {
            console.error('Error navigating to next page:', error);
            throw error;
        }
    }
}
