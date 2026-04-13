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

// Request interceptor for Auth
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

// Global response error handler
supabaseApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Refresh logic would go here
    }

    const errorMessage =
      error.response?.data?.error_description ||
      error.response?.data?.message ||
      error.message;

    console.error("Supabase API Error:", errorMessage);
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
      data: error.response?.data,
    });
  },
);
