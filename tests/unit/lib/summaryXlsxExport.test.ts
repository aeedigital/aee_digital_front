import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildSummaryXlsxData,
  buildCenterSummaryFileName,
  buildRegionalSummaryFileName,
  createSummaryWorkbook,
  flattenSummaryResponses,
  triggerXlsxDownload,
  type SummaryXlsxRow,
} from '@/lib/summaryXlsxExport';

afterEach(() => {
  vi.unstubAllGlobals();
});

const row: SummaryXlsxRow = {
  centro: { _id: 'c1', NOME_CENTRO: 'Centro', NOME_CURTO: 'C', regionalNome: 'Regional' },
  summary: {
    _id: 's1', CENTRO_ID: 'c1', FORM_ID: 'f1', QUESTIONS: [], createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z',
    schemaVersion: 2,
    DIVULGACAO_AUTORIZADA: true,
    FORM_SNAPSHOT: {
      id: 'f1', name: 'Cadastro', version: 2,
      pages: [{ pageKey: 'page:0', pageName: 'Página', order: 0, quizzes: [{
        quizKey: 'page:0/quiz:0', category: 'Atividade', order: 0, groups: [{
          groupKey: 'page:0/quiz:0/group:0', isMultiple: true, order: 0,
          questions: [
            { questionId: 'q1', label: 'Pergunta', answerType: 'String', isRequired: false, presetValues: [], order: 0 },
            { questionId: 'q2', label: 'Vazia', answerType: 'String', isRequired: false, presetValues: [], order: 1 },
          ],
          occurrences: [
            { occurrenceId: 'g1', order: 0, answers: [{ questionId: 'q1', answerId: 'a1', rawValue: '=1+1', displayValue: '=1+1' }, { questionId: 'q2', rawValue: '', displayValue: '' }] },
            { occurrenceId: 'g2', order: 1, answers: [{ questionId: 'q1', answerId: 'a2', rawValue: 'B', displayValue: 'B' }, { questionId: 'q2', rawValue: '', displayValue: '' }] },
          ],
        }],
      }] }],
    },
    ATENDIMENTOS: { ATIVIDADES: [], PUBLICOS: [] },
  },
};

describe('Summary XLSX v2', () => {
  it('exports every occurrence including blank answers', () => {
    const responses = flattenSummaryResponses(row);
    expect(responses).toHaveLength(4);
    expect(responses.filter((item) => item.QUESTION_ID === 'q2')).toHaveLength(2);
  });

  it('reconciles totals and neutralizes formula-like raw values', () => {
    const data = buildSummaryXlsxData([row]);
    expect(data.centers[0].Respostas).toBe(4);
    expect(data.responses[0]['Resposta bruta']).toBe("'=1+1");
  });

  it('creates a real workbook with the three required worksheets', async () => {
    const workbook = await createSummaryWorkbook([row]);
    expect(workbook.worksheets.map((worksheet) => worksheet.name)).toEqual([
      'Centros', 'Respostas', 'Atendimentos',
    ]);
    expect(workbook.getWorksheet('Respostas')?.rowCount).toBe(5);
    expect(workbook.getWorksheet('Atendimentos')?.getRow(1).values).toContain('Atividade');
    expect(workbook.getWorksheet('Centros')?.autoFilter).toEqual({
      from: { row: 1, column: 1 },
      to: { row: 2, column: 16 },
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const ExcelJS = await import('exceljs');
    const reloaded = new ExcelJS.Workbook();
    await reloaded.xlsx.load(buffer);
    expect(reloaded.getWorksheet('Centros')?.rowCount).toBe(2);
  });

  it('keeps the Blob URL alive while mobile browsers finish the download', () => {
    const click = vi.fn();
    const remove = vi.fn();
    const appendChild = vi.fn();
    const createObjectURL = vi.fn(() => 'blob:xlsx');
    const revokeObjectURL = vi.fn();
    const setTimeout = vi.fn();
    const link = { href: '', download: '', style: { display: '' }, click, remove };

    vi.stubGlobal('document', {
      body: { appendChild },
      createElement: vi.fn(() => link),
    });
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
    vi.stubGlobal('window', { setTimeout });

    triggerXlsxDownload('regional.xlsx', new Uint8Array([1, 2, 3]));

    expect(appendChild).toHaveBeenCalledWith(link);
    expect(click).toHaveBeenCalledOnce();
    expect(remove).toHaveBeenCalledOnce();
    expect(revokeObjectURL).not.toHaveBeenCalled();
    expect(setTimeout).toHaveBeenCalledOnce();

    const revokeLater = setTimeout.mock.calls[0][0] as () => void;
    revokeLater();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:xlsx');
  });

  it('creates contextual file names for center and regional exports', () => {
    const generatedAt = new Date('2026-08-02T12:00:00Z');
    expect(buildCenterSummaryFileName({
      _id: 'c1',
      NOME_CENTRO: 'Casa Espírita Alvorada de Luz',
      NOME_CURTO: 'Alvorada',
    }, generatedAt)).toBe('resumo_centro_casa_espirita_alvorada_de_luz_2026-08-02.xlsx');
    expect(buildRegionalSummaryFileName('Regional São Paulo Centro', 'r1', generatedAt))
      .toBe('resumos_regional_regional_sao_paulo_centro_2026-08-02.xlsx');
  });
});
