import { PolicyEntry } from "../ethics-compliance-card";
import { TextField } from "../../env/ui";

type PolicyRowProps = {
  label: string;
  row: PolicyEntry;
  onPatch: (patch: Partial<PolicyEntry>) => void;
  readOnly?: boolean;
};

export function PolicyRow({ label, row, onPatch, readOnly }: PolicyRowProps) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
      <label className="inline-flex items-center gap-2 text-sm text-gray-800">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={!!row.exists}
          onChange={(e) => onPatch({ exists: e.target.checked })}
          disabled={readOnly}
        />
        {label}
      </label>

      <div>
        <label className="block text-sm text-gray-800 mb-1">Date</label>
        <input
          type="date"
          className="block w-full rounded-lg border border-gray-300/70 bg-white/70 px-3 py-2 text-sm text-gray-800 shadow-sm backdrop-blur focus:outline-none disabled:opacity-60"
          value={row.date ?? ""}
          onChange={(e) => onPatch({ date: e.target.value ?? "" })}
          disabled={readOnly}
        />
      </div>

      <div className="sm:col-span-2">
        {/* If your TextField is fine, keep it; otherwise use a native input */}
        <TextField
          label="URL (optional)"
          value={row.url ?? ""}
          onChange={(v) => onPatch({ url: v ?? "" })}
          placeholder="https://…"
        />
        {/* Native input option:
        <label className="block text-sm text-gray-800 mb-1">URL (optional)</label>
        <input
          type="url"
          className="block w-full rounded-lg border border-gray-300/70 bg-white/70 px-3 py-2 text-sm text-gray-800 shadow-sm backdrop-blur focus:outline-none disabled:opacity-60"
          value={row.url ?? ""}
          onChange={(e) => onPatch({ url: e.target.value ?? "" })}
          placeholder="https://…"
          disabled={readOnly}
        />
        */}
      </div>
    </div>
  );
}
