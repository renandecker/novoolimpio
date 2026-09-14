import React, {useEffect, useState} from 'react';
import {Alert} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {FormLayout, FormTabConfig} from '../FormLayout';
import {api} from '../api';

const str = (v: unknown): string => (v === null || v === undefined ? '' : String(v));
const formatCep = (v: string): string => { const d = v.replace(/\D/g, '').slice(0, 8); if (d.length <= 5) return d; return `${d.slice(0, 5)}-${d.slice(5)}`; };

export default function ViewPessoaFormPessoaJuridicaListScreen() {
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
                const pj = (await api.get<Record<string, unknown>>(`/api/basico/pessoa-juridica/${idParam}`)).data;
                let pes: Record<string, unknown>|null=null;
                if(pj.pessoaId) pes=(await api.get<Record<string, unknown>>(`/api/basico/pessoa/${pj.pessoaId}`)).data;
                if(!ativo) return;
                // carrega endereco fiel ao colunasPessoaJuridica.xhtml / formPessoaFisica
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
                    cnpj: str(pj.cnpj), razaoSocial: str(pj.razaoSocial), nomeFantasia: str(pj.nomeFantasia),
                    inscricaoMunicipal: str(pj.inscricaoMunicipal), inscricaoEstadual: str(pj.inscricaoEstadual),
                    email: str(pes?.email), fax: str(pj.fax),
                    telefone: str(pes?.telefone), celular: str(pes?.celular),
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
            fields: [
                {name: 'cnpj', label: 'CNPJ *', type: 'mask', mask: '99.999.999/9999-99', required: true},
                {name: 'razaoSocial', label: 'Razão Social *', required: true},
                {name: 'nomeFantasia', label: 'Nome Fantasia *', required: true},
            ],
        },
        {
            key: 'informacoesBasicas',
            label: 'Informações Básicas',
            fields: [
                {name: 'inscricaoMunicipal', label: 'Inscrição Municipal'},
                {name: 'inscricaoEstadual', label: 'Inscrição Estadual'},
                {name: 'email', label: 'E-mail', type: 'email'},
                {name: 'foto', label: 'Foto / Logo', type: 'text', placeholder: 'Selecionar imagem'},
            ],
        },
        {
            key: 'contatos',
            label: 'Contatos',
            fields: [
                {name: 'telefone', label: 'Telefone *', type: 'mask', mask: '99-999999999', required: true},
                {name: 'celular', label: 'Celular *', type: 'mask', mask: '99-999999999', required: true},
                {name: 'fax', label: 'Fax', type: 'mask', mask: '99-999999999'},
            ],
        },
        {
            key: 'endereco',
            label: 'Endereço',
            // layout fiel ao formPessoaFisica mobile: CEP com Busca/Ajuste/Novo + cidade/bairro/logradouro autocomplete + número/complemento
            fields: [
                {name: 'cep', label: 'CEP', type: 'mask', mask: '99.999-999', full: true, actions: [
                    {label: 'Busca', disabled: buscandoCep, onPress: async ({value, setValue}) => {
                        const clean = String(value ?? '').replace(/\D/g, '');
                        if (clean.length !== 8) { Alert.alert('Aviso', 'Informe o CEP completo'); return; }
                        setBuscandoCep(true);
                        try {
                            // tenta backend primeiro (logradouroController/buscar-endereco-por-cep)
                            try {
                                const {data} = await api.get<any>(`/api/basico/logradouro/buscar-endereco-por-cep`, {params: {cep: clean}});
                                if (data?.logradouro) {
                                    const l = data.logradouro;
                                    setValue('cep', formatCep(String(l?.cep ?? clean)));
                                    if (data?.cidade) setValue('cidade', String((data.cidade as any).nome ?? ''));
                                    if (data?.bairro) setValue('bairro', String((data.bairro as any).descricao ?? ''));
                                    setValue('logradouro', String(l?.descricao ?? ''));
                                    return;
                                }
                            } catch {}
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
                {name: 'cidade', label: 'Cidade', type: 'autoComplete', autoCompleteSource:'/api/basico/cidade/autoComplete', required: true, full: true},
                {name: 'bairro', label: 'Bairro', type: 'autoComplete', autoCompleteSource:'/api/basico/bairro/auto-complete', required: true, full: true},
                {name: 'logradouro', label: 'Logradouro', type: 'autoComplete', autoCompleteSource:'/api/basico/logradouro/auto-complete', required: true, full: true},
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
            title="Pessoa Jurídica"
            tabs={tabs}
            initialValues={initialValues}
            onSubmit={async (values)=>{
                try{
                    if(idParam){
                        const pjId = Number(idParam);
                        await api.put(`/api/basico/pessoa-juridica/${pjId}`, {
                            cnpj: values.cnpj, razaoSocial: values.razaoSocial, nomeFantasia: values.nomeFantasia,
                            inscricaoMunicipal: values.inscricaoMunicipal || null, inscricaoEstadual: values.inscricaoEstadual || null,
                            fax: values.fax || null,
                        });
                    }
                    console.log('Salvar pessoa jurídica:', values);
                }catch(e){ console.error(e); }
            }}
            onCancel={()=> navigation.goBack()}
            submitLabel="Salvar"
            cancelLabel="Voltar"
        />
    );
}
