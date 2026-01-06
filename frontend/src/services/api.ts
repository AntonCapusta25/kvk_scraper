import axios from 'axios';
import type { SearchParams, ScrapeResponse } from '../types.tsx';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const scrapeKVK = async (params: SearchParams): Promise<ScrapeResponse> => {
    try {
        const response = await axios.post<ScrapeResponse>(`${API_BASE_URL}/api/scrape`, params);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            return error.response.data;
        }
        return {
            success: false,
            error: 'Network error occurred'
        };
    }
};

export const checkHealth = async (): Promise<boolean> => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/health`);
        return response.data.status === 'ok';
    } catch {
        return false;
    }
};
