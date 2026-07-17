import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// API Configuration
export const API_BASE_URL = 'https://swrzee.in/api';

// Types for API responses
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      userId: string;
      firstName: string;
      lastName: string;
      phoneNumber: string;
      email: string;
      role: string;
      profileComplete: boolean;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

// Local storage keys
export const STORAGE_KEYS = {
  USER_DATA: 'userData',
  TOKENS: 'tokens'
};

// Store auth data in localStorage
export const storeAuthData = (data: LoginResponse['data']) => {
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(data.user));
  localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(data.tokens));
};

// Get stored auth data
export const getStoredAuthData = () => {
  const user = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  const tokens = localStorage.getItem(STORAGE_KEYS.TOKENS);
  return {
    user: user ? JSON.parse(user) : null,
    tokens: tokens ? JSON.parse(tokens) : null
  };
};

// Clear auth data from localStorage
export const clearAuthData = () => {
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
  localStorage.removeItem(STORAGE_KEYS.TOKENS);
};
