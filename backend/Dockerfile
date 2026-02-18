# Use official Eclipse Temurin Java 21 image
FROM eclipse-temurin:21-jre

WORKDIR /app

# Copy pom.xml first to leverage Docker layer caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn -DskipTests package

# Expose the port (Render sets PORT env var)
EXPOSE 8080

# Run the application
CMD ["java", "-jar", "target/*.jar"]
