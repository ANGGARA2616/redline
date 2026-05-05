"use client";

import { useState, useCallback, type FormEvent } from "react";
import type { Package, QueueEntry, Jalur } from "@/types";
import { autoDetectPackage, describeDetectResult } from "@/lib/autoDetect";
import { formatRupiah } from "@/lib/utils";
import NominalAnomalyDialog from "./NominalAnomalyDialog";
import DuplicateMLDialog from "./DuplicateMLDialog";

interface InputOrderFormProps {
  packages: Package[];
  allEntries: QueueEntry[];
  onSubmitOrder: (data: {
    mlId: string;
    jalur: Jalur;
    totalGames: number;
    nominalDonasi: number;
    approvalType: "auto" | "manual";
  }) => Promise<void>;
  onAddGames: (entryId: string, extraGames: number, extraNominal: number) => Promise<void>;
  onUpgrade: (entryId: string) => Promise<void>;
  onRecalculate: (entryId: string, jalur: Jalur, gameCount: number, totalNominal: number) => Promise<void>;
}

export default function InputOrderForm({
  packages,
  allEntries,
  onSubmitOrder,
  onAddGames,
  onUpgrade,
  onRecalculate,
}: InputOrderFormProps) {
  const [nominal, setNominal] = useState("");
  const [mlId, setMlId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [anomalyData, setAnomalyData] = useState<{ nominal: number; mlId: string } | null>(null);
  const [duplicateData, setDuplicateData] = useState<{
    mlId: string;
    existingEntry: QueueEntry;
    jalur: Jalur;
    gameCount: number;
    nominal: number;
    approvalType: "auto" | "manual";
  } | null>(null);

  const resetForm = useCallback(() => {
    setNominal("");
    setMlId("");
    setError("");
  }, []);

  const doSubmit = useCallback(
    async (mlIdVal: string, jalur: Jalur, gameCount: number, nominalVal: number, approvalType: "auto" | "manual") => {
      setLoading(true);
      try {
        await onSubmitOrder({ mlId: mlIdVal, jalur, totalGames: gameCount, nominalDonasi: nominalVal, approvalType });
        resetForm();
      } catch { setError("Gagal menambah order."); }
      finally { setLoading(false); }
    },
    [onSubmitOrder, resetForm]
  );

  const checkDuplicateAndSubmit = useCallback(
    (mlIdVal: string, jalur: Jalur, gameCount: number, nominalVal: number, approvalType: "auto" | "manual") => {
      const existing = allEntries.find(
        (e) => e.mlId === mlIdVal && (e.status === "waiting" || e.status === "playing")
      );
      if (existing) {
        setDuplicateData({ mlId: mlIdVal, existingEntry: existing, jalur, gameCount, nominal: nominalVal, approvalType });
        return;
      }
      doSubmit(mlIdVal, jalur, gameCount, nominalVal, approvalType);
    },
    [allEntries, doSubmit]
  );

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const parsedNominal = parseInt(nominal, 10);
    const trimmedMlId = mlId.trim();
    if (!parsedNominal || parsedNominal <= 0) { setError("Nominal harus lebih dari 0."); return; }
    if (!trimmedMlId) { setError("ML ID wajib diisi."); return; }
    const result = autoDetectPackage(parsedNominal, packages);
    if (!result.matched) { setAnomalyData({ nominal: parsedNominal, mlId: trimmedMlId }); return; }
    checkDuplicateAndSubmit(trimmedMlId, result.jalur, result.gameCount, parsedNominal, "auto");
  }

  const previewResult = nominal && parseInt(nominal) > 0
    ? autoDetectPackage(parseInt(nominal), packages)
    : null;

  return (
    <>
      <div className="card">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">+ Input Order</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label htmlFor="order-nominal" className="label">Nominal Donasi (Rp)</label>
            <input id="order-nominal" type="number" className="input" placeholder="25000" min="1" value={nominal} onChange={(e) => setNominal(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="order-mlid" className="label">ML ID</label>
            <input id="order-mlid" type="text" className="input font-mono" placeholder="166047234" value={mlId} onChange={(e) => setMlId(e.target.value)} required />
          </div>
          {previewResult && (
            <div className={`text-xs px-3 py-2 rounded-[var(--radius-sm)] ${previewResult.matched ? "bg-[rgba(0,184,148,0.1)] text-[var(--qb-success)]" : "bg-[rgba(253,203,110,0.1)] text-[var(--qb-warning)]"}`}>
              {previewResult.matched ? `✓ ${describeDetectResult(previewResult)}` : `⚠ ${formatRupiah(parseInt(nominal))} — tidak cocok paket manapun`}
            </div>
          )}
          {error && <p className="text-xs text-[var(--qb-danger)]">{error}</p>}
          <button type="submit" className="btn btn-primary w-full" disabled={loading}>
            {loading ? "Menambahkan..." : "Tambah ke Antrian"}
          </button>
        </form>
      </div>

      {anomalyData && (
        <NominalAnomalyDialog
          nominal={anomalyData.nominal} mlId={anomalyData.mlId} packages={packages}
          onConfirm={(jalur, gameCount) => {
            setAnomalyData(null);
            checkDuplicateAndSubmit(anomalyData.mlId, jalur, gameCount, anomalyData.nominal, "manual");
          }}
          onCancel={() => setAnomalyData(null)}
        />
      )}

      {duplicateData && (
        <DuplicateMLDialog
          mlId={duplicateData.mlId}
          existingEntry={duplicateData.existingEntry}
          newNominal={duplicateData.nominal}
          newGameCount={duplicateData.gameCount}
          newJalur={duplicateData.jalur}
          packages={packages}
          onAddGames={async () => {
            setLoading(true);
            await onAddGames(duplicateData.existingEntry.id, duplicateData.gameCount, duplicateData.nominal);
            setDuplicateData(null); resetForm(); setLoading(false);
          }}
          onUpgrade={async () => {
            setLoading(true);
            await onUpgrade(duplicateData.existingEntry.id);
            setDuplicateData(null); resetForm(); setLoading(false);
          }}
          onRecalculate={async (jalur, gameCount, totalNominal) => {
            setLoading(true);
            await onRecalculate(duplicateData.existingEntry.id, jalur, gameCount, totalNominal);
            setDuplicateData(null); resetForm(); setLoading(false);
          }}
          onCreateNew={async () => {
            setDuplicateData(null);
            await doSubmit(duplicateData.mlId, duplicateData.jalur, duplicateData.gameCount, duplicateData.nominal, duplicateData.approvalType);
          }}
          onCancel={() => setDuplicateData(null)}
        />
      )}
    </>
  );
}
