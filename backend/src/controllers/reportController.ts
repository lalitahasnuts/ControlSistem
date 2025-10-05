import { Request, Response } from 'express';
import { defects, projects } from '../utils/storage.js';
import { DefectStatus, Priority } from '../models/types.js';
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';

export const getDefectReport = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, projectId } = req.query;
    
    let filteredDefects = [...defects];

    // Фильтрация по дате
    if (startDate && endDate) {
      filteredDefects = filteredDefects.filter(defect => {
        const defectDate = new Date(defect.createdAt);
        return defectDate >= new Date(startDate as string) && 
               defectDate <= new Date(endDate as string);
      });
    }

    // Фильтрация по проекту
    if (projectId && projectId !== 'all') {
      filteredDefects = filteredDefects.filter(defect => defect.projectId === projectId);
    }

    // Статистика по статусам
    const defectsByStatus = Object.values(DefectStatus).map(status => ({
      status,
      count: filteredDefects.filter(defect => defect.status === status).length
    }));

    // Статистика по приоритетам
    const defectsByPriority = Object.values(Priority).map(priority => ({
      priority,
      count: filteredDefects.filter(defect => defect.priority === priority).length
    }));

    // Статистика по проектам
    const defectsByProject = projects.map(project => ({
      projectId: project.id,
      projectName: project.name,
      count: filteredDefects.filter(defect => defect.projectId === project.id).length
    })).filter(item => item.count > 0);

    // Расчет среднего времени устранения (упрощенный)
    const resolvedDefects = filteredDefects.filter(defect => 
      defect.status === DefectStatus.RESOLVED
    );
    
    let averageResolutionTime = 0;
    if (resolvedDefects.length > 0) {
      const totalTime = resolvedDefects.reduce((sum, defect) => {
        const created = new Date(defect.createdAt);
        const updated = new Date(defect.updatedAt);
        const diffTime = Math.abs(updated.getTime() - created.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return sum + diffDays;
      }, 0);
      averageResolutionTime = totalTime / resolvedDefects.length;
    }

    const reportData = {
      totalDefects: filteredDefects.length,
      defectsByStatus,
      defectsByPriority,
      defectsByProject,
      averageResolutionTime
    };

    res.json(reportData);
  } catch (error) {
    console.error('Get defect report error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка генерации отчета' 
    });
  }
};

export const exportToCSV = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, projectId } = req.query;
    
    let filteredDefects = [...defects];

    // Применяем те же фильтры
    if (startDate && endDate) {
      filteredDefects = filteredDefects.filter(defect => {
        const defectDate = new Date(defect.createdAt);
        return defectDate >= new Date(startDate as string) && 
               defectDate <= new Date(endDate as string);
      });
    }

    if (projectId && projectId !== 'all') {
      filteredDefects = filteredDefects.filter(defect => defect.projectId === projectId);
    }

    // Подготавливаем данные для CSV
    const csvData = filteredDefects.map(defect => {
      const project = projects.find(p => p.id === defect.projectId);
      return {
        id: defect.id,
        title: defect.title,
        description: defect.description,
        priority: defect.priority,
        status: defect.status,
        project: project?.name || 'Неизвестно',
        dueDate: new Date(defect.dueDate).toLocaleDateString('ru-RU'),
        createdAt: new Date(defect.createdAt).toLocaleDateString('ru-RU'),
        updatedAt: new Date(defect.updatedAt).toLocaleDateString('ru-RU')
      };
    });

    const fields = [
      { label: 'ID', value: 'id' },
      { label: 'Заголовок', value: 'title' },
      { label: 'Описание', value: 'description' },
      { label: 'Приоритет', value: 'priority' },
      { label: 'Статус', value: 'status' },
      { label: 'Проект', value: 'project' },
      { label: 'Срок устранения', value: 'dueDate' },
      { label: 'Дата создания', value: 'createdAt' },
      { label: 'Дата обновления', value: 'updatedAt' }
    ];

    const parser = new Parser({ fields, withBOM: true });
    const csv = parser.parse(csvData);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=defects-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export to CSV error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка экспорта в CSV' 
    });
  }
};

export const exportToExcel = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate, projectId } = req.query;
    
    let filteredDefects = [...defects];

    // Применяем фильтры
    if (startDate && endDate) {
      filteredDefects = filteredDefects.filter(defect => {
        const defectDate = new Date(defect.createdAt);
        return defectDate >= new Date(startDate as string) && 
               defectDate <= new Date(endDate as string);
      });
    }

    if (projectId && projectId !== 'all') {
      filteredDefects = filteredDefects.filter(defect => defect.projectId === projectId);
    }

    // Создаем Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Дефекты');

    // Заголовки колонок
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Заголовок', key: 'title', width: 30 },
      { header: 'Описание', key: 'description', width: 50 },
      { header: 'Приоритет', key: 'priority', width: 15 },
      { header: 'Статус', key: 'status', width: 15 },
      { header: 'Проект', key: 'project', width: 20 },
      { header: 'Срок устранения', key: 'dueDate', width: 15 },
      { header: 'Дата создания', key: 'createdAt', width: 15 },
      { header: 'Дата обновления', key: 'updatedAt', width: 15 }
    ];

    // Данные
    filteredDefects.forEach(defect => {
      const project = projects.find(p => p.id === defect.projectId);
      worksheet.addRow({
        id: defect.id,
        title: defect.title,
        description: defect.description,
        priority: defect.priority,
        status: defect.status,
        project: project?.name || 'Неизвестно',
        dueDate: new Date(defect.dueDate).toLocaleDateString('ru-RU'),
        createdAt: new Date(defect.createdAt).toLocaleDateString('ru-RU'),
        updatedAt: new Date(defect.updatedAt).toLocaleDateString('ru-RU')
      });
    });

    // Стили для заголовков
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6E6FA' }
    };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=defects-${new Date().toISOString().split('T')[0]}.xlsx`);
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Export to Excel error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Ошибка экспорта в Excel' 
    });
  }
};