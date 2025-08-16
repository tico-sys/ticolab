// /api/generate.js
import { Together } from "together-ai";

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY, // Simpan di Vercel Environment Variables
});

// Mapping aspect ratio to dimensions
const getDimensions = (ratio) => {
  const map = {
    "1": [768, 768],
    "16:9": [1344, 768],
    "4:3": [1024, 768],
    "3:4": [768, 1024],
  };
  return map[ratio] || [768, 768];
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt, ratio = "1" } = req.body;

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt harus berupa teks." });
  }

  const [width, height] = getDimensions(ratio);

  try {
    const response = await together.images.create({
      model: "black-forest-labs/FLUX.1-schnell-Free",
      prompt: prompt,
      width,
      height,
      steps: 4,
      negative_prompt: "bad anatomy, blurry, low quality",
      disable_safety_checker: true,
    });

    const imageBase64 = response.data[0].b64_json;
    return res.status(200).json({ image: imageBase64 });
  } catch (error) {
    console.error("Together AI Error:", error);
    return res.status(500).json({ error: "Gagal menghasilkan gambar." });
  }
}

export const config = {
  runtime: "nodejs",
};
