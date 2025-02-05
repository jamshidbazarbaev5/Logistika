import axios from 'axios';

const BASE_URL = 'http://147.45.109.126/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// Add response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is token invalid and we haven't tried to refresh yet
    if (error.response?.data?.code === "token_not_valid" && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await authService.refreshToken();
        if (newToken) {
          // Update the authorization header
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (error) {
        // If refresh fails, logout user
        authService.logout();
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  refreshToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return null;

    try {
      const response = await axios.post(`${BASE_URL}/token/refresh/`, {
        refresh: refreshToken
      });
      
      localStorage.setItem('accessToken', response.data.access);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      return response.data.access;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return null;
    }
  },

  verifyToken: async (token: string) => {
    try {
      await axiosInstance.post(`/token/verify/`, {
        token
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete axiosInstance.defaults.headers.common['Authorization'];
  },

  createTransport: async (data: { transport_type: string }) => {
    const token = localStorage.getItem('accessToken');
    return axios.post('/v1/transport/', data, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

export default axiosInstance;