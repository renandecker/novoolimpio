import {useRef} from 'react';

interface Base64FileUploadProps {
    value: string;
    onChange: (dataUrl: string) => void;
    accept?: string;
    label?: string;
    maxSizeMb?: number;
    onError?: (message: string) => void;
}

export function Base64FileUpload({
                                     value,
                                     onChange,
                                     accept = 'image/*',
                                     label,
                                     maxSizeMb = 5,
                                     onError,
                                 }: Base64FileUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (inputRef.current) inputRef.current.value = '';
        if (!file) return;
        if (maxSizeMb > 0 && file.size > maxSizeMb * 1024 * 1024) {
            onError?.(`Arquivo excede o limite de ${maxSizeMb} MB.`);
            return;
        }
        const reader = new FileReader();
        reader.onload = () => onChange(String(reader.result ?? ''));
        reader.onerror = () => onError?.('Falha ao ler o arquivo.');
        reader.readAsDataURL(file);
    };

    return (
        <div className="base64-upload">
            {value ? (
                <img className="base64-upload-preview" src={value} alt={label ?? 'Arquivo anexado'}/>
            ) : (
                <div className="base64-upload-empty">Nenhum arquivo selecionado</div>
            )}
            <div className="base64-upload-actions">
                <label className="base64-upload-button">
                    {value ? 'Trocar arquivo' : 'Selecionar arquivo'}
                    <input
                        ref={inputRef}
                        type="file"
                        accept={accept}
                        className="base64-upload-input"
                        onChange={handleChange}
                    />
                </label>
                {value && (
                    <button type="button" className="base64-upload-clear" onClick={() => onChange('')}>
                        Remover
                    </button>
                )}
            </div>
            {label && <span className="base64-upload-label">{label}</span>}
        </div>
    );
}
