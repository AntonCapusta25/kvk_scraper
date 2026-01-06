export interface SearchParams {
    query: string;
    category: 'all' | 'trade-register' | 'advice';
    filters: {
        mainBranches: boolean;
        legalPersons: boolean;
        registered: boolean;
        existingNames: boolean;
    };
    maxPages?: number;
}

export interface CompanyData {
    tradeName: string;
    kvkNumber: string;
    companyType: string;
    branchType: string;
    establishmentNumber: string;
    address: string;
    activityDescription: string;
    statutoryName?: string;
    url: string;
}

export interface ScrapeResponse {
    success: boolean;
    data?: CompanyData[];
    error?: string;
    totalResults?: number;
    pagesScraped?: number;
}
