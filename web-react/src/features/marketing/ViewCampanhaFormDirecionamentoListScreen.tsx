import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {PermissionGate} from '../../shared/services/permissions';
import {FormLayout, FormTabConfig} from '../../shared/components/FormLayout';
import {MasterDetail} from '../../shared/components/MasterDetail';
import {api} from '../../shared/services/api';
import type {ApiItem} from '../../shared/types/types.ts';

const OPERADOR_COLUMNS = [
    {key: 'login', label: 'Login'},
    {key: 'nome', label: 'Nome'},
    {key: 'email', label: 'E-mail'},
];

const DIRECIONAMENTO_OPTIONS = [
    {value: 'PRIORITARIA', label: 'Prioritária'},
    {value: 'NORMAL', label: 'Normal'},
    {value: 'RETORNO', label: 'Retorno'},
];

export default function ViewCampanhaFormDirecionamentoListScreen() {
    const navigate = useNavigate();
    const [operadores, setOperadores] = useState<ApiItem[]>([]);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const tabs: FormTabConfig[] = [
        {
            key: 'direcionamento',
            label: 'Direcionamento',
            fields: [
                {name: 'campanhaId', label: 'ID Campanha', readOnly: true, placeholder: 'Selecionada na listagem'},
                {name: 'campanhaDescricao', label: 'Campanha', readOnly: true},
                {name: 'direcionamento', label: 'Direcionamento', type: 'select', required: true, options: DIRECIONAMENTO_OPTIONS},
            ],
        },
        {
            key: 'operadores',
            label: 'Operadores',
            content: (
                <MasterDetail
                    label="Operadores (telemarketing)"
                    source="/api/basico/usuario"
                    valueKey="id"
                    searchKeys={['login', 'nome', 'email']}
                    columns={OPERADOR_COLUMNS}
                    items={operadores}
                    onChange={setOperadores}
                />
            ),
        },
    ];

    const handleSubmit = async (values: Record<string, unknown>) => {
        if (!values.direcionamento) { setError('Selecione o direcionamento'); return; }
        if (operadores.length === 0) { setError('Selecione pelo menos um operador'); return; }
        setError('');
        setSaving(true);
        try {
            await api.post('/api/view/campanha/formDirecionamento', {
                campanhaId: values.campanhaId ? Number(values.campanhaId) : null,
                direcionamento: values.direcionamento,
                operadores: operadores.map(o => (o as any).id),
            });
            alert('Direcionamento gerado com sucesso!');
            navigate('/view/campanha/listCampanha');
        } catch (e: any) {
            setError(e?.response?.data?.message ?? 'Erro ao gerar direcionamento');
        } finally {
            setSaving(false);
        }
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <FormLayout
                    title="Direcionamento de Pacotes"
                    tabs={tabs}
                    initialValues={{}}
                    onSubmit={handleSubmit}
                    onCancel={() => navigate('/view/campanha/listCampanha')}
                    saving={saving}
                    error={error}
                    submitLabel="Gerar Pacote"
                    cancelLabel="Voltar"
                />
            </main>
        </PermissionGate>
    );
}
