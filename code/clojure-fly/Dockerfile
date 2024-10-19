# install additional dependencies here in the base layer
# separate base from build layer so any additional deps installed are cached
FROM clojure:temurin-21-tools-deps-bookworm-slim AS base

FROM base as build
WORKDIR /opt
COPY . .
RUN clj -T:build uber

FROM eclipse-temurin:21-alpine AS prod
COPY --from=build /opt/target/standalone.jar /
EXPOSE 8080
EXPOSE 7888
ENTRYPOINT ["java", "-Dclojure.server.repl={:port 7888,:address \"fly-local-6pn\",:accept clojure.core.server/repl}", "-jar", "standalone.jar"]
