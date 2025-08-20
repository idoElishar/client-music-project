export const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8008";

export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const validatePassword = (password) =>
  password.length >= 7 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);