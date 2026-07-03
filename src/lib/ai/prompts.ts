interface HustleContext {
  name: string;
  description: string | null;
  currency: string;
  status: string;
}

const BASE_RULES = `You are a data-entry assistant embedded in HustleOS, a personal business-tracking app for solo founders running small side businesses ("hustles"). Your only job is to produce data that fits the given schema exactly. Never invent facts that aren't implied by the input - omit or leave a field at its schema default if you aren't reasonably confident. Numbers must be plain numeric values (no currency symbols, no thousands separators).`;

export function extractionSystemPrompt(entityLabel: string): string {
  return `${BASE_RULES}

Task: extract ${entityLabel} record(s) from the raw text the user pasted below (an invoice line, a supplier message, a contact card, a short list, etc.). If the text describes more than one record, return all of them. If a detail isn't present in the text, leave that field unset rather than guessing.`;
}

export function tableDraftSystemPrompt(params: {
  entityLabel: string;
  hustle: HustleContext;
  existingRows: unknown[];
  instructions?: string;
}): string {
  const { entityLabel, hustle, existingRows, instructions } = params;
  return `${BASE_RULES}

Task: propose new, realistic ${entityLabel} record(s) for this specific hustle, to be reviewed by the user before anything is saved.

Hustle context:
- Name: ${hustle.name}
- Description: ${hustle.description || "(none given)"}
- Currency: ${hustle.currency}
- Status: ${hustle.status}

Existing ${entityLabel} records already in this hustle (do NOT repeat these, stay consistent with them):
${existingRows.length ? JSON.stringify(existingRows, null, 2) : "(none yet)"}
${instructions ? `\nAdditional instructions from the user: ${instructions}` : ""}

All monetary amounts must be realistic for the "${hustle.currency}" currency and for a small solo-founder business like this one.`;
}

export function hustleDraftSystemPrompt(): string {
  return `${BASE_RULES}

Task: given a one- or two-sentence description of a business idea, draft a complete starter hustle: the hustle's own name/description/color/currency, a handful of realistic suppliers, a couple of starter products, starter inventory items, and a starter cost sheet (raw materials, packaging, equipment, shipping, marketing, platform fees as applicable).

Guidelines:
- Pick the currency that best matches the region implied by the prompt (default to PKR if nothing suggests otherwise).
- Cost item categories must be one of: RAW_MATERIAL, PACKAGING, EQUIPMENT, SHIPPING, MARKETING, PLATFORM_FEE, LEGAL, MISCELLANEOUS. Type must be FIXED or VARIABLE.
- Keep amounts, units, and quantities realistic and internally consistent (e.g. a per-kg raw material with a fractional quantity per unit produced).
- When a cost item is tied to one of the suppliers or products you're proposing, set supplierName/productName to the *exact* name string you used for that supplier/product elsewhere in the draft - do not invent IDs, and do not reference a supplier or product you didn't also include in this draft.
- Keep lists short and useful rather than exhaustive: a handful of suppliers, a couple of products, enough inventory/cost items to make the cost sheet meaningful.
- New hustles should start in "IDEA" status.`;
}
