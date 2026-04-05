# 대검 블레이크 팬 페이지 ♡

블레이크 퍼스널 팬 페이지. 레트로 픽셀 UI + Cloudflare Workers 기반.

> 진정한 최애캐는 현실의 네가 아니면 안 된다.

## 기술 스택

- **프론트엔드**: HTML / CSS (Mona 픽셀폰트)
- **백엔드**: Cloudflare Workers + D1 (SQLite)
- **호스팅**: Cloudflare Workers Static Assets

## 로컬 개발

```bash
npm install

# D1 로컬 마이그레이션
npm run db:migrate:local

# 개발 서버
npm run dev
```

## 배포

```bash
# D1 프로덕션 마이그레이션 (최초 1회)
npm run db:migrate

# 배포
npm run deploy
```

## 프로젝트 구조

```
├── public/          # 정적 파일 (HTML, favicon)
│   ├── index.html
│   └── favicon.svg
├── src/
│   └── index.ts     # Cloudflare Worker (방명록 API)
├── migrations/
│   └── 0001_create_guestbook.sql
├── wrangler.toml    # Cloudflare 설정
└── package.json
```

## 기여 가이드

블레이크 팬이라면 누구든 환영합니다.

### 기여 방법

1. 이 저장소를 Fork합니다.
2. 브랜치를 생성합니다. (`git checkout -b feature/내-기여`)
3. 변경사항을 커밋합니다. (`git commit -m "feat: 변경 내용"`)
4. 브랜치에 푸시합니다. (`git push origin feature/내-기여`)
5. Pull Request를 생성합니다.

### 커밋 메시지 규칙

- `feat:` 새로운 기능
- `fix:` 버그 수정
- `style:` UI/CSS 변경
- `docs:` 문서 수정
- `chore:` 설정, 빌드 등 기타

### 코드 규칙

- Mona 픽셀폰트 통일 유지
- 한국어 텍스트는 HTML 엔티티(`&#x...;`)로 작성
- 외부 라이브러리 추가 최소화
- 레트로 픽셀 / Win98 미학 유지

### 기여 아이디어

- 새로운 명장면 추가
- 성지순례 장소 추가
- 모바일 UI 개선
- 접근성(a11y) 개선
