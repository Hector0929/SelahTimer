# SelahTimer — 數位靈修筆記空間

具備雲端心跳同步、跨裝置恢復、手動補錄與成長統計的靈修計時器。

## 功能

- ⏱️ **靈修計時器** — 正計時，支援開始/暫停/完成
- 📝 **Markdown 編輯器** — 即時編輯/預覽切換
- ☁️ **雲端心跳同步** — 每 30 秒自動同步至 Firestore
- 🔄 **跨裝置恢復** — 自動偵測並恢復進行中的紀錄
- 📊 **Dashboard** — 連續天數、週/月統計、柱狀圖
- ✏️ **手動補錄** — 自選日期/時間，含衝突檢查
- 🔧 **歷史修改** — 編輯過往紀錄的時長與內容
- 🔐 **Google 登入** — Firebase Auth

## 開始使用

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定 Firebase

複製 `.env.local.example` 為 `.env.local`，填入你的 Firebase 設定：

```bash
cp .env.local.example .env.local
```

### 3. 啟動開發伺服器

```bash
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)

## 技術棧

- **Next.js 15** (App Router)
- **Firebase** (Firestore + Auth)
- **react-markdown**
- **Vanilla CSS** + CSS Modules

## 資料結構

```
devotion_records/{recordId}
├── user_id: string
├── start_time: Timestamp
├── end_time: Timestamp | null
├── total_duration: number (秒)
├── content: string (Markdown)
├── status: "ongoing" | "completed"
├── is_manual: boolean
├── last_synced_at: Timestamp
├── created_at: Timestamp
└── updated_at: Timestamp
```
