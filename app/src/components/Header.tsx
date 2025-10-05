import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-left">
        <h1>Система управления дефектами</h1>
      </div>
      <div className="header-right">
        <span>Добро пожаловать, {currentUser ? `${currentUser.firstName} ${currentUser.lastName}`.trim() || currentUser.email : 'Гость'}</span>
        <button onClick={logout} className="btn" style={{ marginLeft: '20px' }}>
          Выйти
        </button>
      </div>
    </header>
  );
};

export default Header;