import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../../../shared/services/permissions';
import {FormLayout, FormTabConfig} from '../../../shared/components/FormLayout';
import {MasterDetail, MasterDetailColumn} from '../../../shared/components/MasterDetail';
import {AutoComplete, AutoCompleteOption} from '../../../shared/components/AutoComplete';
import {COMPONENTE_SOURCE, COMPONENTE_COLUMNS, COMPONENTE_SEARCH} from '../../../shared/services/masterDetailSources';
import {api} from '../../../shared/services/api';

const COMPONENTE_COLUMNS_PROF: MasterDetailColumn[] = COMPONENTE_COLUMNS.map((c) => ({...c}));

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));

const toDateInput = (v: unknown): string => {
    if (!v) return '';
    const d = new Date(v as string);
    if (isNaN(d.getTime())) {
        const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v));
        return m ? `${m[1]}-${m[2]}-${m[3]}` : '';
    }
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
};

const fromDateInput = (v: string): string | null => {
    if (!v) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
    if (!m) return null;
    return `${m[1]}-${m[2]}-${m[3]}`;
};

const timeToInput = (v: unknown): string => {
    if (!v) return '';
    const s = String(v);
    const m = /(\d{2}):(\d{2})/.exec(s);
    if (m) return `${m[1]}:${m[2]}`;
    try {
        const d = new Date(s);
        if (!isNaN(d.getTime())) {
            const hh = String(d.getHours()).padStart(2, '0');
            const mm = String(d.getMinutes()).padStart(2, '0');
            return `${hh}:${mm}`;
        }
    } catch {}
    return '';
};

const inputToTime = (v: string): string | null => {
    if (!v) return null;
    const m = /^(\d{2}):(\d{2})$/.exec(v);
    if (!m) return null;
    return `${m[1]}:${m[2]}:00`;
};

const toOptionsPF = (rows: Array<Record<string, unknown>>): AutoCompleteOption[] =>
    (rows ?? []).map((row) => {
        const idPessoa = row.id_pessoa ?? row.pessoaId ?? row.id;
        const nome = row.nome ?? row.nome_social ?? row.razao_social ?? row.nomeFantasia;
        const cpf = row.cpf ?? '';
        const label = nome && cpf ? `${String(nome)} (${String(cpf)})` : nome ? String(nome) : String(idPessoa ?? '');
        return {id: Number(idPessoa), label};
    });

const toOptionsPJ = (rows: Array<Record<string, unknown>>): AutoCompleteOption[] =>
    (rows ?? []).map((row) => {
        const idPessoa = row.id_pessoa ?? row.pessoaId ?? row.id;
        const nome = row.nome_fantasia ?? row.razao_social ?? row.nome;
        const cnpj = row.cnpj ?? '';
        const label = nome && cnpj ? `${String(nome)} (${String(cnpj)})` : nome ? String(nome) : String(idPessoa ?? '');
        return {id: Number(idPessoa), label};
    });

const fetchPessoaFisicaOptions = async (q: string): Promise<AutoCompleteOption[]> => {
    if (q.length < 3) return [];
    const {data} = await api.get<Array<Record<string, unknown>>>('/api/view/pessoa-fisica/listPessoaFisica', {
        params: {q},
    });
    return toOptionsPF(data ?? []);
};

const fetchPessoaJuridicaOptions = async (q: string): Promise<AutoCompleteOption[]> => {
    if (q.length < 3) return [];
    const {data} = await api.get<Array<Record<string, unknown>>>('/api/view/pessoa-juridica/listPessoaJuridica', {
        params: {q},
    });
    return toOptionsPJ(data ?? []);
};

const fetchPessoaFisicaById = async (id: number): Promise<AutoCompleteOption | null> => {
    try {
        const {data} = await api.get<Record<string, unknown>>(`/api/view/pessoa-fisica/listPessoaFisica/${id}`);
        const opts = toOptionsPF([data]);
        return opts.length ? opts[0] : null;
    } catch {
        return null;
    }
};

