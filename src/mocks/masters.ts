import type { Ulb, Ward, DropdownOption } from '@/src/types';

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

export const ownershipTypes: DropdownOption[] = [
  { value: 'individual', label: 'Individual (single/joint)' },
  { value: 'limited_company', label: 'Limited company' },
  { value: 'firm_trust', label: 'Firm / trust / society' },
  { value: 'state_govt', label: 'State government' },
  { value: 'central_govt', label: 'Central government' },
  { value: 'local_body', label: 'Local body' },
  { value: 'religious', label: 'Religious institution' },
  { value: 'other', label: 'Other' },
];

export const situations: DropdownOption[] = [
  { value: 'main_road', label: 'On main road' },
  { value: 'off_main', label: 'Off main road' },
  { value: 'lane', label: 'In a lane' },
  { value: 'cul_de_sac', label: 'Cul-de-sac / dead end' },
];

export const propertyTypes: DropdownOption[] = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'mixed', label: 'Mixed use' },
  { value: 'open_land', label: 'Open land' },
  { value: 'religious', label: 'Religious' },
];

export const propertyUses: DropdownOption[] = [
  { value: 'self', label: 'Self occupied' },
  { value: 'rented', label: 'Rented' },
  { value: 'vacant', label: 'Vacant' },
  { value: 'partial_rent', label: 'Partially rented' },
];

export const roadTypes: DropdownOption[] = [
  { value: 'kachha', label: 'Kachha (< 4 m)' },
  { value: 'pakka_narrow', label: 'Pakka narrow (4–8 m)' },
  { value: 'pakka_wide', label: 'Pakka wide (8+ m)' },
  { value: 'highway', label: 'Highway' },
];

export const taxRateZones: DropdownOption[] = [
  { value: 'A', label: 'Zone A — premium' },
  { value: 'B', label: 'Zone B — commercial' },
  { value: 'C', label: 'Zone C — mixed' },
  { value: 'D', label: 'Zone D — outer' },
];

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
