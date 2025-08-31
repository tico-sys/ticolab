export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, width = 1080, height = 1080 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Get API keys from environment variables
    const apiKeys = [
      process.env.TOGETHER_API_KEY_1,
      process.env.TOGETHER_API_KEY_2,
      process.env.TOGETHER_API_KEY_3
    ].filter(key => key); // Filter out undefined keys

    if (apiKeys.length === 0) {
      return res.status(500).json({ error: 'No API keys configured' });
    }

    // Implement rolling API key strategy
    // Use current timestamp to determine which key to use
    const timestamp = Date.now();
    const keyIndex = Math.floor(timestamp / 60000) % apiKeys.length; // Change key every minute
    const apiKey = apiKeys[keyIndex];

    console.log(`Using API key ${keyIndex + 1} of ${apiKeys.length}`);

    // Make request to Together API
    const response = await fetch("https://api.together.xyz/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell-Free",
        prompt: prompt,
        width: parseInt(width),
        height: parseInt(height)
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Together API error:', errorText);
      
      // Try with next key if current one fails
      if (apiKeys.length > 1) {
        const nextKeyIndex = (keyIndex + 1) % apiKeys.length;
        const nextApiKey = apiKeys[nextKeyIndex];
        
        console.log(`Retrying with API key ${nextKeyIndex + 1}`);
        
        const retryResponse = await fetch("https://api.together.xyz/v1/images/generations", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${nextApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "black-forest-labs/FLUX.1-schnell-Free",
            prompt: prompt,
            width: parseInt(width),
            height: parseInt(height)
          })
        });
        
        if (!retryResponse.ok) {
          const retryErrorText = await retryResponse.text();
          console.error('Together API retry error:', retryErrorText);
          return res.status(500).json({ error: 'Failed to generate image after retry' });
        }
        
        const data = await retryResponse.json();
        return res.status(200).json(data);
      }
      
      return res.status(500).json({ error: 'Failed to generate image' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error in generate function:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
