import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { users, findUserByEmail, generateId } from '../utils/storage.js';
import { User, UserRole } from '../models/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ 
        success: false, 
        message: 'Email и пароль обязательны' 
      });
      return;
    }

    const user = findUserByEmail(email);
    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: 'Неверный email или пароль' 
      });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ 
        success: false, 
        message: 'Неверный email или пароль' 
      });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ 
        success: false, 
        message: 'Аккаунт деактивирован' 
      });
      return;
    }

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Не возвращаем пароль в ответе
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Успешный вход',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role = UserRole.ENGINEER } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ 
        success: false, 
        message: 'Все поля обязательны' 
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ 
        success: false, 
        message: 'Пароль должен содержать минимум 6 символов' 
      });
      return;
    }

    const existingUser = findUserByEmail(email);
    if (existingUser) {
      res.status(400).json({ 
        success: false, 
        message: 'Пользователь с таким email уже существует' 
      });
      return;
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

    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        role: newUser.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Не возвращаем пароль в ответе
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: 'Пользователь успешно зарегистрирован',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.userId;
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      res.status(404).json({ 
        success: false, 
        message: 'Пользователь не найден' 
      });
      return;
    }

    // Не возвращаем пароль в ответе
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка сервера' 
    });
  }
};