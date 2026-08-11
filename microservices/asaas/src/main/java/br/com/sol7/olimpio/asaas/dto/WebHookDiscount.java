package br.com.sol7.olimpio.asaas.dto;

import java.math.BigDecimal;
import java.util.Date;

public class WebHookDiscount {
    private Integer dueDateLimitDays;

    private BigDecimal value;

    private Date limitedDate;

    private String type;

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

    public Date getLimitedDate() {
        return limitedDate;
    }

    public void setLimitedDate(Date limitedDate) {
        this.limitedDate = limitedDate;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}

