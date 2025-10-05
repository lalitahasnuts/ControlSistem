import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, Button, Card, Tag, Space, Modal, Form, Input, Select, 
  DatePicker, InputNumber, Row, Col, message 
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, FilterOutlined } from '@ant-design/icons';
import { Defect, Priority, DefectStatus, Project, User } from '../types';
import { defectService, projectService, userService } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Search } = Input;

const Defects: React.FC = () => {
  const [defects, setDefects] = useState<Defect[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDefect, setEditingDefect] = useState<Defect | null>(null);
  const [filters, setFilters] = useState<any>({});
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadDefects();
  }, [filters]);

  const loadData = async () => {
    try {
      const [defectsData, projectsData, usersData] = await Promise.all([
        defectService.getAll(),
        projectService.getAll(),
        userService.getAll(),
      ]);
      setDefects(defectsData);
      setProjects(projectsData);
      setUsers(usersData);
    } catch (error) {
      message.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const loadDefects = async () => {
    try {
      const data = await defectService.getAll(filters);
      setDefects(data);
    } catch (error) {
      message.error('Ошибка загрузки дефектов');
    }
  };

  const handleCreate = () => {
    setEditingDefect(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (defect: Defect) => {
    setEditingDefect(defect);
    setModalVisible(true);
    form.setFieldsValue({
      ...defect,
      dueDate: defect.dueDate ? dayjs(defect.dueDate) : null,
    });
  };

  const handleDelete = (defect: Defect) => {
    Modal.confirm({
      title: 'Удаление дефекта',
      content: `Вы уверены, что хотите удалить дефект "${defect.title}"?`,
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          await defectService.delete(defect.id);
          message.success('Дефект успешно удален');
          loadDefects();
        } catch (error) {
          message.error('Ошибка при удалении дефекта');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      const defectData = {
        ...values,
        dueDate: values.dueDate?.toISOString(),
        reporterId: currentUser?.id,
      };

      if (editingDefect) {
        await defectService.update(editingDefect.id, defectData);
        message.success('Дефект успешно обновлен');
      } else {
        await defectService.create(defectData);
        message.success('Дефект успешно создан');
      }
      
      setModalVisible(false);
      loadDefects();
    } catch (error) {
      message.error('Ошибка при сохранении дефекта');
    }
  };

  const handleSearch = (value: string) => {
    setFilters((prev: any) => ({ ...prev, search: value }));
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev: any) => ({ 
      ...prev, 
      [key]: value 
    }));
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW: return 'blue';
      case Priority.MEDIUM: return 'orange';
      case Priority.HIGH: return 'red';
      case Priority.CRITICAL: return 'purple';
      default: return 'default';
    }
  };

  const getPriorityText = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW: return 'Низкий';
      case Priority.MEDIUM: return 'Средний';
      case Priority.HIGH: return 'Высокий';
      case Priority.CRITICAL: return 'Критический';
      default: return priority;
    }
  };

  const getStatusColor = (status: DefectStatus) => {
    switch (status) {
      case DefectStatus.NEW: return 'blue';
      case DefectStatus.IN_PROGRESS: return 'orange';
      case DefectStatus.UNDER_REVIEW: return 'purple';
      case DefectStatus.RESOLVED: return 'green';
      case DefectStatus.CANCELLED: return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: DefectStatus) => {
    switch (status) {
      case DefectStatus.NEW: return 'Новый';
      case DefectStatus.IN_PROGRESS: return 'В работе';
      case DefectStatus.UNDER_REVIEW: return 'На проверке';
      case DefectStatus.RESOLVED: return 'Решен';
      case DefectStatus.CANCELLED: return 'Отменен';
      default: return status;
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
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
      title: 'Проект',
      dataIndex: 'project',
      key: 'project',
      render: (project: Project) => project?.name,
    },
    {
      title: 'Приоритет',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: Priority) => (
        <Tag color={getPriorityColor(priority)}>
          {getPriorityText(priority)}
        </Tag>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: DefectStatus) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Исполнитель',
      dataIndex: 'assignee',
      key: 'assignee',
      render: (assignee: User) => 
        assignee ? `${assignee.firstName} ${assignee.lastName}` : '-',
    },
    {
      title: 'Срок',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: Defect) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => navigate(`/defects/${record.id}`)}
          >
            Просмотр
          </Button>
          {(currentUser?.role === 'manager' || currentUser?.role === 'admin' || currentUser?.id === record.reporterId) && (
            <Button 
              icon={<EditOutlined />} 
              size="small"
              onClick={() => handleEdit(record)}
            >
              Редактировать
            </Button>
          )}
          {(currentUser?.role === 'manager' || currentUser?.role === 'admin') && (
            <Button 
              icon={<DeleteOutlined />} 
              size="small" 
              danger
              onClick={() => handleDelete(record)}
            >
              Удалить
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1>Управление дефектами</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Создать дефект
          </Button>
        </div>

        {/* Фильтры */}
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <Search
                placeholder="Поиск по заголовку и описанию"
                onSearch={handleSearch}
                allowClear
              />
            </Col>
            <Col xs={12} sm={4}>
              <Select
                placeholder="Статус"
                style={{ width: '100%' }}
                allowClear
                onChange={(value) => handleFilterChange('status', value)}
              >
                <Option value={DefectStatus.NEW}>Новый</Option>
                <Option value={DefectStatus.IN_PROGRESS}>В работе</Option>
                <Option value={DefectStatus.UNDER_REVIEW}>На проверке</Option>
                <Option value={DefectStatus.RESOLVED}>Решен</Option>
                <Option value={DefectStatus.CANCELLED}>Отменен</Option>
              </Select>
            </Col>
            <Col xs={12} sm={4}>
              <Select
                placeholder="Приоритет"
                style={{ width: '100%' }}
                allowClear
                onChange={(value) => handleFilterChange('priority', value)}
              >
                <Option value={Priority.LOW}>Низкий</Option>
                <Option value={Priority.MEDIUM}>Средний</Option>
                <Option value={Priority.HIGH}>Высокий</Option>
                <Option value={Priority.CRITICAL}>Критический</Option>
              </Select>
            </Col>
            <Col xs={12} sm={4}>
              <Select
                placeholder="Проект"
                style={{ width: '100%' }}
                allowClear
                onChange={(value) => handleFilterChange('projectId', value)}
              >
                {projects.map(project => (
                  <Option key={project.id} value={project.id}>
                    {project.name}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={4}>
              <Button 
                icon={<FilterOutlined />}
                onClick={() => setFilters({})}
              >
                Сбросить
              </Button>
            </Col>
          </Row>
        </Card>

        <Table
          columns={columns}
          dataSource={defects}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `Показано ${range[0]}-${range[1]} из ${total} дефектов`,
          }}
        />
      </Card>

      <Modal
        title={editingDefect ? 'Редактирование дефекта' : 'Создание дефекта'}
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
            name="title"
            label="Заголовок"
            rules={[{ required: true, message: 'Введите заголовок дефекта' }]}
          >
            <Input placeholder="Введите заголовок дефекта" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
            rules={[{ required: true, message: 'Введите описание дефекта' }]}
          >
            <TextArea rows={4} placeholder="Подробно опишите дефект..." />
          </Form.Item>

          <Form.Item
            name="projectId"
            label="Проект"
            rules={[{ required: true, message: 'Выберите проект' }]}
          >
            <Select placeholder="Выберите проект">
              {projects.map(project => (
                <Option key={project.id} value={project.id}>
                  {project.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="priority"
            label="Приоритет"
            rules={[{ required: true, message: 'Выберите приоритет' }]}
          >
            <Select placeholder="Выберите приоритет">
              <Option value={Priority.LOW}>Низкий</Option>
              <Option value={Priority.MEDIUM}>Средний</Option>
              <Option value={Priority.HIGH}>Высокий</Option>
              <Option value={Priority.CRITICAL}>Критический</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="assigneeId"
            label="Исполнитель"
            rules={[{ required: true, message: 'Выберите исполнителя' }]}
          >
            <Select placeholder="Выберите исполнителя">
              {users
                .filter(user => user.role === 'engineer' || user.role === 'manager')
                .map(user => (
                  <Option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </Option>
                ))
              }
            </Select>
          </Form.Item>

          <Form.Item
            name="dueDate"
            label="Срок устранения"
            rules={[{ required: true, message: 'Выберите срок устранения' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          {editingDefect && (
            <Form.Item
              name="status"
              label="Статус"
              rules={[{ required: true, message: 'Выберите статус' }]}
            >
              <Select placeholder="Выберите статус">
                <Option value={DefectStatus.NEW}>Новый</Option>
                <Option value={DefectStatus.IN_PROGRESS}>В работе</Option>
                <Option value={DefectStatus.UNDER_REVIEW}>На проверке</Option>
                <Option value={DefectStatus.RESOLVED}>Решен</Option>
                <Option value={DefectStatus.CANCELLED}>Отменен</Option>
              </Select>
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingDefect ? 'Обновить' : 'Создать'}
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

export default Defects;