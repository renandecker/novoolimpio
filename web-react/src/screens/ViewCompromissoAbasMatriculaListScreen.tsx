import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';
import {Tabs} from '../Tabs';

export default function ViewCompromissoAbasMatriculaListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Abas Matricula</h1>
                <div className="div_form">
                    <div className="form-title">Compromisso</div>
                    <div className="table_form">
                        <Tabs
                            tabs={[
                                {
                                    key: 'contrato',
                                    label: 'Contrato',
                                    content: <p className="master-detail-empty">Dados do contrato.</p>
                                },
                                {
                                    key: 'matricula',
                                    label: 'Matrícula',
                                    content: <p className="master-detail-empty">Dados da matrícula.</p>
                                },
                                {
                                    key: 'grupo',
                                    label: 'Grupo',
                                    content: <p className="master-detail-empty">Grupo do compromisso.</p>
                                },
                                {
                                    key: 'material',
                                    label: 'Material',
                                    content: <p className="master-detail-empty">Material escolar.</p>
                                },
                            ]}
                        />
                    </div>
                </div>
                <DataTable path="/api/view/compromisso/abasMatricula"/>
            </main>
        </PermissionGate>
    );
}
