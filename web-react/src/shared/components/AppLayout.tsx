import type {ReactNode} from 'react';
import {useAuth} from '../../features/auth/auth';
import {NotificationBell} from '../../features/notificacoes/NotificationBell';
import {ReportButton} from '../../ReportButton';
import {FavoritosMenu} from '../../features/favoritos/FavoritosMenu';
import {UserMenu} from './UserMenu';
import Sidebar from './Sidebar';
import PageHeader from './PageHeader';
import {useTheme} from '../context/ThemeContext';
import {PhotoModalProvider, usePhotoModal} from './PhotoModalContext';
import {PhotoUploadModal} from './PhotoUploadModal';
import './AppLayout.css';

function AppLayoutContent({children}: { children: ReactNode }) {
    const {session} = useAuth();
    const {tema} = useTheme();
    const {isOpen, close, currentFoto, username, onPhotoUpdate} = usePhotoModal();
    
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
            <Sidebar onPhotoAction={() => { if (session) usePhotoModal().open(session.foto, session.username); }} />
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
            <PhotoUploadModal
                isOpen={isOpen}
                onClose={close}
                onPhotoUpdate={onPhotoUpdate}
                currentFoto={currentFoto}
                username={username}
            />
        </div>
    );
}

export default function AppLayout({children}: { children: ReactNode }) {
    return (
        <PhotoModalProvider>
            <AppLayoutContent children={children} />
        </PhotoModalProvider>
    );
}
