package br.com.sol7.olimpio.educacao.lote.dto;

import java.util.List;

/**
 * @param canalEmail   envia por e-mail (padrão true quando nulo)
 * @param canalMobile  envia push no mobile via notificacoes (padrão false quando nulo)
 * @param canalSistema notifica na web via notificacoes (padrão false quando nulo)
 */
public record LoteNapEmailRequest(Long etapasNapId, Long mensagemId, List<Long> contratoIds,
                                  Boolean canalEmail, Boolean canalMobile, Boolean canalSistema) {

    public LoteNapEmailRequest(Long etapasNapId, Long mensagemId, List<Long> contratoIds) {
        this(etapasNapId, mensagemId, contratoIds, null, null, null);
    }
}
