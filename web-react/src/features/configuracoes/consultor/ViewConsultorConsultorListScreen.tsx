import {PermissionGate} from '../../../shared/services/permissions';

import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';

import {Tabs} from '../../../shared/components/Tabs';

import {Wizard} from '../../../shared/components/Wizard';

import {useState} from 'react';

import {api} from '../../../shared/services/api';

import ViewConsultorMatriculaLayoutScreen from './ViewConsultorMatriculaLayoutScreen';



const CONSULTOR_COLUMNS: DataTableColumn[] = [

    {key: 'id', label: 'ID'},

    {key: 'usuario_login', label: 'Usuário'},

    {key: 'usuario_pessoa_telefone', label: 'Telefone'},

    {key: 'usuario_pessoa_email', label: 'E-mail'},

    {key: 'usuario_pessoa_pessoaFisica_nome', label: 'Nome'},

    {key: 'usuario_pessoa_pessoaFisica_cpf', label: 'CPF'},

    {key: 'usuario_pessoa_pessoaFisica_rg', label: 'RG'},

    {key: 'usuario_pessoa_pessoaFisica_dataNascimento', label: 'Data Nasc.'},

];



const CONTRATO_COLUMNS: DataTableColumn[] = [

    {key: 'id', label: 'ID'},

    {key: 'pessoa_pessoaFisica_nome', label: 'Aluno'},

    {key: 'curriculo_curso_nome', label: 'Curso'},

    {key: 'unidade_sucinto', label: 'Id_unidade'},

    {key: 'valorParcelas', label: 'Valor'},

    {key: 'ativo', label: 'Ativo'},

    {key: 'data', label: 'Data'},

];



const MATRICULA_COLUMNS: DataTableColumn[] = [

    {key: 'contratoId', label: 'Contrato'},

    {key: 'oferecimentoComponenteCurricularId', label: 'Oferecimento'},

    {key: 'formaPagamentoId', label: 'Forma Pagamento'},

    {key: 'status', label: 'Status'},

    {key: 'data', label: 'Data'},

];



const MATERIAL_COLUMNS: DataTableColumn[] = [

    {key: 'dataCompra', label: 'Data Compra'},

    {key: 'unidadeId', label: 'Id_unidade'},

    {key: 'pessoaId', label: 'Pessoa'},

    {key: 'tipoFormaPagamento', label: 'Forma Pagamento'},

    {key: 'valor', label: 'Valor'},

    {key: 'quantidade', label: 'Quantidade'},

];



const VALORES_COLUMNS: DataTableColumn[] = [

    {key: 'curriculoId', label: 'Curso'},

    {key: 'valor', label: 'Valor'},

    {key: 'juros', label: 'Juros'},

    {key: 'multa', label: 'Multa'},

    {key: 'descontoCarne', label: 'Desconto Carne'},

    {key: 'cobraRematricula', label: 'Cobra Rematrícula'},

];



type MenuItem = 1 | 2 | 3 | 4 | 5 | null;



export default function ViewConsultorConsultorListScreen() {

    const [menu, setMenu] = useState<MenuItem>(1);



    return (

        <PermissionGate permission="READ">

            <main className="consultor-screen">

                <div className="consultor-layout">

                    <aside className="consultor-sidebar">

                        <div className="sidebar-header">

                            <h2>Consultor</h2>

                        </div>

                        <nav className="sidebar-menu">

                            <button

                                className={`sidebar-btn ${menu === 1 ? 'active' : ''}`}

                                onClick={() => setMenu(1)}

                            >

                                <i className="fa fa-book"/> Cursos

                            </button>

                            <button

                                className={`sidebar-btn ${menu === 2 ? 'active' : ''}`}

                                onClick={() => setMenu(2)}

                            >

                                <i className="fa fa-user-plus"/> Matrícula

                            </button>

                            <button

                                className={`sidebar-btn ${menu === 3 ? 'active' : ''}`}

                                onClick={() => setMenu(3)}

                            >

                                <i className="fa fa-hand-pointer-o"/> Indicação

                            </button>

                            <button

                                className={`sidebar-btn ${menu === 4 ? 'active' : ''}`}

                                onClick={() => setMenu(4)}

                            >

                                <i className="fa fa-refresh"/> Rematrícula

                            </button>

                            <button

                                className={`sidebar-btn ${menu === 5 ? 'active' : ''}`}

                                onClick={() => setMenu(5)}

                            >

                                <i className="fa fa-exchange"/> Troca Curso

                            </button>

                            <button

                                className="sidebar-btn sidebar-btn-danger"

                                onClick={() => alert('Finalizar atendimento')}

                            >

                                <i className="fa fa-times"/> Finalizar

                            </button>

                        </nav>

                    </aside>



                    <section className="consultor-content">

                        {menu === 1 && (

                            <CursosScreen />

                        )}

                        {menu === 2 && (

                            <ViewConsultorMatriculaLayoutScreen />

                        )}

                        {menu === 3 && (

                            <IndicacaoScreen />

                        )}

                        {menu === 4 && (

                            <RematriculaWizardScreen />

                        )}

                        {menu === 5 && (

                            <TrocaCursoWizardScreen />

                        )}

                        {menu === null && (

                            <div className="empty-state">Selecione uma opção no menu</div>

                        )}

                    </section>

                </div>

            </main>

        </PermissionGate>

    );

}



