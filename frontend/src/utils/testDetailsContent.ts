import type { LabTestResponse, LifestyleTip, TestFAQ, TestParameter } from '../types/labTest';

type PartialTestDetails = Partial<LabTestResponse>;

const HOME_COLLECTION_STEPS = [
  'Certified phlebotomist visits your home',
  'Sample is collected in sterile containers',
  'Sample is labeled and packed securely',
  'Sample is transported to lab immediately',
  'Report is generated within 24 hours'
];

const DEFAULT_LIFESTYLE_TIPS: LifestyleTip[] = [
  { icon: '💧', title: 'Hydration', description: 'Drink enough water daily for better metabolism and blood flow.' },
  { icon: '🥗', title: 'Balanced Diet', description: 'Eat protein, fiber, and micronutrient-rich foods.' },
  { icon: '🏃', title: 'Activity', description: 'Do regular physical activity and maintain a healthy routine.' },
  { icon: '😴', title: 'Sleep', description: 'Get 7-8 hours of quality sleep for recovery and hormonal balance.' },
  { icon: '🚭', title: 'Healthy Habits', description: 'Avoid smoking and limit alcohol intake.' }
];

const DEFAULT_FAQS: TestFAQ[] = [
  {
    question: 'When should this test be done?',
    answer: 'This test can be done when advised by your doctor, during routine health checks, or when related symptoms are present.'
  },
  {
    question: 'Is fasting required for this test?',
    answer: 'Fasting depends on the test type. Please follow the fasting instructions shown in the test details.'
  },
  {
    question: 'How long does the report take?',
    answer: 'Most reports are available within the mentioned turnaround time after sample collection.'
  }
];

const CONTAINS_BY_ID: Record<number, number> = {
  1: 31,
  2: 1,
  3: 1,
  4: 1,
  5: 1,
  6: 15,
  7: 1,
  8: 1,
  9: 1,
  10: 1,
  11: 12,
  12: 1,
  13: 14,
  14: 1,
  15: 1,
  16: 13,
  17: 1,
  18: 1,
  19: 1,
  20: 1,
  21: 1,
  22: 8,
  23: 1,
  24: 1,
  25: 1,
  26: 1,
  27: 1,
  28: 3,
  29: 1,
  30: 1,
  31: 1,
  32: 1,
  33: 1,
  34: 1,
  35: 1,
  36: 20,
  37: 1,
  38: 1,
  39: 1,
  40: 2,
  41: 1,
  42: 1,
  43: 1,
  44: 1,
  45: 1,
  46: 1,
  47: 1,
  48: 1,
  49: 1,
  50: 1,
  51: 1,
  52: 1,
  53: 1,
  54: 4,
  55: 2,
  56: 1,
  57: 1,
  58: 2,
  59: 1,
  60: 1,
  61: 1,
  62: 1,
  63: 1,
  64: 1,
  65: 1,
  66: 1,
  67: 1,
  68: 1,
  69: 1,
  70: 1,
  71: 1,
  72: 2,
  73: 3,
  74: 4,
  75: 10,
  76: 30,
  77: 1,
  78: 8,
  79: 20,
  80: 8,
  81: 30,
  82: 15,
  83: 1,
  84: 1,
  85: 2,
  86: 1,
  87: 1,
  88: 1
};

const ALT_NAMES_BY_ID: Record<number, string[]> = {
  1: ['Full blood examination', 'Complete blood picture', 'CBC + Differential'],
  2: ['Hgb', 'Hb test', 'Blood hemoglobin'],
  3: ['FBS', 'Fasting Blood Glucose', 'FBG'],
  4: ['RBS', 'Random Blood Glucose', 'Casual Blood Glucose'],
  5: ['A1c', 'Glycated Hemoglobin', 'Hemoglobin A1c'],
  6: ['Lipid panel', 'Cholesterol test', 'Fasting lipid profile'],
  11: ['TFT', 'Thyroid panel', 'Thyroid function test'],
  13: ['LFT', 'Liver profile', 'Hepatic function test'],
  16: ['RFT', 'Renal profile', 'Kidney panel'],
  22: ['Iron panel', 'Iron profile', 'Iron status test'],
  36: ['Urinalysis', 'Urine analysis', 'Complete urine examination'],
  41: ['Chest X-ray', 'CXR', 'Chest radiograph'],
  46: ['EKG', 'Electrocardiogram', 'Heart tracing'],
  49: ['Brain MRI', 'Cranial MRI', 'Magnetic resonance imaging brain'],
  88: ['DEXA scan', 'Bone densitometry', 'Osteoporosis screening']
};

