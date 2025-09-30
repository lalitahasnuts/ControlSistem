// src/hooks/useData.ts
import * as React from 'react';
import axios from 'axios';

// Интерфейсы для данных
interface FetchOptions {
  initialValue?: any;
  endpoint: string;
}

// Общий хук для запросов к API
const useFetch = ({ endpoint, initialValue }: FetchOptions) => {
  const [state, setState] = React.useState(initialValue ?? []);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(endpoint);
        setState(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [endpoint]);

  return state;
};

// Специальные хуки для конкретных данных
export const useProjects = () =>
  useFetch({ endpoint: '/api/projects', initialValue: [] });

export const useDefects = (projectId: string) =>
  useFetch({ endpoint: `/api/projects/${projectId}/defects`, initialValue: [] });

export const useReports = () =>
  useFetch({ endpoint: '/api/reports', initialValue: [] });

// Экспорт общего хука для произвольных запросов
export { useFetch };