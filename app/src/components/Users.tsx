import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Tag, Space, Modal, Form, Input, Select, message, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { User, UserRole } from '../types';
import { userService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const { Option } = Select;

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const { currentUser } = useAuth();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      message.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setModalVisible(true);
    form.resetFields();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setModalVisible(true);
    form.setFieldsValue({
      ...user,
      password: '' // Не показываем пароль
    });
  };

  const handleDelete = (user: User) => {
    if (user.id === currentUser?.id) {
      message.error('Нельзя удалить собственный аккаунт');
      return;
    }

    Modal.confirm({
      title: 'Удаление пользователя',
      content: `Вы уверены, что хотите удалить пользователя ${user.firstName} ${user.lastName}?`,
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          await userService.delete(user.id);
          message.success('Пользователь успешно удален');
          loadUsers();
        } catch (error) {
          message.error('Ошибка при удалении пользователя');
        }
      },
    });
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        // При редактировании отправляем пароль только если он изменен
        const updateData = { ...values };
        if (!updateData.password) {
          delete updateData.password;
        }
        await userService.update(editingUser.id, updateData);
        message.success('Пользователь успешно обновлен');
      } else {
        await userService.create(values);
        message.success('Пользователь успешно создан');
      }
      
      setModalVisible(false);
      loadUsers();
    } catch (error) {
      message.error('Ошибка при сохранении пользователя');
    }
  };

  const handleStatusChange = async (user: User, isActive: boolean) => {
    try {
      await userService.update(user.id, { isActive });
      message.success(`Пользователь ${isActive ? 'активирован' : 'деактивирован'}`);
      loadUsers();
    } catch (error) {
      message.error('Ошибка при изменении статуса пользователя');
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'red';
      case UserRole.MANAGER: return 'orange';
      case UserRole.ENGINEER: return 'blue';
      case UserRole.OBSERVER: return 'green';
      default: return 'default';
    }
  };

  const getRoleText = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN: return 'Администратор';
      case UserRole.MANAGER: return 'Менеджер';
      case UserRole.ENGINEER: return 'Инженер';
      case UserRole.OBSERVER: return 'Наблюдатель';
      default: return role;
    }
  };

  const columns = [
    {
      title: 'Пользователь',
      key: 'user',
      render: (record: User) => (
        <Space>
          <UserOutlined />
          <span>{record.firstName} {record.lastName}</span>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (role: UserRole) => (
        <Tag color={getRoleColor(role)}>
          {getRoleText(role)}
        </Tag>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: User) => (
        <Switch
          checked={isActive}
          onChange={(checked) => handleStatusChange(record, checked)}
          disabled={record.id === currentUser?.id}
        />
      ),
    },
    {
      title: 'Дата регистрации',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => handleEdit(record)}
            disabled={record.id === currentUser?.id && currentUser?.role !== UserRole.ADMIN}
          >
            Редактировать
          </Button>
          <Button 
            icon={<DeleteOutlined />} 
            size="small" 
            danger
            onClick={() => handleDelete(record)}
            disabled={record.id === currentUser?.id}
          >
            Удалить
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1>Управление пользователями</h1>
          {currentUser?.role === UserRole.ADMIN && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
              Создать пользователя
            </Button>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total, range) => 
              `Показано ${range[0]}-${range[1]} из ${total} пользователей`,
          }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Редактирование пользователя' : 'Создание пользователя'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="firstName"
            label="Имя"
            rules={[{ required: true, message: 'Введите имя' }]}
          >
            <Input placeholder="Введите имя" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Фамилия"
            rules={[{ required: true, message: 'Введите фамилию' }]}
          >
            <Input placeholder="Введите фамилию" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Введите корректный email' }
            ]}
          >
            <Input placeholder="Введите email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[
              { required: !editingUser, message: 'Введите пароль' },
              { min: 6, message: 'Пароль должен содержать минимум 6 символов' }
            ]}
          >
            <Input.Password placeholder="Введите пароль" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Роль"
            rules={[{ required: true, message: 'Выберите роль' }]}
          >
            <Select placeholder="Выберите роль">
              <Option value={UserRole.ENGINEER}>Инженер</Option>
              <Option value={UserRole.MANAGER}>Менеджер</Option>
              <Option value={UserRole.OBSERVER}>Наблюдатель</Option>
              {currentUser?.role === UserRole.ADMIN && (
                <Option value={UserRole.ADMIN}>Администратор</Option>
              )}
            </Select>
          </Form.Item>

          {editingUser && (
            <Form.Item
              name="isActive"
              label="Активен"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Обновить' : 'Создать'}
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

export default Users;