import { describe, expect, it } from 'vitest';
import { filterResponsesForPublic } from '@/lib/publicAnswers';

describe('public answers LGPD defaults', () => {
  it('hides personal contacts while preserving the center phone', () => {
    const visible = filterResponsesForPublic([
      { _id: '1', QUESTION: 'Seu Nome', ANSWER: 'Pessoa' },
      { _id: '2', QUESTION: 'E-mail do Responsável', ANSWER: 'pessoa@example.org' },
      { _id: '3', QUESTION: 'Telefone (se houver)', ANSWER: '(11) 0000-0000' },
    ]);
    expect(visible.map((item) => item._id)).toEqual(['3']);
  });
});
