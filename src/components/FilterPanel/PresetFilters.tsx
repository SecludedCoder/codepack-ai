import React from 'react';
import { PresetType } from '../../types';
import { PRESETS } from '../../utils/presets';
import styles from './styles.module.css';

interface PresetFiltersProps {
  currentPreset?: PresetType;
  onPresetChange: (preset: PresetType) => void;
}

export const PresetFilters: React.FC<PresetFiltersProps> = ({
  currentPreset = 'custom',
  onPresetChange,
}) => {
  const presetOptions = Object.entries(PRESETS).filter(([key]) => key !== 'custom');

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>项目类型预设</h3>
      <div className={styles.presetGrid}>
        {presetOptions.map(([key, preset]) => (
          <button
            key={key}
            className={`${styles.presetButton} ${
              currentPreset === key ? styles.active : ''
            }`}
            onClick={() => onPresetChange(key as PresetType)}
            title={preset.description}
          >
            <span className={styles.presetIcon}>
              {getPresetIcon(key as PresetType)}
            </span>
            <span className={styles.presetName}>{preset.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

function getPresetIcon(preset: PresetType): string {
  const icons: Record<PresetType, string> = {
    python: '🐍',
    javascript: '📜',
    typescript: '📘',
    java: '☕',
    go: '🐹',
    web: '🌐',
    all: '📦',
    custom: '⚙️',
  };
  return icons[preset] || '📄';
}