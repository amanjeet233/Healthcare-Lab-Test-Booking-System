import React, { useState, useLayoutEffect, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, ShoppingCart, Plus, Stethoscope, ClipboardList, Pill, User, LogOut, Gift, Calendar, FileText, Heart, Settings, ArrowRight, MapPin, Users, Shield, Activity, FlaskConical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useModal } from '../../context/ModalContext';
import NotificationBell from '../notifications/NotificationBell';
import { notificationService } from '../../services/notificationService';

// Basic useDebounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

function toSafeString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  return fallback;
}

function toSafeNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  try {
    const parsed = Number(value as number);
    return Number.isFinite(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

const Header: React.FC = () => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { cart, fetchCart, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { openAuthModal, openModal } = useModal();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [animateBadge, setAnimateBadge] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const prevCartCountRef = useRef(0);
  const searchWrapperRef = useRef<HTMLDivElement>(null);

  // Search Autocomplete State
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [patientUnreadCount, setPatientUnreadCount] = useState(0);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const cartItemCount = toSafeNumber(cart?.itemCount, 0);
  const userName = toSafeString(currentUser?.name, 'User');
  const userEmail = toSafeString(currentUser?.email, '');
  const userInitial = userName.charAt(0).toUpperCase() || 'U';
  const role = currentUser?.role;
  const profilePath =
    role === 'ADMIN' ? '/admin/profile' :
    role === 'TECHNICIAN' ? '/technician/profile' :
    role === 'MEDICAL_OFFICER' ? '/medical-officer/profile' :
    '/profile';
  const isOpsRole = Boolean(isAuthenticated && role && role !== 'PATIENT');

  const isAdminDashboard = role === 'ADMIN' && location.pathname.startsWith('/admin');

  // Load cart only for patient accounts. Ops roles don't have cart access.
  useLayoutEffect(() => {
    if (isAuthenticated && role === 'PATIENT') {
      fetchCart();
    }
  }, [isAuthenticated, role, fetchCart]);

  // Trigger badge animation when cart count changes
  useLayoutEffect(() => {
    const currentCount = cartItemCount;
    const prevCount = prevCartCountRef.current;

    // Animate on count increase (not on initial load)
    if (currentCount > prevCount && prevCount > 0) {
      setAnimateBadge(true);
      prevCartCountRef.current = currentCount;

      const timer = setTimeout(() => {
        setAnimateBadge(false);
      }, 600);

      return () => clearTimeout(timer);
    }

    prevCartCountRef.current = currentCount;
  }, [cartItemCount]);

  // Handle Autocomplete Fetch
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearch.trim().length < 2 || isOpsRole) {
        setSuggestions([]);
        setIsSearchOpen(false);
        return;
      }
      setIsSearching(true);
      try {
        // Use the new live search endpoint
        const res = await fetch(`/api/tests/search?q=${encodeURIComponent(debouncedSearch)}`);
        if (!res.ok) throw new Error('Search failed');

        const data = await res.json();
        const tests = data?.data || [];
        setSuggestions(tests);
        setIsSearchOpen(true);
      } catch (e) {
        console.error('Search autocomplete error:', e);
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    };
    fetchSuggestions();
  }, [debouncedSearch, isOpsRole]);

  // Handle click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadUnreadCount = async () => {
      if (!isAuthenticated || role !== 'PATIENT') {
        if (mounted) setPatientUnreadCount(0);
        return;
      }

      const count = await notificationService.getUnreadCount();
      if (mounted) {
        setPatientUnreadCount(count);
      }
    };

    void loadUnreadCount();

    return () => {
      mounted = false;
    };
  }, [isAuthenticated, role]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length > 0) {
      setIsSearchOpen(false);
      if (role === 'ADMIN') {
        navigate(`/admin?search=${encodeURIComponent(searchQuery.trim())}`);
      } else if (role === 'MEDICAL_OFFICER') {
        navigate(`/medical-officer/verification?search=${encodeURIComponent(searchQuery.trim())}`);
      } else if (role === 'TECHNICIAN') {
        navigate(`/technician?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate(`/lab-tests/all-lab-tests?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setIsSearchOpen(false);
  };

  const quickActions = [
    { Icon: Plus, label: 'Book Test', href: '/tests', color: 'text-slate-600' },
    { Icon: Stethoscope, label: 'Consult', action: () => openModal('DOCTOR_APPROVAL'), color: 'text-[#0D7C7C]' },
    { Icon: ClipboardList, label: 'Reports', action: () => isAuthenticated ? navigate('/reports') : openAuthModal('login'), color: 'text-[#D97706]' },
    { Icon: Pill, label: 'Packages', href: '/packages', color: 'text-[#0D7C7C]' },
    { Icon: Gift, label: 'Promos', href: '/promos', color: 'text-[#EC4899]' },
  ];

  const profileMenuItems = [
    { label: 'My Profile', icon: User, path: profilePath },
    { label: 'My Bookings', icon: Calendar, path: '/my-bookings' },
    { label: 'My Reports', icon: FileText, path: '/reports' },
    { label: 'Family Members', icon: Users, path: '/family-members' },
    { label: 'My Addresses', icon: MapPin, path: '/my-addresses' },
    { label: 'Health Insights', icon: Heart, path: '/health-insights' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const technicianMenuItems = [
    { label: 'Dashboard', icon: Settings, path: '/technician' },
    { label: 'My Tasks', icon: ClipboardList, path: '/technician/queue' },
    { label: 'Results', icon: FlaskConical, path: '/technician/inlab' },
    { label: 'History', icon: FileText, path: '/technician/collected' },
    { label: 'Profile', icon: User, path: '/technician/profile' },
  ];

  const medicalOfficerMenuItems = [
    { label: 'My Profile', icon: User, path: '/medical-officer/profile' },
    { label: 'History', icon: FileText, path: '/medical-officer/history' },
  ];

  const adminMenuItems = [
    { label: 'Profile', icon: User, path: '/admin/profile' },
    { label: 'Audit Logs', icon: FileText, path: '/admin/audit-logs' },
  ];

  const quickAccessOps = role === 'ADMIN'
    ? [
        { label: 'Bookings', icon: Calendar, path: '/admin/bookings', color: 'text-[#0D7C7C]' },
        { label: 'Users', icon: Users, path: '/admin/users', color: 'text-[#1D4ED8]' },
        { label: 'Staff', icon: Shield, path: '/admin/staff', color: 'text-[#0F766E]' },
        { label: 'Promo Codes', icon: Gift, path: '/admin/promo-codes', color: 'text-[#EC4899]' },
      ]
    : role === 'MEDICAL_OFFICER'
      ? [
          { label: 'Review Queue', icon: ClipboardList, path: '/medical-officer/verification', color: 'text-[#D97706]' },
          { label: 'Assignments', icon: Users, path: '/medical-officer/assignments', color: 'text-[#0D7C7C]' },
          { label: 'Pipeline', icon: Activity, path: '/medical-officer/pipeline', color: 'text-[#7C3AED]' },
          { label: 'History', icon: FileText, path: '/medical-officer/history', color: 'text-[#0F766E]' },
        ]
      : role === 'TECHNICIAN'
        ? [
            { label: 'Today', icon: Calendar, path: '/technician/today', color: 'text-[#0D7C7C]' },
            { label: 'My Tasks', icon: ClipboardList, path: '/technician/queue', color: 'text-[#1D4ED8]' },
            { label: 'Results', icon: Activity, path: '/technician/inlab', color: 'text-[#D97706]' },
            { label: 'History', icon: FileText, path: '/technician/collected', color: 'text-[#0F766E]' },
          ]
        : [];

  const isMenuItemActive = (path: string): boolean => {
    const [basePath] = path.split('?');
    if (basePath === '/admin' || basePath === '/technician' || basePath === '/medical-officer') {
      return location.pathname.startsWith(basePath);
    }
    return location.pathname === basePath;
  };

  const handleProfileMouseEnter = () => {
    if (profileMenuTimeoutRef.current) {
      clearTimeout(profileMenuTimeoutRef.current);
      profileMenuTimeoutRef.current = null;
    }
    setShowProfileMenu(true);
  };

  const handleProfileMouseLeave = () => {
    profileMenuTimeoutRef.current = setTimeout(() => {
      setShowProfileMenu(false);
    }, 260);
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 w-full bg-white border-b border-gray-100 shadow-sm flex justify-center h-[72px]">
      <div className="w-full max-w-[1210px] px-4 md:px-6 flex items-center justify-between gap-6 h-full relative">
        <Link
          to={
            role === 'ADMIN' ? '/admin' :
            role === 'TECHNICIAN' ? '/technician' :
            role === 'MEDICAL_OFFICER' ? '/medical-officer' :
            '/'
          }
          className="flex items-center gap-2.5 shrink-0 z-20 group"
        >
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="bg-linear-to-br from-[#0D7C7C] to-ocean-blue p-2 rounded-xl shadow-lg"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </motion.div>
          <div className="hidden sm:flex flex-col leading-none">
            <h1 className="text-[17px] font-bold tracking-tighter italic text-slate-900 uppercase">
              HEALTHCARE<span className="text-slate-400">LAB</span>
            </h1>
            <span className="text-[8px] font-bold text-[#0D7C7C] uppercase tracking-[0.3em] mt-0.5">Intelligence</span>
          </div>
        </Link>

        <div className="hidden md:flex lg:flex flex-1 max-w-md min-w-37.5 relative z-10 mx-2 shrink items-center" ref={searchWrapperRef}>
          <form className="relative w-full group flex items-center" onSubmit={handleSearchSubmit}>
            <Search className="absolute left-4 w-4 h-4 text-slate-400 group-focus-within:text-[#0D7C7C]" strokeWidth={3} />
            <input
              type="text"
              placeholder={
                role === 'ADMIN' ? 'SEARCH SYSTEM REGISTRY...' :
                role === 'MEDICAL_OFFICER' ? 'SEARCH VERIFICATION QUEUE...' :
                role === 'TECHNICIAN' ? 'SEARCH TASKS...' :
                'SEARCH TESTS OR PACKAGES...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setIsSearchOpen(true) }}
              className="w-full pl-11 pr-9 py-2.5 bg-slate-50 border border-slate-100 rounded-full focus:outline-none focus:border-[#0D7C7C] focus:bg-white transition-all text-[11px] font-bold placeholder:font-bold tracking-widest text-slate-700 shadow-inner"
            />
            {searchQuery.length > 0 && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-4 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>

          <AnimatePresence>
            {isSearchOpen && searchQuery.trim().length >= 2 && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-[120%] left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-50 flex flex-col"
              >
                {isSearching ? (
                  <div className="p-4 text-center text-xs font-semibold text-gray-400">Searching...</div>
                ) : (
                  <div className="flex flex-col">
                    {suggestions.map((test, idx) => {
                      const testSlug = toSafeString(test?.slug);
                      const name = toSafeString(test?.testName, toSafeString(test?.name, ''));
                      const href = testSlug
                        ? `/test/${testSlug}`
                        : `/lab-tests/all-lab-tests?search=${encodeURIComponent(name)}`;

                      return (
                        <Link
                          key={toSafeString(test?.id, `search-result-${idx}`)}
                          to={href}
                          onClick={() => setIsSearchOpen(false)}
                          className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-gray-50 flex flex-col gap-1 transition-colors block"
                        >
                          <div className="flex justify-between items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 line-clamp-1">{toSafeString(test?.testName, 'Unknown Test')}</span>
                            <span className="text-xs font-black text-[#0D7C7C]">₹{Math.round(toSafeNumber(test?.price, 0))}</span>
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{toSafeString(test?.categoryName, 'General')}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden md:flex items-center gap-3 lg:gap-6 shrink-0 border-r border-slate-100 pr-4 lg:pr-6">
          {(!isAuthenticated || role === 'PATIENT' || !role) && quickActions.map((action, idx) => (
            action.href ? (
              <Link
                key={`action-${idx}`}
                to={action.href}
                className="flex flex-col items-center group transition-all active:scale-90"
              >
                <action.Icon className={`w-5 h-5 ${action.color} group-hover:scale-110 transition-all`} strokeWidth={3} />
                <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-700 mt-1 group-hover:text-[#0D7C7C]">
                  {action.label}
                </span>
              </Link>
            ) : (
              <button
                key={`action-${idx}`}
                onClick={action.action}
                className="flex flex-col items-center group transition-all active:scale-90"
              >
                <action.Icon className={`w-5 h-5 ${action.color} group-hover:scale-110 transition-all`} strokeWidth={3} />
                <span className="text-[10px] font-bold uppercase tracking-tighter text-slate-700 mt-1 group-hover:text-[#0D7C7C]">
                  {action.label}
                </span>
              </button>
            )
          ))}

          {isOpsRole && (
            <div className="hidden md:flex items-center gap-4 lg:gap-6">
              {quickAccessOps.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={`ops-quick-${item.label}`}
                    to={item.path}
                    className="flex flex-col items-center group transition-all active:scale-90 cursor-pointer"
                  >
                    <Icon className={`w-5 h-5 ${item.color} group-hover:scale-110 transition-all`} strokeWidth={3} />
                    <span className={`text-[10px] font-bold uppercase tracking-tighter mt-1 whitespace-nowrap ${item.color}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {!isOpsRole && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-slate-50 text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={3} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#EF4444] text-white text-[9px] font-black h-5 w-5 flex items-center justify-center rounded-full shadow-lg border-2 border-white">
                  {cartItemCount}
                </span>
              )}
            </motion.button>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <NotificationBell badgeCountOverride={role === 'PATIENT' ? patientUnreadCount : undefined} />
              <div
                className="relative"
                onMouseEnter={handleProfileMouseEnter}
                onMouseLeave={handleProfileMouseLeave}
              >
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-1 p-1 hover:bg-gray-50 rounded-xl transition-all"
                >
                  <div className="w-9 h-9 bg-linear-to-br from-[#0D7C7C] to-ocean-blue text-white rounded-full font-black text-sm flex items-center justify-center shadow-md border-2 border-white">
                    {userInitial}
                  </div>
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-2.5 w-64 bg-white/95 backdrop-blur-xl rounded-xl border border-slate-100 shadow-2xl overflow-hidden z-50"
                    >
                      <div className="bg-linear-to-br from-[#0D7C7C] to-ocean-blue px-3.5 py-3 text-white">
                        <p className="font-extrabold text-[0.95rem] tracking-tight leading-none mb-1">{userName}</p>
                        <div className="text-[9px] font-semibold px-2 py-0.5 rounded mt-1.5 w-fit"
                          style={{
                            background: role === 'ADMIN' ? '#FEF2F2' :
                                        role === 'TECHNICIAN' ? '#EFF6FF' :
                                        role === 'MEDICAL_OFFICER' ? '#F0FDF4' : '#E0F2FE',
                            color: role === 'ADMIN' ? '#DC2626' :
                                   role === 'TECHNICIAN' ? '#1D4ED8' :
                                   role === 'MEDICAL_OFFICER' ? '#15803D' : '#0369A1',
                          }}>
                          {role === 'MEDICAL_OFFICER' ? 'Medical Officer' : 
                           role === 'TECHNICIAN' ? 'Technician' :
                           role === 'ADMIN' ? 'Admin' : 'Patient'}
                        </div>
                      </div>
                      <div className="py-1">
                        {(!role || role === 'PATIENT') && profileMenuItems.map((item, idx) => {
                          const Icon = item.icon;
                          const active = isMenuItemActive(item.path);
                          return (
                            <Link
                              key={`pmenu-${idx}`}
                              to={item.path}
                              onClick={() => setShowProfileMenu(false)}
                              className={`w-full text-left px-3.5 py-2 text-[10px] font-bold flex items-center justify-between group transition-colors block ${active ? 'bg-cyan-50 text-[#0D7C7C]' : 'text-slate-700 hover:bg-slate-50 hover:text-[#0D7C7C]'}`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon size={12} className={active ? 'text-[#0D7C7C]' : 'text-slate-400 group-hover:text-[#0D7C7C]'} />
                                <span className="uppercase tracking-tight">{item.label}</span>
                              </div>
                              <ArrowRight size={9} className="opacity-0 group-hover:opacity-100" />
                            </Link>
                          );
                        })}

                        {role === 'ADMIN' && adminMenuItems.map((item, idx) => {
                          const Icon = item.icon;
                          const active = isMenuItemActive(item.path);
                          return (
                            <Link
                              key={`admin-menu-${idx}`}
                              to={item.path}
                              onClick={() => setShowProfileMenu(false)}
                              className={`w-full text-left px-3.5 py-2 text-[10px] font-bold flex items-center justify-between group transition-colors block ${active ? 'bg-cyan-50 text-[#0D7C7C]' : 'text-slate-700 hover:bg-slate-50 hover:text-[#0D7C7C]'}`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon size={12} className={active ? 'text-[#0D7C7C]' : 'text-slate-400 group-hover:text-[#0D7C7C]'} />
                                <span className="uppercase tracking-tight">{item.label}</span>
                              </div>
                              <ArrowRight size={9} className="opacity-0 group-hover:opacity-100" />
                            </Link>
                          );
                        })}

                        {role === 'TECHNICIAN' && technicianMenuItems.map((item, idx) => {
                          const Icon = item.icon;
                          const active = isMenuItemActive(item.path);
                          return (
                            <Link
                              key={`tech-menu-${idx}`}
                              to={item.path}
                              onClick={() => setShowProfileMenu(false)}
                              className={`w-full text-left px-3.5 py-2 text-[10px] font-bold flex items-center justify-between group transition-colors block ${active ? 'bg-cyan-50 text-[#0D7C7C]' : 'text-slate-700 hover:bg-slate-50 hover:text-[#0D7C7C]'}`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon size={12} className={active ? 'text-[#0D7C7C]' : 'text-slate-400 group-hover:text-[#0D7C7C]'} />
                                <span className="uppercase tracking-tight">{item.label}</span>
                              </div>
                              <ArrowRight size={9} className="opacity-0 group-hover:opacity-100" />
                            </Link>
                          );
                        })}

                        {role === 'MEDICAL_OFFICER' && medicalOfficerMenuItems.map((item, idx) => {
                          const Icon = item.icon;
                          const active = isMenuItemActive(item.path);
                          return (
                            <Link
                              key={`mo-menu-${idx}`}
                              to={item.path}
                              onClick={() => setShowProfileMenu(false)}
                              className={`w-full text-left px-3.5 py-2 text-[10px] font-bold flex items-center justify-between group transition-colors block ${active ? 'bg-cyan-50 text-[#0D7C7C]' : 'text-slate-700 hover:bg-slate-50 hover:text-[#0D7C7C]'}`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon size={12} className={active ? 'text-[#0D7C7C]' : 'text-slate-400 group-hover:text-[#0D7C7C]'} />
                                <span className="uppercase tracking-tight">{item.label}</span>
                              </div>
                              <ArrowRight size={9} className="opacity-0 group-hover:opacity-100" />
                            </Link>
                          );
                        })}
                        <div className="h-px bg-slate-100 my-1 mx-2" />
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            logout();
                          }}
                          className="w-full text-left px-3.5 py-2 text-[10px] font-extrabold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors uppercase tracking-tight"
                        >
                          <LogOut size={12} />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-2 text-slate-800 font-bold text-[12px] uppercase tracking-widest hover:text-[#0D7C7C] transition-colors"
              >
                LOGIN
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="px-5 lg:px-7 py-2.5 bg-[#0D7C7C] text-white font-bold rounded-full hover:bg-[#084747] shadow-xl shadow-[#0D7C7C]/20 transition-all active:scale-95 text-[12px] uppercase tracking-widest"
              >
                SIGN UP
              </button>
            </div>
          )}
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 text-slate-600">
            {isMobileMenuOpen ? <X strokeWidth={3} /> : <Menu strokeWidth={3} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
