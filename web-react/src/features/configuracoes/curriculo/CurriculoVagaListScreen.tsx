import {useState} from 'react';

import {PermissionGate} from '../../../shared/services/permissions';

import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';

import {MasterDetail} from '../../../shared/components/MasterDetail';

import {UnidadeCombo} from '../../../shared/components/UnidadeCombo';

import {Tabs} from '../../../shared/components/Tabs';

import {BooleanField} from '../../../shared/components/BooleanField';

import {useApi} from '../../../shared/services/api';

import {API_PATHS} from '../../../shared/services/apiPaths';

import {useModulePaged} from '../../../shared/hooks/useModulePaged';

import type {ApiItem} from '../../../shared/types/types.ts';



const VAGA_COLUMNS: DataTableColumn[] = [

    {key: 'id', label: 'ID'},

    {key: 'nome', label: 'Nome'},

{key: 'descricao', label: 'Descrição'},

    {key: 'data_inicio', label: 'Data Início', render: (item) => item.data_inicio ? new Date(item.data_inicio).toLocaleDateString('pt-BR') : ''},

    {key: 'data_fim', label: 'Data Fim', render: (item) => item.data_fim ? new Date(item.data_fim).toLocaleDateString('pt-BR') : ''},

    {key: 'vagas', label: 'Vagas'},

    {key: 'fl_ativo', label: 'Ativo'},

    {key: 'fl_exibir_vaga', label: 'Exibir Vaga'},

    {key: 'fl_email', label: 'E-mail'},

];



interface VagaFormData {

    nome: string;

    descricao: string;

    titulo_email: string;

    assunto_email: string;

    data_inicio: string;

    data_fim: string;

    vagas: number | null;

    id_usuario: number | null;

    fl_ativo: boolean;

    fl_exibir_vaga: boolean;

    fl_email: boolean;

    perfis: ApiItem[];

    unidade: { id: number; label: string } | null;

    empresas: ApiItem[];

    usuarios: ApiItem[];

    oferecimentos: ApiItem[];

    componentes: ApiItem[];

    curriculos: ApiItem[];

    grupos: ApiItem[];

}



const PERFIL_SOURCE = '/api/view/perfil/listPerfil';

const PERFIL_COLUMNS = [{key: 'id', label: 'ID'}, {key: 'descricao', label: 'Descrição'}];

const PERFIL_SEARCH = ['descricao'];



const EMPRESA_SOURCE = '/api/curriculo/empresa/refs?id_pessoa=0'; // will use refs

const EMPRESA_COLUMNS = [{key: 'id', label: 'ID'}, {key: 'label', label: 'Empresa'}];

const EMPRESA_SEARCH = ['label'];



const USUARIO_SOURCE = '/api/view/usuario/listUsuario';

const USUARIO_COLUMNS = [{key: 'id', label: 'ID'}, {key: 'login', label: 'Login'}, {key: 'nome', label: 'Nome'}];

const USUARIO_SEARCH = ['login', 'nome'];



const OFERECIMENTO_SOURCE = '/api/educacao/oferecimento-componente-curricular';

const OFERECIMENTO_COLUMNS = [{key: 'id', label: 'ID'}, {key: 'descricao', label: 'Descrição'}];

const OFERECIMENTO_SEARCH = ['descricao'];



const COMPONENTE_SOURCE = '/api/educacao/componente-curricular';

const COMPONENTE_COLUMNS = [{key: 'id', label: 'ID'}, {key: 'descricao', label: 'Descrição'}, {key: 'sucinto', label: 'Sucinto'}];

const COMPONENTE_SEARCH = ['descricao', 'sucinto'];



const CURRICULO_SOURCE = '/api/educacao/curriculo';

const CURRICULO_COLUMNS = [{key: 'id', label: 'ID'}, {key: 'sucinto', label: 'Sucinto'}, {key: 'descricao', label: 'Descrição'}];

const CURRICULO_SEARCH = ['sucinto', 'descricao'];



