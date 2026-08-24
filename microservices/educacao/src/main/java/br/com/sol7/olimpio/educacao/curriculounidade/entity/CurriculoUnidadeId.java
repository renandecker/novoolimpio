package br.com.sol7.olimpio.educacao.curriculounidade;

import java.io.Serializable;
import java.util.Objects;

public class CurriculoUnidadeId implements Serializable {
    private Long curriculoId;
    private Long unidadeId;

    public CurriculoUnidadeId() {
    }

    public CurriculoUnidadeId(Long curriculoId, Long unidadeId) {
        this.curriculoId = curriculoId;
        this.unidadeId = unidadeId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CurriculoUnidadeId that = (CurriculoUnidadeId) o;
        return Objects.equals(curriculoId, that.curriculoId) && Objects.equals(unidadeId, that.unidadeId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(curriculoId, unidadeId);
    }
}
