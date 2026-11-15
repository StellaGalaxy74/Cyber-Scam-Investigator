import { jsPDF } from 'jspdf';
import type { InvestigationReport } from '../types/investigation.ts';

export function downloadInvestigationPdf(report: InvestigationReport): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 44;
  const maxWidth = pageWidth - margin * 2;
  let y = 48;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 48) {
      doc.addPage();
      y = 48;
    }
  };

  const addSectionTitle = (title: string) => {
    ensureSpace(34);
    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(14, 116, 144); // Deep cyan accent
    doc.text(title.toUpperCase(), margin, y);
    y += 6;
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.6);
    doc.line(margin, y, pageWidth - margin, y);
    y += 14;
  };

  const addParagraph = (text: string, boldPrefix?: string) => {
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    const fullText = boldPrefix ? `${boldPrefix}: ${text}` : text;
    const lines = doc.splitTextToSize(fullText, maxWidth) as string[];
    ensureSpace(lines.length * 14 + 6);
    doc.setFont('helvetica', 'normal');
    for (const line of lines) {
      doc.text(line, margin, y);
      y += 14;
    }
    y += 4;
  };

  const addBulletList = (items: string[], fallback = 'None detected') => {
    const list = items && items.length > 0 ? items : [fallback];
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);
    for (const item of list) {
      const lines = doc.splitTextToSize(`• ${item}`, maxWidth - 8) as string[];
      ensureSpace(lines.length * 14 + 4);
      for (const line of lines) {
        doc.text(line, margin + 4, y);
        y += 14;
      }
    }
    y += 4;
  };

  // Header Banner
  doc.setFillColor(11, 17, 32);
  doc.rect(0, 0, pageWidth, 88, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('SMART CYBER SCAM INVESTIGATOR', margin, 36);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(103, 232, 249);
  doc.text('DIGITAL FORENSICS & THREAT ASSESSMENT REPORT', margin, 54);
  doc.setTextColor(148, 163, 184);
  doc.text(`Report ID: ${report.investigationCode}   |   Generated: ${new Date(report.createdAt).toLocaleString()}`, margin, 72);

  y = 112;

  // 1-6: Core Metadata & Threat Assessment
  addSectionTitle('1. Investigation Summary & Risk Classification');
  addParagraph(report.investigationCode, 'Investigation ID');
  addParagraph(new Date(report.createdAt).toLocaleString(), 'Date & Time');
  addParagraph(report.type.toUpperCase(), 'Analysis Module');
  addParagraph(report.threatCategory, 'Threat Category');
  addParagraph(`${report.riskScore} / 100 (${report.threatClassification})`, 'Risk Score & Classification');
  addParagraph(`${report.scamProbability}%`, 'Estimated Scam Probability');
  addParagraph(report.confidenceLevel, 'Confidence Level');
  addParagraph(report.intelligenceStatus, 'Intelligence Verification Status');

  addSectionTitle('2. Submitted Content');
  addParagraph(report.submittedContent);

  if (report.ocrExtractedText) {
    addSectionTitle('3. OCR Extracted Text');
    addParagraph(report.ocrExtractedText);
  }

  addSectionTitle('4. Forensic Assessment Summary');
  addParagraph(report.summary);

  addSectionTitle('5. Detected Warning Signs & Keywords');
  addBulletList(report.suspiciousKeywords, 'No specific suspicious keywords flagged.');
  if (report.psychologicalTechniques.length > 0) {
    addParagraph(report.psychologicalTechniques.join(', '), 'Psychological Manipulation Techniques');
  }
  if (report.financialWarningSigns.length > 0) {
    addParagraph('Financial Warning Signs:', undefined);
    addBulletList(report.financialWarningSigns);
  }

  addSectionTitle('6. Red Flags & Supporting Evidence');
  addBulletList(report.redFlags, 'No major behavioral red flags observed.');
  if (report.supportingEvidence.length > 0) {
    addParagraph('Supporting Evidence:', undefined);
    addBulletList(report.supportingEvidence);
  }

  if (report.technicalFindings.length > 0) {
    addSectionTitle('7. Technical & Verification Findings');
    addBulletList(
      report.technicalFindings.map(
        (f) => `${f.label}: ${f.value} [${f.verified ? 'Verified' : 'Observed'}]`
      )
    );
  }

  addSectionTitle('8. Recommended Protective Actions');
  addBulletList(report.recommendedActions, 'Remain vigilant and verify through official channels.');

  addSectionTitle('9. Important Safety & Legal Warnings');
  addBulletList(
    [
      ...report.safetyWarnings,
      'This report is an AI-assisted forensic assessment and does not constitute legal proof or an accusation against any individual.',
      'India Cybercrime Emergency: Call 1930 immediately or report at https://cybercrime.gov.in/ if financial loss occurred, and contact your bank to freeze affected accounts.',
    ]
  );

  doc.save(`${report.investigationCode}_Report.pdf`);
}
