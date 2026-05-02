import dotenv from 'dotenv';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development';

const getEnvOrThrow = (key: string, defaultValue?: string): string => {
    const value = process.env[key];
    if (value) return value;
    if (defaultValue) return defaultValue;
    if (NODE_ENV === 'production') {
        throw new Error(`Environment variable ${key} is required in production.`);
    }
    return '';
};

export const env = {
    NODE_ENV,
    PORT: process.env.PORT || '5000',
    DATABASE_URL: getEnvOrThrow('DATABASE_URL'),
    JWT_SECRET: getEnvOrThrow('JWT_SECRET', NODE_ENV === 'development' ? 'mysecretkey' : undefined),
    FRONTEND_URL: getEnvOrThrow('FRONTEND_URL', 'http://localhost:5173'),
};
