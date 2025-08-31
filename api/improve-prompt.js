export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Get API key from environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY;
    
    if (!geminiApiKey) {
      return res.status(500).json({ error: 'Gemini API key not configured' });
    }

    // Create the instruction for improving the prompt
    const instruction = `Improve the following image generation prompt by translating it to English and enhancing it with more descriptive details while maintaining the original intent. The improved prompt should be optimized for AI image generation models like FLUX. Return only the improved prompt without any additional text or explanations.

Original prompt: "${prompt}"

Improved prompt:`;

    // Make request to Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: instruction }]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return res.status(500).json({ error: 'Failed to improve prompt' });
    }

    const data = await response.json();
    
    // Extract the improved prompt from the response
    if (data.candidates && data.candidates.length > 0 && 
        data.candidates[0].content && data.candidates[0].content.parts && 
        data.candidates[0].content.parts.length > 0) {
      const improvedPrompt = data.candidates[0].content.parts[0].text.trim();
      return res.status(200).json({ improvedPrompt });
    } else {
      return res.status(500).json({ error: 'Invalid response from Gemini API' });
    }
  } catch (error) {
    console.error('Error in improve-prompt function:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
