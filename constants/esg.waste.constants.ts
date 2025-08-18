export const WASTE_STREAMS = [
  "Paper & cardboard",
  "Plastics",
  "Metals",
  "Glass",
  "Wood",
  "Textiles",
  "Organics & food",
  "Green waste",
  "Mixed municipal",
  "Construction & demolition",
  "Oils",
  "Solvents",
  "Chemicals",
  "Sludges",
  "E-waste",
  "Batteries",
  "Other (specify)",
] as const;

export const WASTE_HAZARD_CLASSES = ["Non-hazardous", "Hazardous"] as const;

export const WASTE_STATES = ["Solid", "Sludge", "Liquid"] as const;

export const WASTE_ROUTES = [
  "Diverted from disposal",
  "Directed to disposal",
] as const;

export const WASTE_METHODS_DIVERTED = [
  "Reuse",
  "Recycling",
  "Composting",
  "Anaerobic digestion",
  "Energy recovery (with energy)",
  "Remanufacture",
  "Regeneration",
  "Backfilling",
] as const;

export const WASTE_METHODS_DISPOSAL = [
  "Landfill",
  "Incineration (no energy)",
  "Deep well",
  "Surface impoundment",
  "On-site burial",
  "Permanent storage",
  "Other disposal",
] as const;

export const WASTE_DESTINATIONS = ["On-site", "Off-site"] as const;

export const WASTE_UNITS = ["kg", "t", "L"] as const;

export const WASTE_MEASUREMENT_METHODS = [
  "Weighbridge",
  "Supplier ticket",
  "Estimate",
] as const;
