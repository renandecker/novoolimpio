import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator} from 'react-native';
import {Alert} from '../../../shared/components/SweetAlert';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import {ModuleList} from '../ModuleListScreen';
import {api} from '../../shared/services/api';

export default function ViewArquivoProconListArquivoProconListScreen() {
    const [uploading, setUploading] = useState(false);

    const handlePickAndUpload = async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({type: '*/*'});
            if (res.canceled || !res.assets || res.assets.length === 0) return;

            const file = res.assets[0];
            setUploading(true);

            // Read entire file content as base64 or chunks using expo FileSystem if needed
            // For React Native Expo, we can read chunks or split the base64 string
            const base64Full = await FileSystem.readAsStringAsync(file.uri, {encoding: FileSystem.EncodingType.Base64});
            const binaryString = atob(base64Full);
            const fileSize = binaryString.length;
            const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
            const totalChunks = Math.ceil(fileSize / CHUNK_SIZE);
            const uploadId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const start = chunkIndex * CHUNK_SIZE;
                const end = Math.min(start + CHUNK_SIZE, fileSize);
                const chunkBinary = binaryString.substring(start, end);
                const chunkBase64 = btoa(chunkBinary);
                const fileData = `data:text/csv;base64,${chunkBase64}`;

                await api.post('/api/comercial/arquivo-procon/upload-chunk', {
                    uploadId,
                    fileName: file.name || 'arquivo.csv',
                    chunkIndex,
                    totalChunks,
                    fileData,
                });
            }

            Alert.alert('Sucesso', 'Arquivo enviado em partes e processado via Kafka com sucesso!');
        } catch (error: any) {
            Alert.alert('Erro', error?.response?.data?.error || error.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.uploadContainer}>
                <Text style={styles.label}>Adicionar Arquivo (CSV)</Text>
                <TouchableOpacity style={styles.button} onPress={handlePickAndUpload} disabled={uploading}>
                    {uploading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Selecionar e Enviar Arquivo</Text>
                    )}
                </TouchableOpacity>
            </View>
            <View style={{flex: 1}}>
                <ModuleList path="/api/comercial/arquivo-procon/paged" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    uploadContainer: {
        padding: 15,
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        marginBottom: 15,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 8,
        fontSize: 14,
    },
    button: {
        backgroundColor: '#007bff',
        padding: 10,
        borderRadius: 4,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
