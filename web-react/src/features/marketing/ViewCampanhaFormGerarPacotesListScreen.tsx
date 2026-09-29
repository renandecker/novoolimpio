import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {PermissionGate} from '../../shared/services/permissions';
import {Wizard} from '../../shared/components/Wizard';
import {MasterDetail} from '../../shared/components/MasterDetail';
import {api} from '../../shared/services/api';
import type {ApiItem} from '../../shared/types/types.ts';

const ACAO_COLUMNS = [
    {key: 'descricao', label: 'Ação'},
    {key: 'tipoCanal', label: 'Canal'},
];

export default function ViewCampanhaFormGerarPacotesListScreen() {
    const navigate = useNavigate();
    const [acoes, setAcoes] = useState<ApiItem[]>([]);
    const [acaoId, setAcaoId] = useState('');
    const [unidadeId, setUnidadeId] = useState('');
    const [quantidade, setQuantidade] = useState('');
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [disponiveis, setDisponiveis] = useState<number | null>(null);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        api.get<ApiItem[]>('/api/basico/unidade').then(r => setUnidades(Array.isArray(r.data) ? r.data : [])).catch(() => {});
    }, []);

    useEffect(() => {
        if (!unidadeId || !acaoId) { setDisponiveis(null); return; }
        api.get<{total?: number}>(`/api/view/campanha/gerarPacotes/disponiveis?unidadeId=${unidadeId}&acaoId=${acaoId}`)
            .then(r => setDisponiveis((r.data as any)?.total ?? (r.data as any)?.quantidade ?? null))
            .catch(() => setDisponiveis(null));
    }, [unidadeId, acaoId]);

    const handleGerar = async () => {
        if (!acaoId) { setError('Selecione a ação de campanha'); return; }
        if (!unidadeId) { setError('Selecione a unidade'); return; }
        const qtd = Number(quantidade);
        if (!qtd || qtd <= 0) { setError('Informe a quantidade de prospectos'); return; }
        setError('');
        setSaving(true);
        try {
            await api.post('/api/view/campanha/formGerarPacotes', {
                acaoDeCampanhaId: Number(acaoId),
                unidadeId: Number(unidadeId),
                numeroProspectos: qtd,
                acoes: acoes.map(a => (a as any).id),
            });
            alert('Pacotes gerados com sucesso!');
            navigate('/view/campanha/listCampanha');
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Erro ao gerar pacotes');
        } finally {
            setSaving(false);
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Gerar Pacotes</h1>
                <div className="div_form">
                    <div className="form-title">Assistente de geração de pacotes</div>
                    {error && <div className="form-erro">{error}</div>}
                    <Wizard
                        steps={[
                            {
                                key: 'informacoes',
                                label: 'Informações',
                                content: (
                                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '10px'}}>
                                        <label className="form-field"><span className="form-label">Ação de campanha *</span>
                                            <input className="form-input" placeholder="ID da ação" value={acaoId} onChange={e => setAcaoId(e.target.value)}/>
                                        </label>
                                        <label className="form-field"><span className="form-label">Unidade *</span>
                                            <select className="form-input form-select" value={unidadeId} onChange={e => setUnidadeId(e.target.value)}>
                                                <option value="">Selecione...</option>
                                                {unidades.map((u: any) => <option key={u.id} value={u.id}>{u.sucinto ?? u.nome ?? `#${u.id}`}</option>)}
                                            </select>
                                        </label>
                                        <label className="form-field"><span className="form-label">Quantidade de prospectos *</span>
                                            <input type="number" min={1} className="form-input" value={quantidade} onChange={e => setQuantidade(e.target.value)}/>
                                        </label>
                                        <div className="form-field"><span className="form-label">Total disponíveis</span>
                                            <div style={{padding: '8px 0', color: '#555'}}>{disponiveis ?? '—'}</div>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: 'filtros',
                                label: 'Filtros',
                                content: (
                                    <MasterDetail
                                        label="Ações (filtro)"
                                        source="/api/comercial/acao"
                                        valueKey="id"
                                        searchKeys={['descricao']}
                                        columns={ACAO_COLUMNS}
                                        items={acoes}
                                        onChange={setAcoes}
                                    />
                                ),
                            },
                            {
                                key: 'geracao',
                                label: 'Geração',
                                content: (
                                    <div style={{padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                                        <p style={{color: '#666'}}>Confirme os dados e clique em gerar pacotes. Ação: {acaoId || '—'} · Unidade: {unidadeId || '—'} · Qtd: {quantidade || '—'}</p>
                                        <div><button type="button" className="btnstop" disabled={saving} onClick={handleGerar}>{saving ? 'Gerando...' : 'Gerar pacotes'}</button></div>
                                    </div>
                                ),
                            },
                        ]}
                    />
                    <div style={{marginTop: '12px'}}><button type="button" onClick={() => navigate('/view/campanha/listCampanha')}>Voltar</button></div>
                </div>
            </main>
        </PermissionGate>
    );
}
