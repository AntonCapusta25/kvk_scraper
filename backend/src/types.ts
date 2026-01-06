export interface SearchParams {
    query: string;
    category: 'all' | 'trade-register' | 'advice';
    filters: {
        mainBranches: boolean;
        legalPersons: boolean;
        registered: boolean;
        existingNames: boolean;
    };
    maxPages?: number; // Maximum number of pages to scrape
}

export interface CompanyData {
    tradeName: string;
    kvkNumber: string;
    companyType: string; // e.g., "Eenmanszaak", "VOF"
    branchType: string; // e.g., "Hoofdvestiging"
    establishmentNumber: string;
    address: string;
    activityDescription: string;
    statutoryName?: string;
    handelsNaam?: string;
    url: string; // Link to the company detail page
}

export interface ScrapeResponse {
    success: boolean;
    data?: CompanyData[];
    error?: string;
    totalResults?: number;
    pagesScraped?: number;
}
