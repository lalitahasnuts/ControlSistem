import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';

const prisma = new PrismaClient();

// Простая конфигурация multer без diskStorage
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024,
  }
});

export const uploadMiddleware = upload.single('file');

export const defectController = {
  async getAll(req: Request, res: Response): Promise<Response> {
    try {
      const defects = await prisma.defect.findMany({
        include: {
          project: true,
          reporter: true,
          assignee: true,
          comments: true,
          attachments: true,
        },
      });
      return res.json(defects);
    } catch (error) {
      console.error('Error fetching defects:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const defect = await prisma.defect.findUnique({
        where: { id },
        include: {
          project: true,
          reporter: true,
          assignee: true,
          comments: {
            include: {
              author: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          attachments: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!defect) {
        return res.status(404).json({ error: 'Defect not found' });
      }

      return res.json(defect);
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
      
      const defect = await prisma.defect.create({
        data: {
          title,
          description,
          projectId,
          priority: priority || 'medium',
          assigneeId: assigneeId || null,
          reporterId: 'temp-user-id', // TODO: заменить на реальный ID из аутентификации
          dueDate: dueDate ? new Date(dueDate) : null,
          status: 'new',
        },
        include: {
          project: true,
          reporter: true,
          assignee: true,
        },
      });

      return res.status(201).json(defect);
    } catch (error) {
      console.error('Error creating defect:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async update(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const updateData: any = {};

      if (req.body.title) updateData.title = req.body.title;
      if (req.body.description) updateData.description = req.body.description;
      if (req.body.projectId) updateData.projectId = req.body.projectId;
      if (req.body.priority) updateData.priority = req.body.priority;
      if (req.body.status) updateData.status = req.body.status;
      if (req.body.assigneeId) updateData.assigneeId = req.body.assigneeId;
      if (req.body.dueDate) updateData.dueDate = new Date(req.body.dueDate);

      // Проверяем, есть ли что обновлять
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No data to update' });
      }

      const defect = await prisma.defect.update({
        where: { id },
        data: updateData,
        include: {
          project: true,
          reporter: true,
          assignee: true,
        },
      });

      return res.json(defect);
    } catch (error) {
      console.error('Error updating defect:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async delete(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      await prisma.defect.delete({ where: { id } });
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

      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Comment content is required' });
      }

      const comment = await prisma.comment.create({
        data: {
          content: content.trim(),
          defectId: id,
          authorId: 'temp-user-id', // TODO: заменить на реальный ID
        },
        include: {
          author: true,
        },
      });

      return res.status(201).json(comment);
    } catch (error) {
      console.error('Error adding comment:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async uploadAttachment(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Проверяем существование дефекта
      const defect = await prisma.defect.findUnique({
        where: { id }
      });

      if (!defect) {
        return res.status(404).json({ error: 'Defect not found' });
      }

      const attachment = await prisma.attachment.create({
        data: {
          originalName: req.file.originalname,
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size,
          defectId: id,
          uploadedById: 'temp-user-id', // TODO: заменить на реальный ID
        },
      });

      return res.status(201).json(attachment);
    } catch (error) {
      console.error('Error uploading attachment:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },

  async getAttachments(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      
      // Проверяем существование дефекта
      const defect = await prisma.defect.findUnique({
        where: { id }
      });

      if (!defect) {
        return res.status(404).json({ error: 'Defect not found' });
      }

      const attachments = await prisma.attachment.findMany({
        where: { defectId: id },
        orderBy: { createdAt: 'desc' },
      });
      
      return res.json(attachments);
    } catch (error) {
      console.error('Error fetching attachments:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  },
};

export default defectController;