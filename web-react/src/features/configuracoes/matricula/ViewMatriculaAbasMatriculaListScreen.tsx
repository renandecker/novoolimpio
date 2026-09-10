import {PermissionGate} from '../../../shared/services/permissions';

import {DataTable} from '../../../shared/components/DataTable';

import {Wizard} from '../../../shared/components/Wizard';



export default function ViewMatriculaAbasMatriculaListScreen() {

    return (

        <PermissionGate permission="READ">

            <main>

                <h1>Abas Matricula</h1>

                <div className="div_form">

                    <div className="form-title">Matrícula</div>

                    <div className="table_form">

                        <Wizard

                            steps={[

                                {

                                    key: 'material',

                                    label: 'Material',

                                    content: <p className="master-detail-empty">Material escolar.</p>

                                },

                                {

                                    key: 'valores',

                                    label: 'Valores',

                                    content: <p className="master-detail-empty">Valores da matrícula.</p>

                                },

                                {

                                    key: 'curso',

                                    label: 'Curso',

                                    content: <p className="master-detail-empty">Curso da matrícula.</p>

                                },

                                {

                                    key: 'produtos',

                                    label: 'Produtos',

                                    content: <p className="master-detail-empty">Produtos vinculados.</p>

                                },

                                {

                                    key: 'parcelado',

                                    label: 'Parcelado',

                                    nextLabel: 'Salvar',

                                    content: <p className="master-detail-empty">Parcelamento da matrícula.</p>,

                                },

                            ]}

                        />

                    </div>

                </div>

                <DataTable path="/api/view/matricula/abasMatricula"/>

            </main>

        </PermissionGate>

    );

}

