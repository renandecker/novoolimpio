import {PermissionGate} from '../../shared/services/permissions';
import {ModuleTabs} from '../../shared/components/ModuleTabs';
import {CURSO_SOURCE, CURSO_COLUMNS, CURSO_SEARCH} from '../../shared/services/masterDetailSources';

export default function ViewConsultorListConsultorListScreen() {
    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Consultor</h1>
                <ModuleTabs
                    tabs={[
                        {key: 'item1', label: 'Item 1', path: '/api/view/consultor/listConsultor'},
                        {key: 'contratos', label: 'Contratos', empty: 'ConteÃºdo de Contratos.'},
                        {
                            key: 'curso',
                            label: 'Curso',
                            masterDetail: {
                                label: 'Curso',
                                source: CURSO_SOURCE,
                                valueKey: 'id',
                                searchKeys: CURSO_SEARCH,
                                columns: CURSO_COLUMNS
                            }
                        },
                        {key: 'valores', label: 'Valores', empty: 'ConteÃºdo de Valores.'},
                        {
                            key: 'curso2',
                            label: 'Curso 2',
                            masterDetail: {
                                label: 'Curso 2',
                                source: CURSO_SOURCE,
                                valueKey: 'id',
                                searchKeys: CURSO_SEARCH,
                                columns: CURSO_COLUMNS
                            }
                        },
                        {key: 'material', label: 'Material', empty: 'ConteÃºdo de Material.'},
                        {key: 'parcelado', label: 'Parcelado', empty: 'ConteÃºdo de Parcelado.'},
                        {key: 'produtos', label: 'Produtos', empty: 'ConteÃºdo de Produtos.'},
                        {key: 'solicitado', label: 'Solicitado', empty: 'ConteÃºdo de Solicitado.'},
                        {key: 'imagens', label: 'Imagens', empty: 'ConteÃºdo de Imagens.'},
                        {key: 'videos', label: 'VÃ­deos', empty: 'ConteÃºdo de VÃ­deos.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
