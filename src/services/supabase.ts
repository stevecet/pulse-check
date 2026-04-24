import axios from "axios";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseApi = axios.create({
  baseURL: supabaseUrl,
  headers: {
    apikey: supabaseAnonKey,
    "Content-Type": "application/json",
  },
});

supabaseApi.interceptors.request.use((config) => {
  const sessionString = localStorage.getItem("supabase-session");
  if (sessionString) {
    const session = JSON.parse(sessionString);
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
  }
  return config;
});
