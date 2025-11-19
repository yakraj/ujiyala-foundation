// Utility to download a React component as PDF using html2pdf.js
// Usage: downloadComponentAsPDF(ref, filename)
export function downloadComponentAsPDF(ref, filename = "receipt.pdf") {
  if (!ref.current) return;
  import("html2pdf.js").then((html2pdf) => {
    const opt = {
      margin: 0,
      filename,
      image: { type: "jpeg", quality: 1 },
      html2canvas: { scale: 3, useCORS: true }, // Higher scale for better quality
      jsPDF: { unit: "pt", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    };
    html2pdf.default().set(opt).from(ref.current).save();
  });
}
