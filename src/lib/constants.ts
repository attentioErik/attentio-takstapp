export const CONDITION_GRADES = {
  TG0: {
    label: 'TG0',
    name: 'Ingen avvik',
    description: 'Tilnærmet nytt (<5 år), ingen symptomer',
    color: 'emerald',
    bgClass: 'bg-emerald-100 dark:bg-emerald-900/30',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    borderClass: 'border-emerald-200 dark:border-emerald-800',
  },
  TG1: {
    label: 'TG1',
    name: 'Mindre avvik',
    description: 'Normal slitasje, ingen tiltak nødvendig',
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/30',
    textClass: 'text-green-700 dark:text-green-300',
    borderClass: 'border-green-200 dark:border-green-800',
  },
  TG2: {
    label: 'TG2',
    name: 'Vesentlige avvik',
    description: 'Behov for tiltak i nær fremtid',
    color: 'amber',
    bgClass: 'bg-amber-100 dark:bg-amber-900/30',
    textClass: 'text-amber-700 dark:text-amber-300',
    borderClass: 'border-amber-200 dark:border-amber-800',
  },
  TG3: {
    label: 'TG3',
    name: 'Store avvik',
    description: 'Alvorlige avvik, umiddelbar utbedring',
    color: 'red',
    bgClass: 'bg-red-100 dark:bg-red-900/30',
    textClass: 'text-red-700 dark:text-red-300',
    borderClass: 'border-red-200 dark:border-red-800',
  },
  TGIU: {
    label: 'TGiU',
    name: 'Ikke undersøkt',
    description: 'Ikke tilgjengelig for inspeksjon',
    color: 'slate',
    bgClass: 'bg-slate-100 dark:bg-slate-900/30',
    textClass: 'text-slate-700 dark:text-slate-300',
    borderClass: 'border-slate-200 dark:border-slate-800',
  },
} as const;

export const BUILDING_SECTION_CATEGORIES = [
  { id: 'vatrom', name: 'Våtrom', icon: 'Droplets', required: true },
  { id: 'kjokken', name: 'Kjøkken', icon: 'ChefHat', required: true },
  { id: 'tak', name: 'Tak og takkonstruksjon', icon: 'Home', required: true },
  { id: 'yttervegger', name: 'Yttervegger og fasade', icon: 'Square', required: true },
  { id: 'vinduer', name: 'Vinduer og dører', icon: 'DoorOpen', required: true },
  { id: 'grunnmur', name: 'Grunnmur og fundamenter', icon: 'Layers', required: true },
  { id: 'drenering', name: 'Drenering', icon: 'Waves', required: true },
  { id: 'elektrisk', name: 'Elektrisk anlegg', icon: 'Zap', required: true },
  { id: 'vvs', name: 'VVS-installasjoner', icon: 'Thermometer', required: true },
  { id: 'ventilasjon', name: 'Ventilasjon', icon: 'Wind', required: true },
  { id: 'pipe', name: 'Pipe og ildsted', icon: 'Flame', required: false },
  { id: 'terreng', name: 'Rom under terreng', icon: 'ArrowDown', required: false },
  { id: 'balkong', name: 'Balkong/terrasse', icon: 'Fence', required: false },
  { id: 'garasje', name: 'Garasje/carport', icon: 'Car', required: false },
] as const;

export const REPORT_TYPES = {
  tilstandsrapport: {
    name: 'Tilstandsrapport',
    description: 'Grundig teknisk vurdering iht. NS 3600',
    icon: 'ClipboardCheck',
  },
  verditakst: {
    name: 'Verditakst',
    description: 'Verdivurdering med teknisk gjennomgang',
    icon: 'BadgeDollarSign',
  },
  forhandstakst: {
    name: 'Forhåndstakst',
    description: 'Verdivurdering før ferdigstillelse',
    icon: 'FileSearch',
  },
} as const;

export const PROPERTY_TYPES = {
  enebolig: 'Enebolig',
  rekkehus: 'Rekkehus',
  leilighet: 'Leilighet',
  fritidsbolig: 'Fritidsbolig',
  tomannsbolig: 'Tomannsbolig',
} as const;

export const REPORT_STATUS_LABELS = {
  draft: 'Utkast',
  in_progress: 'Under arbeid',
  completed: 'Ferdigstilt',
  archived: 'Arkivert',
} as const;

export const REPORT_STATUS_COLORS = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  archived: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
} as const;
