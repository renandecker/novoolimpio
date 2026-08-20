import {PermissionGate} from '../permissions';
import {DataTable, type DataTableColumn} from '../DataTable';
import {Wizard, useWizardData} from '../Wizard';
import {useApi} from '../api';

const TIPO_PLANEJAMENTO_OPTIONS = [
    {value: 'DISPONIBILIDADE_AULA', label: 'Disponibilidade aula'},
    {value: 'DISPONIBILIDADE_SEQUENTE', label: 'Disponibilidade sequente'},
    {value: 'DISPONIBILIDADE_LIVRE', label: 'Disponibilidade livre'},
];

const OFERECIMENTO_COLUMNS: DataTableColumn[] = [
    {key: 'unidadeId', label: 'Unidade'},
    {key: 'grupoId', label: 'Grupo'},
    {key: 'salaId', label: 'Sala'},
    {key: 'curriculoId', label: 'Curso'},
    {key: 'componenteCurricularId', label: 'Componente Curricular'},
    {key: 'professorId', label: 'Professor'},
    {key: 'vagas', label: 'Vagas'},
    {key: 'inscritos', label: 'Inscritos'},
    {key: 'status', label: 'Status'},
    {key: 'tipoPlanejamento', label: 'Tipo Planejamento', options: TIPO_PLANEJAMENTO_OPTIONS},
    {key: 'dataInicio', label: 'Início'},
    {key: 'dataFim', label: 'Fim'},
];

const DIAS_AULA_COLUMNS: DataTableColumn[] = [
    {key: 'oferecimentoComponenteCurricularId', label: 'Oferecimento'},
    {key: 'data', label: 'Data'},
    {key: 'professorId', label: 'Professor'},
    {key: 'salaId', label: 'Sala'},
    {key: 'aulaCoringa', label: 'Aula Coringa'},
    {key: 'aulaPresencial', label: 'Presencial'},
    {key: 'ativo', label: 'Ativo'},
];

const PROFESSOR_COLUMNS: DataTableColumn[] = [
    {key: 'pessoaId', label: 'Pessoa'},
    {key: 'ativo', label: 'Ativo'},
    {key: 'dataInicio', label: 'Início'},
    {key: 'dataFim', label: 'Fim'},
];

interface OferecimentoData {
    entity: {
        id?: number;
        unidadeId?: number;
        grupoId?: number;
        salaId?: number;
        curriculoId?: number;
        componenteCurricularId?: number;
        professorId?: number;
        vagas?: number;
        dataInicio?: string;
        replicar?: boolean;
        diasReplicar?: number;
    };
    diasAula: any[];
    ocorrencias: any[];
    professores: any[];
}

export default function ViewOferecimentoComponenteCurricularFormOferecimentoComponenteCurricularListScreen() {
    const {data, updateField, updateFields} = useWizardData<OferecimentoData>({
        entity: {},
        diasAula: [],
        ocorrencias: [],
        professores: [],
    });

    const {post: saveOferecimento} = useApi('/api/educacao/oferecimento-componente-curricular');

    const validateStep1 = async (currentData: OferecimentoData) => {
        if (!currentData.entity.unidadeId) return 'Selecione a unidade';
        if (!currentData.entity.curriculoId) return 'Selecione o curso/currículo';
        if (!currentData.entity.componenteCurricularId) return 'Selecione o componente curricular';
        if (!currentData.entity.salaId) return 'Selecione a sala';
        if (!currentData.entity.vagas || currentData.entity.vagas <= 0) return 'O número de vagas deve ser maior que zero';
        if (!currentData.entity.dataInicio) return 'Defina a data de início';
        return true;
    };

    const onEnterStep2 = async (currentData: OferecimentoData) => {
        if (currentData.entity.id) {
            // Load existing dias aula for editing
            // const response = await fetch(`/api/educacao/ocorrencia-componente-curricular?oferecimentoId=${currentData.entity.id}`);
            // const ocorrencias = await response.json();
            // updateFields({ ocorrencias });
        }
    };

    const validateStep2 = async (currentData: OferecimentoData) => {
        if (!currentData.ocorrencias || currentData.ocorrencias.length === 0) {
            return 'Defina os dias de aula';
        }
        return true;
    };

    const onEnterStep3 = async (currentData: OferecimentoData) => {
        // Auto-assign professor if new entity
        if (!currentData.entity.id && currentData.entity.componenteCurricularId && currentData.entity.unidadeId) {
            // const response = await fetch(`/api/professor/disponiveis?componenteCurricularId=${currentData.entity.componenteCurricularId}&unidadeId=${currentData.entity.unidadeId}`);
            // const professores = await response.json();
            // if (professores.length > 0) {
            //   updateField('professorId', professores[0].id);
            // }
        }
    };

    const validateStep3 = async (currentData: OferecimentoData) => {
        if (!currentData.entity.professorId) return 'Selecione o professor';
        return true;
    };

    const handleComplete = async (formData: OferecimentoData) => {
        try {
            await saveOferecimento(formData.entity);
            alert('Oferecimento salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar oferecimento');
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Oferecimento Componente Curricular</h1>
                <div className="div_form">
                    <div className="form-title">Oferecimento Componente Curricular</div>
                    <div className="table_form">
                        <Wizard
                            initialData={data}
                            onDataChange={updateFields}
                            steps={[
                                {
                                    key: 'oferecimento',
                                    label: 'Componente Curricular',
                                    content: (
                                        <div>
                                            <DataTable path="/api/educacao/oferecimento-componente-curricular"
                                                       columns={OFERECIMENTO_COLUMNS}/>
                                        </div>
                                    ),
                                    validate: validateStep1,
                                    onEnter: onEnterStep2,
                                },
                                {
                                    key: 'tabDiaAula',
                                    label: 'Dias Aula',
                                    content: (
                                        <div>
                                            <DataTable path="/api/educacao/ocorrencia-componente-curricular"
                                                       columns={DIAS_AULA_COLUMNS}/>
                                        </div>
                                    ),
                                    validate: validateStep2,
                                    onEnter: onEnterStep3,
                                },
                                {
                                    key: 'tabProfessor',
                                    label: 'Professor',
                                    nextLabel: 'Salvar',
                                    content: (
                                        <div>
                                            <DataTable path="/api/professor/professor" columns={PROFESSOR_COLUMNS}/>
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