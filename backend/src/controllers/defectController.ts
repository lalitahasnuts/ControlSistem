import { Request, Response } from 'express';
import { defects, projects, users, comments, attachments, generateId, findDefectById } from '../utils/storage.js';
import { Defect, DefectStatus, Priority, Comment, Attachment } from '../models/types.js';
import multer from 'multer';
import path from 'path';

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ storage });

export const getAllDefects = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status, priority, projectId } = req.query;
    
    let filteredDefects = defects;

    // Применяем фильтры
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredDefects = filteredDefects.filter(defect =>
        defect.title.toLowerCase().includes(searchLower) ||
        defect.description.toLowerCase().includes(searchLower)
      );
    }

    if (status) {
      filteredDefects = filteredDefects.filter(defect => defect.status === status);
    }

    if (priority) {
      filteredDefects = filteredDefects.filter(defect => defect.priority === priority);
    }

    if (projectId) {
      filteredDefects = filteredDefects.filter(defect => defect.projectId === projectId);
    }

    // Добавляем связанные данные
    const defectsWithRelations = filteredDefects.map(defect => ({
      ...defect,
      project: projects.find(p => p.id === defect.projectId),
      assignee: users.find(u => u.id === defect.assigneeId),
      reporter: users.find(u => u.id === defect.reporterId),
      comments: comments.filter(c => c.defectId === defect.id),
      attachments: attachments.filter(a => a.defectId === defect.id)
    }));

    res.json(defectsWithRelations);
  } catch (error) {
    console.error('Get all defects error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};

export const getDefectById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ 
        success: false, 
        message: 'ID дефекта обязателен' 
      });
      return;
    }

    const defect = findDefectById(id);
    
    if (!defect) {
      res.status(404).json({ 
        success: false, 
        message: 'Дефект не найден' 
      });
      return;
    }

    const defectWithRelations = {
      ...defect,
      project: projects.find(p => p.id === defect.projectId),
      assignee: users.find(u => u.id === defect.assigneeId),
      reporter: users.find(u => u.id === defect.reporterId),
      comments: comments.filter(c => c.defectId === defect.id),
      attachments: attachments.filter(a => a.defectId === defect.id)
    };

    res.json(defectWithRelations);
  } catch (error) {
    console.error('Get defect by id error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};

export const createDefect = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, priority, projectId, assigneeId, dueDate } = req.body;

    if (!title || !description || !priority || !projectId || !assigneeId || !dueDate) {
      res.status(400).json({ 
        success: false, 
        message: 'Все поля обязательны' 
      });
      return;
    }

    const reporterId = (req as any).user?.userId;

    if (!reporterId) {
      res.status(400).json({ 
        success: false, 
        message: 'ID репортера обязателен' 
      });
      return;
    }

    const newDefect: Defect = {
      id: generateId(),
      title,
      description,
      priority: priority as Priority,
      status: DefectStatus.NEW,
      projectId,
      assigneeId,
      reporterId,
      dueDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: []
    };

    defects.push(newDefect);

    const defectWithRelations = {
      ...newDefect,
      project: projects.find(p => p.id === projectId),
      assignee: users.find(u => u.id === assigneeId),
      reporter: users.find(u => u.id === reporterId),
      comments: [],
      attachments: []
    };

    res.status(201).json(defectWithRelations);
  } catch (error) {
    console.error('Create defect error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};

export const updateDefect = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ 
        success: false, 
        message: 'ID дефекта обязателен' 
      });
      return;
    }

    const { title, description, priority, status, projectId, assigneeId, dueDate } = req.body;
    
    const defectIndex = defects.findIndex(d => d.id === id);
    if (defectIndex === -1) {
      res.status(404).json({ 
        success: false, 
        message: 'Дефект не найден' 
      });
      return;
    }

    const existingDefect = defects[defectIndex];
    if (!existingDefect) {
      res.status(404).json({ 
        success: false, 
        message: 'Дефект не найден' 
      });
      return;
    }

    // Обновляем поля
    if (title) existingDefect.title = title;
    if (description) existingDefect.description = description;
    if (priority) existingDefect.priority = priority as Priority;
    if (status) existingDefect.status = status as DefectStatus;
    if (projectId) existingDefect.projectId = projectId;
    if (assigneeId) existingDefect.assigneeId = assigneeId;
    if (dueDate) existingDefect.dueDate = dueDate;

    existingDefect.updatedAt = new Date().toISOString();

    const defectWithRelations = {
      ...existingDefect,
      project: projects.find(p => p.id === existingDefect.projectId),
      assignee: users.find(u => u.id === existingDefect.assigneeId),
      reporter: users.find(u => u.id === existingDefect.reporterId),
      comments: comments.filter(c => c.defectId === id),
      attachments: attachments.filter(a => a.defectId === id)
    };

    res.json(defectWithRelations);
  } catch (error) {
    console.error('Update defect error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};

export const deleteDefect = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ 
        success: false, 
        message: 'ID дефекта обязателен' 
      });
      return;
    }

    const defectIndex = defects.findIndex(d => d.id === id);
    if (defectIndex === -1) {
      res.status(404).json({ 
        success: false, 
        message: 'Дефект не найден' 
      });
      return;
    }

    defects.splice(defectIndex, 1);

    // Удаляем связанные комментарии и вложения
    const commentIndices = comments
      .map((c, index) => c.defectId === id ? index : -1)
      .filter(index => index !== -1)
      .reverse();
    
    commentIndices.forEach(index => comments.splice(index, 1));

    const attachmentIndices = attachments
      .map((a, index) => a.defectId === id ? index : -1)
      .filter(index => index !== -1)
      .reverse();
    
    attachmentIndices.forEach(index => attachments.splice(index, 1));

    res.json({ 
      success: true, 
      message: 'Дефект успешно удален' 
    });
  } catch (error) {
    console.error('Delete defect error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};

export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ 
        success: false, 
        message: 'ID дефекта обязателен' 
      });
      return;
    }

    const { content } = req.body;

    if (!content) {
      res.status(400).json({ 
        success: false, 
        message: 'Текст комментария обязателен' 
      });
      return;
    }

    const defect = findDefectById(id);
    if (!defect) {
      res.status(404).json({ 
        success: false, 
        message: 'Дефект не найден' 
      });
      return;
    }

    const authorId = (req as any).user?.userId;

    if (!authorId) {
      res.status(400).json({ 
        success: false, 
        message: 'ID автора обязателен' 
      });
      return;
    }

    const newComment: Comment = {
      id: generateId(),
      content,
      defectId: id,
      authorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    comments.push(newComment);

    const commentWithAuthor = {
      ...newComment,
      author: users.find(u => u.id === authorId)
    };

    res.status(201).json(commentWithAuthor);
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};

export const uploadAttachment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    if (!id) {
      res.status(400).json({ 
        success: false, 
        message: 'ID дефекта обязателен' 
      });
      return;
    }

    const file = req.file;

    if (!file) {
      res.status(400).json({ 
        success: false, 
        message: 'Файл обязателен' 
      });
      return;
    }

    const defect = findDefectById(id);
    if (!defect) {
      res.status(404).json({ 
        success: false, 
        message: 'Дефект не найден' 
      });
      return;
    }

    const uploadedById = (req as any).user?.userId;

    if (!uploadedById) {
      res.status(400).json({ 
        success: false, 
        message: 'ID пользователя обязателен' 
      });
      return;
    }

    const newAttachment: Attachment = {
      id: generateId(),
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      defectId: id,
      uploadedById,
      createdAt: new Date().toISOString()
    };

    attachments.push(newAttachment);

    const attachmentWithUser = {
      ...newAttachment,
      uploadedBy: users.find(u => u.id === uploadedById)
    };

    res.status(201).json(attachmentWithUser);
  } catch (error) {
    console.error('Upload attachment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};