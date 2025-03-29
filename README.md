# 영수증 자동 분석 및 개인경비청구서 자동화 프로젝트

## 📌 개요

이미지 형태의 영수증을 업로드하면 자동으로 정보를 분석하고, 회사 양식에 맞는 개인경비청구서(Excel)를 완성하는 프로젝트입니다.

- **OCR**: Tesseract.js
- **자연어 처리**: OpenAI GPT (Structured Output)
- **영수증 유형 판단**: 음식점 여부 판단 포함
- **Excel 템플릿 작성 및 출력**: Python + openpyxl
- **백엔드**: FastAPI
- **프론트엔드**: Next.js 14 + Tailwind CSS

---

## 📁 프로젝트 폴더 구조

```
/autoreceipttoexcel
├── /src
│   ├── /components         # 컴포넌트 (e.g. ReceiptCard)
│   ├── /hooks              # 커스텀 훅
│   ├── /utils              # 유틸 함수 (e.g. statusIcon, gptLoadingText)
│   └── page.js             # 메인 UI 페이지
├── /fastapi                # FastAPI 서버
│   └── main.py
├── /assets
│   └── receipt_final.xlsx  # 서버가 사용하는 템플릿 Excel 파일
```

---

## 🖼️ 프론트엔드 주요 기능

### 1. OCR + GPT 분석

- 사용자가 영수증 이미지를 업로드하면 Tesseract.js가 텍스트 추출
- GPT를 통해 의미 있는 필드 추출: `date`, `name`, `leave_time`, `limited_amount`, `is_fnb` 등

### 2. UI에서 결과 수정 가능

- 결과를 폼 형태로 출력하여 사용자가 직접 수정 가능
- 날짜는 캘린더(DatePicker)로 선택 가능
- 음식점으로 판단될 경우 목적에 자동으로 `야근식대`가 입력됨

### 3. 이미지 확대 기능

- 썸네일 이미지를 클릭하면 모달로 크게 보기 가능
- ESC 키 또는 닫기 버튼으로 모달 닫기

### 4. 데이터 정렬 및 서버 전송

- 분석된 영수증 데이터를 `결제일자` 오름차순으로 정렬하여 FastAPI 서버로 전송

### 5. 엑셀 다운로드 버튼

- 프론트에서 서버 응답(blob)을 받아 Excel 자동 다운로드

---

## 🖥️ 백엔드 (FastAPI)

### 목적

- 서버가 Excel 템플릿을 보유 (사용자가 업로드할 필요 없음)
- 프론트에서 받은 이미지들과 분석된 데이터를 기반으로 Excel을 완성
- Excel 파일 내에 영수증 이미지 삽입 및 셀 정보 입력

### Excel 구성

- 시트당 최대 4개의 영수증 내역 삽입
- 이미지 위치 및 데이터 셀:
  - 1번: A4:B17 이미지, B18~B22 데이터
  - 2번: C4:D17 이미지, D18~D22 데이터
  - 3번: A23:B36 이미지, B37~B41 데이터
  - 4번: C23:D36 이미지, D37~D41 데이터

### 주요 API

```python
@app.post("/export")
async def export_to_excel(metadata: str = Form(...), files: List[UploadFile] = File(...)):
    ...
```

### 이미지 삽입 처리

- 이미지 파일을 임시 저장 → `openpyxl.drawing.image.Image` 로 Excel에 삽입
- 크기 조정하여 셀 범위 안에 알맞게 배치

---

## 📤 프론트 → 백엔드 전송 코드 예시

```ts
const metadata = sorted.map((r) => ({ filename: r.filename, ...r.parsed }));
const formData = new FormData();
formData.append("metadata", JSON.stringify(metadata));
sorted.forEach((r) => formData.append("files", r.file));

const res = await fetch("http://localhost:8000/export", {
  method: "POST",
  body: formData,
});

const blob = await res.blob();
const url = window.URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = "개인경비청구내역_완성본.xlsx";
a.click();
```

---

## 💄 UI 및 기술 스택

- **Tailwind CSS**: 다크 모드 대응, 반응형
- **Next.js App Router** 기반 구조
- **모달 확대 기능**: 이미지 클릭 시 확대 보기 지원
- **모바일 대응**: 한 줄에 하나의 입력 폼 정렬

---

## ⚠️ 특이사항 / 고려사항

- Excel 서식 유지가 중요하므로 백엔드에서만 Excel 생성 작업 수행
- 파일명 중복 방지, 결제일자 기준 정렬 처리 필수
- FastAPI는 CORS 허용 설정 필요 (localhost:3000 기준)
- 템플릿 파일은 `assets/receipt_final.xlsx` 경로에 고정 저장

---

## ✅ 향후 발전 방향

- 사용자가 직접 사유 입력 시 추천 사유 리스트
- 프론트에서 서버 상태 확인 및 에러 핸들링 강화
- Excel 업로드 없이 서버 내 템플릿 관리 자동화