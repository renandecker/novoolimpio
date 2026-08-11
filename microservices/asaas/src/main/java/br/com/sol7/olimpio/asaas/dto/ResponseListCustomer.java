package br.com.sol7.olimpio.asaas.dto;

import java.util.List;

public class ResponseListCustomer {

    private List<ResponseCustomer> data;

    private String object;
    private Boolean hasMore;
    private Integer totalCount;
    private Integer limit;
    private Integer offset;

    public List<ResponseCustomer> getData() {
        return data;
    }

    public void setData(List<ResponseCustomer> data) {
        this.data = data;
    }

    public String getObject() {
        return object;
    }

    public void setObject(String object) {
        this.object = object;
    }

    public Boolean getHasMore() {
        return hasMore;
    }

    public void setHasMore(Boolean hasMore) {
        this.hasMore = hasMore;
    }

    public Integer getTotalCount() {
        return totalCount;
    }

    public void setTotalCount(Integer totalCount) {
        this.totalCount = totalCount;
    }

    public Integer getLimit() {
        return limit;
    }

    public void setLimit(Integer limit) {
        this.limit = limit;
    }

    public Integer getOffset() {
        return offset;
    }

    public void setOffset(Integer offset) {
        this.offset = offset;
    }
}

