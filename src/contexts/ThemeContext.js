'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const THEMES = ['monster', 'light', 'dark'];

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('monster');
    const [mounted, setMounted] = useState(false);

    // 掛載時從 localStorage 讀取
    useEffect(() => {
        const savedTheme = localStorage.getItem('selah-theme');
        if (savedTheme && THEMES.includes(savedTheme)) {
            setTheme(savedTheme);
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            document.documentElement.setAttribute('data-theme', 'monster');
        }
        setMounted(true);
    }, []);

    // 當主題變更時更新 HTML 屬性與 localStorage
    const toggleTheme = () => {
        const currentIndex = THEMES.indexOf(theme);
        const nextIndex = (currentIndex + 1) % THEMES.length;
        const nextTheme = THEMES[nextIndex];

        setTheme(nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('selah-theme', nextTheme);
    };

    // 避免 SSR 時出現配色閃爍（或是內容不一致）
    // 在 mounted 之前可以回傳一個隱藏或預設的內容
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme 必須在 ThemeProvider 內使用');
    }
    return context;
}
