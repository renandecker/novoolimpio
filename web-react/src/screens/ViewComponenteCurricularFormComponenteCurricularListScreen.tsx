import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import { Tabs } from '../Tabs';

const COMPONENTE_COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'sucinto', label: 'Sucinto' },
  { key: 'creditos', label: 'Créditos' },
  { key: 'cargaHoraria', label: 'Carga Horária' },
  { key: 'tipoSalaId', label: 'Tipo Sala' },
  { key: 'ementa', label: 'Ementa' },
];

const HABILIDADE_COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'habilidadeCompetencia', label: 'Habilidade e Competência' },
];

const BASE_TECNOLOGICA_COLUMNS: DataTableColumn[] = [
  { key: 'descricao', label: 'Descrição' },
  { key: 'nome', label: 'Nome' },
];

const CRONOGRAMA_COLUMNS: DataTableColumn[] = [
  { key: 'componenteCurricularId', label: 'Componente Curricular' },
  { key: 'numeroAula', label: 'Número Aula' },
  { key: 'assunto', label: 'Assunto' },
  { key: 'descricao', label: 'Descrição' },
  { key: 'ordem', label: 'Ordem' },
];

const REFERENCIA_COLUMNS: DataTableColumn[] = [
  { key: 'autor', label: 'Autor' },
  { key: 'titulo', label: 'Título' },
  { key: 'volume', label: 'Volume' },
];

export default function ViewComponenteCurricularFormComponenteCurricularListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Componente Curricular</h1>
        <Tabs
          tabs={[
            {
              key: 'componenteCurricular',
              label: 'Componente Curricular',
              content: <DataTable path="/api/educacao/componente-curricular" columns={COMPONENTE_COLUMNS} />,
            },
            {
              key: 'habilidadeCompetencia',
              label: 'Habilidade e Competência',
              content: <DataTable path="/api/educacao/componente-curricular" columns={HABILIDADE_COLUMNS} />,
            },
            {
              key: 'baseTecnologica',
              label: 'Base Tecnológica',
              content: <DataTable path="/api/educacao/base-tecnologica" columns={BASE_TECNOLOGICA_COLUMNS} />,
            },
            {
              key: 'cronograma',
              label: 'Plano de Aula',
              content: <DataTable path="/api/educacao/cronograma-componente-curricular" columns={CRONOGRAMA_COLUMNS} />,
            },
            {
              key: 'referenciaBibliografica',
              label: 'Referência Bibliográfica',
              content: <DataTable path="/api/educacao/referencia-bibliografica" columns={REFERENCIA_COLUMNS} />,
            },
          ]}
        />
      </main>
    </PermissionGate>
  );
}
