// utils/pageApi.js
const API_BASE_URL = 'https://admin.hogaacosmetics.com/api';

export const getActivePages = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/pages/active`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        return data.success ? data.pages : [];
    } catch (error) {
        console.error('Error fetching pages:', error);
        return [];
    }
};

export const getPageBySlug = async (slug) => {
    try {
        const response = await fetch(`${API_BASE_URL}/pages/${slug}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        const data = await response.json();
        return data.success ? data.page : null;
    } catch (error) {
        console.error('Error fetching page:', error);
        return null;
    }
};