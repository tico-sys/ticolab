export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl, filename = 'tico-image.png' } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Fetch the image from the provided URL
    const imageResponse = await fetch(imageUrl);
    
    if (!imageResponse.ok) {
      console.error('Failed to fetch image:', imageResponse.status, imageResponse.statusText);
      return res.status(500).json({ error: 'Failed to fetch image' });
    }
    
    // Get the image as buffer
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Get content type from response
    const contentType = imageResponse.headers.get('content-type') || 'image/png';
    
    // Sanitize filename
    const sanitizedFilename = filename.replace(/[^a-z0-9._-]/gi, '_').toLowerCase();
    
    // Set headers for download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', imageBuffer.byteLength);
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFilename}"`);
    
    // Enable CORS for the download
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Send the image
    res.send(Buffer.from(imageBuffer));
    
  } catch (error) {
    console.error('Error in download function:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
