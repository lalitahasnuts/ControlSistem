import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Button, Card, Tag, Space, Modal, Form, Input, Select, DatePicker, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { Project, ProjectStatus, UserRole } from '../types';
import { projectService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectService.getAll();
      setProjects(data);
    } catch (error) {
      message.error('Ошибка загрузки проектов');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingProject(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setModalVisible(true);
    form.setFieldsValue({
      ...project,
      startDate: project.startDate ? dayjs(project.startDate) : null,
      endDate: project.endDate ? dayjs(project.endDate) : null,
    });
  };

  const handleDelete = (project: Project) => {
    Modal.confirm({
      title: 'Удаление проекта',
      content: `Вы уверены, что хотите удалить проект "${project.name}"?`,
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          await projectService.delete(project.id);
          message.success('Проект успешно удален');
          loadProjects();
        } catch (error) {
          message.error('Ошибка при удалении проекта');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const projectData = {
        ...values,
        startDate: values.startDate?.toISOString(),
        endDate: values.endDate?.toISOString(),
        managerId: currentUser?.id,
      };

      if (editingProject) {
        await projectService.update(editingProject.id, projectData);
        message.success('Проект успешно обновлен');
      } else {
        await projectService.create(projectData);
        message.success('Проект успешно создан');
      }
      
      setModalVisible(false);
      loadProjects();
    } catch (error) {
      message.error('Ошибка при сохранении проекта');
    }
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNED: return 'blue';
      case ProjectStatus.IN_PROGRESS: return 'orange';
      case ProjectStatus.ON_HOLD: return 'red';
      case ProjectStatus.COMPLETED: return 'green';
      default: return 'default';
    }
  };

  const getStatusText = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNED: return 'Планируется';
      case ProjectStatus.IN_PROGRESS: return 'В работе';
      case ProjectStatus.ON_HOLD: return 'Приостановлен';
      case ProjectStatus.COMPLETED: return 'Завершен';
      default: return status;
    }
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Project) => (
        <Button type="link" onClick={() => navigate(`/projects/${record.id}`)}>
          {text}
        </Button>
      ),
    },
    {
      title: 'Адрес',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: ProjectStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Дата начала',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Дата окончания',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Project) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => navigate(`/projects/${record.id}`)}
          >
            Просмотр
          </Button>
          {(currentUser?.role === UserRole.MANAGER || currentUser?.role === UserRole.ADMIN) && (
            <>
              <Button 
                icon={<EditOutlined />} 
                size="small"
                onClick={() => handleEdit(record)}
              >
                Редактировать
              </Button>
              <Button 
                icon={<DeleteOutlined />} 
                size="small" 
                danger
                onClick={() => handleDelete(record)}
              >
                Удалить
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1>Управление проектами</h1>
          {(currentUser?.role === UserRole.MANAGER || currentUser?.role === UserRole.ADMIN) && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Создать проект
            </Button>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={projects}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total: number, range: [number, number]) => 
              `Показано ${range[0]}-${range[1]} из ${total} проектов`,
          }}
        />
      </Card>

      <Modal
        title={editingProject ? 'Редактирование проекта' : 'Создание проекта'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Название проекта"
            rules={[{ required: true, message: 'Введите название проекта' }]}
          >
            <Input placeholder="Введите название проекта" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
            rules={[{ required: true, message: 'Введите описание проекта' }]}
          >
            <TextArea rows={4} placeholder="Опишите проект" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Адрес"
            rules={[{ required: true, message: 'Введите адрес проекта' }]}
          >
            <Input placeholder="Введите адрес строительства" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Статус"
            rules={[{ required: true, message: 'Выберите статус' }]}
          >
            <Select placeholder="Выберите статус">
              <Option value={ProjectStatus.PLANNED}>Планируется</Option>
              <Option value={ProjectStatus.IN_PROGRESS}>В работе</Option>
              <Option value={ProjectStatus.ON_HOLD}>Приостановлен</Option>
              <Option value={ProjectStatus.COMPLETED}>Завершен</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Дата начала"
            rules={[{ required: true, message: 'Выберите дату начала' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="Дата окончания"
            rules={[{ required: true, message: 'Выберите дату окончания' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingProject ? 'Обновить' : 'Создать'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Projects;