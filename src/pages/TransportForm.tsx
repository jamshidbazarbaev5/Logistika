import { useMutation } from '@tanstack/react-query';
import { apiService } from '../api/api';

export default function TransportForm() {
  const mutation = useMutation({
    mutationFn: apiService.createTransport,
    onSuccess: () => {
      // Handle success
      alert('Transport created successfully');
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      transport_type: formData.get('transport_type') as string,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="transport_type" className="block text-sm font-medium text-gray-700">
          Transport Type
        </label>
        <input
          type="text"
          name="transport_type"
          id="transport_type"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Create Transport
      </button>
    </form>
  );
}