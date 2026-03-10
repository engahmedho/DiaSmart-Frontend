import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Activity,
  History,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  ChevronRight,
  Heart
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isAdmin = user?.role === 'admin';

  const patientNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/predict', label: 'Risk Assessment', icon: Activity },
    { path: '/history', label: 'History', icon: History },
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', label: 'Admin Dashboard', icon: Shield },
    { path: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  ];

  const navItems = isAdmin && location.pathname.startsWith('/admin') ? adminNavItems : patientNavItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ width: 280 }}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col bg-white border-r border-gray-200 fixed h-full z-20"
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-blue-900 rounded-xl flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <h1 className="text-xl font-bold text-blue-900">DiaSmart</h1>
                  <p className="text-xs text-gray-500">Analytics</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-900 text-white shadow-lg shadow-blue-900/20'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence>
                {isSidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isSidebarOpen && (
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 transition-colors">
                <Avatar className="w-10 h-10 bg-blue-100">
                  <AvatarFallback className="bg-blue-900 text-white text-sm font-medium">
                    {getInitials(`${user?.first_name} ${user?.last_name}`)}
                  </AvatarFallback>
                </Avatar>
                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="flex-1 text-left"
                    >
                      <p className="font-medium text-gray-900 truncate">
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <User className="w-4 h-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-24 w-6 h-6 bg-blue-900 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-800 transition-colors"
        >
          <motion.div
            animate={{ rotate: isSidebarOpen ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronRight className="w-3 h-3" />
          </motion.div>
        </button>
      </motion.aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-blue-900">DiaSmart</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed top-16 left-0 right-0 bg-white border-b border-gray-200 z-20 shadow-lg"
          >
            <nav className="p-4 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }: { isActive: boolean }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-blue-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              ))}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-[80px]'
        }`}
      >
        <div className="lg:pt-0 pt-16 min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
