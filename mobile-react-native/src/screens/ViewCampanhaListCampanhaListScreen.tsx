import React, { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { ModuleList } from '../ModuleListScreen';
import { api } from '../api';
import type { ApiItem } from '../types';

export default function ViewCampanhaListCampanhaListScreen() {
    const [notice, setNotice] = useState('');
    const handleFinalizar = async (item: ApiItem, outros: boolean) => {
        Alert.alert(
            'Finalizar Atendimento',
            outros
                ? 'Você tem certeza que deseja finalizar as filas prioritárias das outras campanhas? Observação: Vai finalizar referente as UNIDADES desta campanha e campanhas anteriores a esta!'
                : 'Você tem certeza que deseja finalizar as filas prioritárias desta campanha? Observação: Vai finalizar referente as UNIDADES desta campanha!',
            [
                { text: 'Não', style: 'cancel' },
                {
                    text: 'Sim',
                    onPress: async () => {
                        try {
                            const path = outros
                                ? `/api/comercial/campanha/${item.id}/finalizar-prioritaria-outros`
                                : `/api/comercial/campanha/${item.id}/finalizar-prioritaria`;
                            const res = await api.post(path);
                            Alert.alert('Sucesso', String((res.data as any)?.message ?? 'Ligações finalizadas!'));
                        } catch (e: any) {
                            Alert.alert('Erro', e?.response?.data?.error ?? e.message);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <ModuleList
                path="/api/view/campanha/listCampanha"
                extraActions={[
                    {
                        key: 'pacotes',
                        title: 'Pacotes',
                        icon: '📦',
                        onPress: (item) => {
                            Alert.alert('Gerar Pacotes', `Abrir pacotes da campanha #${item.id} (navegar para /view/campanha/formGerarPacotes?campanhaId=${item.id})`);
                        },
                    },
                    {
                        key: 'finalizar',
                        title: 'Finalizar Prioritária',
                        icon: '↩',
                        onPress: (item) => handleFinalizar(item, false),
                    },
                    {
                        key: 'finalizarOutros',
                        title: 'Finalizar Outras',
                        icon: '⇄',
                        onPress: (item) => handleFinalizar(item, true),
                    },
                ]}
            />
            {notice ? <Text>{notice}</Text> : null}
        </View>
    );
}