const CUSTOM_DETAILS: Record<number, PartialTestDetails> = {
  1: {
    knownAbout:
      'The CBC (Complete Blood Count) test provides important information about blood components including RBCs, WBCs and platelets. It helps screen overall health, detect medical conditions, and monitor treatment response.',
    detailedUnderstanding:
      'Blood has four key components: plasma, red blood cells, white blood cells and platelets. CBC evaluates these to identify anemia, infections, bleeding risks, immune conditions and other blood-related abnormalities.',
    benefits: [
      'Full body health check',
      'Fever of unknown origin evaluation',
      'Unexplained weakness and fatigue assessment',
      'Pre-surgery evaluation',
      'Monitor treatment response'
    ],
    conditions: [
      'Anemia',
      'Infections',
      'Bleeding or clotting disorders',
      'Immune disorders',
      'Blood cancers'
    ],
    sampleType: 'Blood',
    sampleCollectionMethod: '2-3 mL venous blood in EDTA tube',
    fastingRequired: false,
    reportTimeHours: 15,
    recentlyBooked: 170691,
    containsTests: 31,
    faqs: [
      {
        question: 'What is CBC?',
        answer: 'CBC is a blood test that measures red cells, white cells, hemoglobin and platelets to assess your overall health.'
      },
      {
        question: 'Do I need fasting for CBC?',
        answer: 'No, fasting is generally not required for CBC.'
      },
      {
        question: 'What can CBC detect?',
        answer: 'CBC can help detect anemia, infections, platelet disorders and other blood-related conditions.'
      }
    ]
  },
  2: {
    knownAbout:
      'Hemoglobin is a protein in red blood cells that carries oxygen from lungs to body tissues and returns carbon dioxide to lungs.',
    detailedUnderstanding:
      'Hemoglobin levels indicate oxygen-carrying capacity of blood. Low levels suggest anemia; high levels can be seen in dehydration or chronic lung conditions.',
    benefits: ['Anemia check', 'Weakness and dizziness evaluation', 'Fatigue assessment', 'Breathlessness workup'],
    conditions: ['Iron deficiency anemia', 'Vitamin deficiency anemia', 'Chronic disease related anemia', 'Polycythemia'],
    sampleType: 'Blood',
    sampleCollectionMethod: '1-2 mL blood in EDTA tube',
    fastingRequired: false,
    reportTimeHours: 2,
    recentlyBooked: 500000,
    containsTests: 1,
    faqs: [
      {
        question: 'What is a normal hemoglobin level?',
        answer: 'Adult Male: 13.5-17.5 g/dL, Adult Female: 12.0-15.5 g/dL. Ranges can vary by lab.'
      },
      {
        question: 'What causes low hemoglobin?',
        answer: 'Common causes include iron deficiency, vitamin deficiency, blood loss, chronic disease or kidney disease.'
      },
      {
        question: 'Can hemoglobin levels change?',
        answer: 'Yes. They can change due to diet, illness, hydration status, altitude and treatment.'
      }
    ]
  }
};

function parseReportTimeHours(value?: string): number | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.toLowerCase();
  if (trimmed.includes('30min')) {
    return 1;
  }

  const match = trimmed.match(/(\d+)/);
  if (!match) {
    return undefined;
  }

  return Number.parseInt(match[1], 10);
}

function normalizeTips(tips?: LifestyleTip[] | string[]): LifestyleTip[] {
  if (!tips || tips.length === 0) {
    return DEFAULT_LIFESTYLE_TIPS;
  }

  if (typeof tips[0] === 'string') {
    return (tips as string[]).map((tip, index) => {
      const cleaned = tip.trim();
      const emojiMatch = cleaned.match(/^([\p{Emoji}\u2600-\u27BF]+)\s*/u);
      const icon = emojiMatch ? emojiMatch[1] : '✅';
      const text = cleaned.replace(/^([\p{Emoji}\u2600-\u27BF]+)\s*/u, '');
      return {
        icon,
        title: `Tip ${index + 1}`,
        description: text
      };
    });
  }

  return tips as LifestyleTip[];
}

function getSampleRequired(sampleType?: string): string {
  const normalized = (sampleType || '').toLowerCase();

  if (normalized.includes('blood')) {
    return '1-3 mL blood sample in recommended collection tube';
  }
  if (normalized.includes('urine')) {
    return 'Clean catch urine sample in sterile container';
  }
  if (normalized.includes('swab')) {
    return 'Nasopharyngeal or oropharyngeal swab collected by trained professional';
  }
  if (normalized.includes('semen')) {
    return 'Whole semen sample in sterile container';
  }
  if (normalized.includes('imaging') || normalized.includes('x-ray') || normalized.includes('mri') || normalized.includes('ct') || normalized.includes('ultrasound')) {
    return 'No biological sample required; procedure-based diagnostic test';
  }

  return 'Sample requirement depends on test protocol';
}

