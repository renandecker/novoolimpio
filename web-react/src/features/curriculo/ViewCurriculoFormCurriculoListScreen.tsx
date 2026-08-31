import React from 'react';
import {FormLayout} from '../../shared/components/FormLayout';
import {Base64FileUpload} from '../../shared/components/Base64FileUpload';

interface CurriculoFormStepProps {
    step: CurriculoFormStep;
    onStepChange: (step: CurriculoFormStep) => void;
    stepData: Record<CurriculoFormStep, string>;
    onSave: () => void;
}

const steps = [
    {key: 'curriculo', label: 'Curso', component: () => <></>},
    {key: 'licenca', label: 'Licença', empty: 'Informações de licença do curso.'},
    {key: 'matrizCurricular', label: 'Matriz Curricular'},
    {key: 'requisitos', label: 'Requisitos'},
    {key: 'unidade', label: 'Unidade'},
    {key: 'material', label: 'Material'},
    {key: 'presencas', label: 'Presenças', empty: 'Dados de frequência e presença do aluno.'},
    {key: 'notas', label: 'Notas', empty: 'Matriz de notas e conceitos por grau.'},
    {key: 'documentos', label: 'Documentos', empty: 'Contratos, promissórias, certificados e boletins.', nextLabel: 'Salvar'},
];

export default function ViewCurriculoFormCurriculoListScreen() {
    const [currentStep, setCurrentStep] = React.useState<CurriculoFormStep>('curriculo');
    const [stepData, setStepData] = React.useState<Record<CurriculoFormStep, string>>({
        curriculo: '',
        licenca: '',
        matrizCurricular: '',
        requisitos: '',
        unidade: '',
        material: '',
        presencas: '',
        notas: '',
        documentos: '',
    });

    const handleNext = () => {
        setCurrentStep(currentStep === 'documentos' ? 'curriculo' : currentStep);
    };

    const handleSave = () => {
        // Save all step data
        console.log('Saving curriculum with data:', stepData);
        setCurrentStep('curriculo');
    };

    const currentStepConfig = steps.find(s => s.key === currentStep);

    return (
        <FormLayout title="Formulário de Currículo">
            <div style={{padding: 16, background: '#f8f9fa', borderRadius: 8, marginBottom: 16}}>
                <h3>{currentStepConfig.label}</h3>
                {currentStepConfig.empty && <p style={{color: '#666', marginBottom: 16}}>{currentStepConfig.empty}</p>}
                
                {currentStep === 'presencas' && (
                    <div>
                        <p>Dados de presenças do aluno serão integrados aqui.</p>
                        <Base64FileUpload
                            value={stepData.presencas || ''}
                            onChange={(dataUrl) => setStepData(prev => ({...prev, presencas: dataUrl}))}
                            accept="application/pdf,application/msword"
                            label="Arquivo de Presenças"
                        />
                    </div>
                )}

                {currentStep === 'notas' && (
                    <div>
                        <p>Matriz de notas e conceitos por grau será exibida aqui.</p>
                        <Base64FileUpload
                            value={stepData.notas || ''}
                            onChange={(dataUrl) => setStepData(prev => ({...prev, notas: dataUrl}))}
                            accept="application/pdf,application/msword"
                            label="Arquivo de Notas"
                        />
                    </div>
                )}

                {currentStep === 'documentos' && (
                    <div>
                        <p>Documentos de apoio ao currículo.</p>
                        <Base64FileUpload
                            value={stepData.documentos || ''}
                            onChange={(dataUrl) => setStepData(prev => ({...prev, documentos: dataUrl}))}
                            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                            label="Documentos do Currículo"
                        />
                    </div>
                )}

                <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 24}}>
                    <button
                        onClick={currentStep === 'documentos' ? handleSave : handleNext}
                        style={{
                            marginRight: 8,
                            padding: '8px 16px',
                            background: currentStep === 'documentos' ? '#2a5a88' : '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                        }}
                    >
                        {currentStep === 'documentos' ? 'Salvar' : 'Próximo'}
                    </button>
                </div>
            </div>
        </FormLayout>
    );
}