"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

import type { ESGWizardValues } from "@/types/esg-wizard.types";
import { WorkforceProfileCard, WorkforceProfileValue } from "../social/workforce-profile";
import { NonEmployeeWorkersCard, NonEmployeeWorkersValue } from "../social/non-employee-workers-card";
import { MovementCard, MovementValue } from "../social/movement-card";
import { PayCard, PayValue } from "../social/pay-card";
import { CollectiveBargainingCard, CollectiveBargainingValue } from "../social/collective-bargaining-card";
import { TrainingCard, TrainingValue } from "../social/social-training-card";
import { OhsCard, OhsValue } from "../social/ohs-card";
import { HumanRightsCard, HumanRightsValue } from "../social/human-rights-card";
import { CommunityCard, CommunityValue } from "../social/community-card";
/**
 * SocialStep
 * - Normalizes each social sub-object so cards always receive a stable shape.
 * - Provides patchers that merge card changes back into RHF with shouldDirty/shouldTouch.
 * - Renders 4 cards in this order:
 *    1) Workforce & Movement
 *    2) Pay & Collective Bargaining
 *    3) Training & Health & Safety
 *    4) Human Rights & Community
 *
 * NOTE: Real card implementations are provided later; this step uses temporary placeholders
 * so you can integrate the step immediately without breaking the build.
 */
