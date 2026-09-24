import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

export default defineConfig({
    plugins: [
        react(),
        {
            name: 'worker-mime-type',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    if (req.url?.endsWith('.mjs')) {
                        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
                    }
                    next();
                });
            }
        }
    ],
    server: {
        host: true,
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:8080',
                changeOrigin: true,
                rewriteHeaders: (headers) => {
                    headers['Access-Control-Allow-Origin'] = '*';
                }
            }
        }
    },
    preview: {
        host: true,
        port: 3000,
    },
    build: {
        sourcemap: true,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@shared': path.resolve(__dirname, './src/shared'),
            '@features': path.resolve(__dirname, './src/features'),
            '@components': path.resolve(__dirname, './src/shared/components'),
            '@services': path.resolve(__dirname, './src/shared/services'),
            '@context': path.resolve(__dirname, './src/shared/context'),
            '@hooks': path.resolve(__dirname, './src/shared/hooks'),
            '@utils': path.resolve(__dirname, './src/shared/utils'),
            '@types': path.resolve(__dirname, './src/shared/types'),
            '@styles': path.resolve(__dirname, './src/shared/styles'),
            'permissions': path.resolve(__dirname, './src/shared/services/permissions'),
            'DataTable': path.resolve(__dirname, './src/shared/components/DataTable'),
            'aluno': path.resolve(__dirname, './src/features/aluno/aluno'),
            'AlunoPortal.css': path.resolve(__dirname, './src/features/aluno/AlunoPortal.css'),
            'Auditoria': path.resolve(__dirname, './src/features/auditoria/Auditoria'),
            'curriculo': path.resolve(__dirname, './src/features/curriculo/curriculo'),
            'favoritos': path.resolve(__dirname, './src/features/favoritos/FavoritosMenu'),
            'notificacoes': path.resolve(__dirname, './src/features/notificacoes/NotificationBell'),
            'professor': path.resolve(__dirname, './src/features/professor/ViewProfessorScreen'),
            'relatorios': path.resolve(__dirname, './src/features/relatorios/relatorios'),
            'usuario': path.resolve(__dirname, './src/features/usuario/ViewUsuarioScreen'),
            'auth': path.resolve(__dirname, './src/features/auth/auth'),
            'api': path.resolve(__dirname, './src/features/auth/api'),
            'types': path.resolve(__dirname, './src/features/auth/types'),
            'aula': path.resolve(__dirname, './src/features/aluno/aluno'),
            'asaas': path.resolve(__dirname, './src/features/financeiro/asaas'),
        }
    }
});
