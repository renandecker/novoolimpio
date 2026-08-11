package br.com.sol7.olimpio.aula.aula.entity;

import java.io.Serializable;
import java.util.Objects;

public class AulaAlunoId implements Serializable {

    public Long aulaId;
    public Long pessoaId;

    public AulaAlunoId() {}

    public AulaAlunoId(Long aulaId, Long pessoaId) {
        this.aulaId = aulaId;
        this.pessoaId = pessoaId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AulaAlunoId that)) return false;
        return Objects.equals(aulaId, that.aulaId) && Objects.equals(pessoaId, that.pessoaId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(aulaId, pessoaId);
    }
}
