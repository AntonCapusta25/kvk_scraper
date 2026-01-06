import React, { useState } from 'react';
import type { SearchParams } from '../types.tsx';
import './SearchForm.css';

interface SearchFormProps {
    onSearch: (params: SearchParams) => void;
    isLoading: boolean;
}

export const SearchForm: React.FC<SearchFormProps> = ({ onSearch, isLoading }) => {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState<'all' | 'trade-register' | 'advice'>('all');
    const [maxPages, setMaxPages] = useState(5);
    const [filters, setFilters] = useState({
        mainBranches: false,
        legalPersons: false,
        registered: false,
        existingNames: false
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!query.trim()) {
            alert('Please enter a search query');
            return;
        }

        onSearch({
            query: query.trim(),
            category,
            filters,
            maxPages
        });
    };

    const toggleFilter = (filterName: keyof typeof filters) => {
        setFilters(prev => ({
            ...prev,
            [filterName]: !prev[filterName]
        }));
    };

    return (
        <div className="search-form-container">
            <h1>KVK.nl Company Scraper</h1>
            <p className="subtitle">Search and extract company data from the Dutch Chamber of Commerce</p>

            <form onSubmit={handleSubmit} className="search-form">
                {/* Search Input */}
                <div className="form-group">
                    <label htmlFor="search-query">Search Query</label>
                    <input
                        id="search-query"
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Enter company name, KVK number, or keyword..."
                        className="search-input"
                        disabled={isLoading}
                    />
                </div>

                {/* Category Selection */}
                <div className="form-group">
                    <label>Category</label>
                    <div className="category-chips">
                        <button
                            type="button"
                            className={`chip ${category === 'all' ? 'active' : ''}`}
                            onClick={() => setCategory('all')}
                            disabled={isLoading}
                        >
                            Everything
                        </button>
                        <button
                            type="button"
                            className={`chip ${category === 'trade-register' ? 'active' : ''}`}
                            onClick={() => setCategory('trade-register')}
                            disabled={isLoading}
                        >
                            Trade Register
                        </button>
                        <button
                            type="button"
                            className={`chip ${category === 'advice' ? 'active' : ''}`}
                            onClick={() => setCategory('advice')}
                            disabled={isLoading}
                        >
                            Advice and Inspiration
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="form-group">
                    <label>Filters</label>
                    <div className="filter-chips">
                        <button
                            type="button"
                            className={`filter-chip ${filters.mainBranches ? 'active' : ''}`}
                            onClick={() => toggleFilter('mainBranches')}
                            disabled={isLoading}
                        >
                            Main Branches
                            {filters.mainBranches && <span className="remove-icon">×</span>}
                        </button>
                        <button
                            type="button"
                            className={`filter-chip ${filters.legalPersons ? 'active' : ''}`}
                            onClick={() => toggleFilter('legalPersons')}
                            disabled={isLoading}
                        >
                            Legal Persons
                            {filters.legalPersons && <span className="remove-icon">×</span>}
                        </button>
                        <button
                            type="button"
                            className={`filter-chip ${filters.registered ? 'active' : ''}`}
                            onClick={() => toggleFilter('registered')}
                            disabled={isLoading}
                        >
                            Registered
                            {filters.registered && <span className="remove-icon">×</span>}
                        </button>
                        <button
                            type="button"
                            className={`filter-chip ${filters.existingNames ? 'active' : ''}`}
                            onClick={() => toggleFilter('existingNames')}
                            disabled={isLoading}
                        >
                            Existing Names
                            {filters.existingNames && <span className="remove-icon">×</span>}
                        </button>
                    </div>
                </div>

                {/* Max Pages */}
                <div className="form-group">
                    <label htmlFor="max-pages">Maximum Pages to Scrape</label>
                    <input
                        id="max-pages"
                        type="number"
                        min="1"
                        max="20"
                        value={maxPages}
                        onChange={(e) => setMaxPages(parseInt(e.target.value) || 1)}
                        className="number-input"
                        disabled={isLoading}
                    />
                    <small>Each page contains approximately 10 results</small>
                </div>

                {/* Submit Button */}
                <button type="submit" className="submit-button" disabled={isLoading}>
                    {isLoading ? (
                        <>
                            <span className="spinner"></span>
                            Scraping...
                        </>
                    ) : (
                        <>
                            <span className="search-icon">🔍</span>
                            Start Scraping
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};
