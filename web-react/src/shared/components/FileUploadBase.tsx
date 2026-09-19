import {useRef, useState, useCallback, DragEvent, ChangeEvent} from 'react';

export interface FileUploadBaseProps {
    value?: string | string[];
    onChange?: (files: File[] | string[]) => void;
    onFilesChange?: (files: File[]) => void;
    accept?: string;
    allowsMultiple?: boolean;
    maxSize?: number;
    maxSizeMb?: number;
    disabled?: boolean;
    label?: string;
    showPreview?: boolean;
    onError?: (message: string) => void;
}

interface FileItem {
    file: File;
    preview?: string;
    progress?: number;
    error?: string;
}

export function FileUploadBase({
    value,
    onChange,
    onFilesChange,
    accept = '*/*',
    allowsMultiple = true,
    maxSize,
    maxSizeMb = 10,
    disabled = false,
    label,
    showPreview = true,
    onError,
}: FileUploadBaseProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<FileItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragError, setDragError] = useState<string | null>(null);

    const effectiveMaxSize = maxSize ?? maxSizeMb * 1024 * 1024;

    const createPreview = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
            reader.readAsDataURL(file);
        });
    };

    const validateFile = (file: File): string | null => {
        if (effectiveMaxSize > 0 && file.size > effectiveMaxSize) {
            return `Arquivo "${file.name}" excede o limite de ${maxSizeMb} MB.`;
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
                return `Tipo de arquivo "${file.name}" não permitido.`;
            }
        }
        return null;
    };

    const processFiles = useCallback(async (fileList: FileList) => {
        setDragError(null);
        const newFiles: FileItem[] = [];

        for (const file of Array.from(fileList)) {
            const error = validateFile(file);
            if (error) {
                onError?.(error);
                continue;
            }

            let preview: string | undefined;
            if (showPreview && file.type.startsWith('image/')) {
                try {
                    preview = await createPreview(file);
                } catch {
                    preview = undefined;
                }
            }

            newFiles.push({file, preview, progress: 0});
        }

        if (newFiles.length > 0) {
            setFiles(prev => allowsMultiple ? [...prev, ...newFiles] : newFiles);
            if (onFilesChange) {
                const allFiles = allowsMultiple ? [...files.map(f => f.file), ...newFiles.map(f => f.file)] : newFiles.map(f => f.file);
                onFilesChange(allFiles);
            }
        }
    }, [allowsMultiple, effectiveMaxSize, accept, showPreview, onError, onFilesChange, files]);

    const handleDrop = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        const droppedFiles = event.dataTransfer.files;
        if (droppedFiles.length > 0) {
            processFiles(droppedFiles);
        }
    }, [disabled, processFiles]);

    const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!disabled) setIsDragging(true);
    }, [disabled]);

    const handleDragLeave = useCallback((event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleInputChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = event.target.files;
        if (selectedFiles && selectedFiles.length > 0) {
            processFiles(selectedFiles);
        }
        if (inputRef.current) inputRef.current.value = '';
    }, [processFiles]);

    const removeFile = useCallback((index: number) => {
        setFiles(prev => {
            const next = prev.filter((_, i) => i !== index);
            if (onFilesChange) {
                onFilesChange(next.map(f => f.file));
            }
            return next;
        });
    }, [onFilesChange]);

    const clearFiles = useCallback(() => {
        setFiles([]);
        if (onFilesChange) onFilesChange([]);
    }, [onFilesChange]);

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

    const hasValue = value && (Array.isArray(value) ? value.length > 0 : value !== '');

    return (
        <div className={`file-upload-base ${isDragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}`}>
            <div
                className="file-upload-dropzone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && inputRef.current?.click()}
                role="button"
                tabIndex={disabled ? -1 : 0}
                onKeyDown={e => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); inputRef.current?.click(); }}}
            >
                <input
                    ref={inputRef}
                    type="file"
                    className="file-upload-input"
                    accept={accept}
                    multiple={allowsMultiple}
                    onChange={handleInputChange}
                    disabled={disabled}
                    tabIndex={-1}
                />
                <div className="file-upload-icon">📁</div>
                <button
                    type="button"
                    className="file-upload-btn"
                    onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                    disabled={disabled}
                    aria-label="Selecionar arquivos"
                >
                    Selecionar arquivos
                </button>
            </div>

            {dragError && <div className="file-upload-error">{dragError}</div>}

            {(files.length > 0 || hasValue) && (
                <div className="file-upload-list">
                    {files.map((item, index) => (
                        <div key={index} className="file-upload-item">
                            {showPreview && item.preview ? (
                                <img src={item.preview} alt={item.file.name} className="file-upload-preview" />
                            ) : (
                                <span className="file-upload-file-icon">{getFileIcon(item.file)}</span>
                            )}
                            <div className="file-upload-info">
                                <span className="file-upload-name" title={item.file.name}>{item.file.name}</span>
                                <span className="file-upload-size">{formatFileSize(item.file.size)}</span>
                            </div>
                            {item.error && <span className="file-upload-item-error">{item.error}</span>}
                            <button
                                type="button"
                                className="file-upload-remove"
                                onClick={e => { e.stopPropagation(); removeFile(index); }}
                                aria-label={`Remover ${item.file.name}`}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                    {hasValue && !files.length && Array.isArray(value) && value.map((v, i) => (
                        <div key={i} className="file-upload-item existing">
                            <span className="file-upload-file-icon">📎</span>
                            <div className="file-upload-info">
                                <span className="file-upload-name">Arquivo existente</span>
                            </div>
                        </div>
                    ))}
                    {hasValue && !files.length && !Array.isArray(value) && (
                        <div className="file-upload-item existing">
                            <span className="file-upload-file-icon">📎</span>
                            <div className="file-upload-info">
                                <span className="file-upload-name">Arquivo existente</span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {files.length > 0 && (
                <div className="file-upload-actions">
                    <button
                        type="button"
                        className="file-upload-clear-btn"
                        onClick={clearFiles}
                        disabled={disabled}
                    >
                        Remover todos
                    </button>
                </div>
            )}

            {label && <label className="file-upload-label">{label}</label>}
        </div>
    );
}

export default FileUploadBase;