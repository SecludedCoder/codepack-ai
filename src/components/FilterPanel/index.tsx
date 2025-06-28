import React from 'react';
import { FilterConfig, FileNode, PresetType } from '../../types';
import { PresetFilters } from './PresetFilters';
import { SizeFilter } from './SizeFilter';
import { PRESETS } from '../../utils/presets';
import styles from './styles.module.css';

interface FilterPanelProps {
  config: FilterConfig;
  onChange: (config: FilterConfig) => void;
  fileTree: FileNode | null;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  config,
  onChange,
  fileTree,
}) => {
  const handlePresetChange = (preset: PresetType) => {
    const presetConfig = PRESETS[preset];
    onChange({
      ...config,
      preset,
      includeExtensions: [...presetConfig.includeExtensions],
      excludePatterns: [...presetConfig.excludePatterns],
      maxFileSize: presetConfig.maxFileSize,
    });
  };

  const handleSizeChange = (maxSize: number) => {
    onChange({
      ...config,
      maxFileSize: maxSize,
    });
  };

  const handleExtensionToggle = (ext: string) => {
    const extensions = new Set(config.includeExtensions);
    if (extensions.has(ext)) {
      extensions.delete(ext);
    } else {
      extensions.add(ext);
    }
    onChange({
      ...config,
      includeExtensions: Array.from(extensions),
      preset: 'custom',
    });
  };

  const handleAddExtension = (ext: string) => {
    if (!config.includeExtensions.includes(ext)) {
      onChange({
        ...config,
        includeExtensions: [...config.includeExtensions, ext],
        preset: 'custom',
      });
    }
  };

  // 收集文件树中的所有扩展名
  const collectExtensions = (node: FileNode, extensions: Set<string>) => {
    if (node.type === 'file') {
      const ext = node.name.includes('.') 
        ? '.' + node.name.split('.').pop()!.toLowerCase()
        : node.name.toLowerCase();
      extensions.add(ext);
    } else if (node.children) {
      Object.values(node.children).forEach(child => 
        collectExtensions(child, extensions)
      );
    }
  };

  const availableExtensions = new Set<string>();
  if (fileTree) {
    collectExtensions(fileTree, availableExtensions);
  }

  return (
    <div className={styles.panel}>
      <h2 className={styles.title}>🎯 过滤设置</h2>
      
      <PresetFilters
        currentPreset={config.preset}
        onPresetChange={handlePresetChange}
      />
      
      <SizeFilter
        maxSize={config.maxFileSize}
        onSizeChange={handleSizeChange}
      />
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>文件类型</h3>
        <div className={styles.extensionGrid}>
          {Array.from(availableExtensions).sort().map(ext => (
            <label key={ext} className={styles.extensionItem}>
              <input
                type="checkbox"
                checked={config.includeExtensions.includes(ext) || 
                        config.includeExtensions.includes('*')}
                onChange={() => handleExtensionToggle(ext)}
                disabled={config.includeExtensions.includes('*')}
              />
              <span>{ext}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>自定义扩展名</h3>
        <input
          type="text"
          placeholder="输入扩展名（如 .vue）按回车添加"
          className={styles.input}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              const input = e.currentTarget;
              const value = input.value.trim();
              if (value) {
                handleAddExtension(value.startsWith('.') ? value : '.' + value);
                input.value = '';
              }
            }
          }}
        />
      </div>
      
      {config.preset === 'custom' && config.includeExtensions.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>已选择的扩展名</h3>
          <div className={styles.selectedExtensions}>
            {config.includeExtensions.map(ext => (
              <span key={ext} className={styles.tag}>
                {ext}
                <button
                  onClick={() => handleExtensionToggle(ext)}
                  className={styles.tagRemove}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};