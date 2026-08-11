package br.com.sol7.olimpio.asaas.dto;

import java.math.BigDecimal;

public class WebHookFineInterest {
    private String type;

    private BigDecimal value;

    public BigDecimal getValue() {
        return value;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}

