import {PermissionGate} from '../../shared/services/permissions';
import {DataTable} from '../../shared/components/DataTable';
import {Tabs} from '../../shared/components/Tabs';

export default function ViewPerfilFormPerfilListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Perfil</h1>
                <div className="div_form">
                    <div className="form-title">Perfil</div>
                    <div className="table_form">
                        <Tabs
                            tabs={[
                                {
                                    key: 'config',
                                    label: 'Configurações Gerais',
                                    content: <p className="master-detail-empty">Dados do perfil e permissões por
                                        módulo.</p>
                                },
                                {
                                    key: 'favoritos',
                                    label: 'Favoritos',
                                    content: <p className="master-detail-empty">Favoritos do perfil.</p>
                                },
                            ]}
                        />
                    </div>
                </div>
                <DataTable path="/api/view/perfil/formPerfil"/>
            </main>
        </PermissionGate>
    );
}
