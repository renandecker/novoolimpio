import React, {useRef, useState, useEffect} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Image,
    ActivityIndicator,
    Alert,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {api} from '../api';

interface PhotoUploadModalProps {
    visible: boolean;
    onClose: () => void;
    onPhotoUpdate: (fotoUrl: string) => void;
    currentFoto?: string;
    username?: string;
}

export function PhotoUploadModal({
    visible,
    onClose,
    onPhotoUpdate,
    currentFoto,
    username,
}: PhotoUploadModalProps) {
    const [sourceType, setSourceType] = useState<'library' | 'camera'>('library');
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

    useEffect(() => {
        if (visible) {
            setPreview(null);
            setSourceType('library');
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
                } else if (asset.uri) {
                    setPreview(asset.uri);
                }
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
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
                } else if (asset.uri) {
                    setPreview(asset.uri);
                }
            }
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível tirar a foto.');
        }
    };

    const uploadPhoto = async () => {
        if (!preview || !username) return;
        setUploading(true);
        try {
            const base64Data = preview.includes('base64,') ? preview.split('base64,')[1] : preview;
            const {data} = await api.put<{foto: string}>(`/api/basico/usuario/foto-base64`, {foto: base64Data});
            if (data.foto) {
                onPhotoUpdate(data.foto);
                Alert.alert('Sucesso', 'Foto atualizada com sucesso!', [{text: 'OK', onPress: onClose}]);
            } else {
                Alert.alert('Erro', 'Não foi possível obter a URL da foto.');
            }
        } catch (e: any) {
            const msg = e?.response?.data?.error || 'Erro ao fazer upload da foto.';
            Alert.alert('Erro', msg);
        } finally {
            setUploading(false);
        }
    };

    const removePhoto = async () => {
        if (!username) return;
        Alert.alert(
            'Confirmar',
            'Tem certeza que deseja remover a foto?',
            [
                {text: 'Cancelar', style: 'cancel'},
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        setUploading(true);
                        try {
                            await api.put(`/api/basico/usuario/foto-base64`, {foto: ''});
                            onPhotoUpdate('');
                            Alert.alert('Sucesso', 'Foto removida com sucesso!', [{text: 'OK', onPress: onClose}]);
                        } catch (e: any) {
                            const msg = e?.response?.data?.error || 'Erro ao remover a foto.';
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
                        <Text style={styles.title}>Alterar foto do perfil</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text style={styles.closeBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.tabs}>
                        <TouchableOpacity
                            style={[styles.tab, sourceType === 'library' && styles.tabActive]}
                            onPress={() => setSourceType('library')}
                        >
                            <Text style={[styles.tabText, sourceType === 'library' && styles.tabTextActive]}>
                                Importar imagem
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, sourceType === 'camera' && styles.tabActive]}
                            onPress={() => takePhoto()}
                        >
                            <Text style={[styles.tabText, sourceType === 'camera' && styles.tabTextActive]}>
                                Tirar foto
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.previewArea}>
                        {preview ? (
                            <Image source={{uri: preview}} style={styles.previewImage}/>
                        ) : currentFoto ? (
                            <Image source={{uri: currentFoto}} style={styles.previewImage}/>
                        ) : (
                            <View style={styles.previewPlaceholder}>
                                <Text style={styles.previewPlaceholderText}>Nenhuma imagem selecionada</Text>
                            </View>
                        )}
                    </View>

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

                    {currentFoto && (
                        <TouchableOpacity style={styles.dangerBtn} onPress={removePhoto} disabled={uploading}>
                            <Text style={styles.dangerBtnText}>Remover foto</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={[styles.saveBtn, uploading && styles.saveBtnDisabled]} onPress={uploadPhoto} disabled={uploading || !preview}>
                        <Text style={styles.saveBtnText}>{uploading ? 'Salvando...' : 'Salvar foto'}</Text>
                        {uploading && <ActivityIndicator color="#fff" size="small" style={styles.spinner}/>}
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
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
    tabs: {
        flexDirection: 'row',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#2a5a88',
    },
    tabText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#666',
    },
    tabTextActive: {
        color: '#2a5a88',
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
    previewPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewPlaceholderText: {
        color: '#999',
        fontSize: 15,
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
        backgroundColor: '#e53935',
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e53935',
    },
    actionBtnRemoveText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
    },
    dangerBtn: {
        width: '100%',
        paddingVertical: 14,
        backgroundColor: '#e53935',
        borderRadius: 8,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e53935',
        marginBottom: 12,
    },
    dangerBtnText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#fff',
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