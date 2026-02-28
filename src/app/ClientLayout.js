'use client';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Navigation from '@/components/Navigation';

/**
 * 客戶端 Layout Provider
 * 包裹 ThemeProvider, AuthProvider 與 Navigation
 */
function InnerLayout({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
            }}>
                <div className="spinner" />
            </div>
        );
    }

    return (
        <>
            {user && <Navigation />}
            <main>{children}</main>
        </>
    );
}

export default function ClientLayout({ children }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <InnerLayout>{children}</InnerLayout>
            </AuthProvider>
        </ThemeProvider>
    );
}
