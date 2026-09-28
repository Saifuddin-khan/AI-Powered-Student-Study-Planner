FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /workspace
COPY pom.xml ./
COPY src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:21-jre-noble

RUN apt-get update \
    && apt-get install -y --no-install-recommends tesseract-ocr tesseract-ocr-eng \
    && rm -rf /var/lib/apt/lists/*

ENV TESSERACT_DATAPATH=/usr/share/tesseract-ocr/5/tessdata

WORKDIR /app
RUN groupadd --system spring \
    && useradd --system --gid spring --home-dir /app --create-home spring

COPY --from=build --chown=spring:spring /workspace/target/*.jar /app/app.jar

USER spring
EXPOSE 8080
ENTRYPOINT ["java", "-Djava.awt.headless=true", "-jar", "/app/app.jar"]