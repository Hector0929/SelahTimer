import './globals.css';
import ClientLayout from './ClientLayout';

export const metadata = {
    title: 'Selah Timer — 數位靈修筆記空間',
    description: '具備雲端同步與成長統計的靈修計時器，隨時記錄你的靈修心得。',
};

export default function RootLayout({ children }) {
    return (
        <html lang="zh-Hant">
            <body>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}
