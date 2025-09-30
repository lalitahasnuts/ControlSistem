import { useState, useEffect } from 'react';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/dashboard" className="font-bold">Строительный Дефект-менеджмент</Link>
        <nav>
          {currentUser ? (
            <>
              <span>{`Привет, ${currentUser.name}`}</span> · 
              <button onClick={logout}>Выход</button>
            </>
          ) : (
            <>
              <Link to="/login">Войти</Link> · 
              <Link to="/signup">Регистрация</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;