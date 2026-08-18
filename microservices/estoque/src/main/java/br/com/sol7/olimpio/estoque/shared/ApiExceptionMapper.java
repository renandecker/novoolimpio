package br.com.sol7.olimpio.estoque.shared;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class ApiExceptionMapper implements ExceptionMapper<RuntimeException> {
    public Response toResponse(RuntimeException e) {
        return Response.status(Response.Status.BAD_REQUEST).entity(new ErrorResponse("BUSINESS_ERROR", e.getMessage())).build();
    }
    public record ErrorResponse(String code, String message) {}
}

