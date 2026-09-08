import {useState, useEffect} from 'react';
import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';
import {ReportFilters} from '../../shared/components/ReportFilters';
import type {FiltroRelatorioWrapper} from '../../shared/types/types';
import {api} from '../../shared/services/api';

export default function ViewRelatoriosViewTabelaListScreen() {
    const [filtros, setFiltros] = useState<FiltroRelatorioWrapper[]>([]);
    const [loading, setLoading] = useState(true);
    const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
    const [extratorId, setExtratorId] = useState<number | null>(null);
    const [exportError, setExportError] = useState<string>('');
    const [pollCount, setPollCount] = useState(0);

    useEffect(() => {
        const fetchFiltros = async () => {
            try {
                const response = await api.get<FiltroRelatorioWrapper[]>(`/api/relatorios/filtros/viewTabela`);
                setFiltros(response.data);
            } catch (error) {
                console.error('Erro ao carregar filtros:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFiltros();
    }, []);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (exportStatus === 'processing' && extratorId) {
            interval = setInterval(async () => {
                try {
                    const response = await api.get(`/api/relatorios/extrator/${extratorId}`);
                    const data = response.data;
                    if (data.situacao === 'Gerado') {
                        setExportStatus('completed');
                        clearInterval(interval);
                    } else if (data.situacao === 'Erro') {
                        setExportStatus('error');
                        setExportError(data.log || 'Erro ao gerar documento');
                        clearInterval(interval);
                    }
                } catch (error) {
                    console.error('Erro ao verificar status:', error);
                }
            }, 2000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [exportStatus, extratorId]);

    const handleFiltersChange = (newFiltros: FiltroRelatorioWrapper[]) => {
        setFiltros(newFiltros);
        setExportStatus('idle');
        setExtratorId(null);
        setExportError('');
    };

    const handleApplyFilters = () => {
        console.log('Aplicar filtros da tabela');
    };

    const handleExport = async () => {
        try {
            setExportStatus('processing');
            setExportError('');
            const filtrosMap: Record<string, any> = {};
            filtros.forEach(f => {
                if (f.value !== null && f.value !== undefined && f.value !== '') {
                    filtrosMap[f.campo] = { operation: f.operacao, value: f.value };
                }
            });
            const response = await api.post('/api/relatorios/extrator/exportar', {
                tabelaId: 1,
                usuarioId: 1,
                tipo: 'PDF',
                filtros: filtrosMap
            });
            setExtratorId(response.data.id);
        } catch (error) {
            console.error('Erro ao iniciar exportacao:', error);
            setExportStatus('error');
            setExportError('Erro ao iniciar exportacao');
        }
    };

    const handleDownload = async () => {
        if (!extratorId) return;
        try {
            const response = await api.get(`/api/relatorios/extrator/${extratorId}/arquivo`, {
                params: { tipo: 'PDF' },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${extratorId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Erro ao baixar arquivo:', error);
        }
    };

    if (loading) {
        return <PermissionGate permission="READ"><main><h1>View Tabela</h1><div>Carregando...</div></main></PermissionGate>;
    }

    return <PermissionGate permission="READ">
        <main>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                <h1>View Tabela</h1>
                <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                    <button
                        className="btn-primary"
                        onClick={handleExport}
                        disabled={exportStatus === 'processing'}
                        title={exportStatus === 'processing' ? 'Gerando documento...' : 'Exportar todos os dados'}
                    >
                        {exportStatus === 'processing' ? 'Gerando...' : 'Exportar'}
                    </button>
                    {exportStatus === 'completed' && (
                        <button
                            className="btn-primary"
                            onClick={handleDownload}
                            title="Baixar documento gerado"
                        >
                            Baixar PDF
                        </button>
                    )}
                    {exportStatus === 'error' && (
                        <span style={{color: 'red', fontSize: '14px'}}>{exportError}</span>
                    )}
                </div>
            </div>
            <ReportFilters filtros={filtros} onFiltersChange={handleFiltersChange} onApplyFilters={handleApplyFilters} />
            <DataTable path="/api/view/relatorios/viewTabela"/>
        </main>
    </PermissionGate>
}