import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, List, Statistic, Row, Col, Table } from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { Project, Defect } from '../types';
import { projectService, defectService } from '../services/api';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadProject();
      loadDefects();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      if (id) {
        const data = await projectService.getById(id);
        setProject(data);
      }
    } catch (error) {
      console.error('Error loading project:', error);
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  const loadDefects = async () => {
    try {
      if (id) {
        const data = await defectService.getAll({ projectId: id });
        setDefects(data);
      }
    } catch (error) {
      console.error('Error loading defects:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'blue';
      case 'in_progress': return 'orange';
      case 'on_hold': return 'red';
      case 'completed': return 'green';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'planned': return 'Планируется';
      case 'in_progress': return 'В работе';
      case 'on_hold': return 'Приостановлен';
      case 'completed': return 'Завершен';
      default: return status;
    }
  };

  const defectColumns = [
    {
      title: 'Заголовок',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Defect) => (
        <Button type="link" onClick={() => navigate(`/defects/${record.id}`)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Приоритет',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => (
        <Tag color={
          priority === 'low' ? 'blue' : 
          priority === 'medium' ? 'orange' : 
          priority === 'high' ? 'red' : 'purple'
        }>
          {priority === 'low' ? 'Низкий' : 
           priority === 'medium' ? 'Средний' : 
           priority === 'high' ? 'Высокий' : 'Критический'}
        </Tag>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={
          status === 'new' ? 'blue' : 
          status === 'in_progress' ? 'orange' : 
          status === 'under_review' ? 'purple' : 
          status === 'resolved' ? 'green' : 'red'
        }>
          {status === 'new' ? 'Новый' : 
           status === 'in_progress' ? 'В работе' : 
           status === 'under_review' ? 'На проверке' : 
           status === 'resolved' ? 'Решен' : 'Отменен'}
        </Tag>
      ),
    },
    {
      title: 'Срок',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
  ];

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Загрузка...</div>;
  }

  if (!project) {
    return <div style={{ padding: '24px' }}>Проект не найден</div>;
  }

  const criticalDefects = defects.filter(d => d.priority === 'critical').length;
  const highDefects = defects.filter(d => d.priority === 'high').length;
  const resolvedDefects = defects.filter(d => d.status === 'resolved').length;

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/projects')}>
            Назад к списку
          </Button>
          <Button 
            icon={<EditOutlined />}
            onClick={() => navigate(`/projects?edit=${project.id}`)}
          >
            Редактировать
          </Button>
        </div>

        <Descriptions 
          title={`Проект: ${project.name}`} 
          bordered 
          column={2}
          style={{ marginBottom: '24px' }}
        >
          <Descriptions.Item label="Описание" span={2}>
            {project.description}
          </Descriptions.Item>
          <Descriptions.Item label="Адрес">
            {project.address}
          </Descriptions.Item>
          <Descriptions.Item label="Статус">
            <Tag color={getStatusColor(project.status)}>
              {getStatusText(project.status)}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Дата начала">
            {new Date(project.startDate).toLocaleDateString('ru-RU')}
          </Descriptions.Item>
          <Descriptions.Item label="Дата окончания">
            {new Date(project.endDate).toLocaleDateString('ru-RU')}
          </Descriptions.Item>
          <Descriptions.Item label="Менеджер">
            {project.manager ? `${project.manager.firstName} ${project.manager.lastName}` : 'Не назначен'}
          </Descriptions.Item>
        </Descriptions>

        {/* Статистика */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Всего дефектов" value={defects.length} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Критические" value={criticalDefects} valueStyle={{ color: '#cf1322' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Высокий приоритет" value={highDefects} valueStyle={{ color: '#fa541c' }} />
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <Statistic title="Решено" value={resolvedDefects} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
        </Row>

        {/* Список дефектов */}
        <Card title="Дефекты проекта" size="small">
          <Table
            columns={defectColumns}
            dataSource={defects}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </Card>
      </Card>
    </div>
  );
};

export default ProjectDetail;