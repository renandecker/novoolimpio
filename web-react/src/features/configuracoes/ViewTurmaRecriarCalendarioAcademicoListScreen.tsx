import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';
import {Wizard} from '../../shared/components/Wizard';

export default function ViewTurmaRecriarCalendarioAcademicoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Recriar Calendario Academico</h1>
                <div className="div_form">
                    <div className="form-title">Recriar CalendÃ¡rio AcadÃªmico</div>
                    <div className="table_form">
                        <Wizard
                            steps={[
                                {
                                    key: 'turma',
                                    label: 'Turma',
                                    content: (
                                        <>
                                            <p className="master-detail-empty">Selecione a turma do calendÃ¡rio
                                                acadÃªmico.</p>
                                            <DataTable path="/api/view/turma/recriarCalendarioAcademico"/>
                                        </>
                                    ),
                                },
                                {
                                    key: 'periodo',
                                    label: 'PerÃ­odo',
                                    content: <p className="master-detail-empty">Informe o perÃ­odo letivo para
                                        recriaÃ§Ã£o.</p>,
                                },
                                {
                                    key: 'confirmacao',
                                    label: 'ConfirmaÃ§Ã£o',
                                    nextLabel: 'Recriar',
                                    content: <p className="master-detail-empty">Revise e recrie o calendÃ¡rio
                                        acadÃªmico.</p>,
                                },
                            ]}
                        />
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}
