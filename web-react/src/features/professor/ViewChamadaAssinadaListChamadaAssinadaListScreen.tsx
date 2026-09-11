import {api} from '../../shared/services/api';
import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn, type DataTableRowAction} from '../../shared/components/DataTable';
import type {ApiItem} from '../../shared/types/index';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

// Helper to get offered component curricular description
const getOferecimentoDesc = (item: ApiItem): string => {
    const record = asRecord(item);
    const oferta = record.oferecimentoComponenteCurricular;
    if (!oferta) return '';
    if (oferta.descricao) return String(oferta.descricao);
    if (oferta.nome) return String(oferta.nome);
    if (oferta.sucinto) return String(oferta.sucinto);
    if (oferta.grupo && oferta.grupo.nome) return String(oferta.grupo.nome);
    return '';
};

// Helper to get unidade
const getUnidade = (item: ApiItem): string => {
    const record = asRecord(item);
    const oferta = record.oferecimentoComponenteCurricular;
    if (!oferta) return '';
    if (oferta.unidade?.sucinto) return String(oferta.unidade.sucinto);
    if (oferta.unidade?.nome) return String(oferta.unidade.nome);
    return '';
};

// Helper to get curso
const getCurso = (item: ApiItem): string => {
    const record = asRecord(item);
    const oferta = record.oferecimentoComponenteCurricular;
    if (!oferta) return '';
    if (oferta.curriculo?.curso?.nome) return String(oferta.curriculo.curso.nome);
    return '';
};

// Helper to get componente curricular
const getComponenteCurricular = (item: ApiItem): string => {
    const record = asRecord(item);
    const oferta = record.oferecimentoComponenteCurricular;
    if (!oferta) return '';
    if (oferta.componenteCurricular?.descricao) return String(oferta.componenteCurricular.descricao);
    return '';
};

// Helper to get sala
const getSala = (item: ApiItem): string => {
    const record = asRecord(item);
    const oferta = record.oferecimentoComponenteCurricular;
    if (!oferta) return '';
    if (oferta.sala?.numero) return String(oferta.sala.numero);
    if (oferta.sala?.sucinto) return String(oferta.sala.sucinto);
    return '';
};

// Helper to get professor
const getProfessor = (item: ApiItem): string => {
    const record = asRecord(item);
    const oferta = record.oferecimentoComponenteCurricular;
    if (!oferta) return '';
    if (oferta.professorString) return String(oferta.professorString);
    if (oferta.professor?.pessoa?.pessoaFisica?.nome) return String(oferta.professor.pessoa.pessoaFisica.nome);
    return '';
};

// Helper to get inscritos/vagas
const getInscritosVagas = (item: ApiItem): string => {
    const record = asRecord(item);
    const oferta = record.oferecimentoComponenteCurricular;
    if (!oferta) return '';
    const inscritos = oferta.inscritos ?? 0;
    const vagas = oferta.vagas ?? 0;
    return `${inscritos} / ${vagas}`;
};

// Helper to get current user ID from session/localStorage
const getCurrentUserId = (): number | null => {
    // First try to get from localStorage directly (more complete than typed session)
    try {
        const stored = localStorage.getItem('olimpio.session');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Try multiple possible field names
            return parsed.usuarioId ?? parsed.usuario?.id ?? parsed.id ?? parsed.userId ?? parsed.user?.id ?? null;
        }
    } catch {
        // ignore
    }
    return null;
};

