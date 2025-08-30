// src/types/environment.waste.types.ts
import {
  WASTE_STREAMS,
  WASTE_HAZARD_CLASSES,
  WASTE_STATES,
  WASTE_ROUTES,
  WASTE_METHODS_DIVERTED,
  WASTE_METHODS_DISPOSAL,
  WASTE_DESTINATIONS,
  WASTE_UNITS,
  WASTE_MEASUREMENT_METHODS,
} from "@/constants/esg.waste.constants";

export type WasteRowUI = {
  stream: (typeof WASTE_STREAMS)[number];
  hazardClass: (typeof WASTE_HAZARD_CLASSES)[number];
  physicalState: (typeof WASTE_STATES)[number];
  managementRoute: (typeof WASTE_ROUTES)[number];
  managementMethod:
    | (typeof WASTE_METHODS_DIVERTED)[number]
    | (typeof WASTE_METHODS_DISPOSAL)[number];
  destination: (typeof WASTE_DESTINATIONS)[number];
  quantity?: number | string;          // server will coerce
  unit?: (typeof WASTE_UNITS)[number]; // "kg" | "t" | "L"
  measurementMethod: (typeof WASTE_MEASUREMENT_METHODS)[number];
  otherStreamText?: string;
};

// If you still have an older DB-coded type somewhere, you can keep this union
export type WasteRowInput =
  | WasteRowUI
  | {
      stream: string;
      hazardClass: string;
      physicalState: string;
      managementRoute: string;
      managementMethod: string;
      destination: string;
      quantity?: number | string;
      unit?: string;
      measurementMethod: string;
      otherStreamText?: string | null;
    };
