import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {X, Plus} from 'lucide-react';
import {ProdutoSelectionModal} from '../produto/ProdutoSelectionModal';

import {useNavigate, useSearchParams} from 'react-router-dom';

import {PermissionGate} from '../../../shared/services/permissions';

import {BooleanField} from '../../../shared/components/BooleanField';

import {MasterDetail} from '../../../shared/components/MasterDetail';

import {UnidadeCombo, toUnidadeOption} from '../../../shared/components/UnidadeCombo';

import {useWizardData} from '../../../shared/components/Wizard';

import {Tabs, type TabItem} from '../../../shared/components/Tabs';

import {

    UNIDADE_SOURCE,

    COMPONENTE_SOURCE,

    COMPONENTE_COLUMNS,

    COMPONENTE_SEARCH,

    GRUPO_COMPONENTECOMPONENTE_SOURCE,

    GRUPO_COMPONENTECOMPONENTE_COLUMNS,

    GRUPO_COMPONENTECOMPONENTE_SEARCH,

    TIPO_MATRIZ_CURRICULAR_SOURCE,

    TIPO_MATRIZ_CURRICULAR_COLUMNS,

    TIPO_MATRIZ_CURRICULAR_SEARCH,

    MODALIDADE_SOURCE,

    MODALIDADE_COLUMNS,

    MODALIDADE_SEARCH,

    ATIVIDADE_COMPLEMENTAR_SOURCE,

    ATIVIDADE_COMPLEMENTAR_COLUMNS,

    ATIVIDADE_COMPLEMENTAR_SEARCH,

} from '../../../shared/services/masterDetailSources';

import type {ApiItem} from '../../../shared/types/types.ts';

import {api, useApi} from '../../../shared/services/api';

import {API_PATHS} from '../../../shared/services/apiPaths';



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

        ead?: boolean;

        habilitarAulaComplementar?: boolean;

        limiteAulaComplementar?: boolean;

        qtdeAulaComplementar?: number;

        aulaComplementarCriacao?: boolean;

        aulaComplementarExistente?: boolean;

        ordemAulaComplemnetar?: number;

    };

    matrizCurricular: ApiItem[];

    requisitos: RequisitoItem[];

    unidades: { id: number; label: string } | null;

    materialEscolar: MaterialEscolarItem[];

    atividadesComplementares: ApiItem[];

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

    {id: 1, descricao: 'TÃ©cnico'},

    {id: 2, descricao: 'Superior'},

    {id: 3, descricao: 'Livre'},

    {id: 4, descricao: 'Profissionalizante'},

];



const GRAUS = [

    {id: 1, descricao: 'Fundamental'},

    {id: 2, descricao: 'MÃ©dio'},

    {id: 3, descricao: 'Superior de GraduaÃ§Ã£o'},

    {id: 4, descricao: 'PÃ³s-GraduaÃ§Ã£o'},

];



const ESCOLARIDADES = [

    {id: 1, descricao: 'Ensino Fundamental Incompleto'},

    {id: 2, descricao: 'Ensino Fundamental Completo'},

    {id: 3, descricao: 'Ensino MÃ©dio Incompleto'},

    {id: 4, descricao: 'Ensino MÃ©dio Completo'},

    {id: 5, descricao: 'Superior Incompleto'},

    {id: 6, descricao: 'Superior Completo'},

    {id: 7, descricao: 'PÃ³s-GraduaÃ§Ã£o'},

];



