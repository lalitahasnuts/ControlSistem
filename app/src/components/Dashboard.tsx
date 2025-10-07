import React, { useState, useEffect } from 'react';
import { projectService, defectService } from '../services/api';
import { Project, Defect, DefectStatus } from '../types';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [projectsData, defectsData] = await Promise.all([
          projectService.getAll(),
          defectService.getAll()
        ]);
        
        setProjects(projectsData);
        setDefects(defectsData);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки данных:', err);
        setError('Не удалось загрузить данные');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Статистика дефектов
  const totalDefects = defects.length;
  const defectsInProgress = defects.filter(d => d.status === DefectStatus.IN_PROGRESS).length;
  const defectsResolved = defects.filter(d => d.status === DefectStatus.RESOLVED).length;
  const defectsNew = defects.filter(d => d.status === DefectStatus.NEW).length;
  
  // Дефекты по приоритету
  const criticalDefects = defects.filter(d => d.priority === 'critical').length;
  const highPriorityDefects = defects.filter(d => d.priority === 'high').length;
  
  // Проекты по статусу
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div>Загрузка данных...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ color: 'red' }}>{error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Дашборд</h1>
      <p>Добро пожаловать в систему управления дефектами строительных объектов</p>
      
      {/* Основная статистика */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
        <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #2196f3' }}>
          <h3>Проекты</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>{projects.length}</p>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Активных: {activeProjects} | Завершено: {completedProjects}
          </div>
        </div>
        
        <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #9c27b0' }}>
          <h3>Всего дефектов</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>{totalDefects}</p>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Новые: {defectsNew}
          </div>
        </div>
        
        <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #ff9800' }}>
          <h3>В работе</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>{defectsInProgress}</p>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Высокий приоритет: {highPriorityDefects}
          </div>
        </div>
        
        <div style={{ background: '#e8f5e8', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #4caf50' }}>
          <h3>Решено</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '10px 0' }}>{defectsResolved}</p>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {totalDefects > 0 ? Math.round((defectsResolved / totalDefects) * 100) : 0}% от общего числа
          </div>
        </div>
      </div>

      {/* Дополнительная статистика */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginTop: '30px' }}>
        {/* Статусы дефектов */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Статусы дефектов</h3>
          <div style={{ marginTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Новые</span>
              <span style={{ fontWeight: 'bold' }}>{defectsNew}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>В работе</span>
              <span style={{ fontWeight: 'bold' }}>{defectsInProgress}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>На проверке</span>
              <span style={{ fontWeight: 'bold' }}>
                {defects.filter(d => d.status === DefectStatus.UNDER_REVIEW).length}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Решено</span>
              <span style={{ fontWeight: 'bold' }}>{defectsResolved}</span>
            </div>
          </div>
        </div>

        {/* Приоритеты дефектов */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Приоритеты дефектов</h3>
          <div style={{ marginTop: '15px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#f44336' }}>Критический</span>
              <span style={{ fontWeight: 'bold' }}>{criticalDefects}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#ff9800' }}>Высокий</span>
              <span style={{ fontWeight: 'bold' }}>{highPriorityDefects}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#ffeb3b' }}>Средний</span>
              <span style={{ fontWeight: 'bold' }}>
                {defects.filter(d => d.priority === 'medium').length}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#4caf50' }}>Низкий</span>
              <span style={{ fontWeight: 'bold' }}>
                {defects.filter(d => d.priority === 'low').length}
              </span>
            </div>
          </div>
        </div>

        {/* Срочные дефекты */}
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Срочные дефекты</h3>
          <div style={{ marginTop: '15px' }}>
            {defects
              .filter(d => d.priority === 'critical' || d.priority === 'high')
              .slice(0, 5)
              .map(defect => (
                <div key={defect.id} style={{ 
                  padding: '8px', 
                  marginBottom: '5px', 
                  background: defect.priority === 'critical' ? '#ffebee' : '#fff3e0',
                  borderRadius: '4px',
                  borderLeft: `3px solid ${defect.priority === 'critical' ? '#f44336' : '#ff9800'}`
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{defect.title}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {defect.project?.name} • {defect.status}
                  </div>
                </div>
              ))}
            {defects.filter(d => d.priority === 'critical' || d.priority === 'high').length === 0 && (
              <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic' }}>
                Нет срочных дефектов
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Список проектов */}
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: '30px' }}>
        <h3>Активные проекты</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
          {projects.slice(0, 6).map(project => (
            <div key={project.id} style={{ 
              padding: '15px', 
              background: '#f8f9fa', 
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{project.name}</div>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                Дефектов: {defects.filter(d => d.projectId === project.id).length}
              </div>
              <div style={{ 
                fontSize: '11px', 
                padding: '2px 8px', 
                background: project.status === 'in_progress' ? '#e3f2fd' : 
                           project.status === 'completed' ? '#e8f5e8' : '#fff3e0',
                color: project.status === 'in_progress' ? '#1976d2' : 
                       project.status === 'completed' ? '#4caf50' : '#ff9800',
                borderRadius: '12px',
                display: 'inline-block'
              }}>
                {project.status === 'in_progress' ? 'В работе' : 
                 project.status === 'completed' ? 'Завершен' : 'Планируется'}
              </div>
            </div>
          ))}
        </div>
        {projects.length === 0 && (
          <div style={{ textAlign: 'center', color: '#666', fontStyle: 'italic', marginTop: '20px' }}>
            Нет активных проектов
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;