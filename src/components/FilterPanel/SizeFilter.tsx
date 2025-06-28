import React from 'react';
import styles from './styles.module.css';

interface SizeFilterProps {
  maxSize: number;
  onSizeChange: (size: number) => void;
}

export const SizeFilter: React.FC<SizeFilterProps> = ({
  maxSize,
  onSizeChange,
}) => {
  const presetSizes = [
    { label: '100 KB', value: 100 * 1024 },
    { label: '500 KB', value: 500 * 1024 },
    { label: '1 MB', value: 1024 * 1024 },
    { label: '5 MB', value: 5 * 1024 * 1024 },
    { label: '10 MB', value: 10 * 1024 * 1024 },
  ];

  const currentSizeMB = (maxSize / (1024 * 1024)).toFixed(1);

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>文件大小限制</h3>
      
      <div className={styles.sizePresets}>
        {presetSizes.map(({ label, value }) => (
          <button
            key={value}
            className={`${styles.sizeButton} ${
              maxSize === value ? styles.active : ''
            }`}
            onClick={() => onSizeChange(value)}
          >
            {label}
          </button>
        ))}
      </div>
      
      <div className={styles.sizeSlider}>
        <input
          type="range"
          min={10240} // 10KB
          max={10485760} // 10MB
          step={10240} // 10KB
          value={maxSize}
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className={styles.slider}
        />
        <div className={styles.sizeDisplay}>
          最大: <strong>{currentSizeMB} MB</strong>
        </div>
      </div>
      
      <p className={styles.sizeHint}>
        大于此大小的文件将被自动排除
      </p>
    </div>
  );
};