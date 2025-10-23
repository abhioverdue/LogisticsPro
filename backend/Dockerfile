# Use Maven with OpenJDK 17 for building
FROM maven:3.9.9-eclipse-temurin-17 AS builder

# Set working directory
WORKDIR /app

# Copy pom.xml and download dependencies first (for better caching)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy the entire source code
COPY src ./src

# Build the application (skip tests for faster build)
RUN mvn clean package -DskipTests

# -------------------------------
# Use lightweight runtime image
# -------------------------------
FROM openjdk:17-jdk-alpine

# Set working directory
WORKDIR /app

# Copy built jar from builder stage
COPY --from=builder /app/target/logistics-management-system-1.0.0.jar ./app.jar

# Create logs directory
RUN mkdir -p /app/logs

# Expose port
EXPOSE 8080

# Set JVM options
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]





