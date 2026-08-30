import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';
import {Wizard} from '../../shared/components/Wizard';

export default function ViewTurmaFormAjusteCalendarioListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Ajuste Calendario</h1>
                <div className="div_form">
                    <div className="form-title">Ajuste de CalendÃ¡rio</div>
                    <div className="table_form">
                        <Wizard
                            steps={[
                                {
                                    key: 'turma',
                                    label: 'Turma',
                                    content: (
                                        <>
                                            <p className="master-detail-empty">Selecione a turma que terÃ¡ o calendÃ¡rio
                                                ajustado.</p>
                                            <DataTable path="/api/view/turma/formAjusteCalendario"/>
                                        </>
                                    ),
                                },
                                {
                                    key: 'ajuste',
                                    label: 'Ajuste',
                                    content: <p className="master-detail-empty">Informe os ajustes de dias e horÃ¡rios de
                                        aula.</p>,
                                },
                                {
                                    key: 'confirmacao',
                                    label: 'ConfirmaÃ§Ã£o',
                                    nextLabel: 'Aplicar',
                                    content: <p className="master-detail-empty">Revise e aplique o ajuste de
                                        calendÃ¡rio.</p>,
                                },
                            ]}
                        />
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
