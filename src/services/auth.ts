import axios from 'axios';

export const BASE_URL = 'https://cargo-calc.uz/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const newToken = await authService.refreshToken();
        if (newToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        authService.logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      window.location.href = '/login';
    }
    return config;
  },
  (error) => {
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
      window.location.href = '/login';
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
    return axiosInstance.post('/v1/transport/', data);
  }
};

export default axiosInstance;