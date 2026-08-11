package br.com.sol7.olimpio.estoque.controleentrega;

import java.util.Date;

public record ControleEntregaResponse(Long id, boolean ativo, int quantidade, String status, Date dataSaida, String rastreio, Long entregaId, Long usuarioId) {}
