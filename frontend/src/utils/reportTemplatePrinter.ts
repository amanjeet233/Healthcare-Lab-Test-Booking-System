import type { MedicalReportTemplateData } from './pdfGenerator';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

const escapeHtml = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const replaceFirst = (source: string, search: string, replacement: string): string => {
  const index = source.indexOf(search);
  if (index === -1) {
    return source;
  }
  return `${source.slice(0, index)}${replacement}${source.slice(index + search.length)}`;
};

const statusClass = (status: 'NORMAL' | 'ABNORMAL' | 'CRITICAL'): string =>
  status === 'NORMAL'
    ? 'bg-green-100 text-green-700'
    : 'bg-rose-100 text-rose-700';

const buildResultRows = (data: MedicalReportTemplateData): string => {
  if (!data.results.length) {
    return `
      <tr class="border-b border-slate-100 bg-white">
        <td class="py-3 px-4 font-bold text-slate-700">No result available</td>
        <td class="py-3 px-4 text-center font-black text-slate-500">-</td>
        <td class="py-3 px-4 text-center text-slate-500 font-medium">-</td>
        <td class="py-3 px-4 text-center text-slate-600 font-mono text-[11px]">-</td>
        <td class="py-3 px-4 text-right">
          <span class="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter bg-slate-100 text-slate-600">PENDING</span>
        </td>
      </tr>
    `;
  }

  return data.results
    .map((item, index) => {
      const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50';
      const cleanedParameter = escapeHtml(String(item.parameter || '').replace(/[.。]+$/g, '').trim());
      const resultValue = escapeHtml(item.result);
      const unitValue = escapeHtml(String(item.unit || '').trim() || '-');
      const refRangeValue = escapeHtml(item.refRange);
      const valueClass = item.status === 'NORMAL' ? '' : ' text-rose-600';
      const badge = statusClass(item.status);
      return `
        <tr class="border-b border-slate-100 ${rowClass}">
          <td class="py-3 px-4 font-bold text-slate-700">${cleanedParameter}</td>
          <td class="py-3 px-4 text-center font-black${valueClass}">${resultValue}</td>
          <td class="py-3 px-4 text-center text-slate-500 font-medium">${unitValue}</td>
          <td class="py-3 px-4 text-center text-slate-600 font-mono text-[11px]">${refRangeValue}</td>
          <td class="py-3 px-4 text-right">
            <span class="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${badge}">${escapeHtml(item.status)}</span>
          </td>
        </tr>
      `;
    })
    .join('');
};

const buildTemplateHtml = async (data: MedicalReportTemplateData): Promise<string> => {
  const response = await fetch('/report-template.html', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Template file not found');
  }
  let template = await response.text();

  const age = String(data.patient.age ?? '').trim();
  const gender = String(data.patient.gender ?? '').trim();
  const ageGender = [age ? `${age} Years` : '', gender].filter(Boolean).join(' / ');

  template = replaceFirst(template, '>Amanjeet Kumar<', `>${escapeHtml(data.patient.name)}<`);
  template = replaceFirst(template, '>24 Years / Male<', `>${escapeHtml(ageGender)}<`);
  template = replaceFirst(template, '>HL-2026-8842<', `>${escapeHtml(data.patient.reportId)}<`);
  template = replaceFirst(template, '>18 Apr 2026, 08:30 AM<', `>${escapeHtml(data.patient.sampleCollectionDate)}<`);
  template = replaceFirst(template, '>18 Apr 2026, 09:45 PM<', `>${escapeHtml(data.patient.reportGenerationDate)}<`);

  template = replaceFirst(
    template,
    '<span class="absolute text-xl font-black">88%</span>',
    `<span class="absolute text-xl font-black">${escapeHtml(data.scores.overall)}%</span>`
  );
  template = replaceFirst(
    template,
    '<p class="text-2xl font-black text-slate-800">92%</p>',
    `<p class="text-2xl font-black text-slate-800">${escapeHtml(data.scores.liver)}%</p>`
  );
  template = replaceFirst(
    template,
    '<p class="text-2xl font-black text-slate-800">75%</p>',
    `<p class="text-2xl font-black text-slate-800">${escapeHtml(data.scores.metabolism)}%</p>`
  );

  template = template.replace(
    /<tbody class="text-sm">[\s\S]*?<\/tbody>/,
    `<tbody class="text-sm">${buildResultRows(data)}</tbody>`
  );

  template = template.replace(
    /(<p class="text-xs text-slate-600 leading-relaxed italic">)[\s\S]*?(<\/p>)/,
    `$1${escapeHtml(data.doctorRemarks)}$2`
  );

  const insight1 = escapeHtml(data.aiInsights[0] || '-');
  const insight2 = escapeHtml(data.aiInsights[1] || '-');
  template = template.replace(
    /(<ul class="space-y-1 text-xs text-slate-600">)[\s\S]*?(<\/ul>)/,
    `$1<li class="flex gap-2"><span>•</span> ${insight1}</li><li class="flex gap-2"><span>•</span> ${insight2}</li>$2`
  );

  template = replaceFirst(
    template,
    'HMAC-SHA256: 8f3e2a9b1c7d4e5f0a6b9c8d7e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f',
    escapeHtml(data.digitalFingerprint)
  );
  template = replaceFirst(
    template,
    '>Dr. Sameer Patel<',
    `>${escapeHtml(data.verifiedDoctorName || 'Medical Officer')}<`
  );

  return template;
};

export const downloadReportFromHtmlTemplate = async (data: MedicalReportTemplateData): Promise<void> => {
  const template = await buildTemplateHtml(data);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  try {
    await new Promise<void>((resolve, reject) => {
      iframe.onload = () => resolve();
      iframe.onerror = () => reject(new Error('Failed to render template'));
      iframe.srcdoc = template;
    });

    const frameWindow = iframe.contentWindow;
    const frameDocument = iframe.contentDocument;
    if (!frameWindow || !frameDocument) {
      throw new Error('Print frame unavailable');
    }

    if ('fonts' in frameDocument) {
      await (frameDocument as Document & { fonts: FontFaceSet }).fonts.ready;
    }

    const container = frameDocument.querySelector('.a4-container') as HTMLElement | null;
    if (!container) {
      throw new Error('Template container missing');
    }

    const canvas = await html2canvas(container, {
      scale: 4,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    const imgData = canvas.toDataURL('image/png', 1.0);
    pdf.addImage(imgData, 'PNG', 0, 0, width, height, undefined, 'SLOW');
    pdf.save(`HEALTHCARELAB_REPORT_${data.patient.reportId}.pdf`);
  } finally {
    window.setTimeout(() => iframe.remove(), 100);
  }
};
