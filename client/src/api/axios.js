import axios from 'axios';
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

export const axiosPrivate = axios.create({
  baseURL: `${SERVER_URL}/api`,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

export default axios.create({
  baseURL: `${SERVER_URL}/api`,
});