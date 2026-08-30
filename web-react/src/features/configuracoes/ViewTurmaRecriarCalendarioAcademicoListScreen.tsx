import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';
import {Wizard} from '../Wizard';

export default function ViewTurmaRecriarCalendarioAcademicoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Recriar Calendario Academico</h1>
                <div className="div_form">
                    <div className="form-title">Recriar Calendário Acadêmico</div>
                    <div className="table_form">
                        <Wizard
                            steps={[
                                {
                                    key: 'turma',
                                    label: 'Turma',
                                    content: (
                                        <>
                                            <p className="master-detail-empty">Selecione a turma do calendário
                                                acadêmico.</p>
                                            <DataTable path="/api/view/turma/recriarCalendarioAcademico"/>
                                        </>
                                    ),
                                },
                                {
                                    key: 'periodo',
                                    label: 'Período',
                                    content: <p className="master-detail-empty">Informe o período letivo para
                                        recriação.</p>,
                                },
                                {
                                    key: 'confirmacao',
                                    label: 'Confirmação',
                                    nextLabel: 'Recriar',
                                    content: <p className="master-detail-empty">Revise e recrie o calendário
                                        acadêmico.</p>,
                                },
                            ]}
                        />
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
