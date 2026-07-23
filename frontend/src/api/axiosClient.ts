import axios from 'axios';

// 預設的 API 基礎網址
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器：自動帶上 JWT Token
axiosClient.interceptors.request.use(
  (config) => {
    // 確保在瀏覽器端才存取 localStorage
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('erp_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 回應攔截器：處理 Token 過期 (401)
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('erp_token');
        localStorage.removeItem('erp_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
