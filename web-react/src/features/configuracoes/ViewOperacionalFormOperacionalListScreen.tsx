import {useEffect, useState, useCallback} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import {PermissionGate} from '../permissions';
import {api} from '../api';
import {AutoComplete} from '../AutoComplete';
import type {ApiItem} from '../types';

type StatusPacote = 'INICIADO' | 'AGUARDANDO' | 'CONCLUIDO' | 'EXPIRADO' | 'PENDENTE';
type Direcionamento = 'INTERNO';

interface PacoteItem {
    id: number;
    descricao: string;
}
interface UsuarioItem {
    id: number;
    login: string;
    nome?: string;
}
interface OperacionalUsuarioItem {
    id: number;
    operador: { id: number; login: string; pessoa?: { pessoaFisica?: { nome: string } } };
    status: StatusPacote;
    ativo: boolean;
}

export default function ViewOperacionalFormOperacionalListScreen() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const idParam = searchParams.get('id');
    const editingId = idParam ? Number(idParam) : null;
    const isEdit = editingId !== null && !Number.isNaN(editingId);

    const [pacotes, setPacotes] = useState<PacoteItem[]>([]);
    const [pacoteId, setPacoteId] = useState<number | null>(null);
    const [direcionamento, setDirecionamento] = useState<Direcionamento>('INTERNO');
    const [coordenadorId, setCoordenadorId] = useState<number | null>(null);
    const [status, setStatus] = useState<StatusPacote>('AGUARDANDO');
    const [operacionalUsuarios, setOperacionalUsuarios] = useState<OperacionalUsuarioItem[]>([]);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Load pacotes disponíveis
    useEffect(() => {
        let alive = true;
        const loadPacotes = async () => {
            try {
                const resp = await api.get<PacoteItem[]>('/api/central/pacote/disponiveis');
                if (alive) setPacotes(resp.data ?? []);
            } catch (e) {
                console.error('Erro ao carregar pacotes', e);
            }
        };
        loadPacotes();
        return () => { alive = false; };
    }, []);

    // Load entity for edit
    useEffect(() => {
        if (!isEdit || editingId === null) return;
        let alive = true;
        setLoading(true);
        const load = async () => {
            try {
                const resp = await api.get<any>(`/api/central/operacional/${editingId}`);
                const ent = resp.data;
                if (!alive) return;
                setPacoteId(ent.pacoteId ?? null);
                setDirecionamento(ent.direcionamento ?? 'INTERNO');
                setCoordenadorId(ent.coordenadorId ?? null);
                setStatus((ent.status as StatusPacote) ?? 'AGUARDANDO');
                // Load operacional usuarios
                const ouResp = await api.get<OperacionalUsuarioItem[]>(`/api/central/operacional/${editingId}/usuarios`);
                if (alive) setOperacionalUsuarios(ouResp.data ?? []);
            } catch (e: any) {
                const msg = e?.response?.data?.error ?? e?.message ?? 'Erro ao carregar operacional';
                if (alive) setError(msg);
            } finally {
                if (alive) setLoading(false);
            }
        };
        load();
        return () => { alive = false; };
    }, [editingId, isEdit]);

    const handleAddUsuario = useCallback(async () => {
        if (!usuarioSelecionado) return;
        if (operacionalUsuarios.some(u => u.operador.id === usuarioSelecionado.id)) return;
        // For new entity, just add to local list
        const newOu: OperacionalUsuarioItem = {
            id: Date.now(), // temporary
            operador: { id: usuarioSelecionado.id, login: usuarioSelecionado.login, pessoa: usuarioSelecionado.nome ? { pessoaFisica: { nome: usuarioSelecionado.nome } } : undefined },
            status: 'AGUARDANDO',
            ativo: true,
        };
        setOperacionalUsuarios(prev => [...prev, newOu]);
        setUsuarioSelecionado(null);
    }, [usuarioSelecionado, operacionalUsuarios]);

    const handleRemoveUsuario = useCallback((index: number) => {
        if (!isEdit) {
            setOperacionalUsuarios(prev => prev.filter((_, i) => i !== index));
            return;
        }
        const ou = operacionalUsuarios[index];
        if (!ou) return;
        // For existing entity, call delete API
        api.delete(`/api/central/operacional-usuario/${ou.id}`)
            .then(() => setOperacionalUsuarios(prev => prev.filter((_, i) => i !== index)))
            .catch(e => setError(e?.response?.data?.error ?? 'Erro ao remover usuário'));
    }, [isEdit, operacionalUsuarios]);

    const validate = useCallback((): string | null => {
        if (!pacoteId) return 'Pacote é obrigatório.';
        if (!direcionamento) return 'Direcionamento é obrigatório.';
        if (operacionalUsuarios.length === 0) return 'Selecione uma equipe de trabalho.';
        return null;
    }, [pacoteId, direcionamento, operacionalUsuarios]);

    const handleSave = useCallback(async (continuar = false) => {
        const msg = validate();
        if (msg) { setError(msg); return; }
        setSaving(true);
        setError('');
        setSuccess('');
        const body = {
            pacoteId,
            direcionamento,
            coordenadorId,
            status: status || (isEdit ? 'INICIADO' : 'AGUARDANDO'),
        };
        try {
            if (isEdit && editingId !== null) {
                await api.put(`/api/central/operacional/${editingId}`, body);
                // Save usuarios - they are managed separately
                setSuccess('Operacional atualizado com sucesso.');
            } else {
                const resp = await api.post('/api/central/operacional', body);
                const newId = resp.data?.id;
                if (newId) {
                    // Save usuarios for new operacional
                    for (const ou of operacionalUsuarios) {
                        await api.post('/api/central/operacional-usuario', {
                            operacionalId: newId,
                            operadorId: ou.operador.id,
                            status: ou.status,
                        });
                    }
                }
                setSuccess('Operacional criado com sucesso.');
            }
            if (!continuar) {
                setTimeout(() => navigate('/view/operacional/listOperacional'), 800);
            } else if (!isEdit) {
                // Reset form for new entry
                setPacoteId(null);
                setDirecionamento('INTERNO');
                setCoordenadorId(null);
                setStatus('AGUARDANDO');
                setOperacionalUsuarios([]);
            }
        } catch (e: any) {
            const srv = e?.response?.data?.error ?? e?.message;
            setError(srv ?? 'Erro ao salvar.');
        } finally {
            setSaving(false);
        }
    }, [isEdit, editingId, pacoteId, direcionamento, coordenadorId, status, operacionalUsuarios, validate, navigate]);

    const coordenadorSearch = useCallback(async (query: string) => {
        if (!query || query.length < 2) return [];
        try {
            const resp = await api.get<UsuarioItem[]>(`/api/basico/usuario/autocomplete?q=${encodeURIComponent(query)}`);
            return resp.data ?? [];
        } catch {
            return [];
        }
    }, []);

    const usuarioSearch = useCallback(async (query: string) => {
        if (!query || query.length < 2) return [];
        try {
            const resp = await api.get<UsuarioItem[]>(`/api/basico/usuario/autocomplete?q=${encodeURIComponent(query)}`);
            return resp.data ?? [];
        } catch {
            return [];
        }
    }, []);

    const statusOptions: { value: StatusPacote; label: string }[] = [
        {value: 'INICIADO', label: 'INICIADO'},
        {value: 'AGUARDANDO', label: 'AGUARDANDO'},
        {value: 'CONCLUIDO', label: 'CONCLUIDO'},
        {value: 'EXPIRADO', label: 'EXPIRADO'},
        {value: 'PENDENTE', label: 'PENDENTE'},
    ];

    const direcionamentoOptions: { value: Direcionamento; label: string }[] = [
        {value: 'INTERNO', label: 'INTERNO'},
    ];

    return (
        <PermissionGate permission="READ">
            <main>
                <div className="page-header">
                    <h1>{isEdit ? `Editar Operacional #${editingId}` : 'Novo Operacional'}</h1>
                    <button type="button" className="btnblue" onClick={() => navigate('/view/operacional/listOperacional')}>
                        Voltar
                    </button>
                </div>

                <div className="p-separator" style={{width: '99%', height: 1, background: '#ddd', margin: '8px 0'}} />

                {error && (
                    <div className="form-erro" style={{background: '#FDE8E8', border: '1px solid #F5C2C2', color: '#8A1F1F', padding: 10, borderRadius: 6, marginBottom: 12}}>
                        {error}
                    </div>
                )}
                {success && (
                    <div style={{background: '#E6F4EA', border: '1px solid #B7E1C6', color: '#1E4620', padding: 10, borderRadius: 6, marginBottom: 12}}>
                        {success}
                    </div>
                )}
                {loading && <p>Carregando...</p>}

                <div className="div_form" style={{width: '40%', minWidth: 520, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 16}}>
                    <div style={{fontWeight: 700, marginBottom: 12, color: '#374151'}}>Operacional</div>

                    <div className="table_form" style={{display: 'grid', gridTemplateColumns: '180px 1fr', gap: '12px 16px', alignItems: 'center'}}>

                        {/* Id */}
                        <label htmlFor="inputId:id" className="form-label" style={{fontWeight: 600}}>Id</label>
                        <input id="inputId:id" className="form-input inputTiny" value={isEdit ? String(editingId) : ''} disabled placeholder="(novo)" style={{width: 90, background: '#f3f4f6'}} />

                        {/* Pacote * */}
                        <label htmlFor="inputPacote:pacote" className="form-label" style={{fontWeight: 600}}>
                            Pacote <span style={{color: '#C90000'}}>*</span>
                        </label>
                        <select
                            id="inputPacote:pacote"
                            className="form-input inputLargeMax"
                            value={pacoteId ?? ''}
                            onChange={e => setPacoteId(e.target.value ? Number(e.target.value) : null)}
                            required
                        >
                            <option value="">-- Selecione --</option>
                            {pacotes.map(p => (
                                <option key={p.id} value={p.id}>{p.descricao}</option>
                            ))}
                        </select>

                        {/* Direcionamento * */}
                        <label htmlFor="inputDirecionamento:direcionamento" className="form-label" style={{fontWeight: 600}}>
                            Direcionamento <span style={{color: '#C90000'}}>*</span>
                        </label>
                        <select
                            id="inputDirecionamento:direcionamento"
                            className="form-input inputLarge"
                            value={direcionamento}
                            onChange={e => setDirecionamento(e.target.value as Direcionamento)}
                            required
                        >
                            <option value="">-- Selecione --</option>
                            {direcionamentoOptions.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>

                        {/* Coordenador */}
                        <label htmlFor="inputCoordenador:coordenador" className="form-label" style={{fontWeight: 600}}>Coordenador</label>
                        <AutoComplete
                            id="inputCoordenador:coordenador"
                            search={coordenadorSearch}
                            value={coordenadorId ? {id: coordenadorId, login: '', nome: ''} : null}
                            onSelect={u => setCoordenadorId(u?.id ?? null)}
                            onClear={() => setCoordenadorId(null)}
                            getLabel={u => u?.login ?? ''}
                            placeholder="Digite o login do coordenador"
                            style={{width: '100%'}}
                        />

                        {/* Status */}
                        <label htmlFor="inputStatus" className="form-label" style={{fontWeight: 600}}>Status</label>
                        <select
                            id="inputStatus"
                            className="form-input"
                            value={status}
                            onChange={e => setStatus(e.target.value as StatusPacote)}
                        >
                            {statusOptions.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Operadores Table */}
                    <div style={{marginTop: 16}}>
                        <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 8}}>
                            <AutoComplete
                                search={usuarioSearch}
                                value={usuarioSelecionado}
                                onSelect={setUsuarioSelecionado}
                                onClear={() => setUsuarioSelecionado(null)}
                                getLabel={u => u?.login ?? ''}
                                placeholder="Digite o login do operador"
                                style={{flex: 1, maxWidth: 300}}
                            />
                            <button type="button" className="btnblue" onClick={handleAddUsuario} disabled={!usuarioSelecionado} title="Adicionar operador">
                                ➕
                            </button>
                        </div>
                        <table className="data-table" style={{width: '100%', fontSize: '13px'}}>
                            <thead>
                                <tr>
                                    <th style={{width: '35%'}}>Login</th>
                                    <th style={{width: '35%'}}>Nome</th>
                                    <th style={{width: '10%'}}>Ativo</th>
                                    <th style={{width: '10%'}}>Status</th>
                                    <th style={{width: '10%'}}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {operacionalUsuarios.map((ou, idx) => (
                                    <tr key={ou.id}>
                                        <td>{ou.operador.login}</td>
                                        <td>{ou.operador.pessoa?.pessoaFisica?.nome ?? ''}</td>
                                        <td>{ou.ativo ? 'Sim' : 'Não'}</td>
                                        <td>{ou.status}</td>
                                        <td>
                                            <button type="button" className="btnred" onClick={() => handleRemoveUsuario(idx)} title="Remover">✕</button>
                                        </td>
                                    </tr>
                                ))}
                                {operacionalUsuarios.length === 0 && (
                                    <tr><td colSpan={5} style={{textAlign: 'center', color: '#999', padding: '16px'}}>Nenhum operador selecionado</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div style={{marginTop: 8, fontSize: 12, color: '#6b7280'}}>
                        Campos com <span style={{color: '#C90000'}}>*</span> são obrigatórios. Selecione pelo menos um operador.
                    </div>

                    <div className="form-footer" style={{display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 20, paddingTop: 12, borderTop: '1px solid #e5e7eb'}}>
                        <button type="button" className="btn-form-back" onClick={() => navigate('/view/operacional/listOperacional')} disabled={saving}>
                            Cancelar
                        </button>
                        <button type="button" className="btn-form-save" onClick={() => handleSave(false)} disabled={saving || loading}>
                            {saving ? 'Salvando...' : 'Salvar'}
                        </button>
                        <button type="button" className="btnstop" onClick={() => handleSave(true)} disabled={saving || loading} title="Salvar e continuar editando">
                            Salvar e Continuar
                        </button>
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}