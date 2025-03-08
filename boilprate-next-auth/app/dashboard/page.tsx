// app/dashboard/page.tsx
import { verify } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { handleLogout } from '@/app/actions/auth-actions';

const prisma = new PrismaClient();

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login'); // Redirect ke login jika token tidak ada
  }

  let userId: number;
  try {
    // Verifikasi token dan ambil payload
    const payload = verify(token, 'your-secret-key') as { userId: number };
    userId = payload.userId;
  } catch {
    redirect('/login'); // Redirect ke login jika token tidak valid
  }

  // Ambil data pengguna dari database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect('/login'); // Redirect ke login jika pengguna tidak ditemukan
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
        <div className="space-y-4">
          <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold text-gray-700">User Information</h2>
            <div className="mt-4 space-y-2">
              <p className="text-gray-600"><span className="font-medium">ID:</span> {user.id}</p>
              <p className="text-gray-600"><span className="font-medium">Email:</span> {user.email}</p>
              <p className="text-gray-600">
                <span className="font-medium">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <form action={handleLogout}>
            <button
              type="submit"
              className="mt-6 bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition duration-300"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}