'use client';

import { useState, useCallback } from 'react';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import styles from './Editor.module.css';

/**
 * Markdown 編輯器元件
 * 支援「編輯 / 預覽」切換，儲存成功時邊框微動效
 * 
 * Props:
 *  - value: 文字內容
 *  - onChange: 內容變更回調
 *  - saveStatus: 儲存狀態 ('idle' | 'saved' | 'saving')
 *  - placeholder: 佔位文字
 */
export default function Editor({
    value = '',
    onChange,
    saveStatus = 'idle',
    placeholder = '寫下你的靈修心得...',
}) {
    const [mode, setMode] = useState('edit'); // 'edit' | 'preview'

    const handleChange = useCallback((e) => {
        if (onChange) onChange(e.target.value);
    }, [onChange]);

    return (
        <div className={`${styles.editorContainer} ${saveStatus === 'saved' ? styles.saved : ''}`}>
            {/* 工具列 */}
            <div className={styles.toolbar}>
                <div className={styles.modeTabs}>
                    <button
                        className={`${styles.tab} ${mode === 'edit' ? styles.active : ''}`}
                        onClick={() => setMode('edit')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                        </svg>
                        編輯
                    </button>
                    <button
                        className={`${styles.tab} ${mode === 'preview' ? styles.active : ''}`}
                        onClick={() => setMode('preview')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                        </svg>
                        預覽
                    </button>
                </div>

                {/* 儲存狀態 */}
                <div className={styles.saveStatus}>
                    {saveStatus === 'saving' && (
                        <span className={styles.saving}>
                            <span className="spinner" style={{ width: 12, height: 12 }} /> 儲存中...
                        </span>
                    )}
                    {saveStatus === 'saved' && (
                        <span className={styles.savedLabel}>✓ 已儲存</span>
                    )}
                </div>
            </div>

            {/* 編輯區 / 預覽區 */}
            <div className={styles.content}>
                {mode === 'edit' ? (
                    <textarea
                        className={styles.textarea}
                        value={value}
                        onChange={handleChange}
                        placeholder="寫下你的靈修心得..."
                        spellCheck={false}
                        enterKeyHint="enter"
                    />
                ) : (
                    <div className={`${styles.preview} markdown-body`}>
                        {value ? (
                            <Markdown remarkPlugins={[remarkBreaks]}>{value}</Markdown>
                        ) : (
                            <p className={styles.emptyPreview}>尚未輸入任何內容</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
