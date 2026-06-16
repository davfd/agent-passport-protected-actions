import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(process.cwd(), "..");

function readRepoFile(path: string): string {
  return readFileSync(resolve(repoRoot, path), "utf8");
}

describe("Terminal 3 submission copy matches the authoritative bounty rules", () => {
  it("keeps the exact 30/40/30 build-track scoring visible in judge-facing copy", () => {
    const packet = readRepoFile("SUBMISSION_PACKET.md");
    const formFields = readRepoFile("SUBMISSION_FORM_FIELDS.md");
    const combined = `${packet}\n${formFields}`;

    expect(combined).toContain("Completeness (30%)");
    expect(combined).toContain("SDK integration in its entirety (40%)");
    expect(combined).toContain("Creativity (30%)");
  });

  it("ships the countable bug/docs appendix under the exact report rules", () => {
    const packet = readRepoFile("SUBMISSION_PACKET.md");
    const formFields = readRepoFile("SUBMISSION_FORM_FIELDS.md");
    const appendix = readRepoFile("BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md");
    const rulesPath = resolve(repoRoot, "CHALLENGE_RULES_EXTRACT.md");

    expect(existsSync(rulesPath)).toBe(true);
    expect(packet).toContain("BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md");
    expect(formFields).toContain("BUGS_AND_DOC_GAPS_RULE_COMPLIANT_APPENDIX_20260615T191349Z.md");
    expect(appendix).toContain("Total findings: 11");
    expect(appendix).toContain("Every item includes: reproduction, observed, expected, required fix");

    const rules = readFileSync(rulesPath, "utf8");
    expect(rules).toContain("Each report must contain a reproduction of the issue");
    expect(rules).toContain("real issue that is in scope, actionable, and verifiable");
    expect(rules).toContain("Low-effort AI-generated reports will be ignored");
  });
});
