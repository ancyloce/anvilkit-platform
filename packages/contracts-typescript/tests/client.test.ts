import { expect, test } from "bun:test";
import { createContractClient } from "../src/index.ts";
import type { AgentRun } from "../src/generated/schema.ts";

test("contract client resolves canonical JSON responses", async () => {
  const request = createContractClient({
    baseUrl: "https://agent.example.invalid",
    fetch: async () => new Response(JSON.stringify({ kind: "AgentRun" }), { status: 200 }),
  });
  const run = await request<Partial<AgentRun>>("/workspaces/w/agent-runs/r");
  expect(run.kind).toBe("AgentRun");
});

test("contract client fails closed on error status", async () => {
  const request = createContractClient({
    baseUrl: "https://agent.example.invalid",
    fetch: async () => new Response("{}", { status: 503 }),
  });
  await expect(request("/workspaces/w/agent-runs/r")).rejects.toThrow("contract request failed: 503");
});
