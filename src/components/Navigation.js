'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import styles from './Navigation.module.css';

export default function Navigation() {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const { theme, toggleTheme, mounted } = useTheme();

    if (!user) return null;

    return (
        <nav className={styles.nav}>
            <div className={styles.container}>
                {/* 品牌 */}
                <Link href="/workspace" className={styles.brand}>
                    <span className={styles.logo}>✝</span>
                    <span className={styles.brandName}>Selah</span>
                </Link>

                {/* 導航連結 */}
                <div className={styles.links}>
                    <Link
                        href="/workspace"
                        className={`${styles.link} ${pathname === '/workspace' ? styles.active : ''}`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
                        </svg>
                        靈修
                    </Link>
                    <Link
                        href="/dashboard"
                        className={`${styles.link} ${pathname === '/dashboard' ? styles.active : ''}`}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                        </svg>
                        總覽
                    </Link>
                </div>

                {/* 右側：主題切換 + 使用者 */}
                <div className={styles.userSection}>
                    {/* 主題切換按鈕 */}
                    <button
                        className={`${styles.themeToggle}`}
                        onClick={toggleTheme}
                        title="切換佈景主題"
                    >
                        {!mounted ? (
                            <div className="spinner" style={{ width: 14, height: 14 }} />
                        ) : theme === 'monster' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4C12.92 3.04 12.46 3 12 3z" />
                            </svg>
                        ) : theme === 'light' ? (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5.5-2.5l7.5-7.5L16.5 14l-4.5 4.5-5.5-1z" />
                                <circle cx="9" cy="9" r="2" />
                            </svg>
                        )}
                    </button>

                    <span className={styles.userName}>
                        {user.displayName?.split(' ')[0] || '使用者'}
                    </span>
                    <button className={`btn btn-ghost btn-sm ${styles.signOutBtn}`} onClick={signOut}>
                        登出
                    </button>
                </div>
            </div>
        </nav>
    );
}
