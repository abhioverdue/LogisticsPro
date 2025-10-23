# ===== Stage 1: Build =====
FROM openjdk:17-jdk-alpine AS build

WORKDIR /app

# Install bash and required tools for Maven wrapper if needed
RUN apk add --no-cache bash curl tar

# Copy Maven wrapper and pom
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Ensure wrapper is executable
RUN chmod +x ./mvnw

# Pre-fetch dependencies (better layer caching)
RUN ./mvnw -B dependency:go-offline

# Copy source
COPY backend src

# Optional: include frontend into static if required by your project structure
# If your repo has ../frontend relative to Dockerfile, you can't reference it from the build context.
# Place frontend build output inside the repo (e.g., ./frontend-dist) and copy that instead:
# COPY frontend-dist/ src/main/resources/static/
RUN cd backend
# Build the application
RUN ./mvnw -B clean package -DskipTests

# ===== Stage 2: Runtime =====
FROM openjdk:17-jdk-alpine

WORKDIR /app

# Create logs directory
RUN mkdir -p /app/logs

# Copy jar from build stage (adjust jar name if your artifactId/version differ)
COPY --from=build /app/target/logistics-management-system-1.0.0.jar /app/app.jar

# Expose port
EXPOSE 8080

# JVM options (tune as needed)
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Entrypoint: pass Spring env vars from docker-compose
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]



