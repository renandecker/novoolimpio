import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';
import {Wizard} from '../Wizard';

export default function ViewNapFormLigacaoNapListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Ligacao Nap</h1>
                <div className="div_form">
                    <div className="form-title">Ligação NAP</div>
                    <div className="table_form">
                        <Wizard
                            steps={[
                                {
                                    key: 'ligacao',
                                    label: 'Dados da Ligação',
                                    content: (
                                        <>
                                            <p className="master-detail-empty">Informações do contato e da ligação.</p>
                                            <DataTable path="/api/view/nap/formLigacaoNap"/>
                                        </>
                                    ),
                                },
                                {
                                    key: 'resultado',
                                    label: 'Resultado',
                                    content: <p className="master-detail-empty">Resultado da ligação NAP.</p>,
                                },
                                {
                                    key: 'historico',
                                    label: 'Histórico',
                                    nextLabel: 'Salvar',
                                    content: <p className="master-detail-empty">Histórico de ligações do contato.</p>,
                                },
                            ]}
                        />
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
