# 글쓰기 페이지(Write Page) 고도화 - 상세 기술 문서

## 📋 개요

작곡가 룸, 큐레이션 룸, 자유토크 룸의 세 가지 경로로 접근하는 글쓰기 페이지의 비즈니스 로직을 리팩토링했습니다.
특히 작곡가 룸 진입 시 **Story** 또는 **Curation** 중 하나를 선택할 수 있으며, 각 선택에 따라 다른 API 호출 전략을 적용합니다.

---

## 🎯 핵심 요구사항 정리

### 접근 경로별 포스트 타입

| 진입 경로 | 선택 옵션 | API 호출 | primaryComposerId | additionalComposerIds |
|---------|---------|--------|------------------|----------------------|
| 작곡가 룸 | Story (이야기) | POST `/posts/story` | 현재 작곡가 ID (고정) | ❌ 불필요 |
| 작곡가 룸 | Curation (이야기의 큐레이션) | POST `/posts/story` + POST `/posts/curation` | 현재 작곡가 ID (고정) | ✅ 사용자 선택 (선택사항, 비어도 됨) |
| 큐레이션 룸 | 큐레이션 글 | POST `/posts/curation` | 사용자 선택 (첫 번째) | 사용자 선택 (선택사항, 비어도 됨) |
| 자유토크 룸 | 자유 글 | POST `/posts/free` | ❌ 불필요 | ❌ 불필요 |

---

## 🔧 구현 상세

### 1. State Management (상태 관리)

#### URL 파라미터 추출
```typescript
const composerName = searchParams.get('composer');      // 작곡가 이름 (표시용)
const composerId = searchParams.get('composerId')       // 작곡가 ID (API용) ⭐ 중요
  ? parseInt(searchParams.get('composerId')!)
  : null;
const postTypeParam = searchParams.get('type');         // 'curation' 또는 'free'
```

**🚨 주의**: 작곡가 룸에서 진입할 때는 반드시 `?composerId=123` 형태로 ID를 전달해야 합니다.

#### 핵심 상태 변수
```typescript
const [primaryComposerId, setPrimaryComposerId] = useState<number | null>(composerId);
const [curationMode, setCurationMode] = useState<'none' | 'curation' | null>(null);
const [selectedComposers, setSelectedComposers] = useState<Array<{ id: number; name: string }>>([]);
const [isSubmitting, setIsSubmitting] = useState(false);  // 이중 제출 방지
```

#### 포스트 타입 판단 로직
```typescript
const isComposerTalkRoom = selectedType.includes('이야기');
const isCurationPost = selectedType === '큐레이션 글';
const isStoryPost = isComposerTalkRoom && curationMode === 'none';                    // Case 1
const isCurationWithComposer = isComposerTalkRoom && curationMode === 'curation';     // Case 2
```

---

### 2. Validation (유효성 검사)

```typescript
const validatePostData = (): { isValid: boolean; errorMessage?: string } => {
    // 기본 필드 검증
    if (!title.trim()) {
        return { isValid: false, errorMessage: '제목을 입력해주세요.' };
    }
    if (!content.trim()) {
        return { isValid: false, errorMessage: '내용을 입력해주세요.' };
    }
    
    // 포스트 타입별 검증
    if (isCurationPost) {
        // 큐레이션 글: 작곡가 선택 필수
        if (selectedComposers.length === 0) {
            return { isValid: false, errorMessage: '작곡가를 최소 1명 선택해주세요.' };
        }
    } else if (isStoryPost) {
        // 작곡가 이야기: primaryComposerId 필수
        if (!primaryComposerId) {
            return { isValid: false, errorMessage: '작곡가 ID를 찾을 수 없습니다.' };
        }
    } else if (isCurationWithComposer) {
        // 작곡가 이야기 + 큐레이션: primaryComposerId 고정, additionalComposers는 선택사항
        // (사용자가 추가 작곡가를 선택하지 않아도 됨)
    }
    
    return { isValid: true };
};
```

---

### 3. Async Handling (비동기 처리)

#### 이미지 업로드 (공통)
모든 포스트 타입에서 공통으로 실행:
```typescript
let uploadedImages: string[] | undefined;
if (imageFiles.length > 0) {
    const formData = new FormData();
    imageFiles.forEach(file => {
        formData.append('images', file);
    });

    const uploadRes = await apiClient.post('/images/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    uploadedImages = uploadRes.data.imageUrls;
}
```

#### Case 1: Story Post (작곡가 이야기)
```typescript
// ✅ 단일 API 호출
const storyData: StoryPostData = {
    title,
    content,
    postStatus: 'PUBLISHED',
    primaryComposerId: primaryComposerId!,
    // ... 이미지, 해시태그, 비디오 등
};

await apiClient.post('/posts/story', storyData);
router.push(`/composer-talk-room/${primaryComposerId}`);
```

