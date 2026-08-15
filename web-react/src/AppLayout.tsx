import type { ReactNode } from 'react';
import { useAuth } from './auth';
import { NotificationBell } from './NotificationBell';
import { ReportButton } from './ReportButton';
import { FavoritosMenu } from './FavoritosMenu';
import { UserMenu } from './UserMenu';
import Sidebar from './Sidebar';
import PageHeader from './PageHeader';
import './AppLayout.css';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="app-main">
        <header className="app-header">
          <div className="app-header-left">
            <span className="app-header-logo">O</span>
            <span className="app-header-title">Olímpio</span>
          </div>
          <div className="app-header-right">
            <NotificationBell />
            <ReportButton />
            <FavoritosMenu />
            <UserMenu />
          </div>
        </header>

        <div className="app-content">
          <PageHeader />
          {children}
        </div>

        <footer className="app-footer" />
      </div>
    </div>
  );
}