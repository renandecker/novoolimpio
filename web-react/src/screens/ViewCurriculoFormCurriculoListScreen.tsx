import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../permissions';
import {BooleanField} from '../BooleanField';
import {MasterDetail} from '../MasterDetail';
import {useWizardData} from '../Wizard';
import {Tabs, type TabItem} from '../Tabs';
import {
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
    COMPONENTE_SOURCE,
    COMPONENTE_COLUMNS,
    COMPONENTE_SEARCH,
} from '../masterDetailSources';
import type {ApiItem} from '../types';
import {api, useApi} from '../api';

interface MaterialEscolarItem {
    key: string;
    id?: number;
    produtoId?: number;
    produtoDescricao?: string;
    quantidade?: number;
    valorUnitario?: number;
    obrigatorio?: boolean;
}

interface RequisitoItem {
    key: string;
    id?: number;
    descricao?: string;
    componenteCurricularId?: number;
    tipoRequisito?: string;
    cargaHorariaMinima?: number;
    mediaMinima?: number;
}

interface CurriculoData {
    entity: {
        id?: number;
        cursoId?: number;
        sucinto?: string;
        tipoCursoId?: number;
        descricao?: string;
        grauId?: number;
        descricaoDiploma?: string;
        sigla?: string;
        numeroParecer?: string;
        dataCancelamento?: string;
        possuiRematricula?: boolean;
        escolaridadeId?: number;
        licenca?: string;
        reconhecimento?: string;
        qtdMaximaAlunos?: number;
        idadeMinima?: number;
        idadeMaxima?: number;
        qtdeIniciando?: number;
        qtdeFinalizando?: number;
        tipoModeloContrato?: number;
        tipoModeloPromissoria?: number;
        tipoModeloCertificado?: number;
        tipoModeloBoletim?: number;
        templateContrato?: string;
        templateCertificado?: string;
        templateBoletim?: string;
        templatePromissoria?: string;
    };
    matrizCurricular: ApiItem[];
    requisitos: RequisitoItem[];
    unidades: ApiItem[];
    materialEscolar: MaterialEscolarItem[];
}

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
const num = (v: string): number | null => (v !== '' && !isNaN(Number(v)) ? Number(v) : null);

const toDateInput = (v: unknown): string => {
    if (!v) return '';
    const d = new Date(v as string);
    if (isNaN(d.getTime())) return String(v).slice(0, 10);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
};

const semId = (obj: Record<string, unknown> | null): Record<string, unknown> => {
    const copia = {...(obj ?? {})};
    delete copia.id;
    return copia;
};

const TIPOS_CURSO = [
    {id: 1, descricao: 'Técnico'},
    {id: 2, descricao: 'Superior'},
    {id: 3, descricao: 'Livre'},
    {id: 4, descricao: 'Profissionalizante'},
];

const GRAUS = [
    {id: 1, descricao: 'Fundamental'},
    {id: 2, descricao: 'Médio'},
    {id: 3, descricao: 'Superior de Graduação'},
    {id: 4, descricao: 'Pós-Graduação'},
];

const ESCOLARIDADES = [
    {id: 1, descricao: 'Ensino Fundamental Incompleto'},
    {id: 2, descricao: 'Ensino Fundamental Completo'},
    {id: 3, descricao: 'Ensino Médio Incompleto'},
    {id: 4, descricao: 'Ensino Médio Completo'},
    {id: 5, descricao: 'Superior Incompleto'},
    {id: 6, descricao: 'Superior Completo'},
    {id: 7, descricao: 'Pós-Graduação'},
];

export default function ViewCurriculoFormCurriculoListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idEdicao = searchParams.get('id');

    const [carregando, setCarregando] = useState(!!idEdicao);
    const [cursos, setCursos] = useState<ApiItem[]>([]);
    const [novoMaterialProduto, setNovoMaterialProduto] = useState('');
    const [novoMaterialQuantidade, setNovoMaterialQuantidade] = useState<number | ''>('');
    const [novoMaterialValor, setNovoMaterialValor] = useState<number | ''>('');
    const [novoMaterialObrigatorio, setNovoMaterialObrigatorio] = useState(true);
    const [novoRequisitoDescricao, setNovoRequisitoDescricao] = useState('');
    const [novoRequisitoComponenteId, setNovoRequisitoComponenteId] = useState<number | ''>('');
    const [novoRequisitoTipo, setNovoRequisitoTipo] = useState('PRÉ-REQUISITO');
    const [novoRequisitoCarga, setNovoRequisitoCarga] = useState<number | ''>('');
    const [novoRequisitoMedia, setNovoRequisitoMedia] = useState<number | ''>('');
    const [salvando, setSalvando] = useState(false);

    const [matriz, setMatriz] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [materialEscolar, setMaterialEscolar] = useState<MaterialEscolarItem[]>([]);
    const [requisitos, setRequisitos] = useState<RequisitoItem[]>([]);

    const {data, updateField, updateFields} = useWizardData<CurriculoData>({
        entity: {},
        matrizCurricular: [],
        requisitos: [],
        unidades: [],
        materialEscolar: [],
    });

    const dataRef = useRef(data);
    useEffect(() => { dataRef.current = data; }, [data]);

    const curriculoApi = useApi<any>('/api/educacao/curriculo');

    useEffect(() => {
        (async () => {
            try {
                const todosCursos = await api.get<ApiItem[]>('/api/educacao/curso').then(r => r.data).catch(() => []);
                setCursos(todosCursos ?? []);

                if (idEdicao) {
                    try {
                        const ent = (await api.get(`/api/educacao/curriculo/${idEdicao}`)).data;
                        updateFields({
                            entity: {
                                ...ent,
                                dataCancelamento: ent.dataCancelamento ? toDateInput(ent.dataCancelamento) : '',
                            },
                        });

                        try {
                            const {data: mat} = await api.get<any[]>('/api/educacao/matriz-curricular', {params: {curriculoId: idEdicao}});
                            setMatriz(Array.isArray(mat) ? mat : []);
                        } catch { setMatriz([]); }

                        try {
                            const {data: uns} = await api.get<any[]>('/api/educacao/curriculo-unidade', {params: {curriculoId: idEdicao}});
                            setUnidades(Array.isArray(uns) ? uns : []);
                        } catch { setUnidades([]); }

                        try {
                            const {data: mats} = await api.get<any[]>('/api/educacao/material-escolar-curso', {params: {curriculoId: idEdicao}});
                            setMaterialEscolar((mats ?? []).map((m: any, i: number) => ({
                                key: `mat-db-${m.id ?? i}`,
                                id: m.id,
                                produtoId: m.produtoId,
                                produtoDescricao: m.produtoDescricao ?? m.produto_descricao ?? m.descricao,
                                quantidade: m.quantidade,
                                valorUnitario: m.valorUnitario ?? m.valor_unitario,
                                obrigatorio: m.obrigatorio !== false,
                            })));
                        } catch { setMaterialEscolar([]); }

                        try {
                            const {data: reqs} = await api.get<any[]>('/api/educacao/requisito-matriz', {params: {curriculoId: idEdicao}});
                            setRequisitos((reqs ?? []).map((r: any, i: number) => ({
                                key: `req-db-${r.id ?? i}`,
                                id: r.id,
                                descricao: r.nome ?? r.descricao,
                                componenteCurricularId: r.componenteCurricularId ?? r.componente_curricular_id,
                                tipoRequisito: r.tipoRequisito ?? r.tipo_requisito ?? 'PRÉ-REQUISITO',
                                cargaHorariaMinima: r.cargaHorariaMinima ?? r.carga_horaria_minima,
                                mediaMinima: r.mediaMinima ?? r.media_minima,
                            })));
                        } catch { setRequisitos([]); }
                    } catch (erro) {
                        console.error('Erro ao carregar currículo:', erro);
                        alert('Não foi possível carregar o currículo para edição');
                    }
                }
            } finally {
                setCarregando(false);
            }
        })();
    }, [idEdicao, updateFields]);

    const validateStep1 = useCallback(async (currentData: CurriculoData) => {
        if (!currentData.entity.descricao || currentData.entity.descricao.trim().length < 3) {
            return 'Descrição deve ter pelo menos 3 caracteres';
        }
        if (!currentData.entity.sucinto || currentData.entity.sucinto.trim().length < 1) {
            return 'Informe o sucinto do currículo';
        }
        if (currentData.entity.idadeMaxima && currentData.entity.idadeMinima &&
            currentData.entity.idadeMaxima < currentData.entity.idadeMinima) {
            return 'A idade mínima não pode ser maior que a idade máxima';
        }
        if (currentData.entity.qtdMaximaAlunos !== undefined && currentData.entity.qtdMaximaAlunos < 0) {
            return 'A quantidade máxima de alunos não pode ser negativa';
        }
        return true;
    }, []);

    const validateStep3 = useCallback(async (currentData: CurriculoData) => {
        if (!currentData.matrizCurricular || currentData.matrizCurricular.length === 0) {
            return 'Adicione pelo menos um componente curricular à matriz';
        }
        return true;
    }, []);

    const validateStep5 = useCallback(async (currentData: CurriculoData) => {
        if (!currentData.unidades || currentData.unidades.length === 0) {
            return 'Selecione pelo menos uma unidade para o currículo';
        }
        return true;
    }, []);

    const adicionarMaterial = useCallback(() => {
        if (!novoMaterialProduto.trim()) { alert('Informe o produto/material'); return; }
        if (!novoMaterialQuantidade || Number(novoMaterialQuantidade) <= 0) { alert('Informe a quantidade'); return; }
        setMaterialEscolar((prev) => [
            ...prev,
            {
                key: `mat-${Date.now()}-${prev.length}`,
                produtoDescricao: novoMaterialProduto.trim(),
                quantidade: Number(novoMaterialQuantidade),
                valorUnitario: novoMaterialValor === '' ? undefined : Number(novoMaterialValor),
                obrigatorio: novoMaterialObrigatorio,
            },
        ]);
        setNovoMaterialProduto('');
        setNovoMaterialQuantidade('');
        setNovoMaterialValor('');
        setNovoMaterialObrigatorio(true);
    }, [novoMaterialProduto, novoMaterialQuantidade, novoMaterialValor, novoMaterialObrigatorio]);

    const removerMaterial = useCallback((key: string) => {
        setMaterialEscolar((prev) => prev.filter((m) => m.key !== key));
    }, []);

    const adicionarRequisito = useCallback(() => {
        if (!novoRequisitoDescricao.trim()) { alert('Informe a descrição do requisito'); return; }
        setRequisitos((prev) => [
            ...prev,
            {
                key: `req-${Date.now()}-${prev.length}`,
                descricao: novoRequisitoDescricao.trim(),
                componenteCurricularId: novoRequisitoComponenteId === '' ? undefined : Number(novoRequisitoComponenteId),
                tipoRequisito: novoRequisitoTipo,
                cargaHorariaMinima: novoRequisitoCarga === '' ? undefined : Number(novoRequisitoCarga),
                mediaMinima: novoRequisitoMedia === '' ? undefined : Number(novoRequisitoMedia),
            },
        ]);
        setNovoRequisitoDescricao('');
        setNovoRequisitoComponenteId('');
        setNovoRequisitoTipo('PRÉ-REQUISITO');
        setNovoRequisitoCarga('');
        setNovoRequisitoMedia('');
    }, [novoRequisitoDescricao, novoRequisitoComponenteId, novoRequisitoTipo, novoRequisitoCarga, novoRequisitoMedia]);

    const removerRequisito = useCallback((key: string) => {
        setRequisitos((prev) => prev.filter((r) => r.key !== key));
    }, []);

    const handleComplete = useCallback(async (formData: CurriculoData) => {
        setSalvando(true);
        try {
            const payload: Record<string, unknown> = {
                ...semId(formData.entity as unknown as Record<string, unknown>),
                dataCancelamento: formData.entity.dataCancelamento || null,
                possuiRematricula: formData.entity.possuiRematricula ?? false,
            };
            const salvo = idEdicao
                ? await curriculoApi.put(idEdicao, payload)
                : await curriculoApi.post(payload);
            const id = (salvo as any)?.id ?? idEdicao;
            if (!id) { alert('Currículo salvo, mas o identificador não foi retornado.'); return; }

            try {
                const {data: atuaisMatriz} = await api.get<any[]>('/api/educacao/matriz-curricular', {params: {curriculoId: id}});
                for (const a of atuaisMatriz ?? []) {
                    if (!formData.matrizCurricular.some((m) => Number(m.id) === Number(a.componenteCurricularId ?? a.id))) {
                        await api.delete(`/api/educacao/matriz-curricular/${a.id}`).catch(() => undefined);
                    }
                }
                for (const item of formData.matrizCurricular) {
                    await api.post('/api/educacao/matriz-curricular', {
                        curriculoId: id,
                        componenteCurricularId: item.id,
                    });
                }
            } catch (e) { console.warn('Falha ao sincronizar matriz curricular:', e); }

            try {
                const {data: atuaisUnidades} = await api.get<any[]>('/api/educacao/curriculo-unidade', {params: {curriculoId: id}});
                for (const a of atuaisUnidades ?? []) {
                    if (!formData.unidades.some((u) => Number(u.id) === Number(a.unidadeId ?? a.id))) {
                        // A tabela usa chave composta: remove por curriculoId + unidadeId.
                        await api.delete('/api/educacao/curriculo-unidade', {params: {curriculoId: id, unidadeId: a.unidadeId}}).catch(() => undefined);
                    }
                }
                for (const item of formData.unidades) {
                    await api.post('/api/educacao/curriculo-unidade', {curriculoId: id, unidadeId: item.id});
                }
            } catch (e) { console.warn('Falha ao sincronizar unidades:', e); }

            try {
                for (const item of materialEscolar) {
                    const body: Record<string, unknown> = {
                        curriculoId: id,
                        descricao: item.produtoDescricao,
                        quantidade: item.quantidade,
                        valorUnitario: item.valorUnitario,
                        obrigatorio: item.obrigatorio,
                    };
                    if (item.produtoId) body.produtoId = item.produtoId;
                    if (item.id) {
                        await api.put(`/api/educacao/material-escolar-curso/${item.id}`, body);
                    } else {
                        await api.post('/api/educacao/material-escolar-curso', body);
                    }
                }
            } catch (e) { console.warn('Falha ao salvar material escolar:', e); }

            try {
                for (const item of requisitos) {
                    const body: Record<string, unknown> = {
                        curriculoId: id,
                        descricao: item.descricao,
                        nome: item.descricao,
                        tipoRequisito: item.tipoRequisito,
                        cargaHorariaMinima: item.cargaHorariaMinima,
                        mediaMinima: item.mediaMinima,
                    };
                    if (item.componenteCurricularId) body.componenteCurricularId = item.componenteCurricularId;
                    if (item.id) {
                        await api.put(`/api/educacao/requisito-matriz/${item.id}`, body);
                    } else {
                        await api.post('/api/educacao/requisito-matriz', body);
                    }
                }
            } catch (e) { console.warn('Falha ao salvar requisitos:', e); }

            alert('Currículo salvo com sucesso!');
            navigate('/view/curriculo/listCurriculo');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar currículo');
        } finally {
            setSalvando(false);
        }
    }, [curriculoApi, idEdicao, materialEscolar, requisitos, navigate]);

    const voltar = useCallback(() => navigate('/view/curriculo/listCurriculo'), [navigate]);

    const tabs: TabItem[] = useMemo(() => [
        {
            key: 'curso',
            label: 'Curso',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">ID</span>
                        <input className="form-input" value={data.entity.id ?? ''} disabled/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Descrição *</span>
                        <input className="form-input" value={data.entity.descricao ?? ''}
                               onChange={(e) => updateField('entity', {...data.entity, descricao: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Sucinto *</span>
                        <input className="form-input" value={data.entity.sucinto ?? ''}
                               onChange={(e) => updateField('entity', {...data.entity, sucinto: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Sigla</span>
                        <input className="form-input" value={data.entity.sigla ?? ''}
                               onChange={(e) => updateField('entity', {...data.entity, sigla: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Curso (vinculado)</span>
                        <select className="form-input form-select"
                                value={data.entity.cursoId ?? ''}
                                onChange={(e) => updateField('entity', {
                                    ...data.entity,
                                    cursoId: e.target.value ? Number(e.target.value) : undefined,
                                })}>
                            <option value="">Selecione</option>
                            {cursos.map((c) => (
                                <option key={String(c.id)} value={String(c.id)}>
                                    {String((c as any).descricao ?? (c as any).nome ?? `Curso #${c.id}`)}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Tipo Curso *</span>
                        <select className="form-input form-select"
                                value={data.entity.tipoCursoId ?? ''}
                                onChange={(e) => updateField('entity', {
                                    ...data.entity,
                                    tipoCursoId: e.target.value ? Number(e.target.value) : undefined,
                                })}>
                            <option value="">Selecione</option>
                            {TIPOS_CURSO.map((t) => (
                                <option key={t.id} value={t.id}>{t.descricao}</option>
                            ))}
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Grau de Escolaridade *</span>
                        <select className="form-input form-select"
                                value={data.entity.grauId ?? ''}
                                onChange={(e) => updateField('entity', {
                                    ...data.entity,
                                    grauId: e.target.value ? Number(e.target.value) : undefined,
                                })}>
                            <option value="">Selecione</option>
                            {GRAUS.map((g) => (
                                <option key={g.id} value={g.id}>{g.descricao}</option>
                            ))}
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Carga Horária</span>
                        <input className="form-input" type="number" min={0}
                               value={data.entity.qtdeIniciando === undefined ? '' : data.entity.qtdeIniciando}
                               onChange={(e) => updateField('entity', {
                                   ...data.entity,
                                   qtdeIniciando: e.target.value === '' ? 0 : Number(e.target.value),
                               })}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Qtd. Máxima Alunos</span>
                        <input className="form-input" type="number" min={0}
                               value={data.entity.qtdMaximaAlunos ?? ''}
                               onChange={(e) => updateField('entity', {
                                   ...data.entity,
                                   qtdMaximaAlunos: e.target.value === '' ? 0 : Number(e.target.value),
                               })}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Idade Mínima</span>
                        <input className="form-input" type="number" min={0}
                               value={data.entity.idadeMinima ?? ''}
                               onChange={(e) => updateField('entity', {
                                   ...data.entity,
                                   idadeMinima: e.target.value === '' ? undefined : Number(e.target.value),
                               })}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Idade Máxima</span>
                        <input className="form-input" type="number" min={0}
                               value={data.entity.idadeMaxima ?? ''}
                               onChange={(e) => updateField('entity', {
                                   ...data.entity,
                                   idadeMaxima: e.target.value === '' ? undefined : Number(e.target.value),
                               })}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Data Cancelamento</span>
                        <input className="form-input" type="date"
                               value={data.entity.dataCancelamento ?? ''}
                               onChange={(e) => updateField('entity', {...data.entity, dataCancelamento: e.target.value})}/>
                    </label>
                    <div className="form-field">
                        <span className="form-label">Possui Rematrícula</span>
                        <BooleanField value={!!data.entity.possuiRematricula}
                                      onChange={(v) => updateField('entity', {...data.entity, possuiRematricula: v})}/>
                    </div>
                </div>
            ),
        },
        {
            key: 'licenca',
            label: 'Licença',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">Número do Parecer</span>
                        <input className="form-input" value={data.entity.numeroParecer ?? ''}
                               onChange={(e) => updateField('entity', {...data.entity, numeroParecer: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Licença</span>
                        <input className="form-input" value={data.entity.licenca ?? ''}
                               onChange={(e) => updateField('entity', {...data.entity, licenca: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Reconhecimento</span>
                        <input className="form-input" value={data.entity.reconhecimento ?? ''}
                               onChange={(e) => updateField('entity', {...data.entity, reconhecimento: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Descrição Diploma</span>
                        <input className="form-input" style={{gridColumn: 'span 3'}}
                               value={data.entity.descricaoDiploma ?? ''}
                               onChange={(e) => updateField('entity', {...data.entity, descricaoDiploma: e.target.value})}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Escolaridade Mínima</span>
                        <select className="form-input form-select"
                                value={data.entity.escolaridadeId ?? ''}
                                onChange={(e) => updateField('entity', {
                                    ...data.entity,
                                    escolaridadeId: e.target.value ? Number(e.target.value) : undefined,
                                })}>
                            <option value="">Selecione</option>
                            {ESCOLARIDADES.map((e2) => (
                                <option key={e2.id} value={e2.id}>{e2.descricao}</option>
                            ))}
                        </select>
                    </label>
                </div>
            ),
        },
        {
            key: 'matriz',
            label: 'Matriz Curricular',
            content: (
                <fieldset className="form-fieldset">
                    <legend>Componentes da Matriz Curricular</legend>
                    <MasterDetail
                        label="Componente Curricular"
                        source={COMPONENTE_SOURCE}
                        valueKey="id"
                        searchKeys={COMPONENTE_SEARCH}
                        columns={COMPONENTE_COLUMNS}
                        items={matriz}
                        onChange={(novos) => {
                            setMatriz(novos);
                            updateField('matrizCurricular', novos);
                        }}
                    />
                </fieldset>
            ),
        },
        {
            key: 'requisitos',
            label: 'Requisitos',
            content: (
                <fieldset className="form-fieldset">
                    <legend>Requisitos da Matriz</legend>
                    <div className="form-grid">
                        <label className="form-field" style={{gridColumn: 'span 2'}}>
                            <span className="form-label">Descrição *</span>
                            <input className="form-input" value={novoRequisitoDescricao}
                                   onChange={(e) => setNovoRequisitoDescricao(e.target.value)}/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Tipo</span>
                            <select className="form-input form-select" value={novoRequisitoTipo}
                                    onChange={(e) => setNovoRequisitoTipo(e.target.value)}>
                                <option value="PRÉ-REQUISITO">Pré-Requisito</option>
                                <option value="CO-REQUISITO">Co-Requisito</option>
                                <option value="EQUIVALENTE">Equivalente</option>
                            </select>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Componente</span>
                            <select className="form-input form-select"
                                    value={novoRequisitoComponenteId === '' ? '' : String(novoRequisitoComponenteId)}
                                    onChange={(e) => setNovoRequisitoComponenteId(
                                        e.target.value ? Number(e.target.value) : '',
                                    )}>
                                <option value="">Selecione</option>
                                {matriz.map((m) => (
                                    <option key={String(m.id)} value={String(m.id)}>
                                        {String((m as any).descricao ?? (m as any).sucinto ?? `Componente #${m.id}`)}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Carga Horária Mínima</span>
                            <input className="form-input" type="number" min={0}
                                   value={novoRequisitoCarga}
                                   onChange={(e) => setNovoRequisitoCarga(
                                       e.target.value === '' ? '' : Number(e.target.value),
                                   )}/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Média Mínima</span>
                            <input className="form-input" type="number" min={0} step={0.1}
                                   value={novoRequisitoMedia}
                                   onChange={(e) => setNovoRequisitoMedia(
                                       e.target.value === '' ? '' : Number(e.target.value),
                                   )}/>
                        </label>
                    </div>
                    <div className="form-buttons" style={{borderTop: 'none', marginTop: 8}}>
                        <button type="button" className="btnblue" onClick={adicionarRequisito}>
                            Adicionar Requisito
                        </button>
                    </div>
                    {requisitos.length > 0 ? (
                        <table className="data-table" style={{marginTop: 14, width: '100%'}}>
                            <thead>
                            <tr>
                                <th>Descrição</th>
                                <th>Tipo</th>
                                <th>Componente</th>
                                <th>C.H. Mín.</th>
                                <th>Média Mín.</th>
                                <th style={{width: 50}}></th>
                            </tr>
                            </thead>
                            <tbody>
                            {requisitos.map((r) => {
                                const comp = matriz.find((m) => Number(m.id) === Number(r.componenteCurricularId));
                                return (
                                    <tr key={r.key}>
                                        <td>{r.descricao}</td>
                                        <td>{r.tipoRequisito}</td>
                                        <td>{(comp as any)?.descricao ?? (comp as any)?.sucinto ?? '-'}</td>
                                        <td>{r.cargaHorariaMinima ?? '-'}</td>
                                        <td>{r.mediaMinima ?? '-'}</td>
                                        <td>
                                            <button type="button" className="btn-action btnred" title="Remover"
                                                    onClick={() => removerRequisito(r.key)}>✕
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    ) : (
                        <p className="master-detail-empty">Nenhum requisito adicionado.</p>
                    )}
                </fieldset>
            ),
        },
        {
            key: 'unidades',
            label: 'Unidades',
            content: (
                <fieldset className="form-fieldset">
                    <legend>Unidades que oferecem o curso</legend>
                    <MasterDetail
                        label="Unidade"
                        source={UNIDADE_SOURCE}
                        valueKey="id"
                        searchKeys={UNIDADE_SEARCH}
                        columns={UNIDADE_COLUMNS}
                        items={unidades}
                        onChange={(novos) => {
                            setUnidades(novos);
                            updateField('unidades', novos);
                        }}
                    />
                </fieldset>
            ),
        },
        {
            key: 'material',
            label: 'Material Escolar',
            content: (
                <fieldset className="form-fieldset">
                    <legend>Material Escolar do Curso</legend>
                    <div className="form-grid">
                        <label className="form-field" style={{gridColumn: 'span 2'}}>
                            <span className="form-label">Produto / Material *</span>
                            <input className="form-input" value={novoMaterialProduto}
                                   onChange={(e) => setNovoMaterialProduto(e.target.value)}/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Quantidade *</span>
                            <input className="form-input" type="number" min={1}
                                   value={novoMaterialQuantidade}
                                   onChange={(e) => setNovoMaterialQuantidade(
                                       e.target.value === '' ? '' : Number(e.target.value),
                                   )}/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Valor Unitário</span>
                            <input className="form-input" type="number" min={0} step={0.01}
                                   value={novoMaterialValor}
                                   onChange={(e) => setNovoMaterialValor(
                                       e.target.value === '' ? '' : Number(e.target.value),
                                   )}/>
                        </label>
                        <div className="form-field">
                            <span className="form-label">Obrigatório</span>
                            <BooleanField value={novoMaterialObrigatorio} onChange={setNovoMaterialObrigatorio}/>
                        </div>
                    </div>
                    <div className="form-buttons" style={{borderTop: 'none', marginTop: 8}}>
                        <button type="button" className="btnblue" onClick={adicionarMaterial}>
                            Adicionar Material
                        </button>
                    </div>
                    {materialEscolar.length > 0 ? (
                        <table className="data-table" style={{marginTop: 14, width: '100%'}}>
                            <thead>
                            <tr>
                                <th>Material</th>
                                <th>Quantidade</th>
                                <th>Valor Unitário</th>
                                <th>Obrigatório</th>
                                <th style={{width: 50}}></th>
                            </tr>
                            </thead>
                            <tbody>
                            {materialEscolar.map((m) => (
                                <tr key={m.key}>
                                    <td>{m.produtoDescricao ?? '-'}</td>
                                    <td>{m.quantidade ?? '-'}</td>
                                    <td>{m.valorUnitario !== undefined ? m.valorUnitario.toFixed(2) : '-'}</td>
                                    <td>{m.obrigatorio ? 'Sim' : 'Não'}</td>
                                    <td>
                                        <button type="button" className="btn-action btnred" title="Remover"
                                                onClick={() => removerMaterial(m.key)}>✕
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="master-detail-empty">Nenhum material adicionado.</p>
                    )}
                </fieldset>
            ),
        },
        {
            key: 'documentos',
            label: 'Documentos',
            content: (
                <fieldset className="form-fieldset">
                    <legend>Modelos de Documentos</legend>
                    <div className="form-grid">
                        <label className="form-field">
                            <span className="form-label">Tipo Modelo Contrato</span>
                            <input className="form-input" type="number" min={0}
                                   value={data.entity.tipoModeloContrato ?? ''}
                                   onChange={(e) => updateField('entity', {
                                       ...data.entity,
                                       tipoModeloContrato: e.target.value === '' ? 0 : Number(e.target.value),
                                   })}/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Tipo Modelo Promissória</span>
                            <input className="form-input" type="number" min={0}
                                   value={data.entity.tipoModeloPromissoria ?? ''}
                                   onChange={(e) => updateField('entity', {
                                       ...data.entity,
                                       tipoModeloPromissoria: e.target.value === '' ? 0 : Number(e.target.value),
                                   })}/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Tipo Modelo Certificado</span>
                            <input className="form-input" type="number" min={0}
                                   value={data.entity.tipoModeloCertificado ?? ''}
                                   onChange={(e) => updateField('entity', {
                                       ...data.entity,
                                       tipoModeloCertificado: e.target.value === '' ? 0 : Number(e.target.value),
                                   })}/>
                        </label>
                        <label className="form-field">
                            <span className="form-label">Tipo Modelo Boletim</span>
                            <input className="form-input" type="number" min={0}
                                   value={data.entity.tipoModeloBoletim ?? ''}
                                   onChange={(e) => updateField('entity', {
                                       ...data.entity,
                                       tipoModeloBoletim: e.target.value === '' ? 0 : Number(e.target.value),
                                   })}/>
                        </label>
                        <label className="form-field" style={{gridColumn: 'span 4'}}>
                            <span className="form-label">Template Contrato</span>
                            <textarea className="form-input" rows={4}
                                      style={{minHeight: 80}}
                                      value={data.entity.templateContrato ?? ''}
                                      onChange={(e) => updateField('entity', {...data.entity, templateContrato: e.target.value})}/>
                        </label>
                        <label className="form-field" style={{gridColumn: 'span 4'}}>
                            <span className="form-label">Template Certificado</span>
                            <textarea className="form-input" rows={4}
                                      style={{minHeight: 80}}
                                      value={data.entity.templateCertificado ?? ''}
                                      onChange={(e) => updateField('entity', {...data.entity, templateCertificado: e.target.value})}/>
                        </label>
                        <label className="form-field" style={{gridColumn: 'span 4'}}>
                            <span className="form-label">Template Boletim</span>
                            <textarea className="form-input" rows={4}
                                      style={{minHeight: 80}}
                                      value={data.entity.templateBoletim ?? ''}
                                      onChange={(e) => updateField('entity', {...data.entity, templateBoletim: e.target.value})}/>
                        </label>
                        <label className="form-field" style={{gridColumn: 'span 4'}}>
                            <span className="form-label">Template Promissória</span>
                            <textarea className="form-input" rows={4}
                                      style={{minHeight: 80}}
                                      value={data.entity.templatePromissoria ?? ''}
                                      onChange={(e) => updateField('entity', {...data.entity, templatePromissoria: e.target.value})}/>
                        </label>
                    </div>
                </fieldset>
            ),
        },
    ], [data, matriz, unidades, materialEscolar, requisitos, cursos, novoMaterialProduto, novoMaterialQuantidade, novoMaterialValor, novoMaterialObrigatorio, novoRequisitoDescricao, novoRequisitoComponenteId, novoRequisitoTipo, novoRequisitoCarga, novoRequisitoMedia, adicionarMaterial, removerMaterial, adicionarRequisito, removerRequisito, updateField]);

    if (carregando) {
        return (
            <PermissionGate permission="READ">
                <main>
                    <h1>Currículo do Curso</h1>
                    <div className="div_form">
                        <p className="master-detail-empty">Carregando...</p>
                    </div>
                </main>
            </PermissionGate>
        );
    }

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>{idEdicao ? `Editar Currículo #${idEdicao}` : 'Currículo do Curso'}</h1>
                <div className="div_form">
                    <div className="form-title">
                        {idEdicao ? `Currículo #${idEdicao}` : 'Novo Currículo'}
                    </div>
                    <div className="table_form">
                        <Tabs tabs={tabs} initial="curso"/>
                        <div className="form-buttons">
                            <button type="button" className="btnblue"
                                    title="Salvar registro" disabled={salvando}
                                    onClick={() => void handleComplete(dataRef.current)}>
                                {salvando ? 'Salvando...' : 'Gravar'}
                            </button>
                            <button type="button" className="btnyellow" title="Voltar para a lista"
                                    onClick={voltar} disabled={salvando}>
                                Voltar
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
