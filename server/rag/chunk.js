import { PDFParse } from "pdf-parse";
import fs from "fs/promises";

// server/rag/documents/ is gitignored (sample PDFs are large binaries).
// Test fixture used during development: "Good Agricultural Practices in
// Onion and Garlic Production" (ICAR-Directorate of Onion and Garlic
// Research, 2022), downloaded from:
// https://www.manage.gov.in/publications/eBooks/Good%20Agricultural%20Practices%20in%20Onion%20and%20Garlic.pdf
// Save it as server/rag/documents/icar-onion-garlic-practices.pdf to
// reproduce the chunking tests, or use any other real PDF.

export async function extractText(pdfPath) {
  const buffer = await fs.readFile(pdfPath);
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  await parser.destroy();
  return result.text;
}

export function chunkText(text, chunkSize = 500, overlap = 50) {
  // TODO: split `text` into overlapping chunks of roughly `chunkSize` words.
  //
  // Two things to decide deliberately before coding, not while coding:
  // 1. Does splitting mid-sentence matter here? A chunk that starts or ends
  //    mid-sentence is still searchable by embedding similarity, but is it
  //    as good a citation to show a farmer? Worth having an opinion either
  //    way, not just defaulting to whatever's easiest to code.
  // 2. What exactly does `overlap` mean, mechanically? The common approach:
  //    each new chunk starts `chunkSize - overlap` words after the previous
  //    chunk started, so consecutive chunks share `overlap` words at the
  //    boundary — but decide this yourself rather than assuming that's right.
  //
  // Return an array of chunk strings.
  if (chunkSize <= 0) {
    throw new Error("chunkSize must be greater than 0");
  }
  if (overlap < 0 || overlap >= chunkSize) {
    throw new Error("overlap must be >= 0 and smaller than chunkSize");
  }
  const words = text.trim().split(/\s+/);
  const chunks = [];

  const step = chunkSize - overlap;

  for (let start = 0; start < words.length; start += step) {
    const chunkWords = words.slice(start, start + chunkSize);
    const chunk = chunkWords.join(" ");
    chunks.push(chunk);
  }

  return chunks;
}
