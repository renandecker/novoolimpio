import {useEffect, useMemo, useState} from 'react';
import {PermissionGate} from '../../shared/services/permissions';
import {api} from '../../shared/services/api';

interface ModuloMenu {
    id: number;
    antecessorId: number | null;
    rotulo: string;
}

export default function ViewMenuListMapaMenuListScreen() {
    const [modulos, setModulos] = useState<ModuloMenu[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        let ativo = true;
        setLoading(true);
        setError(undefined);
        (async () => {
            try {
                const resp = await api.get<ModuloMenu[]>('/api/basico/modulo/menu');
                if (ativo) setModulos(resp.data);
            } catch (erro) {
                if (ativo) setError('Erro ao carregar o menu.');
            } finally {
                if (ativo) setLoading(false);
            }
        })();
        return () => { ativo = false; };
    }, []);

    const nodes = useMemo(() =>
        modulos.map(m => ({
            id: m.id,
            parentId: m.antecessorId,
            name: m.rotulo,
        })),
        [modulos],
    );

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Mapa Menu</h1>
                {loading && <p>Carregando...</p>}
                {error && <p style={{color: 'crimson'}}>{error}</p>}
                {nodes.length === 0 && !loading && <p>Nenhum módulo encontrado.</p>}
                {nodes.length > 0 && (
                    <div style={{padding: '16px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                        <ul>
                            {nodes.map(node => (
                                <li key={node.id} style={{margin: '8px 0'}}>
                                    <strong>{node.name}</strong> (ID: {node.id}, Antecessor: {node.parentId ?? 'Nenhum'})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </PermissionGate>
    );
}