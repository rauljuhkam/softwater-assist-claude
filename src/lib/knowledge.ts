import knowledgeData from "@/data/knowledge.json";

export interface KnowledgeSource {
  id: string;
  title: string;
  url: string;
}

export interface KnowledgeTopic {
  id: string;
  keywords: string[];
  answer: string;
  source: string;
}

export interface KnowledgeBase {
  language: string;
  purpose: string;
  sources: KnowledgeSource[];
  topics: KnowledgeTopic[];
}

export const knowledge = knowledgeData as KnowledgeBase;

export function getSource(sourceId: string): KnowledgeSource | undefined {
  return knowledge.sources.find((s) => s.id === sourceId);
}

const DISCLAIMER =
  "Softening is not disinfection. A softener reduces hardness minerals; it does not remove bacteria, viruses or most contaminants. Have your water tested by a certified lab to understand its safety.";

/**
 * Finds the best-matching knowledge topic for a user message by scoring
 * keyword occurrences. Falls back to a generic guidance response.
 */
export function findTopic(message: string): KnowledgeTopic | null {
  const lower = message.toLowerCase();
  let best: { topic: KnowledgeTopic; score: number } | null = null;

  for (const topic of knowledge.topics) {
    let score = 0;
    for (const keyword of topic.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        score += keyword.split(" ").length;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { topic, score };
    }
  }

  return best?.topic ?? null;
}

export interface SimulatedReply {
  content: string;
  sourceLabel: string | null;
  sourceUrl: string | null;
}

export function buildSimulatedReply(message: string): SimulatedReply {
  const topic = findTopic(message);

  if (!topic) {
    return {
      content:
        "This simulated assistant covers hardness, ion exchange, regeneration, salt, maintenance, efficiency and selection topics for water softeners. Try asking about one of those, for example \"What is water hardness?\" or \"How does regeneration work?\"\n\n" +
        DISCLAIMER,
      sourceLabel: null,
      sourceUrl: null,
    };
  }

  const source = getSource(topic.source);
  const sourceLine = source ? `\n\nSource: ${source.title}` : "";

  return {
    content: `${topic.answer}${sourceLine}\n\n${DISCLAIMER}`,
    sourceLabel: source?.title ?? null,
    sourceUrl: source?.url ?? null,
  };
}

/** Derives a short, friendly tip from a knowledge topic for the Droplet mascot. */
export function getDropletTips(): string[] {
  return knowledge.topics.map((topic) => {
    const firstSentence = topic.answer.split(". ")[0];
    return firstSentence.endsWith(".") ? firstSentence : `${firstSentence}.`;
  });
}

/** Derives a short title for a conversation from its first user message. */
export function deriveTitle(firstMessage: string): string {
  const cleaned = firstMessage.trim().replace(/\s+/g, " ");
  if (cleaned.length === 0) return "New conversation";
  return cleaned.length > 48 ? `${cleaned.slice(0, 48).trimEnd()}...` : cleaned;
}
