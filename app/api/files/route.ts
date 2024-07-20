import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import mime from 'mime-types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filename = decodeURIComponent(searchParams.get('filename') as string);
  const userID = decodeURIComponent(searchParams.get('userID') as string);

  if(!filename || !userID) return new NextResponse('Filename & User ID Required', { status: 400 });
  if(filename.split("_")[0] !== userID) return new NextResponse('Unauthorized', { status: 401 });

  const filePath = path.join(process.cwd(), 'applicant-file-uploads', filename);
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
    return new NextResponse('File not found', { status: 404 });
  }
}