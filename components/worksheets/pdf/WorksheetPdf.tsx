import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { buildPdfModel, type PdfQuestion, type PdfVariant } from '@/lib/worksheet-pdf'
import type { GeneratedWorksheet } from '@/types/worksheet'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Helvetica', color: '#111', lineHeight: 1.4 },
  title: { fontSize: 18, fontFamily: 'Helvetica-Bold' },
  meta: { fontSize: 9, color: '#555', marginTop: 2 },
  examBoard: { fontSize: 9, color: '#555', marginTop: 2 },
  keyBadge: { fontSize: 10, fontFamily: 'Helvetica-Bold', color: '#b00', marginTop: 4 },
  nameLine: { fontSize: 10, color: '#333', marginTop: 10, flexDirection: 'row', justifyContent: 'space-between' },
  vocabBox: { marginTop: 12, padding: 8, backgroundColor: '#f4f4f5', borderRadius: 4 },
  vocabHeading: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
  vocabRow: { flexDirection: 'row', marginBottom: 2 },
  vocabTerm: { fontFamily: 'Helvetica-Bold', marginRight: 4 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 12, fontFamily: 'Helvetica-Bold' },
  sectionInstructions: { fontSize: 9, fontStyle: 'italic', color: '#555', marginBottom: 6 },
  question: { marginTop: 8 },
  questionHead: { flexDirection: 'row', justifyContent: 'space-between' },
  questionText: { flex: 1, paddingRight: 8 },
  marks: { fontSize: 9, color: '#555' },
  tier: { fontSize: 8, color: '#555', marginRight: 6 },
  indent: { marginLeft: 16, marginTop: 4 },
  option: { marginBottom: 2 },
  matchRow: { flexDirection: 'row', marginTop: 4 },
  matchCol: { flex: 1 },
  answerSpace: { marginTop: 4, borderBottomWidth: 1, borderBottomColor: '#bbb', borderBottomStyle: 'dotted', height: 16 },
  answer: { marginLeft: 16, marginTop: 4, color: '#b00' },
  table: { marginTop: 4, marginLeft: 16, borderWidth: 1, borderColor: '#999' },
  tableRow: { flexDirection: 'row' },
  tableCell: { borderWidth: 0.5, borderColor: '#999', padding: 3, flex: 1, fontSize: 10 },
  tableHeaderCell: { fontFamily: 'Helvetica-Bold', backgroundColor: '#eee' },
  extension: { marginTop: 16, padding: 8, borderWidth: 1, borderColor: '#999', borderStyle: 'dashed', borderRadius: 4 },
  extensionHeading: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  qrBox: { alignItems: 'center', marginLeft: 8 },
  qr: { width: 64, height: 64 },
  qrCaption: { fontSize: 6, color: '#777', marginTop: 1 },
})

const LETTERS = 'ABCDEFGHIJ'.split('')

function QuestionBlock({ q, variant }: { q: PdfQuestion; variant: PdfVariant }) {
  return (
    <View style={styles.question} wrap={false}>
      <View style={styles.questionHead}>
        <Text style={styles.questionText}>
          {q.number}. {q.text}
        </Text>
        <Text style={styles.marks}>
          {q.tierLabel ? <Text style={styles.tier}>{q.tierLabel} </Text> : null}
          {q.marksLabel}
        </Text>
      </View>

      {q.options && (
        <View style={styles.indent}>
          {q.options.map((opt, i) => (
            <Text key={i} style={styles.option}>{LETTERS[i]}. {opt}</Text>
          ))}
        </View>
      )}

      {q.orderItems && (
        <View style={styles.indent}>
          {q.orderItems.map((item, i) => (
            <Text key={i} style={styles.option}>{LETTERS[i]}. {item}</Text>
          ))}
        </View>
      )}

      {q.matchLeft && q.matchRight && (
        <View style={[styles.indent, styles.matchRow]}>
          <View style={styles.matchCol}>
            {q.matchLeft.map((l, i) => <Text key={i} style={styles.option}>{i + 1}. {l}</Text>)}
          </View>
          <View style={styles.matchCol}>
            {q.matchRight.map((r, i) => <Text key={i} style={styles.option}>{LETTERS[i]}. {r}</Text>)}
          </View>
        </View>
      )}

      {q.table && (
        <View style={styles.table}>
          <View style={styles.tableRow}>
            {q.table.headers.map((h, i) => (
              <Text key={i} style={[styles.tableCell, styles.tableHeaderCell]}>{h}</Text>
            ))}
          </View>
          {q.table.rows.map((row, ri) => (
            <View key={ri} style={styles.tableRow}>
              {row.map((cell, ci) => <Text key={ci} style={styles.tableCell}>{cell || ' '}</Text>)}
            </View>
          ))}
        </View>
      )}

      {variant === 'answers' && q.answer != null && (
        <Text style={styles.answer}>{q.answer || '—'}</Text>
      )}

      {/* Writing space on the student copy for free-text question types */}
      {variant === 'student' && !q.options && !q.orderItems && !q.matchLeft && !q.table && (
        <>
          <View style={styles.answerSpace} />
          <View style={styles.answerSpace} />
        </>
      )}
    </View>
  )
}

