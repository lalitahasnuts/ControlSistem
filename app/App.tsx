// App.tsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './src/contexts/AuthContext';
import RoutesConfig from './routes';
import Header from './src/components/Header';
import Sidebar from './src/components/Sidebar';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Sidebar />
        <RoutesConfig />
      </Router>
    </AuthProvider>
  );
};

export default App;