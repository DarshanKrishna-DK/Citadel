// The Aptos network the dapp is using
export const NETWORK = import.meta.env.VITE_APP_NETWORK ?? "testnet";
// The address of the published module
export const MODULE_ADDRESS = import.meta.env.VITE_MODULE_ADDRESS;
// The API key for the Aptos API
export const APTOS_API_KEY = import.meta.env.VITE_APTOS_API_KEY;
// API base URL
export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
