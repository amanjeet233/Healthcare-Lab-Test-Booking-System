/**
 * categoryIcons.ts
 * SVG data-URI icon map for all 29+ lab-test categories.
 * Usage: <img src={getCategoryIcon('heart')} alt="Heart" />
 */

/** Encode an inline SVG as a data URI */
function makeIcon(content: string, bg: string): string {
  return (
    `data:image/svg+xml;utf8,` +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">` +
      `<circle cx="32" cy="32" r="32" fill="${bg}"/>` +
      content +
      `</svg>`
    )
  );
}

export const categoryIcons: Record<string, string> = {
  heart: makeIcon(
    `<path d="M32 50s-18-12-18-24a12 12 0 0124 0 12 12 0 0124 0c0 12-18 24-18 24z" fill="#EF4444"/><path d="M24 30h4l3-6 4 10 3-6 3 2h3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    '#FEE2E2'
  ),
  kidney: makeIcon(
    `<ellipse cx="26" cy="32" rx="10" ry="14" fill="#EAB308" transform="rotate(-15 26 32)"/><ellipse cx="38" cy="32" rx="10" ry="14" fill="#CA8A04" transform="rotate(15 38 32)" opacity=".8"/>`,
    '#FEF9C3'
  ),
  liver: makeIcon(
    `<path d="M18 28c0-8 10-14 20-10 6-4 12 0 10 10-2 12-14 18-20 16-6-2-10-10-10-16z" fill="#F97316"/>`,
    '#FFF7ED'
  ),
  thyroid: makeIcon(
    `<ellipse cx="28" cy="36" rx="9" ry="12" fill="#A855F7"/><ellipse cx="38" cy="36" rx="9" ry="12" fill="#9333EA" opacity=".8"/><rect x="29" y="20" width="6" height="10" rx="3" fill="#7C3AED"/>`,
    '#F5F3FF'
  ),
  lungs: makeIcon(
    `<path d="M22 22v18c0 4 4 8 8 8" stroke="#3B82F6" stroke-width="3" stroke-linecap="round"/><path d="M42 22v18c0 4-4 8-8 8" stroke="#3B82F6" stroke-width="3" stroke-linecap="round"/><ellipse cx="18" cy="36" rx="6" ry="10" fill="#BFDBFE"/><ellipse cx="46" cy="36" rx="6" ry="10" fill="#BFDBFE"/>`,
    '#EFF6FF'
  ),
  brain: makeIcon(
    `<path d="M32 16c-8 0-14 6-14 14 0 4 2 8 6 10v6h16v-6c4-2 6-6 6-10 0-8-6-14-14-14z" fill="#EC4899"/><circle cx="26" cy="30" r="2" fill="#fff"/><circle cx="38" cy="30" r="2" fill="#fff"/>`,
    '#FDF2F8'
  ),
  diabetes: makeIcon(
    `<rect x="20" y="18" width="24" height="30" rx="6" fill="#3B82F6"/><rect x="24" y="24" width="16" height="4" rx="2" fill="#BFDBFE"/><rect x="24" y="31" width="12" height="3" rx="1.5" fill="#BFDBFE"/><text x="32" y="44" text-anchor="middle" fill="#EFF6FF" font-size="7" font-weight="bold">HbA1c</text>`,
    '#EFF6FF'
  ),
  'full-body-checkup': makeIcon(
    `<circle cx="32" cy="26" r="8" fill="#14B8A6"/><path d="M20 50c0-8 5-14 12-14s12 6 12 14" fill="#99F6E4"/><circle cx="32" cy="26" r="4" fill="#0F766E" opacity=".5"/>`,
    '#F0FDFA'
  ),
  'bone-health': makeIcon(
    `<path d="M28 16h8v6l4 4v8l-4 4h-8l-4-4v-8l4-4V16z" fill="#84CC16"/><circle cx="24" cy="28" r="5" fill="#65A30D"/><circle cx="40" cy="28" r="5" fill="#65A30D"/><circle cx="24" cy="40" r="5" fill="#65A30D"/><circle cx="40" cy="40" r="5" fill="#65A30D"/>`,
    '#F7FEE7'
  ),
  vitamin: makeIcon(
    `<rect x="20" y="28" width="24" height="14" rx="7" fill="#F59E0B"/><path d="M32 28a7 7 0 010-14" stroke="#F59E0B" stroke-width="3" stroke-linecap="round"/><path d="M28 42h8M32 42v6" stroke="#D97706" stroke-width="2" stroke-linecap="round"/>`,
    '#FFFBEB'
  ),
  'cancer-markers': makeIcon(
    `<circle cx="32" cy="32" r="14" fill="#0891B2"/><circle cx="32" cy="32" r="8" fill="#06B6D4" opacity=".5"/><path d="M32 18v-4M32 50v-4M18 32h-4M50 32h-4M23 23l-3-3M45 45l-3-3M41 23l3-3M19 45l3-3" stroke="#0E7490" stroke-width="2" stroke-linecap="round"/>`,
    '#ECFEFF'
  ),
  allergy: makeIcon(
    `<path d="M32 18L20 40h24L32 18z" fill="#22C55E" opacity=".8"/><path d="M32 18L18 44h28L32 18z" fill="none" stroke="#16A34A" stroke-width="2"/><circle cx="32" cy="38" r="2" fill="#fff"/>`,
    '#F0FFF4'
  ),
  hormones: makeIcon(
    `<circle cx="32" cy="32" r="10" fill="#D946EF"/><path d="M32 22V14M32 50v-8M22 32H14M50 32h-8" stroke="#A21CAF" stroke-width="2.5" stroke-linecap="round"/><circle cx="32" cy="32" r="4" fill="#FDF4FF"/>`,
    '#FDF4FF'
  ),
  urine: makeIcon(
    `<path d="M24 18h16l4 8H20l4-8z" fill="#6EE7B7"/><rect x="22" y="26" width="20" height="22" rx="4" fill="#34D399"/><path d="M28 34h8M28 40h5" stroke="#059669" stroke-width="2" stroke-linecap="round"/>`,
    '#ECFDF5'
  ),
  cbc: makeIcon(
    `<circle cx="32" cy="32" r="14" fill="#EF4444" opacity=".8"/><circle cx="32" cy="32" r="8" fill="#FCA5A5"/><path d="M30 32a2 2 0 104 0 2 2 0 00-4 0z" fill="#991B1B"/>`,
    '#FEF2F2'
  ),
  'womens-health': makeIcon(
    `<circle cx="32" cy="28" r="10" fill="#EC4899"/><path d="M32 38v10M27 44h10" stroke="#9D174D" stroke-width="2.5" stroke-linecap="round"/>`,
    '#FDF2F8'
  ),
  pregnancy: makeIcon(
    `<ellipse cx="32" cy="34" rx="12" ry="14" fill="#FBCFE8"/><circle cx="32" cy="22" r="8" fill="#F472B6"/><circle cx="32" cy="34" r="5" fill="#EC4899" opacity=".4"/>`,
    '#FFF0F6'
  ),
  infertility: makeIcon(
    `<circle cx="32" cy="28" r="10" fill="#E879F9"/><path d="M32 38v6M27 43h10" stroke="#A21CAF" stroke-width="2" stroke-linecap="round"/><path d="M26 24c0-3 3-5 6-5" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>`,
    '#FDF4FF'
  ),
  'mens-health': makeIcon(
    `<circle cx="32" cy="28" r="10" fill="#3B82F6"/><path d="M40 20l6-6M46 14h-6M46 14v6" stroke="#1D4ED8" stroke-width="2" stroke-linecap="round"/>`,
    '#EFF6FF'
  ),
  'iron-deficiency': makeIcon(
    `<rect x="24" y="20" width="16" height="28" rx="5" fill="#94A3B8"/><rect x="28" y="24" width="8" height="4" rx="2" fill="#CBD5E1"/><circle cx="32" cy="38" r="5" fill="#64748B"/>`,
    '#F8FAFC'
  ),
  'lipid-profile': makeIcon(
    `<path d="M20 40c4-12 8-20 12-20s8 8 12 20" stroke="#F97316" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="20" r="6" fill="#FB923C"/>`,
    '#FFF7ED'
  ),
  'blood-sugar': makeIcon(
    `<circle cx="32" cy="32" r="14" fill="#FCD34D" opacity=".9"/><text x="32" y="37" text-anchor="middle" fill="#92400E" font-size="12" font-weight="bold">G</text>`,
    '#FFFBEB'
  ),
  immunity: makeIcon(
    `<path d="M32 18L22 28v8c0 6 5 10 10 12 5-2 10-6 10-12v-8L32 18z" fill="#10B981"/><path d="M28 33l3 3 5-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
    '#ECFDF5'
  ),
  'senior-citizen': makeIcon(
    `<circle cx="32" cy="24" r="8" fill="#6B7280"/><path d="M24 36c-4 0-8 3-8 8h32c0-5-4-8-8-8h-16z" fill="#9CA3AF"/><path d="M32 36v8M28 48h8" stroke="#4B5563" stroke-width="2" stroke-linecap="round"/>`,
    '#F9FAFB'
  ),
  'child-health': makeIcon(
    `<circle cx="32" cy="26" r="10" fill="#FCD34D"/><path d="M22 42c0-5 5-10 10-10s10 5 10 10" fill="#FDE68A"/><circle cx="28" cy="24" r="2" fill="#92400E"/><circle cx="36" cy="24" r="2" fill="#92400E"/><path d="M28 30q4 4 8 0" stroke="#92400E" stroke-width="1.5" stroke-linecap="round" fill="none"/>`,
    '#FFFBEB'
  ),
  sti: makeIcon(
    `<path d="M32 18L22 28v8c0 6 5 10 10 12 5-2 10-6 10-12v-8L32 18z" fill="#6366F1"/><text x="32" y="37" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">STI</text>`,
    '#EEF2FF'
  ),
  nutrition: makeIcon(
    `<path d="M22 42c0-12 4-20 10-20s10 8 10 20" fill="#84CC16" opacity=".8"/><path d="M32 22V18M28 26l-4-4M36 26l4-4" stroke="#4D7C0F" stroke-width="2" stroke-linecap="round"/>`,
    '#F7FEE7'
  ),
  imaging: makeIcon(
    `<rect x="18" y="22" width="28" height="22" rx="4" fill="#60A5FA" opacity=".8"/><circle cx="32" cy="33" r="7" fill="#BFDBFE"/><circle cx="32" cy="33" r="3" fill="#1D4ED8" opacity=".7"/>`,
    '#EFF6FF'
  ),
  joint: makeIcon(
    `<ellipse cx="32" cy="32" rx="10" ry="14" fill="#F97316" opacity=".7"/><circle cx="32" cy="18" r="6" fill="#EA580C"/><circle cx="32" cy="46" r="6" fill="#EA580C"/>`,
    '#FFF7ED'
  ),
  ophthalmology: makeIcon(
    `<path d="M16 32c4-8 10-12 16-12s12 4 16 12c-4 8-10 12-16 12S20 40 16 32z" fill="#06B6D4" opacity=".7"/><circle cx="32" cy="32" r="6" fill="#0891B2"/><circle cx="32" cy="32" r="2.5" fill="#0C4A6E"/>`,
    '#ECFEFF'
  ),
  dermatology: makeIcon(
    `<ellipse cx="32" cy="32" rx="14" ry="16" fill="#FB923C" opacity=".7"/><path d="M24 28c0-4 4-6 8-4" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>`,
    '#FFF7ED'
  ),
  // Generic flask fallback (also exported for external use)
  _flask: makeIcon(
    `<path d="M28 18v14l-8 14h24L36 32V18" stroke="#0D7C7C" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><rect x="28" y="16" width="8" height="4" rx="1" fill="#0D7C7C"/>`,
    '#F0FDFA'
  ),
};

