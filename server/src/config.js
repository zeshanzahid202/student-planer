import dotenv from 'dotenv';
dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_planner_jwt_key_12345';
export const JWT_EXPIRES_IN = '7d';
export const PORT = process.env.PORT || 5000;
export const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
