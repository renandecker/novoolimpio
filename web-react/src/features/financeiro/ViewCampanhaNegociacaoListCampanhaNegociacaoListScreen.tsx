import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import type {ApiItem} from '../../shared/types/index';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const COLUMNS: DataTableColumn[] = [
    {key: 'descricao', label: 'Descrição'},
    {key: 'tipoCampanha', label: 'Tipo Campanha', render: (item) => {
        const tipos: Record<string, string> = {
            'PARCELA_ZERO_ATRITO': 'Parcela Zero Atrito',
            'TROCA_POR_DESCONTO': 'Troca por Desconto',
            'SEGUNDA_CHANCE': 'Segunda Chance',
            'QUITA_FACIL': 'Quita Fáci',
        };
        return tipos[asRecord(item)['tipoCampanha'] as string] ?? asRecord(item)['tipoCampanha'];
    }},
    {key: 'objetivo', label: 'Objetivo', render: (item) => {
        const objetivos: Record<string, string> = {
            'atrasos_recentes': 'Atrasos Recentes',
            'liquidacao_rapida': 'Liquidação Rápida',
            'prevencao_inadimplencia': 'Prevenção Inadimplência',
            'engajamento_retencao': 'Engajamento e Retenção',
        };
        return objetivos[asRecord(item)['objetivo'] as string] ?? asRecord(item)['objetivo'];
    }},
    {key: 'percentual', label: 'Percentual (%)'},
    {key: 'tipoOferta', label: 'Tipo Oferta', render: (item) => {
        const ofertas: Record<string, string> = {
            'isenacao_juros_multa': 'Isenção Juros/Multa',
            'desconto_percentual': 'Desconto Percentual',
            'reagendamento_sem_multa': 'Reagendamento s/ Multa',
            'quittar_1_desbloqueie_beneficio_proximo_mes': 'Quita 1 + Benefício Próx. Mês',
        };
        return ofertas[asRecord(item)['tipoOferta'] as string] ?? asRecord(item)['tipoOferta'];
    }},
    {key: 'ativo', label: 'Status'},
    {key: 'dataFim', label: 'Data Fim'},
];

export default function ViewCampanhaNegociacaoListCampanhaNegociacaoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Campanhas de Negociação</h1>
                <DataTable 
                    path="/api/financeiro/campanha-negociacao" 
                    columns={COLUMNS}
                    maxMainColumns={COLUMNS.length}
                    module="financeiro"
                />
            </main>
        </PermissionGate>
    );
}