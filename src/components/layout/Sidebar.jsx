import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, DollarSign, BarChart3,
  Settings, LogOut, ChevronLeft, ChevronRight,
  Building2, User, Eye, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useViewer } from '../../context/ViewerContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/members', icon: Users, label: 'Members' },
  { to: '/contributions', icon: DollarSign, label: 'Contributions' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings', adminOnly: true },
  { to: '/profile', icon: User, label: 'Profile' },
];

const SidebarContent = ({ collapsed, isMobile = false, onItemClick }) => {
  const { user, logout } = useAuth();
  const { isViewer, toggleViewerMode } = useViewer();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const filteredItems = navItems.filter((item) => !item.adminOnly || !isViewer);

  return (
    <div className="flex flex-col h-full select-none" style={{ background: 'var(--bg-sidebar)' }}>
      {/* Brand Header */}
      <div className={`flex items-center gap-3 p-4 border-b ${collapsed && !isMobile ? 'justify-center' : ''}`} style={{ borderColor: 'var(--border)' }}>
        <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 shadow-md border" style={{ borderColor: 'var(--border)' }}>
          <img src="/logo.jpg" alt="A.M.S. Society Logo" className="w-full h-full object-cover" />
        </div>
        {(!collapsed || isMobile) && (
          <div className="flex flex-col min-w-0">
            <h1 className="font-bold text-sm leading-tight flex items-center gap-1.5" style={{ color: 'var(--text-1)' }}>
              A.M.S. SOCIETY
            </h1>
            <span className="text-xs truncate" style={{ color: 'var(--text-3)' }}>
              {isViewer ? 'Read-Only Viewer' : 'Admin Panel'}
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onItemClick}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'active' : ''} ${collapsed && !isMobile ? 'justify-center px-2' : ''}`
            }
            title={collapsed && !isMobile ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {(!collapsed || isMobile) && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Mode Switcher & Footer */}
      <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
        {/* Mode Toggle Button */}
        <button
          onClick={toggleViewerMode}
          className={`w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold transition-all ${
            isViewer
              ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 hover:bg-amber-500/20'
              : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 hover:bg-indigo-500/20'
          } ${collapsed && !isMobile ? 'justify-center px-2' : ''}`}
          title={isViewer ? 'Switch to Admin Mode' : 'Switch to Viewer Mode'}
        >
          {isViewer ? <Eye size={16} className="flex-shrink-0" /> : <ShieldCheck size={16} className="flex-shrink-0" />}
          {(!collapsed || isMobile) && (
            <span>{isViewer ? 'Viewer Mode' : 'Admin Mode'}</span>
          )}
        </button>

        {/* User Card */}
        {(!collapsed || isMobile) && (
          <div className="flex items-center gap-2.5 p-2 rounded-xl" style={{ background: 'var(--bg-card)' }}>
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate" style={{ color: 'var(--text-1)' }}>{user?.name}</p>
              <p className="text-[10px] truncate" style={{ color: 'var(--text-3)' }}>{user?.email}</p>
            </div>
          </div>
        )}

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`nav-link w-full text-red-500 hover:bg-red-500/10 hover:text-red-500 ${collapsed && !isMobile ? 'justify-center px-2' : ''}`}
          title={collapsed && !isMobile ? 'Logout' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

const Sidebar = ({ collapsed, setCollapsed }) => {
  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 hidden sm:flex flex-col transition-all duration-300 ease-in-out border-r no-print ${
        collapsed ? 'w-16' : 'w-64'
      }`}
      style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}
    >
      <SidebarContent collapsed={collapsed} />

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center border shadow-md transition-all"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-2)' }}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  );
};

export { SidebarContent };
export default Sidebar;
