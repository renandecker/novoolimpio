import React from 'react';
import {useNavigate} from 'react-router-dom';
import {PermissionGate} from '../../shared/services/permissions';
import {DataTable, DataTableRowAction} from '../../shared/components/DataTable';

export default function ListMapaScreen() {
    const navigate = useNavigate();

    const extraRowActions: DataTableRowAction[] = [
        {
            key: 'acessar',
            title: 'Acessar RelatÃ³rio',
            icon: <i className="fa fa-external-link" />,
            permission: 'EXECUTE',
            onClick: (item) => {
                navigate(`/view/relatorios/viewMapa?id=${item.id}`);
            },
        },
    ];

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>RelatÃ³rios - Mapa</h1>
                <DataTable
                    path="/api/relatorios/mapa"
                    extraRowActions={extraRowActions}
                />
            </main>
        </PermissionGate>
    );
}
