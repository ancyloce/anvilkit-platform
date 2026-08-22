#!/usr/bin/env bun
/**
 * Operation-to-handler conformance.
 *
 * The canonical Agent Service description declares the operations the service
 * offers. The service's routing table records the operations its production
 * router actually serves. Nothing held those two together: two governed
 * operations were declared, generated, documented, and reviewed while no
 * production handler existed for either, and every gate passed — because every
 * gate was checking the description against itself.
 *
 * This compares them in both directions and fails on either kind of drift:
 *
 *   - an operation the description declares with no production handler, which
 *     is a contract the service does not honour; and
 *   - a route the service serves that the description does not declare, which
 *     is an undocumented surface nobody agreed to.
 *
 * The service half of the gate lives in the service: it proves the routing
 * table really is what the router resolves against, and that the manifest read
 * here is generated from that table rather than written beside it.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dir, "..");
const descriptionPath = resolve(repositoryRoot, "contracts/agent/openapi/agent-service.openapi.json");
const manifestPath = resolve(repositoryRoot, "services/agent-service/internal/api/operations.json");

type RoutedOperation = { operationId: string; method: string; template: string };
type Manifest = { servedPrefix: string; operations: RoutedOperation[] };

const HTTP_METHODS = ["get", "put", "post", "delete", "options", "head", "patch", "trace"];

function readJSON<T>(path: string, what: string): T {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch (error) {
    throw new Error(`unable to read ${what} at ${path}: ${(error as Error).message}`);
  }
}

/** Every operation the canonical description declares, keyed by identity. */
function declaredOperations(description: any): Map<string, { method: string; path: string }> {
  const declared = new Map<string, { method: string; path: string }>();
  for (const [path, item] of Object.entries(description.paths ?? {})) {
    for (const [method, operation] of Object.entries(item as Record<string, unknown>)) {
      if (!HTTP_METHODS.includes(method)) continue;
      const operationId = (operation as { operationId?: string }).operationId;
      if (!operationId) {
        throw new Error(`${method.toUpperCase()} ${path} declares no operationId`);
      }
      if (declared.has(operationId)) {
        throw new Error(`operationId ${operationId} is declared more than once`);
      }
      declared.set(operationId, { method: method.toUpperCase(), path });
    }
  }
  return declared;
}

function main(): void {
  const description = readJSON<any>(descriptionPath, "the canonical Agent Service description");
  const manifest = readJSON<Manifest>(manifestPath, "the production routing manifest");

  if (typeof manifest.servedPrefix !== "string" || !manifest.servedPrefix.startsWith("/")) {
    throw new Error("the routing manifest declares no served path prefix");
  }
  if (!Array.isArray(manifest.operations) || manifest.operations.length === 0) {
    throw new Error("the routing manifest declares no operations");
  }

  const declared = declaredOperations(description);
  const routed = new Map<string, RoutedOperation>();
  for (const operation of manifest.operations) {
    if (routed.has(operation.operationId)) {
      throw new Error(`the routing manifest names ${operation.operationId} more than once`);
    }
    routed.set(operation.operationId, operation);
  }

  const failures: string[] = [];

  for (const [operationId, described] of declared) {
    const served = routed.get(operationId);
    if (!served) {
      failures.push(
        `${operationId} (${described.method} ${described.path}) is declared by the canonical description but no production handler serves it`,
      );
      continue;
    }
    if (served.method !== described.method) {
      failures.push(
        `${operationId} is declared as ${described.method} and served as ${served.method}`,
      );
    }
    if (served.template !== described.path) {
      failures.push(
        `${operationId} is declared at ${described.path} and served at ${served.template}`,
      );
    }
  }

  for (const [operationId, served] of routed) {
    if (!declared.has(operationId)) {
      failures.push(
        `${operationId} (${served.method} ${served.template}) is served by the production router but the canonical description does not declare it`,
      );
    }
  }

  if (failures.length > 0) {
    console.error("operation-to-handler conformance failed:");
    for (const failure of failures.sort()) console.error(`  - ${failure}`);
    process.exit(1);
  }

  console.log(
    `operation-to-handler conformance: ${declared.size} declared operations, all served under ${manifest.servedPrefix}`,
  );
}

try {
  main();
} catch (error) {
  console.error(`operation-to-handler conformance failed: ${(error as Error).message}`);
  process.exit(1);
}
