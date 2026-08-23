/**
 * issue #39 修复：POST 创建的文件持久化到共享 store，GET 读取同一实例。
 */
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { fileStore } from '@/app/api/_lib/data/files';
import { FileNode } from '@/types';

export async function GET() {
  return NextResponse.json(fileStore.list());
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const newFile: FileNode = {
    id: uuidv4(),
    name: body.name || 'untitled',
    type: body.type || 'file',
    parentId: body.parentId || null,
    content: body.content,
    size: body.size || 0,
    mimeType: body.mimeType,
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  fileStore.create(newFile);

  return NextResponse.json(newFile, { status: 201 });
}