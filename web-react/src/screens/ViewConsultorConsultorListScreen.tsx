import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import { Tabs } from '../Tabs';

const CONSULTOR_COLUMNS: DataTableColumn[] = [
  { key: 'usuarioId', label: 'Usuário' },
];

const CONTRATO_COLUMNS: DataTableColumn[] = [
  { key: 'pessoaId', label: 'Pessoa' },
  { key: 'curriculoId', label: 'Curso' },
  { key: 'unidadeId', label: 'Unidade' },
  { key: 'valorParcelas', label: 'Valor' },
  { key: 'ativo', label: 'Ativo' },
  { key: 'data', label: 'Data' },
];

const MATRICULA_COLUMNS: DataTableColumn[] = [
  { key: 'contratoId', label: 'Contrato' },
  { key: 'oferecimentoComponenteCurricularId', label: 'Oferecimento' },
  { key: 'formaPagamentoId', label: 'Forma de Pagamento' },
  { key: 'status', label: 'Status' },
  { key: 'data', label: 'Data' },
];

const MATERIAL_COLUMNS: DataTableColumn[] = [
  { key: 'dataCompra', label: 'Data Compra' },
  { key: 'unidadeId', label: 'Unidade' },
  { key: 'pessoaId', label: 'Pessoa' },
  { key: 'tipoFormaPagamento', label: 'Forma de Pagamento' },
  { key: 'valor', label: 'Valor' },
  { key: 'quantidade', label: 'Quantidade' },
];

const VALORES_COLUMNS: DataTableColumn[] = [
  { key: 'curriculoId', label: 'Curso' },
  { key: 'valor', label: 'Valor' },
  { key: 'juros', label: 'Juros' },
  { key: 'multa', label: 'Multa' },
  { key: 'descontoCarne', label: 'Desconto Carne' },
  { key: 'cobraRematricula', label: 'Cobra Rematrícula' },
];

export default function ViewConsultorConsultorListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Consultor</h1>
        <Tabs
          tabs={[
            {
              key: 'consultor',
              label: 'Consultor',
              content: <DataTable path="/api/comercial/consultor" columns={CONSULTOR_COLUMNS} />,
            },
            {
              key: 'tabContrato',
              label: 'Contrato',
              content: <DataTable path="/api/educacao/contrato" columns={CONTRATO_COLUMNS} />,
            },
            {
              key: 'tabMatricula',
              label: 'Matrícula',
              content: <DataTable path="/api/educacao/matricula" columns={MATRICULA_COLUMNS} />,
            },
            {
              key: 'tabRematricula',
              label: 'Rematrícula',
              content: <DataTable path="/api/educacao/matricula" columns={MATRICULA_COLUMNS} />,
            },
            {
              key: 'tabMaterial',
              label: 'Material',
              content: <DataTable path="/api/estoque/venda-produto" columns={MATERIAL_COLUMNS} />,
            },
            {
              key: 'tabValores',
              label: 'Valores',
              content: <DataTable path="/api/educacao/valor-curso" columns={VALORES_COLUMNS} />,
            },
          ]}
        />
      </main>
    </PermissionGate>
  );
}
