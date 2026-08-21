import {useState} from 'react';
import {PermissionGate} from '../permissions';
import {DataTable} from '../DataTable';
import {MasterDetail} from '../MasterDetail';
import {Tabs} from '../Tabs';
import type {ApiItem} from '../types';

const CAMPO_COLUMNS = [
    {key: 'rotulo', label: 'Rótulo'},
    {key: 'nome', label: 'Nome'},
    {key: 'tipo', label: 'Tipo de Campo'},
    {key: 'categoria', label: 'Categoria de Campo'},
    {key: 'obrigatorio', label: 'Obrigatório'},
    {key: 'permitirHistorico', label: 'Permitir Histórico'},
    {key: 'ordem', label: 'Ordem'},
];

const UNIDADE_COLUMNS = [
    {key: 'id', label: 'ID da Unidade'},
    {key: 'sucinto', label: 'Sucinto'},
    {key: 'razaoSocial', label: 'Razão Social'},
    {key: 'nomeFantasia', label: 'Nome Fantasia'},
    {key: 'CNPJ', label: 'CNPJ'},
    {key: 'ativo', label: 'Ativo'},
];

export default function ViewAcaoFormAcaoListScreen() {
    const [campos, setCampos] = useState<ApiItem[]>([]);
    const [unidades, setUnidades] = useState<ApiItem[]>([]);

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Form Acao</h1>
                <div className="div_form">
                    <div className="form-title">Ação</div>
                    <div className="table_form">
                        <Tabs
                            tabs={[
                                {
                                    key: 'acao',
                                    label: 'Ação',
                                    content: <p className="master-detail-empty">Formulário de campos da Ação.</p>
                                },
                                {
                                    key: 'campos',
                                    label: 'Campos',
                                    content: (
                                        <MasterDetail
                                            label="Campo"
                                            source="/api/view/campo/listCampo"
                                            valueKey="id"
                                            searchKeys={['rotulo', 'nome', 'tipo']}
                                            columns={CAMPO_COLUMNS}
                                            items={campos}
                                            onChange={setCampos}
                                        />
                                    ),
                                },
                                {
                                    key: 'unidade',
                                    label: 'Unidade',
                                    content: (
                                        <MasterDetail
                                            label="Unidade"
                                            source="/api/view/unidade/listUnidade"
                                            valueKey="id"
                                            searchKeys={['sucinto', 'razaoSocial', 'nomeFantasia']}
                                            columns={UNIDADE_COLUMNS}
                                            items={unidades}
                                            onChange={setUnidades}
                                        />
                                    ),
                                },
                            ]}
                        />
                    </div>
                </div>
                <DataTable path="/api/view/acao/formAcao"/>
            </main>
        </PermissionGate>
    );
}
