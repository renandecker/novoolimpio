package br.com.sol7.olimpio.asaas.dto;


public class ResponseRemoverPagamento {


    private Boolean deleted;
    private String id;

    public Boolean getDeleted() {
        return deleted;
    }

    public void setDeleted(Boolean deleted) {
        this.deleted = deleted;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
}

