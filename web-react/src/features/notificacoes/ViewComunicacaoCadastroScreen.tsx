import {useState} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {PermissionGate} from '../../shared/services/permissions';
import {MasterDetail} from '../../shared/components/MasterDetail';
import {Tabs} from '../../shared/components/Tabs';
import {FormField} from '../../shared/components/FormField';
import {Swal} from '../../shared/components/swal';
import {api} from '../../shared/services/api';
import {
    UNIDADE_SOURCE,
    UNIDADE_COLUMNS,
    UNIDADE_SEARCH,
    PESSOA_SOURCE,
    PESSOA_COLUMNS,
    PESSOA_SEARCH,
    USUARIO_SOURCE,
    USUARIO_COLUMNS,
    USUARIO_SEARCH,
    TURMA_SOURCE,
    TURMA_COLUMNS,
    TURMA_SEARCH,
    CURSO_SOURCE,
    CURSO_COLUMNS,
    CURSO_SEARCH,
    PROFESSOR_SOURCE,
    PROFESSOR_COLUMNS,
    PROFESSOR_SEARCH,
    ALUNO_SOURCE,
    ALUNO_COLUMNS,
    ALUNO_SEARCH,
} from '../../shared/services/masterDetailSources';
import type {ApiItem} from '../../shared/types/index';

interface ComunicacaoFormData {
    titulo: string;
    mensagem: string;
    tipo: string;
    categoria: string;
    link: string;
    canalSistema: boolean;
    canalMobile: boolean;
    canalEmail: boolean;
    canalTelegram: boolean;
    canalSms: boolean;
    canalWhatsapp: boolean;
    canalNotificacao: boolean;
    unidadesIds: number[];
    cursosIds: number[];
    turmasIds: number[];
    pessoasIds: number[];
    usuariosIds: number[];
    professoresIds: number[];
    alunosIds: number[];
}

const initialFormData: ComunicacaoFormData = {
    titulo: '',
    mensagem: '',
    tipo: 'GERAL',
    categoria: 'COMUNICACAO',
    link: '',
    canalSistema: true,
    canalMobile: false,
    canalEmail: false,
    canalTelegram: false,
    canalSms: false,
    canalWhatsapp: false,
    canalNotificacao: true,
    unidadesIds: [],
    cursosIds: [],
    turmasIds: [],
    pessoasIds: [],
    usuariosIds: [],
    professoresIds: [],
    alunosIds: [],
};

const TIPOS_COMUNICACAO = [
    {value: 'GERAL', label: 'Geral'},
    {value: 'AVISO', label: 'Aviso'},
    {value: 'ALERTA', label: 'Alerta'},
    {value: 'INFORMATIVO', label: 'Informativo'},
    {value: 'URGENTE', label: 'Urgente'},
    {value: 'EVENTO', label: 'Evento'},
    {value: 'MANUTENCAO', label: 'Manutenção'},
];

const CATEGORIAS = [
    {value: 'COMUNICACAO', label: 'Comunicação'},
    {value: 'ACADEMICO', label: 'Acadêmico'},
    {value: 'FINANCEIRO', label: 'Financeiro'},
    {value: 'ADMINISTRATIVO', label: 'Administrativo'},
    {value: 'EVENTOS', label: 'Eventos'},
    {value: 'SISTEMA', label: 'Sistema'},
];

