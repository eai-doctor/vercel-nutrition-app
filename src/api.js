const API_BASE = "/api";

export async function uploadReport(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${text}`);
  }

  return await res.json();
}

export async function uploadDemoReport() {
  const res = await fetch(`${API_BASE}/upload-demo`, {
    method: "POST",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Demo upload failed: ${text}`);
  }

  return await res.json();
}

export async function sendChat(reportId, question) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      report_id: reportId,
      question,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Chat failed: ${text}`);
  }

  return await res.json();
}

export async function analyzeReport(reportId, maxTraits = 5) {
  const res = await fetch(`${API_BASE}/analyze-report`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      report_id: reportId,
      max_traits: maxTraits,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Report analysis failed: ${text}`);
  }

  return await res.json();
}

export function getReportPdfUrl(reportId) {
  return `${API_BASE}/report-pdf/${encodeURIComponent(reportId)}`;
}

export function getDemoPdfUrl() {
  return `${API_BASE}/demo-report`;
}

export function getTextbookPdfUrl(bookId, page) {
  const base = `${API_BASE}/textbook?book_id=${encodeURIComponent(bookId || "")}`;
  if (!page) return base;
  return `${base}#page=${page}`;
}