const GRUPO_SOURCE = '/api/educacao/grupo';

const GRUPO_COLUMNS = [{key: 'id', label: 'ID'}, {key: 'nome', label: 'Nome'}];

const GRUPO_SEARCH = ['nome'];



export default function CurriculoVagaListScreen() {

    const [page, setPage] = useState(0);

    const [size, setSize] = useState(10);

    const [modalOpen, setModalOpen] = useState(false);

    const [editItem, setEditItem] = useState<ApiItem | null>(null);

    const [formData, setFormData] = useState<VagaFormData>(getEmptyFormData());

    const [activeTab, setActiveTab] = useState('geral');

    const [errors, setErrors] = useState<Record<string, string>>({});

    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const [actionResult, setActionResult] = useState<string | null>(null);



    const q = useModulePaged('/api/curriculo/vaga', page, size);

    const items = q.data?.content ?? [];



    const {post: criarEntrevistas} = useApi(API_PATHS.curriculo.criarEntrevistas);

    const {post: enviarVagasAlunos} = useApi(API_PATHS.curriculo.enviarVagasAlunos);



    const handleCriarEntrevistas = async () => {

        setActionLoading('criarEntrevistas');

        setActionResult(null);

        try {

            const result = await criarEntrevistas({});

            setActionResult(`Entrevistas criadas: ${result.entrevistasCriadas}, Vagas processadas: ${result.vagasProcessadas}`);

        } catch (error: any) {

            setActionResult(`Erro: ${error.response?.data?.error ?? error.message}`);

        } finally {

            setActionLoading(null);

        }

    };



    const handleEnviarVagasAlunos = async () => {

        setActionLoading('enviarVagasAlunos');

        setActionResult(null);

        try {

            const result = await enviarVagasAlunos({});

            setActionResult(`Candidatos processados: ${result.candidatos}, Lotes: ${result.lotes}`);

        } catch (error: any) {

            setActionResult(`Erro: ${error.response?.data?.error ?? error.message}`);

        } finally {

            setActionLoading(null);

        }

    };



    const validateForm = (): boolean => {

        const newErrors: Record<string, string> = {};

        if (!formData.nome?.trim()) newErrors.nome = 'Nome é obrigatório';

        if (!formData.descricao?.trim()) newErrors.descricao = 'Descrição é obrigatória';

        if (formData.data_inicio && formData.data_fim && formData.data_fim < formData.data_inicio) {

            newErrors.data_fim = 'Data fim não pode ser anterior à data início';

        }

        if (formData.vagas !== null && formData.vagas < 0) newErrors.vagas = 'Vagas deve ser >= 0';

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;

    };



    function getEmptyFormData(): VagaFormData {
        return ({

        nome: '',

        descricao: '',

        titulo_email: '',

        assunto_email: '',

        data_inicio: '',

        data_fim: '',

        vagas: 0,

        id_usuario: null,

        fl_ativo: true,

        fl_exibir_vaga: false,

        fl_email: true,

        perfis: [],

        unidade: null,

        empresas: [],

        usuarios: [],

        oferecimentos: [],

        componentes: [],

        curriculos: [],

        grupos: [],

    });

}



    const openCreate = () => {

        setFormData(getEmptyFormData());

        setEditItem(null);

        setErrors({});

        setActiveTab('geral');

        setModalOpen(true);

    };



    const openEdit = (item: ApiItem) => {

        const rec = item as unknown as Record<string, any>;

        setFormData({

            nome: String(rec.nome ?? ''),

            descricao: String(rec.descricao ?? ''),

            titulo_email: String(rec.titulo_email ?? ''),

            assunto_email: String(rec.assunto_email ?? ''),

            data_inicio: rec.data_inicio ? String(rec.data_inicio).slice(0, 10) : '',

            data_fim: rec.data_fim ? String(rec.data_fim).slice(0, 10) : '',

            vagas: rec.vagas as number ?? 0,

            id_usuario: rec.id_usuario as number ?? null,

            fl_ativo: rec.fl_ativo as boolean ?? true,

            fl_exibir_vaga: rec.fl_exibir_vaga as boolean ?? false,

            fl_email: rec.fl_email as boolean ?? true,

            perfis: (rec.perfis as Array<number> ?? []).map(id => ({id, label: `#${id}`, nome: `#${id}`})),

            unidade: (rec.unidades as Array<number> ?? [])[0] ? {id: (rec.unidades as Array<number> ?? [])[0], label: `#${(rec.unidades as Array<number> ?? [])[0]}`} : null,

            empresas: (rec.empresas as Array<number> ?? []).map(id => ({id, label: `#${id}`, nome: `#${id}`})),

            usuarios: (rec.usuarios as Array<number> ?? []).map(id => ({id, label: `#${id}`, nome: `#${id}`})),

            oferecimentos: (rec.oferecimentos as Array<number> ?? []).map(id => ({id, label: `#${id}`, nome: `#${id}`})),

            componentes: (rec.componentes as Array<number> ?? []).map(id => ({id, label: `#${id}`, nome: `#${id}`})),

            curriculos: (rec.curriculos as Array<number> ?? []).map(id => ({id, label: `#${id}`, nome: `#${id}`})),

            grupos: (rec.grupos as Array<number> ?? []).map(id => ({id, label: `#${id}`, nome: `#${id}`})),

        });

        setEditItem(item);

        setErrors({});

        setActiveTab('geral');

        setModalOpen(true);

    };



    const closeModal = () => {

        setModalOpen(false);

        setEditItem(null);

    };



    const handleSubmit = async () => {

        if (!validateForm()) return;



        const payload = {

            nome: formData.nome,

            descricao: formData.descricao,

            titulo_email: formData.titulo_email,

            assunto_email: formData.assunto_email,

            data_inicio: formData.data_inicio || null,

            data_fim: formData.data_fim || null,

            vagas: formData.vagas,

            id_usuario: formData.id_usuario,

            fl_ativo: formData.fl_ativo,

            fl_exibir_vaga: formData.fl_exibir_vaga,

            fl_email: formData.fl_email,

            perfis: formData.perfis.map(p => p.id),

            unidades: formData.unidade ? [formData.unidade.id] : [],

            empresas: formData.empresas.map(e => e.id),

            usuarios: formData.usuarios.map(u => u.id),

            oferecimentos: formData.oferecimentos.map(o => o.id),

            componentes: formData.componentes.map(c => c.id),

            curriculos: formData.curriculos.map(c => c.id),

            grupos: formData.grupos.map(g => g.id),

        };



        try {

            if (editItem) {

                await q.update.mutateAsync({id: Number(editItem.id), body: payload});

            } else {

                await q.create.mutateAsync(payload);

            }

            closeModal();

        } catch (error: any) {

            setErrors({submit: error.response?.data?.error ?? error.message ?? 'Erro ao salvar'});

        }

    };



    const updateField = <K extends keyof VagaFormData>(key: K, value: VagaFormData[K]) => {

        setFormData(prev => ({...prev, [key]: value}));

        if (errors[key as string]) setErrors(prev => ({...prev, [key]: ''}));

    };



    const renderGeralTab = () => (

        <div className="table_form">

            <div className="form-grid">

                <label className="form-field">

                    <span className="form-label">Nome *</span>

                    <input className="form-input" value={formData.nome} onChange={e => updateField('nome', e.target.value)} />

                    {errors.nome && <span className="form-erro">{errors.nome}</span>}

                </label>

                <label className="form-field">

                    <span className="form-label">Descrição *</span>

                    <textarea className="form-input" rows={4} value={formData.descricao} onChange={e => updateField('descricao', e.target.value)} style={{gridColumn: 'span 3'}} />

                    {errors.descricao && <span className="form-erro">{errors.descricao}</span>}

                </label>

                <label className="form-field">

                    <span className="form-label">Data Início</span>

                    <input type="date" className="form-input" value={formData.data_inicio} onChange={e => updateField('data_inicio', e.target.value)} />

                </label>

                <label className="form-field">

                    <span className="form-label">Data Fim</span>

                    <input type="date" className="form-input" value={formData.data_fim} onChange={e => updateField('data_fim', e.target.value)} />

                    {errors.data_fim && <span className="form-erro">{errors.data_fim}</span>}

                </label>

                <label className="form-field">

                    <span className="form-label">Vagas</span>

                    <input type="number" className="form-input" min="0" value={formData.vagas ?? ''} onChange={e => updateField('vagas', e.target.value ? parseInt(e.target.value) : null)} />

                    {errors.vagas && <span className="form-erro">{errors.vagas}</span>}

                </label>                <label className="form-field">
                    <span className="form-label">Ativo</span>
                    <BooleanField value={formData.fl_ativo} onChange={v => updateField('fl_ativo', v)} onText="Ativo" offText="Inativo"/>
                </label>
                <label className="form-field">
                    <span className="form-label">Exibir Vaga</span>
                    <BooleanField value={formData.fl_exibir_vaga} onChange={v => updateField('fl_exibir_vaga', v)} />
                </label>

                <label className="form-field">

                    <span className="form-label">Usuário Responsável</span>

                    <MasterDetail

                        label="Usuário"

                        source={USUARIO_SOURCE}

                        valueKey="id"

                        searchKeys={USUARIO_SEARCH}

                        columns={USUARIO_COLUMNS}

                        items={formData.id_usuario ? [{id: formData.id_usuario, label: `#${formData.id_usuario}`, nome: `#${formData.id_usuario}`}] : []}

                        onChange={items => updateField('id_usuario', items[0]?.id ?? null)}

                    />

                </label>

            </div>

        </div>

    );



    const renderEmailTab = () => (

        <div className="table_form">

            <div className="form-grid">                <label className="form-field">
                    <span className="form-label">Enviar por E-mail</span>
                    <BooleanField value={formData.fl_email} onChange={v => updateField('fl_email', v)} />
                </label>

                <label className="form-field">

                    <span className="form-label">Título do E-mail</span>

                    <input className="form-input" value={formData.titulo_email} onChange={e => updateField('titulo_email', e.target.value)} />

                </label>

                <label className="form-field">

                    <span className="form-label">Assunto do E-mail</span>

                    <textarea className="form-input" rows={3} value={formData.assunto_email} onChange={e => updateField('assunto_email', e.target.value)} style={{gridColumn: 'span 3'}} />

                </label>

            </div>

        </div>

    );



    const renderFiltrosTab = () => (

        <div className="table_form">

            <Tabs tabs={[

                {key: 'unidades', label: 'Unidade', content: <UnidadeCombo label="Unidade" value={formData.unidade} onChange={opt => updateField('unidade', opt)} />},

                {key: 'perfis', label: 'Perfis', content: (
                    <div className="form-grid">
                        <div style={{gridColumn: '1 / -1'}}>
                            <MasterDetail label="Perfis Selecionados" source={PERFIL_SOURCE} valueKey="id" searchKeys={PERFIL_SEARCH} columns={PERFIL_COLUMNS} items={formData.perfis} onChange={items => updateField('perfis', items)} />
                        </div>
                    </div>
                )},

                {key: 'empresas', label: 'Empresas', content: <MasterDetail label="Empresa" source="/api/curriculo/empresa" valueKey="id" searchKeys={['pessoa_nomeFantasia', 'pessoa_razaoSocial', 'pessoa_cnpj']} columns={[{key: 'pessoa_nomeFantasia', label: 'Nome Fantasia'}, {key: 'pessoa_razaoSocial', label: 'Razão Social'}, {key: 'pessoa_cnpj', label: 'CNPJ'}]} items={formData.empresas} onChange={items => updateField('empresas', items)} />},

                {key: 'usuarios', label: 'Usuários', content: <MasterDetail label="Usuário" source={USUARIO_SOURCE} valueKey="id" searchKeys={USUARIO_SEARCH} columns={USUARIO_COLUMNS} items={formData.usuarios} onChange={items => updateField('usuarios', items)} />},

                {key: 'oferecimentos', label: 'Turmas/Oferecimentos', content: <MasterDetail label="Oferecimento" source={OFERECIMENTO_SOURCE} valueKey="id" searchKeys={OFERECIMENTO_SEARCH} columns={OFERECIMENTO_COLUMNS} items={formData.oferecimentos} onChange={items => updateField('oferecimentos', items)} />},

                {key: 'componentes', label: 'Componentes', content: <MasterDetail label="Componente" source={COMPONENTE_SOURCE} valueKey="id" searchKeys={COMPONENTE_SEARCH} columns={COMPONENTE_COLUMNS} items={formData.componentes} onChange={items => updateField('componentes', items)} />},

                {key: 'curriculos', label: 'Cursos/Currículos', content: <MasterDetail label="Currículo" source={CURRICULO_SOURCE} valueKey="id" searchKeys={CURRICULO_SEARCH} columns={CURRICULO_COLUMNS} items={formData.curriculos} onChange={items => updateField('curriculos', items)} />},

                {key: 'grupos', label: 'Grupos', content: <MasterDetail label="Grupo" source={GRUPO_SOURCE} valueKey="id" searchKeys={GRUPO_SEARCH} columns={GRUPO_COLUMNS} items={formData.grupos} onChange={items => updateField('grupos', items)} />},

            ]} initial={activeTab} onChange={setActiveTab} />

        </div>

    );



    return (

        <PermissionGate permission="READ">

            <main>

                <div className="page-header">

                    <div className="page-header-breadcrumb"><h1>Vagas</h1></div>

                    <div className="page-header-actions">

                        <button className="btn-primary btnstop" onClick={openCreate}>Nova Vaga</button>

                        <button className="btn-primary btnyellow" onClick={handleCriarEntrevistas} disabled={actionLoading === 'criarEntrevistas'}>

                            {actionLoading === 'criarEntrevistas' ? 'Criando...' : 'Criar Entrevistas'}

                        </button>

                        <button className="btn-primary btnyellow" onClick={handleEnviarVagasAlunos} disabled={actionLoading === 'enviarVagasAlunos'}>

                            {actionLoading === 'enviarVagasAlunos' ? 'Enviando...' : 'Enviar Vagas Alunos'}

                        </button>

                    </div>

                </div>

                {actionResult && <div className="data-table-notice" style={{marginBottom: '10px', padding: '10px', background: '#eef'}}>{actionResult}</div>}

                <DataTable

                    path="/api/curriculo/vaga"

                    module="curriculo"

                    columns={VAGA_COLUMNS}

                    maxMainColumns={VAGA_COLUMNS.length}

                />

                {modalOpen && (

                    <div className="modal-overlay" onClick={closeModal}>

                        <div className="modal form-modal" onClick={e => e.stopPropagation()}>

                            <div className="div_form">

                                <div className="form-title">{editItem ? `Editar Vaga #${editItem.id}` : 'Nova Vaga'}</div>

                                <form className="table_form" onSubmit={e => {e.preventDefault(); handleSubmit();}}>

                                    <Tabs tabs={[

                                        {key: 'geral', label: 'Geral', content: renderGeralTab()},

                                        {key: 'email', label: 'E-mail', content: renderEmailTab()},

                                        {key: 'filtros', label: 'Filtros', content: renderFiltrosTab()},

                                    ]} initial={activeTab} onChange={setActiveTab} />

                                    {errors.submit && <div className="form-erro">{errors.submit}</div>}

                                    <div className="form-footer">

                                        <button type="button" className="btn-form-back" onClick={closeModal}>Cancelar</button>

                                        <button type="submit" className="btn-form-save">{editItem ? 'Salvar' : 'Criar'}</button>

                                    </div>

                                </form>

                            </div>

                        </div>

                    </div>

                )}

            </main>

        </PermissionGate>

    );

}