const fetchPessoaJuridicaById = async (id: number): Promise<AutoCompleteOption | null> => {
    try {
        const {data} = await api.get<Record<string, unknown>>(`/api/view/pessoa-juridica/listPessoaJuridica/${id}`);
        const opts = toOptionsPJ([data]);
        return opts.length ? opts[0] : null;
    } catch {
        return null;
    }
};

const fetchUnidadeOptions = async (q: string): Promise<AutoCompleteOption[]> => {
    const {data} = await api.get<Array<Record<string, unknown>>>('/api/view/unidade/listUnidade', {
        params: {q, limit: 20},
    });
    return (data ?? []).map((item) => {
        const label =
            (item.sucinto as string) ||
            (item.razaoSocial as string) ||
            (item.nomeFantasia as string) ||
            (item.nome as string) ||
            `#${String(item.id)}`;
        return {id: Number(item.id), label};
    });
};

const fetchUnidadeById = async (id: number): Promise<AutoCompleteOption | null> => {
    try {
        const {data} = await api.get<Record<string, unknown>>(`/api/view/unidade/listUnidade/${id}`);
        const label =
            (data.sucinto as string) ||
            (data.razaoSocial as string) ||
            (data.nomeFantasia as string) ||
            (data.nome as string) ||
            `#${String(data.id)}`;
        return {id: Number(data.id), label};
    } catch {
        return null;
    }
};

const fetchTipoContratoOptions = async (q: string): Promise<AutoCompleteOption[]> => {
    const {data} = await api.get<Array<Record<string, unknown>>>('/api/educacao/tipo-contrato', {
        params: {q},
    });
    return (data ?? []).map((item) => ({
        id: Number(item.id),
        label: (item.descricao as string) ?? `#${String(item.id)}`,
    }));
};

const fetchTipoContratoById = async (id: number): Promise<AutoCompleteOption | null> => {
    try {
        const {data} = await api.get<Record<string, unknown>>(`/api/educacao/tipo-contrato/${id}`);
        return {
            id: Number(data.id),
            label: (data.descricao as string) ?? `#${String(data.id)}`,
        };
    } catch {
        return null;
    }
};

interface DisponibilidadeRow {
    id?: number;
    unidadeId: number;
    unidadeOpt?: AutoCompleteOption | null;
    inicio: string;
    fim: string;
    tipoContratoId: number;
    tipoContratoOpt?: AutoCompleteOption | null;
    preAutorizado: boolean;
}

export default function ViewProfessorFormProfessorListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idParam = searchParams.get('id');

    const [professorId, setProfessorId] = useState<number | undefined>();
    const [isPessoaFisica, setIsPessoaFisica] = useState(true);
    const [pessoaOpt, setPessoaOpt] = useState<AutoCompleteOption | null>(null);
    const [ativo, setAtivo] = useState(true);
    const [cadernoBola, setCadernoBola] = useState(false);
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [disponibilidades, setDisponibilidades] = useState<DisponibilidadeRow[]>([]);
    const [componentes, setComponentes] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        if (!idParam) return;
        let ativoLoad = true;
        (async () => {
            try {
                const prof = (await api.get<Record<string, unknown>>(`/api/professor/professor/${idParam}`)).data;
                if (!ativoLoad) return;
                setProfessorId(prof.id as number);
                const pessoaId = prof.pessoaId as number | undefined;
                if (pessoaId) {
                    const pfTry = await fetchPessoaFisicaById(pessoaId).catch(() => null);
                    if (pfTry) {
                        setIsPessoaFisica(true);
                        setPessoaOpt(pfTry);
                    } else {
                        const pjTry = await fetchPessoaJuridicaById(pessoaId).catch(() => null);
                        if (pjTry) {
                            setIsPessoaFisica(false);
                            setPessoaOpt(pjTry);
                        } else {
                            setPessoaOpt({id: pessoaId, label: String(pessoaId)});
                        }
                    }
                }
                setAtivo(Boolean(prof.ativo ?? true));
                setCadernoBola(Boolean(prof.cadernoBola ?? false));
                setDataInicio(toDateInput(prof.dataInicio));
                setDataFim(toDateInput(prof.dataFim));
                const dispList = await api
                    .get<Array<Record<string, unknown>>>('/api/professor/disponibilidade-professor')
                    .then((r) =>
                        (r.data ?? []).filter((d: any) => d.professorId === (prof.id as number))
                    )
                    .catch(() => []);
                const dispRows: DisponibilidadeRow[] = await Promise.all(
                    (dispList ?? []).map(async (d: any) => {
                        const unidadeOpt = d.unidadeId ? await fetchUnidadeById(d.unidadeId).catch(() => null) : null;
                        const tipoOpt = d.tipoContratoId
                            ? await fetchTipoContratoById(d.tipoContratoId).catch(() => null)
                            : null;
                        return {
                            id: d.id,
                            unidadeId: d.unidadeId,
                            unidadeOpt,
                            inicio: timeToInput(d.inicio),
                            fim: timeToInput(d.fim),
                            tipoContratoId: d.tipoContratoId,
                            tipoContratoOpt: tipoOpt,
                            preAutorizado: Boolean(d.preAutorizado),
                        };
                    })
                );
                setDisponibilidades(dispRows);
            } catch (e) {
                console.error(e);
            }
        })();
        return () => {
            ativoLoad = false;
        };
    }, [idParam]);

    const tabs: FormTabConfig[] = [
        {
            key: 'informacoes',
            label: 'Informações',
            customContent: (
                <div className="form-grid">
                    <label className="form-field" style={{gridColumn: 'span 3'}}>
                        <span className="form-label">Tipo de Pessoa</span>
                        <div style={{display: 'flex', gap: '16px'}}>
                            <label style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                <input
                                    type="radio"
                                    name="tipoPessoa"
                                    checked={isPessoaFisica}
                                    onChange={() => {
                                        setIsPessoaFisica(true);
                                        setPessoaOpt(null);
                                    }}
                                />
                                Pessoa Física
                            </label>
                            <label style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                <input
                                    type="radio"
                                    name="tipoPessoa"
                                    checked={!isPessoaFisica}
                                    onChange={() => {
                                        setIsPessoaFisica(false);
                                        setPessoaOpt(null);
                                    }}
                                />
                                Pessoa Jurídica
                            </label>
                        </div>
                    </label>
                    <label className="form-field" style={{gridColumn: 'span 3'}}>
                        <span className="form-label">Pessoa *</span>
                        <AutoComplete
                            placeholder="Digite 3 letras..."
                            value={pessoaOpt}
                            onChange={setPessoaOpt}
                            fetchOptions={isPessoaFisica ? fetchPessoaFisicaOptions : fetchPessoaJuridicaOptions}
                            fetchById={isPessoaFisica ? fetchPessoaFisicaById : fetchPessoaJuridicaById}
                        />
                    </label>
                    <label className="form-field">
                        <span className="form-label">Ativo</span>
                        <div>
                            <button
                                type="button"
                                className={`boolean-field-toggle ${ativo ? 'boolean-field-toggle-on' : ''}`}
                                onClick={() => setAtivo((v) => !v)}
                                aria-pressed={ativo}
                            >
                                <span className="boolean-field-toggle-text">{ativo ? 'Sim' : 'Não'}</span>
                            </button>
                        </div>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Caderno de Chamada interativo</span>
                        <div>
                            <button
                                type="button"
                                className={`boolean-field-toggle ${cadernoBola ? 'boolean-field-toggle-on' : ''}`}
                                onClick={() => setCadernoBola((v) => !v)}
                                aria-pressed={cadernoBola}
                            >
                                <span className="boolean-field-toggle-text">{cadernoBola ? 'Sim' : 'Não'}</span>
                            </button>
                        </div>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Data Início *</span>
                        <input
                            className="form-input"
                            type="date"
                            value={dataInicio}
                            onChange={(e) => setDataInicio(e.target.value)}
                        />
                    </label>
                    <label className="form-field">
                        <span className="form-label">Data Fim</span>
                        <input
                            className="form-input"
                            type="date"
                            value={dataFim}
                            onChange={(e) => setDataFim(e.target.value)}
                        />
                    </label>
                </div>
            ),
        },
        {
            key: 'disponibilidade',
            label: 'Disponibilidade',
            customContent: (
                <div>
                    <div style={{marginBottom: '12px'}}>
                        <button
                            type="button"
                            className="btnblue"
                            onClick={() =>
                                setDisponibilidades((prev) => [
                                    ...prev,
                                    {
                                        unidadeId: 0,
                                        unidadeOpt: null,
                                        inicio: '',
                                        fim: '',
                                        tipoContratoId: 0,
                                        tipoContratoOpt: null,
                                        preAutorizado: false,
                                    },
                                ])
                            }
                        >
                            Adicionar Linha
                        </button>
                    </div>
                    <table className="data-table" style={{width: '100%'}}>
                        <thead>
                            <tr>
                                <th>Unidade *</th>
                                <th>Início (HH:mm) *</th>
                                <th>Fim (HH:mm) *</th>
                                <th>Tipo Contrato *</th>
                                <th>Pré-Autorizado</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {disponibilidades.map((d, idx) => (
                                <tr key={idx}>
                                    <td style={{minWidth: '260px'}}>
                                        <AutoComplete
                                            placeholder="Digite para buscar..."
                                            value={d.unidadeOpt}
                                            onChange={(opt) =>
                                                setDisponibilidades((prev) => {
                                                    const copy = [...prev];
                                                    copy[idx] = {
                                                        ...copy[idx],
                                                        unidadeOpt: opt,
                                                        unidadeId: opt?.id ?? 0,
                                                    };
                                                    return copy;
                                                })
                                            }
                                            fetchOptions={fetchUnidadeOptions}
                                            fetchById={fetchUnidadeById}
                                            minChars={2}
                                        />
                                    </td>
                                    <td style={{width: '140px'}}>
                                        <input
                                            className="form-input"
                                            type="time"
                                            value={d.inicio}
                                            onChange={(e) =>
                                                setDisponibilidades((prev) => {
                                                    const copy = [...prev];
                                                    copy[idx] = {...copy[idx], inicio: e.target.value};
                                                    return copy;
                                                })
                                            }
                                        />
                                    </td>
                                    <td style={{width: '140px'}}>
                                        <input
                                            className="form-input"
                                            type="time"
                                            value={d.fim}
                                            onChange={(e) =>
                                                setDisponibilidades((prev) => {
                                                    const copy = [...prev];
                                                    copy[idx] = {...copy[idx], fim: e.target.value};
                                                    return copy;
                                                })
                                            }
                                        />
                                    </td>
                                    <td style={{minWidth: '240px'}}>
                                        <AutoComplete
                                            placeholder="Digite 3 letras..."
                                            value={d.tipoContratoOpt}
                                            onChange={(opt) =>
                                                setDisponibilidades((prev) => {
                                                    const copy = [...prev];
                                                    copy[idx] = {
                                                        ...copy[idx],
                                                        tipoContratoOpt: opt,
                                                        tipoContratoId: opt?.id ?? 0,
                                                    };
                                                    return copy;
                                                })
                                            }
                                            fetchOptions={fetchTipoContratoOptions}
                                            fetchById={fetchTipoContratoById}
                                        />
                                    </td>
                                    <td style={{textAlign: 'center', width: '140px'}}>
                                        <button
                                            type="button"
                                            className={`boolean-field-toggle ${d.preAutorizado ? 'boolean-field-toggle-on' : ''}`}
                                            onClick={() =>
                                                setDisponibilidades((prev) => {
                                                    const copy = [...prev];
                                                    copy[idx] = {...copy[idx], preAutorizado: !copy[idx].preAutorizado};
                                                    return copy;
                                                })
                                            }
                                        >
                                            <span className="boolean-field-toggle-text">
                                                {d.preAutorizado ? 'Sim' : 'Não'}
                                            </span>
                                        </button>
                                    </td>
                                    <td style={{width: '80px', textAlign: 'center'}}>
                                        <button
                                            type="button"
                                            className="btn-danger"
                                            style={{background: '#e53935', borderColor: '#e53935', color: '#fff'}}
                                            onClick={() =>
                                                setDisponibilidades((prev) => prev.filter((_, i) => i !== idx))
                                            }
                                        >
                                            Remover
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {disponibilidades.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{textAlign: 'center', padding: '16px'}}>
                                        Nenhuma disponibilidade cadastrada.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            ),
        },
        {
            key: 'componenteCurricular',
            label: 'Componente Curricular',
            customContent: (
                <MasterDetail
                    label="Componente Curricular"
                    source={COMPONENTE_SOURCE}
                    valueKey="id"
                    searchKeys={COMPONENTE_SEARCH}
                    columns={COMPONENTE_COLUMNS_PROF}
                    items={componentes}
                    onChange={setComponentes}
                />
            ),
        },
    ];

    const voltar = () => navigate('/view/professor/listProfessor');

    const salvar = async () => {
        if (!pessoaOpt) {
            setError('Selecione a Pessoa.');
            return;
        }
        if (!dataInicio) {
            setError('Informe a Data Início.');
            return;
        }
        for (const [i, d] of disponibilidades.entries()) {
            if (!d.unidadeId || !d.inicio || !d.fim || !d.tipoContratoId) {
                setError(`Disponibilidade linha ${i + 1}: preencha Unidade, Início, Fim e Tipo Contrato.`);
                return;
            }
        }
        setSaving(true);
        setError(undefined);
        try {
            const profBody = {
                pessoaId: pessoaOpt.id,
                ativo,
                cadernoBola,
                dataInicio: fromDateInput(dataInicio),
                dataFim: fromDateInput(dataFim),
            };
            let pid = professorId;
            if (professorId) {
                await api.put(`/api/professor/professor/${professorId}`, profBody);
            } else {
                const resp = await api.post('/api/professor/professor', profBody);
                pid = (resp.data as any)?.id ?? undefined;
                setProfessorId(pid);
            }
            if (pid) {
                const existentes = await api
                    .get<Array<Record<string, unknown>>>('/api/professor/disponibilidade-professor')
                    .then((r) => (r.data ?? []).filter((d: any) => d.professorId === pid));
                for (const ex of existentes) {
                    try {
                        await api.delete(`/api/professor/disponibilidade-professor/${ex.id}`);
                    } catch {}
                }
                for (const d of disponibilidades) {
                    const dispBody = {
                        professorId: pid,
                        unidadeId: d.unidadeId,
                        tipoContratoId: d.tipoContratoId,
                        inicio: inputToTime(d.inicio),
                        fim: inputToTime(d.fim),
                        preAutorizado: d.preAutorizado,
                    };
                    await api.post('/api/professor/disponibilidade-professor', dispBody);
                }
            }
            navigate('/view/professor/listProfessor');
        } catch (e) {
            console.error(e);
            setError('Erro ao salvar Professor.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <FormLayout
                    title="Formulário do Professor"
                    tabs={tabs}
                    initialValues={{}}
                    onSubmit={salvar}
                    onCancel={voltar}
                    submitLabel="Salvar"
                    cancelLabel="Voltar"
                    saving={saving}
                    error={error}
                />
            </main>
        </PermissionGate>
    );
}