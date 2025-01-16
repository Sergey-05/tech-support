// app/ui/sidenav.tsx
'use client';

import Link from 'next/link';
import NavLinks from '@/app/ui/nav-links';
import AcmeLogo from './acme-logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import AdminNavLinks from './admin-nav-links';
import { getUserDetails, getUserId } from '../utils/supabase/user';

export default function SideNav() {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await getUserId();
        if (userId) {
          const userDetails = await getUserDetails(userId);
          console.log(userDetails);
          setUserRole(userDetails.user_role); // Устанавливаем роль пользователя
          
          console.log(userRole);
        }
      } catch (error) {
        console.error('Error fetching user data', error);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      // Здесь вы можете добавить логику для перенаправления пользователя на страницу входа
    } catch (error) {
      console.error('Error logging out', error);
    }
  };

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-blue-600 p-4 md:h-20"
        href="/dashboard"
      >
        <div className="w-50 text-white md:w-40">
          <AcmeLogo />
        </div>
      </Link>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        {userRole == 'admin' ? <AdminNavLinks /> : <NavLinks />}
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await handleLogout();
          }}
        >
          <button
            type="submit"
            className="flex h-[48px] w-full grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3"
          >
            <PowerIcon className="w-6" />
            <div className="hidden md:block">Sign Out</div>
          </button>
        </form>
      </div>
    </div>
  );
}
