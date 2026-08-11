import { apiFetch } from "@/lib/api";

type CadastroInfoApiResponse = {
  _id?: string;
  START_DATE?: string;
  END_DATE?: string;
  FORM_ID?: string;
  CYCLE_ID?: string;
  IS_ACTIVE?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CadastroInfo = {
  start: string;
  end: string;
  formId: string;
  isActive: boolean;
  cycleId?: string;
};

const FALLBACK_CADASTRO_INFO: CadastroInfo = {
  start: "19/01/2026",
  end: "27/02/2026",
  formId: "67b9d55d3a94b5f26c3380d5",
  isActive: true,
};

function hasRequiredFields(
  payload: CadastroInfoApiResponse | null
): payload is Required<Pick<CadastroInfoApiResponse, "START_DATE" | "END_DATE" | "FORM_ID">> &
  CadastroInfoApiResponse {
  return Boolean(payload?.START_DATE && payload?.END_DATE && payload?.FORM_ID);
}

export async function getCadastroInfo(): Promise<CadastroInfo> {
  try {
    const response = await apiFetch("/cadastro-info/active", { cache: "no-store" });

    if (!response.ok) {
      return FALLBACK_CADASTRO_INFO;
    }

    const payload = (await response.json()) as CadastroInfoApiResponse | null;
    if (!hasRequiredFields(payload)) {
      return FALLBACK_CADASTRO_INFO;
    }

    return {
      start: payload.START_DATE,
      end: payload.END_DATE,
      formId: payload.FORM_ID,
      isActive: Boolean(payload.IS_ACTIVE),
      cycleId: payload.CYCLE_ID,
    };
  } catch {
    return FALLBACK_CADASTRO_INFO;
  }
}

export async function saveCadastroInfo(payload: CadastroInfo): Promise<CadastroInfo> {
  const response = await apiFetch("/cadastro-info", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      START_DATE: payload.start,
      END_DATE: payload.end,
      FORM_ID: payload.formId,
      IS_ACTIVE: payload.isActive,
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao salvar período (${response.status})`);
  }

  const saved = (await response.json()) as CadastroInfoApiResponse | null;
  if (!hasRequiredFields(saved)) {
    return payload;
  }

  return {
    start: saved.START_DATE,
    end: saved.END_DATE,
    formId: saved.FORM_ID,
    isActive: Boolean(saved.IS_ACTIVE),
    cycleId: saved.CYCLE_ID,
  };
}
