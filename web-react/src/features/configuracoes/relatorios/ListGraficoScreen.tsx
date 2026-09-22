import React from 'react';
import {useNavigate} from 'react-router-dom';
import {PermissionGate} from '../../../shared/services/permissions';
import {DataTable, DataTableRowAction} from '../../../shared/components/DataTable';

const TIPO_ROTA: Record<string, string> = {
    GRAFICO: '/view/relatorios/viewGraficoBarrasVertical',
    PIZZA: '/view/relatorios/viewGraficoPizza',
    LINHA: '/view/relatorios/viewGraficoLinhas',
    COMBINADO: '/view/relatorios/viewGraficoCombinado',
    CIRCULAR: '/view/relatorios/viewGraficoCircular',
    BARRA_VERTICAL: '/view/relatorios/viewGraficoBarrasVertical',
    BARRA_HORIZONTAL: '/view/relatorios/viewGraficoBarrasHorizontal',
};

export default function ListGraficoScreen() {
    const navigate = useNavigate();

    const extraRowActions: DataTableRowAction[] = [
        {
            key: 'acessar',
            title: 'Acessar Relatório',
            icon: <i className="fa fa-external-link" />,
            permission: 'EXECUTE',
            onClick: (item) => {
                const tipo = String((item as Record<string, unknown>)?.tipo ?? 'GRAFICO').toUpperCase();
                const rota = TIPO_ROTA[tipo] ?? '/view/relatorios/viewGraficoBarrasVertical';
                navigate(`${rota}?id=${item.id}`);
            },
        },
    ];

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Relatórios - Gráfico</h1>
                <DataTable
                    path="/api/relatorios/grafico"
                    extraRowActions={extraRowActions}
                    createNavigateTo="/view/relatorios/formGrafico"
                    editNavigateTo="/view/relatorios/formGrafico"
                />
            </main>
        </PermissionGate>
    );
}
