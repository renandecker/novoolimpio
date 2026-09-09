import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {PermissionGate} from '../../shared/services/permissions';
import {listRegrasNotificacoes, createRegraNotificacao, deleteRegraNotificacao} from '../../features/notificacoes/regrasNotificacoes';
import '../../features/notificacoes/NotificacaoScreen.css';

const PAGE_SIZES = [10, 20, 50];

export default function ViewRegraNotificacaoListRegraListScreen() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(PAGE_SIZES[0]);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [regraForm, setRegraForm] = useState<{
        nome: string;
        descricao: string;
        tipoRegra: string;
        canal: string;
        destinatario: string;
        destinatarioProfessor: boolean;
        valorLimite: number;
    }>({
        nome: '',
        descricao: '',
        tipoRegra: '',
        canal: 'EMAIL',
        destinatario: 'ALUNO',
        destinatarioProfessor: false,
        valorLimite: 0,
    });

    const query = useQuery({
        queryKey: ['regras', 'list', page, size],
        queryFn: () => listRegrasNotificacoes(page, size),
    });

    const markRead = useMutation({
        mutationFn: () => { /* não usado aqui */ },
    });

    const createMutation = useMutation({
        mutationFn: createRegraNotificacao,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['regras', 'list']});
            setModalOpen(false);
            setRegraForm({
                nome: '',
                descricao: '',
                tipoRegra: '',
                canal: 'EMAIL',
                destinatario: 'ALUNO',
                destinatarioProfessor: false,
                valorLimite: 0,
            });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteRegraNotificacao(id),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['regras', 'list']});
        },
    });

    const items = query.data?.content ?? [];
    const totalElements = query.data?.totalElements ?? 0;
    const totalPages = Math.max(1, query.data?.totalPages ?? 0);

    const handleDelete = (id: number) => {
        setModalOpen(false);
        deleteMutation.mutate(id);
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Regras de Notificação</h1>
                <div style={{marginBottom: '16px'}}>
                    <button
                        style={{marginRight: '8px'}}
                        onClick={() => setModalOpen(true)}
                    >
                        Criar Regra
                    </button>
                </div>

                <div className="notificacao-list">
                    {query.isLoading && items.length === 0 ? (
                        <p>Carregando...</p>
                    ) : items.length === 0 ? (
                        <div>
                            <p>Nenhuma regra no momento.</p>
                        </div>
                    ) : (
                        items.map((regra) => (
                            <div
                                key={regra.id}
                                style={{
                                    border: '1px solid #e0e0e0',
                                    borderRadius: '4px',
                                    padding: '12px',
                                    marginBottom: '12px',
                                    backgroundColor: '#fafafa',
                                }}
                            >
                                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                    <div style={{flex: 1}}>
                                        <div style={{fontWeight: 'bold', fontSize: '14px'}}>{regra.nome}</div>
                                        {regra.descricao && (
                                            <div style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>
                                                {regra.descricao}
                                            </div>
                                        )}
                                        <div style={{fontSize: '11px', color: '#888', marginTop: '4px'}}>
                                            Tipo: {regra.tipoRegra} | Canal: {regra.canal}
                                        </div>
                                        {regra.destinatario && (
                                            <div style={{fontSize: '11px', color: '#888', marginTop: '4px'}}>
                                                Destinatário: {regra.destinatario}
                                            </div>
                                        )}
                                        {regra.destinatarioProfessor && (
                                            <div style={{fontSize: '11px', color: '#888', marginTop: '4px'}}>
                                                <span style={{color: '#d32f2f'}}>Professor também recebe</span>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{display: 'flex', gap: '8px', alignItems: 'flex-start'}}>
                                        <button
                                            onClick={() => setModalOpen(true)}
                                            style={{fontSize: '12px', padding: '4px 8px'}}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDelete(regra.id)}
                                            style={{
                                                color: '#ffffff',
                                                backgroundImage: 'linear-gradient(180deg, rgba(255, 83, 56, 0.47), #b93f2a)',
                                                border: 'none',
                                                borderRadius: '3px',
                                                padding: '4px 8px',
                                                fontSize: '12px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {!query.isLoading && items.length > 0 && (
                        <div className="notificacao-paginator" style={{marginTop: '16px', textAlign: 'center'}}>
                            <button
                                onClick={() => setPage((current) => Math.max(0, current - 1))}
                                disabled={page === 0 || query.isFetching}
                            >
                                Anterior
                            </button>
                            <span>
                                Página {page + 1} de {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                                disabled={page >= totalPages - 1 || query.isFetching}
                            >
                                Próxima
                            </button>
                            <label>
                                Por página
                                <select
                                    value={size}
                                    onChange={(event) => {
                                        setSize(Number(event.target.value));
                                        setPage(0);
                                    }}
                                >
                                    {PAGE_SIZES.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </label>
                            <span>Total: {totalElements}</span>
                        </div>
                    )}
                </div>

                {/* Modal de criar/editar regra */}
                <div
                    id="regra-modal"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: '20px',
                    }}
                    visible={modalOpen}
                >
                    <div
                        style={{
                            backgroundColor: '#ffffff',
                            borderRadius: '12px',
                            boxShadow: '0 20px 40px rgba(29,32,37,0.25), 0 8px 16px rgba(29,32,37,0.15), 0 0 0 1px rgba(194,170,60,0.1)',
                            padding: '0',
                            minWidth: '380px',
                            maxWidth: '500px',
                            maxHeight: '85vh',
                            overflow: 'auto',
                            animation: 'modalSlideIn 0.25s ease-out',
                        }}
                    >
                        <div
                            style={{
                                padding: '16px 24px',
                                background: 'linear-gradient(135deg, #2f333b 0%, #24272e 100%)',
                                borderBottom: '3px solid #c2aa3c',
                                borderRadius: '12px 12px 0 0',
                            }}
                        >
                            <h2 style={{margin: 0, color: '#ffffff', fontSize: '16px', fontWeight: '600', letterSpacing: '0.3px'}}>
                                {editing ? 'Editar Regra' : 'Criar Regra'}
                            </h2>
                            <button
                                type="button"
                                style={{
                                    width: '32px',
                                    height: '32px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: 'rgba(255,255,255,0.1)',
                                    color: '#e8d27a',
                                    fontSize: '18px',
                                    lineHeight: '1',
                                    cursor: 'pointer',
                                    float: 'right',
                                }}
                                onClick={() => setModalOpen(false)}
                            >
                                &times;
                            </button>
                        </div>

                        <div style={{padding: '24px'}}>
                            <div style={{marginBottom: '16px'}}>
                                <label>Nome <span style={{color: '#a61b29'}}>*</span></label>
                                <input
                                    value={regraForm.nome}
                                    onChange={(e) => setRegraForm({...regraForm, nome: e.target.value})}
                                    style={{
                                        width: '100%',
                                        border: '1px solid #d3d3d3',
                                        borderRadius: '6px',
                                        padding: '10px 12px',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff',
                                        color: '#1d2025',
                                    }}
                                />
                            </div>

                            <div style={{marginBottom: '16px'}}>
                                <label>Descrição</label>
                                <textarea
                                    value={regraForm.descricao}
                                    onChange={(e) => setRegraForm({...regraForm, descricao: e.target.value})}
                                    style={{
                                        width: '100%',
                                        border: '1px solid #d3d3d3',
                                        borderRadius: '6px',
                                        padding: '10px 12px',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff',
                                        color: '#1d2025',
                                        minHeight: '80px',
                                    }}
                                />
                            </div>

                            <div style={{marginBottom: '16px'}}>
                                <label>Tipo Regra</label>
                                <select
                                    value={regraForm.tipoRegra}
                                    onChange={(e) => setRegraForm({...regraForm, tipoRegra: e.target.value})}
                                    style={{
                                        width: '100%',
                                        border: '1px solid #d3d3d3',
                                        borderRadius: '6px',
                                        padding: '10px 12px',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff',
                                        color: '#1d2025',
                                    }}
                                >
                                    <option value="vencido">Vencido</option>
                                    <option value="dias_a_vencer">Dias para Vencer</option>
                                    <option value="parcelas_proximas">Parcelas Próximas ao Vencimento</option>
                                    <option value="vencido_app">Vencido (App)</option>
                                    <option value="responsavel_unidade">Responsável Unidade</option>
                                </select>
                            </div>

                            <div style={{marginBottom: '16px'}}>
                                <label>Destinatário</label>
                                <select
                                    value={regraForm.destinatario}
                                    onChange={(e) => setRegraForm({...regraForm, destinatario: e.target.value})}
                                    style={{
                                        width: '100%',
                                        border: '1px solid #d3d3d3',
                                        borderRadius: '6px',
                                        padding: '10px 12px',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff',
                                        color: '#1d2025',
                                    }}
                                >
                                    <option value="ALUNO">Apenas aluno</option>
                                    <option value="PROFESSOR">Apenas professor</option>
                                    <option value="AMBOS">Professor e aluno</option>
                                </select>
                            </div>

                            <div style={{marginBottom: '16px'}}>
                                <label>Destinatário adicional (Professor)</label>
                                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                    <input
                                        type="checkbox"
                                        checked={regraForm.destinatarioProfessor}
                                        onChange={(e) => setRegraForm({...regraForm, destinatarioProfessor: e.target.checked})}
                                    />
                                    <span style={{fontSize: '13px', color: '#333'}}>Professor também recebe</span>
                                </div>
                            </div>

                            <div style={{marginBottom: '16px'}}>
                                <label>Valor Limite (dias)</label>
                                <input
                                    type="number"
                                    value={regraForm.valorLimite}
                                    onChange={(e) => setRegraForm({...regraForm, valorLimite: Number(e.target.value)})}
                                    style={{
                                        width: '100%',
                                        border: '1px solid #d3d3d3',
                                        borderRadius: '6px',
                                        padding: '10px 12px',
                                        fontSize: '14px',
                                        backgroundColor: '#ffffff',
                                        color: '#1d2025',
                                    }}
                                />
                                <small style={{fontSize: '11px', color: '#888', display: 'block', marginTop: '4px'}}>
                                    Em quantos dias antes/vencido notificar (ex: 3 para 3 dias antes)
                                </small>
                            </div>

                            <div style={{marginBottom: '16px'}}>
                                <label>Ativo</label>
                                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                    <input
                                        type="checkbox"
                                        checked={regraForm.ativo}
                                        onChange={(e) => setRegraForm({...regraForm, ativo: e.target.checked})}
                                    />
                                    <span style={{fontSize: '13px', color: '#333'}}>Ativar regra</span>
                                </div>
                            </div>

                            <div
                                style={{
                                    padding: '16px 24px',
                                    borderTop: '1px solid #f0f0f0',
                                    backgroundColor: '#fafafa',
                                    borderRadius: '0 0 12px 12px',
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    gap: '10px',
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    style={{
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '10px 20px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#ffffff',
                                        background: '#888',
                                        cursor: 'pointer',
                                    }}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (editing) {
                                            setModalOpen(false);
                                        } else {
                                            createMutation.mutate(regraForm);
                                        }
                                    }}
                                    style={{
                                        border: 'none',
                                        borderRadius: '6px',
                                        padding: '10px 20px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#ffffff',
                                        backgroundImage: 'linear-gradient(180deg, #337ab7, #265a88)',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {editing ? 'Salvar Alterações' : 'Salvar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
