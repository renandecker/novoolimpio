import React, {useEffect, useState} from 'react';
import {Alert} from '../../../shared/components/SweetAlert';
import {useRoute, useNavigation} from '@react-navigation/native';
import {FormLayout, FormTabConfig} from '../FormLayout';
import {api} from '../api';

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
const formatCep = (v: string): string => { const d = v.replace(/\D/g, '').slice(0, 8); if (d.length <= 5) return d; return `${d.slice(0, 5)}-${d.slice(5)}`; };
const toDateInput = (v: unknown): string => {
    if (!v) return '';
    const d = new Date(v as string);
    if (isNaN(d.getTime())) return String(v).slice(0, 10);
    const ano = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
};

export default function ViewPessoaFormPessoaFisicaListScreen() {
    const route: any = useRoute();
    const navigation: any = useNavigation();
    const idParam = route.params?.id;

    const [initialValues, setInitialValues] = useState<Record<string, unknown>>({});
    const [buscandoCep, setBuscandoCep] = useState(false);

    useEffect(()=>{
        if(!idParam) return;
        let ativo=true;
        (async()=>{
            try{
                const pf = (await api.get<Record<string, unknown>>(`/api/basico/pessoa-fisica/${idParam}`)).data;
                let pes: Record<string, unknown>|null=null;
                if(pf.pessoaId) pes=(await api.get<Record<string, unknown>>(`/api/basico/pessoa/${pf.pessoaId}`)).data;
                if(!ativo) return;
                // carrega endereco fiel ao colunasPessoaFisica.xhtml
                let cep=str(pes?.cep), numero=str(pes?.numero), complemento=str(pes?.complemento), cidade='', bairro='', logradouro='';
                const idLog = (pes as any)?.id_logradouro ?? (pes as any)?.logradouroId;
                if(idLog){
                    try{
                        const logRes=(await api.get<Record<string, unknown>>(`/api/basico/logradouro/${idLog}`)).data;
                        cep=str(logRes.cep) || cep; logradouro=str(logRes.descricao);
                        if((logRes as any).id_bairro){
                            const bRes=(await api.get<Record<string, unknown>>(`/api/basico/bairro/${(logRes as any).id_bairro}`)).data;
                            bairro=str(bRes.descricao);
                            if((bRes as any).cidadeId){
                                const cRes=(await api.get<Record<string, unknown>>(`/api/basico/cidade/${(bRes as any).cidadeId}`)).data;
                                cidade=str((cRes as any).cidadeEstado ?? cRes.nome);
                            }
                        }
                    }catch{}
                }
                setInitialValues({
                    cpf: str(pf.cpf), rg: str(pf.rg), nome: str(pf.nome), email: str(pes?.email),
                    nomeSocial: str(pf.nomeSocial), dataNascimento: toDateInput(pf.dataNascimento),
                    cidadeOrigem: pf.cidadeOrigemId ? String(pf.cidadeOrigemId) : str((pf as any).cidadeOrigem),
                    generoId: pf.generoId!=null? String(pf.generoId):'', etniaId: pf.etniaId!=null? String(pf.etniaId):'',
                    estadoCivilId: pf.estadoCivilId!=null? String(pf.estadoCivilId):'', escolaridadeId: pf.escolaridadeId!=null? String(pf.escolaridadeId):'',
                    nomeReferencia: str(pf.nomeReferencia), telefoneReferencia: str(pf.telefoneReferencia), celularReferencia: str(pf.celularReferencia),
                    nomeReferencia2: str(pf.nomeReferencia2), telefoneReferencia2: str(pf.telefoneReferencia2), celularReferencia2: str(pf.celularReferencia2),
                    nomePai: str(pf.nomePai), nomeMae: str(pf.nomeMae),
                    telefoneResidencial: str(pes?.telefone), telefoneComercial: str(pf.telefoneComercial), celular: str(pes?.celular),
                    facebook: str(pf.facebook), twitter: str(pf.twitter), googlePlus: str(pf.googlePlus), telegran: str((pes as any)?.telegran),
                    cep: cep ? cep.replace(/\D/g,'').replace(/(\d{5})(\d{3})/,'$1-$2') : '', cidade, bairro, logradouro, numero, complemento,
                    observacao: str(pes?.observacao),
                });
            }catch(e){ console.error(e); }
        })();
        return ()=>{ ativo=false;};
    },[idParam]);

    const tabs: FormTabConfig[] = [
        {
            key: 'identificacao',
            label: 'Identificação',
            // layout fiel ao extracted_aceso/colunasPessoaFisica.xhtml - 2 colunas: CPF, RG, Nome*, Email*
            fields: [
                {name: 'cpf', label: 'CPF *', type: 'mask', mask: '999.999.999-99', required: true},
                {name: 'rg', label: 'RG *', required: true},
                {name: 'nome', label: 'Nome *', required: true},
                {name: 'email', label: 'E-mail *', type: 'email', required: true},
            ],
        },
        {
            key: 'informacoesBasicas',
            label: 'Informações Básicas',
            // Separado da Pessoa Jurídica: inclui nomeSocial, dataNascimento, cidadeOrigem, gênero, etnia, estadoCivil, escolaridade, referências, nomePai/Mãe e foto
            fields: [
                {name: 'nomeSocial', label: 'Nome Social *', required: true},
                {name: 'dataNascimento', label: 'Data Nascimento *', type: 'date', required: true},
                {name: 'generoId', label: 'Gênero', type: 'select', options: [{value:'1',label:'Masculino'},{value:'2',label:'Feminino'},{value:'3',label:'Outro'}]},
                {name: 'etniaId', label: 'Etnia', type: 'select', options: [{value:'1',label:'Branca'},{value:'2',label:'Preta'},{value:'3',label:'Parda'},{value:'4',label:'Amarela'},{value:'5',label:'Indígena'}]},
                {name: 'estadoCivilId', label: 'Estado Civil *', type: 'autoComplete', autoCompleteSource:'/api/basico/estado-civil', required: true},
                {name: 'escolaridadeId', label: 'Escolaridade *', type: 'autoComplete', autoCompleteSource:'/api/basico/escolaridade', required: true},
                {name: 'nomeReferencia', label: 'Nome Referência *', required: true},
                {name: 'telefoneReferencia', label: 'Telefone Referência *', type: 'mask', mask: '99-99999999', required: true},
                {name: 'celularReferencia', label: 'Celular Referência *', type: 'mask', mask: '99-999999999', required: true},
                {name: 'nomeReferencia2', label: 'Nome Referência 2'},
                {name: 'telefoneReferencia2', label: 'Telefone Referência 2', type: 'mask', mask: '99-99999999'},
                {name: 'celularReferencia2', label: 'Celular Referência 2', type: 'mask', mask: '99-999999999'},
                {name: 'nomePai', label: 'Nome do Pai'},
                {name: 'nomeMae', label: 'Nome da Mãe *', required: true},
                {name: 'foto', label: 'Foto', type: 'text', placeholder: 'Capturar foto / upload'},
                {name: 'cidadeOrigem', label: 'Cidade Origem *', type: 'autoComplete', autoCompleteSource:'/api/basico/cidade/opcoes', required: true},
            ],
        },
        {
            key: 'contatos',
            label: 'Contatos',
            // separado da PJ: PJ usa Telefone/Celular/Fax ; PF usa Residencial/Comercial/Celular + redes sociais
            fields: [
                {name: 'telefoneResidencial', label: 'Telefone Residencial *', type: 'mask', mask: '99-99999999', required: true},
                {name: 'celular', label: 'Celular *', type: 'mask', mask: '99-999999999', required: true},
                {name: 'telefoneComercial', label: 'Telefone Comercial', type: 'mask', mask: '99-99999999'},
                {name: 'facebook', label: 'Facebook'},
                {name: 'twitter', label: 'Twitter'},
                {name: 'googlePlus', label: 'Google+'},
                {name: 'telegran', label: 'Telegram'},
            ],
        },
        {
            key: 'endereco',
            label: 'Endereço',
            // layout fiel ao colunasPessoaFisica.xhtml: CEP com Busca/Ajuste/Novo + cidade/bairro/logradouro autocomplete + número/complemento
            fields: [
                {name: 'cep', label: 'CEP', type: 'mask', mask: '99.999-999', full: true, actions: [
                    {label: 'Busca', disabled: buscandoCep, onPress: async ({value, setValue}) => {
                        const clean = String(value ?? '').replace(/\D/g, '');
                        if (clean.length !== 8) { Alert.alert('Aviso', 'Informe o CEP completo'); return; }
                        setBuscandoCep(true);
                        try {
                            const r = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
                            const d = await r.json();
                            if (d?.erro) { Alert.alert('Aviso', 'CEP não encontrado'); return; }
                            setValue('cep', formatCep(String(d?.cep ?? clean)));
                            if (d?.localidade) setValue('cidade', d.localidade);
                            if (d?.bairro) setValue('bairro', d.bairro);
                            if (d?.logradouro) setValue('logradouro', d.logradouro);
                        } catch { Alert.alert('Erro', 'Falha ao consultar o CEP'); }
                        finally { setBuscandoCep(false); }
                    }},
                    {label: 'Ajuste', onPress: ({value, setValue}) => {
                        setValue('cep', String(value ?? ''));
                        Alert.alert('Ajuste', 'Selecione cidade/bairro/logradouro nos campos abaixo');
                    }},
                    {label: 'Novo', onPress: ({setValue}) => {
                        setValue('cep', ''); setValue('cidade', ''); setValue('bairro', '');
                        setValue('logradouro', ''); setValue('numero', ''); setValue('complemento', '');
                    }},
                ]},
                {name: 'cidade', label: 'Cidade', type: 'autoComplete', autoCompleteSource:'/api/basico/cidade/opcoes', required: true, full: true},
                {name: 'bairro', label: 'Bairro', type: 'autoComplete', autoCompleteSource:'/api/basico/bairro/opcoes', required: true, full: true},
                {name: 'logradouro', label: 'Logradouro', type: 'autoComplete', autoCompleteSource:'/api/basico/logradouro/auto-complete-logradouro-troca-opcoes', required: true, full: true},
                {name: 'numero', label: 'Número *', required: true, full: true},
                {name: 'complemento', label: 'Complemento', type: 'textarea', full: true},
            ],
        },

        {
            key: 'outros',
            label: 'Outros',
            fields: [
                {name: 'observacao', label: 'Observação', type: 'textarea', full: true},
            ],
        },
    ];

    return (
        <FormLayout
            title="Pessoa Física"
            tabs={tabs}
            initialValues={initialValues}
            onSubmit={async (values)=>{
                try{
                    // se edição, atualiza PF e Pessoa + documentos
                    if(idParam){
                        const pfId = Number(idParam);
                        await api.put(`/api/basico/pessoa-fisica/${pfId}`, {
                            nome: values.nome, cpf: values.cpf, rg: values.rg, nomeSocial: values.nomeSocial,
                            dataNascimento: values.dataNascimento, cidadeOrigemId: values.cidadeOrigem ? Number(values.cidadeOrigem): null,
                            generoId: values.generoId? Number(values.generoId):null, etniaId: values.etniaId? Number(values.etniaId):null,
                            estadoCivilId: values.estadoCivilId? Number(values.estadoCivilId):null, escolaridadeId: values.escolaridadeId? Number(values.escolaridadeId):null,
                            nomeReferencia: values.nomeReferencia, telefoneReferencia: values.telefoneReferencia, celularReferencia: values.celularReferencia,
                            nomeReferencia2: values.nomeReferencia2, telefoneReferencia2: values.telefoneReferencia2, celularReferencia2: values.celularReferencia2,
                            nomePai: values.nomePai, nomeMae: values.nomeMae, telefoneComercial: values.telefoneComercial,
                            facebook: values.facebook, twitter: values.twitter, googlePlus: values.googlePlus,
                        });
                    }
                    console.log('Salvar pessoa física:', values);
                }catch(e){ console.error(e); }
            }}
            onCancel={()=> navigation.goBack()}
            submitLabel="Salvar"
            cancelLabel="Voltar"
        />
    );
}
