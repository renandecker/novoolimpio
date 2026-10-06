# ==============================================================================
# Dockerfile — asaas (Quarkus / Java 21)
# ==============================================================================
# Build:
#   docker build -t olimpio-asaas .
#
# Run:
#   docker run -p 8094:8094 \
#     -e DB_URL=jdbc:postgresql://host.docker.internal:5452/olimpio \
#     -e DB_USER=postgres -e DB_PASSWORD=postgres \
#     olimpio-asaas
# ==============================================================================

# ------------------------------------------------------------------------------
# STAGE 1: build with Maven
# ------------------------------------------------------------------------------
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Copy only pom.xml first: this layer is only invalidated (and dependencies
# only re-downloaded) when pom.xml changes — not on every source change.
# Significantly speeds up rebuilds.
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests -B

# ------------------------------------------------------------------------------
# STAGE 2: runtime image (Quarkus fast-jar — default packaging mode)
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user (container security best practice)
RUN addgroup -S quarkus && adduser -S quarkus -G quarkus

COPY --from=build --chown=quarkus:quarkus /app/target/quarkus-app/lib/ /app/lib/
COPY --from=build --chown=quarkus:quarkus /app/target/quarkus-app/*.jar /app/
COPY --from=build --chown=quarkus:quarkus /app/target/quarkus-app/app/ /app/app/
COPY --from=build --chown=quarkus:quarkus /app/target/quarkus-app/quarkus/ /app/quarkus/

USER quarkus

# 8094 is the default port for this service (application.properties: quarkus.http.port=${PORT:8094}).
# Can be overridden at runtime with -e PORT=<other-port>, no rebuild needed
# — useful on cloud platforms (Render, Railway, Fly.io...) that inject PORT automatically.
EXPOSE 8094

# Production database configuration (can be overridden at runtime with -e)
ENV QUARKUS_DATASOURCE_JDBC_URL="jdbc:postgresql://216.238.106.140:5423/olimpio_novo"
ENV QUARKUS_DATASOURCE_USERNAME="postgres"
ENV QUARKUS_DATASOURCE_PASSWORD="postgres"

# -XX:MaxRAMPercentage prevents JVM from trying to use all host RAM; adjustable
# at runtime via -e JAVA_OPTS="..." without rebuilding the image.
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"

# Shell form + "exec" (instead of ENTRYPOINT array) to allow $JAVA_OPTS expansion
# while still propagating SIGTERM correctly to the Java process
# (without "exec", container would take ~10s to stop waiting for shell to die).
ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/quarkus-run.jar"]