import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import {Wizard, useWizardData} from '../../shared/components/Wizard';
import {useApi} from '../../shared/services/api';
import {API_PATHS} from '../../shared/services/apiPaths';

const MODELO_EMAIL_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID do Modelo de Email'},
    {key: 'descricao', label: 'Descrição'},
    {key: 'assunto', label: 'Assunto'},
];

const ALUNO_COLUMNS: DataTableColumn[] = [
    {key: 'contratoId', label: 'Contrato'},
    {key: 'aluno', label: 'Aluno'},
    {key: 'contratante', label: 'Contratante'},
];

interface EmailLoteData {
    targetEmail: {
        id?: number;
        modeloEmailId?: number;
        assunto?: string;
        mensagem?: string;
    };
    targetModelEmail: any;
    listModelEmails: any[];
    listAlunos: any[];
    selectLote: any[];
}

export default function ViewCobrancaEmailLoteListScreen() {
    const {data, updateFields, updateField} = useWizardData<EmailLoteData>({
        targetEmail: {},
        targetModelEmail: null,
        listModelEmails: [],
        listAlunos: [],
        selectLote: [],
    });

    const {get: getModelosEmail} = useApi(API_PATHS.financeiro.modeloEmail);
    const {get: getAlunos} = useApi(API_PATHS.basico.alunoContrato);
    const {post: sendEmail} = useApi(API_PATHS.financeiro.enviarEmailLote);

    const validateStep1 = async (currentData: EmailLoteData) => {
        if (!currentData.targetModelEmail) return 'Selecione o modelo de email';
        if (!currentData.targetEmail.assunto) return 'O assunto é obrigatório';
        if (!currentData.targetEmail.mensagem) return 'A mensagem é obrigatória';
        return true;
    };

    const validateStep2 = async (currentData: EmailLoteData) => {
        if (!currentData.selectLote || currentData.selectLote.length === 0) {
            return 'Selecione pelo menos um aluno';
        }
        return true;
    };

    const handleComplete = async (formData: EmailLoteData) => {
        try {
            await sendEmail({
                modeloEmailId: formData.targetModelEmail?.id,
                assunto: formData.targetEmail.assunto,
                mensagem: formData.targetEmail.mensagem,
                alunos: formData.selectLote.map(a => a.contratoId),
            });
            alert('Emails enviados com sucesso!');
        } catch (error) {
            console.error('Erro ao enviar emails:', error);
            alert('Erro ao enviar emails');
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Email em Lote</h1>
                <div className="div_form">
                    <div className="form-title">Envio de Email em Lote</div>
                    <div className="table_form">
                        <Wizard
                            initialData={data}
                            onDataChange={updateFields}
                            steps={[
                                {
                                    key: 'mensagem',
                                    label: 'Mensagem',
                                    content: (
                                        <div>
                                            <DataTable path="/api/cobranca/modelo-email"
                                                       columns={MODELO_EMAIL_COLUMNS}/>
                                        </div>
                                    ),
                                    validate: validateStep1,
                                },
                                {
                                    key: 'alunos',
                                    label: 'Alunos',
                                    content: (
                                        <div>
                                            <DataTable path="/api/educacao/aluno-contrato" columns={ALUNO_COLUMNS}/>
                                        </div>
                                    ),
                                    validate: validateStep2,
                                },
                                {
                                    key: 'confirmacao',
                                    label: 'Confirmação',
                                    nextLabel: 'Enviar',
                                    content: (
                                        <div>
                                            <p>Registros selecionados: {data.selectLote.length}</p>
                                            <div style={{border: '1px solid #ddd', padding: '10px', marginTop: '10px'}}>
                                                <strong>Prévia:</strong>
                                                <div
                                                    dangerouslySetInnerHTML={{__html: data.targetEmail.mensagem || ''}}/>
                                            </div>
                                        </div>
                                    ),
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
