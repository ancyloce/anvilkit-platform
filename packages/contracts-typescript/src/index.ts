export * as AgentService from "./generated/agent-service.ts";
export * as PagixAgentIntegration from "./generated/pagix-agent-integration.ts";
export * as Schema from "./generated/schema.ts";
export { ContractCompatibilityError, verifyCandidateBom } from "./compatibility.ts";

export type ContractClientOptions = {
  baseUrl: string;
  fetch?: typeof globalThis.fetch;
  headers?: HeadersInit;
};

export function createContractClient(options: ContractClientOptions) {
  const send = options.fetch ?? globalThis.fetch;
  return async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await send(new URL(path, options.baseUrl), {
      ...init,
      headers: { ...options.headers, ...init.headers },
    });
    if (!response.ok) throw new Error(`contract request failed: ${response.status}`);
    return response.json() as Promise<T>;
  };
}
