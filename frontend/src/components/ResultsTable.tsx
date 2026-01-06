import React from 'react';
import type { CompanyData } from '../types.tsx';
import './ResultsTable.css';

interface ResultsTableProps {
    results: CompanyData[];
    onExport: (format: 'csv' | 'json') => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results, onExport }) => {
    if (results.length === 0) {
        return null;
    }

    return (
        <div className="results-container">
            <div className="results-header">
                <h2>Scraped Results ({results.length} companies)</h2>
                <div className="export-buttons">
                    <button onClick={() => onExport('csv')} className="export-btn csv">
                        📊 Export CSV
                    </button>
                    <button onClick={() => onExport('json')} className="export-btn json">
                        📄 Export JSON
                    </button>
                </div>
            </div>

            <div className="table-wrapper">
                <table className="results-table">
                    <thead>
                        <tr>
                            <th>Trade Name</th>
                            <th>KVK Number</th>
                            <th>Company Type</th>
                            <th>Establishment Number</th>
                            <th>Address</th>
                            <th>Activity</th>
                            <th>Statutory Name</th>
                            <th>Link</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((company, index) => (
                            <tr key={index}>
                                <td className="trade-name">{company.tradeName}</td>
                                <td>{company.kvkNumber}</td>
                                <td>{company.companyType}</td>
                                <td>{company.establishmentNumber}</td>
                                <td className="address">{company.address}</td>
                                <td className="activity">{company.activityDescription}</td>
                                <td>{company.statutoryName || '-'}</td>
                                <td>
                                    <a href={company.url} target="_blank" rel="noopener noreferrer" className="view-link">
                                        View
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