#### Case 2: Story + Curation (작곡가 이야기의 큐레이션) ⭐ 핵심
```typescript
// ✅ 순차적 이중 API 호출
try {
    // 1단계: Story 포스트 생성
    const storyData: StoryPostData = {
        title,
        content,
        postStatus: 'PUBLISHED',
        primaryComposerId: primaryComposerId!,
    };
    
    await apiClient.post('/posts/story', storyData);
    console.log('✅ [STORY] Story 포스트 생성 완료');

    // 2단계: Curation 포스트 생성
    const curationData: CurationPostData = {
        title,
        content,
        postStatus: 'PUBLISHED',
        primaryComposerId: primaryComposerId!,
        // additionalComposerIds는 선택사항 (사용자가 선택한 경우만 포함)
        ...(selectedComposers.length > 0 && {
            additionalComposerIds: selectedComposers.map(c => c.id)
        }),
    };
    
    await apiClient.post('/posts/curation', curationData);
    console.log('✅ [CURATION] Curation 포스트 생성 완료');

    alert('작곡가 이야기와 큐레이션이 등록되었습니다.');
    router.push('/curation');
    
} catch (error: any) {
    // 에러 발생 시 사용자에게 알림
    alert('포스트 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    // Note: Story와 Curation 중 하나만 성공한 경우에 대한 처리는 백엔드 관리자와 협의 필요
    setIsSubmitting(false);
    return;
}
```

#### Case 3: Curation Post (큐레이션 글)
```typescript
const curationData: CurationPostData = {
    title,
    content,
    postStatus: 'PUBLISHED',
    primaryComposerId: selectedComposers[0].id,      // 첫 번째 선택 작곡가
    // additionalComposerIds는 선택사항 (2명 이상 선택한 경우만 포함)
    ...(selectedComposers.length > 1 && {
        additionalComposerIds: selectedComposers.slice(1).map(c => c.id)
    }),
};

await apiClient.post('/posts/curation', curationData);
router.push('/curation');
```

#### Case 4: Free Post (자유 글)
```typescript
const freeData: FreePostData = {
    title,
    content,
    postStatus: 'PUBLISHED',
    // ❌ 작곡가 정보 불필요
};

await apiClient.post('/posts/free', freeData);
router.push('/free-talk');
```

---

## 📊 데이터 스키마

### Story Post Request
```json
{
  "title": "베토벤 심포니의 위대함",
  "content": "베토벤의 제9번 심포니는...",
  "postStatus": "PUBLISHED",
  "primaryComposerId": 42,
  "images": [
    "https://s3.amazonaws.com/images/uuid-1.jpg",
    "https://s3.amazonaws.com/images/uuid-2.jpg"
  ],
  "hashtags": ["베토벤", "클래식음악"],
  "videoUrl": "https://youtube.com/watch?v=..."
}
```

### Curation Post Request (단독)
```json
{
  "title": "봄을 느끼는 클래식 음악",
  "content": "봄이 오면 듣고 싶은 클래식 곡들을 추천합니다...",
  "postStatus": "PUBLISHED",
  "primaryComposerId": 5,
  "additionalComposerIds": [12, 23, 45],
  "images": ["https://s3.amazonaws.com/images/uuid-3.jpg"],
  "hashtags": ["봄", "큐레이션"],
  "videoUrl": "https://youtube.com/watch?v=..."
}
```

### Curation Post Request (Story + Curation)
#### Story 부분
```json
{
  "title": "모차르트와 함께하는 우아함",
  "content": "모차르트의 음악은...",
  "postStatus": "PUBLISHED",
  "primaryComposerId": 8,
  "images": ["..."],
  "hashtags": ["모차르트"],
  "videoUrl": "..."
}
```

#### Curation 부분
```json
{
  "title": "모차르트와 함께하는 우아함",
  "content": "모차르트의 음악은...",
  "postStatus": "PUBLISHED",
  "primaryComposerId": 8,
  "additionalComposerIds": [15, 33, 67],  // 선택사항: 사용자가 추가로 선택한 작곡가
  "images": ["..."],
  "hashtags": ["모차르트"],
  "videoUrl": "..."
}
```

**예시 (작곡가 선택 없음)**:
```json
{
  "title": "모차르트와 함께하는 우아함",
  "content": "모차르트의 음악은...",
  "postStatus": "PUBLISHED",
  "primaryComposerId": 8,
  "images": ["..."],
  "hashtags": ["모차르트"],
  "videoUrl": "..."
}
```

### Free Post Request
```json
{
  "title": "클래식 음악에 대한 생각",
  "content": "오늘은 콘서트 후기를 써봅니다...",
  "postStatus": "PUBLISHED",
  "images": ["..."],
  "hashtags": ["콘서트", "후기"],
  "videoUrl": "..."
}
```

---

## 🎨 UI/UX Flow

### 작곡가 룸 진입 시 동작 흐름

