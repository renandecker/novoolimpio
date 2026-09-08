import {useState} from 'react';
import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, type DataTableColumn} from '../../shared/components/DataTable';
import type {ApiItem} from '../../features/auth/types';
import {api} from '../../shared/services/api';

const asRecord = (item: ApiItem) => item as unknown as Record<string, unknown>;

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const COLUMNS: DataTableColumn[] = [
    {key: 'data', label: 'Data', render: (item) => formatDate(asRecord(item).data)},
    {key: 'usuario_descricao', label: 'Usuário'},
    {key: 'numero_linhas', label: 'Nº Linhas'},
    {
        key: 'prospectos_deletados_pacote',
        label: 'Prospectos Deletados',
        render: (item) => {
            const value = asRecord(item).prospectos_deletados_pacote;
            return value === -1 ? 'carregando e atualizando' : String(value ?? '');
        },
    },
];

export default function ViewArquivoProconListArquivoProconListScreen() {
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage('');

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const base64Content = e.target?.result as string;
                await api.post('/api/comercial/arquivo-procon/upload', {
                    fileName: file.name,
                    fileData: base64Content,
                });
                setMessage('Arquivo enviado com sucesso para processamento via Kafka!');
                window.location.reload();
            } catch (error: any) {
                setMessage(`Erro ao enviar arquivo: ${error?.response?.data?.error || error.message}`);
            } finally {
                setUploading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Arquivo Procon</h1>
                <div style={{margin: '15px 0', padding: '15px', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontWeight: 'bold'}}>Adicionar Arquivo (CSV)</label>
                    <input type="file" accept=".csv" onChange={handleFileUpload} disabled={uploading} />
                    {uploading && <span style={{marginLeft: '10px', color: '#666'}}>Atualizando, pode levar alguns minutos...</span>}
                    {message && <div style={{marginTop: '8px', color: message.includes('Erro') ? 'red' : 'green'}}>{message}</div>}
                </div>
                <DataTable 
                    path="/api/comercial/arquivo-procon/paged" 
                    columns={COLUMNS}
                    maxMainColumns={COLUMNS.length}
                    hideCreate={true}
                    hideUpdate={true}
                    hideDelete={true}
                />
            </main>
        </PermissionGate>
    );
}
