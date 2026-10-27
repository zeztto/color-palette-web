# 색상 팔레트

한국어 React 웹 도구입니다. 20단계 그레이스케일, 20개 색조와 색조별 400개 색상에서 색을 고르면 HEX·RGB·HSL·CMYK 값을 확인하고 복사할 수 있습니다.

## 실행

Node.js 22 이상과 npm이 필요합니다. CI는 Node.js 24를 사용합니다.

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run dev
```

개발 서버 주소는 terminal에 표시됩니다. 빌드 결과는 `dist/`에 생성되며 `npm run preview`로 확인할 수 있습니다. 정적 hosting에는 `dist/`를 배포하세요. Clipboard 기능은 HTTPS 또는 localhost에서 브라우저 권한이 허용될 때 동작합니다.

## 지원 기능

- 선택한 색상의 HEX·RGB·HSL·CMYK 출력과 복사
- 즐겨찾기 최대 50개, 최근 선택 색상 최대 20개를 브라우저 `localStorage`에 저장
- `?color=180-50-50` 형식의 HSL 공유 URL
- 즐겨찾기를 CSS 변수, JSON, Figma 색상 JSON 파일로 내보내기

직접 색상 코드를 입력하는 편집기나 파일 가져오기는 제공하지 않습니다. CMYK는 RGB에서 계산한 비율이며 인쇄용 ICC 색상 관리 기능은 없습니다. 브라우저 저장소를 삭제하거나 다른 기기를 사용하면 저장된 색상이 유지되지 않습니다.

저장된 색상 목록 데이터가 손상되면 원본 bytes를 보존하고 해당 목록의 변경을 차단하며 화면에 오류를 표시합니다.

## 검증

```sh
npm run typecheck
npm test
npm run build
npm audit --audit-level=high
```

회귀 test는 색상 변환·범위 검증·URL roundtrip·잘못된 저장소 데이터·export 형식을 확인합니다. 실제 Clipboard와 파일 다운로드는 브라우저 기능과 권한에 영향을 받습니다.

## License

작성자 코드에는 [MIT License](LICENSE)가 적용됩니다. 포함된 UI 코드의 원 저작권 고지는 [ATTRIBUTIONS.md](ATTRIBUTIONS.md)와 [THIRD_PARTY_LICENSES/shadcn-ui.txt](THIRD_PARTY_LICENSES/shadcn-ui.txt)에 유지합니다. 패키지별 license는 각 의존성에 적용됩니다.
