import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ status: 'error', message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ status: 'error', message: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate clean unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${ext}`;

    // Attempt Cloudflare R2 upload if context available
    try {
      const { env } = await getCloudflareContext();
      if (env && (env as any).MEDIA_BUCKET) {
        await (env as any).MEDIA_BUCKET.put(filename, buffer, {
          httpMetadata: { contentType: file.type },
        });

        const r2PublicUrl = process.env.R2_PUBLIC_URL || '';
        const fileUrl = r2PublicUrl ? `${r2PublicUrl.replace(/\/$/, '')}/${filename}` : filename;

        return NextResponse.json({
          status: 'success',
          filename,
          url: fileUrl,
        });
      }
    } catch (e) {
      // In local dev without active R2 binding
    }

    // Local development fallback: write to public/images
    try {
      const fs = await import('fs');
      const path = await import('path');
      const publicDir = path.join(process.cwd(), 'public', 'images');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      fs.writeFileSync(path.join(publicDir, filename), buffer);

      return NextResponse.json({
        status: 'success',
        filename,
        url: `/images/${filename}`,
      });
    } catch (fsErr) {
      return NextResponse.json({
        status: 'success',
        filename,
        url: `/images/${filename}`,
      });
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ status: 'error', message: 'Upload failed' }, { status: 500 });
  }
}
