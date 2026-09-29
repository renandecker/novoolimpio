import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {PermissionGate} from '../../shared/services/permissions';
import {FormLayout, FormTabConfig} from '../../shared/components/FormLayout';
import {MasterDetail} from '../../shared/components/MasterDetail';
import {api} from '../../shared/services/api';
import type {ApiItem} from '../../shared/types/types.ts';

const UNIDADE_COLUMNS = [
    {key: 'sucinto', label: 'Unidade'},
    {key: 'CNPJ', label: 'CNPJ'},
    {key: 'nomeFantasia', label: 'Nome Fantasia'},
];

type AcaoCampanha = {
    tipoCanalId: string;
    tipoCanalDescricao: string;
    estrategiaId: string;
    estrategiaDescricao: string;
    dataInicial: string;
    dataFinal: string;
};

export default function ViewCampanhaFormCampanhaListScreen() {
    const navigate = useNavigate();
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [acoes, setAcoes] = useState<AcaoCampanha[]>([]);
    const [acaoAtual, setAcaoAtual] = useState({tipoCanalId: '', estrategiaId: '', dataInicial: '', dataFinal: ''});
    const [tipoCanalOptions, setTipoCanalOptions] = useState<ApiItem[]>([]);
    const [estrategiaOptions, setEstrategiaOptions] = useState<ApiItem[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const loadCombos = async () => {
        if (loaded) return;
        setLoaded(true);
        try {
            const [tc, est] = await Promise.all([
                api.get<ApiItem[]>('/api/comercial/tipo-canal').then(r => r.data).catch(() => []),
                api.get<ApiItem[]>('/api/comercial/estrategia').then(r => r.data).catch(() => []),
            ]);
            setTipoCanalOptions(Array.isArray(tc) ? tc : []);
            setEstrategiaOptions(Array.isArray(est) ? est : []);
        } catch {
            /* combos opcionais */
        }
    };

    const addAcao = () => {
        if (!acaoAtual.tipoCanalId || !acaoAtual.estrategiaId) {
            alert('Tipo Canal e Estratégia são obrigatórios para a ação de campanha');
            return;
        }
        const tc = tipoCanalOptions.find((t: any) => String((t as any).id) === acaoAtual.tipoCanalId);
        const es = estrategiaOptions.find((t: any) => String((t as any).id) === acaoAtual.estrategiaId);
        setAcoes(prev => [...prev, {
            tipoCanalId: acaoAtual.tipoCanalId,
            tipoCanalDescricao: (tc as any)?.descricao ?? acaoAtual.tipoCanalId,
            estrategiaId: acaoAtual.estrategiaId,
            estrategiaDescricao: (es as any)?.descricao ?? acaoAtual.estrategiaId,
            dataInicial: acaoAtual.dataInicial,
            dataFinal: acaoAtual.dataFinal,
        }]);
        setAcaoAtual({tipoCanalId: '', estrategiaId: '', dataInicial: '', dataFinal: ''});
    };

    const tabs: FormTabConfig[] = [
        {
            key: 'dados',
            label: 'Dados Gerais',
            fields: [
                {name: 'id', label: 'ID', readOnly: true},
                {name: 'descricao', label: 'Descrição', required: true, placeholder: 'Ex: Campanha Matrículas 2026'},
                {name: 'dataInicial', label: 'Data Inicial', type: 'date', required: true},
                {name: 'meta', label: 'Meta (qtd prospectos)', type: 'number', required: true},
                {name: 'ativo', label: 'Ativo', type: 'boolean', booleanLabels: {on: 'Sim', off: 'Não'}},
            ],
        },
        {
            key: 'unidades',
            label: 'Unidades',
            content: (
                <MasterDetail
                    label="Unidades da campanha"
                    source="/api/basico/unidade"
                    valueKey="id"
                    searchKeys={['sucinto', 'razaoSocial', 'nomeFantasia']}
                    columns={UNIDADE_COLUMNS}
                    items={unidades}
                    onChange={setUnidades}
                />
            ),
        },
        {
            key: 'acoes',
            label: 'Ações de Campanha',
            content: (
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}} onMouseEnter={loadCombos} onFocus={loadCombos}>
                        <label className="form-field"><span className="form-label">Tipo Canal *</span>
                            <select className="form-input form-select" value={acaoAtual.tipoCanalId} onChange={e => setAcaoAtual({...acaoAtual, tipoCanalId: e.target.value})}>
                                <option value="">Selecione...</option>
                                {tipoCanalOptions.map((t: any) => <option key={t.id} value={t.id}>{t.descricao ?? t.nome ?? `#${t.id}`}</option>)}
                            </select>
                        </label>
                        <label className="form-field"><span className="form-label">Estratégia *</span>
                            <select className="form-input form-select" value={acaoAtual.estrategiaId} onChange={e => setAcaoAtual({...acaoAtual, estrategiaId: e.target.value})}>
                                <option value="">Selecione...</option>
                                {estrategiaOptions.map((t: any) => <option key={t.id} value={t.id}>{t.descricao ?? t.nome ?? `#${t.id}`}</option>)}
                            </select>
                        </label>
                        <label className="form-field"><span className="form-label">Data Inicial *</span>
                            <input type="date" className="form-input" value={acaoAtual.dataInicial} onChange={e => setAcaoAtual({...acaoAtual, dataInicial: e.target.value})}/>
                        </label>
                        <label className="form-field"><span className="form-label">Data Final *</span>
                            <input type="date" className="form-input" value={acaoAtual.dataFinal} onChange={e => setAcaoAtual({...acaoAtual, dataFinal: e.target.value})}/>
                        </label>
                    </div>
                    <div><button type="button" className="btnstop" onClick={addAcao}>+ Adicionar ação</button></div>
                    <table className="data-table">
                        <thead><tr><th>Tipo Canal</th><th>Estratégia</th><th>Data Inicial</th><th>Data Final</th><th/></tr></thead>
                        <tbody>
                            {acoes.length === 0 && <tr><td colSpan={5} style={{textAlign: 'center', color: '#888'}}>Nenhuma ação adicionada</td></tr>}
                            {acoes.map((a, i) => (
                                <tr key={i}><td>{a.tipoCanalDescricao}</td><td>{a.estrategiaDescricao}</td><td>{a.dataInicial}</td><td>{a.dataFinal}</td>
                                    <td><button type="button" onClick={() => setAcoes(prev => prev.filter((_, x) => x !== i))}>−</button></td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ),
        },
    ];

    const handleSubmit = async (values: Record<string, unknown>) => {
        const descricao = String(values.descricao ?? '').trim();
        if (descricao.length < 3) { setError('Descrição deve ter pelo menos 3 caracteres'); return; }
        if (!values.dataInicial) { setError('Data inicial é obrigatória'); return; }
        if (unidades.length === 0) { setError('Selecione pelo menos uma unidade'); return; }
        setError('');
        setSaving(true);
        try {
            await api.post('/api/view/campanha/formCampanha', {
                id: values.id ? Number(values.id) : null,
                descricao,
                dataInicial: values.dataInicial,
                meta: values.meta ? Number(values.meta) : null,
                ativo: values.ativo ?? true,
                unidades: unidades.map(u => (u as any).id),
                acoesDeCampanha: acoes,
            });
            alert('Campanha salva com sucesso!');
            navigate('/view/campanha/listCampanha');
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Erro ao salvar campanha');
        } finally {
            setSaving(false);
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <FormLayout
                    title="Form Campanha"
                    tabs={tabs}
                    initialValues={{ativo: true}}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/view/campanha/listCampanha')}
                    saving={saving}
                    error={error}
                    submitLabel="Salvar"
                    cancelLabel="Voltar"
                />
            </main>
        </PermissionGate>
    );
}
