import { PermissionGate } from '../permissions';
import { DataTable, type DataTableColumn } from '../DataTable';
import { Wizard, useWizardData } from '../Wizard';
import { useApi } from '../api';

const CANCELAMENTO_REGRA_COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'nome', label: 'Nome' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'descricao', label: 'Descrição' },
];

const CANCELAMENTO_COLUMNS: DataTableColumn[] = [
  { key: 'id', label: 'ID' },
  { key: 'contratoId', label: 'Contrato' },
  { key: 'aluno', label: 'Aluno' },
  { key: 'curso', label: 'Curso' },
  { key: 'contratante', label: 'Contratante' },
  { key: 'unidade', label: 'Unidade' },
  { key: 'valorHoraAula', label: 'Valor Hora/Aula' },
  { key: 'valorTotal', label: 'Valor Total' },
  { key: 'valorDesconto', label: 'Desconto' },
  { key: 'valorComDesconto', label: 'Valor c/ Desconto' },
  { key: 'valorMulta', label: 'Multa' },
  { key: 'valorJuros', label: 'Juros' },
  { key: 'valorPago', label: 'Valor Pago' },
  { key: 'valorTotalPagar', label: 'Total a Pagar' },
];

const PARCELA_COLUMNS: DataTableColumn[] = [
  { key: 'parcela', label: 'Parcela' },
  { key: 'multa', label: 'Multa %' },
  { key: 'juros', label: 'Juros %' },
  { key: 'desconto', label: 'Desconto %' },
  { key: 'dataVencimento', label: 'Data Vencimento' },
  { key: 'valor', label: 'Valor' },
];

interface CancelamentoData {
  regraSelecionada: any;
  entity: {
    id?: number;
    contratoId?: number;
    regraCancelamentoId?: number;
    valorHoraAula?: number;
    valorTotal?: number;
    valorDesconto?: number;
    valorComDesconto?: number;
    valorMulta?: number;
    valorJuros?: number;
    valorPago?: number;
    valorTotalHorasDadas?: number;
    valorTotalPagar?: number;
    formaPagamento?: number;
    dataPrimeiraParcela?: string;
    diaParcela?: number;
  };
  parcelas: any[];
}

export default function ViewFinanceiroFormCancelamentoListScreen() {
  const { data, updateFields, updateField } = useWizardData<CancelamentoData>({
    regraSelecionada: null,
    entity: {},
    parcelas: [],
  });

  const { get: getRegras } = useApi('/api/financeiro/regra-cancelamento');
  const { post: saveCancelamento } = useApi('/api/financeiro/cancelamento');

  const validateStep1 = async (currentData: CancelamentoData) => {
    if (!currentData.regraSelecionada) return 'Selecione uma regra de cancelamento';
    return true;
  };

  const onEnterStep2 = async (currentData: CancelamentoData) => {
    // Load parcelas based on forma de pagamento
  };

  const validateStep2 = async (currentData: CancelamentoData) => {
    if (!currentData.entity.formaPagamento) return 'Selecione a forma de pagamento';
    if (!currentData.entity.dataPrimeiraParcela) return 'Defina a data da primeira parcela';
    if (currentData.entity.formaPagamento > 0 && !currentData.entity.diaParcela) {
      return 'Defina o dia das demais parcelas';
    }
    if (!currentData.parcelas || currentData.parcelas.length === 0) {
      return 'Configure as parcelas';
    }
    return true;
  };

  const handleComplete = async (formData: CancelamentoData) => {
    try {
      await saveCancelamento({
        ...formData.entity,
        regraCancelamentoId: formData.regraSelecionada?.id,
        parcelas: formData.parcelas,
      });
      alert('Cancelamento processado com sucesso!');
    } catch (error) {
      console.error('Erro ao processar cancelamento:', error);
      alert('Erro ao processar cancelamento');
    }
  };

  return (
    <PermissionGate permission="READ">
      <main>
        <h1>Form Cancelamento</h1>
        <div className="div_form">
          <div className="form-title">Cancelamento / Requerimento</div>
          <div className="table_form">
            <Wizard
              initialData={data}
              onDataChange={updateFields}
              steps={[
                {
                  key: 'regra',
                  label: 'Regra',
                  content: (
                    <div>
                      <DataTable path="/api/financeiro/regra-cancelamento" columns={CANCELAMENTO_REGRA_COLUMNS} />
                    </div>
                  ),
                  validate: validateStep1,
                },
                {
                  key: 'cancelamento',
                  label: 'Cancelamento',
                  nextLabel: 'Processar',
                  content: (
                    <div>
                      <DataTable path="/api/financeiro/cancelamento" columns={CANCELAMENTO_COLUMNS} />
                      <div style={{ marginTop: '20px' }}>
                        <h3>Parcelas</h3>
                        <DataTable path="/api/financeiro/parcela-cancelamento" columns={PARCELA_COLUMNS} />
                      </div>
                    </div>
                  ),
                  onEnter: onEnterStep2,
                  validate: validateStep2,
                },
              ]}
              onComplete={handleComplete}
            />
          </div>
        </div>
      </main>
    </PermissionGate>
  );
}