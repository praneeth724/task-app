'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <span className="text-lg font-semibold text-brand-700">Task Tracker</span>
        {user && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600">
              {user.name} <span className="text-gray-400">({user.role})</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-md border border-gray-300 px-3 py-1.5 text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
