const BOM_PREFIX = "anvilkit.contract-bom.identity.v1\0";
const BOM_MEDIA_TYPE = "application/vnd.anvilkit.contract-bom.v1+json";

export class ContractCompatibilityError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = "ContractCompatibilityError";
  }
}

type CandidateBom = {
  digest: string;
  compatibility: {
    minimumConsumerGeneration: number;
    maximumConsumerGeneration: number;
  };
  [key: string]: unknown;
};

function canonicalize(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new ContractCompatibilityError("JCS_UNSUPPORTED_VALUE", "BOM contains a non-finite number");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  if (typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalize((value as Record<string, unknown>)[key])}`).join(",")}}`;
  }
  throw new ContractCompatibilityError("JCS_UNSUPPORTED_VALUE", "BOM contains a non-JSON value");
}

export async function verifyCandidateBom(value: CandidateBom, consumerGeneration: number): Promise<string> {
  const { digest: declared, ...withoutDigest } = value;
  const canonical = canonicalize(withoutDigest);
  const input = new TextEncoder().encode(`${BOM_PREFIX}${BOM_MEDIA_TYPE}\0${canonical}`);
  const calculated = `sha256:${Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", input)))
    .map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
  if (declared !== calculated) {
    throw new ContractCompatibilityError("BOM_DIGEST_MISMATCH", "candidate BOM identity does not verify");
  }
  const { minimumConsumerGeneration: minimum, maximumConsumerGeneration: maximum } = value.compatibility;
  if (consumerGeneration < minimum || consumerGeneration > maximum) {
    throw new ContractCompatibilityError("CONTRACT_UNSUPPORTED", "consumer generation is outside the BOM compatibility window");
  }
  return calculated;
}
