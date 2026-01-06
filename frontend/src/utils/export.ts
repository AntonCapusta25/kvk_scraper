import type { CompanyData } from '../types.tsx';

export const exportToCSV = (data: CompanyData[], filename: string = 'kvk-results.csv') => {
    const headers = [
        'Trade Name',
        'KVK Number',
        'Company Type',
        'Branch Type',
        'Establishment Number',
        'Address',
        'Activity Description',
        'Statutory Name',
        'URL'
    ];

    const csvContent = [
        headers.join(','),
        ...data.map(company => [
            `"${company.tradeName.replace(/"/g, '""')}"`,
            company.kvkNumber,
            `"${company.companyType.replace(/"/g, '""')}"`,
            `"${company.branchType.replace(/"/g, '""')}"`,
            company.establishmentNumber,
            `"${company.address.replace(/"/g, '""')}"`,
            `"${company.activityDescription.replace(/"/g, '""')}"`,
            `"${(company.statutoryName || '').replace(/"/g, '""')}"`,
            company.url
        ].join(','))
    ].join('\n');

    downloadFile(csvContent, filename, 'text/csv');
};

export const exportToJSON = (data: CompanyData[], filename: string = 'kvk-results.json') => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, filename, 'application/json');
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
