import { NextResponse } from "next/server";
import PptxGenJS from "pptxgenjs";

import type { CompositionTotals, RegionalComposition } from "@/lib/compositionReport";

export const runtime = "nodejs";

function addMetricBox(
  slide: PptxGenJS.Slide,
  {
    title,
    value,
    x,
    y,
    color,
  }: { title: string; value: number; x: number; y: number; color: string }
) {
  slide.addShape("roundRect", {
    x,
    y,
    w: 2.1,
    h: 1.3,
    rectRadius: 0.08,
    fill: { color: "F8FAFC" },
    line: { color },
  });
  slide.addText(title, {
    x: x + 0.15,
    y: y + 0.12,
    w: 1.8,
    h: 0.25,
    fontSize: 10,
    color: "475569",
    bold: true,
  });
  slide.addText(String(value), {
    x: x + 0.15,
    y: y + 0.42,
    w: 1.8,
    h: 0.45,
    fontSize: 22,
    color: "0F172A",
    bold: true,
  });
}

type ExportPayload = {
  composition?: RegionalComposition[];
  periodLabel?: string | null;
  totals?: CompositionTotals;
};

function isValidPayload(payload: ExportPayload): payload is {
  composition: RegionalComposition[];
  periodLabel: string | null;
  totals: CompositionTotals;
} {
  return Boolean(
    Array.isArray(payload.composition) &&
      payload.totals &&
      typeof payload.totals.integradas === "number" &&
      typeof payload.totals.inscritas === "number" &&
      typeof payload.totals.pendentes === "number" &&
      typeof payload.totals.total === "number"
  );
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ExportPayload;
    if (!isValidPayload(payload)) {
      return NextResponse.json({ error: "Payload inválido para exportação." }, { status: 400 });
    }

    const { composition, periodLabel, totals } = payload;

    const pptx = new PptxGenJS();
    pptx.author = "Alianca Digital";
    pptx.company = "Alianca Espirita Evangelica";
    pptx.subject = "Composição das regionais";
    pptx.title = "Composição das regionais";
    pptx.layout = "LAYOUT_WIDE";

    const cover = pptx.addSlide();
    cover.background = { color: "F8FAFC" };
    cover.addText("Composição das regionais", {
      x: 0.6,
      y: 0.7,
      w: 7.4,
      h: 0.6,
      fontSize: 26,
      bold: true,
      color: "0F172A",
    });
    cover.addText("Antes da AGI", {
      x: 0.62,
      y: 0.25,
      w: 2,
      h: 0.25,
      fontSize: 10,
      bold: true,
      color: "B45309",
    });
    if (periodLabel) {
      cover.addText(`Período: ${periodLabel}`, {
        x: 0.6,
        y: 1.35,
        w: 5.5,
        h: 0.3,
        fontSize: 12,
        color: "475569",
      });
    }

    addMetricBox(cover, { title: "Integradas", value: totals.integradas, x: 0.6, y: 2, color: "10B981" });
    addMetricBox(cover, { title: "Inscritas", value: totals.inscritas, x: 2.95, y: 2, color: "38BDF8" });
    addMetricBox(cover, { title: "Pendentes", value: totals.pendentes, x: 5.3, y: 2, color: "F59E0B" });
    addMetricBox(cover, { title: "Total", value: totals.total, x: 7.65, y: 2, color: "8B5CF6" });

    composition.forEach((regional) => {
      const slide = pptx.addSlide();
      slide.background = { color: "FFFFFF" };
      slide.addText(regional.nome, {
        x: 0.6,
        y: 0.6,
        w: 6.5,
        h: 0.5,
        fontSize: 24,
        bold: true,
        color: "0F172A",
      });

      addMetricBox(slide, { title: "Integradas", value: regional.integradas, x: 0.6, y: 1.6, color: "10B981" });
      addMetricBox(slide, { title: "Inscritas", value: regional.inscritas, x: 2.95, y: 1.6, color: "38BDF8" });
      addMetricBox(slide, { title: "Pendentes", value: regional.pendentes, x: 5.3, y: 1.6, color: "F59E0B" });
      addMetricBox(slide, { title: "Total", value: regional.total, x: 7.65, y: 1.6, color: "8B5CF6" });
    });

    const buffer = await pptx.write({ outputType: "nodebuffer" });
    const stamp = new Date().toISOString().slice(0, 10);

    return new NextResponse(buffer as BodyInit, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="composicao-regionais-${stamp}.pptx"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[PPT Export] Falha ao gerar apresentação", error);
    return NextResponse.json({ error: "Não foi possível gerar o PPT." }, { status: 500 });
  }
}
