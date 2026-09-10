import {useEffect, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../../../shared/services/permissions';
import {MasterDetail} from '../../../shared/components/MasterDetail';
import {AutoComplete, type AutoCompleteOption} from '../../../shared/components/AutoComplete';
import {BooleanField} from '../../../shared/components/BooleanField';
import {AGENDA_SOURCE, AGENDA_COLUMNS, AGENDA_SEARCH, TURNO_TRABALHO_SOURCE, TURNO_TRABALHO_COLUMNS, TURNO_TRABALHO_SEARCH, USUARIO_SOURCE, USUARIO_COLUMNS, USUARIO_SEARCH} from '../../../shared/services/masterDetailSources';
import type {ApiItem} from '../../../shared/types/types';
import {api} from '../../../shared/services/api';
import {API_PATHS} from '../../../shared/services/apiPaths';

const requiredMark = <span style={{color: '#C90000', marginLeft: 4}}>*</span>;

interface AgendaPermissoes {
    agendar: boolean;
    alterar: boolean;
    fechar: boolean;
    iniciar: boolean;
    atender: boolean;
}

export default function ViewConsultorFormConsultorListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idParam = searchParams.get('id');
    const editingId = idParam ? Number(idParam) : null;
    const isEdit = editingId !== null && !Number.isNaN(editingId);

    // Estado do form
    const [usuario, setUsuario] = useState<AutoCompleteOption | null>(null);
    const [agendas, setAgendas] = useState<ApiItem[]>([]);
    const [turnosTrabalho, setTurnosTrabalho] = useState<ApiItem[]>([]);
    const [agendaPermissoes, setAgendaPermissoes] = useState<AgendaPermissoes>({
        agendar: false,
        alterar: false,
        fechar: false,
        iniciar: false,
        atender: false,
    });

    // Fetch para AutoComplete de Usuário
    const fetchUsuario = async (query: string): Promise<AutoCompleteOption[]> => {
        const res = await api.get<any[]>(USUARIO_SOURCE, {params: {q: query}});
        const arr = Array.isArray(res.data) ? res.data : (res.data as any)?.content ?? [];
        return arr.map((u: any) => ({id: Number(u.id), label: u.login ?? u.nome ?? `#${u.id}`}));
    };

    const fetchUsuarioById = async (id: number): Promise<AutoCompleteOption | null> => {
        try {
            const res = await api.get<any>(`${USUARIO_SOURCE}/${id}`);
            const u = res.data;
            return u ? {id: Number(u.id), label: u.login ?? u.nome ?? `#${u.id}`} : null;
        } catch {
            return null;
        }
    };

    // Carregar dados para edição
    useEffect(() => {
        if (!isEdit || editingId === null) return;
        let alive = true;
        setUsuario(null);
        setAgendas([]);
        setTurnosTrabalho([]);
        (async () => {
            try {
                const ent = (await api.get<any>(`${API_PATHS.comercial.consultor}/${editingId}`)).data;
                if (!alive) return;
                if (ent.usuarioId) {
                    const u = (await api.get<any>(`${USUARIO_SOURCE}/${ent.usuarioId}`)).data;
                    if (u) setUsuario({id: Number(u.id), label: u.login ?? u.nome ?? `#${u.id}`});
                }
                // Agendas e Turnos de Trabalho - tentar carregar via endpoints dedicados
                try {
                    const ags = (await api.get<any[]>(`${API_PATHS.comercial.consultor}/${editingId}/agendas`)).data ?? [];
                    setAgendas(ags.map((a: any) => ({id: Number(a.id), nome: a.descricao, dadosJson: JSON.stringify(a)} as ApiItem)));
                } catch {
                    // ignora
                }
                try {
                    const tts = (await api.get<any[]>(`${API_PATHS.comercial.consultor}/${editingId}/turnos-trabalho`)).data ?? [];
                    setTurnosTrabalho(tts.map((t: any) => ({id: Number(t.id), nome: t.descricao, dadosJson: JSON.stringify(t)} as ApiItem)));
                } catch {
                    // ignora
                }
            } catch (e) {
                console.error('Erro ao carregar consultor:', e);
            }
        })();
        return () => { alive = false; };
    }, [editingId, isEdit]);

    const validate = (): string | null => {
        if (!usuario) return 'Usuário é obrigatório.';
        return null;
    };

    const handleSave = async (continuar = false) => {
        const msg = validate();
        if (msg) {
            alert(msg);
            return;
        }
        const body: Record<string, unknown> = {
            usuarioId: usuario.id,
            agendaIds: agendas.map((a) => (a as any).id ?? (a as any).value ?? a),
            turnoTrabalhoIds: turnosTrabalho.map((t) => (t as any).id ?? (t as any).value ?? t),
            agendaPermissoes,
        };
        try {
            if (isEdit && editingId !== null) {
                await api.put(`${API_PATHS.comercial.consultor}/${editingId}`, body);
                alert('Consultor atualizado com sucesso.');
            } else {
                await api.post(API_PATHS.comercial.consultor, body);
                alert('Consultor criado com sucesso.');
            }
            if (!continuar) {
                navigate('/view/consultor/consultor');
            } else if (!isEdit) {
                setUsuario(null);
                setAgendas([]);
                setTurnosTrabalho([]);
                setAgendaPermissoes({agendar: false, alterar: false, fechar: false, iniciar: false, atender: false});
            }
        } catch (e) {
            console.error('Erro ao salvar:', e);
            alert('Erro ao salvar consultor.');
        }
    };

    const voltar = () => navigate('/view/consultor/consultor');

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="page-header">
                    <h1>{isEdit ? `Editar Consultor #${editingId}` : 'Novo Consultor'}</h1>
                    <button type="button" className="btnblue" onClick={voltar}>Voltar</button>
                </div>
                <div className="p-separator" style={{width: '99%', height: 1, background: '#ddd', margin: '8px 0'}} />

                <div className="div_form" style={{width: '40%', minWidth: 520, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16}}>
                    <div style={{fontWeight: 700, marginBottom: 12, color: '#374151'}}>Consultor</div>

                    <div className="table_form" style={{display: 'grid', gridTemplateColumns: '160px 1fr', gap: '12px 16px', alignItems: 'center'}}>
                        {/* ID */}
                        <label htmlFor="inputId:id" className="form-label" style={{fontWeight: 600}}>
                            ID
                        </label>
                        <input id="inputId:id" className="form-input inputTiny" value={isEdit ? String(editingId) : ''} disabled placeholder="(novo)" style={{width: 90, background: '#f3f4f6'}} />

                        {/* Usuário (AutoComplete) */}
                        <label htmlFor="usuario" className="form-label" style={{fontWeight: 600}}>
                            Usuário {requiredMark}
                        </label>
                        <AutoComplete
                            id="usuario"
                            label=""
                            placeholder="Digite 3+ caracteres para buscar usuário..."
                            value={usuario}
                            onChange={setUsuario}
                            fetchOptions={fetchUsuario}
                            fetchById={fetchUsuarioById}
                            minChars={3}
                            disabled={isEdit}
                        />
                    </div>

                    {/* Agendas - MasterDetail */}
                    <div style={{marginTop: 16}}>
                        <MasterDetail
                            label="Agenda"
                            source={AGENDA_SOURCE}
                            valueKey="id"
                            searchKeys={AGENDA_SEARCH}
                            columns={AGENDA_COLUMNS}
                            items={agendas}
                            onChange={setAgendas}
                        />
                        <div style={{fontSize: 12, color: '#6b7280', marginTop: 4}}>
                            Selecione as agendas. Permissões abaixo aplicam-se ao conjunto selecionado.
                        </div>

                        {/* Permissões de Agenda */}
                        <div style={{marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10}}>
                            <label className="form-field">
                                <span className="form-label">Agendar</span>
                                <BooleanField value={agendaPermissoes.agendar} onChange={v => setAgendaPermissoes(p => ({...p, agendar: v}))} />
                            </label>
                            <label className="form-field">
                                <span className="form-label">Alterar</span>
                                <BooleanField value={agendaPermissoes.alterar} onChange={v => setAgendaPermissoes(p => ({...p, alterar: v}))} />
                            </label>
                            <label className="form-field">
                                <span className="form-label">Fechar</span>
                                <BooleanField value={agendaPermissoes.fechar} onChange={v => setAgendaPermissoes(p => ({...p, fechar: v}))} />
                            </label>
                            <label className="form-field">
                                <span className="form-label">Iniciar</span>
                                <BooleanField value={agendaPermissoes.iniciar} onChange={v => setAgendaPermissoes(p => ({...p, iniciar: v}))} />
                            </label>
                            <label className="form-field">
                                <span className="form-label">Atender</span>
                                <BooleanField value={agendaPermissoes.atender} onChange={v => setAgendaPermissoes(p => ({...p, atender: v}))} />
                            </label>
                        </div>
                    </div>

                    {/* Turnos de Trabalho - MasterDetail */}
                    <div style={{marginTop: 16}}>
                        <MasterDetail
                            label="Turno de Trabalho"
                            source={TURNO_TRABALHO_SOURCE}
                            valueKey="id"
                            searchKeys={TURNO_TRABALHO_SEARCH}
                            columns={TURNO_TRABALHO_COLUMNS}
                            items={turnosTrabalho}
                            onChange={setTurnosTrabalho}
                        />
                        <div style={{fontSize: 12, color: '#6b7280', marginTop: 4}}>
                            Selecione os turnos de trabalho do consultor.
                        </div>
                    </div>

                    <div style={{marginTop: 8, fontSize: 12, color: '#6b7280'}}>
                        Campos com {requiredMark} são obrigatórios.
                    </div>

                    {/* po:formButtons */}
                    <div className="form-footer" style={{display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20, paddingTop: 12, borderTop: '1px solid #e5e7eb'}}>
                        <button type="button" className="btn-form-back" onClick={voltar}>Cancelar</button>
                        <button type="button" className="btn-form-save" onClick={() => handleSave(false)}>{isEdit ? 'Salvar' : 'Criar'}</button>
                        <button type="button" className="btnstop" onClick={() => handleSave(true)} title="Salvar e continuar editando">Salvar e Continuar</button>
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
