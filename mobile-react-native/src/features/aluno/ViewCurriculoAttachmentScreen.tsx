import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    Alert,
    Platform,
    PermissionsAndroid,
    TextInput,
    Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {api} from '../../shared/services/api';

interface CurriculumAttachmentProps {
    visible: boolean;
    onClose: () => void;
    onAttachmentUpdate: (fileName: string, fileBase64: string | null) => void;
    currentFileName?: string;
    currentFileBase64?: string | null;
}

export function CurriculumAttachment({visible, onClose, onAttachmentUpdate, currentFileName, currentFileBase64}: CurriculumAttachmentProps) {
    const [sourceType, setSourceType] = useState<'library' | 'camera'>('library');
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
    const [fileName, setFileName] = useState<string>('');
    const [fileSelected, setFileSelected] = useState<boolean>(!!currentFileBase64);

    useEffect(() => {
        if (visible) {
            setPreview(null);
            setSourceType('library');
            setFileName(currentFileName || '');
            setFileSelected(!!currentFileBase64);
            checkCameraPermission();
        }
    }, [visible]);

    const checkCameraPermission = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
            setCameraPermission(granted ? 'granted' : 'denied');
        } else {
            setCameraPermission('granted');
        }
    };

    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
            setCameraPermission(granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied');
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    };

    const pickImage = async () => {
        const hasPermission = sourceType === 'camera' ? await requestCameraPermission() : true;
        if (!hasPermission) {
            Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para tirar fotos.');
            return;
        }

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                if (asset.base64) {
                    setPreview(`data:image/jpeg;base64,${asset.base64}`);
                    setFileName('documento-curriculo.pdf');
                } else if (asset.uri) {
                    setPreview(asset.uri);
                }
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
        }
    };

    const takePhoto = async () => {
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para tirar fotos.');
            return;
        }

        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const asset = result.assets[0];
                if (asset.base64) {
                    setPreview(`data:image/jpeg;base64,${asset.base64}`);
                    setFileName('documento-curriculo.pdf');
                } else if (asset.uri) {
                    setPreview(asset.uri);
                }
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível tirar a foto.');
        }
    };

    const uploadDocument = async () => {
        if (!preview || !fileName) return;
        setUploading(true);
        try {
            const base64Data = preview.includes('base64,') ? preview.split('base64,')[1] : preview;
            const {data} = await api.put<{curriculo: string}>(`/api/basico/usuario/curriculo-base64`, {curriculo: base64Data});
            if (data.curriculo) {
                onAttachmentUpdate(data.curriculo || '', data.curriculo ? fileName : '');
                Alert.alert('Sucesso', 'Documento de currículo atualizado com sucesso!', [{text: 'OK', onPress: onClose}]);
            } else {
                Alert.alert('Erro', 'Não foi possível processar o documento.');
            }
        } catch (e: any) {
            const msg = e?.response?.data?.error || 'Erro ao fazer upload do documento.';
            Alert.alert('Erro', msg);
        } finally {
            setUploading(false);
        }
    };

    const removeDocument = async () => {
        Alert.alert(
            'Confirmar',
            'Tem certeza que deseja remover o documento de currículo?',
            [
                {text: 'Cancelar', style: 'cancel'},
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        setUploading(true);
                        try {
                            await api.put(`/api/basico/usuario/curriculo-base64`, {curriculo: ''});
                            onAttachmentUpdate('', '');
                            Alert.alert('Sucesso', 'Documento de currículo removido com sucesso!', [{text: 'OK', onPress: onClose}]);
                        } catch (e: any) {
                            const msg = e?.response?.data?.error || 'Erro ao remover o documento.';
                            Alert.alert('Erro', msg);
                        } finally {
                            setUploading(false);
                        }
                    },
                },
            ]
        );
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={styles.overlay} onTouchStart={onClose}>
                <View style={styles.modal} onTouchStart={e => e.stopPropagation()}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Anexar Currículo</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text style={styles.closeBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formArea}>
                        <TextInput
                            style={styles.input}
                            placeholder="Nome do arquivo (opcional)"
                            value={fileName}
                            onChangeText={setFileName}
                            editable={!uploading}
                        />
                        {fileSelected && currentFileBase64 && (
                            <View style={styles.currentFileArea}>
                                <Text style={styles.previewText}>Documento atual: {currentFileName || 'currículo anexado'}</Text>
                            </View>
                        )}

                        {preview ? (
                            <View style={styles.previewArea}>
                                <Text style={styles.previewText}>Prévia do arquivo:</Text>
                                <Image source={{uri: preview}} style={styles.previewImage} />
                            </View>
                        ) : currentFileBase64 ? (
                            <View style={styles.previewArea}>
                                <Text style={styles.previewText}>Documento de currículo carregado</Text>
                            </View>
                        ) : (
                            <View style={styles.previewArea}>
                                <Text style={styles.previewText}>Nenhum arquivo selecionado</Text>
                            </View>
                        )}

                        {sourceType === 'library' && (
                            <View style={styles.actions}>
                                <TouchableOpacity style={styles.actionBtn} onPress={pickImage}>
                                    <Text style={styles.actionBtnText}>Selecionar arquivo</Text>
                                </TouchableOpacity>
                                {preview && (
                                    <TouchableOpacity style={styles.actionBtnRemove} onPress={() => setPreview(null)}>
                                        <Text style={styles.actionBtnRemoveText}>Remover</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}

                        {currentFileBase64 && (
                            <TouchableOpacity style={styles.dangerBtn} onPress={removeDocument} disabled={uploading}>
                                <Text style={styles.dangerBtnText}>Remover documento</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity style={[styles.saveBtn, uploading && styles.saveBtnDisabled]} onPress={uploadDocument} disabled={uploading || !preview || !fileName}>
                            <Text style={styles.saveBtnText}>{uploading ? 'Salvando...' : 'Salvar documento'}</Text>
                            {uploading && <ActivityIndicator color="#fff" size="small" style={styles.spinner}/>}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

export default function ViewCurriculoAttachmentScreen({navigation}: any) {
    const [fileName, setFileName] = useState<string>('');
    const [fileBase64, setFileBase64] = useState<string | null>(null);
    return (
        <View style={{flex: 1}}>
            <CurriculumAttachment
                visible={true}
                onClose={() => navigation?.goBack?.()}
                onAttachmentUpdate={(data, name) => {
                    setFileBase64(data || null);
                    setFileName(name || '');
                }}
                currentFileName={fileName}
                currentFileBase64={fileBase64}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 16,
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
        paddingBottom: 16,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1d1d1f',
    },
    closeBtn: {
        padding: 4,
    },
    closeBtnText: {
        fontSize: 20,
        color: '#888',
    },
    formArea: {
        marginTop: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 14,
    },
    currentFileArea: {
        width: '100%',
        borderRadius: 8,
        backgroundColor: '#f5f5f5',
        marginBottom: 16,
        padding: 12,
        alignItems: 'center',
    },
    previewArea: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 12,
        overflow: 'hidden',
        backgroundColor: '#f5f5f5',
        marginBottom: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: '100%',
    },
    previewText: {
        color: '#666',
        fontSize: 14,
        marginBottom: 8,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    actionBtn: {
        flex: 1,
        minWidth: '45%',
        paddingVertical: 14,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    actionBtnText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
    },
    actionBtnRemove: {
        flex: 1,
        minWidth: '45%',
        paddingVertical: 14,
        backgroundColor: '#fff',
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e74c3c',
    },
    actionBtnRemoveText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#e74c3c',
    },
    dangerBtn: {
        width: '100%',
        paddingVertical: 14,
        backgroundColor: '#fff',
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e74c3c',
        marginBottom: 12,
    },
    dangerBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#e74c3c',
    },
    saveBtn: {
        width: '100%',
        paddingVertical: 14,
        backgroundColor: '#2a5a88',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    saveBtnDisabled: {
        opacity: 0.5,
    },
    saveBtnText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    spinner: {
        marginLeft: 4,
    },
});