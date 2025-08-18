"use client";

import * as React from "react";

interface DisclosureContactValues {
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactRole?: string; // NEW: role/job of the contact person
}

type Errors = Partial<Record<keyof DisclosureContactValues, string | undefined>>;

export interface DisclosureContactCardProps {
  value: DisclosureContactValues;
  onChange: (partial: Partial<DisclosureContactValues>) => void;
  errors?: Errors;
}

export function DisclosureContactCard({
  value,
  onChange,
  errors,
}: DisclosureContactCardProps) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/30 backdrop-blur-md shadow-md">
      <div className="px-4 py-4 border-b border-white/20">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">
          Contact Person
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          Provide the main point of contact for your disclosure.
        </p>
      </div>

      <div className="px-4 py-5 space-y-4">
        {/* Name */}
        <div>
          <label className="text-sm font-medium text-gray-800">Name</label>
          <input
            type="text"
            value={value.contactName ?? ""}
            onChange={(e) => onChange({ contactName: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
          />
          {errors?.contactName && (
            <span className="mt-1 block text-xs text-red-600">
              {errors.contactName}
            </span>
          )}
        </div>

        {/* Role / Job Title */}
        <div>
          <label className="text-sm font-medium text-gray-800">
            Role / Job Title
          </label>
          <input
            type="text"
            value={value.contactRole ?? ""}
            onChange={(e) => onChange({ contactRole: e.target.value })}
            placeholder="e.g., Sustainability Manager"
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
          />
          {errors?.contactRole && (
            <span className="mt-1 block text-xs text-red-600">
              {errors.contactRole}
            </span>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="text-sm font-medium text-gray-800">Email</label>
          <input
            type="email"
            value={value.contactEmail ?? ""}
            onChange={(e) => onChange({ contactEmail: e.target.value })}
            className="mt-1 block w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
          />
          {errors?.contactEmail && (
            <span className="mt-1 block text-xs text-red-600">
              {errors.contactEmail}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
