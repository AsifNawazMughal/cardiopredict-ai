import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata = {
  title: "CardioPredict AI",
  description: "Heart Disease Prediction System — CS619 FYP",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              padding: "14px 16px",
              fontSize: "14px",
              fontWeight: 500,
              color: "#fff",
              minWidth: "280px",
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.15), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
            },
            success: {
              iconTheme: { primary: "#fff", secondary: "#dc2626" },
              style: { background: "linear-gradient(to right, #dc2626, #e11d48)" },
            },
            error: {
              iconTheme: { primary: "#fff", secondary: "#991b1b" },
              style: { background: "linear-gradient(to right, #991b1b, #be123c)" },
            },
            loading: {
              style: { background: "linear-gradient(to right, #6b7280, #4b5563)" },
            },
          }}
        />
      </body>
    </html>
  );
}
