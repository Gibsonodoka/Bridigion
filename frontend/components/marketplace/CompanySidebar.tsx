'use client';

import { usePathname, useRouter } from 'next/navigation';
import { NotificationBell } from '@/components/shared/NotificationBell';

const navItems = [
  { href: '/company/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/company/jobs', label: 'My Jobs', icon: '💼' },
  { href: '/company/talent', label: 'Talent Pool', icon: '👥' },
  { href: '/company/community', label: 'Community', icon: '💬' },
];

export const CompanySidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('company_token');
    router.push('/company/login');
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-slate-200 flex flex-col">
      <div className="px-6 py-6 border-b border-slate-100">
        <h1 className="text-lg font-black text-slate-900">Bridigion</h1>
        <p className="text-xs text-slate-400 mt-0.5">Company Portal</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => (
          <button
            key={item.href}
            onClick={() => router.push(item.href)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname.startsWith(item.href)
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100 space-y-1">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs text-slate-400">Notifications</span>
          <NotificationBell role="company" />
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  );
};