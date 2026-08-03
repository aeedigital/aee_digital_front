import type { Centro } from '@/interfaces/centro.interface';
import type { Summary, SummaryFormSnapshot } from '@/interfaces/form.interface';
import { apiFetch } from '@/lib/api';

const EXCEL_CELL_LIMIT = 32767;
const EXCEL_ROW_LIMIT = 1_048_576;
const DATA_ROWS_PER_SHEET = EXCEL_ROW_LIMIT - 2;
const SUMMARY_FETCH_CONCURRENCY = 4;
const DOWNLOAD_URL_LIFETIME_MS = 5 * 60 * 1000;

const CENTER_HEADERS = [
  'Regional', 'Centro ID', 'Centro', 'Nome curto', 'Summary ID', 'Formulário ID', 'Formulário', 'Versão',
  'Finalizado em', 'Atualizado em', 'Validado pela coordenação em', 'Status', 'Divulgação autorizada',
  'Grupos', 'Ocorrências', 'Respostas',
];
const RESPONSE_HEADERS = [
  'Regional', 'Centro ID', 'Centro', 'Summary ID', 'Fase', 'Página', 'Categoria', 'GROUP_KEY',
  'GROUP_INSTANCE_ID', 'Ordem da ocorrência', 'QUESTION_ID', 'Pergunta', 'Tipo', 'ANSWER_ID',
  'Resposta exibida', 'Criada em', 'Atualizada em', 'Resposta bruta',
];
const ATTENDANCE_HEADERS = [
  'Regional', 'Centro ID', 'Centro', 'Summary ID', 'Código da atividade', 'Atividade', 'Público', 'Dia',
  'Horário de início', 'GROUP_INSTANCE_ID',
];

export type SummaryXlsxCentro = Pick<Centro, '_id' | 'NOME_CENTRO' | 'NOME_CURTO'> & {
  regionalNome?: string;
};

export type SummaryXlsxRow = {
  centro: SummaryXlsxCentro;
  summary: Summary;
};

export type SummaryXlsxPeriod = { dateFrom?: string; dateTo?: string };

