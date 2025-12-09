// src/components/MainLayout.tsx
import { ReactNode } from 'react';
import { BottomNav } from '@/components/couple/BottomNav';

type MainLayoutProps = {
  children: ReactNode;
};

// Komponen ini digunakan untuk membungkus halaman yang membutuhkan BottomNav
const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      {children}
      <BottomNav />
    </div>
  );
};

export default MainLayout;