export function SocialStep() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ESGWizardValues>();

  const social = watch("social");

  // -------------------- Normalized values (stable shapes for cards) --------------------
    const workforceProfile: WorkforceProfileValue = useMemo(() => {
    const src = social?.workforceProfile ?? {};
    const rows = Array.isArray(src.headcountByLocation) ? src.headcountByLocation : [];

    return {
        headcountByLocation: rows.map((r) => ({
        country: r?.country ?? "",
        site: r?.site ?? undefined,
        headcount:
            r && "headcount" in (r as any) && r.headcount != null
            ? Number.isFinite(Number(r.headcount)) ? Number(r.headcount) : null
            : null, // ← ensure the key exists, default null
        })),
        contractType: {
        permanent: src.contractType?.permanent ?? null,
        temporary: src.contractType?.temporary ?? null,
        },
        employmentType: {
        fullTime: src.employmentType?.fullTime ?? null,
        partTime: src.employmentType?.partTime ?? null,
        },
        gender: {
        women: src.gender?.women ?? null,
        men: src.gender?.men ?? null,
        undisclosed: src.gender?.undisclosed ?? null,
        },
        ageBands: {
        under30: src.ageBands?.under30 ?? null,
        from30to50: src.ageBands?.from30to50 ?? null,
        over50: src.ageBands?.over50 ?? null,
        },
        fteTotal: src.fteTotal ?? null,
    };
    }, [social?.workforceProfile]);

    type Counts = NonNullable<NonEmployeeWorkersValue["counts"]>;

    const EMPTY_COUNTS: Counts = {
    agency: null,
    apprentices: null,
    contractors: null,
    homeWorkers: null,
    internsVolunteers: null,
    selfEmployed: null,
    };

    const nonEmployeeWorkers = useMemo<NonEmployeeWorkersValue>(() => {
    const src = social?.nonEmployeeWorkers;

    const c = src?.counts ?? EMPTY_COUNTS;
    const counts: Counts = {
        agency: c.agency ?? null,
        apprentices: c.apprentices ?? null,
        contractors: c.contractors ?? null,
        homeWorkers: c.homeWorkers ?? null,
        internsVolunteers: c.internsVolunteers ?? null,
        selfEmployed: c.selfEmployed ?? null,
    };

    return {
        counts,
        hoursWorked: src?.hoursWorked ?? null,
    };
    }, [social?.nonEmployeeWorkers]);

    const normalizeBreakdown = (
        b?: any
        ): MovementValue["newHiresBreakdown"] => {
        if (!b) return undefined;
        return {
            byGender: b.byGender
            ? {
                women: b.byGender.women ?? null,
                men: b.byGender.men ?? null,
                undisclosed: b.byGender.undisclosed ?? null,
                }
            : undefined,
            byAge: b.byAge
            ? {
                under30: b.byAge.under30 ?? null,
                from30to50: b.byAge.from30to50 ?? null,
                over50: b.byAge.over50 ?? null,
                }
            : undefined,
            byRegion: Array.isArray(b.byRegion)
            ? b.byRegion.map((r: any) => ({
                region: r?.region ?? "",
                // ensure the key exists and is number|null (never undefined)
                count: r?.count ?? null,
                }))
            : undefined,
        };
        };

    const movement = useMemo(
    () => ({
        headcountStart: social.movement?.headcountStart ?? null,
        headcountEnd: social.movement?.headcountEnd ?? null,
        newHiresTotal: social.movement?.newHiresTotal ?? null,
        exitsTotal: social.movement?.exitsTotal ?? null,
        newHiresBreakdown: normalizeBreakdown(social.movement?.newHiresBreakdown),
        exitsBreakdown:    normalizeBreakdown(social.movement?.exitsBreakdown),
    }),
    [social?.movement]
    );

    const payValue: PayValue = useMemo(
    () => ({
        meetsMinimumWage: social.pay?.meetsMinimumWage ?? undefined,
        lowestHourlyRate: {
        amount: social.pay?.lowestHourlyRate?.amount ?? null,
        currency: social.pay?.lowestHourlyRate?.currency ?? "",
        },
        salaryByGroupAndLocation:
        social.pay?.salaryByGroupAndLocation?.map((r) => ({
            group: r.group ?? "",
            country: r.country ?? "",
            avgWomen: r.avgWomen ?? null,
            avgMen: r.avgMen ?? null,
        })) ?? [],
    }),
    [social?.pay]
    );

    const collectiveBargaining: CollectiveBargainingValue = useMemo(
    () => ({
        coveredEmployees: social.collectiveBargaining?.coveredEmployees ?? null,
        totalEmployees: social.collectiveBargaining?.totalEmployees ?? null,
    }),
    [social?.collectiveBargaining]
    );

    const headcountEnd = social.movement?.headcountEnd ?? null;
    const genderCounts = social.workforceProfile?.gender ?? undefined;

    const training: TrainingValue = useMemo(
    () => ({
        totalTrainingHours: social.training?.totalTrainingHours ?? null,
        employeesTrained: social.training?.employeesTrained ?? null,
        byGender: {
        women: social.training?.byGender?.women ?? null,
        men: social.training?.byGender?.men ?? null,
        undisclosed: social.training?.byGender?.undisclosed ?? null,
        },
        byGroup: (social.training?.byGroup ?? []).map((r) => ({
        group: r?.group ?? "",
        hours: r?.hours ?? null,
        })),
    }),
    [social?.training]
    );

    // Soft-link hours from the non-employee workers card
    const nonEmpHoursHint = social.nonEmployeeWorkers?.hoursWorked ?? null;

    // Normalize OHS slice
    const ohs: OhsValue = useMemo(
    () => ({
        employees: {
        hoursWorked: social.ohs?.employees?.hoursWorked ?? null,
        recordableInjuries: social.ohs?.employees?.recordableInjuries ?? null,
        highConsequenceInjuries: social.ohs?.employees?.highConsequenceInjuries ?? null,
        fatalities: social.ohs?.employees?.fatalities ?? null,
        },
        nonEmployees: {
        hoursWorked: social.ohs?.nonEmployees?.hoursWorked ?? null,
        recordableInjuries: social.ohs?.nonEmployees?.recordableInjuries ?? null,
        highConsequenceInjuries: social.ohs?.nonEmployees?.highConsequenceInjuries ?? null,
        fatalities: social.ohs?.nonEmployees?.fatalities ?? null,
        },
    }),
    [social?.ohs]
    );


    const humanRights: HumanRightsValue = useMemo(
    () => ({
        policyExists: social.humanRights?.policyExists,                
        policyCovers: {
        childLabour:      social.humanRights?.policyCovers?.childLabour ?? false,
        forcedLabour:     social.humanRights?.policyCovers?.forcedLabour ?? false,
        humanTrafficking: social.humanRights?.policyCovers?.humanTrafficking ?? false,
        discrimination:   social.humanRights?.policyCovers?.discrimination ?? false,
        healthAndSafety:  social.humanRights?.policyCovers?.healthAndSafety ?? false,
        other:            social.humanRights?.policyCovers?.other ?? false,
        otherText:        social.humanRights?.policyCovers?.otherText || undefined, 
        },
        grievanceMechanism: social.humanRights?.grievanceMechanism,    
        incidents: (social.humanRights?.incidents ?? []).map((r) => ({
        topic: r.topic,
        confirmed: r.confirmed,
        description: r.description || undefined,                      
        })),
    }),
    [social?.humanRights]
    );


    const community: CommunityValue = useMemo(
    () => ({
        volunteerHours: social.community?.volunteerHours ?? null,
        cashDonations: social.community?.cashDonations
        ? {
            amount: social.community.cashDonations.amount ?? null,
            currency: social.community.cashDonations.currency ?? "",
            }
        : undefined,
        inKindDonations: social.community?.inKindDonations
        ? {
            amount: social.community.inKindDonations.amount ?? null,
            currency: social.community.inKindDonations.currency ?? "",
            description: social.community.inKindDonations.description ?? "",

            }
        : undefined,
        estimatedBeneficiaries: social.community?.estimatedBeneficiaries ?? null,
        sitesWithAssessment: social.community?.sitesWithAssessment ?? null,
        totalSites: social.community?.totalSites ?? null,
    }),
    [social?.community]
    );

  // -------------------- Patchers (merge & mark as dirty/touched) --------------------
  const patch = <K extends keyof ESGWizardValues["social"]>(
    key: K,
    next: ESGWizardValues["social"][K]
  ) =>
    setValue(
      `social.${key}`,
      next as any,
      { shouldDirty: true, shouldTouch: true }
    );

  const onChangeWorkforceProfile = (p: Partial<WorkforceProfileValue>) => {
    const next: WorkforceProfileValue = { ...workforceProfile, ...p };
    setValue("social.workforceProfile", next as any, {
        shouldDirty: true,
        shouldTouch: true,
    });
    };


  const onChangeNonEmployeeWorkers = (p: Partial<typeof nonEmployeeWorkers>) =>
    patch("nonEmployeeWorkers", { ...nonEmployeeWorkers, ...p });

  const onChangeMovement = (patch: Partial<MovementValue>) => {
    setValue(
        "social.movement",
        { ...(social.movement ?? {}), ...patch },
        { shouldDirty: true, shouldTouch: true }
    );
    };

  const onChangePay = (patch: Partial<PayValue>) => {
    setValue(
        "social.pay",
        { ...(social.pay ?? {}), ...patch },
        { shouldDirty: true, shouldTouch: true }
    );
    };

    const onChangeCollectiveBargaining = (patch: Partial<CollectiveBargainingValue>) => {
    setValue(
        "social.collectiveBargaining",
        { ...(social.collectiveBargaining ?? {}), ...patch },
        { shouldDirty: true, shouldTouch: true }
    );
    };

  
    const onChangeTraining = (patch: Partial<TrainingValue>) => {
    setValue(
        "social.training",
        { ...(social.training ?? {}), ...patch },
        { shouldDirty: true, shouldTouch: true }
    );
    };

    const onChangeOhs = (patch: Partial<OhsValue>) => {
    setValue(
        "social.ohs",
        { ...(social.ohs ?? {}), ...patch },
        { shouldDirty: true, shouldTouch: true }
    );
    };

