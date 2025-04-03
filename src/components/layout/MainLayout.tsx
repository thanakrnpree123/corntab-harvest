
import { ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  ChevronLeft,
  LayoutDashboard,
  Clock,
  ListChecks,
  Users,
  Settings,
  Moon,
  Sun
} from 'lucide-react';
import { useThemeContext } from '../MuiThemeProvider';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { mode, toggleTheme } = useThemeContext();
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { text: 'Jobs', icon: <Clock size={20} />, path: '/jobs' },
    { text: 'Logs', icon: <ListChecks size={20} />, path: '/logs' },
    { text: 'Users', icon: <Users size={20} />, path: '/users' },
    { text: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`bg-white fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out shadow-lg 
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:w-64`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <h1 className="text-xl font-bold">CronHub</h1>
          <button onClick={toggleSidebar} className="md:hidden">
            <ChevronLeft size={20} />
          </button>
        </div>
        <div className="overflow-y-auto h-full">
          <nav className="px-2 py-4">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.text}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center px-4 py-2 rounded-md text-sm hover:bg-gray-100 ${
                      location.pathname === item.path 
                        ? 'bg-blue-50 text-blue-600' 
                        : 'text-gray-600'
                    }`}
                  >
                    <span className="mr-3">
                      {item.icon}
                    </span>
                    {item.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white h-16 border-b flex items-center shadow-sm">
          <div className="px-4 flex justify-between items-center w-full">
            <button onClick={toggleSidebar} className="md:hidden">
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="ml-auto">
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Toggle theme"
              >
                {mode === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
