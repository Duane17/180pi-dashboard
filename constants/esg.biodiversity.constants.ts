// constants/esg.biodiversity.constants.ts
export const BIODIV_HABITATS = ["Forest","Grassland","Wetland","Freshwater","Marine–coastal","Agricultural mosaic","Urban–brownfield","Other"] as const;
export const BIODIV_ACTIVITIES = ["New construction","Expansion","Quarrying","Water abstraction","Effluent discharge","Traffic/noise/light","Vegetation clearance","Other"] as const;
export const BIODIV_RECEPTORS = ["Habitat","Species","Ecosystem service"] as const;
export const BIODIV_PROXIMITIES = ["Inside","≤1 km","1–5 km",">5 km"] as const;
export const ONE_TO_FIVE = [1,2,3,4,5] as const;