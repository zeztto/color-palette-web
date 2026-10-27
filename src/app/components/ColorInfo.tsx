import { useState, useMemo, useCallback } from 'react';
import { hslStringToRgb, rgbToHex, rgbToHsl, rgbToCmyk, sanitizeColorInput } from '../utils/colorConversions';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Copy, Check, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { ColorURLShare } from '../utils/urlShare';

interface ColorInfoProps {
  color: string | null;
}

export function ColorInfo({ color }: ColorInfoProps) {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  // 색상 변환을 useMemo로 최적화
  const convertedColors = useMemo(() => {
    if (!color) return null;
    const rgb = hslStringToRgb(color);
    return {
      rgb,
      hex: rgbToHex(rgb),
      hsl: rgbToHsl(rgb),
      cmyk: rgbToCmyk(rgb)
    };
  }, [color]);

  // 안전한 클립보드 복사 함수
  const copyToClipboard = useCallback(async (value: string, label: string) => {
    try {
      // 입력 검증
      const sanitized = sanitizeColorInput(value);

      // Clipboard API 지원 확인
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not supported');
      }

      await navigator.clipboard.writeText(sanitized);
      setCopiedValue(sanitized);
      toast.success(`${label} 값이 복사되었습니다`);
    } catch (error) {
      toast.error('복사에 실패했습니다');
      console.error('Clipboard error:', error);
    } finally {
      setTimeout(() => setCopiedValue(null), 2000);
    }
  }, []);

  // 색상 공유 함수
  const shareColor = useCallback(async () => {
    if (!color) return;

    const shareURL = ColorURLShare.generateShareURL(color);

    // Web Share API (모바일 지원)
    if (navigator.share) {
      try {
        await navigator.share({
          title: '색상 팔레트',
          text: `색상: ${color}`,
          url: shareURL
        });
        toast.success('공유되었습니다');
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          // 취소가 아닌 경우 클립보드로 폴백
          await copyToClipboard(shareURL, '공유 링크');
        }
      }
    } else {
      // 데스크톱: 클립보드 복사
      await copyToClipboard(shareURL, '공유 링크');
    }
  }, [color, copyToClipboard]);

  // colorValues 배열을 useMemo로 최적화
  const colorValues = useMemo(() => {
    if (!convertedColors) return [];
    const { hex, rgb, hsl, cmyk } = convertedColors;
    return [
      {
        label: 'HEX',
        value: hex,
        description: '16진수',
      },
      {
        label: 'RGB',
        value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        description: 'Red, Green, Blue',
      },
      {
        label: 'HSL',
        value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        description: 'Hue, Saturation, Lightness',
      },
      {
        label: 'CMYK',
        value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`,
        description: 'Cyan, Magenta, Yellow, Black',
      },
    ];
  }, [convertedColors]);

  if (!color || !convertedColors) {
    return (
      <Card className="p-4 sm:p-8 h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground text-sm sm:text-base">
          <p>색상 팔레트에서</p>
          <p>색상을 선택하세요</p>
        </div>
      </Card>
    );
  }

  const { rgb, cmyk } = convertedColors;

  return (
    <Card className="p-3 sm:p-6 h-full flex flex-col w-full sm:w-auto">
      <div className="space-y-3 sm:space-y-4 flex-1">
        {/* 색상 프리뷰 */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg shadow-lg border-4 border-border flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <div className="min-w-0">
              <h3 className="mb-1">선택된 색상</h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                클릭하여 색상 코드를 복사하세요
              </p>
            </div>
          </div>

          {/* 공유 버튼 */}
          <Button
            size="sm"
            variant="outline"
            onClick={shareColor}
            title="색상 공유"
            aria-label="색상 공유"
            className="flex-shrink-0"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* 색상 값들 */}
        <div className="space-y-2">
          {colorValues.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono px-1.5 py-0.5 sm:px-2 bg-background rounded text-xs sm:text-sm">
                    {item.label}
                  </span>
                  <span className="text-muted-foreground text-xs hidden sm:inline">
                    {item.description}
                  </span>
                </div>
                <p className="font-mono text-xs sm:text-sm truncate">{item.value}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(item.value, item.label)}
                aria-label={`${item.label} 값 복사`}
                className="ml-1"
              >
                {copiedValue === item.value ? (
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                ) : (
                  <Copy className="h-3 w-3 sm:h-4 sm:w-4" />
                )}
              </Button>
            </div>
          ))}
        </div>

        {/* 개별 RGB 값 */}
        <div className="pt-3 sm:pt-4 border-t">
          <h4 className="mb-2 text-xs sm:text-sm">RGB 개별 값</h4>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-red-100 dark:bg-red-950">
              <div className="text-xs text-muted-foreground">Red</div>
              <div className="font-mono text-xs sm:text-sm mt-0.5">{rgb.r}</div>
            </div>
            <div className="p-1.5 sm:p-2 rounded-lg bg-green-100 dark:bg-green-950">
              <div className="text-xs text-muted-foreground">Green</div>
              <div className="font-mono text-xs sm:text-sm mt-0.5">{rgb.g}</div>
            </div>
            <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
              <div className="text-xs text-muted-foreground">Blue</div>
              <div className="font-mono text-xs sm:text-sm mt-0.5">{rgb.b}</div>
            </div>
          </div>
        </div>

        {/* 개별 CMYK 값 */}
        <div className="pt-3 sm:pt-4 border-t">
          <h4 className="mb-2 text-xs sm:text-sm">CMYK 개별 값</h4>
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            <div className="p-1.5 sm:p-2 rounded-lg bg-cyan-100 dark:bg-cyan-950">
              <div className="text-xs text-muted-foreground">Cyan</div>
              <div className="font-mono text-xs sm:text-sm mt-0.5">{cmyk.c}%</div>
            </div>
            <div className="p-1.5 sm:p-2 rounded-lg bg-pink-100 dark:bg-pink-950">
              <div className="text-xs text-muted-foreground">Mag</div>
              <div className="font-mono text-xs sm:text-sm mt-0.5">{cmyk.m}%</div>
            </div>
            <div className="p-1.5 sm:p-2 rounded-lg bg-yellow-100 dark:bg-yellow-950">
              <div className="text-xs text-muted-foreground">Yel</div>
              <div className="font-mono text-xs sm:text-sm mt-0.5">{cmyk.y}%</div>
            </div>
            <div className="p-1.5 sm:p-2 rounded-lg bg-gray-200 dark:bg-gray-800">
              <div className="text-xs text-muted-foreground">Black</div>
              <div className="font-mono text-xs sm:text-sm mt-0.5">{cmyk.k}%</div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
