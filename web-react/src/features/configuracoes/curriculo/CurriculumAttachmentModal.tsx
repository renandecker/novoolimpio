import { useState, useEffect, useRef} from 'react';
import {api} from '../../../shared/services/api';
import {swalConfirm} from '../../../shared/components/swal';

interface CurriculumAttachmentModalProps {
    visible: boolean;
    onClose: () => void;
    onAttachmentUpdate: (fileBase64: string | null, fileName: string) => void;
    currentFileName?: string;
    currentFileBase64?: string | null;
}

export function CurriculumAttachmentModal({
    visible,
    onClose,
    onAttachmentUpdate,
    currentFileName,
    currentFileBase64,
}: CurriculumAttachmentModalProps) {
    const [sourceType, setSourceType] = useState<'library' | 'camera'>('library');
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [fileName, setFileName] = useState<string>('');
    const [fileSelected, setFileSelected] = useState<boolean>(!!currentFileBase64);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (visible) {
            setPreview(currentFileBase64 ? null : null);
            setSourceType('library');
            setFileName(currentFileName || '');
            setFileSelected(!!currentFileBase64);
        }
    }, [visible, currentFileBase64, currentFileName]);

    

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        try {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result?.toString().split(',')[1];
                setPreview(base64 ? `data:image/jpeg;base64,${base64}` : reader.result?.toString() ?? null);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error reading file:', error);
        }
    };

    const uploadDocument = async () => {
        if (!preview || !fileName) return;
        setUploading(true);
        try {
            const base64Data = preview.split('base64,')[1] || '';
            const {data} = await api.put<{curriculo: string}>(`/api/basico/usuario/curriculo-base64`, {curriculo: base64Data});
            if (data.curriculo) {
                onAttachmentUpdate(data.curriculo || '', data.curriculo ? fileName : '');
                alert('Sucesso');
                onClose();
            } else {
                alert('Não foi possível processar o documento.');
            }
        } catch (e: any) {
            const msg = e?.response?.data?.error || 'Erro ao fazer upload do documento.';
            alert(msg);
        } finally {
            setUploading(false);
        }
    };

    const removeDocument = async () => {
        if (!(await swalConfirm('Tem certeza que deseja remover o documento de currículo?', {title: 'Remover documento', confirmText: 'Remover', danger: true}))) return;
        setUploading(true);
        try {
            await api.put(`/api/basico/usuario/curriculo-base64`, {curriculo: ''});
            onAttachmentUpdate('', '');
            alert('Documento de currículo removido com sucesso!');
            onClose();
        } catch (e: any) {
            const msg = e?.response?.data?.error || 'Erro ao remover o documento.';
            alert(msg);
        } finally {
            setUploading(false);
        }
    };

    if (!visible) return null;

    return (
        <div style={{
            position: 'fixed' as const,
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
            padding: '16px'
        }} onClick={onClose}>
            <div style={{
                backgroundColor: '#fff',
                borderRadius: '16px',
                padding: '20px',
                maxHeight: '90%',
                maxWidth: '500px',
                width: '100%',
                boxSizing: 'border-box'
            }} onClick={e => e.stopPropagation()}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    borderBottom: '1px solid #e5e5e5',
                    paddingBottom: '16px'
                }}>
                    <h3 style={{margin: 0, fontSize: '18px', fontWeight: 600, color: '#1d1d1f'}}>Anexar Currículo</h3>
                    <button onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '20px',
                        color: '#888',
                        cursor: 'pointer',
                        padding: '4px'
                    }}>✕</button>
                </div>

                <div style={{marginTop: '20px'}}>
                    <input
                        type="text"
                        placeholder="Nome do arquivo (opcional)"
                        value={fileName}
                        onChange={e => setFileName(e.target.value)}
                        disabled={uploading}
                        style={{
                            width: '100%',
                            borderWidth: '1px',
                            borderColor: '#ddd',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '16px',
                            fontSize: '14px'
                        }}
                    />
                    <input
                        type="file"
                        accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        ref={fileInputRef}
                        style={{display: 'none'}}
                        onChange={handleFileSelect}
                    />

                    {preview ? (
                        <div style={{
                            width: '100%',
                            aspectRatio: '1',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            backgroundColor: '#f5f5f5',
                            marginBottom: '20px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <img src={preview} alt="Preview" style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain'
                            }} />
                        </div>
                    ) : currentFileBase64 ? (
                        <div style={{
                            width: '100%',
                            aspectRatio: '1',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            backgroundColor: '#f5f5f5',
                            marginBottom: '20px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <span style={{color: '#666', fontSize: '14px'}}>Documento de currículo carregado</span>
                        </div>
                    ) : (
                        <div style={{
                            width: '100%',
                            aspectRatio: '1',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            backgroundColor: '#f5f5f5',
                            marginBottom: '20px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <span style={{color: '#666', fontSize: '14px'}}>Nenhum arquivo selecionado</span>
                        </div>
                    )}

                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap',
                        marginBottom: '16px'
                    }}>
                        <button
                            type="button"
                            onClick={() => { setSourceType('library'); fileInputRef.current?.click(); }}
                            disabled={uploading}
                            style={{
                                flex: '1',
                                minWidth: '140px',
                                padding: '14px',
                                backgroundColor: '#f0f0f0',
                                borderRadius: '8px',
                                border: '1px solid #ddd',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'pointer'
                            }}
                        >
                            Selecionar arquivo
                        </button>
                        {preview && (
                            <button
                                type="button"
                                onClick={() => setPreview(null)}
                                disabled={uploading}
                                style={{
                                    flex: '1',
                                    minWidth: '140px',
                                    padding: '14px',
                                    backgroundColor: '#e53935',
                                    borderRadius: '8px',
                                    border: '1px solid #e53935',
                                    color: '#fff',
                                    fontWeight: 600,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                Remover
                            </button>
                        )}
                    </div>

                    {currentFileBase64 && (
                        <button
                            type="button"
                            onClick={removeDocument}
                            disabled={uploading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                backgroundColor: '#e53935',
                                borderRadius: '8px',
                                border: '1px solid #e53935',
                                color: '#fff',
                                fontWeight: 600,
                                marginBottom: '12px',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            Remover documento
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={uploadDocument}
                        disabled={uploading || !preview || !fileName}
                        style={{
                            width: '100%',
                            padding: '14px',
                            backgroundColor: uploading ? '#cccccc' : '#2a5a88',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: uploading ? 'default' : 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        {uploading ? 'Salvando...' : 'Salvar documento'}
                    </button>
                </div>
            </div>
        </div>
    );
}
