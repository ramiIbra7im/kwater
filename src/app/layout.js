// app/layout.js
"use client";
import "./globals.css";
import NavBar from "./components/NavBar";
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from "./context/AuthContext";

// يمكنك وضع الـ metadata في ملف منفصل أو استخدام generateMetadata
export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <title>خاطرتي</title>
        <meta name="description" content="منصة لكتابة ومشاركة الخواطر" />
      </head>
      <body className="bg-gray-50 text-gray-800">
        <AuthProvider>
          <NavBar />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '12px',
                fontSize: '15px',
                padding: '12px 18px',
              },
              success: {
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}