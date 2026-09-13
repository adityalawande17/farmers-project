import OpenAI from "openai";
import DocumentChunk from "../models/DocumentChunk.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function embedChunks(chunks, documentName) {
  for (let i = 0; i < chunks.length; i++) {
    const response = await client.embeddings.create({
      input: chunks[i],
      model: "text-embedding-3-small",
    });
    const embedding = response.data[0].embedding;

    // upsert on (documentName, chunkIndex) — re-running this script after a
    // partial failure updates existing chunks instead of duplicating them
    await DocumentChunk.findOneAndUpdate(
      { "source.documentName": documentName, "source.chunkIndex": i },
      {
        text: chunks[i],
        embedding,
        source: { documentName, chunkIndex: i },
      },
      { upsert: true },
    );
  }
}

export default embedChunks;
