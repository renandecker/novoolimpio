import type {ReactNode} from 'react';
import {useAuth} from './auth';
import {NotificationBell} from './NotificationBell';
import {ReportButton} from './ReportButton';
import {FavoritosMenu} from './FavoritosMenu';
import {UserMenu} from './UserMenu';
import Sidebar from './Sidebar';
import PageHeader from './PageHeader';
import {useTheme} from './ThemeContext';
import './AppLayout.css';

export default function AppLayout({children}: { children: ReactNode }) {
    const {tema} = useTheme();
    
    const appLayoutStyle: React.CSSProperties = {
        backgroundImage: tema?.imagemFundo ? `url(${tema.imagemFundo})` : 'none',
        backgroundRepeat: 'repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    } as React.CSSProperties;
    
    const headerStyle: React.CSSProperties = {
        backgroundImage: tema?.bannerCabecalho ? `url(${tema.bannerCabecalho})` : 'none',
        backgroundRepeat: 'repeat-x',
        backgroundSize: 'cover',
    } as React.CSSProperties;
    
    const footerStyle: React.CSSProperties = {
        backgroundImage: tema?.bannerRodape ? `url(${tema.bannerRodape})` : 'none',
        backgroundRepeat: 'repeat-x',
        backgroundSize: 'cover',
    } as React.CSSProperties;

    return (
        <div className="app-layout" style={appLayoutStyle}>
            <Sidebar/>
            <div className="app-main">
                <header className="app-header" style={headerStyle}>
                    <div className="app-header-left">
                        <span className="app-header-logo">O</span>
                        <span className="app-header-title">Olímpio</span>
                    </div>
                    <div className="app-header-right">
                        <NotificationBell/>
                        <ReportButton/>
                        <FavoritosMenu/>
                        <UserMenu/>
                    </div>
                </header>

                <div className="app-content">
                    <PageHeader/>
                    {children}
                </div>

                <footer className="app-footer" style={footerStyle}/>
            </div>
        </div>
    );
}
