'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { NotificationBell } from '@/components/shared/NotificationBell';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { href: '/profile', label: 'My Profile', icon: '👤' },
  { href: '/verification', label: 'Verification', icon: '🪪' },
  { href: '/courses', label: 'Courses', icon: '📚' },
  { href: '/jobs', label: 'Jobs', icon: '💼' },
  { href: '/applications', label: 'My Applications', icon: '📋' },
  { href: '/community', label: 'Community', icon: '💬' },
];

export const UserSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('user_token');
    localStorage.removeItem('user_data');
    router.push('/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-black tracking-tight">BRIDIGION</h1>
        <p className="text-slate-400 text-xs mt-1">Security Training Platform</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white text-slate-900'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-1">
        <div className="flex items-center justify-between px-4 py-2">
          <span className="text-xs text-slate-400">Notifications</span>
          <NotificationBell role="user" />
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};