package br.com.sol7.olimpio.estoque.controleepedidos;

import java.math.BigDecimal;
import java.util.Date;

public record ControlePedidosResponse(
        Long id,
        Date dataEntrega,
        boolean aprovado,
        Date dataAprovacao,
        Date dataPrevisao,
        BigDecimal valor,
        int quantidade,
        Long usuarioId,
        Long solicitacaoEstoqueId,
        Long movimentacaoEstoqueId,
        Long produtoId,
        Long unidadeId,
        String produtoNome,
        String produtoImagem,
        String produtoCategoriaDescricao,
        String unidadeNome,
        String usuarioLogin,
        String solicitacaoUsuarioLogin,
        Date solicitacaoDataSolicitacao,
        int solicitacaoQuantidade
        ){
public ControlePedidosResponse(Long id,Date dataEntrega,boolean aprovado,Date dataAprovacao,Date dataPrevisao,BigDecimal valor,int quantidade,Long usuarioId,Long solicitacaoEstoqueId,Long movimentacaoEstoqueId,Long produtoId,Long unidadeId){
        this(id,dataEntrega,aprovado,dataAprovacao,dataPrevisao,valor,quantidade,usuarioId,solicitacaoEstoqueId,movimentacaoEstoqueId,produtoId,unidadeId,null,null,null,null,null,null,null,0);
        }
        }
