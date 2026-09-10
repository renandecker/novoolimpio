import {PermissionGate} from '../../../shared/services/permissions';

import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';

import {Wizard, useWizardData} from '../../../shared/components/Wizard';

import {useApi} from '../../../shared/services/api';

import {API_PATHS} from '../../../shared/services/apiPaths';



const MATRICULA_COLUMNS: DataTableColumn[] = [

    {key: 'contratoId', label: 'Contrato'},

    {key: 'oferecimentoComponenteCurricularId', label: 'Oferecimento'},

    {key: 'formaPagamentoId', label: 'Forma de Pagamento'},

    {key: 'status', label: 'Status'},

    {key: 'data', label: 'Data'},

    {key: 'mediaFinal', label: 'Média Final'},

    {key: 'percentualPresenca', label: '% Presença'},

];



const MATERIAL_COLUMNS: DataTableColumn[] = [

    {key: 'controleEstoqueId', label: 'Controle Estoque'},

    {key: 'matriculaId', label: 'Matrícula'},

    {key: 'quantidadeCurso', label: 'Qtd. Curso'},

    {key: 'quantidadeCompra', label: 'Qtd. Compra'},

];



const VALORES_COLUMNS: DataTableColumn[] = [

    {key: 'curriculoId', label: 'Curso'},

    {key: 'valor', label: 'Valor'},

    {key: 'juros', label: 'Juros'},

    {key: 'multa', label: 'Multa'},

    {key: 'descontoCarne', label: 'Desconto Carne'},

    {key: 'cobraRematricula', label: 'Cobra Rematrícula'},

    {key: 'data', label: 'Data'},

];



interface MatriculaData {

    entity: {

        contratoId?: number;

        curriculoId?: number;

        unidadeId?: number;

        testemunha1Id?: number;

        testemunha2Id?: number;

        responsavelId?: number;

    };

    ofertasSelecionadas: any[];

    materialEscolar: any[];

    valores: {

        formaPagamentoId?: number;

        dataPrimeiraParcela?: string;

        dataParcela?: string;

        parcelas?: any[];

        taxas?: any[];

        bonificacao?: number;

    };

}



export default function ViewMatriculaFormMatriculaListScreen() {

    const {data, updateFields, updateField} = useWizardData<MatriculaData>({

        entity: {},

        ofertasSelecionadas: [],

        materialEscolar: [],

        valores: {},

    });



    const {post: saveMatricula} = useApi(API_PATHS.basico.matricula);



    const validateStep1 = async (currentData: MatriculaData) => {

        if (!currentData.entity.contratoId) return 'Selecione o aluno/contrato';

        if (!currentData.entity.curriculoId) return 'Selecione o curso';

        if (!currentData.entity.unidadeId) return 'Selecione a unidade do contrato';

        if (!currentData.entity.testemunha1Id) return 'Informe a primeira testemunha';

        if (!currentData.entity.testemunha2Id) return 'Informe a segunda testemunha';

        if (currentData.ofertasSelecionadas.length === 0) return 'Selecione pelo menos um oferecimento';

        return true;

    };



    const validateStep3 = async (currentData: MatriculaData) => {

        if (!currentData.valores.formaPagamentoId) return 'Selecione a forma de pagamento';

        if (!currentData.valores.dataPrimeiraParcela) return 'Defina a data da primeira parcela';

        if (!currentData.valores.parcelas || currentData.valores.parcelas.length === 0) return 'Configure as parcelas';

        return true;

    };



    const handleComplete = async (formData: MatriculaData) => {

        try {

            await saveMatricula({

                ...formData.entity,

                ofertasSelecionadas: formData.ofertasSelecionadas,

                materialEscolar: formData.materialEscolar,

                valores: formData.valores,

            });

            alert('Matrícula realizada com sucesso!');

        } catch (error) {

            console.error('Erro ao salvar:', error);

            alert('Erro ao realizar matrícula');

        }

    };



    return (

        <PermissionGate permission="READ">

            <main>

                <h1>Form Matricula</h1>

                <div className="div_form">

                    <div className="form-title">Matrícula</div>

                    <div className="table_form">

                        <Wizard

                            initialData={data}

                            onDataChange={updateFields}

                            steps={[

                                {

                                    key: 'tabMatricula',

                                    label: 'Matrícula',

                                    content: (

                                        <div>

                                            <DataTable path="/api/educacao/matricula" columns={MATRICULA_COLUMNS}/>

                                        </div>

                                    ),

                                    validate: validateStep1,

                                },

                                {

                                    key: 'tabMaterial',

                                    label: 'Material',

                                    content: (

                                        <div>

                                            <DataTable path="/api/educacao/material-escolar-matricula"

                                                       columns={MATERIAL_COLUMNS}/>

                                        </div>

                                    ),

                                },

                                {

                                    key: 'tabValores',

                                    label: 'Valores',

                                    nextLabel: 'Salvar',

                                    content: (

                                        <div>

                                            <DataTable path="/api/educacao/valor-curso" columns={VALORES_COLUMNS}/>

                                        </div>

                                    ),

                                    validate: validateStep3,

                                },

                            ]}

                            onComplete={handleComplete}

                        />

                    </div>

                </div>

            </main>

        </PermissionGate>

    );

}

