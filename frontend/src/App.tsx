import { useState } from 'react';
import { SearchForm } from './components/SearchForm';
import { ResultsTable } from './components/ResultsTable';
import { scrapeKVK } from './services/api';
import { exportToCSV, exportToJSON } from './utils/export';
import type { SearchParams, CompanyData } from './types.tsx';
import './App.css';

function App() {
  const [results, setResults] = useState<CompanyData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (params: SearchParams) => {
    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const response = await scrapeKVK(params);

      if (response.success && response.data) {
        setResults(response.data);
      } else {
        setError(response.error || 'Scraping failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `kvk-results-${timestamp}`;

    if (format === 'csv') {
      exportToCSV(results, `${filename}.csv`);
    } else {
      exportToJSON(results, `${filename}.json`);
    }
  };

  return (
    <div className="app">
      <SearchForm onSearch={handleSearch} isLoading={isLoading} />

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Scraping KVK.nl... This may take a moment.</p>
        </div>
      )}

      <ResultsTable results={results} onExport={handleExport} />
    </div>
  );
}

export default App;