function normalizeFilePart(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function dateFilePart(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function buildCenterSummaryFileName(centro: SummaryXlsxCentro, generatedAt = new Date()) {
  const name = normalizeFilePart(centro.NOME_CENTRO || centro.NOME_CURTO || centro._id) || centro._id;
  return `resumo_centro_${name}_${dateFilePart(generatedAt)}.xlsx`;
}

export function buildRegionalSummaryFileName(regionalName: string, regionalId: string, generatedAt = new Date()) {
  const name = normalizeFilePart(regionalName || regionalId) || regionalId;
  return `resumos_regional_${name}_${dateFilePart(generatedAt)}.xlsx`;
}

function normalizeDate(value?: string) {
  if (!value) return undefined;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split('/');
    return `${year}-${month}-${day}`;
  }
  return value;
}

function safeDate(value?: string) {
  if (!value) return '';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? value : parsed;
}

function asText(value: unknown) {
  const text = String(value ?? '');
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function splitCell(value: unknown) {
  const text = asText(value);
  if (!text) return [''];
  const chunks: string[] = [];
  for (let offset = 0; offset < text.length; offset += EXCEL_CELL_LIMIT) {
    chunks.push(text.slice(offset, offset + EXCEL_CELL_LIMIT));
  }
  return chunks;
}

function snapshotStats(snapshot?: SummaryFormSnapshot) {
  let groups = 0;
  let occurrences = 0;
  let answers = 0;
  snapshot?.pages.forEach((page) => page.quizzes.forEach((quiz) => quiz.groups.forEach((group) => {
    groups += 1;
    occurrences += group.occurrences.length;
    answers += group.occurrences.reduce((total, occurrence) => total + occurrence.answers.length, 0);
  })));
  return { groups, occurrences, answers };
}

export function flattenSummaryResponses(row: SummaryXlsxRow) {
  const output: Array<Record<string, unknown>> = [];
  const append = (snapshot: SummaryFormSnapshot | undefined, phase: 'CADASTRO' | 'COORDENACAO') => {
    snapshot?.pages.forEach((page) => page.quizzes.forEach((quiz) => quiz.groups.forEach((group) => {
      group.occurrences.forEach((occurrence) => occurrence.answers.forEach((answer) => {
        const question = group.questions.find((item) => item.questionId === answer.questionId);
        output.push({
          Regional: row.centro.regionalNome || '',
          'Centro ID': row.centro._id,
          Centro: row.centro.NOME_CENTRO || row.centro.NOME_CURTO || row.centro._id,
          'Summary ID': row.summary._id,
          Fase: phase,
          Página: page.pageName,
          Categoria: quiz.category,
          GROUP_KEY: group.groupKey,
          GROUP_INSTANCE_ID: occurrence.occurrenceId,
          'Ordem da ocorrência': occurrence.order,
          QUESTION_ID: answer.questionId,
          Pergunta: question?.label || '',
          Tipo: question?.answerType || '',
          ANSWER_ID: answer.answerId || '',
          'Resposta exibida': answer.displayValue,
          'Criada em': safeDate(answer.sourceCreatedAt),
          'Atualizada em': safeDate(answer.sourceUpdatedAt),
          __raw: answer.rawValue,
        });
      }));
    })));
  };
  append(row.summary.FORM_SNAPSHOT, 'CADASTRO');
  append(row.summary.COORDINATION_SNAPSHOT, 'COORDENACAO');
  return output;
}

export function buildSummaryXlsxData(rows: SummaryXlsxRow[]) {
  const responses = rows.flatMap(flattenSummaryResponses);
  const maxRawParts = Math.max(1, ...responses.map((item) => splitCell(item.__raw).length));
  const responseRows = responses.map(({ __raw, ...item }) => {
    const parts = splitCell(__raw);
    return {
      ...item,
      ...Object.fromEntries(Array.from({ length: maxRawParts }, (_, index) => [
        maxRawParts === 1 ? 'Resposta bruta' : `Resposta bruta ${index + 1}`,
        parts[index] || '',
      ])),
    };
  });

  const centers = rows.map(({ centro, summary }) => {
    const registration = snapshotStats(summary.FORM_SNAPSHOT);
    const coordination = snapshotStats(summary.COORDINATION_SNAPSHOT);
    const expected = registration.answers + coordination.answers;
    const actual = flattenSummaryResponses({ centro, summary }).length;
    if (expected !== actual) {
      throw new Error(`Summary ${summary._id}: esperado ${expected} respostas, encontrado ${actual}.`);
    }
    return {
      Regional: centro.regionalNome || '',
      'Centro ID': centro._id,
      Centro: centro.NOME_CENTRO || centro.NOME_CURTO || centro._id,
      'Nome curto': centro.NOME_CURTO || '',
      'Summary ID': summary._id,
      'Formulário ID': summary.FORM_ID,
      Formulário: summary.FORM_SNAPSHOT?.name || '',
      Versão: summary.FORM_SNAPSHOT?.version ?? '',
      'Finalizado em': safeDate(summary.createdAt),
      'Atualizado em': safeDate(summary.updatedAt),
      'Validado pela coordenação em': safeDate(summary.validatedByCoordAt),
      Status: summary.validatedByCoordAt ? 'COORDENACAO_VALIDADA' : 'FINALIZADO',
      'Divulgação autorizada': summary.DIVULGACAO_AUTORIZADA ? 'SIM' : 'NÃO',
      Grupos: registration.groups + coordination.groups,
      Ocorrências: registration.occurrences + coordination.occurrences,
      Respostas: expected,
    };
  });

  const attendance = rows.flatMap(({ centro, summary }) =>
    (summary.ATENDIMENTOS?.ATIVIDADES || []).flatMap((activity) =>
      activity.ENCONTROS.map((encounter) => ({
        Regional: centro.regionalNome || '',
        'Centro ID': centro._id,
        Centro: centro.NOME_CENTRO || centro.NOME_CURTO || centro._id,
        'Summary ID': summary._id,
        'Código da atividade': activity.CODIGO,
        Atividade: activity.NOME,
        Público: activity.PUBLICO || '',
        Dia: encounter.DIA,
        'Horário de início': encounter.HORARIO_INICIO,
        GROUP_INSTANCE_ID: encounter.GROUP_INSTANCE_ID,
      }))
    )
  );
  return { centers, responses: responseRows, attendance };
}

async function fetchLatestSummary(centroId: string, period: SummaryXlsxPeriod) {
  const params = new URLSearchParams({ limit: '1', sort: 'createdAt:-1' });
  const from = normalizeDate(period.dateFrom);
  const to = normalizeDate(period.dateTo);
  if (from) params.set('dateFrom', from);
  if (to) params.set('dateTo', to);
  const response = await apiFetch(`/centros/${encodeURIComponent(centroId)}/summaries?${params}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Falha ao buscar Summary do centro ${centroId} (${response.status}).`);
  const summaries = await response.json() as Summary[];
  return summaries[0];
}

export async function fetchLatestSummaryRows(centros: SummaryXlsxCentro[], period: SummaryXlsxPeriod = {}) {
  const rows: Array<{ centro: SummaryXlsxCentro; summary: Summary | undefined }> = new Array(centros.length);
  let cursor = 0;
  const worker = async () => {
    while (cursor < centros.length) {
      const index = cursor;
      cursor += 1;
      const centro = centros[index];
      rows[index] = { centro, summary: await fetchLatestSummary(centro._id, period) };
    }
  };
  await Promise.all(Array.from(
    { length: Math.min(SUMMARY_FETCH_CONCURRENCY, centros.length) },
    () => worker(),
  ));
  return rows.filter((row): row is SummaryXlsxRow => Boolean(row.summary));
}

function fitWorksheet(worksheet: import('exceljs').Worksheet) {
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  worksheet.getRow(1).height = 30;
  worksheet.getRow(1).eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1F4E78' } };
    cell.alignment = { vertical: 'middle', wrapText: true };
  });
  worksheet.columns.forEach((column) => {
    let width = 12;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      width = Math.max(width, Math.min(45, String(cell.value ?? '').length + 2));
      cell.alignment = { ...(cell.alignment || {}), vertical: 'top', wrapText: true };
      if (typeof cell.value === 'string') cell.numFmt = '@';
    });
    column.width = width;
  });
}

