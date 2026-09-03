import React from 'react';
import {useNavigate} from 'react-router-dom';
import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, DataTableRowAction} from '../../shared/components/DataTable';

export default function ListGraficoScreen() {
    const navigate = useNavigate();

    const extraRowActions: DataTableRowAction[] = [
        {
            key: 'acessar',
            title: 'Acessar Relatório',
            icon: <i className="fa fa-external-link" />,
            permission: 'EXECUTE',
            onClick: (item) => {
                navigate(`/view/relatorios/viewGraficoBarrasVertical?id=${item.id}`);
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
                />
            </main>
        </PermissionGate>
    );
}
