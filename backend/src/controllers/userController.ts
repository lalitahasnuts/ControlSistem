import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { users, findUserById, generateId } from '../utils/storage.js';
import { User, UserRole } from '../models/types.js';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Не возвращаем пароли в ответе
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    
    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = findUserById(id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
    }

    // Не возвращаем пароль в ответе
    const { password: _, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role = UserRole.ENGINEER } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Все поля обязательны' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'Пароль должен содержать минимум 6 символов' 
      });
    }

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Пользователь с таким email уже существует' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: User = {
      id: generateId(),
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);

    // Не возвращаем пароль в ответе
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};

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

    const existingUser = users[userIndex];

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

    // Обновляем поля
    if (email) existingUser.email = email;
    if (firstName) existingUser.firstName = firstName;
    if (lastName) existingUser.lastName = lastName;
    if (role) existingUser.role = role;
    if (typeof isActive === 'boolean') existingUser.isActive = isActive;
    
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