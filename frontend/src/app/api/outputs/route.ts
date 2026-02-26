import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import path from 'path';

const OUTPUT_BASE = process.env.OUTPUT_PATH || '/home/byungrok/projects/ai-agent-platform/usecases/content-factory/output';

interface OutputFile {
  name: string;
  date: string;
  type: 'research' | 'writer' | 'thumbnail';
  content: string;
}

export async function GET() {
  try {
    const files: OutputFile[] = [];
    const types = ['research', 'writer', 'thumbnail'] as const;

    for (const type of types) {
      const dirPath = path.join(OUTPUT_BASE, type);
      
      try {
        const dirFiles = await readdir(dirPath);
        
        for (const file of dirFiles) {
          if (file.endsWith('.md')) {
            const filePath = path.join(dirPath, file);
            const content = await readFile(filePath, 'utf-8');
            const date = file.replace('.md', '');
            
            files.push({
              name: file,
              date,
              type,
              content,
            });
          }
        }
      } catch {
        // Directory doesn't exist, skip
        continue;
      }
    }

    // Sort by date descending
    files.sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error reading outputs:', error);
    return NextResponse.json({ files: [], error: 'Failed to read outputs' }, { status: 500 });
  }
}
