# syntax=docker/dockerfile:1
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml .
RUN mvn -B dependency:go-offline || true
COPY src ./src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:21-jre-jammy AS runtime
WORKDIR /work
ENV LANG='en_US.UTF-8' LANGUAGE='en_US:en'
COPY --from=build /build/target/quarkus-app/lib/ /work/lib/
COPY --from=build /build/target/quarkus-app/*.jar /work/
COPY --from=build /build/target/quarkus-app/app/ /work/app/
COPY --from=build /build/target/quarkus-app/quarkus/ /work/quarkus/
EXPOSE 8082
ENV QUARKUS_HTTP_PORT=8082
USER 185
ENTRYPOINT ["java", "-jar", "/work/quarkus-run.jar"]