function CursosScreen() {

    return (

        <div className="consultor-panel">

            <h3>Cursos Disponíveis</h3>

            <DataTable path="/api/educacao/curriculo" columns={[]} hideCreate={true} />

        </div>

    );

}



function MatriculaWizardScreen() {

    return (

        <div className="consultor-panel">

            <h3>Matrícula</h3>

            <Wizard

                steps={[

                    {

                        key: 'contrato',

                        label: 'Contrato',

                        content: <DataTable path="/api/educacao/contrato" columns={CONTRATO_COLUMNS} hideCreate={true} />,

                    },

                    {

                        key: 'pessoa',

                        label: 'Curso / Pessoa',

                        content: (

                            <div className="wizard-step-content">

                                <h4>Seleção de Aluno e Curso</h4>

                                <DataTable path="/api/educacao/matricula" columns={MATRICULA_COLUMNS} hideCreate={true} />

                            </div>

                        ),

                    },

                    {

                        key: 'matricula',

                        label: 'Matrícula',

                        content: <DataTable path="/api/educacao/matricula" columns={MATRICULA_COLUMNS} hideCreate={true} />,

                    },

                    {

                        key: 'material',

                        label: 'Material',

                        content: <DataTable path="/api/estoque/venda-produto" columns={MATERIAL_COLUMNS} hideCreate={true} />,

                    },

                    {

                        key: 'valores',

                        label: 'Valores',

                        nextLabel: 'Salvar',

                        content: <DataTable path="/api/educacao/valor-curso" columns={VALORES_COLUMNS} hideCreate={true} />,

                    },

                ]}

            />

        </div>

    );

}



function IndicacaoScreen() {

    return (

        <div className="consultor-panel">

            <h3>Indicação</h3>

            <p>Funcionalidade de indicação</p>

        </div>

    );

}



function RematriculaWizardScreen() {

    return (

        <div className="consultor-panel">

            <h3>Rematrícula</h3>

            <Wizard

                steps={[

                    {

                        key: 'contrato',

                        label: 'Contrato',

                        content: <DataTable path="/api/educacao/contrato" columns={CONTRATO_COLUMNS} hideCreate={true} />,

                    },

                    {

                        key: 'matricula',

                        label: 'Matrícula / Rematrícula',

                        content: <DataTable path="/api/educacao/matricula" columns={MATRICULA_COLUMNS} hideCreate={true} />,

                    },

                    {

                        key: 'material',

                        label: 'Material',

                        content: <DataTable path="/api/estoque/venda-produto" columns={MATERIAL_COLUMNS} hideCreate={true} />,

                    },

                    {

                        key: 'valores',

                        label: 'Valores',

                        nextLabel: 'Salvar',

                        content: <DataTable path="/api/educacao/valor-curso" columns={VALORES_COLUMNS} hideCreate={true} />,

                    },

                ]}

            />

        </div>

    );

}



function TrocaCursoWizardScreen() {

    return (

        <div className="consultor-panel">

            <h3>Troca de Curso</h3>

            <Wizard

                steps={[

                    {

                        key: 'contrato',

                        label: 'Contrato',

                        content: <DataTable path="/api/educacao/contrato" columns={CONTRATO_COLUMNS} hideCreate={true} />,

                    },

                    {

                        key: 'matricula',

                        label: 'Matrícula / Rematrícula',

                        content: <DataTable path="/api/educacao/matricula" columns={MATRICULA_COLUMNS} hideCreate={true} />,

                    },

                    {

                        key: 'material',

                        label: 'Material',

                        content: <DataTable path="/api/estoque/venda-produto" columns={MATERIAL_COLUMNS} hideCreate={true} />,

                    },

                    {

                        key: 'valores',

                        label: 'Valores',

                        nextLabel: 'Salvar',

                        content: <DataTable path="/api/educacao/valor-curso" columns={VALORES_COLUMNS} hideCreate={true} />,

                    },

                ]}

            />

        </div>

    );

}

