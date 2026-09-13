import mongoose from "mongoose";

const documentChunkSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  embedding: {
    type: [Number],
    required: true,
  },
  source: {
    documentName: {
      type: String,
      required: true,
    },
    chunkIndex: {
      type: Number,
    },
    page: {
      type: Number,
    },
  },
});

const DocumentChunk = mongoose.model("DocumentChunk", documentChunkSchema);
export default DocumentChunk;
