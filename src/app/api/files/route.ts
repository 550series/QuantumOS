import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { FileNode } from '@/types';

const mockFiles: FileNode[] = [
  {
    id: 'file-1',
    name: 'project-plan.md',
    type: 'file',
    parentId: null,
    content: '# Project Plan\n\nThis is the project plan document.',
    size: 2048,
    mimeType: 'text/markdown',
    createdAt: new Date('2024-01-15T08:00:00Z'),
    modifiedAt: new Date('2024-06-01T12:30:00Z'),
  },
  {
    id: 'file-2',
    name: 'src',
    type: 'folder',
    parentId: null,
    size: 0,
    createdAt: new Date('2024-01-15T08:00:00Z'),
    modifiedAt: new Date('2024-05-20T09:00:00Z'),
  },
  {
    id: 'file-3',
    name: 'index.ts',
    type: 'file',
    parentId: 'file-2',
    content: "export * from './components';\nexport * from './utils';",
    size: 512,
    mimeType: 'text/typescript',
    createdAt: new Date('2024-02-10T10:00:00Z'),
    modifiedAt: new Date('2024-05-20T09:00:00Z'),
  },
  {
    id: 'file-4',
    name: 'package.json',
    type: 'file',
    parentId: null,
    content: JSON.stringify({ name: 'my-project', version: '1.0.0' }, null, 2),
    size: 1024,
    mimeType: 'application/json',
    createdAt: new Date('2024-01-15T08:00:00Z'),
    modifiedAt: new Date('2024-06-01T12:30:00Z'),
  },
  {
    id: 'file-5',
    name: 'components',
    type: 'folder',
    parentId: 'file-2',
    size: 0,
    createdAt: new Date('2024-02-10T10:00:00Z'),
    modifiedAt: new Date('2024-05-20T09:00:00Z'),
  },
  {
    id: 'file-6',
    name: 'Button.tsx',
    type: 'file',
    parentId: 'file-5',
    content: "import React from 'react';\n\nexport const Button = () => <button>Click</button>;",
    size: 768,
    mimeType: 'text/typescript',
    createdAt: new Date('2024-03-01T14:00:00Z'),
    modifiedAt: new Date('2024-05-18T16:00:00Z'),
  },
];

export async function GET() {
  return NextResponse.json(mockFiles);
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

  return NextResponse.json(newFile, { status: 201 });
}