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
            console.log('Navigating to KVK search page...');
            await this.page.goto(KVK_SEARCH_URL, { waitUntil: 'networkidle' });

            // Handle cookie consent and any modals
            await this.handleModals();

            // Wait for search input to be visible
            await this.page.waitForSelector('input[type="search"]', { timeout: 10000 });

            // Enter search query
            console.log(`Entering search query: ${params.query}`);
            await this.page.fill('input[type="search"]', params.query);

            // Apply category filter if not "all"
            if (params.category !== 'all') {
                await this.applyCategoryFilter(params.category);
            }

            // Apply additional filters
            await this.applyFilters(params.filters);

            // Ensure no modals are blocking before clicking search
            await this.handleModals();

            // Click search button
            console.log('Clicking search button...');
            await this.page.click('button:has-text("Search"), button:has-text("Zoeken")', { force: true });

            // Wait for results to load
            await this.page.waitForSelector('ul[data-ui-test-class="search-results-list"]', { timeout: 15000 });

            // Scrape pages
            const maxPages = params.maxPages || 5;
            let currentPage = 1;

            while (currentPage <= maxPages) {
                console.log(`Scraping page ${currentPage}...`);

                // Wait a bit longer for results to fully render
                await this.page.waitForTimeout(3000);

                // Log what we see
                const resultsListExists = await this.page.$('ul[data-ui-test-class="search-results-list"]');
                console.log('Results list found:', !!resultsListExists);

                if (resultsListExists) {
                    const itemCount = await this.page.$$eval('ul[data-ui-test-class="search-results-list"] > li', items => items.length);
                    console.log(`Found ${itemCount} list items`);
                }

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

                // Wait for new results to load
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
            const selector = `button[aria-label="${buttonText}"], button:has-text("${buttonText}")`;

            await this.page.click(selector);
            await this.page.waitForTimeout(500);
        } catch (error) {
            console.warn(`Could not apply category filter: ${category}`, error);
        }
    }

    private async applyFilters(filters: SearchParams['filters']) {
        if (!this.page) return;

        // Skip advanced filters for now as they can trigger modals
        // The basic search and category filters are usually sufficient
        console.log('Filters configured:', filters);
        console.log('Note: Advanced filters are not applied to avoid modal conflicts');
    }

    private async handleModals() {
        if (!this.page) return;

        try {
            // Try to close cookie consent
            const cookieButtons = [
                'button:has-text("Accepteren")',
                'button:has-text("Accept")',
                'button:has-text("Alles accepteren")',
                '[data-ui-test-class*="cookie"] button'
            ];

            for (const selector of cookieButtons) {
                const button = await this.page.$(selector);
                if (button) {
                    await button.click();
                    console.log('Clicked cookie consent button');
                    break;
                }
            }

            // Wait for modal overlay to disappear
            await this.page.waitForSelector('.kvk-modal-overlay', { state: 'hidden', timeout: 3000 }).catch(() => { });
            await this.page.waitForTimeout(500);
        } catch (error) {
            // Modals might not be present
            console.log('No blocking modals found');
        }
    }

    private async extractResults(): Promise<CompanyData[]> {
        if (!this.page) return [];

        const results = await this.page.$$eval('ul[data-ui-test-class="search-results-list"] > li', (items) => {
            return items.map((item) => {
                try {
                    // Extract company name and URL
                    const linkElement = item.querySelector('a.TextLink-module_textlink__1SZwI');
                    const tradeName = linkElement?.textContent?.trim() || '';
                    const url = linkElement?.getAttribute('href') || '';

                    // Extract activity description
                    const activityElement = item.querySelector('[data-ui-test-class="activiteitomschrijving"] span[data-ui-test-class="visible-text"]');
                    const activityDescription = activityElement?.textContent?.trim() || '';

                    // Extract list items (KVK number, company type, etc.)
                    const listItems = Array.from(item.querySelectorAll('ul.List-module_generic-list__eILOq.List-module_icons__aKWLT > li'));

                    let kvkNumber = '';
                    let companyType = '';
                    let branchType = '';
                    let establishmentNumber = '';
                    let address = '';

                    listItems.forEach((li) => {
                        const text = li.textContent?.trim() || '';

                        if (li.classList.contains('icon-fileCertificateIcon')) {
                            // Extract KVK number
                            const match = text.match(/(\d+)/);
                            kvkNumber = match ? match[1] : '';
                        } else if (li.classList.contains('icon-stampIcon')) {
                            companyType = text;
                        } else if (li.classList.contains('icon-officeBuildingsIcon')) {
                            branchType = text;
                        } else if (li.classList.contains('icon-officeBuildingIcon')) {
                            const match = text.match(/(\d+)/);
                            establishmentNumber = match ? match[1] : '';
                        } else if (li.classList.contains('icon-locationLargeIcon')) {
                            address = text;
                        }
                    });

                    // Extract statutory name if present
                    const statutoryNameElement = item.querySelector('.Flexbox__s-sc-5j1a9d-0.jagIuK:has(span:has-text("Statutory name"), span:has-text("Statutaire naam")) ul li');
                    const statutoryName = statutoryNameElement?.textContent?.trim() || undefined;

                    return {
                        tradeName,
                        kvkNumber,
                        companyType,
                        branchType,
                        establishmentNumber,
                        address,
                        activityDescription,
                        statutoryName,
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
