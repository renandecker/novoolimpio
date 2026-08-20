package br.com.sol7.olimpio.estoque.movimentacaoestoque;

import br.com.sol7.olimpio.shared.enums.TipoMovimentacao;

import java.math.BigDecimal;
import java.util.Date;

public record MovimentacaoEstoqueResponse(
        Long id,
        BigDecimal valor,
        int quantidade,
        TipoMovimentacao tipoMovimentacao,
        Date dataMovimento,
        Long usuarioId,
        Long produtoId,
        Long unidadeId,
        Long vendaProdutoId,
        Long unidadeCentralId,
        Long fornecedorId,
        boolean central,
        String produtoNome,
        String unidadeNome,
        String usuarioLogin
        ){
public MovimentacaoEstoqueResponse(Long id,BigDecimal valor,int quantidade,TipoMovimentacao tipoMovimentacao,Date dataMovimento,Long usuarioId,Long produtoId,Long unidadeId,Long vendaProdutoId,Long unidadeCentralId,Long fornecedorId,boolean central){
        this(id,valor,quantidade,tipoMovimentacao,dataMovimento,usuarioId,produtoId,unidadeId,vendaProdutoId,unidadeCentralId,fornecedorId,central,null,null,null);
        }
        }
