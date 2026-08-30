import {useRef, useState, useEffect} from 'react';
import {api} from './api';
import './PhotoUploadModal.css';

interface PhotoUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPhotoUpdate: (fotoUrl: string) => void;
    currentFoto?: string;
    username?: string;
}

export function PhotoUploadModal({isOpen, onClose, onPhotoUpdate, currentFoto, username}: PhotoUploadModalProps) {
    const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);

    useEffect(() => {
        if (isOpen) {
            setPreview(null);
            setError('');
            setSuccess(false);
            setActiveTab('upload');
        }
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isOpen]);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Por favor, selecione um arquivo de imagem.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('A imagem deve ter no maximo 5 MB.');
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setPreview(String(reader.result));
        reader.readAsDataURL(file);
    };

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {facingMode: 'user', width: {ideal: 640}, height: {ideal: 480}},
                audio: false
            });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch {
            setError('Nao foi possivel acessar a camera. Verifique as permissoes.');
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setPreview(dataUrl);
            stopCamera();
            setActiveTab('upload');
        }
    };

    const uploadPhoto = async () => {
        if (!preview || !username) return;
        setUploading(true);
        setError('');
        try {
            const res = await fetch(preview);
            const blob = await res.blob();
            const ext = blob.type.includes('png') ? '.png' : '.jpg';
            const file = new File([blob], username + ext, {type: blob.type});
            const formData = new FormData();
            formData.append('file', file);
            const {data} = await api.put<{foto: string}>('/api/basico/usuario/foto-base64', {foto: ''});
            const uploadRes = await api.post<{foto: string}>('/api/basico/usuario/foto-upload', formData, {
                headers: {'Content-Type': 'multipart/form-data'},
            });
            const fotoUrl = uploadRes.data.foto;
            if (fotoUrl) {
                onPhotoUpdate(fotoUrl);
                setSuccess(true);
                setTimeout(() => { onClose(); }, 1500);
            } else {
                setError('Nao foi possivel obter a URL da foto.');
            }
        } catch (e: any) {
            const msg = e?.response?.data?.error || 'Erro ao fazer upload da foto.';
            setError(msg);
        } finally {
            setUploading(false);
        }
    };

    const removePhoto = async () => {
        if (!username) return;
        setUploading(true);
        setError('');
        try {
            await api.put('/api/basico/usuario/foto-base64', {foto: ''});
            await api.put('/api/basico/usuario/foto', {foto: ''});
            onPhotoUpdate('');
            setSuccess(true);
            setTimeout(() => onClose(), 1500);
        } catch (e: any) {
            const msg = e?.response?.data?.error || 'Erro ao remover a foto.';
            setError(msg);
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    const canvasHiddenStyle = {display: 'none' as const};

    return (
        <div className="photo-upload-modal-overlay" onClick={onClose}>
            <div className="photo-upload-modal" onClick={e => e.stopPropagation()}>
                <div className="photo-upload-header">
                    <h3>Alterar foto do perfil</h3>
                    <button type="button" className="photo-upload-close" onClick={onClose} aria-label="Fechar">&#10005;</button>
                </div>

                <div className="photo-upload-tabs">
                    <button
                        type="button"
                        className={activeTab === 'upload' ? 'active' : ''}
                        onClick={() => setActiveTab('upload')}
                    >
                        Importar imagem
                    </button>
                    <button
                        type="button"
                        className={activeTab === 'camera' ? 'active' : ''}
                        onClick={startCamera}
                    >
                        Tirar foto
                    </button>
                </div>

                {activeTab === 'upload' && (
                    <div className="photo-upload-content">
                        <div className="photo-preview-area">
                            {preview ? (
                                <img src={preview} alt="Pre-visualizacao" className="photo-preview-img" />
                            ) : currentFoto ? (
                                <img src={currentFoto} alt="Foto atual" className="photo-preview-img" />
                            ) : (
                                <div className="photo-preview-placeholder">Nenhuma imagem selecionada</div>
                            )}
                        </div>

                        <div className="photo-upload-actions">
                            <label className="photo-upload-btn">
                                Selecionar arquivo
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="photo-upload-input"
                                    onChange={handleFileSelect}
                                />
                            </label>
                            {preview && (
                                <button
                                    type="button"
                                    className="photo-upload-remove"
                                    onClick={() => setPreview(null)}
                                >
                                    Remover
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'camera' && stream && (
                    <div className="photo-camera-content">
                        <video ref={videoRef} autoPlay playsInline className="camera-video" />
                        <canvas ref={canvasRef} className="camera-canvas" style={canvasHiddenStyle} />
                        <div className="camera-controls">
                            <button type="button" className="camera-capture" onClick={capturePhoto}>
                                Capturar
                            </button>
                            <button type="button" className="camera-cancel" onClick={stopCamera}>
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {error && <div className="photo-upload-error" role="alert">{error}</div>}
                {success && <div className="photo-upload-success" role="status">Foto atualizada com sucesso!</div>}

                <div className="photo-upload-footer">
                    {currentFoto && (
                        <button
                            type="button"
                            className="photo-upload-btn-danger"
                            onClick={removePhoto}
                            disabled={uploading}
                        >
                            Remover foto
                        </button>
                    )}
                    <button
                        type="button"
                        className="photo-upload-btn-primary"
                        onClick={uploadPhoto}
                        disabled={uploading || !preview}
                    >
                        {uploading ? 'Salvando...' : 'Salvar foto'}
                    </button>
                </div>
            </div>
        </div>
    );
}