```
작곡가 프로필 페이지
        ↓
     [글쓰기] 버튼 클릭 with ?composerId=42
        ↓
   Write 페이지 로드
   selectedType = "모차르트 이야기"
   primaryComposerId = 42 (고정)
        ↓
   큐레이션 옵션 드롭다운 표시
   ┌─────────────────────────┐
   │ 1. 모차르트 (Story)      │  ← curationMode = 'none'
   │ 2. 모차르트의 큐레이션    │  ← curationMode = 'curation'
   └─────────────────────────┘
        ↓
   사용자 선택
        ↓
   [1번 선택] → 작곡가 선택 섹션 숨김 → Story만 생성
   [2번 선택] → 작곡가 선택 섹션 표시 → Story + Curation 생성
```

### 조건부 렌더링

```tsx
{/* 작곡가 선택 섹션: 큐레이션 글 또는 "이야기 + 큐레이션" 선택 시만 표시 */}
{/* 참고: "이야기 + 큐레이션"에서 작곡가 선택은 선택사항 (비워도 등록 가능) */}
{(isCurationPost || isCurationWithComposer) && (
    <>
        <SectionHeader title="작곡가 선택" />
        <div className="w-full px-6 py-[18px] bg-white">
            {/* ComposerSearch 컴포넌트 */}
        </div>
    </>
)}
```

---

## 🚀 에러 핸들링 및 트랜잭션 처리

### Story + Curation 실패 시나리오

| 상황 | 처리 방법 |
|------|---------|
| Story 성공, Curation 실패 | 사용자에게 알림, Curation 재시도 제안 |
| Story 실패 | 즉시 중단, 에러 메시지 출력 |
| 이미지 업로드 실패 | 게시글 생성 전 중단 |

```typescript
try {
    // 1. Story 생성
    const storyResponse = await apiClient.post('/posts/story', storyData);
    console.log('✅ [STORY] Post created:', storyResponse.data);

    // 2. Curation 생성
    const curationResponse = await apiClient.post('/posts/curation', curationData);
    console.log('✅ [CURATION] Post created:', curationResponse.data);

    alert('작곡가 이야기와 큐레이션이 등록되었습니다.');
} catch (error: any) {
    // 어느 단계에서든 실패 시
    console.error('❌ API Error:', error.response?.data);
    alert('포스트 등록 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    setIsSubmitting(false);
    return;
}
```

---

## 📝 백엔드 협업 가이드

### URL 쿼리 파라미터 명세

**작곡가 룸에서 Write 페이지로 이동할 때:**
```
/write?composerId=42&composer=Wolfgang%20Amadeus%20Mozart
```

| 파라미터 | 필수 | 타입 | 설명 |
|---------|------|------|------|
| `composerId` | ✅ | number | 작곡가 고유 ID (API용) |
| `composer` | ❌ | string | 작곡가 이름 (UI 표시용) |
| `type` | ✅ | string | 'curation' 또는 'free' (큐레이션/자유글 룸에서) |

### API 호출 순서 보장

**Story + Curation 생성 시**, 반드시 다음 순서를 준수:
1. Story 포스트 생성 (`/posts/story`) → 성공 필수
2. Curation 포스트 생성 (`/posts/curation`) → 실패 시 사용자 알림

---

## ✅ 테스트 체크리스트

- [ ] 작곡가 룸에서 `?composerId=XXX` 파라미터로 진입
- [ ] Story 선택 시, 작곡가 선택 섹션이 숨겨지는가?
- [ ] Story 선택 후 등록 → `/posts/story` 호출 확인 (콘솔)
- [ ] Curation 선택 시, 작곡가 선택 섹션이 표시되는가?
- [ ] Curation 선택 후 등록 → `/posts/story`와 `/posts/curation` 모두 호출 확인
- [ ] 큐레이션 글 선택 → `/posts/curation` 호출 (story 불필요)
- [ ] 자유 글 선택 → `/posts/free` 호출
- [ ] 이중 클릭 방지: 등록 버튼이 disabled 되는가?
- [ ] 이미지 업로드 실패 시 게시글 생성이 중단되는가?
- [ ] 에러 메시지가 사용자 친화적으로 표시되는가?

---

## 🔍 Debug Tips

### 콘솔에서 확인할 주요 로그

```javascript
// API 호출 직전에 출력되는 로그
📝 [STORY] Posting to /posts/story: { ... }
📝 [CURATION] Posting to /posts/curation: { ... }

// 성공 시
✅ [STORY] Post created: { id: 123, ... }
✅ [CURATION] Post created: { id: 456, ... }

// 실패 시
❌ API Error: { message: "..." }
```

### 상태 확인

```javascript
// 브라우저 콘솔에서
console.log({
    isStoryPost,
    isCurationWithComposer,
    primaryComposerId,
    selectedComposers,
    curationMode,
});
```

---

## 📚 참고 자료

- OpenAPI Spec: `/posts/curation`, `/posts/story`, `/posts/free` 엔드포인트 정의 참조
- ComposerSearch 컴포넌트: `src/app/write/composer-search.tsx`
- 이미지 업로드: `POST /images/upload` (FormData)
