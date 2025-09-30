import * as React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside className="bg-gray-800 text-white h-screen w-64 py-4 fixed top-0 left-0 overflow-y-auto z-10">
      <ul className="space-y-4 px-4">
        <li><Link to="/projects">Проекты</Link></li>
        <li><Link to="/defects">Дефекты</Link></li>
        <li><Link to="/reports">Отчеты</Link></li>
        <li><Link to="/users">Пользователи</Link></li>
        <li><Link to="/profile">Профиль</Link></li>
      </ul>
    </aside>
  );
};

export default Sidebar;