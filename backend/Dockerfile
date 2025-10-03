# Use OpenJDK 21 (matching your project)
FROM openjdk:21-jdk-alpine

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml from backend folder
COPY backend/mvnw .
COPY backend/.mvn .mvn
COPY backend/pom.xml .

# Make Maven wrapper executable
RUN chmod +x ./mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code from backend folder
COPY backend/src src

# Copy frontend files from root to static resources
COPY frontend/ src/main/resources/static/

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/logistics-management-system-1.0.0.jar"]

