import {useEffect, useMemo, useState} from 'react';
import {AgCharts} from 'ag-charts-react';
import type {AgChartOptions} from 'ag-charts-enterprise';
import 'ag-charts-enterprise';
import {PermissionGate} from '../../shared/services/permissions';
import {api} from '../../shared/services/api';

interface ModuloMenu {
    id: number;
    antecessorId: number | null;
    rotulo: string;
}

export default function ViewMenuListMapaMenuListScreen() {
    const [modulos, setModulos] = useState<ModuloMenu[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        let ativo = true;
        setLoading(true);
        setError(undefined);
        (async () => {
            try {
                const resp = await api.get<ModuloMenu[]>('/api/basico/modulo/menu');
                if (ativo) setModulos(resp.data);
            } catch (erro) {
                if (ativo) setError('Erro ao carregar o menu.');
            } finally {
                if (ativo) setLoading(false);
            }
        })();
        return () => { ativo = false; };
    }, []);

    const nodes = useMemo(() =>
        modulos.map(m => ({
            id: m.id,
            parentId: m.antecessorId,
            name: m.rotulo,
        })),
        [modulos],
    );

    const options = useMemo<AgChartOptions | null>(() => {
        if (nodes.length === 0) return null;
        return {
            data: nodes,
            series: [{
                type: 'organization',
                idKey: 'id',
                parentIdKey: 'parentId',
                direction: 'vertical',
                innerSpacing: 20,
                outerSpacing: 40,
                depthSpacing: 52,
                node: {
                    width: 180,
                    cornerRadius: 10,
                    title: {key: 'name', textAlign: 'left', fontSize: 13, fontWeight: 'bold'},
                },
            }],
        };
    }, [nodes]);

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Mapa Menu</h1>
                {loading && <p>Carregando...</p>}
                {error && <p style={{color: 'crimson'}}>{error}</p>}
                {nodes.length === 0 && !loading && <p>Nenhum módulo encontrado.</p>}
                {options && (
                    <div style={{height: '640px', width: '100%'}}>
                        <AgCharts options={options} style={{height: '100%', width: '100%'}}/>
                    </div>
                )}
            </main>
        </PermissionGate>
    );
}