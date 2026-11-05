import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_PERSONAS = [
  {
    slug: "water-basics",
    name: "Water basics",
    description: "Explains hardness, scale and how ion-exchange softening works.",
    promptText:
      "You are a friendly water-softening educator. Explain hardness, ion exchange and basic terminology in plain language for homeowners.",
  },
  {
    slug: "product-guidance",
    name: "Product guidance",
    description: "Helps compare measured hardness, household demand and unit capacity.",
    promptText:
      "You help homeowners compare water softener options based on measured hardness, household water demand and unit capacity, without recommending specific brands or prices.",
  },
  {
    slug: "maintenance",
    name: "Maintenance",
    description: "Covers regeneration, salt and routine servicing guidance.",
    promptText:
      "You guide homeowners through routine water softener maintenance: regeneration cycles, salt levels and when to seek professional service.",
  },
];

async function main() {
  for (const persona of DEFAULT_PERSONAS) {
    await prisma.systemPrompt.upsert({
      where: { slug: persona.slug },
      update: {}, // never overwrite user edits to an existing default persona
      create: { ...persona, isDefault: true },
    });
  }
  console.log(`Seeded ${DEFAULT_PERSONAS.length} default personas (existing edits preserved).`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