// Download PDF helper
const downloadBase64Pdf = (base64: string, fileName: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], {type: 'application/pdf'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

// Extra row actions for generating PDF reports
const extraRowActions: DataTableRowAction[] = [
    {
        key: 'downloadPaisagem',
        title: 'Download Paisagem',
        icon: <i className="fa fa-file-pdf-o" style={{color: '#fff'}} />,
        className: 'btnblue',
        permission: 'READ',
        onClick: async (item) => {
            const record = asRecord(item);
            const id = record.id;
            const usuarioId = getCurrentUserId();
            if (!usuarioId) {
                alert('Não foi possível obter o ID do usuário. Por favor, faça login novamente.');
                return;
            }
            try {
                const response = await api.post<string>(
                    `/api/educacao/chamada-assinada-impressa/gerar-chamada-assinada-paisagem`,
                    {},
                    {params: {ccId: id, usuarioId}}
                );
                downloadBase64Pdf(response.data, `chamada_assinada_paisagem_${id}.pdf`);
            } catch (error) {
                console.error('Erro ao gerar PDF Paisagem:', error);
                alert('Erro ao gerar PDF Paisagem');
            }
        },
    },
    {
        key: 'downloadRetrato',
        title: 'Download Retrato',
        icon: <i className="fa fa-file-text-o" style={{color: '#fff'}} />,
        className: 'btnblue',
        permission: 'READ',
        onClick: async (item) => {
            const record = asRecord(item);
            const id = record.id;
            const usuarioId = getCurrentUserId();
            if (!usuarioId) {
                alert('Não foi possível obter o ID do usuário. Por favor, faça login novamente.');
                return;
            }
            try {
                const response = await api.post<string>(
                    `/api/educacao/chamada-assinada-impressa/gerar-chamada-assinada-retrato`,
                    {},
                    {params: {ccId: id, usuarioId}}
                );
                downloadBase64Pdf(response.data, `chamada_assinada_retrato_${id}.pdf`);
            } catch (error) {
                console.error('Erro ao gerar PDF Retrato:', error);
                alert('Erro ao gerar PDF Retrato');
            }
        },
    },
    {
        key: 'informacoes',
        title: 'Informações',
        icon: <i className="fa fa-info-circle" />,
        className: 'btnyellow',
        permission: 'READ',
        onClick: async (item) => {
            // Open in new tab/window like the original
            window.open(`/api/educacao/professor/${asRecord(item).oferecimentoComponenteCurricular?.id}/informacoes`, '_blank');
        },
    },
];

const COLUMNS: DataTableColumn[] = [
    {
        key: 'id_oferecimento_componente_curricular',
        label: 'Turma',
        render: (item) => getOferecimentoDesc(item) || '#' + (item.id || '')
    },
    {key: 'sequencia', label: 'Sequência'},
    {key: 'inicio', label: 'Início', render: (item) => formatDate(asRecord(item).inicio)},
    {key: 'fim', label: 'Fim', render: (item) => formatDate(asRecord(item).fim)},
    {
        key: 'pendente',
        label: 'Pendente',
        render: (item) => (asRecord(item).pendente ? 'Sim' : 'Não'),
    },
    {key: 'quantidade', label: 'Qtde'},
    {
        key: 'aula_coringa',
        label: 'Aula Coringa',
        render: (item) => (asRecord(item).aula_coringa ? 'Sim' : 'Não'),
    },
    {key: 'unidade', label: 'Unidade', render: getUnidade},
    {key: 'curso', label: 'Curso', render: getCurso},
    {key: 'componenteCurricular', label: 'Componente Curricular', render: getComponenteCurricular},
    {key: 'sala', label: 'Sala', render: getSala},
    {key: 'professor', label: 'Professor', render: getProfessor},
    {key: 'inscritosVagas', label: 'Inscritos / Vagas', render: getInscritosVagas},
];

export default function ViewChamadaAssinadaListChamadaAssinadaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Chamada Assinada</h1>
                <DataTable
                    path="/api/view/chamadaAssinada/listChamadaAssinada"
                    columns={COLUMNS}
                    maxMainColumns={6}
                    extraRowActions={extraRowActions}
                    module="educacao"
                    outcome="view/chamadaAssinada/listChamadaAssinada"
                    hideUpdate={true}
                    hideDelete={true}
                    hideView={true}
                    hideCreate={true}
                />
            </main>
        </PermissionGate>
    );
}
