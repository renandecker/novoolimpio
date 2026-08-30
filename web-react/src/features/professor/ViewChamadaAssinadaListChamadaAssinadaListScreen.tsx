import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
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
    // Try various field names for the description
    if (oferta.descricao) return String(oferta.descricao);
    if (oferta.nome) return String(oferta.nome);
    if (oferta.sucinto) return String(oferta.sucinto);
    if (oferta.grupo && oferta.grupo.nome) return String(oferta.grupo.nome);
    return '';
};

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
        render: (item) => {
            const pendente = asRecord(item).pendente;
            // Use the offered component curricular's course info
            const oferta = asRecord(item).oferecimentoComponenteCurricular;
            if (oferta && oferta.componenteCurricular && oferta.componenteCurricular.curso) {
                return 'Sim';
            }
            return pendente ? 'Sim' : 'Não';
        },
    },
];

export default function ViewChamadaAssinadaListChamadaAssinadaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Chamada Assinada</h1>
                <DataTable path="/api/view/chamadaAssinada/listChamadaAssinada" columns={COLUMNS}
                           maxMainColumns={COLUMNS.length}/>
            </main>
        </PermissionGate>
    );
}
