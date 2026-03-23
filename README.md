# L&K Agency Transfer Market Analysis Tool

Transfermarkt 기반 이적시장 데이터 수집 및 분석 도구.

## Overview

34개 주요 리그의 선수 데이터를 수집하여 Excel 및 인터랙티브 HTML 대시보드를 생성합니다.

**Track 1: Free Agents** — 현재 계약이 만료된 자유계약(FA) 선수
**Track 2: Contract Expiring** — 2026년 여름 계약 만료 예정 선수 (32세 미만)

## Covered Leagues (34개 리그)

Premier League, Championship, League One, LaLiga, LaLiga2, Bundesliga, 2. Bundesliga, Serie A, Ligue 1, Liga Portugal, Eredivisie, Jupiler Pro League, Süper Lig, K League 1, Saudi Pro League, MLS, Super League (Switzerland), Bundesliga (Austria), Scottish Premiership, Super League 1 (Greece), Série A (Brazil), Torneo Apertura (Argentina), Liga MX, A-League, Premier Liga (Russia), Premier Liga (Ukraine), Ekstraklasa, Chance Liga (Czech Republic), SuperSport HNL (Croatia), Super liga Srbije, Superliga (Denmark), Allsvenskan, Eliteserien, Veikkausliiga, Besta deild (Iceland)

## Project Structure

```
├── scraper/
│   ├── free_agents_scraper.js    # FA 선수 데이터 수집 (브라우저 콘솔용)
│   └── contract_expiry_scraper.js # 계약만료 선수 데이터 수집 (브라우저 콘솔용)
├── generate_files.py              # Excel + HTML 대시보드 생성기
├── browser_file_generator.js      # 브라우저에서 직접 파일 생성 (SheetJS)
├── .gitignore
└── README.md
```

## Usage

### Step 1: 데이터 수집 (Browser Console)

transfermarkt.com에서 브라우저 개발자 도구(F12) 콘솔에 스크립트를 실행합니다.

```javascript
// scraper/free_agents_scraper.js 내용을 콘솔에 붙여넣기
// 수집 완료 후 localStorage에 'fa_data' 키로 저장됨
```

```javascript
// scraper/contract_expiry_scraper.js 내용을 콘솔에 붙여넣기
// 수집 완료 후 localStorage에 'ce_data' 키로 저장됨
```

### Step 2A: 파일 생성 (브라우저 방식)

```javascript
// browser_file_generator.js 내용을 콘솔에 붙여넣기
// Excel(.xlsx) + HTML 대시보드가 자동 다운로드됨
```

### Step 2B: 파일 생성 (Python 방식)

```bash
# JSON 데이터 파일이 필요
python generate_files.py fa_data.json ce_data.json [output_dir]
```

## Output

1. **Excel File** (`LK_Agency_Transfer_Market_Analysis_2026.xlsx`)
   * Sheet 1: Free Agents (자유계약 선수)
   * Sheet 2: Contract Expiring 2026 (계약만료 선수)

2. **HTML Dashboard** (`LK_Agency_Transfer_Dashboard_2026.html`)
   * 인터랙티브 검색/필터/정렬
   * 리그별, 포지션별 필터링
   * 시장가치 기준 정렬
   * 다크테마 UI

## Requirements

**Python 방식:**
```bash
pip install openpyxl
```

**브라우저 방식:**
* Chrome/Edge 등 모던 브라우저
* transfermarkt.com 도메인에서 실행

## Tech Stack

* Python 3 + openpyxl (서버사이드 Excel 생성)
* SheetJS (xlsx v0.18.5, 브라우저사이드 Excel 생성)
* Vanilla JavaScript (스크래핑 + 대시보드)

---

**L&K Agency** | Global Sports Investment & Dealmaking
