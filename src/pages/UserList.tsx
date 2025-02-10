  import React, { useState, useEffect } from 'react';
  import axios from 'axios';
  import { Pencil, Trash2, Plus, User, Mail, Key, UserCircle } from 'lucide-react';
  import ConfirmModal from '../components/ConfirmModal';
  import SuccessModal from '../components/SuccessModal';
  import { useTranslation } from 'react-i18next';

  interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  }

  interface UserFormData {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password?: string;
  }

  export default function Users() {
    const { t } = useTranslation();
    const [users, setUsers] = useState<User[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UserFormData>({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
    });

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get('https://cargo-calc.uz/api/v1/users/', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data.results);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    useEffect(() => {
      fetchUsers();
    }, []);

    const handleDelete = async (id: number) => {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`https://cargo-calc.uz/api/v1/users/${id}/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSuccessMessage('User deleted successfully');
        setIsSuccessModalOpen(true);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem('accessToken');
        const submitData = { ...formData };
        
        if (isEditing && selectedUserId) {
          await axios.put(`https://cargo-calc.uz/api/v1/users/${selectedUserId}/`, submitData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setSuccessMessage('User updated successfully');
        } else {
          await axios.post('https://cargo-calc.uz/api/v1/users/', submitData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setSuccessMessage('User created successfully');
        }
        setIsFormModalOpen(false);
        setIsSuccessModalOpen(true);
        fetchUsers();
      } catch (error) {
        console.error('Error saving user:', error);
      }
    };

    const openEditModal = (user: User) => {
      setSelectedUserId(user.id);
      setFormData({
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        password: '',
      });
      setIsEditing(true);
      setIsFormModalOpen(true);
    };

    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Users</h1>
          <button
            onClick={() => {
              setIsEditing(false);
              setFormData({
                username: '',
                email: '',
                first_name: '',
                last_name: '',
                password: '',
              });
              setIsFormModalOpen(true);
            }}
            className="bg-[#6C5DD3] text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-[#5c4eb8]"
          >
            <Plus size={20} />
            Add User
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user, index) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.first_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.last_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* User Form Modal */}
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4">
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFormModalOpen(false)} />
              <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h2 className="text-xl font-semibold mb-4">{isEditing ? 'Edit User' : 'Create User'}</h2>
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                          className="pl-10 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserCircle className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          className="pl-10 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserCircle className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          className="pl-10 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Key className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="password"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="pl-10 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-[#6C5DD3] focus:ring-[#6C5DD3] sm:text-sm"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsFormModalOpen(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-[#6C5DD3] rounded-md hover:bg-[#5c4eb8]"
                    >
                      {isEditing ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Confirm Delete Modal */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => {
            if (selectedUserId) handleDelete(selectedUserId);
            setIsDeleteModalOpen(false);
          }}
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
        />

        {/* Success Modal */}
        <SuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          message={successMessage}
        />
      </div>
    );
  }