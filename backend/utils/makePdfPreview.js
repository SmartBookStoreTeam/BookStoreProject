import { PDFDocument } from "pdf-lib";

export const makePdfPreview = async (pdfBuffer, maxPages = 10) => {
  const srcDoc = await PDFDocument.load(pdfBuffer);

  const totalPages = srcDoc.getPageCount();
  const pagesToCopy = Math.min(totalPages, maxPages);

  const previewDoc = await PDFDocument.create();

  const copiedPages = await previewDoc.copyPages(
    srcDoc,
    Array.from({ length: pagesToCopy }, (_, i) => i)
  );

  copiedPages.forEach((p) => previewDoc.addPage(p));

  const previewBytes = await previewDoc.save();
  return Buffer.from(previewBytes);
};
