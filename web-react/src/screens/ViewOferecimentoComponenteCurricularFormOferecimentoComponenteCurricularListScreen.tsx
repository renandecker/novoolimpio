import {PermissionGate} from '../permissions';
import {DataTable, type DataTableColumn} from '../DataTable';
import {Wizard, useWizardData} from '../Wizard';
import {useApi} from '../api';

interface OferecimentoCCStep1Data {
    entity: {
        nome?: string;
        unidadeId?: number;
        grupoId?: number;
        salaId?: number;
        curriculoId?: number;
        componenteCurricularId?: number;
        vagas?: number;
        dataInicio?: string;
        replicar?: boolean;
        diasReplicar?: number;
    };
    diasAula: any[];
    ocorrencias: any[];
    professores: any[];
}

interface OferecimentoCCStep2Data {
    ocorrencias: any[];
}

interface OferecimentoCCStep3Data {
    professorId?: number;
}

export default function ViewOferecimentoComponenteCurricularFormOferecimentoComponenteCurricularListScreen() {
    const {data, updateField, updateFields} = useWizardData<OferecimentoCCStep1Data | OferecimentoCCStep2Data | OferecimentoCCStep3Data>({
        entity: {},
        diasAula: [],
        ocorrencias: [],
        professores: [],
    });

    const {post: saveOferecimento} = useApi('/api/educacao/oferecimento-componente-curricular');

    const validateStep1 = (currentData: OferecimentoCCStep1Data) => {
        if (!currentData.entity.unidadeId) return 'Selecione a unidade';
        if (!currentData.entity.curriculoId) return 'Selecione o curso/currículo';
        if (!currentData.entity.componenteCurricularId) return 'Selecione o componente curricular';
        if (!currentData.entity.salaId) return 'Selecione a sala';
        if (!currentData.entity.vagas || currentData.entity.vagas <= 0) return 'O número de vagas deve ser maior que zero';
        if (!currentData.entity.dataInicio) return 'Defina a data de início';
        return true;
    };

    const validateStep2 = (currentData: OferecimentoCCStep2Data) => {
        if (!currentData.ocorrencias || currentData.ocorrencias.length === 0) {
            return 'Defina os dias de aula';
        }
        return true;
    };

    const validateStep3 = (currentData: OferecimentoCCStep3Data) => {
        if (!currentData.entity.professorId) return 'Selecione o professor';
        return true;
    };

    const handleComplete = async (formData: OferecimentoCCStep1Data) => {
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
                                            <p>Oferecimento Componente Curricular - Dados</p>
                                            <p>
                                                <label>Unidade:</label>
                                                <select
                                                    onChange={(e: any) => updateField('entity.unidadeId', Number(e.target.value))}
                                                    required>
                                                    <option value="">Selecione</option>
                                                </select>
                                            </p>
                                            <p>
                                                <label>Grupo:</label>
                                                <select
                                                    onChange={(e: any) => updateField('entity.grupoId', Number(e.target.value))}
                                                    required>
                                                    <option value="">Selecione</option>
                                                </select>
                                            </p>
                                            <p>
                                                <label>Sala:</label>
                                                <select
                                                    onChange={(e: any) => updateField('entity.salaId', Number(e.target.value))}
                                                    required>
                                                    <option value="">Selecione</option>
                                                </select>
                                            </p>
                                            <p>
                                                <label>Curso:</label>
                                                <select
                                                    onChange={(e: any) => updateField('entity.curriculoId', Number(e.target.value))}
                                                    required>
                                                    <option value="">Selecione</option>
                                                </select>
                                            </p>
                                            <p>
                                                <label>Componente Curricular:</label>
                                                <select
                                                    onChange={(e: any) => updateField('entity.componenteCurricularId', Number(e.target.value))}
                                                    required>
                                                    <option value="">Selecione</option>
                                                </select>
                                            </p>
                                            <p>
                                                <label>Vagas:</label>
                                                <input
                                                    type="number"
                                                    value={data.entity.vagas || ''}
                                                    onChange={(e: any) => updateField('entity.vagas', Number(e.target.value))}
                                                    required/>
                                            </p>
                                            <p>
                                                <label>Data Início:</label>
                                                <input
                                                    type="date"
                                                    value={data.entity.dataInicio || ''}
                                                    onChange={(e: any) => updateField('entity.dataInicio', e.target.value)}
                                                    required/>
                                            </p>
                                            <p>
                                                <label>Replicar:</label>
                                                <input
                                                    type="checkbox"
                                                    checked={data.entity.replicar}
                                                    onChange={(e: any) => updateField('entity.replicar', e.target.checked)}/>
                                            </p>
                                        </div>
                                    ),
                                    validate: validateStep1,
                                },
                                {
                                    key: 'tabDiaAula',
                                    label: 'Dias Aula',
                                    content: (
                                        <div>
                                            <p>Oferecimento Componente Curricular - Dias da Aula</p>
                                            <DataTable path="/api/educacao/ocorrencia-componente-curricular"
                                                columns={[
                                                    {key: 'oferecimentoComponenteCurricularId', label: 'Oferecimento'},
                                                    {key: 'data', label: 'Data'},
                                                    {key: 'professorId', label: 'Professor'},
                                                    {key: 'salaId', label: 'Sala'},
                                                    {key: 'aulaCoringa', label: 'Aula Coringa'},
                                                    {key: 'aulaPresencial', label: 'Presencial'},
                                                    {key: 'ativo', label: 'Ativo'},
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
                                            <p>Oferecimento Componente Curricular - Professor</p>
                                            <DataTable path="/api/professor/professor"
                                                columns={[
                                                    {key: 'pessoaId', label: 'Pessoa'},
                                                    {key: 'ativo', label: 'Ativo'},
                                                    {key: 'dataInicio', label: 'Início'},
                                                    {key: 'dataFim', label: 'Fim'},
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