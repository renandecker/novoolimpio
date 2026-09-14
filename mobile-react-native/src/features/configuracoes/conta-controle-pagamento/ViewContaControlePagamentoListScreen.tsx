import React, {useState, useCallback} from 'react';
import {ModuleList, ModuleListExtraAction} from '../../shared/components/ModuleListScreen';
import {api} from '../../shared/services/api';
import {Alert} from '../../../shared/components/SweetAlert';

export default function ViewContaControlePagamentoListScreen() {
    const [unidadeId, setUnidadeId] = useState<string>('');
    const [notice, setNotice] = useState<string>('');
    const [calcOverlay, setCalcOverlay] = useState<{open: boolean; item: any; valor: number} | null>(null);

    const buildExtraActions = useCallback((): ModuleListExtraAction[] => {
        const actions: ModuleListExtraAction[] = [];

        actions.push({
            key: 'calcular',
            title: 'Calcular',
            icon: '🧮',
            permission: 'EXECUTE',
            onPress: async (item) => {
                try {
                    const response = await api.post(`/api/conta/controlePagamento/${item.id}/calcular`);
                    const valorPagar = response.data.valorPagar ?? 0;
                    setCalcOverlay({open: true, item, valor: valorPagar});
                } catch (error: any) {
                    setNotice(`Erro: ${error.response?.data?.error ?? error.message}`);
                }
            },
        });

        actions.push({
            key: 'aplicarPago',
            title: 'Aplicar Pago',
            icon: '✅',
            permission: 'EXECUTE',
            onPress: async (item) => {
                if (item.dataAplicada) return;
                if (!await new Promise(resolve => Alert.alert('Aplicar Pago', 'Deseja aplicar como pago?', [
                    {text: 'Cancelar', style: 'cancel', onPress: () => resolve(false)},
                    {text: 'Aplicar', onPress: () => resolve(true)},
                ]))) return;

                try {
                    await api.post(`/api/conta/controlePagamento/${item.id}/aplicar-pago`);
                    setNotice('Pagamento aplicado com sucesso');
                } catch (error: any) {
                    setNotice(`Erro: ${error.response?.data?.error ?? error.message}`);
                }
            },
        });

        actions.push({
            key: 'remover',
            title: 'Remover',
            icon: '🗑️',
            permission: 'DELETE',
            onPress: async (item) => {
                if (!await new Promise(resolve => Alert.alert('Remover', 'Deseja realmente remover este controle de pagamento?', [
                    {text: 'Cancelar', style: 'cancel', onPress: () => resolve(false)},
                    {text: 'Remover', style: 'destructive', onPress: () => resolve(true)},
                ]))) return;

                try {
                    await api.delete(`/api/conta/controlePagamento/${item.id}`);
                    setNotice('Controle de pagamento removido com sucesso');
                } catch (error: any) {
                    setNotice(`Erro: ${error.response?.data?.error ?? error.message}`);
                }
            },
        });

        return actions;
    }, []);

    const closeCalcOverlay = () => setCalcOverlay(null);

    return (
        <>
            <ModuleList
                path="/api/view/conta/controlePagamento"
                title="Controle de Pagamento"
                extraActions={buildExtraActions()}
                params={unidadeId ? {unidadeId} : {}}
            />
            {calcOverlay && (
                <ModuleList
                    path="/api/view/conta/controlePagamento"
                    title="Cálculo de Pagamento"
                    extraActions={[]}
                    params={unidadeId ? {unidadeId} : {}}
                />
            )}
        </>
    );
}