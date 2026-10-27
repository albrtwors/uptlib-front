const PRODUCTION_API_URL = 'https://uptalib-back-porsi.vercel.app';
const DEVELOPMENT_API_URL = 'http://localhost:3000';

export const api = {
    base_url: process.env.NODE_ENV === 'production'
        ? PRODUCTION_API_URL
        : DEVELOPMENT_API_URL,
};