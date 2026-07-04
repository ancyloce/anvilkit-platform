# Mock services image (FR-022). Build context is the PLATFORM REPO ROOT —
# the mocks module resolves the worker module via a local replace directive:
#
#   docker build -f mocks/Dockerfile --build-arg SERVICE=deployment-service-mock .
#   docker build -f mocks/Dockerfile --build-arg SERVICE=asset-service-mock .
FROM golang:1.26-alpine AS build
ARG SERVICE=deployment-service-mock
WORKDIR /src
COPY services/export-worker/ services/export-worker/
COPY mocks/ mocks/
WORKDIR /src/mocks
RUN go mod download
RUN CGO_ENABLED=0 go build -o /out/mock ./cmd/${SERVICE}

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/mock /mock
EXPOSE 8080
ENTRYPOINT ["/mock"]
