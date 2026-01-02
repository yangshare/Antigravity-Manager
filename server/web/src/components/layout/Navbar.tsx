import { Link, useLocation } from 'react-router-dom';
import { Home, Users, Settings, Activity } from 'lucide-react';

const navItems = [
  { path: '/', label: '仪表盘', icon: Home },
  { path: '/accounts', label: '账号管理', icon: Users },
  { path: '/proxy', label: 'API 代理', icon: Activity },
  { path: '/settings', label: '设置', icon: Settings },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <div className="navbar bg-base-100 shadow-lg">
      <div className="flex-1">
        <Link to="/" className="btn btn-ghost text-xl">
          🚀 Antigravity Manager
        </Link>
      </div>
      <div className="flex-none">
        <ul className="menu menu-horizontal px-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={isActive ? 'active' : ''}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
