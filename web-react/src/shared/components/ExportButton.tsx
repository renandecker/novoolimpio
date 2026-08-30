import {useState, useEffect} from 'react';
import {api} from './api';

interface ExportButtonProps {
    reportId: number;
    reportType: string;
    data: { colunas: string[]; linhas: Record<string, unknown>[] };
    onSuccess: () => void;
}

export function ExportButton({reportId, reportType, data, onSuccess}: ExportButtonProps) {
    const [showModal, setShowModal] = useState(false);
    const [templates, setTemplates] = useState<Array<{id: number, nome: string}>>([]);
    const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
    const [exportType, setExportType] = useState<'PDF' | 'DOCX'>('PDF');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (showModal) {
            api.get<{templates: Array<{id: number, nome: string}>}>(`/api/relatorios/documentos/opcoes`, {
                params: { tipoRelatorio: reportType, relatorioId: reportId }
            }).then(response => {
                setTemplates(response.data.templates || []);
                if (response.data.templates?.length > 0) {
                    setSelectedTemplate(response.data.templates[0].id);
                }
            }).catch(() => setTemplates([]));
        }
    }, [showModal, reportId, reportType]);

    const handleExport = async () => {
        if (exportType !== 'EXCEL' && !selectedTemplate) {
            setError('Selecione um template');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await api.post<{ fileName: string; contentType: string; base64Data: string }>(
                `/api/relatorios/documentos/exportar/tabela/${reportId}`,
                { tipoExportacao: exportType, templateId: selectedTemplate, parametros: {} }
            );
            const { fileName, contentType, base64Data } = response.data;
            const blob = new Blob([Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], { type: contentType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
            setShowModal(false);
            onSuccess();
        } catch (err) {
            setError('Erro ao exportar: ' + (err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="export-button-group">
            <button className="btnyellow" onClick={() => { setError(null); setShowModal(true); }}>
                <i className="fa fa-download"/> Exportar
            </button>
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal form-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="div_form">
                            <div className="form-title">Exportar Relatório</div>
                            <div className="table_form">
                                <div className="form-field">
                                    <span className="form-label">Formato</span>
                                    <div style={{display: 'flex', gap: '16px'}}>
                                        <label>
                                            <input type="radio" value="PDF" checked={exportType === 'PDF'}
                                                   onChange={() => setExportType('PDF')}/>
                                            <i className="fa fa-file-pdf-o"/> PDF
                                        </label>
                                        <label>
                                            <input type="radio" value="DOCX" checked={exportType === 'DOCX'}
                                                   onChange={() => setExportType('DOCX')}/>
                                            <i className="fa fa-file-word-o"/> DOCX
                                        </label>
                                    </div>
                                </div>
                                {(exportType === 'PDF' || exportType === 'DOCX') && (
                                    <div className="form-field">
                                        <span className="form-label">Template</span>
                                        <select className="form-input form-select"
                                                value={selectedTemplate ?? ''}
                                                onChange={(e) => setSelectedTemplate(e.target.value ? Number(e.target.value) : null)}
                                                disabled={templates.length === 0 || loading}>
                                            <option value="">-- Selecione --</option>
                                            {templates.map(t => (
                                                <option key={t.id} value={t.id}>{t.nome}</option>
                                            ))}
                                        </select>
                                        {templates.length === 0 && <p className="form-empty">Nenhum template configurado.</p>}
                                    </div>
                                )}
                                {error && <p style={{color: 'red'}}>{error}</p>}
                                <div className="modal-actions form-footer">
                                    <button type="button" className="btn-form-back" onClick={() => setShowModal(false)}>Cancelar</button>
                                    <button type="button" className="btn-form-save" onClick={handleExport} disabled={loading || (exportType !== 'EXCEL' && !selectedTemplate)}>
                                        {loading ? 'Exportando...' : `Exportar ${exportType}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