/* ─────────────────────────────────────────────────────────────────
   getCategoryIcon(label)
   Resolves the best-matching icon for any string (category name,
   route slug, or display label) with fuzzy fallback matching.
───────────────────────────────────────────────────────────────── */
export const getCategoryIcon = (label: string): string => {
  // Normalise to slug key
  const key = label
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[\s/&]+/g, '-')
    .replace(/[^\w-]/g, '');

  if (categoryIcons[key]) return categoryIcons[key];

  // Partial / synonym matching
  const SYNONYMS: [string, string][] = [
    ['heart', 'heart'], ['cardiac', 'heart'],
    ['kidney', 'kidney'], ['renal', 'kidney'],
    ['liver', 'liver'], ['hepatic', 'liver'],
    ['thyroid', 'thyroid'],
    ['lung', 'lungs'], ['pulmon', 'lungs'],
    ['brain', 'brain'], ['neuro', 'brain'],
    ['diabetes', 'diabetes'], ['hba1c', 'diabetes'],
    ['blood-sugar', 'blood-sugar'], ['glucose', 'blood-sugar'],
    ['full-body', 'full-body-checkup'], ['full body', 'full-body-checkup'], ['complete', 'full-body-checkup'],
    ['bone', 'bone-health'],
    ['vitamin', 'vitamin'],
    ['cancer', 'cancer-markers'], ['tumour', 'cancer-markers'], ['psa', 'cancer-markers'],
    ['allergy', 'allergy'],
    ['hormone', 'hormones'], ['pcod', 'hormones'], ['cortisol', 'hormones'], ['stress', 'hormones'],
    ['urine', 'urine'],
    ['cbc', 'cbc'], ['blood count', 'cbc'], ['haematology', 'cbc'],
    ['women', 'womens-health'], ['pcod-screening', 'hormones'],
    ['pregnant', 'pregnancy'], ['pregnancy', 'pregnancy'],
    ['fertility', 'infertility'], ['infertil', 'infertility'],
    ['men', 'mens-health'], ['prostate', 'mens-health'],
    ['iron', 'iron-deficiency'],
    ['lipid', 'lipid-profile'], ['cholesterol', 'lipid-profile'],
    ['immunity', 'immunity'], ['immune', 'immunity'],
    ['senior', 'senior-citizen'], ['elderly', 'senior-citizen'],
    ['child', 'child-health'], ['paediatric', 'child-health'],
    ['sti', 'sti'], ['std', 'sti'],
    ['nutrition', 'nutrition'],
    ['imaging', 'imaging'], ['x-ray', 'imaging'], ['scan', 'imaging'],
    ['joint', 'joint'], ['arthritis', 'joint'],
    ['eye', 'ophthalmology'], ['ophthal', 'ophthalmology'],
    ['skin', 'dermatology'], ['derm', 'dermatology'],
  ];

  const lc = label.toLowerCase();
  for (const [fragment, iconKey] of SYNONYMS) {
    if (lc.includes(fragment) && categoryIcons[iconKey]) return categoryIcons[iconKey];
  }

  return categoryIcons['_flask'];
};
