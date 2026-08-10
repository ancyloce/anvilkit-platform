import { expect, test } from "bun:test";
import bom from "../../../contracts/governance/m4/release-bom.json";
import { ContractCompatibilityError, verifyCandidateBom } from "../src/compatibility.ts";

test("candidate BOM accepts generation 1 and rejects adjacent generations", async () => {
  expect(await verifyCandidateBom(bom, 1)).toBe(bom.digest);
  for (const generation of [0, 2]) {
    try {
      await verifyCandidateBom(bom, generation);
      throw new Error(`generation ${generation} was accepted`);
    } catch (error) {
      expect(error).toBeInstanceOf(ContractCompatibilityError);
      expect((error as ContractCompatibilityError).code).toBe("CONTRACT_UNSUPPORTED");
    }
  }
});
