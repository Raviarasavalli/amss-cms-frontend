import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, DollarSign, BarChart3, Settings } from 'lucide-react';
import { useViewer } from '../../context/ViewerContext';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/members', icon: Users, label: 'Members' },
  { to: '/contributions', icon: DollarSign, label: 'Contributions' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings', adminOnly: true },
];

const BottomNav = () => {
  const { isViewer } = useViewer();

  const items = navItems.filter((item) => !item.adminOnly || !isViewer);

  return (
    <nav className="bottom-nav sm:hidden no-print">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        >
          {({ isActive }) => (
            <>
              <Icon size={20} />
              <span>{label}</span>
              {isActive && <div className="nav-dot" />}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
