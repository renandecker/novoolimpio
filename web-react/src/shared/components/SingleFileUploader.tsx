import {useState, useCallback, ChangeEvent, DragEvent} from 'react';

export interface SingleFileUploaderProps {
    accept?: string;
    maxSizeMb?: number;
    disabled?: boolean;
    onFileSelect?: (file: File | null) => void;
    onUpload?: (file: File) => Promise<void>;
    label?: string;
    showPreview?: boolean;
}

export function SingleFileUploader({
    accept = '*/*',
    maxSizeMb = 10,
    disabled = false,
    onFileSelect,
    onUpload,
    label,
    showPreview = true,
}: SingleFileUploaderProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const validateFile = useCallback((file: File): string | null => {
        const maxSize = maxSizeMb * 1024 * 1024;
        if (file.size > maxSize) {
            return `Arquivo excede o limite de ${maxSizeMb} MB.`;
        }
        if (accept !== '*/*') {
            const acceptedTypes = accept.split(',').map(t => t.trim());
            const isAccepted = acceptedTypes.some(type => {
                if (type.startsWith('.')) {
                    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
                    return ext === type.toLowerCase();
                }
                if (type.endsWith('/*')) {
                    const prefix = type.split('/')[0];
                    return file.type.startsWith(`${prefix}/`);
                }
                return file.type === type;
            });
            if (!isAccepted) {
                return `Tipo de arquivo não permitido. Tipos aceitos: ${accept}`;
            }
        }
        return null;
    }, [accept, maxSizeMb]);

    const createPreview = useCallback((file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
            reader.readAsDataURL(file);
        });
    }, []);

    const handleFileChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) {
            setFile(null);
            setPreview(null);
            onFileSelect?.(null);
            return;
        }

        const validationError = validateFile(selectedFile);
        if (validationError) {
            setError(validationError);
            setFile(null);
            setPreview(null);
            onFileSelect?.(null);
            return;
        }

        setError(null);
        setFile(selectedFile);
        onFileSelect?.(selectedFile);

        if (showPreview && selectedFile.type.startsWith('image/')) {
            try {
                const previewUrl = await createPreview(selectedFile);
                setPreview(previewUrl);
            } catch {
                setPreview(null);
            }
        } else {
            setPreview(null);
        }
    }, [validateFile, showPreview, createPreview, onFileSelect]);

    const handleDrop = useCallback(async (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();

        if (disabled) return;

        const droppedFile = event.dataTransfer.files[0];
        if (!droppedFile) return;

        const validationError = validateFile(droppedFile);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError(null);
        setFile(droppedFile);
        onFileSelect?.(droppedFile);

        if (showPreview && droppedFile.type.startsWith('image/')) {
            try {
                const previewUrl = await createPreview(droppedFile);
                setPreview(previewUrl);
            } catch {
                setPreview(null);
            }
        } else {
            setPreview(null);
        }
    }, [disabled, validateFile, showPreview, createPreview, onFileSelect]);

    const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    }, []);

    const handleRemove = useCallback(() => {
        setFile(null);
        setPreview(null);
        setError(null);
        onFileSelect?.(null);
    }, [onFileSelect]);

    const handleUpload = useCallback(async () => {
        if (!file || !onUpload) return;

        setUploading(true);
        setError(null);
        try {
            await onUpload(file);
        } catch (err: any) {
            setError(err?.message || 'Erro ao fazer upload do arquivo.');
        } finally {
            setUploading(false);
        }
    }, [file, onUpload]);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const getFileIcon = (file: File): string => {
        if (file.type.startsWith('image/')) return '🖼️';
        if (file.type.startsWith('video/')) return '🎬';
        if (file.type.startsWith('audio/')) return '🎵';
        if (file.type === 'application/pdf') return '📄';
        if (file.type.includes('word') || file.type.includes('document')) return '📝';
        if (file.type.includes('spreadsheet') || file.type.includes('excel')) return '📊';
        if (file.type.includes('zip') || file.type.includes('compressed')) return '📦';
        return '📎';
    };

    return (
        <div className={`single-file-uploader ${disabled ? 'disabled' : ''}`}>
            <div
                className="single-file-uploader-dropzone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !disabled && document.getElementById('single-file-input')?.click()}
            >
                <input
                    id="single-file-input"
                    type="file"
                    className="single-file-uploader-input"
                    accept={accept}
                    onChange={handleFileChange}
                    disabled={disabled}
                    tabIndex={-1}
                />
                <div className="single-file-uploader-icon">📁</div>
                <span className="single-file-uploader-text">
                    {label || 'Clique ou arraste um arquivo aqui'}
                </span>
                {accept !== '*/*' && (
                    <span className="single-file-uploader-hint">
                        Tipos aceitos: {accept}
                    </span>
                )}
            </div>

            {error && <div className="single-file-uploader-error">{error}</div>}

            {file && (
                <div className="single-file-uploader-selected">
                    {showPreview && preview && file.type.startsWith('image/') ? (
                        <img src={preview} alt={file.name} className="single-file-uploader-preview" />
                    ) : (
                        <span className="single-file-uploader-file-icon">{getFileIcon(file)}</span>
                    )}
                    <div className="single-file-uploader-info">
                        <span className="single-file-uploader-name" title={file.name}>{file.name}</span>
                        <span className="single-file-uploader-size">{formatFileSize(file.size)}</span>
                    </div>
                    <button
                        type="button"
                        className="single-file-uploader-remove"
                        onClick={handleRemove}
                        disabled={uploading}
                        aria-label="Remover arquivo"
                    >
                        ✕
                    </button>
                </div>
            )}

            {file && onUpload && (
                <button
                    type="button"
                    className="single-file-uploader-upload-btn"
                    onClick={handleUpload}
                    disabled={uploading}
                >
                    {uploading ? 'Enviando...' : 'Enviar arquivo'}
                </button>
            )}

            {label && <label className="single-file-uploader-label">{label}</label>}
        </div>
    );
}

export default SingleFileUploader;