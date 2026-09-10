import {useEffect, useState} from 'react';
import {useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../../../shared/services/permissions';
import {api} from '../../../shared/services/api';

interface OrganogramaNo {
    id: string | number;
    parentId: string | number | null;
    name?: string;
    job?: string;
    department?: string;
    location?: string;
    status?: string;
    avatar?: string;
    cor?: string;
    [key: string]: unknown;
}

interface OrganogramaDados {
    id: number;
    nome: string;
    direcao: string;
    colunas: string[];
    nos: OrganogramaNo[];
}

export default function ViewRelatoriosViewOrganogramaListScreen() {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');

    const [dados, setDados] = useState<OrganogramaDados | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        if (!id) return;
        let ativo = true;
        setLoading(true);
        setError(undefined);
        (async () => {
            try {
                const resp = await api.get<OrganogramaDados>(`/api/relatorios/organograma/${id}/dados`);
                if (!ativo) return;
                setDados(resp.data);
            } catch (erro) {
                console.error('Erro ao carregar organograma:', erro);
                if (ativo) setError('Erro ao carregar os dados do organograma. Verifique o SQL cadastrado.');
            } finally {
                if (ativo) setLoading(false);
            }
        })();
        return () => { ativo = false; };
    }, [id]);

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Organograma{dados ? `: ${dados.nome}` : ''}</h1>
                {!id && <p>Selecione um organograma na listagem para visualizar.</p>}
                {loading && <p>Carregando...</p>}
                {error && <p style={{color: 'crimson'}}>{error}</p>}

                {dados && (
                    <div style={{padding: '16px', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                        <h3>Estrutura Organizacional</h3>
                        <ul>
                            {dados.nos.map((no) => (
                                <li key={String(no.id)} style={{margin: '8px 0'}}>
                                    <strong>{String(no.name ?? no.id)}</strong> {no.job ? `- ${no.job}` : ''} {no.department ? `(${no.department})` : ''}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </main>
        </PermissionGate>
    );
}
