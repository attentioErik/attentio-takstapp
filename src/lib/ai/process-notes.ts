import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ProcessedSection {
  category: string;
  name: string;
  conditionGrade: 'TG0' | 'TG1' | 'TG2' | 'TG3' | 'TGIU';
  description: string;
  observations: string;
  cause?: string;
  consequence?: string;
  repairCostEstimate?: { min: number; max: number };
  confidence: number;
}

export async function processNotes(input: {
  notes: string;
  reportType: string;
  propertyType: string;
  constructionYear: number;
}): Promise<ProcessedSection[]> {
  const systemPrompt = `Du er en ekspert på norske takstrapporter og NS 3600-standarden.
Din oppgave er å analysere befaringsnotater og strukturere dem til en formell tilstandsrapport.

VIKTIGE REGLER:
1. Følg NS 3600:2025 standarden for tilstandsgrader:
   - TG0: Ingen avvik, tilnærmet nytt (<5 år), dokumentasjon foreligger
   - TG1: Normal slitasje, ingen tiltak nødvendig
   - TG2: Vesentlige avvik, vedlikehold trengs i nær fremtid
   - TG3: Store/alvorlige avvik, umiddelbar utbedring nødvendig
   - TGIU: Ikke undersøkt/ikke tilgjengelig

2. For TG2 og TG3 MÅ du inkludere årsak og konsekvens
3. For TG3 MÅ du gi kostnadsanslag (min-max intervall i NOK)
4. Vær konservativ - hvis usikker, velg høyere TG
5. Bruk profesjonelt, teknisk språk

RESPONSER MÅ VÆRE I JSON FORMAT.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Analyser følgende befaringsnotater og strukturer dem til rapportseksjoner.
Rapporttype: ${input.reportType}
Boligtype: ${input.propertyType}
Byggeår: ${input.constructionYear}

BEFARINGSNOTATER:
${input.notes}

Returner et JSON-array med seksjoner på følgende format:
[
  {
    "category": "kategori-id (vatrom/kjokken/tak/yttervegger/vinduer/grunnmur/drenering/elektrisk/vvs/ventilasjon/pipe/terreng/balkong/garasje)",
    "name": "Visningsnavn",
    "conditionGrade": "TG0|TG1|TG2|TG3|TGIU",
    "description": "Formell beskrivelse",
    "observations": "Detaljerte observasjoner",
    "cause": "Årsak (kun TG2/TG3)",
    "consequence": "Konsekvens (kun TG2/TG3)",
    "repairCostEstimate": { "min": 0, "max": 0 },
    "confidence": 0.0
  }
]

Svar KUN med JSON-arrayet, ingen annen tekst.`,
      },
    ],
  });

  const content = response.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response type');

  const jsonMatch = content.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('Could not parse AI response');

  return JSON.parse(jsonMatch[0]) as ProcessedSection[];
}
