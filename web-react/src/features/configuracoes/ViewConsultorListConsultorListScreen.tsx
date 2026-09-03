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
                        {key: 'contratos', label: 'Contratos', empty: 'Conteúdo de Contratos.'},
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
                        {key: 'valores', label: 'Valores', empty: 'Conteúdo de Valores.'},
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
                        {key: 'material', label: 'Material', empty: 'Conteúdo de Material.'},
                        {key: 'parcelado', label: 'Parcelado', empty: 'Conteúdo de Parcelado.'},
                        {key: 'produtos', label: 'Produtos', empty: 'Conteúdo de Produtos.'},
                        {key: 'solicitado', label: 'Solicitado', empty: 'Conteúdo de Solicitado.'},
                        {key: 'imagens', label: 'Imagens', empty: 'Conteúdo de Imagens.'},
                        {key: 'videos', label: 'Vídeos', empty: 'Conteúdo de Vídeos.'},
                    ]}
                />
            </main>
        </PermissionGate>
    );
}
