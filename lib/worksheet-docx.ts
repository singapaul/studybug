import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ImageRun,
} from 'docx'
import type { GeneratedWorksheet } from '@/types/worksheet'
import { buildPdfModel, type PdfVariant, type PdfQuestion } from '@/lib/worksheet-pdf'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

function questionParagraphs(q: PdfQuestion, variant: PdfVariant): Paragraph[] {
  const out: Paragraph[] = []
  const tier = q.tierLabel ? `  (${q.tierLabel})` : ''
  out.push(
    new Paragraph({
      spacing: { before: 160, after: 60 },
      children: [
        new TextRun({ text: `${q.number}. `, bold: true }),
        new TextRun({ text: q.text }),
        new TextRun({ text: `  ${q.marksLabel}${tier}`, color: '666666' }),
      ],
    }),
  )

  if (q.options) {
    q.options.forEach((opt, i) =>
      out.push(new Paragraph({ indent: { left: 360 }, children: [new TextRun(`${LETTERS[i]}. ${opt}`)] })),
    )
  }
  if (q.orderItems) {
    out.push(new Paragraph({ indent: { left: 360 }, children: [new TextRun({ text: 'Put in the correct order:', italics: true })] }))
    q.orderItems.forEach((it, i) =>
      out.push(new Paragraph({ indent: { left: 360 }, children: [new TextRun(`${LETTERS[i]}. ${it}`)] })),
    )
  }
  if (q.matchLeft && q.matchRight) {
    q.matchLeft.forEach((l, i) =>
      out.push(new Paragraph({ indent: { left: 360 }, children: [new TextRun(`${i + 1}. ${l}`)] })),
    )
    q.matchRight.forEach((r, i) =>
      out.push(new Paragraph({ indent: { left: 360 }, children: [new TextRun(`${LETTERS[i]}. ${r}`)] })),
    )
  }
  // tableCompletion tables are rendered as a separate Table block by the caller.

  if (variant === 'answers' && q.answer) {
    out.push(
      new Paragraph({
        indent: { left: 360 },
        spacing: { after: 60 },
        children: [new TextRun({ text: 'Answer: ', bold: true }), new TextRun({ text: q.answer })],
      }),
    )
  } else if (variant === 'student' && !q.options && !q.orderItems && !q.matchLeft && !q.table) {
    // Blank lines for written answers.
    out.push(new Paragraph({ children: [new TextRun({ text: ' ' })], border: { bottom: { color: 'CCCCCC', size: 6, style: 'single', space: 1 } } }))
    out.push(new Paragraph({ children: [new TextRun({ text: ' ' })], border: { bottom: { color: 'CCCCCC', size: 6, style: 'single', space: 1 } } }))
  }

  return out
}

function tableBlock(q: PdfQuestion): Table | null {
  if (!q.table) return null
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: q.table.headers.map(
          (h) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] }),
        ),
      }),
      ...q.table.rows.map(
        (row) =>
          new TableRow({
            children: row.map((cell) => new TableCell({ children: [new Paragraph(cell)] })),
          }),
      ),
    ],
  })
}

/** Build a .docx Blob for a worksheet. Pass qrDataUrl (PNG data URL) to embed a QR on the student copy. */
export async function worksheetToDocxBlob(
  worksheet: GeneratedWorksheet,
  variant: PdfVariant,
  qrDataUrl?: string,
): Promise<Blob> {
  const model = buildPdfModel(worksheet, variant)
  const children: (Paragraph | Table)[] = []

  children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(model.title)] }))
  children.push(new Paragraph({ children: [new TextRun({ text: model.metaLine, color: '666666' })] }))
  if (model.examBoardLine) {
    children.push(new Paragraph({ children: [new TextRun({ text: model.examBoardLine, color: '666666', italics: true })] }))
  }

  if (variant === 'student' && qrDataUrl) {
    const base64 = qrDataUrl.split(',')[1] ?? ''
    children.push(
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new ImageRun({ type: 'png', data: Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)), transformation: { width: 90, height: 90 } }),
        ],
      }),
    )
  }

  if (variant === 'student') {
    children.push(new Paragraph({ spacing: { before: 120 }, children: [new TextRun('Name: ___________________   Class: ___________   Date: ___________')] }))
  }

  if (model.vocab.length) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 160 }, children: [new TextRun('Key vocabulary')] }))
    model.vocab.forEach((v) =>
      children.push(new Paragraph({ children: [new TextRun({ text: `${v.term} — `, bold: true }), new TextRun(v.definition)] })),
    )
  }

  model.sections.forEach((section) => {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200 }, children: [new TextRun(section.title)] }))
    if (section.instructions) {
      children.push(new Paragraph({ children: [new TextRun({ text: section.instructions, italics: true })] }))
    }
    section.questions.forEach((q) => {
      questionParagraphs(q, variant).forEach((p) => children.push(p))
      const tbl = tableBlock(q)
      if (tbl) children.push(tbl)
    })
  })

  if (model.extension) {
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 200 }, children: [new TextRun('Extension')] }))
    children.push(new Paragraph({ children: [new TextRun(model.extension)] }))
  }

  const doc = new Document({ sections: [{ children }] })
  return Packer.toBlob(doc)
}
