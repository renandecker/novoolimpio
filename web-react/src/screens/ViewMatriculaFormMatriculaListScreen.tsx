import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import { Wizard } from '../Wizard';

const MATRICULA_COLUMNS: DataTableColumn[] = [
  { key: 'contratoId', label: 'Contrato' },
  { key: 'oferecimentoComponenteCurricularId', label: 'Oferecimento' },
  { key: 'formaPagamentoId', label: 'Forma de Pagamento' },
  { key: 'status', label: 'Status' },
  { key: 'data', label: 'Data' },
  { key: 'mediaFinal', label: 'Média Final' },
  { key: 'percentualPresenca', label: '% Presença' },
];

const MATERIAL_COLUMNS: DataTableColumn[] = [
  { key: 'controleEstoqueId', label: 'Controle Estoque' },
  { key: 'matriculaId', label: 'Matrícula' },
  { key: 'quantidadeCurso', label: 'Qtd. Curso' },
  { key: 'quantidadeCompra', label: 'Qtd. Compra' },
];

const VALORES_COLUMNS: DataTableColumn[] = [
  { key: 'curriculoId', label: 'Curso' },
  { key: 'valor', label: 'Valor' },
  { key: 'juros', label: 'Juros' },
  { key: 'multa', label: 'Multa' },
  { key: 'descontoCarne', label: 'Desconto Carne' },
  { key: 'cobraRematricula', label: 'Cobra Rematrícula' },
  { key: 'data', label: 'Data' },
];

export default function ViewMatriculaFormMatriculaListScreen() {
  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Matricula</h1>
        <div className="div_form">
          <div className="form-title">Matrícula</div>
          <div className="table_form">
            <Wizard
              steps={[
                {
                  key: 'tabMatricula',
                  label: 'Matrícula',
                  content: <DataTable path="/api/educacao/matricula" columns={MATRICULA_COLUMNS} />,
                },
                {
                  key: 'tabMaterial',
                  label: 'Material',
                  content: <DataTable path="/api/educacao/material-escolar-matricula" columns={MATERIAL_COLUMNS} />,
                },
                {
                  key: 'tabValores',
                  label: 'Valores',
                  nextLabel: 'Salvar',
                  content: <DataTable path="/api/educacao/valor-curso" columns={VALORES_COLUMNS} />,
                },
              ]}
            />
          </div>
        </div>
      </main>
    </PermissionGate>
  );
}
