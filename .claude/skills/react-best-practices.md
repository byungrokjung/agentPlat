# React Best Practices

Vercel Engineering의 React/Next.js 성능 최적화 가이드. 코드 작성, 리뷰, 리팩토링 시 참조.

**Version 1.0.0** | Vercel Engineering | January 2026

---

## 사용 시점

React 컴포넌트나 Next.js 페이지 작성/리뷰/리팩토링 시 이 스킬을 참조하세요.

---

## 규칙 카테고리 (우선순위순)

1. **워터폴 제거** - CRITICAL
2. **번들 사이즈 최적화** - CRITICAL
3. **서버사이드 성능** - HIGH
4. **클라이언트 데이터 페칭** - MEDIUM-HIGH
5. **리렌더 최적화** - MEDIUM
6. **렌더링 성능** - MEDIUM
7. **JavaScript 성능** - LOW-MEDIUM
8. **고급 패턴** - LOW

---

## 1. 워터폴 제거 (CRITICAL)

### 1.1 필요할 때까지 await 지연

```typescript
// Bad: 모든 경로에서 대기
async function handleRequest(userId: string, skipProcessing: boolean) {
  const userData = await fetchUserData(userId)
  if (skipProcessing) return { skipped: true }
  return processUserData(userData)
}

// Good: 필요할 때만 대기
async function handleRequest(userId: string, skipProcessing: boolean) {
  if (skipProcessing) return { skipped: true }
  const userData = await fetchUserData(userId)
  return processUserData(userData)
}
```

### 1.2 Promise.all()로 독립 작업 병렬 실행

```typescript
// Bad: 순차 실행 (3 round trips)
const user = await fetchUser()
const posts = await fetchPosts()
const comments = await fetchComments()

// Good: 병렬 실행 (1 round trip)
const [user, posts, comments] = await Promise.all([
  fetchUser(),
  fetchPosts(),
  fetchComments()
])
```

### 1.3 Suspense 경계로 즉시 렌더링

```tsx
// Bad: 전체 페이지가 데이터 대기
async function Page() {
  const data = await fetchData()
  return <div><Sidebar /><DataDisplay data={data} /><Footer /></div>
}

// Good: 레이아웃 즉시 렌더링, 데이터만 대기
function Page() {
  return (
    <div>
      <Sidebar />
      <Suspense fallback={<Skeleton />}>
        <DataDisplay />
      </Suspense>
      <Footer />
    </div>
  )
}
```

---

## 2. 번들 사이즈 최적화 (CRITICAL)

### 2.1 배럴 파일 피하기

```tsx
// Bad: 전체 라이브러리 로드
import { Check, X, Menu } from 'lucide-react'

// Good: 필요한 것만 로드
import Check from 'lucide-react/dist/esm/icons/check'
import X from 'lucide-react/dist/esm/icons/x'

// Alternative: next.config.js에서 optimizePackageImports 사용
```

### 2.2 무거운 컴포넌트 동적 임포트

```tsx
// Bad: 메인 청크에 포함
import { MonacoEditor } from './monaco-editor'

// Good: 필요시 로드
const MonacoEditor = dynamic(
  () => import('./monaco-editor').then(m => m.MonacoEditor),
  { ssr: false }
)
```

### 2.3 비핵심 라이브러리 지연 로드

```tsx
// Analytics, 에러 트래킹 등은 hydration 후 로드
const Analytics = dynamic(
  () => import('@vercel/analytics/react').then(m => m.Analytics),
  { ssr: false }
)
```

---

## 3. 서버사이드 성능 (HIGH)

### 3.1 Server Actions 인증 필수

```typescript
'use server'

// Bad: 인증 없음
export async function deleteUser(userId: string) {
  await db.user.delete({ where: { id: userId } })
}

// Good: 인증 확인
export async function deleteUser(userId: string) {
  const session = await verifySession()
  if (!session || session.user.id !== userId) {
    throw new Error('Unauthorized')
  }
  await db.user.delete({ where: { id: userId } })
}
```

### 3.2 RSC 경계에서 직렬화 최소화

```tsx
// Bad: 50개 필드 전체 전달
<Profile user={user} />

// Good: 필요한 필드만 전달
<Profile name={user.name} avatar={user.avatar} />
```

### 3.3 React.cache()로 요청 내 중복 제거

```typescript
import { cache } from 'react'

export const getCurrentUser = cache(async () => {
  const session = await auth()
  if (!session?.user?.id) return null
  return db.user.findUnique({ where: { id: session.user.id } })
})
```

### 3.4 after()로 논블로킹 작업

```typescript
import { after } from 'next/server'

export async function POST(request: Request) {
  await updateDatabase(request)

  // 응답 후 실행
  after(async () => {
    await logUserAction()
  })

  return Response.json({ status: 'success' })
}
```

