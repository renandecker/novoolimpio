import {useEffect, useState} from 'react';

import {useNavigate, useSearchParams} from 'react-router-dom';

import {PermissionGate} from '../../../shared/services/permissions';

import {api} from '../../../shared/services/api';



const API = '/api/financeiro/etapas-cobranca';



type EtapaRow = {

    id: number;

    descricao: string;

    ordem: number;

    customizado: boolean;

    usuario: boolean;

    perfil: boolean;

    campoCustomizado?: string | null;

    campoDetalhes?: string | null;

    tipoModeloDocumento?: number;

    localDocumento?: string | null;

    nomeDocumento?: string | null;

};



const TIPOS_DOCUMENTO = [

    {value: '0', label: 'WORD'},

    {value: '1', label: 'PDF'},

    {value: '2', label: 'IMPRESSÃƒO'},

];



function asBool(value: unknown): boolean {

    return value === true || value === 1 || value === '1' || value === 'true' || value === 'TRUE' || value === 'Sim' || value === 'SIM' || value === 'S';

}



export default function ViewEtapasCobrancaFormEtapasCobrancaListScreen() {

    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const idParam = searchParams.get('id');

    const editingId = idParam ? Number(idParam) : null;

    const isEdit = editingId !== null && !Number.isNaN(editingId);



    const [descricao, setDescricao] = useState('');

    const [ordem, setOrdem] = useState('');

    const [usuario, setUsuario] = useState(true);

    const [perfil, setPerfil] = useState(true);

    const [customizado, setCustomizado] = useState(false);

    const [campoCustomizado, setCampoCustomizado] = useState('');

    const [campoDetalhes, setCampoDetalhes] = useState('');

    const [tipoModeloDocumento, setTipoModeloDocumento] = useState('0');

    const [localDocumento, setLocalDocumento] = useState('');

    const [nomeDocumento, setNomeDocumento] = useState('');



    const [loading, setLoading] = useState(false);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState('');

    const [success, setSuccess] = useState('');



    useEffect(() => {

        if (!isEdit) return;

        setLoading(true);

        setError('');

        api.get<EtapaRow>(`${API}/${editingId}`)

            .then((res) => {

                const row: any = res.data ?? {};

                setDescricao(String(row.descricao ?? ''));

                setOrdem(row.ordem === null || row.ordem === undefined ? '' : String(row.ordem));

                setUsuario(asBool(row.usuario));

                setPerfil(asBool(row.perfil));

                setCustomizado(asBool(row.customizado));

                setCampoCustomizado(String(row.campoCustomizado ?? ''));

                setCampoDetalhes(String(row.campoDetalhes ?? ''));

                setTipoModeloDocumento(row.tipoModeloDocumento === null || row.tipoModeloDocumento === undefined ? '0' : String(row.tipoModeloDocumento));

                setLocalDocumento(String(row.localDocumento ?? ''));

                setNomeDocumento(String(row.nomeDocumento ?? ''));

            })

            .catch((e: any) => setError(e?.response?.data?.error ?? e?.message ?? 'Erro ao carregar Etapa de Cobrança.'))

            .finally(() => setLoading(false));

    }, [editingId, isEdit]);



    const validate = (): string | null => {

        const d = descricao.trim();

        if (!d) return 'Descrição é obrigatória.';

        if (d.length < 3) return 'Descrição deve ter no mínimo 3 caracteres.';

        if (d.length > 255) return 'Descrição deve ter no máximo 255 caracteres.';

        const o = ordem.trim();

        if (!o) return 'Ordem é obrigatória.';

        if (!/^\d+$/.test(o)) return 'Ordem deve ser um inteiro positivo.';

        if (Number(o) < 0) return 'Ordem deve ser um inteiro positivo.';

        return null;

    };



    const handleSave = async (continueSaving: boolean) => {

        const msg = validate();

        if (msg) {

            setError(msg);

            return;

        }

        setSaving(true);

        setError('');

        setSuccess('');

        const payload: Record<string, unknown> = {

            descricao: descricao.trim(),

            ordem: Number(ordem.trim()),

            customizado,

            usuario,

            perfil,

            tipoModeloDocumento: Number(tipoModeloDocumento),

            campoCustomizado: customizado ? campoCustomizado : null,

            campoDetalhes: customizado ? campoDetalhes : null,

            localDocumento: localDocumento || null,

            nomeDocumento: nomeDocumento || null,

        };

        try {

            if (isEdit) {

                await api.put(`${API}/${editingId}`, payload);

                setSuccess('Etapa de Cobrança atualizada com sucesso.');

            } else {

                await api.post(API, payload);

                setSuccess('Etapa de Cobrança criada com sucesso.');

            }

            if (continueSaving) {

                if (!isEdit) {

                    setDescricao(''); setOrdem(''); setCustomizado(false);

                    setCampoCustomizado(''); setCampoDetalhes(''); setTipoModeloDocumento('0');

                    setLocalDocumento(''); setNomeDocumento(''); setUsuario(true); setPerfil(true);

                    setSuccess('');

                }

            } else {

                setTimeout(() => navigate('/view/etapasCobranca/listEtapasCobranca'), 600);

            }

        } catch (e: any) {

            setError(e?.response?.data?.error ?? e?.response?.data?.message ?? e?.message ?? 'Erro ao salvar.');

        } finally {

            setSaving(false);

        }

    };



    const handleOrdemChange = (v: string) => setOrdem(v.replace(/[^\d]/g, ''));



    return (

        <PermissionGate permission="READ">

            <main>

                <div className="page-header" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12}}>

                    <h1 style={{margin: 0}}>{isEdit ? `Editar Etapa de Cobrança #${editingId}` : 'Nova Etapa de Cobrança'}</h1>

                    <button type="button" className="btnblue" onClick={() => navigate('/view/etapasCobranca/listEtapasCobranca')}>

                        Voltar

                    </button>

                </div>



                <div className="p-separator" style={{width: '99%', height: 1, background: '#ddd', margin: '8px 0'}}/>



                {error && <div style={{background: '#FDE8E8', border: '1px solid #F5C2C2', color: '#8A1F1F', padding: 10, borderRadius: 6, marginBottom: 12}}>{error}</div>}

                {success && <div style={{background: '#E6F4EA', border: '1px solid #B7E1C6', color: '#1E4620', padding: 10, borderRadius: 6, marginBottom: 12}}>{success}</div>}

                {loading && <p>Carregando...</p>}



                <div className="div_form" style={{width: '100%', maxWidth: 720, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16}}>

                    <div className="form-grid">

                        <label className="form-field">
                            <span className="form-label">Id</span>
                            <input id="inputId:id" className="form-input inputTiny" value={isEdit ? String(editingId) : ''} disabled placeholder="(novo)" style={{width: 90, background: '#f3f4f6'}}/>
                        </label>

                        <label className="form-field">
                            <span className="form-label">Ordem <span style={{color: '#C90000'}}>*</span></span>
                            <input id="inputOrdem:ordem" className="form-input inputTiny" value={ordem} onChange={(e) => handleOrdemChange(e.target.value)} inputMode="numeric" placeholder="Ex.: 1" style={{width: 120}} required/>
                        </label>

                        <label className="form-field">
                            <span className="form-label">Descrição <span style={{color: '#C90000'}}>*</span></span>
                            <input id="inputDescricao:descricao" className="form-input inputLarge" value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={255} placeholder="Ex.: Documento de cobrança" required style={{gridColumn: 'span 3'}}/>
                        </label>

                        <label className="form-field">
                            <span className="form-label">Todos usuários</span>
                            <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                <input type="checkbox" checked={usuario} onChange={(e) => setUsuario(e.target.checked)}/>
                                {usuario ? 'Sim' : 'Não'}
                            </label>
                        </label>

                        <label className="form-field">
                            <span className="form-label">Todos perfis</span>
                            <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                <input type="checkbox" checked={perfil} onChange={(e) => setPerfil(e.target.checked)}/>
                                {perfil ? 'Sim' : 'Não'}
                            </label>
                        </label>

                        <label className="form-field">
                            <span className="form-label">Customizado</span>
                            <label style={{display: 'flex', alignItems: 'center', gap: 8}}>
                                <input type="checkbox" checked={customizado} onChange={(e) => setCustomizado(e.target.checked)}/>
                                {customizado ? 'Sim' : 'Não'}
                            </label>
                        </label>

                        {customizado && (
                            <label className="form-field">
                                <span className="form-label">Campo de regras (SQL)</span>
                                <textarea id="inputcampoCustomizado" className="form-input" rows={5} value={campoCustomizado} onChange={(e) => setCampoCustomizado(e.target.value)} placeholder="SELECT ..." style={{gridColumn: 'span 3'}}/>
                            </label>
                        )}

                        {customizado && (
                            <label className="form-field">
                                <span className="form-label">Descrição na coluna detalhes (SQL)</span>
                                <textarea id="inputcampoDetalhes" className="form-input" rows={5} value={campoDetalhes} onChange={(e) => setCampoDetalhes(e.target.value)} placeholder="SELECT ..." style={{gridColumn: 'span 3'}}/>
                            </label>
                        )}

                    </div>



                    <div style={{border: '1px solid #e5e7eb', borderRadius: 6, marginTop: 16, padding: 12}}>

                        <div className="form-title" style={{fontWeight: 600, marginBottom: 10}}>Documento</div>

                        <div className="form-grid">

                            <label className="form-field">
                                <span className="form-label">Tipo de exportação</span>
                                <div style={{display: 'flex', gap: 16, gridColumn: 'span 3'}}>
                                    {TIPOS_DOCUMENTO.map((tipo) => (
                                        <label key={tipo.value} style={{display: 'flex', alignItems: 'center', gap: 6}}>
                                            <input type="radio" name="tipoModeloDocumento" value={tipo.value} checked={tipoModeloDocumento === tipo.value} onChange={() => setTipoModeloDocumento(tipo.value)}/>
                                            {tipo.label}
                                        </label>
                                    ))}
                                </div>
                            </label>

                            <label className="form-field">
                                <span className="form-label">Nome documento</span>
                                <input id="inputNomeDocumento" className="form-input" value={nomeDocumento} onChange={(e) => setNomeDocumento(e.target.value)} placeholder="Ex.: cobranca.docx"/>
                            </label>

                            <label className="form-field">
                                <span className="form-label">Local documento</span>
                                <input id="inputLocalDocumento" className="form-input" value={localDocumento} onChange={(e) => setLocalDocumento(e.target.value)} placeholder="Caminho/URL do documento"/>
                            </label>

                        </div>

                    </div>



                    <div className="form-footer" style={{display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20, paddingTop: 12, borderTop: '1px solid #e5e7eb'}}>

                        <button type="button" className="btnyellow" onClick={() => navigate('/view/etapasCobranca/listEtapasCobranca')} disabled={saving}>

                            Cancelar

                        </button>

                        <button type="button" className="btnstop" onClick={() => handleSave(false)} disabled={saving || loading}>

                            {saving ? 'Salvando...' : 'Salvar'}

                        </button>

                        <button type="button" className="btnblue" onClick={() => handleSave(true)} disabled={saving || loading}>

                            {saving ? 'Salvando...' : 'Salvar e Continuar'}

                        </button>

                    </div>

                </div>

            </main>

        </PermissionGate>

    );

}

