import { useState, useEffect } from 'react';
import { ColorPicker } from './components/ColorPicker';
import { ColorInfo } from './components/ColorInfo';
import { ColorHistory } from './components/ColorHistory';
import { Toaster } from './components/ui/sonner';
import { Palette } from 'lucide-react';
import { ColorURLShare } from './utils/urlShare';

export default function App() {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // 초기 로드: URL에서 색상 읽기
  useEffect(() => {
    const urlColor = ColorURLShare.getColorFromURL();
    if (urlColor) {
      setSelectedColor(urlColor);
    }
  }, []);

  // 색상 변경: URL 업데이트 (디바운스)
  useEffect(() => {
    if (selectedColor) {
      const timeout = setTimeout(() => {
        ColorURLShare.setColorInURL(selectedColor);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [selectedColor]);

  return (
    <div className="min-h-screen bg-background p-3 sm:p-4">
      <div className="flex flex-col gap-3 sm:gap-4 w-full lg:w-fit min-w-0 max-w-full mx-auto">
        {/* 헤더 */}
        <div className="flex-shrink-0 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Palette className="w-5 h-5" />
            <h1 className="text-xl font-semibold">색상 팔레트</h1>
          </div>
          <p className="text-xs text-muted-foreground">
            원하는 색상을 클릭하여 RGB, HEX, HSL, CMYK 값을 확인하세요
          </p>
        </div>

        {/* 즐겨찾기 & 히스토리 */}
        <ColorHistory
          currentColor={selectedColor}
          onColorSelect={setSelectedColor}
        />

        {/* 메인 콘텐츠 - 모바일: 세로, 데스크톱: 가로 */}
        <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 items-start w-full lg:w-auto">
          {/* 색상 선택기 */}
          <div className="w-full lg:w-auto">
            <ColorPicker onColorSelect={setSelectedColor} />
          </div>

          {/* 색상 정보 */}
          <div className="w-full lg:flex-1">
            <ColorInfo color={selectedColor} />
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
