import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Дашборд' },
    { path: '/projects', label: 'Проекты' },
    { path: '/defects', label: 'Дефекты' },
    { path: '/reports', label: 'Отчеты' },
    { path: '/users', label: 'Пользователи' },
  ];

  return (
    <nav className="sidebar">
      <ul className="sidebar-menu">
        {menuItems.map(item => (
          <li
            key={item.path}
            className={location.pathname === item.path ? 'active' : ''}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;