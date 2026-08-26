import React from 'react';
import {FormLayout, FormTabConfig} from '../FormLayout';

const GENEROS = [
    {value: '1', label: 'Masculino'},
    {value: '2', label: 'Feminino'},
    {value: '3', label: 'Outro'},
];

const ETNIAS = [
    {value: '1', label: 'Branca'},
    {value: '2', label: 'Preta'},
    {value: '3', label: 'Parda'},
    {value: '4', label: 'Amarela'},
    {value: '5', label: 'Indígena'},
];

const ESTADOS_CIVIS = [
    {value: '1', label: 'Solteiro(a)'},
    {value: '2', label: 'Casado(a)'},
    {value: '3', label: 'Divorciado(a)'},
    {value: '4', label: 'Viúvo(a)'},
    {value: '5', label: 'União Estável'},
];

const ESCOLARIDADES = [
    {value: '1', label: 'Ensino Fundamental Incompleto'},
    {value: '2', label: 'Ensino Fundamental Completo'},
    {value: '3', label: 'Ensino Médio Incompleto'},
    {value: '4', label: 'Ensino Médio Completo'},
    {value: '5', label: 'Superior Incompleto'},
    {value: '6', label: 'Superior Completo'},
    {value: '7', label: 'Pós-Graduação'},
];

const usuarioTabs: FormTabConfig[] = [
    {
        key: 'dadosPessoais',
        label: 'Dados Pessoais',
        fields: [
            {name: 'login', label: 'Login', required: true},
            {name: 'senha', label: 'Senha', type: 'mask', mask: '****'},
            {name: 'cpf', label: 'CPF', type: 'mask', mask: '999.999.999-99', required: true},
            {name: 'rg', label: 'RG', required: true},
            {name: 'nome', label: 'Nome', required: true},
            {name: 'email', label: 'E-mail', type: 'email', required: true},
            {name: 'nomeSocial', label: 'Nome Social'},
            {name: 'dataNascimento', label: 'Data Nascimento', type: 'date', required: true},
            {name: 'generoId', label: 'Gênero', type: 'select', options: GENEROS},
            {name: 'etniaId', label: 'Etnia', type: 'select', options: ETNIAS},
            {name: 'estadoCivilId', label: 'Estado Civil', type: 'select', options: ESTADOS_CIVIS, required: true},
            {name: 'escolaridadeId', label: 'Escolaridade', type: 'select', options: ESCOLARIDADES, required: true},
            {name: 'nomePai', label: 'Nome do Pai'},
            {name: 'nomeMae', label: 'Nome da Mãe', required: true},
        ],
    },
    {
        key: 'contato',
        label: 'Contato',
        fields: [
            {name: 'telefoneResidencial', label: 'Telefone Residencial', type: 'mask', mask: '(99) 9999-9999'},
            {name: 'celular', label: 'Celular', type: 'mask', mask: '(99) 99999-9999'},
            {name: 'nomeReferencia', label: 'Nome Referência', required: true},
            {name: 'telefoneReferencia', label: 'Telefone Referência', type: 'mask', mask: '(99) 9999-9999', required: true},
            {name: 'celularReferencia', label: 'Celular Referência', type: 'mask', mask: '(99) 99999-9999', required: true},
            {name: 'nomeReferencia2', label: 'Nome Referência 2'},
            {name: 'telefoneReferencia2', label: 'Telefone Referência 2', type: 'mask', mask: '(99) 9999-9999'},
            {name: 'celularReferencia2', label: 'Celular Referência 2', type: 'mask', mask: '(99) 99999-9999'},
        ],
    },
];

export default function ViewUsuarioFormUsuarioListScreen() {
    return (
        <FormLayout
            title="Usuário"
            tabs={usuarioTabs}
            initialValues={}
            onSubmit={(values) => {
                console.log('Salvar usuário:', values);
                alert('Formulário enviado (implementar API)');
            }}
            onCancel={() => console.log('Cancelar')}
            submitLabel="Salvar"
            cancelLabel="Voltar"
        />
    );
}