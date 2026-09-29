import React from 'react';
import {Alert} from 'react-native';
import {ModuleWizard} from '../../shared/components/ModuleWizard';
import {api} from '../../shared/services/api';

export default function ViewCampanhaFormGerarPacotesListScreen({navigation}: {navigation?: any}) {
    const handleSave = async (data: Record<string, unknown>) => {
        try {
            await api.post('/api/view/campanha/formGerarPacotes', data);
            Alert.alert('Sucesso', 'Pacotes gerados com sucesso!');
            navigation?.goBack?.();
        } catch (e: any) {
            Alert.alert('Erro', e?.response?.data?.message ?? 'Erro ao gerar pacotes');
        }
    };

    return (
        <ModuleWizard
            steps={[
                {
                    key: 'informacoes',
                    label: 'Informações',
                    fields: [
                        {label: 'Ação de campanha (ID)', placeholder: 'Ex: 12'},
                        {label: 'Unidade (ID)', placeholder: 'Ex: 3'},
                        {label: 'Quantidade de prospectos', placeholder: 'Ex: 100'},
                    ],
                    empty: 'Informe ação, unidade e quantidade.',
                },
                {
                    key: 'filtros',
                    label: 'Filtros',
                    masterDetail: {
                        label: 'Ações (filtro)',
                        source: '/api/comercial/acao',
                        valueKey: 'id',
                        searchKeys: ['descricao'],
                    },
                    empty: 'Selecione as ações para filtrar os prospectos.',
                },
                {
                    key: 'geracao',
                    label: 'Geração',
                    fields: [
                        {label: 'Confirmação', placeholder: 'Digite GERAR para confirmar'},
                    ],
                    empty: 'Confirme e salve para gerar os pacotes.',
                },
            ]}
            completeLabel="Gerar pacotes"
            onSave={handleSave}
        />
    );
}
