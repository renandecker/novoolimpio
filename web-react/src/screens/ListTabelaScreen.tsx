import React, {useEffect, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {api} from './api';
import {DataTable, Column} from 'react-bootstrap';
import {Button, Alert} from 'react-bootstrap';
import {useNavigate} from 'react-router-dom';
import {FiltrosController} from './filtrosController';

type TabelaColuna = {
    medida: { tipoInfo: 'MOEDA' | 'PERCENTUAL' | string; nomeVisualizacao: string };
    dimensao: { nomeVisualizacao: string };
};

type TabelaResponse = {
    tabela: { nome: string };
    tabelaColunas: TabelaColuna[];
    lazyTabelaWapper: any[];
    filtroRelatorios: any[];
};

type FiltroRelatorio = {
    filtroRelatorio: { tipo: string; fixo: boolean; exibirFiltro: boolean; informacao: string | null };
    selected: boolean;
    informacao: string | null;
};

export function ListTabelaScreen() {
    const navigate = useNavigate();
    const [tabela, setTabela] = useState<TabelaResponse | null>(null);
    const [filtros, setFiltros] = useState<FiltroRelatorio[]>([]);
    const [filtroSelecionado, setFiltroSelecionado] = useState<any>(null);
    const [showFilterDialog, setShowFilterDialog] = useState(false);
    const [filtrosAplicados, setFiltrosAplicados] = useState<string[]>([]);

    useEffect(() => {
        fetchTabela();
    }, []);

    const fetchTabela = async () => {
        try {
            const response = await api.get('/api/relatorios/tabela');
            setTabela(response.data);
        } catch (error) {
            console.error('Erro ao carregar tabela:', error);
        }
    };

    const aplicarFiltro = async () => {
        if (!filtroSelecionado) return;
        setShowFilterDialog(false);
        // Aplicar filtro logic
        setFiltrosAplicados([filtroSelecionado.informacao || '']);
    };

    return (
        <div>
            <h1>Relatórios - Tabela</h1>

            {/* Toolbar with filters */}
            <div className="toolbar">
                <Button variant="primary" onClick={() => setShowFilterDialog(true)}>Aplicar Filtros</Button>
                <Button variant="secondary">Exportar CSV</Button>
                <Button variant="danger">Exportar PDF</Button>
            </div>

            {/* Filters panel */}
            {showFilterDialog && (
                <div className="filter-dialog">
                    <h4>Filtros</h4>
                    {/* Tempo filter */}
                    {filtros.some(f => f.filtroRelatorio.dimensao.tipoInfo === 'TEMPO') && (
                        <div key="tempo">
                            <label>Tipo:</label>
                            <select>
                                <option value="0">Nenhum</option>
                                <option value="1">Normal</option>
                                <option value="2">Dinâmico</option>
                                <option value="3">Faixa</option>
                            </select>
                        </div>
                    )}

                    {/* Fixo filter */}
                    {filtros.some(f => f.filtroRelatorio.tipo === 'FIXO') && (
                        <div key="fixo">
                            <label>Aplicar filtro fixo:</label>
                            <input type="checkbox" />
                        </div>
                    )}

                    {/* Descritivo filter */}
                    {filtros.some(f => f.filtroRelatorio.dimensao.tipoInfo === 'DESCRITIVO' && f.filtroRelatorio.tipo !== 'FIXO') && (
                        <div key="descritivo">
                            <DataTable>
                                <Column key="select" width={30}>
                                    <template #cell={props}>
                                        <Button size="sm" variant="primary" icon="fa fa-plus" />
                                    </template>
                                </Column>
                                <Column key="informacao" dataField="informacao">
                                    {props.row.informacao}
                                </Column>
                                <Column key="remove" width={30}>
                                    <Button size="sm" variant="danger" icon="fa fa-minus" />
                                </Column>
                            </DataTable>
                        </div>
                    )}

                    <div className="dialog-actions">
                        <Button onClick={() => setShowFilterDialog(false)} cancel>Cancelar</Button>
                        <Button onClick={aplicarFiltro} primary>Aplicar</Button>
                    </div>
                </div>
            )}

            {/* Data Table */}
            {tabela && (
                <DataTable
                    items={tabela.lazyTabelaWapper}
                    itemKey="id"
                    columns={[
                        {
                            key: 'medida',
                            label: 'Medida',
                            styleClass: 'text-center',
                        },
                        {
                            key: 'dimensao',
                            label: 'Dimensão',
                        },
                    ]}
                    pagination={true}
                    rows={40}
                    sortBy={undefined}
                    sortOrder={undefined}
                />
            )}
        </div>
    );
}