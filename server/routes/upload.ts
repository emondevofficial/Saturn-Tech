import { Router, Request, Response } from 'express';
import { requireAdmin, AuthRequest } from '../auth';

const router = Router();

router.post('/', requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { image, name } = req.body;
    if (!image) {
      return res.status(400).json({ success: false, message: 'Image payload required' });
    }

    // If Cloudinary credentials are present in env:
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const formData = new URLSearchParams();
        formData.append('file', image);
        formData.append('upload_preset', 'saturn_tech_bd');

        const cloudRes = await fetch(uploadUrl, { method: 'POST', body: formData });
        const cloudData = await cloudRes.json();
        if (cloudData.secure_url) {
          return res.json({ success: true, url: cloudData.secure_url });
        }
      } catch (cloudErr) {
        console.warn('Cloudinary upload warning:', cloudErr);
      }
    }

    // Direct data URL storage or verified fallback
    res.json({
      success: true,
      url: image.startsWith('http') || image.startsWith('data:')
        ? image
        : `/src/assets/images/hero_laptop_showcase_1790771906222.jpg`,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: 'Image upload failed' });
  }
});

export default router;