const onChangeHumanRights = (patch: Partial<HumanRightsValue>) => {
    setValue(
    "social.humanRights",
    { ...(social.humanRights ?? {}), ...patch },
    { shouldDirty: true, shouldTouch: true }
    );
    };

  const onChangeCommunity = (patch: Partial<CommunityValue>) => {
  setValue(
    "social.community",
    { ...(social.community ?? {}), ...patch },
    { shouldDirty: true, shouldTouch: true }
  );
};

  return (
    <div className="space-y-6">
      {/* Step header */}
      <div>
        <h2 className="text-lg font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">
          Social
        </h2>
        <p className="mt-1 text-sm text-gray-700">
          Capture your workforce, pay and bargaining, training & safety, and human rights & community metrics.
        </p>
      </div>

    {/* 1) Workforce & Movement */}
    <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <WorkforceProfileCard
        value={workforceProfile}
        onChange={onChangeWorkforceProfile}
        />
    </div>

    <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <NonEmployeeWorkersCard
        value={nonEmployeeWorkers}
        onChange={onChangeNonEmployeeWorkers} 
        />
    </div>

    <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <MovementCard value={movement} onChange={onChangeMovement} />
    </div>

    {/* 2) Pay & Collective Bargaining */}
    <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <PayCard value={payValue} onChange={onChangePay} />
    </div>

    <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <CollectiveBargainingCard
            value={collectiveBargaining}
            onChange={onChangeCollectiveBargaining}
        />
    </div>


    {/* 3) Training & Health & Safety */}
    <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <TrainingCard
            value={training}
            onChange={onChangeTraining}
            headcountEnd={headcountEnd}
            genderCounts={genderCounts}
        />
    </div>

    <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <OhsCard value={ohs} onChange={onChangeOhs} nonEmployeeHoursHint={nonEmpHoursHint} />
    </div>

    {/* 4) Human Rights & Community */}
    <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <HumanRightsCard value={humanRights} onChange={onChangeHumanRights} />
    </div>

    <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <CommunityCard value={community} onChange={onChangeCommunity} />
    </div>

    </div>
  );
}

