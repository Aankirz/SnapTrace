import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'react-hot-toast';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "SnapTrace | Advanced Cybersecurity Monitoring",
  description: "Enterprise-grade security monitoring and threat detection platform",
  keywords: "cybersecurity, network monitoring, threat detection, security analytics",
  authors: [{ name: "SnapTrace Security" }],
  themeColor: "#00e5ff",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased hex-pattern`}
      >
        <Toaster 
          position="top-right"
          toastOptions={{
            // Default toast options
            duration: 3000,
            style: {
              background: 'var(--gray-900)',
              color: 'var(--foreground)',
              border: '1px solid var(--gray-800)',
            },
            success: {
              icon: '🔒',
              style: {
                border: '1px solid var(--success)',
              },
            },
            error: {
              icon: '⚠️',
              style: {
                border: '1px solid var(--danger)',
              },
            },
            loading: {
              icon: '🔄',
              style: {
                border: '1px solid var(--primary)',
              },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
