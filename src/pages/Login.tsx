import { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
interface LoginCredentials {
  username: string;
  password: string;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  });
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post<AuthTokens>(
        'http://147.45.109.126/api/token/',
        credentials
      );

      // Store tokens in localStorage
      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);

      // Set the token in axios instance headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
      
      // Also set it for our api instance
      api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;

      // Redirect to home page or dashboard
      navigate('/');
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError(t('login.error', 'Invalid username or password'));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-900 text-center">
            {t('login.title', 'Sign in to your account')}
          </h1>
          <p className="mt-1 sm:mt-2 text-sm text-gray-600 text-center">
            {t('login.subtitle', 'Enter your credentials to access your account')}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-100">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-600">
                {t('login.username', 'Username')}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('login.usernamePlaceholder', 'Username')}
                value={credentials.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-600">
                {t('login.password', 'Password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#6C5DD3] focus:outline-none focus:ring-1 focus:ring-[#6C5DD3]"
                placeholder={t('login.passwordPlaceholder', 'Password')}
                value={credentials.password}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#6C5DD3] text-white px-4 py-2 text-sm rounded-lg hover:bg-[#5c4eb3] focus:outline-none focus:ring-2 focus:ring-[#6C5DD3] focus:ring-offset-2"
            >
              {t('login.signIn', 'Sign in')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 