// src/components/upload/operating-countries-card.tsx
"use client";

import * as React from "react";
import {
  buildCountryMaps,
  normalizeCodes,
  filterCountries,
} from "@/lib/country-mapping";

export interface OperatingCountriesValue {
  /** Store ISO-3166-1 alpha-2 codes (UPPER-2), e.g., ['MW','ZA'] */
  countries?: string[];
}

type Errors = Partial<Record<keyof OperatingCountriesValue, string | undefined>>;

export interface OperatingCountriesCardProps {
  value: OperatingCountriesValue;
  onChange: (partial: Partial<OperatingCountriesValue>) => void;
  errors?: Errors;
  /** Optional: limit selection size (defaults to unlimited) */
  maxCountries?: number;
}

export function OperatingCountriesCard({
  value,
  onChange,
  errors,
  maxCountries,
}: OperatingCountriesCardProps) {
  const selected = React.useMemo(
    () => normalizeCodes(value.countries ?? []),
    [value.countries]
  );

  const [query, setQuery] = React.useState("");
  const [openList, setOpenList] = React.useState(false);

  // Build maps once
  const { codeToLabel } = React.useMemo(() => buildCountryMaps(), []);

  // Derive filtered options excluding already-selected codes
  const filtered = React.useMemo(() => {
    const f = filterCountries(query);
    const sel = new Set(selected);
    return f.filter((c) => !sel.has(c.value));
  }, [query, selected]);

  const canAddMore =
    typeof maxCountries !== "number" || selected.length < maxCountries;

  /** Add a country (by ISO2 code) */
  const addCountry = (iso2: string) => {
    if (!canAddMore) return;
    const next = normalizeCodes([...selected, iso2]);
    onChange({ countries: next });
    setQuery("");
  };

  /** Remove a country (by ISO2 code) */
  const removeCountry = (iso2: string) => {
    const next = selected.filter((c) => c !== iso2);
    onChange({ countries: next });
  };

  /** Keyboard: Enter selects the first filtered option */
  const onQueryKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter" && filtered.length > 0 && canAddMore) {
      e.preventDefault();
      addCountry(filtered[0].value);
    }
  };

  /** Gradient button click: add top match if present, otherwise open list */
  const handleAddClick = () => {
    if (!canAddMore) return;
    if (filtered.length > 0) {
      addCountry(filtered[0].value);
    } else {
      // No match – just open the list to nudge selection
      setOpenList(true);
    }
  };

  return (
    <div className="rounded-xl border border-white/20 bg-white/30 backdrop-blur-md shadow-md">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/20">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">
          Countries of Operations
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          Add all countries where your company operates.
        </p>
      </div>

      {/* Body */}
      <div className="px-4 py-5 space-y-5">
        {/* Search + Gradient Add */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-sm text-gray-700">Search</label>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpenList(true);
              }}
              onKeyDown={onQueryKeyDown}
              onFocus={() => setOpenList(true)}
              onBlur={() => setTimeout(() => setOpenList(false), 150)}
              placeholder="Type to search (e.g., Malawi or MW)"
              className="w-full rounded-lg border border-gray-300/70 bg-white/70 p-2 outline-none ring-0 focus:border-gray-400 focus:outline-none"
              disabled={!canAddMore}
            />
          </div>
        </div>

        {/* Dropdown (like your energy rows list; simple, clean) */}
        {openList && filtered.length > 0 && (
          <div className="relative">
            <div className="absolute z-10 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
              <ul className="divide-y divide-gray-100">
                {filtered.slice(0, 50).map((opt) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => addCountry(opt.value)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50 focus:outline-none"
                      disabled={!canAddMore}
                    >
                      <span className="truncate">{opt.label}</span>
                      <span className="ml-3 shrink-0 rounded-md border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-xs tracking-wider">
                        {opt.value}
                      </span>
                    </button>
                  </li>
                ))}
                {filtered.length > 50 && (
                  <li className="px-3 py-2 text-xs text-gray-500">
                    Showing first 50 results…
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* Selected rows (visual parity with your resource rows) */}
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h4 className="font-medium text-gray-900">Selected countries</h4>
              <p className="text-sm text-gray-600">
                Click “Remove” to delete a country from your list.
              </p>
            </div>
          </div>

          {selected.length === 0 ? (
            <p className="text-sm text-gray-600">No countries selected yet.</p>
          ) : (
            <div className="space-y-3">
              {selected.map((code) => (
                <div
                  key={code}
                  className="rounded-xl border border-gray-200/70 bg-white/60 p-4 backdrop-blur-sm"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {/* Country label (readable) */}
                    <div className="sm:col-span-2">
                      <label className="mb-1 block text-sm text-gray-700">
                        Country
                      </label>
                      <div className="w-full rounded-lg border border-gray-300/70 bg-white/70 p-2 text-gray-900">
                        {codeToLabel.get(code) ?? code}
                      </div>
                    </div>

                    {/* ISO code (readonly) */}
                    <div>
                      <label className="mb-1 block text-sm text-gray-700">
                        ISO-2
                      </label>
                      <div className="w-full rounded-lg border border-gray-300/70 bg-white/70 p-2 text-gray-900">
                        {code}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeCountry(code)}
                      className="rounded-lg border border-gray-300/70 bg-white/60 px-3 py-1.5 text-sm text-gray-800 shadow-sm backdrop-blur-sm transition hover:bg-white/80"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {errors?.countries && (
            <span className="mt-1 block text-xs text-red-600">
              {errors.countries}
            </span>
          )}
        </div>

        {/* Helper note */}
        <p className="text-xs text-gray-600">
          Tip: Press{" "}
          <kbd className="rounded border border-gray-300 bg-gray-50 px-1">Enter</kbd>{" "}
          to add the top suggestion.
        </p>

        {!canAddMore && (
          <p className="text-xs text-gray-600">
            You’ve reached the maximum of {maxCountries} countries.
          </p>
        )}
      </div>
    </div>
  );
}
