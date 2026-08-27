import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';

/**
 * Tela /view/turnoTrabalho/listTurnoTrabalho
 * Replica po:crud do extracted_aceso/src/main/webapp/view/turnoTrabalho/listTurnoTrabalho.xhtml
 * e colunas de colunasTurnoTrabalho.xhtml:
 *  - Id (80px)
 *  - Descrição (sortBy descricao)
 *  - Início  (sortBy inicio)
 *  - Fim     (sortBy fim)
 *  - Dia Semana (sortBy diaSemana.nome — via id_dia_semana_descricao enriquecido pelo ViewService)
 *
 * Filtros (TurnoTrabalhoController.getFilters()):
 *  id, id com intervalo, descricao, inicio, fim, diaSemana.nome
 * Controller: turnoTrabalhoController — colunas via colunasTurnoTrabalho.xhtml
 */
const COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'Id' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'inicio', label: 'Início' },
  { key: 'fim', label: 'Fim' },
  {
    key: 'id_dia_semana',
    label: 'Dia Semana',
    render: (item: any) =>
      item.id_dia_semana_descricao ?? item.diaSemanaNome ?? item.diaSemana_nome ?? (item.id_dia_semana ? `#${item.id_dia_semana}` : ''),
  },
];

export default function ViewTurnoTrabalhoListTurnoTrabalhoListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Turno Trabalho</h1>
        <DataTable
          path="/api/view/turnoTrabalho/listTurnoTrabalho"
          columns={COLUMNS}
          maxMainColumns={COLUMNS.length}
          editNavigateTo="/view/turnoTrabalho/formTurnoTrabalho"
          createNavigateTo="/view/turnoTrabalho/formTurnoTrabalho"
        />
      </main>
    </PermissionGate>
  );
}
