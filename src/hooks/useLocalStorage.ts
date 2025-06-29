import { useState, useEffect } from 'react';
import { FilterConfig, PresetType } from '../types';

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // 获取初始值
  const getInitialValue = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  };

  // 状态
  const [storedValue, setStoredValue] = useState<T>(getInitialValue);

  // 设置值
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // 允许值是一个函数，这样我们就有了与 useState 相同的 API
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // 保存状态
      setStoredValue(valueToStore);
      
      // 保存到 localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // 监听其他标签页的变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
}

// 用于存储过滤器配置的 Hook - 确保类型正确
export function useStoredFilterConfig(): [FilterConfig, (value: FilterConfig | ((prev: FilterConfig) => FilterConfig)) => void] {
  const defaultConfig: FilterConfig = {
    preset: 'custom' as PresetType,  // 明确指定类型
    includeExtensions: [],
    excludePatterns: [],
    maxFileSize: 500 * 1024, // 500KB 默认值
  };
  
  return useLocalStorage<FilterConfig>('codepack-filter-config', defaultConfig);
}

// 用于存储最近打开的目录
export function useRecentDirectories() {
  const [directories, setDirectories] = useLocalStorage<string[]>(
    'codepack-recent-directories',
    []
  );

  const addDirectory = (path: string) => {
    setDirectories(prev => {
      const filtered = prev.filter(p => p !== path);
      return [path, ...filtered].slice(0, 5); // 最多保存5个
    });
  };

  const removeDirectory = (path: string) => {
    setDirectories(prev => prev.filter(p => p !== path));
  };

  return { directories, addDirectory, removeDirectory };
}