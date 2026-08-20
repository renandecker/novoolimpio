package br.com.sol7.olimpio.educacao.oferecimentocurso;

// Reworkado: "Oferecimento Curso" legado corresponde a um Grupo (edc_grupo) do curso.
public record OferecimentoCursoResponse(Long id,String nome,Long unidadeId,Long curriculoId,
        String unidade_descricao,String curriculo_descricao){}
