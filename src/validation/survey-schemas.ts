/**
 * Survey validation schemas.
 *
 * Each wizard step has its own schema for live per-screen validation.
 * `finalSurveySchema` composes them and adds cross-step rules (plinth ≤ plot,
 * sum-of-floors ≤ plinth, GPS accuracy threshold, required photos).
 *
 * Use with `react-hook-form` via `zodResolver(stepNSchema)`.
 */
import { GPS_MAX_ACCURACY_METERS } from '@/src/services/gps/capture-best-fix';
import { z } from 'zod';

/* ────────────────────────── Primitives ────────────────────────── */

const indianMobile = z.string().regex(/^[6-9]\d{9}$/, 'Mobile must be a valid 10-digit Indian number');

const indianPin = z.string().regex(/^\d{6}$/, 'PIN must be exactly 6 digits');

const nonEmpty = (label: string) => z.string().trim().min(1, `${label} is required`);

const requiredDropdown = (label: string) => z.string().min(1, `Please select a ${label}`);

/* ────────────────────────── Step 0 — Context (new survey) ────────────────────────── */

export const contextSchema = z.object({
  assessmentYear: requiredDropdown('assessment year'),
  ulbCode: requiredDropdown('ULB'),
  wardNo: requiredDropdown('ward'),
  propertyNo: z.string().trim().optional().default(''),
});
export type ContextInput = z.infer<typeof contextSchema>;

/* ────────────────────────── Step 1 — Property ────────────────────────── */

export const step1Schema = z.object({
  eNagarpalikaId: z.string().trim().max(80).optional().default(''),
  parcelNo: z.string().trim().max(80).optional().default(''),
  propertyNo: nonEmpty('Property number').max(40, 'Property number is too long'),
  sectorNumber: z.string().trim().max(40).optional().default(''),
  constructedYear: z.union([z.literal(''), z.string().regex(/^(19|20)\d{2}$/, 'Enter a valid 4-digit year')]),
  ulbCode: requiredDropdown('ULB'),
  wardNo: requiredDropdown('ward'),
});
export type Step1Input = z.infer<typeof step1Schema>;

/* ────────────────────────── Step 2 — Owner ────────────────────────── */

export const step2Schema = z
  .object({
    ownerName: nonEmpty('Owner name').max(120),
    respondentName: nonEmpty('Name of respondent').max(120),
    relationship: requiredDropdown('relationship'),
    mobileNo: indianMobile,
    family: z.number().int().min(1, 'Enter number of family members').max(50),
    fatherOrHusbandName: nonEmpty('Father / husband name').max(120),
    alternateMobileNo: z.string().trim().max(10).optional().default(''),
  })
  .superRefine((data, ctx) => {
    const alt = data.alternateMobileNo?.replace(/\D/g, '') ?? '';
    if (!alt) return;
    if (!/^[6-9]\d{9}$/.test(alt)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['alternateMobileNo'],
        message: 'Alternate mobile must be a valid 10-digit Indian number',
      });
    }
    if (alt === data.mobileNo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['alternateMobileNo'],
        message: 'Alternate mobile must differ from primary mobile',
      });
    }
  });
export type Step2Input = z.infer<typeof step2Schema>;

/* ────────────────────────── Step 3 — Address ────────────────────────── */

export const step3Schema = z.object({
  houseNo: nonEmpty('House number').max(40),
  streetName: nonEmpty('Street name').max(120),
  locality: z.string().trim().max(120).optional().default(''),
  colony: z.string().trim().max(120).optional().default(''),
  city: nonEmpty('City').max(80),
  pinCode: indianPin,
});
export type Step3Input = z.infer<typeof step3Schema>;

/* ────────────────────────── Step 4 — Taxation ────────────────────────── */

export const step4Schema = z
  .object({
    ownershipType: requiredDropdown('ownership type'),
    individualTenancy: z.string().optional().default(''),
    propertyType: requiredDropdown('property type'),
    propertyUse: requiredDropdown('property use'),
    situation: requiredDropdown('situation'),
    roadType: requiredDropdown('road type'),
    taxRateZone: requiredDropdown('tax rate zone'),
  })
  .superRefine((data, ctx) => {
    if (data.ownershipType === 'individual' && !String(data.individualTenancy ?? '').trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['individualTenancy'],
        message: 'Select single or joint for individual ownership',
      });
    }
  });
