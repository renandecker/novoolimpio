package br.com.sol7.olimpio.educacao.curriculoatividadecomplementar.entity;

import java.io.Serializable;
import java.util.Objects;

public class CurriculoAtividadeComplementarId implements Serializable {
    private Long curriculoId;
    private Long atividadeComplementarId;

    public CurriculoAtividadeComplementarId() {
    }

    public CurriculoAtividadeComplementarId(Long curriculoId, Long atividadeComplementarId) {
        this.curriculoId = curriculoId;
        this.atividadeComplementarId = atividadeComplementarId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CurriculoAtividadeComplementarId that = (CurriculoAtividadeComplementarId) o;
        return Objects.equals(curriculoId, that.curriculoId) && Objects.equals(atividadeComplementarId, that.atividadeComplementarId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(curriculoId, atividadeComplementarId);
    }
}
