FROM openjdk:17-jdk-alpine AS build
WORKDIR /app
RUN apk add --no-cache bash curl tar
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x mvnw
RUN ./mvnw -B dependency:go-offline
COPY src src
RUN ./mvnw -B clean package -DskipTests

FROM openjdk:17-jdk-alpine
WORKDIR /app
RUN mkdir -p /app/logs
COPY --from=build /app/target/logistics-management-system-1.0.0.jar /app/app.jar
EXPOSE 8080
ENV JAVA_OPTS="-Xmx512m -Xms256m"
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]

