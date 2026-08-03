import { Summary } from "@/interfaces/form.interface";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

const getObjectIdTimestamp = (id?: string): number | null => {
  if (!id || id.length < 8) return null;

  const prefix = id.substring(0, 8);
  if (!/^[0-9a-fA-F]{8}$/.test(prefix)) return null;

  const seconds = Number.parseInt(prefix, 16);
  if (Number.isNaN(seconds)) return null;

  return seconds * 1000;
};

const toDateKey = (value?: string): string | null => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().split("T")[0];
};

export const normalizeSummaries = (input: unknown): Summary[] => {
  const toSummary = (item: unknown): Summary | null => {
    if (isRecord(item)) {
      return item as unknown as Summary;
    }

    // Alguns endpoints podem retornar apenas o _id do summary.
    // Preservamos esse caso como resumo mínimo para não perder o estado
    // de "presidente finalizou avaliação".
    if (typeof item === "string" && item.trim()) {
      return {
        _id: item,
        CENTRO_ID: "",
        FORM_ID: "",
        QUESTIONS: [],
        createdAt: "",
        updatedAt: "",
      };
    }

    return null;
  };

  if (Array.isArray(input)) {
    return input
      .map(toSummary)
      .filter((item): item is Summary => item !== null);
  }

  const normalized = toSummary(input);
  if (normalized) {
    return [normalized];
  }

  return [];
};

export const extractSummariesPayload = (payload: unknown): Summary[] => {
  if (Array.isArray(payload)) {
    return normalizeSummaries(payload);
  }

  if (isRecord(payload) && Array.isArray(payload.summaries)) {
    return normalizeSummaries(payload.summaries);
  }

  return normalizeSummaries(payload);
};

export const filterSummariesByForm = (summaries: Summary[], formId?: string): Summary[] => {
  if (!formId) return summaries;
  return summaries.filter((summary) => summary.FORM_ID === formId);
};

export const filterSummariesByPeriod = (
  summaries: Summary[],
  dateFromISO?: string,
  dateToISO?: string
): Summary[] => {
  if (!dateFromISO && !dateToISO) return summaries;

  return summaries.filter((summary) => {
    const dateKey = toDateKey(summary.updatedAt || summary.createdAt);
    if (!dateKey) return false;
    if (dateFromISO && dateKey < dateFromISO) return false;
    if (dateToISO && dateKey > dateToISO) return false;
    return true;
  });
};

export const getSummaryTimestamp = (summary?: Summary): number => {
  if (!summary) return 0;

  if (summary.updatedAt) {
    const updatedAt = new Date(summary.updatedAt).getTime();
    if (!Number.isNaN(updatedAt)) return updatedAt;
  }

  if (summary.createdAt) {
    const createdAt = new Date(summary.createdAt).getTime();
    if (!Number.isNaN(createdAt)) return createdAt;
  }

  return getObjectIdTimestamp(summary._id) ?? 0;
};

export const pickLatestSummary = (summaries: Summary[]): Summary | undefined => {
  if (!summaries.length) return undefined;

  return [...summaries].sort((a, b) => getSummaryTimestamp(b) - getSummaryTimestamp(a))[0];
};
