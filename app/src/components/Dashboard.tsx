// src/components/Dashboard.tsx
import * as React from 'react';
import { useProjects, useDefects } from '../hooks/useData';
import { useEffect } from 'react';

const Dashboard = () => {
  const projects = useProjects(); // Специфический хук для проектов
  const defects = useDefects('someProjectId'); // Специфический хук для дефектов конкретного проекта

  // Тут можем использовать эффект, если нужно
  useEffect(() => {
    // Дополнительная логика, если требуется
  }, []);

  return (
    <main className="ml-64 mt-16 p-4 bg-gray-100 min-h-screen">
      {/* Сюда выводится общий список проектов и дефектов */}
      <h1 className="text-2xl font-semibold mb-4">Панель мониторинга</h1>
      <p>Обзор всех текущих проектов и зарегистрированных дефектов:</p>
      
      <ul>
        {projects.map((project) => (
          <li key={project.id}>{project.name}</li>
        ))}
      </ul>

      <ul>
        {defects.map((defect) => (
          <li key={defect.id}>{defect.description}</li>
        ))}
      </ul>
    </main>
  );
};

export default Dashboard;