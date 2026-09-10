import {PermissionGate} from '../../../shared/services/permissions';

import {DataTable, type DataTableColumn} from '../../../shared/components/DataTable';

import {api} from '../../../shared/services/api';

import {useState} from 'react';



const MATRICULA_COLUMNS: DataTableColumn[] = [

    {key: 'contratoId', label: 'Contrato'},

    {key: 'contrato_pessoa_pessoaFisica_nome', label: 'Aluno'},

    {key: 'contrato_curriculo_curso_nome', label: 'Curso'},

    {key: 'oferecimentoComponenteCurricularId', label: 'Oferecimento'},

    {key: 'oferecimentoComponenteCurricular_componenteCurricular_descricao', label: 'Componente Curricular'},

    {key: 'status', label: 'Status'},

    {key: 'data', label: 'Data'},

];



const exportarDocumento = async (item: Record<string, unknown>, tipo: 'CONTRATO' | 'PROMISSORIA', formato: 'PDF' | 'DOCX' | 'EXCEL') => {

    const contratoId = item.contratoId;

    if (!contratoId) {

        alert('ID do contrato não encontrado');

        return;

    }



    try {

        const endpoint = tipo === 'CONTRATO' 

            ? '/api/educacao/gestao-aluno/gerar-contrato' 

            : '/api/educacao/gestao-aluno/gerar-promissoria';

        

        const response = await api.post<{ fileName: string; contentType: string; base64Data: string }>(

            endpoint,

            { ccId: contratoId, tipoExportacao: formato, parametros: {} }

        );

        

        const { fileName, contentType, base64Data } = response.data;

        const blob = new Blob(

            [Uint8Array.from(atob(base64Data), c => c.charCodeAt(0))], 

            { type: contentType }

        );

        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');

        a.href = url;

        a.download = fileName;

        a.click();

        URL.revokeObjectURL(url);

    } catch (error) {

        console.error(`Erro ao gerar ${tipo} ${formato}:`, error);

        alert(`Erro ao gerar ${tipo} ${formato}`);

    }

};



const ContratoActions: DataTableColumn = {

    key: 'contrato',

    label: 'Contrato',

    render: (item) => (

        <div className="row-actions-export">

            <button

                className="btn-action btnyellow"

                title="Gerar Contrato PDF"

                onClick={() => exportarDocumento(item as Record<string, unknown>, 'CONTRATO', 'PDF')}

            >

                <i className="fa fa-file-pdf-o"/> PDF

            </button>

            <button

                className="btn-action btnyellow"

                title="Gerar Contrato DOCX"

                onClick={() => exportarDocumento(item as Record<string, unknown>, 'CONTRATO', 'DOCX')}

            >

                <i className="fa fa-file-word-o"/> DOCX

            </button>

            <button

                className="btn-action btnyellow"

                title="Gerar Contrato Excel"

                onClick={() => exportarDocumento(item as Record<string, unknown>, 'CONTRATO', 'EXCEL')}

            >

                <i className="fa fa-file-excel-o"/> Excel

            </button>

        </div>

    ),

};



const PromissoriaActions: DataTableColumn = {

    key: 'promissoria',

    label: 'Promissória',

    render: (item) => (

        <div className="row-actions-export">

            <button

                className="btn-action btnyellow"

                title="Gerar Promissória PDF"

                onClick={() => exportarDocumento(item as Record<string, unknown>, 'PROMISSORIA', 'PDF')}

            >

                <i className="fa fa-file-pdf-o"/> PDF

            </button>

            <button

                className="btn-action btnyellow"

                title="Gerar Promissória DOCX"

                onClick={() => exportarDocumento(item as Record<string, unknown>, 'PROMISSORIA', 'DOCX')}

            >

                <i className="fa fa-file-word-o"/> DOCX

            </button>

            <button

                className="btn-action btnyellow"

                title="Gerar Promissória Excel"

                onClick={() => exportarDocumento(item as Record<string, unknown>, 'PROMISSORIA', 'EXCEL')}

            >

                <i className="fa fa-file-excel-o"/> Excel

            </button>

        </div>

    ),

};



export default function ViewMatriculaMatriculaListScreen() {

    return <PermissionGate permission="READ">

        <main>

            <h1>Matrícula</h1>

            <DataTable

                path="/api/view/matricula/matricula"

                columns={[...MATRICULA_COLUMNS, ContratoActions, PromissoriaActions]}

                hideCreate={true}

                maxMainColumns={10}

            />

        </main>

    </PermissionGate>;

}