export default function ViewComunicacaoCadastroScreen() {
    const [formData, setFormData] = useState<ComunicacaoFormData>(initialFormData);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);
    const [cursos, setCursos] = useState<ApiItem[]>([]);
    const [turmas, setTurmas] = useState<ApiItem[]>([]);
    const [pessoas, setPessoas] = useState<ApiItem[]>([]);
    const [usuarios, setUsuarios] = useState<ApiItem[]>([]);
    const [professores, setProfessores] = useState<ApiItem[]>([]);
    const [alunos, setAlunos] = useState<ApiItem[]>([]);
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: async (data: ComunicacaoFormData) => {
            const response = await api.post('/api/basico/comunicacao', data);
            return response.data;
        },
        onSuccess: () => {
            Swal.fire({icon: 'success', title: 'Sucesso', text: 'Comunicação cadastrada com sucesso!'});
            setFormData(initialFormData);
            setUnidades([]);
            setCursos([]);
            setTurmas([]);
            setPessoas([]);
            setUsuarios([]);
            setProfessores([]);
            setAlunos([]);
            queryClient.invalidateQueries({queryKey: ['comunicacoes']});
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || 'Erro ao cadastrar comunicação';
            Swal.fire({icon: 'error', title: 'Erro', text: msg});
        },
    });

    const enviarMutation = useMutation({
        mutationFn: async (id: number) => {
            const response = await api.post(`/api/basico/comunicacao/${id}/enviar`);
            return response.data;
        },
        onSuccess: () => {
            Swal.fire({icon: 'success', title: 'Sucesso', text: 'Comunicação enviada para a fila de notificações!'});
            queryClient.invalidateQueries({queryKey: ['comunicacoes']});
        },
        onError: (error: any) => {
            const msg = error?.response?.data?.message || error?.message || 'Erro ao enviar comunicação';
            Swal.fire({icon: 'error', title: 'Erro', text: msg});
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.titulo.trim()) {
            Swal.fire({icon: 'warning', title: 'Atenção', text: 'O título é obrigatório'});
            return;
        }
        const payload = {
            ...formData,
            unidadesIds: unidades.map(u => Number(u.id)),
            cursosIds: cursos.map(c => Number(c.id)),
            turmasIds: turmas.map(t => Number(t.id)),
            pessoasIds: pessoas.map(p => Number(p.id)),
            usuariosIds: usuarios.map(u => Number(u.id)),
            professoresIds: professores.map(p => Number(p.id)),
            alunosIds: alunos.map(a => Number(a.id)),
        };
        createMutation.mutate(payload);
    };

    const handleEnviar = (id: number) => {
        enviarMutation.mutate(id);
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Cadastro de Comunicação</h1>
                <div className="comunicacao-cadastro">
                    <form onSubmit={handleSubmit} className="comunicacao-form">
                        <div className="form-grid">
                            <FormField label="Título *" name="titulo" required>
                                <input
                                    type="text"
                                    value={formData.titulo}
                                    onChange={e => setFormData({...formData, titulo: e.target.value})}
                                    placeholder="Título da comunicação"
                                    maxLength={255}
                                />
                            </FormField>

                            <FormField label="Mensagem" name="mensagem">
                                <textarea
                                    value={formData.mensagem}
                                    onChange={e => setFormData({...formData, mensagem: e.target.value})}
                                    placeholder="Mensagem da comunicação"
                                    rows={4}
                                />
                            </FormField>

                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
                                <FormField label="Tipo" name="tipo">
                                    <select
                                        value={formData.tipo}
                                        onChange={e => setFormData({...formData, tipo: e.target.value})}
                                    >
                                        {TIPOS_COMUNICACAO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </FormField>

                                <FormField label="Categoria" name="categoria">
                                    <select
                                        value={formData.categoria}
                                        onChange={e => setFormData({...formData, categoria: e.target.value})}
                                    >
                                        {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                                    </select>
                                </FormField>
                            </div>

                            <FormField label="Link (opcional)" name="link">
                                <input
                                    type="url"
                                    value={formData.link}
                                    onChange={e => setFormData({...formData, link: e.target.value})}
                                    placeholder="https://exemplo.com"
                                />
                            </FormField>

                            <FormField label="Canais de Notificação" name="canais">
                                <fieldset style={{border: '1px solid #ddd', borderRadius: '8px', padding: '16px'}}>
                                    <legend style={{fontWeight: 600, marginBottom: '12px', padding: '0 8px'}}>Selecione os canais de entrega</legend>
                                    <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px'}}>
                                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                            <input
                                                type="checkbox"
                                                checked={formData.canalSistema}
                                                onChange={e => setFormData({...formData, canalSistema: e.target.checked})}
                                            />
                                            <span>Sistema (Web)</span>
                                        </label>
                                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                            <input
                                                type="checkbox"
                                                checked={formData.canalMobile}
                                                onChange={e => setFormData({...formData, canalMobile: e.target.checked})}
                                            />
                                            <span>Mobile (Push)</span>
                                        </label>
                                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                            <input
                                                type="checkbox"
                                                checked={formData.canalNotificacao}
                                                onChange={e => setFormData({...formData, canalNotificacao: e.target.checked})}
                                            />
                                            <span>Centro de Notificações (Sininho)</span>
                                        </label>
                                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                            <input
                                                type="checkbox"
                                                checked={formData.canalEmail}
                                                onChange={e => setFormData({...formData, canalEmail: e.target.checked})}
                                            />
                                            <span>E-mail</span>
                                        </label>
                                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                            <input
                                                type="checkbox"
                                                checked={formData.canalTelegram}
                                                onChange={e => setFormData({...formData, canalTelegram: e.target.checked})}
                                            />
                                            <span>Telegram</span>
                                        </label>
                                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                            <input
                                                type="checkbox"
                                                checked={formData.canalSms}
                                                onChange={e => setFormData({...formData, canalSms: e.target.checked})}
                                            />
                                            <span>SMS</span>
                                        </label>
                                        <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
                                            <input
                                                type="checkbox"
                                                checked={formData.canalWhatsapp}
                                                onChange={e => setFormData({...formData, canalWhatsapp: e.target.checked})}
                                            />
                                            <span>WhatsApp</span>
                                        </label>
                                    </div>
                                </fieldset>
                            </FormField>
                        </div>

                        <div className="comunicacao-destinatarios">
                            <h2>Destinatários</h2>
                            <Tabs
                                tabs={[
                                    {
                                        key: 'unidade',
                                        label: 'Unidade(s)',
                                        content: (
                                            <MasterDetail
                                                label="Unidades"
                                                source={UNIDADE_SOURCE}
                                                valueKey="id"
                                                searchKeys={UNIDADE_SEARCH}
                                                columns={UNIDADE_COLUMNS}
                                                items={unidades}
                                                onChange={setUnidades}
                                            />
                                        ),
                                    },
                                    {
                                        key: 'curso',
                                        label: 'Curso(s)',
                                        content: (
                                            <MasterDetail
                                                label="Cursos"
                                                source={CURSO_SOURCE}
                                                valueKey="id"
                                                searchKeys={CURSO_SEARCH}
                                                columns={CURSO_COLUMNS}
                                                items={cursos}
                                                onChange={setCursos}
                                            />
                                        ),
                                    },
                                    {
                                        key: 'turma',
                                        label: 'Turma(s)',
                                        content: (
                                            <MasterDetail
                                                label="Turmas"
                                                source={TURMA_SOURCE}
                                                valueKey="id"
                                                searchKeys={TURMA_SEARCH}
                                                columns={TURMA_COLUMNS}
                                                items={turmas}
                                                onChange={setTurmas}
                                            />
                                        ),
                                    },
                                    {
                                        key: 'pessoa',
                                        label: 'Pessoa(s)',
                                        content: (
                                            <MasterDetail
                                                label="Pessoas"
                                                source={PESSOA_SOURCE}
                                                valueKey="id"
                                                searchKeys={PESSOA_SEARCH}
                                                columns={PESSOA_COLUMNS}
                                                items={pessoas}
                                                onChange={setPessoas}
                                            />
                                        ),
                                    },
                                    {
                                        key: 'usuario',
                                        label: 'Usuário(s)',
                                        content: (
                                            <MasterDetail
                                                label="Usuários"
                                                source={USUARIO_SOURCE}
                                                valueKey="id"
                                                searchKeys={USUARIO_SEARCH}
                                                columns={USUARIO_COLUMNS}
                                                items={usuarios}
                                                onChange={setUsuarios}
                                            />
                                        ),
                                    },
                                    {
                                        key: 'professor',
                                        label: 'Professor(es)',
                                        content: (
                                            <MasterDetail
                                                label="Professores"
                                                source={PROFESSOR_SOURCE}
                                                valueKey="id"
                                                searchKeys={PROFESSOR_SEARCH}
                                                columns={PROFESSOR_COLUMNS}
                                                items={professores}
                                                onChange={setProfessores}
                                            />
                                        ),
                                    },
                                    {
                                        key: 'aluno',
                                        label: 'Aluno(s)',
                                        content: (
                                            <MasterDetail
                                                label="Alunos"
                                                source={ALUNO_SOURCE}
                                                valueKey="id"
                                                searchKeys={ALUNO_SEARCH}
                                                columns={ALUNO_COLUMNS}
                                                items={alunos}
                                                onChange={setAlunos}
                                            />
                                        ),
                                    },
                                ]}
                            />
                        </div>

                        <div className="comunicacao-actions" style={{display: 'flex', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #eee'}}>
                            <button
                                type="submit"
                                disabled={createMutation.isPending}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: createMutation.isPending ? 'not-allowed' : 'pointer',
                                    fontWeight: 600,
                                    opacity: createMutation.isPending ? 0.7 : 1,
                                }}
                            >
                                {createMutation.isPending ? 'Salvando...' : 'Salvar Comunicação'}
                            </button>
                        </div>
                    </form>

                    {(createMutation.isSuccess || createMutation.data) && (
                        <div className="comunicacao-enviar" style={{marginTop: '24px', padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd'}}>
                            <h3>Comunicação salva com sucesso!</h3>
                            <p>ID: {createMutation.data?.id}</p>
                            <button
                                type="button"
                                onClick={() => handleEnviar(createMutation.data!.id)}
                                disabled={enviarMutation.isPending}
                                style={{
                                    padding: '12px 24px',
                                    backgroundColor: '#10b981',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: enviarMutation.isPending ? 'not-allowed' : 'pointer',
                                    fontWeight: 600,
                                    opacity: enviarMutation.isPending ? 0.7 : 1,
                                }}
                            >
                                {enviarMutation.isPending ? 'Enviando...' : 'Enviar para Fila de Notificações'}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </PermissionGate>
    );
}