"use client";

import { useState } from "react";
import type { Package } from "@/types";
import { formatRupiah, cn } from "@/lib/utils";
import { Zap, ClipboardList, Pencil, Trash2 } from "lucide-react";

interface PackageCardProps {
  pkg: Package;
  onEdit: (pkg: Package) => void;
  onDelete: (id: string) => void;
}

export default function PackageCard({
  pkg,
  onEdit,
  onDelete,
}: PackageCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className={cn(
        "card group relative overflow-hidden transition-all",
        "hover:shadow-[var(--shadow-md)]",
        pkg.jalur === "fast_track" &&
          "border-[rgba(253,203,110,0.25)] hover:border-[rgba(253,203,110,0.5)]",
        pkg.jalur === "normal" &&
          "border-[rgba(116,185,255,0.25)] hover:border-[rgba(116,185,255,0.5)]"
      )}
    >
      {/* Jalur accent strip */}
      <div
        className={cn(
          "absolute top-0 left-0 w-full h-[3px]",
          pkg.jalur === "fast_track"
            ? "bg-gradient-to-r from-[var(--qb-fast-track)] to-[var(--qb-fast-track-dark)]"
            : "bg-gradient-to-r from-[var(--qb-normal)] to-[var(--qb-normal-dark)]"
        )}
      />

      <div className="flex items-start justify-between gap-4">
        {/* Left: info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-base truncate">{pkg.name}</h3>
            {pkg.isBundle && (
              <span className="badge badge-success text-[0.625rem]">
                BUNDLE
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span
              className={cn(
                "badge",
                pkg.jalur === "fast_track"
                  ? "badge-fast-track"
                  : "badge-normal"
              )}
            >
              {pkg.jalur === "fast_track" ? <><Zap className="w-3 h-3 inline mr-1" /> Fast Track</> : <><ClipboardList className="w-3 h-3 inline mr-1" /> Normal</>}
            </span>
          </div>

          <div className="flex items-baseline gap-4 text-sm">
            <div>
              <span className="text-[var(--text-muted)]">Harga: </span>
              <span className="font-semibold text-[var(--text-primary)]">
                {formatRupiah(pkg.nominal)}
              </span>
            </div>
            <div>
              <span className="text-[var(--text-muted)]">Game: </span>
              <span className="font-semibold text-[var(--text-primary)]">
                {pkg.gameCount}×
              </span>
            </div>
            {pkg.gameCount > 1 && (
              <div>
                <span className="text-[var(--text-muted)]">Per game: </span>
                <span className="text-[var(--text-secondary)]">
                  {formatRupiah(Math.round(pkg.nominal / pkg.gameCount))}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(pkg)}
            className="btn btn-ghost btn-sm"
            title="Edit paket"
          >
            <Pencil className="w-4 h-4 text-[var(--text-secondary)]" />
          </button>

          {confirmDelete ? (
            <div className="flex items-center gap-1 animate-fade-in">
              <button
                onClick={() => {
                  onDelete(pkg.id);
                  setConfirmDelete(false);
                }}
                className="btn btn-danger btn-sm text-xs"
              >
                Hapus
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="btn btn-ghost btn-sm text-xs"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="btn btn-ghost btn-sm"
              title="Hapus paket"
            >
              <Trash2 className="w-4 h-4 text-[var(--qb-danger)]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
