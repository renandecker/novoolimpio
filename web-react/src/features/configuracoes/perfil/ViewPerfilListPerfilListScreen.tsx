import {PermissionGate} from '../../../shared/services/permissions';
import {ModuleTabs} from '../../../shared/components/ModuleTabs';
import type {DataTableColumn} from '../../../shared/components/DataTable';
import {MasterDetail} from '../../../shared/components/MasterDetail';
import type {MasterDetailColumn} from '../../../shared/components/MasterDetail';

const COLUMNS: DataTableColumn[] = [
    {key: 'id', label: 'ID', width: '60px'},
    {key: 'descricao', label: 'Descrição'},
    {key: 'hierarquia', label: 'Hierarquia'},
    {key: 'modulo_rotulo', label: 'Minha Página Inicial'},
    {key: 'comunicar', label: 'Comunicar', render: (item) => item.comunicar ? 'Sim' : 'Não'},
];

const FAVORITO_COLUMNS: MasterDetailColumn[] = [
    {key: 'icone', label: 'Ícone'},
    {key: 'nome', label: 'Nome'},
    {key: 'modulo_descricao', label: 'Módulo'},
];

const USUARIO_COLUMNS: MasterDetailColumn[] = [
    {key: 'id', label: 'ID'},
    {key: 'login', label: 'Login'},
    {key: 'pessoa_pessoaFisica_nome', label: 'Nome'},
    {key: 'ativo', label: 'Ativo', render: (item) => item.ativo ? 'Sim' : 'Não'},
];

export default function ViewPerfilListPerfilListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Perfil</h1>
                <ModuleTabs
                    tabs={[
                        {
                            key: 'list',
                            label: 'Listagem',
                            path: '/api/basico/perfil',
                            columns: COLUMNS,
                            maxMainColumns: COLUMNS.length,
                            editNavigateTo: '/view/perfil/formPerfil',
                            createNavigateTo: '/view/perfil/formPerfil',
                            masterDetail: {
                                label: 'Favoritos',
                                source: '/api/basico/perfil',
                                valueKey: 'id',
                                searchKeys: ['nome', 'modulo_descricao'],
                                columns: FAVORITO_COLUMNS,
                            }
                        },
                        {
                            key: 'usuarios',
                            label: 'Usuários',
                            masterDetail: {
                                label: 'Usuários',
                                source: '/api/basico/usuario',
                                valueKey: 'id',
                                searchKeys: ['login', 'pessoa_pessoaFisica_nome'],
                                columns: USUARIO_COLUMNS,
                            }
                        },
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
