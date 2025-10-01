import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div>
      <h1>Дашборд</h1>
      <p>Добро пожаловать в систему управления дефектами строительных объектов</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <div style={{ background: '#f0f2f5', padding: '20px', borderRadius: '8px' }}>
          <h3>Проекты</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>5</p>
        </div>
        
        <div style={{ background: '#f0f2f5', padding: '20px', borderRadius: '8px' }}>
          <h3>Дефекты</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>12</p>
        </div>
        
        <div style={{ background: '#f0f2f5', padding: '20px', borderRadius: '8px' }}>
          <h3>В работе</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>8</p>
        </div>
        
        <div style={{ background: '#f0f2f5', padding: '20px', borderRadius: '8px' }}>
          <h3>Решено</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold' }}>4</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;