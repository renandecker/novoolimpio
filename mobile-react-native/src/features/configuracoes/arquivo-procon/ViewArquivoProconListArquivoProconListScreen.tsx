import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert} from 'react-native';
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

            const base64 = await FileSystem.readAsStringAsync(file.uri, {encoding: FileSystem.EncodingType.Base64});
            const fileData = `data:text/csv;base64,${base64}`;

            await api.post('/api/comercial/arquivo-procon/upload', {
                fileName: file.name,
                fileData,
            });

            Alert.alert('Sucesso', 'Arquivo enviado com sucesso para processamento via Kafka!');
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
