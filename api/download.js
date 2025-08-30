export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      return res.status(500).json({ error: 'Failed to fetch image' });
    }
    
    // Get the image as buffer
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Set headers for download
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Length', imageBuffer.byteLength);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    
    // Send the image
    res.send(Buffer.from(imageBuffer));
  } catch (error) {
    console.error('Error in download function:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
