import {useState} from 'react';

import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable, type DataTableColumn, type DataTableRowAction, type DataTableToolbarButton} from '../../../shared/components/DataTable';
import {api} from '../../../shared/services/api';

const formatDate = (value: unknown): string => {
    if (value === null || value === undefined || value === '') return '';
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value));
    if (!match) return String(value);
    return `${match[3]}/${match[2]}/${match[1]}`;
};

const EXTRATOR_COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'usuario_descricao', label: 'Usuário'},
    {key: 'tabela_descricao', label: 'Tabela'},
    {key: 'data_inicio', label: 'Data Início', render: (item) => formatDate((item as any).data_inicio)},
    {key: 'data_fim', label: 'Data Fim', render: (item) => formatDate((item as any).data_fim)},
    {key: 'tipo', label: 'Tipo'},
    {key: 'situacao', label: 'Situação', render: (item) => {
        const s = String((item as any).situacao ?? '');
        return <span className={`status${s.replace(/\s+/g, '')}`}>{s}</span>;
    }},
];

export default function ViewRelatoriosExtratorListScreen() {
    const [revision, setRevision] = useState(0);
    const [notice, setNotice] = useState('');
    const [sqlItem, setSqlItem] = useState<any | null>(null);
    const [logItem, setLogItem] = useState<any | null>(null);

    const notify = (message: string) => {
        setNotice(message);
        window.setTimeout(() => setNotice(''), 6000);
    };

    const refresh = () => setRevision((r) => r + 1);

    const removeAntigos = async () => {
        if (!window.confirm('Remover todas as extrações antigas (remove CSV/PDF antigos)?')) return;
        try {
            await api.post('/api/relatorios/extrator/remover');
            notify('Extrator limpo: extrações antigas marcadas como removidas.');
            refresh();
        } catch (error) {
            notify(`Falha ao limpar extrator: ${(error as Error).message}`);
        }
    };

    const reiniciar = async (item: any) => {
        try {
            await api.post(`/api/relatorios/extrator/${item.id}/reiniciar`);
            notify(`Extração #${item.id} recolocada na fila.`);
            refresh();
        } catch (error) {
            notify(`Falha ao reiniciar extração #${item.id}: ${(error as Error).message}`);
        }
    };

    const download = async (item: any, tipo: 'CSV' | 'PDF') => {
        try {
            const extensao = tipo === 'PDF' ? 'pdf' : 'csv';
            const resp = await api.get(`/api/relatorios/extrator/${item.id}/arquivo`, {
                params: {tipo},
                responseType: 'blob',
            });
            const url = URL.createObjectURL(resp.data as Blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${item.id}.${extensao}`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (error) {
            notify(`Arquivo da extração #${item.id} ainda não disponível.`);
        }
    };

    const remover = async (item: any) => {
        if (!window.confirm(`Deseja realmente excluir a extração #${item.id}?`)) return;
        try {
            await api.delete(`/api/relatorios/extrator/${item.id}`);
            notify(`Extração #${item.id} removida.`);
            refresh();
        } catch (error) {
            notify(`Falha ao remover extração #${item.id}: ${(error as Error).message}`);
        }
    };

    const extraRowActions: DataTableRowAction[] = [
        {
            key: 'reiniciar',
            title: 'Reiniciar',
            icon: <i className="fa fa-refresh" />,
            permission: 'UPDATE',
            onClick: reiniciar,
        },
        {
            key: 'csv',
            title: 'CSV',
            icon: <i className="fa fa-download" />,
            permission: 'EXECUTE',
            className: 'btngreen',
            onClick: (item) => download(item, 'CSV'),
        },
        {
            key: 'pdf',
            title: 'PDF',
            icon: <i className="fa fa-download" />,
            permission: 'EXECUTE',
            className: 'btnred',
            onClick: (item) => download(item, 'PDF'),
        },
        {
            key: 'sql',
            title: 'SQL',
            icon: <i className="fa fa-code" />,
            permission: 'EXECUTE',
            className: 'btn-primary',
            onClick: (item) => setSqlItem(item),
        },
        {
            key: 'log',
            title: 'Log',
            icon: <i className="fa fa-file-text-o" />,
            permission: 'EXECUTE',
            className: 'btnyellow',
            onClick: (item) => setLogItem(item),
        },
        {
            key: 'remover',
            title: 'Remover',
            icon: <i className="fa fa-trash" />,
            className: 'btnred',
            permission: 'DELETE',
            onClick: remover,
        },
    ];

    const extraToolbarButtons: DataTableToolbarButton[] = [
        {
            label: 'Atualizar',
            title: 'Atualizar lista de extrações',
            onClick: refresh,
        },
        {
            label: 'Remove extrações antigas',
            title: 'Marca como removidas as extrações antigas e limpa os arquivos',
            className: 'btnred',
            onClick: removeAntigos,
        },
    ];

    const modalStyle: React.CSSProperties = {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20,
    };
    const modalBoxStyle: React.CSSProperties = {
        background: '#fff', borderRadius: 8, maxWidth: 720, width: '100%', maxHeight: '80%',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
    };

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Extrator</h1>
                {notice ? <div style={{margin: '10px 0', padding: '10px', backgroundColor: '#fff3cd', borderRadius: 4}}>{notice}</div> : null}
<DataTable
                        key={revision}
                        path="/api/view/relatorios/extrator"
                        columns={EXTRATOR_COLUMNS}
                        maxMainColumns={EXTRATOR_COLUMNS.length}
                        hideCreate
                        hideUpdate
                        hideView
                        hideDelete
                        extraToolbarButtons={extraToolbarButtons}
                        extraRowActions={extraRowActions}
                    />

                {sqlItem ? (
                    <div style={modalStyle} onClick={() => setSqlItem(null)}>
                        <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
                            <div style={{padding: '12px 16px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <h3 style={{margin: 0}}>SQL da extração #{sqlItem.id}</h3>
                                <button className="btnred" onClick={() => setSqlItem(null)}>Fechar</button>
                            </div>
                            <pre style={{padding: 16, overflow: 'auto', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
                                {String(sqlItem.sql ?? '')}
                            </pre>
                        </div>
                    </div>
                ) : null}

                {logItem ? (
                    <div style={modalStyle} onClick={() => setLogItem(null)}>
                        <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
                            <div style={{padding: '12px 16px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <h3 style={{margin: 0}}>Log da extração #{logItem.id}</h3>
                                <button className="btnred" onClick={() => setLogItem(null)}>Fechar</button>
                            </div>
                            <pre style={{padding: 16, overflow: 'auto', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
                                {String(logItem.log ?? '(sem log)')}
                            </pre>
                        </div>
                    </div>
                ) : null}
            </main>
        </PermissionGate>
    );
}
