import { Menu, Eye, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useViewer } from '../../context/ViewerContext';
import { useLocation, Link } from 'react-router-dom';

const pageTitles = {
  '/dashboard': 'Dashboard Overview',
  '/members': 'Member Directory',
  '/contributions': 'Contributions Ledger',
  '/reports': 'Financial Reports',
  '/settings': 'Organization Settings',
  '/profile': 'My Account',
};

const Navbar = ({ collapsed, setMobileDrawerOpen }) => {
  const { user } = useAuth();
  const { isViewer, toggleViewerMode } = useViewer();
  const location = useLocation();

  const title = pageTitles[location.pathname] ||
    Object.entries(pageTitles).find(([k]) => location.pathname.startsWith(k))?.[1] || 'AMSS CMS';

  return (
    <header
      className={`sticky top-0 z-30 h-16 transition-all duration-300 ease-in-out border-b backdrop-blur-md flex items-center px-4 sm:px-6 gap-3 no-print ${
        collapsed ? 'sm:ml-16' : 'sm:ml-64'
      }`}
      style={{ background: 'var(--bg-nav)', borderColor: 'var(--border)' }}
    >
      {/* Mobile Hamburger Menu */}
      <button
        onClick={() => setMobileDrawerOpen(true)}
        className="sm:hidden btn btn-ghost btn-icon p-1.5"
        aria-label="Open navigation menu"
      >
        <Menu size={22} />
      </button>

      {/* Page Title & Subtitle */}
      <div className="flex-1 min-w-0">
        <h2 className="font-bold text-base sm:text-lg truncate" style={{ color: 'var(--text-1)' }}>
          {title}
        </h2>
        <p className="text-xs truncate hidden md:block" style={{ color: 'var(--text-3)' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2">
        {/* Mode Pill Toggle */}
        <button
          onClick={toggleViewerMode}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
            isViewer
              ? 'bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20'
              : 'bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20'
          }`}
          title={isViewer ? 'Click to switch to Admin Mode' : 'Click to switch to Viewer Mode'}
        >
          {isViewer ? <Eye size={14} /> : <ShieldCheck size={14} />}
          <span className="hidden xs:inline">{isViewer ? 'Viewer' : 'Admin'}</span>
        </button>

        {/* User Profile Link */}
        <Link to="/profile" className="flex items-center gap-2 pl-1">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {user?.name?.charAt(0)?.toUpperCase() || <User size={14} />}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
