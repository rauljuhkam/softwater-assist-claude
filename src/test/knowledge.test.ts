import { describe, expect, it } from "vitest";
import { buildSimulatedReply, deriveTitle, findTopic, getDropletTips } from "@/lib/knowledge";

describe("findTopic", () => {
  it("matches the hardness topic for hardness keywords", () => {
    const topic = findTopic("What causes hard water scale?");
    expect(topic?.id).toBe("hardness");
  });

  it("matches the regeneration topic for brine/salt keywords", () => {
    const topic = findTopic("How much salt do I need for regeneration?");
    expect(topic?.id).toBe("regeneration");
  });

  it("returns null when no keywords match", () => {
    expect(findTopic("What is the weather today?")).toBeNull();
  });
});

describe("buildSimulatedReply", () => {
  it("includes the safety disclaimer in every reply", () => {
    const reply = buildSimulatedReply("How does ion exchange work?");
    expect(reply.content).toMatch(/does not establish microbiological safety|Softening is not disinfection/);
  });

  it("falls back to generic guidance for unmatched questions", () => {
    const reply = buildSimulatedReply("Tell me a joke");
    expect(reply.sourceLabel).toBeNull();
    expect(reply.content).toContain("simulated assistant");
  });
});

describe("deriveTitle", () => {
  it("returns a trimmed short title", () => {
    expect(deriveTitle("  What is water hardness?  ")).toBe("What is water hardness?");
  });

  it("truncates long first messages", () => {
    const long = "a".repeat(100);
    const title = deriveTitle(long);
    expect(title.length).toBeLessThanOrEqual(51);
    expect(title.endsWith("...")).toBe(true);
  });

  it("falls back to a default for empty input", () => {
    expect(deriveTitle("   ")).toBe("New conversation");
  });
});

describe("getDropletTips", () => {
  it("derives one tip per knowledge topic", () => {
    const tips = getDropletTips();
    expect(tips.length).toBeGreaterThan(0);
    for (const tip of tips) {
      expect(tip.length).toBeGreaterThan(0);
    }
  });
});
