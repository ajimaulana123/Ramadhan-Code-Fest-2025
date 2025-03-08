// app/login/page.tsx
"use client"; // Pastikan ini ada karena kita menggunakan state

import { handleLogin } from "@/app/actions/auth-actions";
import { useState } from "react";

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // State untuk loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Mencegah form dari reload halaman
    setIsLoading(true); // Aktifkan loading
    setError(null); // Reset error

    const formData = new FormData(e.currentTarget as HTMLFormElement); // Get form data

    try {
      const result = await handleLogin(formData);
      if (result?.error) {
        setError(result.error); // Tampilkan pesan error
      }
    } catch {
      setError("An error occurred. Please try again."); // Tangani error umum
    } finally {
      setIsLoading(false); // Matikan loading
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Welcome Back!
        </h2>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        <form
          onSubmit={(e) => handleSubmit(e)}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              className="w-full p-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              className="w-full p-3 text-black border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
            disabled={isLoading} // Nonaktifkan tombol saat loading
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-white transition-all duration-300 ease-in-out transform scale-110 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25 transition-opacity duration-300"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-90 transition-opacity duration-300"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>
        <p className="text-center text-gray-600 mt-6">
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline">
            Register here
          </a>
        </p>
        <p className="text-center text-gray-600 mt-2">
          Forgot your password?{" "}
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Reset it here
          </a>
        </p>
      </div>
    </div>
  );
}