---

## 4. 클라이언트 데이터 페칭 (MEDIUM-HIGH)

### 4.1 SWR로 자동 중복 제거

```tsx
// Bad: 각 인스턴스가 별도 fetch
const [users, setUsers] = useState([])
useEffect(() => {
  fetch('/api/users').then(r => r.json()).then(setUsers)
}, [])

// Good: 여러 인스턴스가 하나의 요청 공유
const { data: users } = useSWR('/api/users', fetcher)
```

### 4.2 Passive 이벤트 리스너 사용

```typescript
// 스크롤/터치 성능 향상
document.addEventListener('wheel', handler, { passive: true })
document.addEventListener('touchstart', handler, { passive: true })
```

---

## 5. 리렌더 최적화 (MEDIUM)

### 5.1 파생 상태는 렌더 중 계산

```tsx
// Bad: 불필요한 state + effect
const [fullName, setFullName] = useState('')
useEffect(() => {
  setFullName(firstName + ' ' + lastName)
}, [firstName, lastName])

// Good: 렌더 중 계산
const fullName = firstName + ' ' + lastName
```

### 5.2 함수형 setState 사용

```tsx
// Bad: 콜백이 items 변경 시마다 재생성
const addItem = useCallback((item) => {
  setItems([...items, item])
}, [items])

// Good: 안정적인 콜백
const addItem = useCallback((item) => {
  setItems(curr => [...curr, item])
}, [])
```

### 5.3 Lazy State 초기화

```tsx
// Bad: 매 렌더마다 실행
const [index] = useState(buildExpensiveIndex(items))

// Good: 초기화 시에만 실행
const [index] = useState(() => buildExpensiveIndex(items))
```

### 5.4 Transition으로 논급한 업데이트

```tsx
import { startTransition } from 'react'

// 스크롤 등 빈번한 업데이트에 사용
const handler = () => {
  startTransition(() => setScrollY(window.scrollY))
}
```

---

## 6. 렌더링 성능 (MEDIUM)

### 6.1 content-visibility로 긴 목록 최적화

```css
.message-item {
  content-visibility: auto;
  contain-intrinsic-size: 0 80px;
}
```

### 6.2 정적 JSX 호이스팅

```tsx
// Bad: 매 렌더마다 재생성
function Container() {
  return <>{loading && <Skeleton />}</>
}

// Good: 재사용
const skeleton = <Skeleton />
function Container() {
  return <>{loading && skeleton}</>
}
```

### 6.3 SVG 래퍼 애니메이션

```tsx
// Bad: SVG 직접 애니메이션 (하드웨어 가속 없음)
<svg className="animate-spin">...</svg>

// Good: 래퍼 div 애니메이션 (GPU 가속)
<div className="animate-spin"><svg>...</svg></div>
```

---

## 7. JavaScript 성능 (LOW-MEDIUM)

### 7.1 반복 조회에 Map 사용

```typescript
// Bad: O(n) per lookup
users.find(u => u.id === order.userId)

// Good: O(1) per lookup
const userById = new Map(users.map(u => [u.id, u]))
userById.get(order.userId)
```

### 7.2 toSorted()로 불변성 유지

```typescript
// Bad: 원본 배열 변형
users.sort((a, b) => a.name.localeCompare(b.name))

// Good: 새 배열 생성
users.toSorted((a, b) => a.name.localeCompare(b.name))
```

### 7.3 Min/Max에 정렬 대신 루프

```typescript
// Bad: O(n log n)
const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt)
return sorted[0]

// Good: O(n)
let latest = projects[0]
for (const p of projects) {
  if (p.updatedAt > latest.updatedAt) latest = p
}
return latest
```

---

## 8. 고급 패턴 (LOW)

### 8.1 앱 초기화는 한 번만

```tsx
let didInit = false

function App() {
  useEffect(() => {
    if (didInit) return
    didInit = true
    initializeApp()
  }, [])
}
```

### 8.2 useEffectEvent로 안정적 콜백

```tsx
import { useEffectEvent } from 'react'

function useWindowEvent(event: string, handler: (e) => void) {
  const onEvent = useEffectEvent(handler)

  useEffect(() => {
    window.addEventListener(event, onEvent)
    return () => window.removeEventListener(event, onEvent)
  }, [event])
}
```

---

## References

- [React 공식 문서](https://react.dev)
- [Next.js 공식 문서](https://nextjs.org)
- [SWR](https://swr.vercel.app)
- [Vercel 블로그 - 패키지 임포트 최적화](https://vercel.com/blog/how-we-optimized-package-imports-in-next-js)
