// types/esg-wizard.types.ts
import type { z } from "zod";
import type { FoundationalFormValues } from "@/schemas/foundational.schemas";
import {
  ESGWizardSchema,
  EnvironmentSchema,
  SocialSchema,
  GovernanceSchema,
} from "@/schemas/esg-wizard-schema";

import { WaterFlowsPayload } from "./env-water.types";

export type WizardStep = 1 | 2 | 3 | 4;

// Step shapes inferred from schemas
export type EnvironmentValues = z.infer<typeof EnvironmentSchema>;
export type SocialValues       = z.infer<typeof SocialSchema>;
export type GovernanceValues   = z.infer<typeof GovernanceSchema>;

// General = your existing Foundational shape
export type GeneralValues = FoundationalFormValues;

export type EnvironmentTarget =
  NonNullable<z.infer<typeof EnvironmentSchema>["targets"]>[number];


// Wizard root derived from composed schema
export type ESGWizardValues = z.infer<typeof ESGWizardSchema>;
