import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const UpdateUser = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: ''
  });

  const [message, setMessage] = useState('');

  useEffect(() => {
    // Fetch current user data when component mounts
    const fetchUser = async () => {
      try {
        const response = await axios.get('https://cargo-calc.uz/api/v1/users/');
        setUser(response.data);
      } catch (error) {
        setMessage(t('updateUser.message.errorFetching'));
        console.error('Error:', error);
      }
    };

    fetchUser();
  }, [t]);

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
    }));
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    try {
    //   const response = await axios.put(`https://cargo-calc.uz/api/v1/users/`, user);
      setMessage(t('updateUser.message.success'));
    } catch (error) {
      setMessage(t('updateUser.message.errorUpdating'));
      console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">{t('updateUser.title')}</h2>
      {message && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">
          {message}
        </div>
      )}
      <form onSubmit={handleSubmit} className="max-w-md">
        <div className="mb-4">
          <label className="block mb-2">{t('updateUser.form.username')}:</label>
          <input
            type="text"
            name="username"
            value={user.username}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">{t('updateUser.form.email')}:</label>
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">{t('updateUser.form.firstName')}:</label>
          <input
            type="text"
            name="first_name"
            value={user.first_name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">{t('updateUser.form.lastName')}:</label>
          <input
            type="text"
            name="last_name"
            value={user.last_name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {t('updateUser.form.submit')}
        </button>
      </form>
    </div>
  );
};

export default UpdateUser;