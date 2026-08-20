import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';
import {Wizard} from '../Wizard';

export default function ViewCancelamentoColunasPreCancelamentoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Colunas Pre Cancelamento</h1>
                <div className="div_form">
                    <div className="form-title">Cancelamento</div>
                    <div className="table_form">
                        <Wizard
                            steps={[
                                {
                                    key: 'selecao',
                                    label: 'Seleção',
                                    content: (
                                        <>
                                            <p className="master-detail-empty">Selecione as matrículas que serão
                                                canceladas.</p>
                                            <DataTable path="/api/view/cancelamento/colunasPreCancelamento"/>
                                        </>
                                    ),
                                },
                                {
                                    key: 'confirmacao',
                                    label: 'Confirmação',
                                    content: <p className="master-detail-empty">Revise as matrículas selecionadas e
                                        confirme o cancelamento.</p>,
                                },
                                {
                                    key: 'conclusao',
                                    label: 'Conclusão',
                                    nextLabel: 'Finalizar',
                                    content: <p className="master-detail-empty">Cancelamento efetuado com sucesso.</p>,
                                },
                            ]}
                        />
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
