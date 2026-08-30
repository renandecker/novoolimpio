import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';
import {Tabs} from '../../shared/components/Tabs';

export default function ViewNapAbasinfoListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Abasinfo</h1>
                <div className="div_form">
                    <div className="form-title">NAP</div>
                    <div className="table_form">
                        <Tabs
                            tabs={[
                                {
                                    key: 'aluno',
                                    label: 'Aluno',
                                    content: <p className="master-detail-empty">Dados do aluno.</p>
                                },
                                {
                                    key: 'responsavel',
                                    label: 'ResponsÃ¡vel',
                                    content: <p className="master-detail-empty">Dados do responsÃ¡vel.</p>
                                },
                                {
                                    key: 'matricula',
                                    label: 'MatrÃ­cula',
                                    content: <p className="master-detail-empty">Dados da matrÃ­cula.</p>
                                },
                                {
                                    key: 'caderno',
                                    label: 'Caderno',
                                    content: <p className="master-detail-empty">Caderno do NAP.</p>
                                },
                                {
                                    key: 'oc',
                                    label: 'Oferecimento',
                                    content: <p className="master-detail-empty">Componente curricular e status.</p>
                                },
                                {
                                    key: 'nota',
                                    label: 'Nota',
                                    content: <p className="master-detail-empty">Notas do aluno.</p>
                                },
                                {
                                    key: 'ligacao',
                                    label: 'LigaÃ§Ã£o',
                                    content: <p className="master-detail-empty">LigaÃ§Ãµes realizadas.</p>
                                },
                                {
                                    key: 'email',
                                    label: 'E-mail',
                                    content: <p className="master-detail-empty">E-mails enviados.</p>
                                },
                                {
                                    key: 'chamada',
                                    label: 'Chamada',
                                    content: <p className="master-detail-empty">Chamada de presenÃ§a.</p>
                                },
                            ]}
                        />
                    </div>
                </div>
                <DataTable path="/api/view/nap/abasinfo"/>
            </main>
        </PermissionGate>
    );
}