/** A single worksheet rendered as one (or more) A4 pages — reused for single + batch export. */
export function WorksheetPage({
  worksheet, variant, qrDataUrl,
}: { worksheet: GeneratedWorksheet; variant: PdfVariant; qrDataUrl?: string }) {
  const model = buildPdfModel(worksheet, variant)

  return (
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{model.title}</Text>
            <Text style={styles.meta}>{model.metaLine}</Text>
            {model.examBoardLine && <Text style={styles.examBoard}>{model.examBoardLine}</Text>}
            {variant === 'answers' && <Text style={styles.keyBadge}>ANSWER KEY</Text>}
          </View>
          {variant === 'student' && qrDataUrl && (
            <View style={styles.qrBox}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image style={styles.qr} src={qrDataUrl} />
              <Text style={styles.qrCaption}>Scan for online version</Text>
            </View>
          )}
        </View>

        {variant === 'student' && (
          <View style={styles.nameLine}>
            <Text>Name: ____________________</Text>
            <Text>Class: ____________</Text>
            <Text>Date: ____________</Text>
          </View>
        )}

        {model.vocab.length > 0 && (
          <View style={styles.vocabBox}>
            <Text style={styles.vocabHeading}>Key vocabulary</Text>
            {model.vocab.map((v, i) => (
              <View key={i} style={styles.vocabRow}>
                <Text style={styles.vocabTerm}>{v.term}:</Text>
                <Text>{v.definition}</Text>
              </View>
            ))}
          </View>
        )}

        {model.sections.map((section, si) => (
          <View key={si} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.instructions ? <Text style={styles.sectionInstructions}>{section.instructions}</Text> : null}
            {section.questions.map((q) => <QuestionBlock key={q.id} q={q} variant={variant} />)}
          </View>
        ))}

        {model.extension ? (
          <View style={styles.extension}>
            <Text style={styles.extensionHeading}>Extension</Text>
            <Text>{model.extension}</Text>
          </View>
        ) : null}
      </Page>
  )
}

export function WorksheetPdfDocument({
  worksheet, variant, qrDataUrl,
}: { worksheet: GeneratedWorksheet; variant: PdfVariant; qrDataUrl?: string }) {
  return (
    <Document title={`${worksheet.title}${variant === 'answers' ? ' — Answer Key' : ''}`}>
      <WorksheetPage worksheet={worksheet} variant={variant} qrDataUrl={qrDataUrl} />
    </Document>
  )
}

/** Many worksheets combined into one PDF (one worksheet per page-break) for batch export. */
export function WorksheetBatchPdfDocument({
  worksheets, variant,
}: { worksheets: GeneratedWorksheet[]; variant: PdfVariant }) {
  return (
    <Document title={`Worksheets (${worksheets.length})`}>
      {worksheets.map((w, i) => (
        <WorksheetPage key={i} worksheet={w} variant={variant} />
      ))}
    </Document>
  )
}
