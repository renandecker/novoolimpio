package br.com.sol7.olimpio.shared;
import jakarta.ws.rs.core.Response; import jakarta.ws.rs.ext.ExceptionMapper; import jakarta.ws.rs.ext.Provider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@Provider public class ApiExceptionMapper implements ExceptionMapper<RuntimeException> {
 private static final Logger LOGGER = LoggerFactory.getLogger(ApiExceptionMapper.class);
 public Response toResponse(RuntimeException e) { LOGGER.error("API ERROR", e); return Response.status(Response.Status.BAD_REQUEST).entity(new ErrorResponse("BUSINESS_ERROR", e.getMessage())).build(); }
 public record ErrorResponse(String code, String message) {}
}