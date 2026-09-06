import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from './NotificationBell';
import ProfileEditor from './ProfileEditor';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [editingProfile, setEditingProfile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { label: 'Home', to: '/' },
    { label: 'Find Doctors', to: '/doctors' },
    { label: 'Pharmacy', to: '/pharmacy' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getDashboardPath = (role) => {
    switch (role?.toLowerCase()) {
      case 'rider':
        return '/dashboard/rider';
      case 'doctor':
        return '/dashboard/doctor';
      case 'admin':
      case 'super_admin':
        return '/dashboard/admin';
      default:
        return '/dashboard/patient';
    }
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="navbar min-h-16 bg-base-100 dark:bg-slate-900 border-b border-base-200 dark:border-slate-800 shadow-md px-4 sm:px-8 relative z-50 transition-colors duration-300">
      {/* Brand Logo with Pulse Icon */}
      <div className="flex-1 min-w-0">
        <Link to="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-primary" onClick={closeMenu}>
          <svg
            className="w-8 h-8 stroke-primary fill-none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
          <span className="dark:text-white">CampusClinic</span>
        </Link>
      </div>

      <div className="flex-none gap-1 sm:gap-4 items-center">
        {/* Navigation Links */}
        <ul className="menu menu-horizontal px-1 hidden md:flex font-medium text-slate-700 dark:text-slate-200">
          {navigationItems.map((item) => (
            <li key={item.to}><Link to={item.to} className="hover:text-primary dark:hover:text-primary">{item.label}</Link></li>
          ))}
          <li><Link to="/emergency" className="text-error font-semibold">Emergency</Link></li>
        </ul>

        <button
          type="button"
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
          className="btn btn-ghost btn-circle md:hidden text-slate-700 dark:text-slate-200"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* 🌙 / ☀️ Theme Switcher Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle text-slate-600 dark:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? (
            /* Sun Icon for Dark Mode */
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0s-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41s-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
            </svg>
          ) : (
            /* Moon Icon for Light Mode */
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.3 2a10 10 0 0 0 9.7 11.5 10 10 0 1 1-10.5-11.5 8.1 8.1 0 0 0 .8 0z" />
            </svg>
          )}
        </button>

        {user ? (
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell Icon */}
            <NotificationBell />

            {/* User Avatar Dropdown */}
            <div className="dropdown dropdown-end z-[100]">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder border border-primary/20 cursor-pointer">
                <div className="bg-primary text-primary-content rounded-full w-10 flex items-center justify-center overflow-hidden">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold">{user.name ? user.name.charAt(0).toUpperCase() : user.role?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
              </label>
              <ul
                tabIndex={0}
                className="menu menu-sm dropdown-content mt-3 z-[100] p-2 shadow-2xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-box w-52 text-slate-800 dark:text-slate-100"
              >
                <li className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                  <p className="font-bold text-slate-800 dark:text-slate-100 text-sm p-0">{user.name || 'User'}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize p-0">Role: {user.role}</p>
                </li>
                <li className="mt-2">
                  <Link to={getDashboardPath(user.role)} className="font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button type="button" onClick={() => setEditingProfile(true)} className="font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 w-full text-left">
                    Edit Profile
                  </button>
                </li>

                {user.role?.toLowerCase() === 'doctor' && (
                  <li>
                    <Link to="/dashboard/doctor/schedule" className="font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                      Manage Schedule
                    </Link>
                  </li>
                )}

                <li>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="font-medium text-error hover:bg-error/10 dark:hover:bg-error/20 hover:text-error w-full text-left"
                  >
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="hidden sm:flex gap-2">
            <Link to="/login" className="btn btn-ghost btn-sm text-slate-700 dark:text-slate-200">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm text-white">Register</Link>
          </div>
        )}
      </div>
      {menuOpen && (
        <ul
          id="mobile-navigation"
          className="menu menu-sm absolute left-3 right-3 top-full mt-2 rounded-box border border-base-200 bg-base-100 p-2 shadow-xl dark:border-slate-700 dark:bg-slate-800 md:hidden"
        >
          {navigationItems.map((item) => (
            <li key={item.to}><Link to={item.to} onClick={closeMenu}>{item.label}</Link></li>
          ))}
          <li><Link to="/emergency" onClick={closeMenu} className="font-semibold text-error">Emergency</Link></li>
          {!user && (
            <>
              <li className="mt-1 border-t border-base-200 pt-1 dark:border-slate-700">
                <Link to="/login" onClick={closeMenu}>Login</Link>
              </li>
              <li><Link to="/register" onClick={closeMenu} className="font-semibold text-primary">Register</Link></li>
            </>
          )}
        </ul>
      )}
      {editingProfile && <ProfileEditor onClose={() => setEditingProfile(false)} />}
    </div>
  );
};

export default Navbar;