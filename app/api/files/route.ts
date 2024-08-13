import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import mime from 'mime-types';
import { parseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { decrypt } from '@/lib/encryption-keys';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const filename = decodeURIComponent(searchParams.get('filename') as string);

  const cookies = parseCookie(req.cookies.toString());
  if (!type || !filename) return NextResponse.json({ error: 'Type & Filename Required' }, { status: 400 });

  if (type == "applicant" && decrypt(cookies.get('userID') as string) !== filename.split("_")[0]) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let filePath;

  switch (type) {
    case 'applicant':
      filePath = path.join(process.cwd(), 'applicant-file-uploads', filename);
      break;

    case "lease":
      filePath = path.join(process.cwd(), 'leases', filename);
      break;

    default:
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const contentType = mime.lookup(filename) || 'application/octet-stream';

  try {
    const file = await fs.readFile(filePath);
    return new NextResponse(file, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }
}