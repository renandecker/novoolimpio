import {useCallback, useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PermissionGate, usePermissions} from '../../../shared/services/permissions';
import {BooleanField} from '../../../shared/components/BooleanField';
import {api} from '../../../shared/services/api';
import {INDICADOR_API, INDICADOR_META_SOURCE, bool, fetchIndicadorMetas, num, rec, str} from '../meta/metaDinamica';

const FORMATOS = [
    {value: 'R', label: 'Real'},
    {value: 'N', label: 'Numérico'},
    {value: 'P', label: 'Percentual'},
];

interface MetaIndicador {
    id: number | null;
    descricao: string;
    formato: string;
}

const novaMeta = (): MetaIndicador => ({id: null, descricao: '', formato: ''});

const paraMeta = (row: Record<string, unknown>): MetaIndicador => ({
    id: num(row.id),
    descricao: str(row.descricao),
    formato: str(row.formato),
});

export default function ViewIndicadorFormIndicadorListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {can} = usePermissions();

    const id = num(searchParams.get('id'));
    const [carregando, setCarregando] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState<string>();
    const [aviso, setAviso] = useState<string>();

    const [nome, setNome] = useState('');
    const [dia, setDia] = useState(false);
    const [mes, setMes] = useState(false);
    const [ano, setAno] = useState(false);
    const [semana, setSemana] = useState(false);
    const [metas, setMetas] = useState<MetaIndicador[]>([]);
    const [removidas, setRemovidas] = useState<number[]>([]);

    const [novaDescricao, setNovaDescricao] = useState('');
    const [novoFormato, setNovoFormato] = useState('');

    const carregar = useCallback(async (indicadorId: number) => {
        setCarregando(true);
        setErro(undefined);
        try {
            const {data} = await api.get<Record<string, unknown>>(`${INDICADOR_API}/${indicadorId}`);
            const row = rec(data);
            setNome(str(row.nome));
            setDia(bool(row.dia));
            setMes(bool(row.mes));
            setAno(bool(row.ano));
            setSemana(bool(row.semana));
            setMetas((await fetchIndicadorMetas(indicadorId)).map(paraMeta));
        } catch (e) {
            console.error('Erro ao carregar indicador:', e);
            setErro('Erro ao carregar o indicador.');
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        if (id !== null) void carregar(id);
    }, [id, carregar]);

    const adicionarMeta = () => {
        if (!novaDescricao.trim()) {
            setErro('Informe a descrição da meta.');
            return;
        }
        if (!novoFormato) {
            setErro('Selecione o formato da meta.');
            return;
        }
        setMetas((prev) => [...prev, {...novaMeta(), descricao: novaDescricao.trim(), formato: novoFormato}]);
        setNovaDescricao('');
        setNovoFormato('');
        setErro(undefined);
    };

    const removerMeta = (meta: MetaIndicador) => {
        if (meta.id !== null) setRemovidas((prev) => [...prev, meta.id as number]);
        setMetas((prev) => prev.filter((item) => item !== meta));
    };

    const salvar = async () => {
        if (!nome.trim()) {
            setErro('Informe o nome do indicador.');
            return;
        }
        if (metas.length === 0) {
            setErro('Cadastre ao menos uma meta para o indicador.');
            return;
        }
        setSalvando(true);
        setErro(undefined);
        setAviso(undefined);
        try {
            const body = {nome: nome.trim(), dia, mes, ano, semana};
            let indicadorId = id;
            if (indicadorId === null) {
                const {data} = await api.post<Record<string, unknown>>(INDICADOR_API, body);
                indicadorId = num(rec(data).id);
            } else {
                await api.put(`${INDICADOR_API}/${indicadorId}`, body);
            }
            if (indicadorId === null) throw new Error('Indicador sem id');

            for (const meta of metas) {
                const metaBody = {descricao: meta.descricao.trim(), formato: meta.formato, id_indicador: indicadorId};
                if (meta.id !== null) {
                    await api.put(`${INDICADOR_META_SOURCE}/${meta.id}`, metaBody);
                } else {
                    await api.post(INDICADOR_META_SOURCE, metaBody);
                }
            }
            for (const removida of removidas) {
                await api.delete(`${INDICADOR_META_SOURCE}/${removida}`);
            }

            setAviso('Indicador salvo com sucesso.');
            if (id === null) {
                navigate(`/view/indicador/formIndicador?id=${indicadorId}`);
            } else {
                await carregar(indicadorId);
                setRemovidas([]);
            }
        } catch (e) {
            console.error('Erro ao salvar indicador:', e);
            setErro('Erro ao salvar o indicador.');
        } finally {
            setSalvando(false);
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="page-header">
                    <div className="page-header-breadcrumb">
                        <nav className="breadcrumb" aria-label="Breadcrumb">
                            <div className="breadcrumb-group">
                                <span className="breadcrumb-item breadcrumb-current">
                                    Indicador {id !== null ? '— Alteração' : '— Cadastro'}
                                </span>
                            </div>
                        </nav>
                    </div>
                </div>

                <div className="div_form" style={{maxWidth: 980, margin: '0 auto', padding: 16}}>
                    {erro && (
                        <div style={{background: '#fff0f0', border: '1px solid #f5c6cb', color: '#a61b29', padding: '10px 14px', borderRadius: 6, marginBottom: 12}}>
                            {erro}
                        </div>
                    )}
                    {aviso && (
                        <div style={{background: '#e8f5e9', border: '1px solid #c8e6c9', color: '#1b5e20', padding: '10px 14px', borderRadius: 6, marginBottom: 12}}>
                            {aviso}
                        </div>
                    )}

                    <div className="form-grid">
                        <label className="form-field">
                            <span className="form-label">ID</span>
                            <input className="form-input" value={id ?? ''} readOnly disabled style={{maxWidth: 120}}/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Nome *</span>
                            <input
                                className="form-input"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                disabled={carregando}
                            />
                        </label>
                        <div className="form-field">
                            <span className="form-label">Dia</span>
                            <BooleanField value={dia} onChange={setDia} disabled={carregando}/>
                        </div>
                        <div className="form-field">
                            <span className="form-label">Mês</span>
                            <BooleanField value={mes} onChange={setMes} disabled={carregando}/>
                        </div>
                        <div className="form-field">
                            <span className="form-label">Ano</span>
                            <BooleanField value={ano} onChange={setAno} disabled={carregando}/>
                        </div>
                        <div className="form-field">
                            <span className="form-label">Percentual Semana</span>
                            <BooleanField value={semana} onChange={setSemana} disabled={carregando}/>
                        </div>
                    </div>

                    <section style={{marginTop: 20}}>
                        <h3 style={{margin: '0 0 10px', fontSize: 14}}>Metas</h3>
                        <div style={{display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 10}}>
                            <label className="form-field" style={{flex: 1, minWidth: 200}}>
                                <span className="form-label">Nome</span>
                                <input
                                    className="form-input"
                                    value={novaDescricao}
                                    onChange={(e) => setNovaDescricao(e.target.value)}
                                />
                            </label>
                            <label className="form-field" style={{width: 180}}>
                                <span className="form-label">Formato</span>
                                <select
                                    className="form-input form-select"
                                    value={novoFormato}
                                    onChange={(e) => setNovoFormato(e.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {FORMATOS.map((formato) => (
                                        <option key={formato.value} value={formato.value}>{formato.label}</option>
                                    ))}
                                </select>
                            </label>
                            <button type="button" className="btnsky" style={{height: 38}} onClick={adicionarMeta}>
                                Adicionar meta
                            </button>
                        </div>

                        {metas.length === 0 ? (
                            <p style={{color: '#888', fontStyle: 'italic', margin: 0}}>Nenhum registro encontrado.</p>
                        ) : (
                            <table className="lote-table">
                                <thead>
                                <tr>
                                    <th style={{width: '50%'}}>Descrição</th>
                                    <th style={{width: '30%'}}>Formato</th>
                                    <th style={{width: '20%', textAlign: 'center'}}>Ação</th>
                                </tr>
                                </thead>
                                <tbody>
                                {metas.map((meta, index) => (
                                    <tr key={meta.id ?? `nova-${index}`}>
                                        <td>
                                            <input
                                                className="form-input"
                                                value={meta.descricao}
                                                onChange={(e) => setMetas((prev) => prev.map((item, i) =>
                                                    (i === index ? {...item, descricao: e.target.value} : item)))}
                                            />
                                        </td>
                                        <td>
                                            <select
                                                className="form-input form-select"
                                                value={meta.formato}
                                                onChange={(e) => setMetas((prev) => prev.map((item, i) =>
                                                    (i === index ? {...item, formato: e.target.value} : item)))}
                                            >
                                                <option value="">Selecione</option>
                                                {FORMATOS.map((formato) => (
                                                    <option key={formato.value} value={formato.value}>{formato.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td style={{textAlign: 'center'}}>
                                            <button
                                                type="button"
                                                className="btnstop"
                                                onClick={() => removerMeta(meta)}
                                                disabled={!can('DELETE')}
                                            >
                                                Remover
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </section>

                    <div className="form-buttons" style={{display: 'flex', gap: 8, justifyContent: 'flex-end'}}>
                        <button
                            type="button"
                            className="btnyellow"
                            onClick={() => navigate('/view/indicador/listIndicador')}
                            disabled={salvando}
                        >
                            Voltar
                        </button>
                        {can('CREATE') || can('UPDATE') ? (
                            <button
                                type="button"
                                className="btngreen"
                                onClick={() => void salvar()}
                                disabled={salvando || carregando}
                            >
                                {salvando ? 'Salvando...' : 'Salvar'}
                            </button>
                        ) : null}
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
