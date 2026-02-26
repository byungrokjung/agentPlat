'use client';

import { useState, useEffect } from 'react';

interface OutputFile {
  name: string;
  date: string;
  type: 'research' | 'writer' | 'thumbnail';
  content?: string;
}

export default function OutputsPage() {
  const [outputs, setOutputs] = useState<OutputFile[]>([]);
  const [selected, setSelected] = useState<OutputFile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOutputs();
  }, []);

  const fetchOutputs = async () => {
    try {
      const res = await fetch('/api/outputs');
      const data = await res.json();
      setOutputs(data.files || []);
    } catch (error) {
      console.error('Failed to fetch outputs:', error);
    } finally {
      setLoading(false);
    }
  };

  const typeColors = {
    research: 'bg-blue-100 text-blue-800',
    writer: 'bg-green-100 text-green-800',
    thumbnail: 'bg-purple-100 text-purple-800',
  };

  const typeIcons = {
    research: '🔍',
    writer: '✍️',
    thumbnail: '🎨',
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🏭 Content Factory Output</h1>
        <p className="text-gray-600 mb-8">자동 생성된 콘텐츠 결과물</p>

        {loading ? (
          <div className="text-center py-12">로딩 중...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Output List */}
            <div className="md:col-span-1 space-y-4">
              <h2 className="font-semibold text-lg mb-4">📁 파일 목록</h2>
              {outputs.length === 0 ? (
                <p className="text-gray-500">아직 생성된 파일이 없습니다.</p>
              ) : (
                outputs.map((file, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelected(file)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selected?.name === file.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span>{typeIcons[file.type]}</span>
                      <span className={`text-xs px-2 py-1 rounded ${typeColors[file.type]}`}>
                        {file.type}
                      </span>
                    </div>
                    <p className="font-medium">{file.date}</p>
                    <p className="text-sm text-gray-500">{file.name}</p>
                  </div>
                ))
              )}
            </div>

            {/* Content Preview */}
            <div className="md:col-span-2">
              <h2 className="font-semibold text-lg mb-4">📄 미리보기</h2>
              {selected ? (
                <div className="bg-white rounded-lg border p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span>{typeIcons[selected.type]}</span>
                    <span className={`text-sm px-2 py-1 rounded ${typeColors[selected.type]}`}>
                      {selected.type}
                    </span>
                    <span className="text-gray-500">| {selected.date}</span>
                  </div>
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded">
                      {selected.content || '내용을 불러오는 중...'}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg border p-12 text-center text-gray-500">
                  왼쪽에서 파일을 선택하세요
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
