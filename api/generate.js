export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, width, height } = req.body;
  
  // Rolling API keys
  const apiKeys = [
    process.env.TOGETHER_API_KEY_1,
    process.env.TOGETHER_API_KEY_2,
    process.env.TOGETHER_API_KEY_3
  ];
  
  const currentKeyIndex = Math.floor(Date.now() / 60000) % apiKeys.length;
  const apiKey = apiKeys[currentKeyIndex];

  try {
    const response = await fetch('https://api.together.xyz/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell-Free",
        prompt: prompt,
        width: width,
        height: height,
        steps: 4
      }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate image' });
  }
}
