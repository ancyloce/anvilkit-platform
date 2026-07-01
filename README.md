# @anvilkit/platform

anvilkit-platform is the backend platform monorepo for AnvilKit. Its first service, anvilkit-render-worker, consumes immutable page deployment events, fetches version-pinned HTML from anvilkit-render-origin, harvests dependencies, uploads static artifacts to S3-compatible storage, and emits deployment artifact events for downstream CDN activation.
