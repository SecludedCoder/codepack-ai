import React from 'react';
import styles from './styles.module.css';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>关于 CodePack AI</h4>
            <p className={styles.footerText}>
              智能代码打包工具，让代码整理变得轻松愉快。
              专为与 AI 对话而设计，支持多种编程语言和项目类型。
            </p>
          </div>
          
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>快速链接</h4>
            <ul className={styles.footerLinks}>
              <li>
                <a href="https://github.com/your-username/codepack-ai" target="_blank" rel="noopener noreferrer">
                  GitHub 仓库
                </a>
              </li>
              <li>
                <a href="https://github.com/your-username/codepack-ai/issues" target="_blank" rel="noopener noreferrer">
                  报告问题
                </a>
              </li>
              <li>
                <a href="https://github.com/your-username/codepack-ai/wiki" target="_blank" rel="noopener noreferrer">
                  使用文档
                </a>
              </li>
            </ul>
          </div>
          
          <div className={styles.footerSection}>
            <h4 className={styles.footerTitle}>技术支持</h4>
            <p className={styles.footerText}>
              推荐浏览器：Chrome 86+, Edge 86+, Opera 72+<br />
              需要帮助？查看我们的 <a href="#help">帮助文档</a>
            </p>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            © {currentYear} CodePack AI. All rights reserved.
          </p>
          <p className={styles.version}>
            Version 1.0.0
          </p>
        </div>
      </div>
    </footer>
  );
};