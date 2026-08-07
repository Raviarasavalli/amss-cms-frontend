import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar, { SidebarContent } from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import BottomNav from '../components/layout/BottomNav';
import { Drawer } from '../components/ui';
import { useViewer } from '../context/ViewerContext';
import { Plus } from 'lucide-react';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const { isViewer } = useViewer();
  const navigate = useNavigate();
  const location = useLocation();

  const handleFabClick = () => {
    if (location.pathname.startsWith('/members')) {
      navigate('/members?action=new');
    } else if (location.pathname.startsWith('/contributions')) {
      navigate('/contributions?action=new');
    } else {
      navigate('/members?action=new');
    }
  };

  return (
    <div className="page-wrapper flex flex-col min-h-dvh">
      {/* Viewer Banner */}
      {isViewer && (
        <div className="viewer-banner flex items-center justify-center gap-2 no-print">
          <span>👁 You are in <strong>Viewer Mode</strong> (Read-Only). Administrative actions are hidden.</span>
        </div>
      )}

      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <Navbar collapsed={collapsed} setMobileDrawerOpen={setMobileDrawerOpen} />

      {/* Mobile Drawer Navigation */}
      <Drawer open={mobileDrawerOpen} onClose={() => setMobileDrawerOpen(false)}>
        <SidebarContent collapsed={false} isMobile onItemClick={() => setMobileDrawerOpen(false)} />
      </Drawer>

      {/* Main Content Viewport */}
      <main
        className={`flex-1 transition-all duration-300 ease-in-out pb-20 sm:pb-8 ${
          collapsed ? 'sm:ml-16' : 'sm:ml-64'
        }`}
      >
        <div className="content-area max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Floating Action Button for Mobile/Admin */}
      {!isViewer && (
        <button
          onClick={handleFabClick}
          className="fab sm:hidden no-print"
          title="Quick Add"
          aria-label="Quick Add"
        >
          <Plus size={24} />
        </button>
      )}

      {/* Bottom Navigation Bar for Mobile */}
      <BottomNav />
    </div>
  );
};

export default AdminLayout;
