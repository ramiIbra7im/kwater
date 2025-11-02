import "./globals.css";
import NavBar from "./components/NavBar";
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from "./context/AuthContext";
export const metadata = {
  title: "خاطرتي",
  description: "منصة لكتابة ومشاركة الخواطر",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-50 text-gray-800">
        <AuthProvider>
          <NavBar />
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              // الشكل العام لكل التوستات
              style: {
                background: '#333',
                color: '#fff',
                borderRadius: '12px',
                fontSize: '15px',
                padding: '12px 18px',
              },
              // خصائص خاصة بـ success
              success: {
                iconTheme: {
                  primary: '#4ade80', // أخضر فاتح
                  secondary: '#fff',
                },
              },
              // خصائص خاصة بـ error
              error: {
                iconTheme: {
                  primary: '#ef4444', // أحمر
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
