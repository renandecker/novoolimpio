package br.com.sol7.olimpio.asaas.dto;

import java.math.BigDecimal;

public class WebHookCreditCard {
    private Integer dueDateLimitDays;

    private BigDecimal value;

    public BigDecimal getValue() {
        return value;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }

    public Integer getDueDateLimitDays() {
        return dueDateLimitDays;
    }

    public void setDueDateLimitDays(Integer dueDateLimitDays) {
        this.dueDateLimitDays = dueDateLimitDays;
    }
}

