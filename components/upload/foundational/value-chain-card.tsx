// components/upload/value-chain-card.tsx
"use client";

import * as React from "react";
import type { ValueChainValues } from "@/schemas/foundational.schemas";
import { VALUE_CHAIN_SCOPES } from "@/constants/foundational.constants";

type Errors = Partial<Record<keyof ValueChainValues, string | undefined>>;

// Derive the literal union type from your options array (e.g., "CORE_OPERATIONS" | "UPSTREAM" | ...)
type Scope = typeof VALUE_CHAIN_SCOPES[number]["value"];

export interface ValueChainCardProps {
  value: ValueChainValues;
  onChange: (partial: Partial<ValueChainValues>) => void;
  errors?: Errors;
}

/**
 * ValueChainCard
 *  - valueChainScopes[] (multi-select)
 *  - businessRelations[] (tag input)
 */
export function ValueChainCard({ value, onChange, errors }: ValueChainCardProps) {
  // Make the type explicit so it's not widened to string[]
  const scopes: Scope[] = value.valueChainScopes ?? [];
  const relations = value.businessRelations ?? [];
  const [tagDraft, setTagDraft] = React.useState("");

  const toggleScope = (val: Scope) => {
    const next: Scope[] = scopes.includes(val)
      ? scopes.filter((s) => s !== val)
      : [...scopes, val];
    onChange({ valueChainScopes: next });
  };

  const handleTagAdd = () => {
    const trimmed = tagDraft.trim();
    if (!trimmed) return;
    if (relations.includes(trimmed)) {
      setTagDraft("");
      return;
    }
    onChange({ businessRelations: [...relations, trimmed] });
    setTagDraft("");
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleTagAdd();
    }
  };

  const removeTag = (idx: number) => {
    const next = relations.filter((_, i) => i !== idx);
    onChange({ businessRelations: next });
  };

  return (
    <div className="rounded-xl border border-white/20 bg-white/30 backdrop-blur-md shadow-md">
      <div className="px-4 py-4 border-b border-white/20">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">Value Chain</h3>
        <p className="mt-1 text-sm text-gray-700">
          Indicate where your disclosures apply and key business relationships.
        </p>
      </div>

      <div className="px-4 py-5 space-y-6">
        {/* Scopes */}
        <div>
          <label className="text-sm font-medium text-gray-800">
            Scope coverage (select all that apply)
          </label>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VALUE_CHAIN_SCOPES.map((opt) => (
              <label key={opt.value} className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 focus:ring-[#3270a1]"
                  checked={scopes.includes(opt.value as Scope)}
                  onChange={() => toggleScope(opt.value as Scope)}
                />
                <span className="text-sm text-gray-800">{opt.label}</span>
              </label>
            ))}
          </div>
          {errors?.valueChainScopes && (
            <span className="mt-1 block text-xs text-red-600">{errors.valueChainScopes}</span>
          )}
        </div>

        {/* Business relations (tags) */}
        <div>
          <label className="text-sm font-medium text-gray-800">
            Significant business relations (tags)
          </label>
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="Type a relation and press Enter"
              className="flex-1 rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
            />
            <button
              type="button"
              onClick={handleTagAdd}
              className="px-3 py-2 bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              Add
            </button>
          </div>

          {/* Chips */}
          {relations.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {relations.map((tag, idx) => (
                <span
                  key={`${tag}-${idx}`}
                  className="inline-flex items-center gap-2 rounded-full bg-white/60 backdrop-blur border border-white/30 px-3 py-1 text-sm text-gray-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(idx)}
                    className="text-gray-600 hover:text-gray-900"
                    aria-label={`Remove ${tag}`}
                    title="Remove"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
          {errors?.businessRelations && (
            <span className="mt-1 block text-xs text-red-600">{errors.businessRelations}</span>
          )}
        </div>
      </div>
    </div>
  );
}