export default function ViewCurriculoFormCurriculoListScreen() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const idEdicao = searchParams.get('id');



    const [idGravado, setIdGravado] = useState<number | string | null>(null);

    const edicaoId = idGravado ?? idEdicao;



    const [carregando, setCarregando] = useState(!!idEdicao);

    const [cursos, setCursos] = useState<ApiItem[]>([]);

    const [novoMaterialProduto, setNovoMaterialProduto] = useState('');

    const [novoMaterialQuantidade, setNovoMaterialQuantidade] = useState<number | ''>('');

    const [novoMaterialValor, setNovoMaterialValor] = useState<number | ''>('');

    const [novoMaterialObrigatorio, setNovoMaterialObrigatorio] = useState(true);

    const [novoRequisitoDescricao, setNovoRequisitoDescricao] = useState('');

    const [novoRequisitoComponenteId, setNovoRequisitoComponenteId] = useState<number | ''>('');

    const [novoRequisitoTipo, setNovoRequisitoTipo] = useState('PRÃ‰-REQUISITO');

    const [novoRequisitoCarga, setNovoRequisitoCarga] = useState<number | ''>('');

    const [novoRequisitoMedia, setNovoRequisitoMedia] = useState<number | ''>('');

    const [salvando, setSalvando] = useState(false);



    const [matriz, setMatriz] = useState<ApiItem[]>([]);

    const [unidades, setUnidades] = useState<{ id: number; label: string } | null>(null);

    const [materialEscolar, setMaterialEscolar] = useState<MaterialEscolarItem[]>([]);

    const [produtoModalOpen, setProdutoModalOpen] = useState(false);

    const [requisitos, setRequisitos] = useState<RequisitoItem[]>([]);

    const [atividadesComplementares, setAtividadesComplementares] = useState<ApiItem[]>([]);



    const {data, updateField, updateFields} = useWizardData<CurriculoData>({

        entity: {},

        matrizCurricular: [],

        requisitos: [],

        unidades: null,

        materialEscolar: [],

        atividadesComplementares: [],

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

                            const matrizNorm = (Array.isArray(mat) ? mat : []).map((m: any) => ({...m, id: m.componenteCurricularId ?? m.id, descricao: m.componenteDescricao ?? m.descricao ?? '', sucinto: m.componenteSucinto ?? m.sucinto ?? '', _matrizId: m.id}));
                            setMatriz(matrizNorm);
                            updateField('matrizCurricular', matrizNorm);

                        } catch { setMatriz([]); updateField('matrizCurricular', []); }



                        try {

                            const {data: uns} = await api.get<any[]>('/api/educacao/curriculo-unidade', {params: {curriculoId: idEdicao}});

                            const vinc = Array.isArray(uns) ? uns : [];
                            let unidadeSel: { id: number; label: string } | null = null;
                            if (vinc.length > 0) {
                                const uid = Number(vinc[0].unidadeId ?? vinc[0].id);
                                try {
                                    const todas = await api.get<ApiItem[]>(UNIDADE_SOURCE).then(r => r.data).catch(() => [] as ApiItem[]);
                                    const cheia = (todas ?? []).find((t: any) => Number(t.id) === uid);
                                    unidadeSel = cheia ? toUnidadeOption(cheia as any) ?? {id: uid, label: `#${uid}`} : {id: uid, label: `#${uid}`};
                                } catch { unidadeSel = {id: uid, label: `#${uid}`}; }
                            }
                            setUnidades(unidadeSel);
                            updateField('unidades', unidadeSel);

                        } catch { setUnidades(null); updateField('unidades', null); }



                        try {

                            const {data: mats} = await api.get<any[]>('/api/educacao/material-escolar-curso', {params: {curriculoId: idEdicao}});

                            const matNorm = (mats ?? []).map((m: any, i: number) => ({
                                key: `mat-db-${m.id ?? i}`,
                                id: m.id,
                                produtoId: m.produtoId ?? m.produto_id,
                                produtoDescricao: m.produtoDescricao ?? m.produto_descricao ?? m.descricao ?? '',
                                quantidade: m.quantidade,
                                valorUnitario: m.valorUnitario ?? m.valor_unitario,
                                obrigatorio: m.obrigatorio !== false,
                            }));
                            setMaterialEscolar(matNorm);
                            updateField('materialEscolar', matNorm);

                        } catch { setMaterialEscolar([]); updateField('materialEscolar', []); }



                        try {

                            const {data: ativs} = await api.get<any[]>('/api/educacao/curriculo-atividade-complementar', {params: {curriculoId: idEdicao}});

                            const ativVinc = Array.isArray(ativs) ? ativs : [];
                            let ativEnriquecidas: ApiItem[] = ativVinc.map((a: any) => ({...a, id: a.atividadeComplementarId ?? a.id} as unknown as ApiItem));
                            try {
                                const todasAtiv = await api.get<ApiItem[]>(ATIVIDADE_COMPLEMENTAR_SOURCE).then(r => r.data).catch(() => [] as ApiItem[]);
                                if (todasAtiv && todasAtiv.length > 0) {
                                    const porIdAtiv = new Map((todasAtiv as any[]).map((t: any) => [Number(t.id), t]));
                                    ativEnriquecidas = ativVinc.map((a: any) => {
                                        const aid = Number(a.atividadeComplementarId ?? a.id);
                                        const cheia = porIdAtiv.get(aid);
                                        return (cheia ? {...cheia, id: aid} : {...a, id: aid}) as unknown as ApiItem;
                                    });
                                }
                            } catch { /* mantem fallback */ }
                            setAtividadesComplementares(ativEnriquecidas);
                            updateField('atividadesComplementares', ativEnriquecidas);

                        } catch { setAtividadesComplementares([]); updateField('atividadesComplementares', []); }



                        try {

                            const {data: reqs} = await api.get<any[]>('/api/educacao/requisito-matriz', {params: {curriculoId: idEdicao}});

                            const reqNorm = (reqs ?? []).map((r: any, i: number) => ({
                                key: `req-db-${r.id ?? i}`,
                                id: r.id,
                                descricao: r.nome ?? r.descricao ?? '',
                                componenteCurricularId: r.componenteCurricularId ?? r.componente_curricular_id,
                                tipoRequisito: r.tipoRequisito ?? r.tipo_requisito ?? 'PRÃ‰-REQUISITO',
                                cargaHorariaMinima: r.cargaHorariaMinima ?? r.carga_horaria_minima,
                                mediaMinima: r.mediaMinima ?? r.media_minima,
                            }));
                            setRequisitos(reqNorm);
                            updateField('requisitos', reqNorm);

                        } catch { setRequisitos([]); updateField('requisitos', []); }

                    } catch (erro) {

                        console.error('Erro ao carregar currÃ­culo:', erro);

                        alert('NÃ£o foi possÃ­vel carregar o currÃ­culo para ediÃ§Ã£o');

                    }

                }

            } finally {

                setCarregando(false);

            }

        })();

    }, [idEdicao, updateFields]);



    const validateStep1 = useCallback(async (currentData: CurriculoData) => {

        if (!currentData.entity.descricao || currentData.entity.descricao.trim().length < 3) {

            return 'DescriÃ§Ã£o deve ter pelo menos 3 caracteres';

        }

        if (!currentData.entity.sucinto || currentData.entity.sucinto.trim().length < 1) {

            return 'Informe o sucinto do currÃ­culo';

        }

        if (currentData.entity.idadeMaxima && currentData.entity.idadeMinima &&

            currentData.entity.idadeMaxima < currentData.entity.idadeMinima) {

            return 'A idade mÃ­nima nÃ£o pode ser maior que a idade mÃ¡xima';

        }

        if (currentData.entity.qtdMaximaAlunos !== undefined && currentData.entity.qtdMaximaAlunos < 0) {

            return 'A quantidade mÃ¡xima de alunos nÃ£o pode ser negativa';

        }

        return true;

    }, []);



    const validateStep3 = useCallback(async (currentData: CurriculoData) => {

        if (!currentData.matrizCurricular || currentData.matrizCurricular.length === 0) {

            return 'Adicione pelo menos um componente curricular Ã  matriz';

        }

        return true;

    }, []);



    const validateStep5 = useCallback(async (currentData: CurriculoData) => {

        if (!currentData.unidades?.id) {

            return 'Selecione uma unidade para o currÃ­culo';

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





    const handleProdutoSelecionado = useCallback((produto: ApiItem) => {
        setMaterialEscolar((prev) => [
            ...prev,
            {
                key: `mat-${Date.now()}-${prev.length}`,
                produtoId: produto.id,
                produtoDescricao: produto.nome,
                quantidade: 1,
                valorUnitario: (produto as Record<string, unknown>).valor ? Number((produto as Record<string, unknown>).valor) : undefined,
                obrigatorio: true,
            },
        ]);
        setProdutoModalOpen(false);
    }, []);
    const removerMaterial = useCallback((key: string) => {

        setMaterialEscolar((prev) => prev.filter((m) => m.key !== key));

    }, []);



    const adicionarRequisito = useCallback(() => {

        if (!novoRequisitoDescricao.trim()) { alert('Informe a descriÃ§Ã£o do requisito'); return; }

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

        setNovoRequisitoTipo('PRÃ‰-REQUISITO');

        setNovoRequisitoCarga('');

        setNovoRequisitoMedia('');

    }, [novoRequisitoDescricao, novoRequisitoComponenteId, novoRequisitoTipo, novoRequisitoCarga, novoRequisitoMedia]);



    const removerRequisito = useCallback((key: string) => {

        setRequisitos((prev) => prev.filter((r) => r.key !== key));

    }, []);



    const handleComplete = useCallback(async (formData: CurriculoData, continuar?: boolean) => {

        setSalvando(true);

        try {

            const payload: Record<string, unknown> = {

                ...semId(formData.entity as unknown as Record<string, unknown>),

                dataCancelamento: formData.entity.dataCancelamento || null,

                possuiRematricula: formData.entity.possuiRematricula ?? false,

            };

            const salvo = edicaoId

                ? await curriculoApi.put(edicaoId, payload)

                : await curriculoApi.post(payload);

            const id = (salvo as any)?.id ?? edicaoId;

            if (!id) { alert('CurrÃ­culo salvo, mas o identificador nÃ£o foi retornado.'); return; }



            try {

                const listaMatriz = (matriz && matriz.length > 0 ? matriz : formData.matrizCurricular) ?? [];
                const idComponente = (m: any) => Number(m.componenteCurricularId ?? m.componente_curricular_id ?? m.id);

                const {data: atuaisMatriz} = await api.get<any[]>(API_PATHS.basico.matrizCurricular, {params: {curriculoId: id}});

                for (const a of atuaisMatriz ?? []) {

                    if (!listaMatriz.some((m) => idComponente(m) === Number(a.componenteCurricularId ?? a.id))) {

                        await api.delete(`${API_PATHS.basico.matrizCurricular}/${a.id}`).catch(() => undefined);

                    }

                }

                for (const item of listaMatriz) {

                    await api.post(API_PATHS.basico.matrizCurricular, {

                        curriculoId: id,

                        componenteCurricularId: idComponente(item),

                    });

                }

            } catch (e) { console.warn('Falha ao sincronizar matriz curricular:', e); }



            try {

                const unidadeSel = (unidades?.id ? unidades : formData.unidades) ?? null;

                const {data: atuaisUnidades} = await api.get<any[]>(API_PATHS.basico.curriculoUnidade, {params: {curriculoId: id}});

                for (const a of atuaisUnidades ?? []) {

                    // A tabela usa chave composta: remove por curriculoId + unidadeId.

                    await api.delete(API_PATHS.basico.curriculoUnidade, {params: {curriculoId: id, unidadeId: a.unidadeId ?? a.id}}).catch(() => undefined);

                }

                if (unidadeSel?.id) {

                    await api.post(API_PATHS.basico.curriculoUnidade, {curriculoId: id, unidadeId: Number(unidadeSel.id)});

                }

            } catch (e) { console.warn('Falha ao sincronizar unidades:', e); }



            try {

                const {data: atuaisAtividades} = await api.get<any[]>(API_PATHS.basico.curriculoAtividadeComplementar, {params: {curriculoId: id}});

                const listaAtividades = (atividadesComplementares && atividadesComplementares.length > 0 ? atividadesComplementares : formData.atividadesComplementares) ?? [];
                const idAtividade = (at: any) => Number(at.atividadeComplementarId ?? at.atividade_complementar_id ?? at.id);

                for (const a of atuaisAtividades ?? []) {

                    if (!listaAtividades.some((at) => idAtividade(at) === Number(a.atividadeComplementarId ?? a.id))) {

                        await api.delete(API_PATHS.basico.curriculoAtividadeComplementar, {params: {curriculoId: id, atividadeComplementarId: a.atividadeComplementarId ?? a.id}}).catch(() => undefined);

                    }

                }

                for (const item of listaAtividades) {

                    await api.post(API_PATHS.basico.curriculoAtividadeComplementar, {curriculoId: id, atividadeComplementarId: idAtividade(item)});

                }

            } catch (e) { console.warn('Falha ao sincronizar atividades complementares:', e); }



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

                        await api.put(`${API_PATHS.basico.materialEscolarCurso}/${item.id}`, body);

                    } else {

                        await api.post(API_PATHS.basico.materialEscolarCurso, body);

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

                        await api.put(`${API_PATHS.basico.requisitoMatriz}/${item.id}`, body);

                    } else {

                        await api.post(API_PATHS.basico.requisitoMatriz, body);

                    }

                }

            } catch (e) { console.warn('Falha ao salvar requisitos:', e); }



            alert('CurrÃ­culo salvo com sucesso!');

            if (continuar) {

                if (!edicaoId && id) setIdGravado(id);

            } else {

                navigate('/view/curriculo/listCurriculo');

            }

        } catch (error) {

            console.error('Erro ao salvar:', error);

            alert('Erro ao salvar currÃ­culo');

        } finally {

            setSalvando(false);

        }

    }, [curriculoApi, idEdicao, idGravado, materialEscolar, requisitos, matriz, unidades, atividadesComplementares, navigate]);



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

                        <span className="form-label">DescriÃ§Ã£o *</span>

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

                        <span className="form-label">Carga HorÃ¡ria</span>

                        <input className="form-input" type="number" min={0}

                               value={data.entity.qtdeIniciando === undefined ? '' : data.entity.qtdeIniciando}

                               onChange={(e) => updateField('entity', {

                                   ...data.entity,

                                   qtdeIniciando: e.target.value === '' ? 0 : Number(e.target.value),

                               })}/>

                    </label>

                    <label className="form-field">

                        <span className="form-label">Qtd. MÃ¡xima Alunos</span>

                        <input className="form-input" type="number" min={0}

                               value={data.entity.qtdMaximaAlunos ?? ''}

                               onChange={(e) => updateField('entity', {

                                   ...data.entity,

                                   qtdMaximaAlunos: e.target.value === '' ? 0 : Number(e.target.value),

                               })}/>

                    </label>

                    <label className="form-field">

                        <span className="form-label">Idade MÃ­nima</span>

                        <input className="form-input" type="number" min={0}

                               value={data.entity.idadeMinima ?? ''}

                               onChange={(e) => updateField('entity', {

                                   ...data.entity,

                                   idadeMinima: e.target.value === '' ? undefined : Number(e.target.value),

                               })}/>

                    </label>

                    <label className="form-field">

                        <span className="form-label">Idade MÃ¡xima</span>

                        <input className="form-input" type="number" min={0}

                               value={data.entity.idadeMaxima ?? ''}

                               onChange={(e) => updateField('entity', {

                                   ...data.entity,

                                   idadeMaxima: e.target.value === '' ? undefined : Number(e.target.value),

                               })}/>

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

                        <span className="form-label">Data Cancelamento</span>

                        <input className="form-input" type="date"

                               value={data.entity.dataCancelamento ?? ''}

                               onChange={(e) => updateField('entity', {...data.entity, dataCancelamento: e.target.value})}/>

                    </label>

                    <div className="form-field">

                        <span className="form-label">Possui RematrÃ­cula</span>

                        <BooleanField value={!!data.entity.possuiRematricula}

                                      onChange={(v) => updateField('entity', {...data.entity, possuiRematricula: v})}/>

                    </div>

                </div>

            ),

        },

        {

            key: 'licenca',

            label: 'LicenÃ§a',

            content: (

                <div className="form-grid">

                    <label className="form-field">

                        <span className="form-label">NÃºmero do Parecer</span>

                        <input className="form-input" value={data.entity.numeroParecer ?? ''}

                               onChange={(e) => updateField('entity', {...data.entity, numeroParecer: e.target.value})}/>

                    </label>

                    <label className="form-field">

                        <span className="form-label">LicenÃ§a</span>

                        <input className="form-input" value={data.entity.licenca ?? ''}

                               onChange={(e) => updateField('entity', {...data.entity, licenca: e.target.value})}/>

                    </label>

                    <label className="form-field">

                        <span className="form-label">Reconhecimento</span>

                        <input className="form-input" value={data.entity.reconhecimento ?? ''}

                               onChange={(e) => updateField('entity', {...data.entity, reconhecimento: e.target.value})}/>

                    </label>

                    <label className="form-field">

                        <span className="form-label">Escolaridade MÃ­nima</span>

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

                    <label className="form-field">

                        <span className="form-label">DescriÃ§Ã£o Diploma</span>

                        <input className="form-input"

                               value={data.entity.descricaoDiploma ?? ''}

                               onChange={(e) => updateField('entity', {...data.entity, descricaoDiploma: e.target.value})}/>

                    </label>

                </div>

            ),

        },

        {

            key: 'aula',

            label: 'Aula',

            content: (

                <>

                    <div className="form-grid">

                        <div className="form-field">

                            <span className="form-label">Habilitar Ensino EAD</span>

                            <BooleanField value={!!data.entity.ead}

                                          onChange={(v) => updateField('entity', {...data.entity, ead: v})}/>

                        </div>

                        <div className="form-field">

                            <span className="form-label">Habilitar Aula Complementar</span>

                            <BooleanField value={!!data.entity.habilitarAulaComplementar}

                                          onChange={(v) => updateField('entity', {

                                              ...data.entity,

                                              habilitarAulaComplementar: v,

                                          })}/>

                        </div>

                    </div>

                    {data.entity.habilitarAulaComplementar && (

                        <fieldset className="form-fieldset">

                            <legend>Aulas Complementares</legend>

                            <div className="form-grid">

                                <div className="form-field">

                                    <span className="form-label">Limitar Aula Complementar</span>

                                    <BooleanField value={!!data.entity.limiteAulaComplementar}

                                                  onChange={(v) => updateField('entity', {

                                                      ...data.entity,

                                                      limiteAulaComplementar: v,

                                                  })}/>

                                </div>

                                {data.entity.limiteAulaComplementar && (

                                    <label className="form-field">

                                        <span className="form-label">Qtd. Aula Complementar</span>

                                        <input className="form-input" type="number" min={0}

                                               value={data.entity.qtdeAulaComplementar ?? ''}

                                               onChange={(e) => updateField('entity', {

                                                   ...data.entity,

                                                   qtdeAulaComplementar: e.target.value === '' ? undefined : Number(e.target.value),

                                               })}/>

                                    </label>

                                )}

                                <div className="form-field">

                                    <span className="form-label">Habilitar Aula Complementar na CriaÃ§Ã£o</span>

                                    <BooleanField value={!!data.entity.aulaComplementarCriacao}

                                                  onChange={(v) => updateField('entity', {

                                                      ...data.entity,

                                                      aulaComplementarCriacao: v,

                                                  })}/>

                                </div>

                                <div className="form-field">

                                    <span className="form-label">Habilitar Aula Complementar Existente</span>

                                    <BooleanField value={!!data.entity.aulaComplementarExistente}

                                                  onChange={(v) => updateField('entity', {

                                                      ...data.entity,

                                                      aulaComplementarExistente: v,

                                                  })}/>

                                </div>

                                {data.entity.aulaComplementarCriacao && data.entity.aulaComplementarExistente && (

                                    <div className="form-field">

                                        <span className="form-label">Ordem de Busca da Aula Complementar</span>

                                        <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>

                                            <label style={{display: 'flex', gap: '4px', alignItems: 'center'}}>

                                                <input type="radio" name="ordemAulaComplemnetar"

                                                       checked={data.entity.ordemAulaComplemnetar === 0}

                                                       onChange={() => updateField('entity', {

                                                           ...data.entity,

                                                           ordemAulaComplemnetar: 0,

                                                       })}/>

                                                Existente / CriaÃ§Ã£o

                                            </label>

                                            <label style={{display: 'flex', gap: '4px', alignItems: 'center'}}>

                                                <input type="radio" name="ordemAulaComplemnetar"

                                                       checked={data.entity.ordemAulaComplemnetar === 1}

                                                       onChange={() => updateField('entity', {

                                                           ...data.entity,

                                                           ordemAulaComplemnetar: 1,

                                                       })}/>

                                                CriaÃ§Ã£o / Existente

                                            </label>

                                        </div>

                                    </div>

                                )}

                            </div>

                        </fieldset>

                    )}

                    <fieldset className="form-fieldset">

                        <legend>Atividades Complementares</legend>

                        <MasterDetail

                            label="Atividade Complementar"

                            source={ATIVIDADE_COMPLEMENTAR_SOURCE}

                            valueKey="id"

                            searchKeys={ATIVIDADE_COMPLEMENTAR_SEARCH}

                            columns={ATIVIDADE_COMPLEMENTAR_COLUMNS}

                            items={atividadesComplementares}

                            onChange={(novos) => {

                                setAtividadesComplementares(novos);

                                updateField('atividadesComplementares', novos);

                            }}

                        />

                    </fieldset>

                </>

            ),

        },

        {

            key: 'matriz',

            label: 'Matriz Curricular',

            content: (

                <>

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



                    <div className="form-grid" style={{marginTop: 16}}>

                        <label className="form-field">

                            <span className="form-label">Carga HorÃ¡ria Total do Curso</span>

                            <input className="form-input" disabled value={matriz.reduce((acc, m: any) => acc + (Number(m.cargaHoraria) || 0), 0)}/>

                        </label>



                        <label className="form-field">

                            <span className="form-label">Tipo de Matriz Curricular</span>

                            <select className="form-input form-select"

                                    value={data.entity.tipoModeloContrato ?? ''}

                                    onChange={(e) => updateField('entity', {...data.entity, tipoModeloContrato: e.target.value ? Number(e.target.value) : undefined})}>

                                <option value="">Selecione</option>

                                <option value="1">Regular</option>

                                <option value="2">Modular</option>

                            </select>

                        </label>

                    </div>



                    <div className="form-grid" style={{marginTop: 16}}>

                        <label className="form-field">

                            <span className="form-label">Grupo do Componente Curricular</span>

                            <select className="form-input form-select"

                                    value={data.entity.cursoId ?? ''}

                                    onChange={(e) => updateField('entity', {...data.entity, cursoId: e.target.value ? Number(e.target.value) : undefined})}>

                                <option value="">Selecione</option>

                            </select>

                        </label>



                        <label className="form-field">

                            <span className="form-label">Ordem</span>

                            <input className="form-input" type="number" min={0}

                                   value={data.entity.qtdeIniciando ?? ''}

                                   onChange={(e) => updateField('entity', {...data.entity, qtdeIniciando: e.target.value === '' ? 0 : Number(e.target.value)})}/>

                        </label>



                        <label className="form-field">

                            <span className="form-label">Modalidade</span>

                            <select className="form-input form-select"

                                    value={data.entity.tipoCursoId ?? ''}

                                    onChange={(e) => updateField('entity', {...data.entity, tipoCursoId: e.target.value ? Number(e.target.value) : undefined})}>

                                <option value="">Selecione</option>

                            </select>

                        </label>

                    </div>

                </>

            ),

        },

        {

            key: 'requisitos',

            label: 'Requisitos',

            content: (

                <fieldset className="form-fieldset">

                    <legend>Requisitos da Matriz Curricular</legend>

                    <div className="form-grid">

                        <label className="form-field">

                            <span className="form-label">Componente Curricular *</span>

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

                            <span className="form-label">Componente Curricular Requisito *</span>

                            <select className="form-input form-select"

                                    value={novoRequisitoDescricao}

                                    onChange={(e) => setNovoRequisitoDescricao(e.target.value)}>

                                <option value="">Selecione</option>

                                {matriz.map((m) => (

                                    <option key={String(m.id)} value={String((m as any).descricao ?? (m as any).sucinto ?? m.id)}>

                                        {String((m as any).descricao ?? (m as any).sucinto ?? `Componente #${m.id}`)}

                                    </option>

                                ))}

                            </select>

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

                                <th>Componente Curricular</th>

                                <th>Componente Curricular Requisito</th>

                                <th style={{width: 50}}></th>

                            </tr>

                            </thead>

                            <tbody>

                            {requisitos.map((r) => {

                                const comp = matriz.find((m) => Number(m.id) === Number(r.componenteCurricularId));

                                return (

                                    <tr key={r.key}>

                                        <td>{(comp as any)?.descricao ?? (comp as any)?.sucinto ?? '-'}</td>

                                        <td>{r.descricao}</td>

                                        <td>

                                            <button type="button" className="btn-action btnred" title="Remover"

                                                    onClick={() => removerRequisito(r.key)}><X className="icon" />

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

            <legend>Unidade que oferece o curso</legend>

            <UnidadeCombo

                label="Unidade *"

                value={unidades}

                onChange={(opt) => {

                    setUnidades(opt);

                    updateField('unidades', opt);

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

                        <label className="form-field">

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

                            <span className="form-label">Valor UnitÃ¡rio</span>

                            <input className="form-input" type="number" min={0} step={0.01}

                                   value={novoMaterialValor}

                                   onChange={(e) => setNovoMaterialValor(

                                       e.target.value === '' ? '' : Number(e.target.value),

                                   )}/>

                        </label>

                        <div className="form-field">

                            <span className="form-label">ObrigatÃ³rio</span>

                            <BooleanField value={novoMaterialObrigatorio} onChange={setNovoMaterialObrigatorio}/>

                        </div>

                    </div>

                    <div className="form-buttons" style={{borderTop: 'none', marginTop: 8, display: 'flex', gap: 8}}>

                        <button type="button" className="btnblue" onClick={adicionarMaterial}>

                            Adicionar Material

                        </button>

                        <button type="button" className="btnstop" onClick={() => setProdutoModalOpen(true)}>

                            <Plus className="icon" style={{marginRight: 4}}/> Selecionar Produto

                        </button>

                    </div>

                    <ProdutoSelectionModal
                        isOpen={produtoModalOpen}
                        onClose={() => setProdutoModalOpen(false)}
                        onSelect={handleProdutoSelecionado}
                    />

                    {materialEscolar.length > 0 ? (

                        <table className="data-table" style={{marginTop: 14, width: '100%'}}>

                            <thead>

                            <tr>

                                <th>Material</th>

                                <th>Quantidade</th>

                                <th>Valor UnitÃ¡rio</th>

                                <th>ObrigatÃ³rio</th>

                                <th style={{width: 50}}></th>

                            </tr>

                            </thead>

                            <tbody>

                            {materialEscolar.map((m) => (

                                <tr key={m.key}>

                                    <td>{m.produtoDescricao ?? '-'}</td>

                                    <td>{m.quantidade ?? '-'}</td>

                                    <td>{m.valorUnitario !== undefined ? m.valorUnitario.toFixed(2) : '-'}</td>

                                    <td>{m.obrigatorio ? 'Sim' : 'NÃ£o'}</td>

                                    <td>

                                        <button type="button" className="btn-action btnred" title="Remover"

                                                onClick={() => removerMaterial(m.key)}><X className="icon" />

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

                            <span className="form-label">Tipo Modelo PromissÃ³ria</span>

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

                        <label className="form-field">

                            <span className="form-label">Template Contrato</span>

                            <textarea className="form-input" rows={4}

                                      style={{gridColumn: 'span 3', minHeight: 80}}

                                      value={data.entity.templateContrato ?? ''}

                                      onChange={(e) => updateField('entity', {...data.entity, templateContrato: e.target.value})}/>

                        </label>

                        <label className="form-field">

                            <span className="form-label">Template Certificado</span>

                            <textarea className="form-input" rows={4}

                                      style={{gridColumn: 'span 3', minHeight: 80}}

                                      value={data.entity.templateCertificado ?? ''}

                                      onChange={(e) => updateField('entity', {...data.entity, templateCertificado: e.target.value})}/>

                        </label>

                        <label className="form-field">

                            <span className="form-label">Template Boletim</span>

                            <textarea className="form-input" rows={4}

                                      style={{gridColumn: 'span 3', minHeight: 80}}

                                      value={data.entity.templateBoletim ?? ''}

                                      onChange={(e) => updateField('entity', {...data.entity, templateBoletim: e.target.value})}/>

                        </label>

                        <label className="form-field">

                            <span className="form-label">Template PromissÃ³ria</span>

                            <textarea className="form-input" rows={4}

                                      style={{gridColumn: 'span 3', minHeight: 80}}

                                      value={data.entity.templatePromissoria ?? ''}

                                      onChange={(e) => updateField('entity', {...data.entity, templatePromissoria: e.target.value})}/>

                        </label>

                    </div>

                </fieldset>

            ),

        },

    ], [data, matriz, unidades, materialEscolar, requisitos, atividadesComplementares, cursos, novoMaterialProduto, novoMaterialQuantidade, novoMaterialValor, novoMaterialObrigatorio, novoRequisitoDescricao, novoRequisitoComponenteId, novoRequisitoTipo, novoRequisitoCarga, novoRequisitoMedia, adicionarMaterial, removerMaterial, adicionarRequisito, removerRequisito, updateField]);



    if (carregando) {

        return (

            <PermissionGate permission="READ">

                <main>

                    <h1>CurrÃ­culo do Curso</h1>

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

                <h1>{edicaoId ? `Editar CurrÃ­culo #${edicaoId}` : 'CurrÃ­culo do Curso'}</h1>

                <div className="div_form">

                    <div className="form-title">

                        {edicaoId ? `CurrÃ­culo #${edicaoId}` : 'Novo CurrÃ­culo'}

                    </div>

                    <div className="table_form">

                        <Tabs tabs={tabs} initial="curso"/>

                        <div className="form-buttons">

                            <button type="button" className="btnstop"

                                    title="Salvar registro" disabled={salvando}

                                    onClick={() => void handleComplete(dataRef.current, false)}>

                                {salvando ? 'Salvando...' : 'Salvar'}

                            </button>

                            <button type="button" className="btnblue" title="Salvar e continuar editando"

                                    disabled={salvando} onClick={() => void handleComplete(dataRef.current, true)}>

                                Salvar e Continuar

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




