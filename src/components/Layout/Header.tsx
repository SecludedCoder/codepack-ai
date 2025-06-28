import React from 'react';
import styles from './styles.module.css';

export const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span className={styles.logo}>📦</span>
          <h1 className={styles.title}>CodePack AI</h1>
          <span className={styles.subtitle}>智能代码打包工具</span>
        </div>
        
        <nav className={styles.nav}>
          <a 
            href="https://github.com/your-username/codepack-ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.navLink}
          >
            GitHub
          </a>
          <button className={styles.helpButton}>
            ❓ 帮助
          </button>
        </nav>
      </div>
    </header>
  );
};