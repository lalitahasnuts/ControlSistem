import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Descriptions, 
  Tag, 
  Button, 
  List, 
  Form, 
  Input, 
  Upload, 
  message, 
  Space, 
  Modal 
} from 'antd';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { Defect, Comment as CommentType, User, DefectStatus } from '../types';
import { defectService, userService } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const { TextArea } = Input; // Исправлено здесь

const DefectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [defect, setDefect] = useState<Defect | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (id) {
      loadDefect();
      loadUsers();
    }
  }, [id]);

  const loadDefect = async () => {
    try {
      if (id) {
        const data = await defectService.getById(id);
        setDefect(data);
      }
    } catch (error) {
      message.error('Ошибка загрузки дефекта');
      navigate('/defects');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !id) return;

    setCommentLoading(true);
    try {
      await defectService.addComment(id, commentText);
      setCommentText('');
      loadDefect(); // Перезагружаем для получения обновленных комментариев
      message.success('Комментарий добавлен');
    } catch (error) {
      message.error('Ошибка при добавлении комментария');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!id) return false;

    try {
      await defectService.uploadAttachment(id, file);
      message.success('Файл успешно загружен');
      loadDefect(); // Перезагружаем для получения обновленных вложений
      return false;
    } catch (error) {
      message.error('Ошибка при загрузке файла');
      return false;
    }
  };

  const handleStatusChange = async (newStatus: DefectStatus) => { // Исправлено здесь
    if (!defect || !id) return;

    try {
      await defectService.update(id, { status: newStatus });
      message.success('Статус обновлен');
      loadDefect();
    } catch (error) {
      message.error('Ошибка при изменении статуса');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'blue';
      case 'medium': return 'orange';
      case 'high': return 'red';
      case 'critical': return 'purple';
      default: return 'default';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Низкий';
      case 'medium': return 'Средний';
      case 'high': return 'Высокий';
      case 'critical': return 'Критический';
      default: return priority;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'blue';
      case 'in_progress': return 'orange';
      case 'under_review': return 'purple';
      case 'resolved': return 'green';
      case 'cancelled': return 'red';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'new': return 'Новый';
      case 'in_progress': return 'В работе';
      case 'under_review': return 'На проверке';
      case 'resolved': return 'Решен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const findUser = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  // Простой компонент комментария (замена antd Comment)
  const CustomComment: React.FC<{
    author: string;
    content: string;
    datetime: string;
  }> = ({ author, content, datetime }) => (
    <div style={{ 
      border: '1px solid #d9d9d9', 
      borderRadius: '6px', 
      padding: '12px', 
      marginBottom: '12px',
      backgroundColor: '#fafafa'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <strong>{author}</strong>
        <span style={{ color: '#666', fontSize: '12px' }}>{datetime}</span>
      </div>
      <div>{content}</div>
    </div>
  );

  if (loading) {
    return <div style={{ padding: '24px', textAlign: 'center' }}>Загрузка...</div>;
  }

  if (!defect) {
    return <div style={{ padding: '24px' }}>Дефект не найден</div>;
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Заголовок и действия */}
        <Card>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/defects')}>
              Назад к списку
            </Button>
            <Space>
              <Button 
                icon={<EditOutlined />}
                onClick={() => navigate(`/defects?edit=${defect.id}`)}
              >
                Редактировать
              </Button>
            </Space>
          </Space>
        </Card>

        {/* Основная информация */}
        <Card title={`Дефект #${defect.id}`}>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Заголовок" span={2}>
              {defect.title}
            </Descriptions.Item>
            <Descriptions.Item label="Описание" span={2}>
              {defect.description}
            </Descriptions.Item>
            <Descriptions.Item label="Проект">
              {defect.project?.name}
            </Descriptions.Item>
            <Descriptions.Item label="Приоритет">
              <Tag color={getPriorityColor(defect.priority)}>
                {getPriorityText(defect.priority)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Статус">
              <Tag color={getStatusColor(defect.status)}>
                {getStatusText(defect.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Исполнитель">
              {defect.assignee ? `${defect.assignee.firstName} ${defect.assignee.lastName}` : 'Не назначен'}
            </Descriptions.Item>
            <Descriptions.Item label="Автор">
              {defect.reporter ? `${defect.reporter.firstName} ${defect.reporter.lastName}` : 'Неизвестно'}
            </Descriptions.Item>
            <Descriptions.Item label="Срок устранения">
              {new Date(defect.dueDate).toLocaleDateString('ru-RU')}
            </Descriptions.Item>
            <Descriptions.Item label="Дата создания">
              {new Date(defect.createdAt).toLocaleDateString('ru-RU')}
            </Descriptions.Item>
          </Descriptions>

          {/* Смена статуса */}
          {(currentUser?.role === 'manager' || currentUser?.role === 'admin' || currentUser?.id === defect.assigneeId) && (
            <div style={{ marginTop: '16px' }}>
              <Space>
                <span>Изменить статус:</span>
                {(['new', 'in_progress', 'under_review', 'resolved', 'cancelled'] as DefectStatus[]).map(status => (
                  <Button
                    key={status}
                    size="small"
                    type={defect.status === status ? 'primary' : 'default'}
                    onClick={() => handleStatusChange(status)}
                  >
                    {getStatusText(status)}
                  </Button>
                ))}
              </Space>
            </div>
          )}
        </Card>

        {/* Вложения */}
        <Card title="Вложения" size="small">
          <Upload
            beforeUpload={handleFileUpload}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Загрузить файл</Button>
          </Upload>
          
          {defect.attachments && defect.attachments.length > 0 ? (
            <List
              style={{ marginTop: '16px' }}
              dataSource={defect.attachments}
              renderItem={attachment => (
                <List.Item>
                  <List.Item.Meta
                    title={attachment.originalName}
                    description={`${(attachment.size / 1024).toFixed(2)} KB - ${new Date(attachment.createdAt).toLocaleDateString('ru-RU')}`}
                  />
                  <Button 
                    type="link"
                    href={`/uploads/${attachment.filename}`}
                    target="_blank"
                  >
                    Скачать
                  </Button>
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#999', marginTop: '16px' }}>
              Нет прикрепленных файлов
            </div>
          )}
        </Card>

        {/* Комментарии */}
        <Card title="Комментарии" size="small">
          <div style={{ marginBottom: '16px' }}>
            <Form.Item>
              <TextArea
                rows={4}
                value={commentText}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setCommentText(e.target.value)} // Исправлено здесь
                placeholder="Оставьте комментарий..."
              />
            </Form.Item>
            <Button
              type="primary"
              loading={commentLoading}
              onClick={handleAddComment}
              disabled={!commentText.trim()}
            >
              Добавить комментарий
            </Button>
          </div>

          <List
            dataSource={defect.comments || []}
            renderItem={comment => {
              const author = findUser(comment.authorId);
              return (
                <CustomComment
                  author={author ? `${author.firstName} ${author.lastName}` : 'Неизвестный пользователь'}
                  content={comment.content}
                  datetime={new Date(comment.createdAt).toLocaleString('ru-RU')}
                />
              );
            }}
          />
        </Card>
      </Space>
    </div>
  );
};

export default DefectDetail;