import { Request, Response } from 'express';
import { projects, users, generateId, findProjectById } from '../utils/storage.js';
import { Project, ProjectStatus } from '../models/types.js';

export const getAllProjects = async (req: Request, res: Response) => {
  try {
    const projectsWithUsers = projects.map(project => ({
      ...project,
      manager: users.find(u => u.id === project.managerId)
    }));
    
    res.json(projectsWithUsers);
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = findProjectById(id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Проект не найден' 
      });
    }

    const projectWithUsers = {
      ...project,
      manager: users.find(u => u.id === project.managerId)
    };

    res.json(projectWithUsers);
  } catch (error) {
    console.error('Get project by id error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, description, address, startDate, endDate, status = ProjectStatus.PLANNED } = req.body;

    if (!name || !description || !address || !startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Все поля обязательны' 
      });
    }

    const managerId = (req as any).user?.userId;

    const newProject: Project = {
      id: generateId(),
      name,
      description,
      address,
      startDate,
      endDate,
      status,
      managerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    projects.push(newProject);

    const projectWithUsers = {
      ...newProject,
      manager: users.find(u => u.id === managerId)
    };

    res.status(201).json(projectWithUsers);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, address, startDate, endDate, status } = req.body;
    
    const projectIndex = projects.findIndex(p => p.id === id);
    if (projectIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Проект не найден' 
      });
    }

    const existingProject = projects[projectIndex];
    
    // Добавляем проверку на существование проекта
    if (!existingProject) {
      return res.status(404).json({ 
        success: false, 
        message: 'Проект не найден' 
      });
    }

    // Обновляем поля с проверкой на undefined
    if (name !== undefined) existingProject.name = name;
    if (description !== undefined) existingProject.description = description;
    if (address !== undefined) existingProject
    if (startDate) existingProject.startDate = startDate;
    if (endDate) existingProject.endDate = endDate;
    if (status) existingProject.status = status;

    existingProject.updatedAt = new Date().toISOString();

    const projectWithUsers = {
      ...existingProject,
      manager: users.find(u => u.id === existingProject.managerId)
    };

    res.json(projectWithUsers);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const projectIndex = projects.findIndex(p => p.id === id);
    if (projectIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Проект не найден' 
      });
    }

    projects.splice(projectIndex, 1);

    res.json({ 
      success: true, 
      message: 'Проект успешно удален' 
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};