export type Step4Input = z.infer<typeof step4Schema>;

/* ────────────────────────── Step 5 — Area + floors ────────────────────────── */

export const floorSchema = z.object({
  id: z.string().optional(),
  floorName: requiredDropdown('floor'),
  usageType: requiredDropdown('usage type'),
  constructionType: requiredDropdown('construction type'),
  isOccupied: z.boolean(),
  areaSqft: z
    .number({ error: 'Floor area must be a number' })
    .positive('Floor area must be greater than zero')
    .max(100_000, 'Floor area seems unrealistic'),
});
export type FloorInput = z.infer<typeof floorSchema>;

export const step5Schema = z
  .object({
    plotSqft: z
      .number({ error: 'Plot area must be a number' })
      .positive('Plot area must be greater than zero')
      .max(1_000_000),
    plinthSqft: z
      .number({ error: 'Plinth area must be a number' })
      .positive('Plinth area must be greater than zero')
      .max(1_000_000),
    floors: z.array(floorSchema).min(1, 'Add at least one floor'),
  })
  .superRefine((data, ctx) => {
    if (data.plinthSqft > data.plotSqft) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['plinthSqft'],
        message: 'Plinth area cannot exceed plot area',
      });
    }
    const sum = data.floors.reduce((acc, f) => acc + f.areaSqft, 0);
    if (sum > data.plinthSqft * data.floors.length + 0.5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['floors'],
        message: 'Total floor area is inconsistent with plinth area',
      });
    }
  });
export type Step5Input = z.infer<typeof step5Schema>;

/* ────────────────────────── Step 6 — Services ────────────────────────── */

export const step6Schema = z.object({
  waterSource: requiredDropdown('water source'),
  sanitationType: requiredDropdown('sanitation type'),
  solidWasteType: requiredDropdown('solid waste type'),
  electricityNo: z
    .string()
    .trim()
    .max(30)
    .optional()
    .default('')
    .refine((v) => !v || /^[A-Z0-9-]{4,30}$/i.test(v), {
      message: 'Electricity number looks invalid',
    }),
});
export type Step6Input = z.infer<typeof step6Schema>;

/* ────────────────────────── Step 7 — GIS ────────────────────────── */

export const step7Schema = z.object({
  gps: z
    .object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      accuracyMeters: z.number().nonnegative(),
      capturedAt: z.string(),
    })
    .refine((g) => g.accuracyMeters > 0 && Number.isFinite(g.accuracyMeters), {
      message: 'GPS did not return a valid accuracy radius. Recapture outdoors with a clear sky view.',
      path: ['accuracyMeters'],
    })
    .refine((g) => g.accuracyMeters <= GPS_MAX_ACCURACY_METERS, {
      message: `Horizontal accuracy must be ±${GPS_MAX_ACCURACY_METERS} m or better (stand beside the property, open sky, wait for the fix).`,
      path: ['accuracyMeters'],
    }),
});
export type Step7Input = z.infer<typeof step7Schema>;

/* ────────────────────────── Step 8 — Photos ────────────────────────── */

export const photoSchema = z.object({
  id: z.string(),
  slot: z.enum(['front', 'side']),
  localUri: z.string().url().or(z.string().startsWith('file:')),
  sizeKb: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
});

export const step8Schema = z
  .object({
    photos: z.array(photoSchema),
  })
  .refine((data) => data.photos.some((p) => p.slot === 'front'), {
    message: 'Front photo is required',
    path: ['photos'],
  });
export type Step8Input = z.infer<typeof step8Schema>;

/* ────────────────────────── Composite ────────────────────────── */

export const finalSurveySchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(z.object({ plotSqft: z.number().positive(), plinthSqft: z.number().positive() }))
  .merge(step6Schema)
  .merge(step7Schema)
  .extend({
    floors: z.array(floorSchema).min(1),
    photos: z.array(photoSchema),
    isSlum: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (!data.photos.some((p) => p.slot === 'front')) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['photos'], message: 'Front photo is required' });
    }
  });
export type FinalSurveyInput = z.infer<typeof finalSurveySchema>;

/* ────────────────────────── Mapper for step index → schema ────────────────────────── */

export const stepSchemas = {
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
  4: step4Schema,
  5: step5Schema,
  6: step6Schema,
  7: step7Schema,
  8: step8Schema,
} as const;

export type StepNumber = keyof typeof stepSchemas;
