import OpenAI from "openai";
import DocumentChunk from "../models/DocumentChunk.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const VECTOR_INDEX = "documentchunks_vector_index";

export async function retrieveRelevantChunks(question, k = 3) {
  // 1. Turn the question into the same kind of vector
  // that we stored for our document chunks.
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  });

  const queryVector = response.data[0].embedding;
  // 2. Search MongoDB for the chunks whose embeddings
  // are closest to the question's embedding.
  const numCandidates = Math.max(k * 20, 100);
  const results = await DocumentChunk.aggregate([
    {
      $vectorSearch: {
        index: VECTOR_INDEX,
        path: "embedding",
        queryVector,
        numCandidates,
        limit: k,
      },
    },
    // 3. Return only the information the RAG system needs.
    {
      $project: {
        _id: 1,
        text: 1,
        source: 1,
        score: {
          $meta: "vectorSearchScore",
        },
      },
    },
  ]);
  return results;
}
