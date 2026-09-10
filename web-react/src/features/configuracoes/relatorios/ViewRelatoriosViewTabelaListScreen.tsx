import {useState, useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable} from '../../../shared/components/DataTable';
import {ReportFilters} from '../../../shared/components/ReportFilters';
import HelpOverlay from '../../../shared/components/HelpOverlay';
import type {FiltroRelatorioWrapper} from '../../../shared/types/types';
import {api} from '../../../shared/services/api';

export default function ViewRelatoriosViewTabelaListScreen() {
    const {id} = useParams<{ id: string }>();
    const tabelaId = Number(id);
    const [filtros, setFiltros] = useState<FiltroRelatorioWrapper[]>([]);
    const [loading, setLoading] = useState(true);
    const [formato, setFormato] = useState<'PDF' | 'EXCEL'>('PDF');
    const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
    const [extratorId, setExtratorId] = useState<number | null>(null);
    const [exportError, setExportError] = useState<string>('');
    const [pollCount, setPollCount] = useState(0);

    useEffect(() => {
        const fetchFiltros = async () => {
            try {
                const response = await api.get<FiltroRelatorioWrapper[]>(`/api/relatorios/filtros/viewTabela`, {
                    params: { tabelaId }
                });
                setFiltros(response.data);
            } catch (error) {
                console.error('Erro ao carregar filtros:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchFiltros();
    }, [tabelaId]);

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

    const handleFormatoChange = (novoFormato: 'PDF' | 'EXCEL') => {
        setFormato(novoFormato);
        setExportStatus('idle');
        setExtratorId(null);
        setExportError('');
    };

    const condicoesPara = (f: FiltroRelatorioWrapper): { operation: string; value: string; value2?: string } | null => {
        if (!f.selected || !f.informacao) return null;
        const fr = f.filtroRelatorio;
        if (fr.dimensao.tipoInfo === 'TEMPO') {
            if (f.informacao.startsWith('Faixa:')) {
                const [inicio, fim] = f.informacao.replace('Faixa:', '').split(' até ').map(s => s.trim());
                if (inicio && fim) return {operation: 'BETWEEN', value: inicio, value2: fim};
            }
            const valores = f.informacao.replace(/^(Normal|Dinâmico):\s*/, '').trim();
            const m = valores.match(/^\w+\s+(.+)$/);
            return {operation: 'EQUALS', value: m ? m[1] : valores};
        }
        if (fr.dimensao.tipoInfo === 'DESCRITIVO' && f.informacao.includes(', ')) {
            return {operation: 'IN', value: f.informacao};
        }
        return {operation: 'EQUALS', value: f.informacao};
    };

    const handleExport = async () => {
        try {
            setExportStatus('processing');
            setExportError('');
            const filters: Record<string, { operation: string; value: string; value2?: string }> = {};
            filtros.forEach(f => {
                const condicao = condicoesPara(f);
                if (condicao && condicao.value) {
                    filters[f.filtroRelatorio.nome] = condicao;
                }
            });
            const response = await api.post('/api/relatorios/extrator/exportar', {
                tabelaId,
                usuarioId: 1,
                tipo: formato,
                filtros: filters
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
                params: { tipo: formato },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const ext = formato === 'EXCEL' ? 'xlsx' : 'pdf';
            link.setAttribute('download', `${extratorId}.${ext}`);
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
                    <div style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                        {(['PDF', 'EXCEL'] as const).map(f => (
                            <button
                                key={f}
                                type="button"
                                disabled={exportStatus === 'processing'}
                                onClick={() => handleFormatoChange(f)}
                                style={{height: '34px', padding: '0 12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, borderRadius: '4px', cursor: 'pointer', border: '1px solid #ccc', boxSizing: 'border-box', background: formato === f ? '#2f6f4f' : '#fff', color: formato === f ? '#fff' : '#333'}}
                            >
                                {f === 'PDF' ? 'PDF' : 'Excel'}
                            </button>
                        ))}
                    </div>
                    <button
                        className="btn-primary"
                        onClick={handleExport}
                        disabled={exportStatus === 'processing' || !Number.isInteger(tabelaId) || tabelaId <= 0}
                        title={exportStatus === 'processing' ? 'Gerando documento...' : 'Exportar todos os dados'}
                        style={{height: '34px', padding: '0 14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, borderRadius: '4px', border: '1px solid transparent', boxSizing: 'border-box'}}
                    >
                        {exportStatus === 'processing' ? 'Gerando...' : 'Exportar'}
                    </button>
                    {exportStatus === 'completed' && (
                        <button
                            className="btn-primary"
                            onClick={handleDownload}
                            title="Baixar documento gerado"
                            style={{height: '34px', padding: '0 14px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, borderRadius: '4px', border: '1px solid transparent', boxSizing: 'border-box'}}
                        >
                            Baixar {formato === 'EXCEL' ? 'Excel' : 'PDF'}
                        </button>
                    )}
                    {exportStatus === 'error' && (
                        <span style={{color: 'red', fontSize: '14px', display: 'flex', alignItems: 'center', height: '34px'}}>{exportError}</span>
                    )}
                    <HelpOverlay/>
                </div>
            </div>
            <ReportFilters filtros={filtros} onFiltersChange={handleFiltersChange} onApplyFilters={handleApplyFilters} />
            <DataTable path="/api/relatorios/grafico" hideCreate={true} hideUpdate={true} hideDelete={true} hideView={true}/>
        </main>
    </PermissionGate>
}