function makeGenericParameters(testName: string, count: number): TestParameter[] {
  const capped = Math.max(1, Math.min(count, 5));
  return Array.from({ length: capped }, (_, index) => ({
    name: capped === 1 ? testName : `${testName} Parameter ${index + 1}`,
    normalRange: 'As per laboratory reference range',
    unit: 'Varies',
    description: 'Interpret with clinical context and physician guidance.'
  }));
}

function getDefaultKnownAbout(name?: string): string {
  return `${name || 'This test'} helps in diagnosis, risk screening, and treatment monitoring. It provides clinically relevant information used by doctors to assess your health status.`;
}

function getDefaultUnderstanding(name?: string): string {
  return `${name || 'This investigation'} is processed in accredited labs using standardized methods. Results should be interpreted with symptoms, medical history, and other tests for accurate diagnosis.`;
}

function getDefaultBenefits(name?: string): string[] {
  return [
    `Routine health assessment with ${name || 'this test'}`,
    'Early risk screening',
    'Support diagnosis of related conditions',
    'Monitor treatment progress'
  ];
}

function getDefaultConditions(name?: string): string[] {
  return [
    `Conditions related to ${name || 'the tested markers'}`,
    'Nutritional deficiencies',
    'Inflammatory or metabolic abnormalities',
    'Organ function changes'
  ];
}

function buildFallbackById(testId: number): PartialTestDetails {
  const containsTests = CONTAINS_BY_ID[testId] || 1;

  return {
    containsTests,
    recentlyBooked: Math.max(15000, 210000 - testId * 1800),
    alternateNames: ALT_NAMES_BY_ID[testId] || [],
    homeCollectionSteps: HOME_COLLECTION_STEPS,
    lifestyleTips: DEFAULT_LIFESTYLE_TIPS,
    faqs: DEFAULT_FAQS
  };
}

export function getEnhancedTestDetails(testId: number, apiData: LabTestResponse): LabTestResponse {
  const fallback = buildFallbackById(testId);
  const custom = CUSTOM_DETAILS[testId] || {};

  const merged: LabTestResponse = {
    ...apiData,
    ...fallback,
    ...custom,
    containsTests: custom.containsTests ?? fallback.containsTests ?? apiData.containsTests ?? apiData.parameters?.length ?? 1,
    reportTimeHours:
      custom.reportTimeHours ??
      fallback.reportTimeHours ??
      apiData.reportTimeHours ??
      parseReportTimeHours(apiData.turnaroundTime) ??
      24,
    sampleType: custom.sampleType ?? apiData.sampleType ?? 'Blood',
    sampleCollectionMethod: custom.sampleCollectionMethod ?? apiData.sampleCollectionMethod ?? getSampleRequired(custom.sampleType ?? apiData.sampleType),
    knownAbout: custom.knownAbout ?? apiData.knownAbout ?? getDefaultKnownAbout(apiData.testName),
    detailedUnderstanding: custom.detailedUnderstanding ?? apiData.detailedUnderstanding ?? getDefaultUnderstanding(apiData.testName),
    benefits: custom.benefits ?? apiData.benefits ?? getDefaultBenefits(apiData.testName),
    conditions: custom.conditions ?? apiData.conditions ?? getDefaultConditions(apiData.testName),
    faqs: custom.faqs ?? apiData.faqs ?? fallback.faqs ?? DEFAULT_FAQS,
    lifestyleTips: normalizeTips((custom.lifestyleTips || apiData.lifestyleTips || fallback.lifestyleTips) as LifestyleTip[] | string[]),
    homeCollectionSteps: custom.homeCollectionSteps ?? apiData.homeCollectionSteps ?? fallback.homeCollectionSteps ?? HOME_COLLECTION_STEPS,
    alternateNames: custom.alternateNames ?? apiData.alternateNames ?? fallback.alternateNames ?? [],
    recentlyBooked: custom.recentlyBooked ?? apiData.recentlyBooked ?? fallback.recentlyBooked,
    parameters:
      apiData.parameters && apiData.parameters.length > 0
        ? apiData.parameters
        : makeGenericParameters(apiData.testName || apiData.name || `Test ${testId}`, custom.containsTests ?? fallback.containsTests ?? 1)
  };

  return merged;
}
