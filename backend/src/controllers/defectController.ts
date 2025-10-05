import { Request, Response } from 'express';
import { 
  initialDefects, 
  initialComments, 
  initialAttachments,
  storage 
} from '../utils/storage.js';
import { Defect, Comment, Attachment, DefectStatus, Priority } from '../models/types.js';

let defects = [...initialDefects];
let comments = [...initialComments];
let attachments = [...initialAttachments];

export const defectController = {
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      // Получаем дефекты с дополнительной информацией
      const defectsWithDetails = defects.map(defect => ({
        ...defect,
        project: storage.getProjects().find(p => p.id === defect.projectId),
        reporter: storage.getUsers().find(u => u.id === defect.reporterId),
        assignee: storage.getUsers().find(u => u.id === defect.assigneeId),
        comments: comments.filter(c => c.defectId === defect.id),
        attachments: attachments.filter(a => a.defectId === defect.id),
      }));

      return res.json(defectsWithDetails);
    } catch (error) {
      console.error('Error fetching defects:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      // Проверяем, что id есть
      if (!id) {
        return res.status(400).json({ error: 'Defect ID is required' });
      }

      const defect = defects.find(d => d.id === id);

      if (!defect) {
        return res.status(404).json({ error: 'Defect not found' });
      }

      // Добавляем связанные данные
      const defectWithDetails = {
        ...defect,
        project: storage.getProjects().find(p => p.id === defect.projectId),
        reporter: storage.getUsers().find(u => u.id === defect.reporterId),
        assignee: storage.getUsers().find(u => u.id === defect.assigneeId),
        comments: comments
          .filter(c => c.defectId === defect.id)
          .map(comment => ({
            ...comment,
            author: storage.getUsers().find(u => u.id === comment.authorId),
          })),
        attachments: attachments.filter(a => a.defectId === defect.id),
      };

      return res.json(defectWithDetails);
    } catch (error) {
      console.error('Error fetching defect:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async create(req: Request, res: Response): Promise<Response> {
    try {
      const { title, description, projectId, priority, assigneeId, dueDate } = req.body;
      
      // Валидация обязательных полей
      if (!title || !description || !projectId) {
        return res.status(400).json({ error: 'Title, description and projectId are required' });
      }

      // Проверяем существование проекта
      const project = storage.getProjects().find(p => p.id === projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      const newDefect: Defect = {
        id: Date.now().toString(),
        title,
        description,
        projectId,
        priority: priority || Priority.MEDIUM,
        assigneeId: assigneeId || '',
        reporterId: '1', // TODO: Заменить на ID текущего пользователя
        status: DefectStatus.NEW,
        dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // +7 дней по умолчанию
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        attachments: [],
      };

      defects.push(newDefect);
      storage.setDefects(defects);

      return res.status(201).json(newDefect);
    } catch (error) {
      console.error('Error creating defect:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'Defect ID is required' });
      }

      const updateData = req.body;

      const defectIndex = defects.findIndex(d => d.id === id);
      if (defectIndex === -1) {
        return res.status(404).json({ error: 'Defect not found' });
      }

      defects[defectIndex] = {
        ...defects[defectIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      storage.setDefects(defects);

      return res.json(defects[defectIndex]);
    } catch (error) {
      console.error('Error updating defect:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'Defect ID is required' });
      }

      const defectIndex = defects.findIndex(d => d.id === id);
      if (defectIndex === -1) {
        return res.status(404).json({ error: 'Defect not found' });
      }

      defects = defects.filter(d => d.id !== id);
      // Также удаляем связанные комментарии и вложения
      comments = comments.filter(c => c.defectId !== id);
      attachments = attachments.filter(a => a.defectId !== id);

      storage.setDefects(defects);
      storage.setComments(comments);
      storage.setAttachments(attachments);

      return res.status(204).send();
    } catch (error) {
      console.error('Error deleting defect:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async addComment(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { content } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Defect ID is required' });
      }

      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Comment content is required' });
      }

      // Проверяем существование дефекта
      const defect = defects.find(d => d.id === id);
      if (!defect) {
        return res.status(404).json({ error: 'Defect not found' });
      }

      const newComment: Comment = {
        id: Date.now().toString(),
        content: content.trim(),
        defectId: id, // Теперь TypeScript знает, что id - строка
        authorId: '1', // TODO: Заменить на ID текущего пользователя
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      comments.push(newComment);
      storage.setComments(comments);

      // Возвращаем комментарий с информацией об авторе
      const commentWithAuthor = {
        ...newComment,
        author: storage.getUsers().find(u => u.id === newComment.authorId),
      };

      return res.status(201).json(commentWithAuthor);
    } catch (error) {
      console.error('Error adding comment:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async uploadAttachment(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'Defect ID is required' });
      }
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Проверяем существование дефекта
      const defect = defects.find(d => d.id === id);
      if (!defect) {
        return res.status(404).json({ error: 'Defect not found' });
      }

      const newAttachment: Attachment = {
        id: Date.now().toString(),
        originalName: req.file.originalname,
        filename: req.file.filename,
        mimeType: req.file.mimetype,
        size: req.file.size,
        defectId: id, // Теперь TypeScript знает, что id - строка
        uploadedById: '1', // TODO: Заменить на ID текущего пользователя
        createdAt: new Date().toISOString(),
      };

      attachments.push(newAttachment);
      storage.setAttachments(attachments);

      return res.status(201).json(newAttachment);
    } catch (error) {
      console.error('Error uploading attachment:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getAttachments(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: 'Defect ID is required' });
      }

      // Проверяем существование дефекта
      const defect = defects.find(d => d.id === id);
      if (!defect) {
        return res.status(404).json({ error: 'Defect not found' });
      }

      const defectAttachments = attachments.filter(a => a.defectId === id);
      return res.json(defectAttachments);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};

// Упрощенный middleware для загрузки файлов
export const uploadMiddleware = (req: any, res: any, next: any) => {
  // Простая имитация загрузки файла
  if (req.file) {
    // Добавляем необходимые поля для req.file
    req.file = {
      originalname: req.file.originalname || 'file',
      filename: `file_${Date.now()}`,
      mimetype: req.file.mimetype || 'application/octet-stream',
      size: req.file.size || 0,
      path: `/uploads/file_${Date.now()}`,
    };
  }
  next();
};

export default defectController;