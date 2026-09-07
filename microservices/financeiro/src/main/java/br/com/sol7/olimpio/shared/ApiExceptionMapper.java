package br.com.sol7.olimpio.shared;

import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

@Provider
public class ApiExceptionMapper implements ExceptionMapper<RuntimeException> {
    public Response toResponse(RuntimeException e) {
        if (e instanceof NotFoundException) {
            return Response.status(Response.Status.NOT_FOUND).entity(new ErrorResponse("NOT_FOUND", e.getMessage())).build();
        }
        if (e instanceof WebApplicationException wae) {
            int status = wae.getResponse() != null ? wae.getResponse().getStatus() : 500;
            String code = status == 400 ? "BAD_REQUEST" : status == 404 ? "NOT_FOUND" : "BUSINESS_ERROR";
            return Response.status(status).entity(new ErrorResponse(code, e.getMessage())).build();
        }
        if (e instanceof IllegalArgumentException || e instanceof IllegalStateException) {
            return Response.status(Response.Status.BAD_REQUEST).entity(new ErrorResponse("BUSINESS_ERROR", e.getMessage())).build();
        }
        // Erros inesperados (NPE, SQL, etc.) devem ser 500 para não mascarar bugs como 400
        return Response.status(Response.Status.INTERNAL_SERVER_ERROR).entity(new ErrorResponse("INTERNAL_ERROR", e.getMessage())).build();
    }

    public record ErrorResponse(String code, String message) {
    }
}