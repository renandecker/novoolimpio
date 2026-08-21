import {PermissionGate} from '../permissions';
import {DataTable, type DataTableColumn} from '../DataTable';
import {Wizard, useWizardData} from '../Wizard';
import {useApi} from '../api';

interface OferecimentoCursoStep1Data {
    novoGrupo: boolean;
    entity: {
        nome?: string;
        grupoId?: number;
        unidadeId?: number;
        curriculoId?: number;
    };
    grupos: any[];
    curriculos: any[];
    unidadesDisponiveis: any[];
}

interface OferecimentoCursoStep2Data {
    ocorrencias: any[];
}

interface OferecimentoCursoStep3Data {
    professores: Array<{
        componenteCurricularId: number;
        professorId: number;
    }>;
}

export default function ViewOferecimentoComponenteCurricularFormOferecimentoCursoListScreen() {
    const {data, updateField, updateFields} = useWizardData<OferecimentoCursoStep1Data | OferecimentoCursoStep2Data | OferecimentoCursoStep3Data>({
        novoGrupo: false,
        entity: {},
        grupos: [],
        curriculos: [],
        unidadesDisponiveis: [],
        ocorrencias: [],
        professores: [],
    });

    const {post: saveOferecimentoCurso} = useApi('/api/educacao/oferecimento-curso');

    const validateStep1 = (currentData: OferecimentoCursoStep1Data) => {
        if (!currentData.unidadeId) return 'Selecione a unidade';
        if (!currentData.curriculoId) return 'Selecione o currículo/curso';
        if (!currentData.entity.vagas || currentData.entity.vagas <= 0) return 'O número de vagas deve ser maior que zero';
        if (!currentData.entity.dataInicio) return 'Defina a data de início';
        if (!currentData.entity.qtdeSequencia || currentData.entity.qtdeSequencia <= 0) return 'Defina a quantidade de sequências';
        return true;
    };

    const validateStep2 = (currentData: OferecimentoCursoStep2Data) => {
        if (!currentData.ocorrencias || currentData.ocorrencias.length === 0) {
            return 'Defina os dias de aula para os componentes curriculares';
        }
        return true;
    };

    const validateStep3 = (currentData: OferecimentoCursoStep3Data) => {
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

    const handleComplete = async (formData: any) => {
        try {
            await saveOferecimentoCurso({
                ...formData.entity,
                offering: formData.offering,
                professors: formData.professores,
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
                                            <p>Oferecimento de Curso - Dados do Curso</p>
                                            <p>
                                                <input
                                                    type="checkbox"
                                                    checked={data.novoGrupo}
                                                    onChange={(e: any) => updateField('novoGrupo', e.target.checked)}
                                                /> Criar nova sequência
                                            </p>
                                            <p>
                                                <label>Grupo:</label>
                                                <input
                                                    type="text"
                                                    value={data.entity.nome || ''}
                                                    onChange={(e: any) => updateField('entity.nome', e.target.value)}
                                                    disabled={!data.novoGrupo}
                                                    required={true}
                                                />
                                            </p>
                                            <p>
                                                <select
                                                    disabled={data.novoGrupo}
                                                    onChange={(e: any) => updateField('entity.grupoId', Number(e.target.value))}
                                                    required={!data.novoGrupo}>
                                                    <option value="">Selecione</option>
                                                    {data.grupos?.map((g: any) => (
                                                        <option key={g.id} value={g.id}>{g.nome}</option>
                                                    ))}
                                                </select>
                                            </p>
                                            <p>
                                                <label>Unidade:</label>
                                                <select
                                                    onChange={(e: any) => updateField('entity.unidadeId', Number(e.target.value))}
                                                    required>
                                                    <option value="">Selecione</option>
                                                    {data.unidadesDisponiveis?.map((u: any) => (
                                                        <option key={u.id} value={u.id}>{u.sucinto}</option>
                                                    ))}
                                                </select>
                                            </p>
                                            <p>
                                                <label>Curso:</label>
                                                <select
                                                    onChange={(e: any) => updateField('entity.curriculoId', Number(e.target.value))}
                                                    required>
                                                    <option value="">Selecione</option>
                                                    {data.curriculos?.map((c: any) => (
                                                        <option key={c.id} value={c.id}>{c.curso.nome}</option>
                                                    ))}
                                                </select>
                                            </p>
                                        </div>
                                    ),
                                    validate: validateStep1,
                                    onEnter: () => {
                                        // Load curriculos when unit changes
                                    },
                                },
                                {
                                    key: 'tabDiaAula',
                                    label: 'Dias Aula',
                                    content: (
                                        <div>
                                            <p>Oferecimento de Curso - Dias da Aula</p>
                                            <DataTable path="/api/educacao/ocorrencia-curso"
                                                columns={[
                                                    {key: 'id', label: 'ID da Ocorrência'},
                                                    {key: 'data', label: 'Data'},
                                                    {key: 'componenteCurricularId', label: 'Componente Curricular'},
                                                    {key: 'salaId', label: 'Sala'},
                                                    {key: 'turno', label: 'Turno'},
                                                    {key: 'tempoAula', label: 'Tempo Aula'},
                                                    {key: 'aulaPresencial', label: 'Presencial'},
                                                    {key: 'aulaCoringa', label: 'Aula Coringa'},
                                                ]}/>
                                        </div>
                                    ),
                                    validate: validateStep2,
                                },
                                {
                                    key: 'tabProfessor',
                                    label: 'Professor',
                                    nextLabel: 'Salvar',
                                    content: (
                                        <div>
                                            <p>Oferecimento de Curso - Professores</p>
                                            <DataTable path="/api/educacao/professor-curso"
                                                columns={[
                                                    {key: 'componenteCurricularId', label: 'Componente Curricular'},
                                                    {key: 'professorId', label: 'Professor'},
                                                ]}/>
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