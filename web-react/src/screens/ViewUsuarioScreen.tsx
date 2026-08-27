import {useState} from 'react';
import {Tabs} from '../Tabs';
import type {TabItem} from '../Tabs';

const tabs: TabItem[] = [

    {
        key: 'pessoal',
        label: 'Pessoal',
        content: (
            <div className="form-grid">
                <label className="form-field">
                    <span className="form-label">CPF *</span>
                    <input className="form-input" placeholder="999.999.999-99" />
                </label>
                <label className="form-field">
                    <span className="form-label">RG *</span>
                    <input className="form-input" placeholder="RG" />
                </label>
                <label className="form-field">
                    <span className="form-label">Nome *</span>
                    <input className="form-input" placeholder="Nome completo" />
                </label>
                <label className="form-field">
                    <span className="form-label">E-mail *</span>
                    <input className="form-input" type="email" placeholder="E-mail" />
                </label>
                <label className="form-field">
                    <span className="form-label">Nome Social</span>
                    <input className="form-input" placeholder="Nome social" />
                </label>
                <label className="form-field">
                    <span className="form-label">Data Nascimento *</span>
                    <input className="form-input" type="date" />
                </label>
                <label className="form-field">
                    <span className="form-label">Nome do Pai</span>
                    <input className="form-input" placeholder="Nome do pai" />
                </label>
                <label className="form-field">
                    <span className="form-label">Nome da Mãe *</span>
                    <input className="form-input" placeholder="Nome da mãe" />
                </label>
                <label className="form-field">
                    <span className="form-label">Telefone Residencial *</span>
                    <input className="form-input" placeholder="(99) 9999-9999" />
                </label>
                <label className="form-field">
                    <span className="form-label">Celular *</span>
                    <input className="form-input" placeholder="(99) 99999-9999" />
                </label>
                <label className="form-field">
                    <span className="form-label">Nome Referência *</span>
                    <input className="form-input" placeholder="Nome da referência" />
                </label>
                <label className="form-field">
                    <span className="form-label">Telefone Referência</span>
                    <input className="form-input" placeholder="(99) 9999-9999" />
                </label>
                <label className="form-field">
                    <span className="form-label">Celular Referência</span>
                    <input className="form-input" placeholder="(99) 99999-9999" />
                </label>
                <label className="form-field">
                    <span className="form-label">Nome Referência 2</span>
                    <input className="form-input" placeholder="Nome da referência 2" />
                </label>
                <label className="form-field">
                    <span className="form-label">Telefone Referência 2</span>
                    <input className="form-input" placeholder="(99) 9999-9999" />
                </label>
                <label className="form-field">
                    <span className="form-label">Celular Referência 2</span>
                    <input className="form-input" placeholder="(99) 99999-9999" />
                </label>
                <label className="form-field">
                    <span className="form-label">Sexo *</span>
                    <select className="form-input form-select">
                        <option value="">-- Selecione --</option>
                        <option value="1">Masculino</option>
                        <option value="2">Feminino</option>
                        <option value="3">Outro</option>
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
            </div>
        ),
    },
    {
        key: 'endereco',
        label: 'Endereço',
        content: (
            <div className="form-grid">
                <div>Conteúdo de endereço</div>
            </div>
        ),
    },
    {
        key: 'documentos',
        label: 'Documentos',
        content: (
            <div>
                <div className="form-grid">
                    <label className="form-field">
                        <span className="form-label">CTPS *</span>
                        <input className="form-input" placeholder="Carteira de Trabalho" />
                    </label>
                    <label className="form-field">
                        <span className="form-label">Série *</span>
                        <input className="form-input" placeholder="Série" />
                    </label>
                    <label className="form-field">
                        <span className="form-label">PIS *</span>
                        <input className="form-input" placeholder="999.9999.999-9" />
                    </label>
                    <label className="form-field">
                        <span className="form-label">Data Emissão RG</span>
                        <input className="form-input" type="date" />
                    </label>
                    <label className="form-field">
                        <span className="form-label">Órgão Emissor</span>
                        <input className="form-input" placeholder="Órgão Emissor" />
                    </label>
                    <label className="form-field">
                        <span className="form-label">Título Eleitor</span>
                        <input className="form-input" placeholder="Título de Eleitor" />
                    </label>
                    <label className="form-field">
                        <span className="form-label">Zona</span>
                        <input className="form-input" placeholder="Zona" />
                    </label>
                    <label className="form-field">
                        <span className="form-label">Seção</span>
                        <input className="form-input" placeholder="Seção" />
                    </label>
                    <label className="form-field">
                        <span className="form-label">Carteira Reservista</span>
                        <input className="form-input" placeholder="Carteira de Reservista" />
                    </label>
                    <label className="form-field">
                        <span className="form-label">Qtd. Filhos Menores de 14</span>
                        <input className="form-input" type="number" placeholder="Quantidade" />
                    </label>
                </div>
                <fieldset className="form-fieldset">
                    <legend>Documentos Digitalizados
                        <small> (campos com * são obrigatórios)</small>
                    </legend>
                    <div className="form-grid">
                        <label className="form-field">Foto 3x4</label>
                        <label className="form-field">Carteira de Trabalho - Pág. 1</label>
                        <label className="form-field">Carteira de Trabalho - Pág. 2</label>
                        <label className="form-field">Contrato de Trabalho</label>
                        <label className="form-field">Comprovante de Residência</label>
                        <label className="form-field">CPF</label>
                        <label className="form-field">RG - Frente</label>
                        <label className="form-field">RG - Verso</label>
                        <label className="form-field">Título Eleitoral</label>
                        <label className="form-field">Carteira de Reservista</label>
                        <label className="form-field">Certidão de Nascimento dos Filhos Menores</label>
                        <label className="form-field">Carteira de Vacinação dos Filhos Menores</label>
                    </div>
                </fieldset>
            </div>
        ),
    },
    {
        key: 'trabalho',
        label: 'Trabalho',
        content: (
            <div className="form-grid">
                <div className="form-field">
                    <span className="form-label">Usuário Ativo</span>
                </div>
                <label className="form-field">
                    <span className="form-label">Função *</span>
                    <select className="form-input form-select" style={{gridColumn: 'span 3'}}>
                        <option value="">-- Selecione --</option>
                    </select>
                </label>
                <label className="form-field">
                    <span className="form-label">Data Admissão</span>
                    <input className="form-input" type="date" />
                </label>
                <div className="form-field">
                    <span className="form-label">Vínculo</span>
                    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
                        <label style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                            <input type="radio" name="vinculo" /> Mensalista
                        </label>
                        <label style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                            <input type="radio" name="vinculo" /> Horista
                        </label>
                    </div>
                </div>
                <div className="form-field">
                    <span className="form-label">Relatório</span>
                </div>
                <label className="form-field">
                    <span className="form-label">Observação</span>
                    <textarea className="form-input" placeholder="Observações" rows={3} />
                </label>
            </div>
        ),
    },
    {
        key: 'acesso',
        label: 'Acessos',
        content: (
            <Tabs
                tabs={[
                    {
                        key: 'unidades',
                        label: 'Unidades',
                        content: <div>Unidades content</div>,
                    },
                    {
                        key: 'perfis',
                        label: 'Perfis',
                        content: <div>Perfis content</div>,
                    },
                    {
                        key: 'agendas',
                        label: 'Agendas',
                        content: <div>Agendas content</div>,
                    },
                ]}
                initial="unidades"
            />
        ),
    },
];

export default function ViewUsuarioScreen() {
    return (
        <div>
            <h1>Usuário</h1>
            <Tabs tabs={tabs} initial="pessoal" />
        </div>
    );
}