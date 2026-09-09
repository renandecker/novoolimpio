import {PermissionGate} from '../../shared/services/permissions';
import {FormLayout} from '../../shared/components/FormLayout';
import {useState} from 'react';
import {api} from '../../shared/services/api';
import {API_PATHS} from '../../shared/services/apiPaths';
import {useNavigate} from 'react-router-dom';

export default function ViewConfiguracaoFormConfiguracaoCaixaListScreen() {
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string>('');

    const handleSubmit = async (values: Record<string, unknown>) => {
        setSaving(true);
        setError('');
        try {
            await api.post(API_PATHS.financeiro.configuracaoCaixa, {
                ...values,
                dias: Number(values.dias || 5),
                impressao: Number(values.impressao || 1),
                fundoCaixa: Number(values.fundoCaixa || 0),
                tipoModeloCaixa: Number(values.tipoModeloCaixa || 0)
            });
            navigate('/view/configuracao/listConfiguracaoCaixa');
        } catch (err: any) {
            setError(err?.response?.data?.error || err.message || 'Erro ao salvar configuração de caixa');
        } finally {
            setSaving(false);
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <FormLayout
                    title="Cadastro / Edição - Configuração de Caixa"
                    saving={saving}
                    error={error}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/view/configuracao/listConfiguracaoCaixa')}
                    submitLabel="Salvar"
                    cancelLabel="Voltar"
                    tabs={[
                        {
                            key: 'geral',
                            label: 'Geral',
                            fields: [
                                {name: 'id', label: 'ID', type: 'number', readOnly: true, span: 1},
                                {name: 'unidadeId', label: 'Unidade', type: 'select', required: true, options: [], span: 1},
                                {name: 'usuarioId', label: 'Usuário', type: 'select', required: true, options: [], span: 1},
                                {name: 'responsavelId', label: 'Autorizador / Responsável', type: 'select', required: true, options: [], span: 1},
                                {name: 'email', label: 'E-mail', type: 'email', required: true, placeholder: 'email@exemplo.com', span: 2},
                                {name: 'dias', label: 'Dias (Validade 2ª via)', type: 'number', required: true, placeholder: '5', span: 1},
                                {name: 'impressao', label: 'Impressão / Cota', type: 'number', required: true, placeholder: '1', span: 1},
                                {name: 'fundoCaixa', label: 'Fundo de Caixa', type: 'number', required: true, placeholder: '0.00', span: 1},
                                {name: 'pagPropriaUnid', label: 'Pagamento Própria Unidade', type: 'select', options: [{value: 'true', label: 'Sim'}, {value: 'false', label: 'Não'}], span: 1},
                            ]
                        },
                        {
                            key: 'documento',
                            label: 'Documento / Caixa',
                            content: (
                                <div style={{padding: '16px'}}>
                                    <h3 style={{marginBottom: '12px'}}>Modelo de Documento de Caixa</h3>
                                    <p style={{color: '#666', fontSize: '13px', marginBottom: '16px'}}>
                                        Defina o formato do documento e efetue o upload do template correspondente.
                                    </p>
                                    <div className="form-grid">
                                        <label className="form-field">
                                            <span className="form-label">Tipo Modelo Caixa</span>
                                            <select className="form-input form-select" name="tipoModeloCaixa">
                                                <option value="0">WORD</option>
                                                <option value="1">PDF</option>
                                                <option value="2">IMPRESSÃƒO</option>
                                            </select>
                                        </label>
                                        <label className="form-field">
                                            <span className="form-label">Template Arquivo (DOC / DOCX)</span>
                                            <input className="form-input" type="file" accept=".doc,.docx"/>
                                        </label>
                                    </div>
                                </div>
                            )
                        }
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
