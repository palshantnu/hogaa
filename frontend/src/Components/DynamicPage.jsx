// components/DynamicPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPageBySlug } from '../utils/pageApi';
import './Page.css';

const DynamicPage = () => {
    const { slug } = useParams();
    const [page, setPage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPage = async () => {
            try {
                setLoading(true);
                const pageData = await getPageBySlug(slug);
                
                if (pageData) {
                    setPage(pageData);
                    document.title = pageData.meta_title || `${pageData.title} | hogaa Cosmetics`;
                } else {
                    setError('Page not found');
                }
            } catch (err) {
                console.error('Error fetching page:', err);
                setError('Failed to load page');
            } finally {
                setLoading(false);
            }
        };
        
        fetchPage();
    }, [slug]);

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (error || !page) {
        return (
            <div className="page-error">
                <h2>Page Not Found</h2>
                <p>{error || 'The page you are looking for does not exist.'}</p>
                <button onClick={() => window.location.href = '/'}>Go Home</button>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>{page.title}</h1>
                <p className="page-date">Last updated: {new Date(page.updated_at).toLocaleDateString()}</p>
            </div>
            <div className="page-content" dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
    );
};

export default DynamicPage;