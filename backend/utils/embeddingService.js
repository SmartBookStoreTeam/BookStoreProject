import axios from "axios";

async function generateEmbedding(text) {
  const response = await axios.post(
    "https://api.cohere.ai/v1/embed",
    {
      texts: [text],
      model: "embed-english-v3.0",
      input_type: "search_document",
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );
  return response.data.embeddings[0]; // returns array of 1024 floats
}

export { generateEmbedding };
