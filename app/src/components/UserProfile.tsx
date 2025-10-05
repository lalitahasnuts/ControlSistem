import React from 'react';
import { Card, Descriptions, Button, Form, Input, message } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const UserProfile: React.FC = () => {
  const { currentUser } = useAuth();
  const [editing, setEditing] = React.useState(false);
  const [form] = Form.useForm();

  const handleSave = async (values: any) => {
    try {
      // Здесь будет вызов API для обновления профиля
      console.log('Profile update:', values);
      message.success('Профиль успешно обновлен');
      setEditing(false);
    } catch (error) {
      message.error('Ошибка при обновлении профиля');
    }
  };

  if (!currentUser) {
    return <div>Пользователь не найден</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1>
            <UserOutlined /> Мой профиль
          </h1>
          <Button 
            icon={editing ? <SaveOutlined /> : <EditOutlined />}
            type={editing ? "primary" : "default"}
            onClick={() => editing ? form.submit() : setEditing(true)}
          >
            {editing ? 'Сохранить' : 'Редактировать'}
          </Button>
        </div>

        {editing ? (
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              email: currentUser.email,
            }}
            onFinish={handleSave}
          >
            <Form.Item
              name="firstName"
              label="Имя"
              rules={[{ required: true, message: 'Введите имя' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Фамилия"
              rules={[{ required: true, message: 'Введите фамилию' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Введите email' },
                { type: 'email', message: 'Введите корректный email' }
              ]}
            >
              <Input />
            </Form.Item>
          </Form>
        ) : (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Имя">
              {currentUser.firstName}
            </Descriptions.Item>
            <Descriptions.Item label="Фамилия">
              {currentUser.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {currentUser.email}
            </Descriptions.Item>
            <Descriptions.Item label="Роль">
              {currentUser.role === 'admin' ? 'Администратор' :
               currentUser.role === 'manager' ? 'Менеджер' :
               currentUser.role === 'engineer' ? 'Инженер' : 'Наблюдатель'}
            </Descriptions.Item>
            <Descriptions.Item label="Статус">
              {currentUser.isActive ? 'Активен' : 'Неактивен'}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </div>
  );
};

export default UserProfile;