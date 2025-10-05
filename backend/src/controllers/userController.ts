import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { users, findUserById, generateId } from '../utils/storage.js';
import { User, UserRole } from '../models/types.js';

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, password, firstName, lastName, role, isActive } = req.body;
    
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }

    const existingUser: User | undefined = users[userIndex];
    
    if (!existingUser) {
      return res.status(404).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }

    // Проверяем email на уникальность
    if (email && email !== existingUser.email) {
      const emailExists = users.find(u => u.email === email && u.id !== id);
      if (emailExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Пользователь с таким email уже существует' 
        });
      }
    }

    // Обновляем поля с проверкой на undefined
    if (firstName !== undefined) existingUser.firstName = firstName;
    if (lastName !== undefined) existingUser.lastName = lastName;
    if (role !== undefined) existingUser.role = role;
    if (isActive !== undefined) existingUser.isActive = isActive;
    
    // Обновляем пароль если предоставлен
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ 
          success: false, 
          message: 'Пароль должен содержать минимум 6 символов' 
        });
      }
      existingUser.password = await bcrypt.hash(password, 10);
    }

    existingUser.updatedAt = new Date().toISOString();

    // Не возвращаем пароль в ответе
    const { password: _, ...userWithoutPassword } = existingUser;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }

    // Не позволяем удалить самого себя
    const currentUserId = (req as any).user?.userId;
    if (id === currentUserId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Нельзя удалить собственный аккаунт' 
      });
    }

    users.splice(userIndex, 1);

    res.json({ 
      success: true, 
      message: 'Пользователь успешно удален' 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};
