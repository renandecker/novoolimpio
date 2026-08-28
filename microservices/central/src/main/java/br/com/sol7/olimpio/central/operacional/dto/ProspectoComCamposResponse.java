package br.com.sol7.olimpio.central.operacional;

import java.util.List;

public record ProspectoComCamposResponse(
        Long id,
        String nome,
        List<ProspectoCampoResponse> prospectoCampos
) {}

record ProspectoCampoResponse(String rotulo, String valor) {}