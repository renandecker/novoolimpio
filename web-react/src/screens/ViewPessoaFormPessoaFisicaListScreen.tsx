import {useState} from 'react';
import {PermissionGate} from '../permissions';
import {Tabs} from '../Tabs';
import type {TabItem} from '../Tabs';
import {MasterDetail} from '../MasterDetail';
import type {ApiItem} from '../types';
import {UNIDADE_SOURCE, UNIDADE_COLUMNS, UNIDADE_SEARCH} from '../masterDetailSources';

export default function ViewPessoaFormPessoaFisicaListScreen() {
    const [unidades, setUnidades] = useState<ApiItem[]>([]);

    const tabs: TabItem[] = [
        {
            key: 'identificacao',
            label: 'Identificação',
            content: (
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">CPF *</span>
                        <input className="form-input" placeholder="999.999.999-99"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">RG *</span>
                        <input className="form-input" placeholder="RG"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome *</span>
                        <input className="form-input" placeholder="Nome completo" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">E-mail *</span>
                        <input className="form-input" type="email" placeholder="E-mail" style={{gridColumn: 'span 3'}}/>
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
                        <span className="form-label">Nome Social *</span>
                        <input className="form-input" placeholder="Nome social" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Data Nascimento *</span>
                        <input className="form-input" type="date"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Cidade Origem *</span>
                        <input className="form-input" placeholder="Cidade de origem" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Gênero</span>
                        <select className="form-input form-select">
                            <option value="">-- Selecione --</option>
                            <option value="M">Masculino</option>
                            <option value="F">Feminino</option>
                            <option value="O">Outro</option>
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Etnia</span>
                        <select className="form-input form-select">
                            <option value="">-- Selecione --</option>
                            <option value="1">Branca</option>
                            <option value="2">Preta</option>
                            <option value="3">Parda</option>
                            <option value="4">Amarela</option>
                            <option value="5">Indígena</option>
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Estado Civil *</span>
                        <select className="form-input form-select">
                            <option value="">-- Selecione --</option>
                            <option value="1">Solteiro(a)</option>
                            <option value="2">Casado(a)</option>
                            <option value="3">Divorciado(a)</option>
                            <option value="4">Viúvo(a)</option>
                            <option value="5">União Estável</option>
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Escolaridade *</span>
                        <select className="form-input form-select">
                            <option value="">-- Selecione --</option>
                            <option value="1">Ensino Fundamental Incompleto</option>
                            <option value="2">Ensino Fundamental Completo</option>
                            <option value="3">Ensino Médio Incompleto</option>
                            <option value="4">Ensino Médio Completo</option>
                            <option value="5">Superior Incompleto</option>
                            <option value="6">Superior Completo</option>
                            <option value="7">Pós-Graduação</option>
                        </select>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome Referência *</span>
                        <input className="form-input" placeholder="Nome da referência" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Telefone Referência *</span>
                        <input className="form-input" placeholder="(99) 9999-9999"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular Referência *</span>
                        <input className="form-input" placeholder="(99) 99999-9999"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome Referência 2</span>
                        <input className="form-input" placeholder="Nome da referência 2"
                               style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Telefone Referência 2</span>
                        <input className="form-input" placeholder="(99) 9999-9999"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular Referência 2</span>
                        <input className="form-input" placeholder="(99) 99999-9999"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome do Pai</span>
                        <input className="form-input" placeholder="Nome do pai" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Nome da Mãe *</span>
                        <input className="form-input" placeholder="Nome da mãe" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Foto</span>
                        <div style={{gridColumn: 'span 3', display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <input type="file" accept="image/*" className="form-input" style={{flex: 1}}/>
                            <button type="button" className="btnblue">Capturar Foto</button>
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
                        <span className="form-label">Telefone Residencial *</span>
                        <input className="form-input" placeholder="(99) 9999-9999"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Telefone Comercial</span>
                        <input className="form-input" placeholder="(99) 9999-9999"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Celular *</span>
                        <input className="form-input" placeholder="(99) 99999-9999"/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Facebook</span>
                        <input className="form-input" placeholder="facebook.com/usuario"
                               style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Twitter</span>
                        <input className="form-input" placeholder="@usuario" style={{gridColumn: 'span 3'}}/>
                    </label>
                    <label className="form-field">
                        <span className="form-label">Google+</span>
                        <input className="form-input" placeholder="plus.google.com/usuario"
                               style={{gridColumn: 'span 3'}}/>
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
                <h1>Cadastro de Pessoa Física</h1>
                <div className="div_form">
                    <div className="form-title">Pessoa Física</div>
                    <div className="table_form">
                        <Tabs tabs={tabs} initial="identificacao"/>
                    </div>
                </div>
            </main>
        </PermissionGate>
    );
}