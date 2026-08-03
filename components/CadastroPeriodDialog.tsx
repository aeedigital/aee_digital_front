"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { saveCadastroInfo, type CadastroInfo } from "@/app/actions/cadastroInfo";

type CadastroPeriodDialogProps = {
  cadastroInfo: CadastroInfo;
  onSaved: (nextValue: CadastroInfo) => void;
};

function toInputDate(value?: string) {
  if (!value) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split("/");
    return `${year}-${month}-${day}`;
  }

  const isoDate = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(isoDate) ? isoDate : "";
}

function toApiDate(value: string) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

export default function CadastroPeriodDialog({
  cadastroInfo,
  onSaved,
}: CadastroPeriodDialogProps) {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const initialStartDate = useMemo(() => toInputDate(cadastroInfo.start), [cadastroInfo.start]);
  const initialEndDate = useMemo(() => toInputDate(cadastroInfo.end), [cadastroInfo.end]);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setStartDate(initialStartDate);
      setEndDate(initialEndDate);
      setError(null);
    }
  };

  const handleSave = async () => {
    if (!startDate || !endDate) {
      setError("Informe a data inicial e a data final.");
      return;
    }

    if (startDate > endDate) {
      setError("A data inicial não pode ser maior que a data final.");
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      const nextValue = await saveCadastroInfo({
        start: toApiDate(startDate),
        end: toApiDate(endDate),
        formId: cadastroInfo.formId,
        isActive: cadastroInfo.isActive,
      });

      onSaved(nextValue);
      setOpen(false);
    } catch (saveError: any) {
      setError(saveError?.message || "Não foi possível salvar o período.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">Alterar período</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar período do cadastro</DialogTitle>
          <DialogDescription>
            Atualize a janela usada no resumo da Aliança e no cadastro anual.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Data inicial</span>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium text-slate-700">Data final</span>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar período"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
