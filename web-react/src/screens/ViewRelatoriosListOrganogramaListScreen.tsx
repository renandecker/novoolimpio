import {useNavigate} from 'react-router-dom';
import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';
import type {DataTableRowAction} from '../DataTable';

export default function ViewRelatoriosListOrganogramaListScreen() {
    const navigate = useNavigate();

    const extraRowActions: DataTableRowAction[] = [
        {
            key: 'acessar',
            title: 'Acessar',
            icon: <i className="fa fa-external-link"/>,
            permission: 'EXECUTE',
            onClick: (item) => {
                navigate(`/view/relatorios/viewOrganograma?id=${item.id}`);
            },
        },
    ];

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Organograma</h1>
                <DataTable
                    path="/api/view/relatorios/listOrganograma"
                    editNavigateTo="/view/relatorios/formOrganograma"
                    createNavigateTo="/view/relatorios/formOrganograma"
                    extraRowActions={extraRowActions}
                />
            </main>
        </PermissionGate>
    );
}
