# Vector search index notes

**`similarity: "cosine"`** — cosine similarity measures the *angle* between two vectors, ignoring their magnitude. That's the right fit for text embeddings: OpenAI's `text-embedding-3-small` vectors encode meaning in *direction*, not length, so two chunks about the same topic point the same way even if one chunk is longer/denser than the other. Cosine is also the standard, documented recommendation for OpenAI embeddings specifically.

**`numDimensions: 1536`** — matches `text-embedding-3-small`'s actual output size exactly (verified directly on stored documents, not assumed).

**`numCandidates` — not part of the index, corrected from the original phase notes.** This was a mistake in how the task was originally described: `numCandidates` isn't something you configure on the index itself, it's a parameter passed at *query time* in the `$vectorSearch` aggregation stage — it tells MongoDB how many approximate nearest neighbors to consider before narrowing down to `limit` results. Used `numCandidates: 100` / `limit: 3` for the test query below; that ratio (candidates well above the limit) is the usual guidance for balancing recall against speed on a small collection. This will matter again for real in Phase 15's retrieval function.

**Verified with a real query**, not just index status — embedded "What soil type is best for growing onions?" and ran an actual `$vectorSearch`. Top result was a chunk starting "Soil: Onion ca[n be grown in...]" — directly on-topic, not a coincidence.
