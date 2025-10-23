FROM openjdk:17-jdk-alpine

# Set working directory
WORKDIR /app

COPY pom.xml .

# Copy source code
COPY src src

# Build application
RUN ./mvnw clean package -DskipTests

# Create logs directory
RUN mkdir -p /app/logs

# Expose port
EXPOSE 8080

# Set JVM options
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Run application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar target/logistics-management-system-1.0.0.jar"]






