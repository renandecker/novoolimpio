import {useNavigate} from 'react-router-dom';
import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';
import type {DataTableRowAction} from '../DataTable';

export default function ViewRelatoriosListTabelaListScreen() {
    const navigate = useNavigate();

    const extraRowActions: DataTableRowAction[] = [
        {
            key: 'acessar',
            title: 'Acessar',
            icon: <i className="fa fa-external-link"/>,
            permission: 'EXECUTE',
            onClick: (item) => {
                navigate(`/view/relatorios/viewTabela?id=${item.id}`);
            },
        },
    ];

    return <PermissionGate permission="READ">
        <main><h1>Tabela</h1><DataTable path="/api/view/relatorios/listTabela" extraRowActions={extraRowActions}/></main>
    </PermissionGate>
}
