FROM eclipse-temurin:21-jre-alpine

LABEL maintainer="vargas-insurtech"

WORKDIR /app

COPY target/insurance-management-system-1.0.0-SNAPSHOT.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/v1/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
