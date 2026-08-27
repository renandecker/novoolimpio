import {useEffect, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api} from '../api';
import {ModuleList} from '../screens/ViewModuleList';

interface DocumentoItem {
    id: number;
    nome: string;
    descricao: string | null;
    tipoRelatorio: string | null;
    ativo: boolean;
}

function ViewConfiguracaoDocumentosListScreen() {
    const [items, setItems] = useState<DocumentoItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function carregar() {
            try {
                const response = await api.get<{content: DocumentoItem[], totalElements: number}>('/api/view/configuracao/documentos?size=10');
                setItems(response.data.content ?? []);
            } catch (error) {
                console.error('Erro ao carregar documentos:', error);
            } finally {
                setLoading(false);
            }
        }
        carregar();
    }, []);

    if (loading) return <ModuleList path="/api/view/configuracao/documentos" title="Carregando..."/>;

    return (
        <ModuleList
            path="/api/view/configuracao/documentos"
            title="Configuração Documentos"
            extra={items.map((item, index) => ({
                key: String(index),
                label: item.nome,
                descricao: item.descricao,
            }))}
        />
    );
}

export default ViewConfiguracaoDocumentosListScreen;