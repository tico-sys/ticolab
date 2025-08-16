// /api/generate.js
// Serverless Function - Vercel (Node.js)

const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;

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
    return res.status(400).json({ error: "Prompt wajib diisi dan harus berupa teks." });
  }

  if (!TOGETHER_API_KEY) {
    console.error("TOGETHER_API_KEY tidak ditemukan!");
    return res.status(500).json({ error: "Server tidak dikonfigurasi dengan benar." });
  }

  const [width, height] = getDimensions(ratio);

  try {
    const response = await fetch("https://api.together.xyz/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOGETHER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell-Free",
        prompt: prompt,
        width,
        height,
        steps: 4,
        negative_prompt: "bad anatomy, blurry, low quality, text, watermark",
        disable_safety_checker: true,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const base64Image = data.data?.[0]?.b64_json;

    if (!base64Image) {
      throw new Error("Tidak ada gambar yang dihasilkan.");
    }

    return res.status(200).json({ image: base64Image });
  } catch (error) {
    console.error("Error generating image:", error);
    return res.status(500).json({ error: "Gagal membuat gambar: " + error.message });
  }
}

export const config = {
  runtime: "nodejs",
};
