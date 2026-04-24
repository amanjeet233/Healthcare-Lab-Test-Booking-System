import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const startsWith = (path: string, prefix: string) => path === prefix || path.startsWith(`${prefix}/`);

const titleFromSlug = (slug: string) =>
  slug
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const RoleRouteBreadcrumb: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const protectedUserPrefixes = [
    '/booking',
    '/my-bookings',
    '/profile',
    '/family-members',
    '/my-addresses',
    '/health-insights',
    '/settings',
    '/promotions',
    '/lab-partners',
    '/notifications',
    '/book-consultation',
    '/reports',
    '/smart-reports',
    '/health-optimization',
    '/health-plan',
    '/promos'
  ];

  const isRolePage =
    startsWith(pathname, '/admin') ||
    startsWith(pathname, '/technician') ||
    startsWith(pathname, '/medical-officer') ||
    protectedUserPrefixes.some((prefix) => startsWith(pathname, prefix));

  if (!isRolePage) return null;

  const isDashboardPage =
    pathname === '/admin' ||
    pathname === '/technician' ||
    pathname === '/medical-officer' ||
    pathname === '/technician/today' ||
    pathname === '/technician/queue' ||
    pathname === '/technician/inlab' ||
    pathname === '/technician/in-lab' ||
    pathname === '/technician/collected' ||
    startsWith(pathname, '/promos') ||
    startsWith(pathname, '/promotions') ||
    startsWith(pathname, '/admin/promos') ||
    startsWith(pathname, '/admin/promo-codes') ||
    startsWith(pathname, '/notifications') ||
    startsWith(pathname, '/admin/notifications') ||
    startsWith(pathname, '/technician/notifications') ||
    startsWith(pathname, '/medical-officer/notifications') ||
    startsWith(pathname, '/my-bookings') ||
    startsWith(pathname, '/bookings') ||
    startsWith(pathname, '/profile') ||
    startsWith(pathname, '/settings') ||
    startsWith(pathname, '/my-addresses') ||
    startsWith(pathname, '/family-members') ||
    startsWith(pathname, '/health-insights');

  if (isDashboardPage) return null;

  const hasPageBreadcrumb =
    startsWith(pathname, '/medical-officer/verification') ||
    startsWith(pathname, '/medical-officer/history') ||
    startsWith(pathname, '/medical-officer/pipeline') ||
    startsWith(pathname, '/medical-officer/assignments') ||
    startsWith(pathname, '/medical-officer/bookings');

  if (hasPageBreadcrumb) return null;

  const roleLabel = startsWith(pathname, '/admin')
    ? 'Admin'
    : startsWith(pathname, '/technician')
      ? 'Technician'
      : startsWith(pathname, '/medical-officer')
        ? 'Medical Officer'
        : '';

  const roleTarget = startsWith(pathname, '/admin')
    ? '/admin'
    : startsWith(pathname, '/technician')
      ? '/technician'
      : startsWith(pathname, '/medical-officer')
        ? '/medical-officer'
        : '/profile';

  const currentPage = (() => {
    const map: Array<[string, string]> = [
      ['/admin/bookings', 'Bookings'],
      ['/admin/users', 'Users'],
      ['/admin/staff', 'Staff'],
      ['/admin/profile', 'Profile'],
      ['/admin/audit-logs', 'Audit Logs'],
      ['/admin/promo-codes', 'Promo Codes'],
      ['/admin/promos', 'Promo Codes'],
      ['/admin/notifications', 'Notifications'],
      ['/admin/doctor-management', 'Doctor Management'],
      ['/admin/reference-ranges', 'Reference Ranges'],
      ['/admin/test-parameters', 'Test Parameters'],
      ['/technician/results', 'Result Entry'],
      ['/technician/profile', 'Profile'],
      ['/technician/notifications', 'Notifications'],
      ['/medical-officer/profile', 'Profile'],
      ['/medical-officer/notifications', 'Notifications'],
      ['/booking', 'Booking'],
      ['/my-bookings', 'My Bookings'],
      ['/profile', 'Profile'],
      ['/family-members', 'Family Members'],
      ['/my-addresses', 'My Addresses'],
      ['/health-insights', 'Health Insights'],
      ['/settings', 'Settings'],
      ['/promotions', 'Promotions'],
      ['/lab-partners', 'Lab Partners'],
      ['/notifications', 'Notifications'],
      ['/book-consultation', 'Book Consultation'],
      ['/reports', 'My Reports'],
      ['/smart-reports', 'Smart Reports'],
      ['/health-optimization', 'Health Optimization'],
      ['/health-plan', 'Health Plan'],
      ['/promos', 'Promo Codes']
    ];
    const match = map.find(([prefix]) => startsWith(pathname, prefix));
    if (match) return match[1];
    const parts = pathname.split('/').filter(Boolean);
    return titleFromSlug(parts[parts.length - 1] || 'Page');
  })();

  return (
    <div className="max-w-[1400px] mx-auto w-full px-4 md:px-6 pt-2">
      <div className="inline-flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-[#c5d7df] text-[#0a6077] text-[10px] font-black uppercase tracking-[0.14em] hover:bg-white"
        >
          <ChevronLeft size={13} />
          Back
        </button>
        <nav className="inline-flex items-center text-[11px] font-black uppercase tracking-[0.14em]">
          <span className="text-[#6f9fb3] cursor-pointer hover:text-[#5c8ea3]" onClick={() => navigate('/')}>Home</span>
          <span className="mx-2.5 text-[#a8c0cb]">{'>'}</span>
          {roleLabel ? (
            <>
              <span className="text-[#0a6077] cursor-pointer hover:text-[#084e61]" onClick={() => navigate(roleTarget)}>{roleLabel}</span>
              <span className="mx-2.5 text-[#a8c0cb]">{'>'}</span>
            </>
          ) : null}
          <span className="text-[#005d79]">{currentPage}</span>
        </nav>
      </div>
    </div>
  );
};

export default RoleRouteBreadcrumb;