function addSheets(
  workbook: import('exceljs').Workbook,
  baseName: string,
  rows: Array<Record<string, unknown>>,
  emptyHeaders: string[],
) {
  const headers = Object.keys(rows[0] || Object.fromEntries(emptyHeaders.map((header) => [header, ''])));
  const batches = rows.length ? Math.ceil(rows.length / DATA_ROWS_PER_SHEET) : 1;
  for (let batch = 0; batch < batches; batch += 1) {
    const worksheet = workbook.addWorksheet(batch ? `${baseName} ${batch + 1}` : baseName);
    const batchRows = rows.slice(batch * DATA_ROWS_PER_SHEET, (batch + 1) * DATA_ROWS_PER_SHEET);
    worksheet.addRow(headers);
    if (batchRows.length) {
      worksheet.addRows(batchRows.map((row) => headers.map((header) => row[header] ?? '')));
      worksheet.autoFilter = {
        from: { row: 1, column: 1 },
        to: { row: worksheet.rowCount, column: headers.length },
      };
    }
    fitWorksheet(worksheet);
  }
}

export async function createSummaryWorkbook(rows: SummaryXlsxRow[]) {
  if (!rows.length) throw new Error('Nenhum Summary finalizado foi encontrado para a exportação.');
  const ExcelJS = await import('exceljs');
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Aliança Espírita Evangélica';
  workbook.created = new Date();
  const data = buildSummaryXlsxData(rows);
  addSheets(workbook, 'Centros', data.centers, CENTER_HEADERS);
  addSheets(workbook, 'Respostas', data.responses, RESPONSE_HEADERS);
  addSheets(workbook, 'Atendimentos', data.attendance, ATTENDANCE_HEADERS);
  return workbook;
}

export function triggerXlsxDownload(fileName: string, content: BlobPart) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), DOWNLOAD_URL_LIFETIME_MS);
}

export async function downloadSummaryXlsx(fileName: string, rows: SummaryXlsxRow[]) {
  if (typeof window === 'undefined') return;
  const workbook = await createSummaryWorkbook(rows);
  const buffer = await workbook.xlsx.writeBuffer();
  triggerXlsxDownload(fileName, buffer);
}
