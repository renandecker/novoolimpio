import {PermissionGate} from '../permissions';
import {DataTable, type DataTableColumn} from '../DataTable';
import {Wizard, useWizardData} from '../Wizard';
import {useApi} from '../api';

const OFERECIMENTO_CURSO_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'Turma'},
    {key: 'componenteCurricularId', label: 'Componente Curricular'},
    {key: 'grupo', label: 'Grupo'},
    {key: 'unidadeId', label: 'Unidade'},
    {key: 'cursoId', label: 'Curso'},
    {key: 'salaId', label: 'Sala'},
    {key: 'vagas', label: 'Vagas'},
    {key: 'inscritos', label: 'Inscritos'},
    {key: 'status', label: 'Status'},
    {key: 'dataInicio', label: 'Início'},
    {key: 'dataFim', label: 'Fim'},
];

const DIAS_AULA_CURSO_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'data', label: 'Data'},
    {key: 'componenteCurricularId', label: 'Componente Curricular'},
    {key: 'salaId', label: 'Sala'},
    {key: 'turno', label: 'Turno'},
    {key: 'tempoAula', label: 'Tempo Aula'},
    {key: 'aulaPresencial', label: 'Presencial'},
    {key: 'aulaCoringa', label: 'Aula Coringa'},
];

const PROFESSOR_CURSO_COLUMNS: DataTableColumn[] = [
    {key: 'componenteCurricularId', label: 'Componente Curricular'},
    {key: 'professorId', label: 'Professor'},
];

interface OferecimentoCursoData {
    entity: {
        id?: number;
        nome?: string;
        unidadeId?: number;
        curriculoId?: number;
        salaId?: number;
        vagas?: number;
        qtdeSequencia?: number;
        dataInicio?: string;
        replicarGrupo?: boolean;
    };
    oferecimentos: any[];
    ocorrencias: any[];
    professores: any[];
}

export default function ViewOferecimentoComponenteCurricularFormOferecimentoCursoListScreen() {
    const {data, updateField, updateFields} = useWizardData<OferecimentoCursoData>({
        entity: {},
        oferecimentos: [],
        ocorrencias: [],
        professores: [],
    });

    const {post: saveOferecimentoCurso} = useApi('/api/educacao/oferecimento-curso');

    const validateStep1 = async (currentData: OferecimentoCursoData) => {
        if (!currentData.entity.unidadeId) return 'Selecione a unidade';
        if (!currentData.entity.curriculoId) return 'Selecione o currículo/curso';
        if (!currentData.entity.salaId) return 'Selecione a sala';
        if (!currentData.entity.vagas || currentData.entity.vagas <= 0) return 'O número de vagas deve ser maior que zero';
        if (!currentData.entity.dataInicio) return 'Defina a data de início';
        if (!currentData.entity.qtdeSequencia || currentData.entity.qtdeSequencia <= 0) return 'Defina a quantidade de sequências';
        return true;
    };

    const onEnterStep2 = async (currentData: OferecimentoCursoData) => {
        if (currentData.oferecimentos.length > 0) {
            // Load ocorrencias for each oferecimento
            // const allOcorrencias = await Promise.all(
            //   currentData.oferecimentos.map(of => fetch(`/api/educacao/ocorrencia?oferecimentoId=${of.id}`).then(r => r.json()))
            // );
            // updateFields({ ocorrencias: allOcorrencias.flat() });
        }
    };

    const validateStep2 = async (currentData: OferecimentoCursoData) => {
        if (!currentData.ocorrencias || currentData.ocorrencias.length === 0) {
            return 'Defina os dias de aula para os componentes curriculares';
        }
        return true;
    };

    const onEnterStep3 = async (currentData: OferecimentoCursoData) => {
        // Auto-assign professors for each oferecimento if new
        if (!currentData.entity.id) {
            // Implementation for auto-assigning professors
        }
    };

    const validateStep3 = async (currentData: OferecimentoCursoData) => {
        if (!currentData.professores || currentData.professores.length === 0) {
            return 'Defina os professores para cada componente curricular';
        }
        for (const prof of currentData.professores) {
            if (!prof.professorId) {
                return 'Todos os componentes curriculares devem ter um professor definido';
            }
        }
        return true;
    };

    const handleComplete = async (formData: OferecimentoCursoData) => {
        try {
            await saveOferecimentoCurso({
                ...formData.entity,
                oferecimentos: formData.oferecimentos,
                professores: formData.professores,
            });
            alert('Oferecimento de curso salvo com sucesso!');
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar oferecimento de curso');
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Oferecimento Curso</h1>
                <div className="div_form">
                    <div className="form-title">Oferecimento de Curso</div>
                    <div className="table_form">
                        <Wizard
                            initialData={data}
                            onDataChange={updateFields}
                            steps={[
                                {
                                    key: 'oferecimento',
                                    label: 'Curso',
                                    content: (
                                        <div>
                                            <DataTable path="/api/educacao/oferecimento-curso"
                                                       columns={OFERECIMENTO_CURSO_COLUMNS}/>
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
                                            <DataTable path="/api/educacao/ocorrencia-curso"
                                                       columns={DIAS_AULA_CURSO_COLUMNS}/>
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
                                            <DataTable path="/api/educacao/professor-curso"
                                                       columns={PROFESSOR_CURSO_COLUMNS}/>
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