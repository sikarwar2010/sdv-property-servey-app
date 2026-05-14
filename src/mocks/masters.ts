import type { DropdownOption, Ulb, Ward } from '@/src/types';

export const ulbs: Ulb[] = [
  { code: 'MNP-027', name: 'Mathura Nagar Panchayat' },
  { code: 'VNP-019', name: 'Vrindavan Nagar Panchayat' },
  { code: 'GNP-031', name: 'Govardhan Nagar Panchayat' },
];

export const wards: Ward[] = [
  { ulbCode: 'MNP-027', wardNo: '12', name: 'Ward 12 — Krishna Nagar' },
  { ulbCode: 'MNP-027', wardNo: '14', name: 'Ward 14 — Govind Vihar' },
  { ulbCode: 'MNP-027', wardNo: '18', name: 'Ward 18 — Gokul Marg' },
  { ulbCode: 'VNP-019', wardNo: '03', name: 'Ward 03 — Bankey Bihari' },
];

export const assessmentYears: DropdownOption[] = [
  { value: '2025-26', label: '2025-26' },
  { value: '2024-25', label: '2024-25' },
  { value: '2023-24', label: '2023-24' },
];

/** Main ownership category; when `individual`, use `individualTenancyTypes` for single vs joint. */
export const ownershipTypes: DropdownOption[] = [
  { value: 'individual', label: 'Individual' },
  { value: 'limited_company', label: 'Limited company' },
  { value: 'firm_trust_society', label: 'Firm / trust / society' },
  { value: 'state_government', label: 'State government' },
  { value: 'central_government', label: 'Central government' },
  { value: 'municipal_town_panchayat', label: 'Municipal council / town panchayat' },
  { value: 'lease', label: 'Lease' },
  { value: 'hfa_awasiy_makaan', label: 'HFA — Awasiy makaan' },
];

export const individualTenancyTypes: DropdownOption[] = [
  { value: 'single', label: 'Single' },
  { value: 'joint', label: 'Joint' },
];

export const situations: DropdownOption[] = [
  { value: 'main_market', label: 'Main market' },
  { value: 'main_road', label: 'Main road' },
  { value: 'interior', label: 'Interior' },
  { value: 'slum', label: 'Slum' },
];

export const propertyTypes: DropdownOption[] = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'open_land', label: 'Open land' },
  { value: 'religious', label: 'Religious' },
  { value: 'mix', label: 'Mix' },
];

export const propertyUses: DropdownOption[] = [
  { value: 'shop', label: 'Shop' },
  { value: 'bank', label: 'Bank' },
  { value: 'trust', label: 'Trust' },
  { value: 'office', label: 'Office' },
];

export const roadTypes: DropdownOption[] = [
  { value: 'kaccha', label: 'Kaccha' },
  { value: 'pakka', label: 'Pakka' },
  { value: 'rcc', label: 'RCC' },
  { value: 'damar', label: 'Damar' },
];

export const taxRateZones: DropdownOption[] = [
  { value: 'below_9m', label: 'Below 9 meter' },
  { value: '9_to_12m', label: '9 to 12 meter' },
  { value: '12_to_24m', label: '12 to 24 meter' },
  { value: 'above_24m', label: '24 meter above' },
];

/** Full label for review / summaries when individual + single/joint applies. */
export function formatOwnershipDisplay(ownershipType: string, individualTenancy: string): string {
  const main = ownershipTypes.find((o) => o.value === ownershipType)?.label ?? ownershipType;
  if (ownershipType === 'individual' && individualTenancy) {
    const sub = individualTenancyTypes.find((o) => o.value === individualTenancy)?.label ?? individualTenancy;
    return `${main} — ${sub}`;
  }
  return main;
}

export const relationships: DropdownOption[] = [
  { value: 'self', label: 'Self' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'son', label: 'Son' },
  { value: 'daughter', label: 'Daughter' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'other', label: 'Other' },
];

export const waterSources: DropdownOption[] = [
  { value: 'municipal', label: 'Municipal supply' },
  { value: 'borewell', label: 'Private borewell' },
  { value: 'tanker', label: 'Tanker supply' },
  { value: 'well', label: 'Open well' },
  { value: 'none', label: 'None' },
];

export const sanitationTypes: DropdownOption[] = [
  { value: 'sewer', label: 'Connected to sewer' },
  { value: 'septic', label: 'Septic tank' },
  { value: 'soak_pit', label: 'Soak pit' },
  { value: 'open', label: 'Open' },
];

export const solidWasteTypes: DropdownOption[] = [
  { value: 'door_to_door', label: 'Door-to-door collection' },
  { value: 'community_bin', label: 'Community bin' },
  { value: 'open_dump', label: 'Open dumping' },
];

export const usageTypes: DropdownOption[] = [
  { value: 'self_resi', label: 'Self residential' },
  { value: 'rent_resi', label: 'Rented residential' },
  { value: 'self_comm', label: 'Self commercial' },
  { value: 'rent_comm', label: 'Rented commercial' },
  { value: 'vacant', label: 'Vacant' },
];

export const constructionTypes: DropdownOption[] = [
  { value: 'rcc', label: 'RCC' },
  { value: 'brick', label: 'Load-bearing brick' },
  { value: 'tin', label: 'Tin shed' },
  { value: 'thatch', label: 'Thatch / mud' },
];

export const floors: DropdownOption[] = [
  { value: 'basement', label: 'Basement' },
  { value: 'ground', label: 'Ground' },
  { value: 'floor_1', label: 'Floor 1' },
  { value: 'floor_2', label: 'Floor 2' },
  { value: 'floor_3', label: 'Floor 3' },
  { value: 'floor_4', label: 'Floor 4' },
  { value: 'floor_5_plus', label: 'Floor 5 and above' },
];
