import React, {useState, useCallback} from 'react';
import {ModuleList, ModuleListExtraAction} from '../../shared/components/ModuleListScreen';
import {api} from '../../shared/services/api';
import {Alert} from 'react-native';

export default function ViewContaGestaoContaListScreen() {
    const [notice, setNotice] = useState<string>('');

    const buildExtraActions = useCallback((): ModuleListExtraAction[] => {
        const actions: ModuleListExtraAction[] = [];

        actions.push({
            key: 'editar',
            title: 'Editar',
            icon: '✎',
            permission: 'UPDATE',
            onPress: (item) => {
                // Navigation to edit would be handled by ModuleList
            },
        });

        actions.push({
            key: 'desativar',
            title: 'Desativar',
            icon: '🔒',
            permission: 'UPDATE',
            onPress: async (item) => {
                if (!await new Promise(resolve => Alert.alert('Desativar conta', 'Deseja realmente desativar esta conta?', [
                    {text: 'Cancelar', style: 'cancel', onPress: () => resolve(false)},
                    {text: 'Desativar', style: 'destructive', onPress: () => resolve(true)},
                ]))) return;

                try {
                    await api.post(`/api/conta/gestaoConta/${item.id}/situacao`, {ativo: false});
                    setNotice('Conta desativada com sucesso');
                } catch (error: any) {
                    setNotice(`Erro: ${error.response?.data?.error ?? error.message}`);
                }
            },
        });

        actions.push({
            key: 'ativar',
            title: 'Ativar',
            icon: '✅',
            permission: 'UPDATE',
            onPress: async (item) => {
                try {
                    await api.post(`/api/conta/gestaoConta/${item.id}/situacao`, {ativo: true});
                    setNotice('Conta ativada com sucesso');
                } catch (error: any) {
                    setNotice(`Erro: ${error.response?.data?.error ?? error.message}`);
                }
            },
        });

        actions.push({
            key: 'criarPagamentos',
            title: 'Criar Pagamentos',
            icon: '💰',
            permission: 'EXECUTE',
            onPress: async (item) => {
                if (!await new Promise(resolve => Alert.alert('Criar pagamentos', 'Deseja criar pagamentos para esta conta?', [
                    {text: 'Cancelar', style: 'cancel', onPress: () => resolve(false)},
                    {text: 'Criar', onPress: () => resolve(true)},
                ]))) return;

                try {
                    await api.post(`/api/conta/gestaoConta/${item.id}/criar-pagamentos`);
                    setNotice('Pagamentos criados com sucesso');
                } catch (error: any) {
                    setNotice(`Erro: ${error.response?.data?.error ?? error.message}`);
                }
            },
        });

        actions.push({
            key: 'ajustarSituacao',
            title: 'Ajustar Situação',
            icon: '📊',
            permission: 'EXECUTE',
            onPress: async (item) => {
                try {
                    await api.post(`/api/conta/gestaoConta/${item.id}/ajustar-situacao`);
                    setNotice('Situação ajustada com sucesso');
                } catch (error: any) {
                    setNotice(`Erro: ${error.response?.data?.error ?? error.message}`);
                }
            },
        });

        return actions;
    }, []);

    return (
        <ModuleList
            path="/api/view/conta/gestaoConta"
            title="Gestão de Conta"
            extraActions={buildExtraActions()}
            params={{}}
        />
    );
}