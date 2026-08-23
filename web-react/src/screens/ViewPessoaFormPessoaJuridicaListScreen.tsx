import {useState} from 'react';
import {PermissionGate} from '../permissions';
import {Tabs} from '../Tabs';
import type {TabItem} from '../Tabs';
import {MasterDetail} from '../MasterDetail';
import type {ApiItem} from '../types';
import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../masterDetailSources';

export default function ViewPessoaFormPessoaJuridicaListScreen() {
    const [unidades, setUnidades] = useState<ApiItem[]>([]);

    const tabs: TabItem[] = [
        {
            key: 'identificacao',
            label: 'Identificação',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">CNPJ *</span>
                        <input className="form-input" placeholder="99.999.999/9999-99"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Razão Social *</span>
                        <input className="form-input" placeholder="Razão Social" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome Fantasia *</span>
                        <input className="form-input" placeholder="Nome Fantasia" style={{gridColumn: 'span 3'}}/>
                    </label>
                </div>
            ),
        },
        {
            key: 'informacoesBasicas',
            label: 'Informações Básicas',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">Inscrição Municipal</span>
                        <input className="form-input" placeholder="Inscrição Municipal"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Inscrição Estadual</span>
                        <input className="form-input" placeholder="Inscrição Estadual"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">E-mail</span>
                        <input className="form-input" type="email" placeholder="E-mail" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Foto / Logo</span>
                        <div style={{gridColumn: 'span 3', display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <input type="file" accept="image/*" className="form-input" style={{flex: 1}}/>
                            <button type="button" className="btnblue">Selecionar Imagem</button>
                            <button type="button" className="btnred">Limpar</button>
                        </div>
                    </label>
                </div>
            ),
        },
        {
            key: 'contatos',
            label: 'Contatos',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">Telefone *</span>
                        <input className="form-input" placeholder="(99) 99999-9999"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular *</span>
                        <input className="form-input" placeholder="(99) 99999-9999"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Fax</span>
                        <input className="form-input" placeholder="(99) 9999-9999"/>
                    </label>
                </div>
            ),
        },
        {
            key: 'endereco',
            label: 'Endereço',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">CEP</span>
                        <div style={{display: 'flex', gap: '8px', width: '100%'}}>
                            <input className="form-input" placeholder="99.999-999" style={{width: '120px'}}/>
                            <button type="button" className="btnyellow">Busca</button>
                            <button type="button" className="btngreen">Ajuste</button>
                            <button type="button" className="btnstop">Novo</button>
                        </div>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Cidade</span>
                        <input className="form-input" placeholder="Cidade" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Bairro</span>
                        <input className="form-input" placeholder="Bairro" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Logradouro</span>
                        <input className="form-input" placeholder="Logradouro" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Número *</span>
                        <input className="form-input" type="number" placeholder="Número"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Complemento</span>
                        <textarea className="form-input" placeholder="Complemento" rows={3}
                                  style={{gridColumn: 'span 3', minHeight: '80px'}}/>
                    </label>
                </div>
            ),
        },
        {
            key: 'unidades',
            label: 'Unidades',
            content: (
                <MasterDetail
                    label="Unidade"
                    source={UNIDADE_SOURCE}
                    valueKey="id"
                    searchKeys={UNIDADE_SEARCH}
                    columns={UNIDADE_COLUMNS}
                    items={unidades}
                    onChange={setUnidades}
                />
            ),
        },
        {
            key: 'outros',
            label: 'Outros',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">Observação</span>
                        <textarea className="form-input" placeholder="Observações" rows={5}
                                  style={{gridColumn: 'span 3', minHeight: '100px'}}/>
                    </label>
                </div>
            ),
        },
    ];

    return (
        <PermissionGate permission="READ">
            <main>
                <h1>Cadastro de Pessoa Jurídica</h1>
                <div className="div_form">
                    <div className="form-title">Pessoa Jurídica</div>
                    <div className="table_form">
                        <Tabs tabs={tabs} initial="identificacao"/>
                        <div className="form-buttons">
                            <button type="button" className="btnblue" title="Salvar registro">Gravar</button>
                            <button type="button" className="btnstop" title="Salvar e continuar editando">
                                Salvar e Continuar
                            </button>
                            <button type="button" className="btnyellow" title="Voltar para a lista">Voltar</button>
                        </div>
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}