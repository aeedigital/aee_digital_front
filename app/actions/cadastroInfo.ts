import { apiFetch } from "@/lib/api";

type CadastroInfoApiResponse = {
  _id?: string;
  START_DATE?: string;
  END_DATE?: string;
  FORM_ID?: string;
  IS_ACTIVE?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type CadastroInfo = {
  start: string;
  end: string;
  formId: string;
  isActive: boolean;
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
    };
  } catch {
    return FALLBACK_CADASTRO_INFO;
  }
}
