import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';
import {Wizard} from '../../shared/components/Wizard';

export default function ViewNapFormLigacaoNapListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Ligacao Nap</h1>
                <div className="div_form">
                    <div className="form-title">LigaÃ§Ã£o NAP</div>
                    <div className="table_form">
                        <Wizard
                            steps={[
                                {
                                    key: 'ligacao',
                                    label: 'Dados da LigaÃ§Ã£o',
                                    content: (
                                        <>
                                            <p className="master-detail-empty">InformaÃ§Ãµes do contato e da ligaÃ§Ã£o.</p>
                                            <DataTable path="/api/view/nap/formLigacaoNap"/>
                                        </>
                                    ),
                                },
                                {
                                    key: 'resultado',
                                    label: 'Resultado',
                                    content: <p className="master-detail-empty">Resultado da ligaÃ§Ã£o NAP.</p>,
                                },
                                {
                                    key: 'historico',
                                    label: 'HistÃ³rico',
                                    nextLabel: 'Salvar',
                                    content: <p className="master-detail-empty">HistÃ³rico de ligaÃ§Ãµes do contato.</p>,
                                },
                            ]}
                        />
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
