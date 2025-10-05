import React, { useState, useEffect } from 'react';
import { Card, Row, Col, DatePicker, Button, Table, Select, Spin, Alert } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import { ReportData, DefectStatus, Priority } from '../types';
import { reportService } from '../services/api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

// Интерфейс для данных Pie chart
interface PieDataItem {
  priority: Priority;
  count: number;
}

const Reports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  const [projectFilter, setProjectFilter] = useState<string>('all');

  useEffect(() => {
    loadReportData();
  }, [dateRange, projectFilter]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      
      if (dateRange) {
        filters.startDate = dateRange[0].toISOString();
        filters.endDate = dateRange[1].toISOString();
      }
      
      if (projectFilter !== 'all') {
        filters.projectId = projectFilter;
      }
      
      const data = await reportService.getDefectReport(filters);
      setReportData(data);
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const filters: any = {};
      if (dateRange) {
        filters.startDate = dateRange[0].toISOString();
        filters.endDate = dateRange[1].toISOString();
      }
      if (projectFilter !== 'all') {
        filters.projectId = projectFilter;
      }
      
      const blob = await reportService.exportToCSV(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `defects-report-${dayjs().format('YYYY-MM-DD')}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const filters: any = {};
      if (dateRange) {
        filters.startDate = dateRange[0].toISOString();
        filters.endDate = dateRange[1].toISOString();
      }
      if (projectFilter !== 'all') {
        filters.projectId = projectFilter;
      }
      
      const blob = await reportService.exportToExcel(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `defects-report-${dayjs().format('YYYY-MM-DD')}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Excel:', error);
    }
  };

  const getStatusColor = (status: DefectStatus) => {
    switch (status) {
      case DefectStatus.NEW: return '#1890ff';
      case DefectStatus.IN_PROGRESS: return '#fa8c16';
      case DefectStatus.UNDER_REVIEW: return '#722ed1';
      case DefectStatus.RESOLVED: return '#52c41a';
      case DefectStatus.CANCELLED: return '#f5222d';
      default: return '#d9d9d9';
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW: return '#1890ff';
      case Priority.MEDIUM: return '#faad14';
      case Priority.HIGH: return '#fa541c';
      case Priority.CRITICAL: return '#f5222d';
      default: return '#d9d9d9';
    }
  };

  const getStatusText = (status: DefectStatus) => {
    switch (status) {
      case DefectStatus.NEW: return 'Новые';
      case DefectStatus.IN_PROGRESS: return 'В работе';
      case DefectStatus.UNDER_REVIEW: return 'На проверке';
      case DefectStatus.RESOLVED: return 'Решены';
      case DefectStatus.CANCELLED: return 'Отменены';
      default: return status;
    }
  };

  const getPriorityText = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW: return 'Низкий';
      case Priority.MEDIUM: return 'Средний';
      case Priority.HIGH: return 'Высокий';
      case Priority.CRITICAL: return 'Критический';
      default: return priority;
    }
  };

  // Правильные типы для функций Tooltip
  const priorityTooltipFormatter = (value: number, name: string) => {
    return [value, getPriorityText(name as Priority)];
  };

  const statusTooltipFormatter = (value: number) => {
    return [value, 'Количество'];
  };

  if (loading && !reportData) {
    return (
      <div style={{ padding: '24px', textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1>Аналитические отчеты</h1>
          <div>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleExportCSV}
              style={{ marginRight: '8px' }}
            >
              Экспорт CSV
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              onClick={handleExportExcel}
              type="primary"
            >
              Экспорт Excel
            </Button>
          </div>
        </div>

        {/* Фильтры */}
        <Card size="small" style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8}>
              <RangePicker
                style={{ width: '100%' }}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])}
                placeholder={['Дата начала', 'Дата окончания']}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Select
                placeholder="Все проекты"
                style={{ width: '100%' }}
                value={projectFilter}
                onChange={setProjectFilter}
              >
                <Option value="all">Все проекты</Option>
                <Option value="1">ЖК "Северный"</Option>
                <Option value="2">Бизнес-центр "Центральный"</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8}>
              <Button 
                icon={<FilterOutlined />}
                onClick={loadReportData}
                type="primary"
                style={{ width: '100%' }}
              >
                Обновить отчет
              </Button>
            </Col>
          </Row>
        </Card>

        {!reportData ? (
          <Alert message="Нет данных для отображения" type="warning" />
        ) : (
          <>
            {/* Статистика */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={24} sm={6}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                      {reportData.totalDefects}
                    </div>
                    <div>Всего дефектов</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a' }}>
                      {Math.round(reportData.averageResolutionTime)} дн.
                    </div>
                    <div>Среднее время устранения</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16' }}>
                      {reportData.defectsByStatus.find(d => d.status === DefectStatus.IN_PROGRESS)?.count || 0}
                    </div>
                    <div>В работе</div>
                  </div>
                </Card>
              </Col>
              <Col xs={24} sm={6}>
                <Card size="small">
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f5222d' }}>
                      {reportData.defectsByPriority.find(d => d.priority === Priority.CRITICAL)?.count || 0}
                    </div>
                    <div>Критические</div>
                  </div>
                </Card>
              </Col>
            </Row>

            {/* Графики */}
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Дефекты по статусам" size="small">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData.defectsByStatus}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="status" 
                        tickFormatter={getStatusText}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={statusTooltipFormatter}
                        labelFormatter={getStatusText}
                      />
                      <Legend />
                      <Bar 
                        dataKey="count" 
                        name="Количество дефектов"
                        fill="#1890ff"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>

              <Col xs={24} lg={12}>
              <Card title="Дефекты по приоритетам" size="small">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.defectsByPriority}
                      dataKey="count"
                      nameKey="priority"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {reportData.defectsByPriority.map((entry: PieDataItem, index: number) => (
                        <Cell key={`cell-${index}`} fill={getPriorityColor(entry.priority)} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number, name: string) => [value, getPriorityText(name as Priority)]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            </Row>

            {/* Таблицы с детализацией */}
            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col xs={24} lg={12}>
                <Card title="Статистика по статусам" size="small">
                  <Table
                    dataSource={reportData.defectsByStatus}
                    rowKey="status"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: 'Статус',
                        dataIndex: 'status',
                        key: 'status',
                        render: (status: DefectStatus) => (
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div 
                              style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                backgroundColor: getStatusColor(status),
                                marginRight: '8px'
                              }}
                            />
                            {getStatusText(status)}
                          </div>
                        )
                      },
                      {
                        title: 'Количество',
                        dataIndex: 'count',
                        key: 'count',
                        align: 'right' as const
                      }
                    ]}
                  />
                </Card>
              </Col>

              <Col xs={24} lg={12}>
                <Card title="Статистика по проектам" size="small">
                  <Table
                    dataSource={reportData.defectsByProject}
                    rowKey="projectId"
                    pagination={false}
                    size="small"
                    columns={[
                      {
                        title: 'Проект',
                        dataIndex: 'projectName',
                        key: 'projectName'
                      },
                      {
                        title: 'Количество дефектов',
                        dataIndex: 'count',
                        key: 'count',
                        align: 'right' as const
                      }
                    ]}
                  />
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Card>
    </div>
  );
};

export default Reports;