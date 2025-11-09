// PDF generation disabled. This module exports a safe stub so imports won't
// throw if any leftover code tries to call it. It does not create files.

export function generateReceiptPDF(/* type, payload */) {
  // Return null indicating no PDF was created.
  return Promise.resolve(null);
}
