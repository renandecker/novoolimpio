import {DataTable, type DataTableColumn} from './DataTable';
import {Wizard} from './Wizard';

const REGRA_COLUMNS: DataTableColumn[] = [
    {key: 'descricao', label: 'Descrição'},
    {key: 'contratoId', label: 'Contrato'},
    {key: 'motivoId', label: 'Motivo'},
    {key: 'pessoaFuncionarioId', label: 'Funcionário'},
    {key: 'dataCriacao', label: 'Data Criação'},
    {key: 'ativo', label: 'Ativo'},
];

const CANCELAMENTO_COLUMNS: DataTableColumn[] = [
    {key: 'contratoId', label: 'Contrato'},
    {key: 'dataCancelamento', label: 'Data Cancelamento'},
    {key: 'motivoCancelamento', label: 'Motivo'},
    {key: 'status', label: 'Status'},
];

interface CancelamentoModalProps {
    onClose: () => void;
}

/**
 * Modal equivalent of <p:dialog widgetVar="cancelamento">…<p:wizard widgetVar="wizardCancelamento">
 * found in olimpio.zip (gestaoAluno.xhtml and listDesistente.xhtml). It is opened by an action
 * button ("Cancelamento de Contrato") — it is not a step embedded in a page-level wizard/tabs.
 */
export function CancelamentoModal({onClose}: CancelamentoModalProps) {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal form-modal" onClick={(event) => event.stopPropagation()}>
                <h2>Cancelamento</h2>
                <Wizard
                    completeLabel="Concluir"
                    onComplete={onClose}
                    steps={[
                        {
                            key: 'indivname',
                            label: 'Regra',
                            content: <DataTable path="/api/educacao/desistente" columns={REGRA_COLUMNS}/>,
                        },
                        {
                            key: 'cancelamento',
                            label: 'Cancelamento',
                            nextLabel: 'Finalizar',
                            content: <DataTable path="/api/educacao/matricula" columns={CANCELAMENTO_COLUMNS}/>,
                        },
                    ]}
                />
                <div className="modal-actions form-footer">
                    <button type="button" className="btn-form-back btnyellow" onClick={onClose}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}
