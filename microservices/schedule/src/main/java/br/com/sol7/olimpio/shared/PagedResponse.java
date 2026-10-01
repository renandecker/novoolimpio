package br.com.sol7.olimpio.shared;

import java.util.List;

public record PagedResponse<T>(List<T> content, long totalElements, int page, int size, int totalPages) {
    public PagedResponse(List<T> content, long totalElements, int page, int size) {
        this(content, totalElements, page, size, (int) Math.ceil((double) totalElements / Math.max(1, size)));
    }
    public PagedResponse {
        page = Math.max(0, page);
        size = Math.max(1, size);
    }
}