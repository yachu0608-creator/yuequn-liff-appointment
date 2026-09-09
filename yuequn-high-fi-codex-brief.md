# 越群汽車 High-fi Implementation Brief for Codex

> 本文件是 High-fi 實作的唯一執行規格。High-fi 是既有 Lo-fi 的視覺升級，不是產品重設、流程重做或架構重建。

## 0. 任務目標

在保留目前最新 Lo-fi、Before archive、既有 UX flow、IA、功能、互動及資料邏輯的前提下，新增一套可獨立瀏覽的越群汽車 High-fi UI。

High-fi 必須同時覆蓋三種介面情境：

1. 主官網：真正的 RWD 網站，支援 Desktop／Tablet／Mobile。
2. LINE 聊天室：外觀與互動語言盡量貼近真實 LINE，不製作越群自有聊天 App。
3. LIFF：採越群 Design System，以手機操作、狀態閱讀與表單完成率為優先。

本次成功不以「畫面變漂亮」為準，而以以下結果為準：

- Lo-fi、Before archive 與 High-fi 可同時獨立存取。
- High-fi 沒有造成 Lo-fi 或 Before 的視覺、行為或資料污染。
- 現有完整流程、資訊架構、功能及資料結果在 High-fi 仍可使用。
- 官網在 Desktop、Tablet、Mobile 皆有明確且可用的 responsive layout。
- LINE、LIFF、官網各自符合其平台邊界。
- 本文件所有驗收項目均有實際檢查證據。

## 1. 硬性規則與來源優先順序

### 1.1 唯一 UX 基礎

目前最新且唯一的 High-fi UX 基礎是：

`http://192.168.0.128:5173/`

開始編碼前，先逐頁檢視目前可用的 Lo-fi，盤點：

- 所有 route／screen／入口與返回路徑
- Website → LIFF → LINE Chat 的邊界與轉場
- IA、頁面順序與內容層級
- CTA、表單欄位、驗證、狀態、提示與結果頁
- 既有 mock data、資料依賴、條件分支與完成狀態
- 目前最新文案，包括歡迎訊息與 Rich Menu

不得只依靠檔名、舊截圖、記憶或 Before 頁面推測現況。若此 URL 無法開啟或無法判斷某頁是否屬於 current Lo-fi，停止相關實作並先提出問題。

### 1.2 固定來源優先順序

發生衝突時，按以下順序判斷：

1. Current Lo-fi：UX flow、IA、功能、互動、資料與最新文案的唯一事實來源。
2. 本文件：High-fi 的視覺、平台邊界、隔離方式與驗收規則。
3. 越群 Design System：視覺 token 與元件規範。
4. 使用者提供的視覺參考：只提供風格方向，不覆蓋產品邏輯。
5. Before archive：只供封存比對，不得作為 High-fi 來源。

### 1.3 不得重設產品

High-fi 階段只做視覺設計、responsive refinement 與不改變語意的 presentation-layer 實作。不得自行：

- 改動、合併、刪除或新增流程步驟
- 重排 IA 或重新定義 Website／LIFF／LINE 的責任
- 改變 CTA 的目的地或互動結果
- 改變表單欄位、驗證、狀態機或資料結構
- 改變既有 mock data、金額、日期、狀態或條件分支
- 以「更合理」為由替換已確認的產品決策

如果視覺實作看似必須改動上述內容，先列出原因、影響與替代方案，取得確認後再動手。

## 2. 執行前必要步驟

### 2.1 安裝 UI/UX plugin

在正式修改 UI 前執行：

```text
/plugin marketplace add nextlevelbuilder/ui-ux-pro-max-skill
/plugin install ui-ux-pro-max@ui-ux-pro-max-skill
```

安裝後可使用該 skill 輔助視覺設計、Design System 與 RWD，但它不能推翻 Current Lo-fi、本文件、既有 UX flow、IA、功能或資料邏輯。若安裝失敗，清楚回報錯誤；不得宣稱已安裝，也不得因而任意更改產品。

### 2.2 建立基準盤點

修改前需記錄：

- Current Lo-fi 的可存取 URL 與主要流程清單
- Before archive 的 route／入口
- 共用 component、style、token、state 與資料模組
- 哪些共用項目若被修改會影響 Lo-fi
- High-fi 預計新增的 route、component、style 與 token 邊界

建議先截取關鍵 Lo-fi 畫面作為回歸比對基準，但不得用 Before archive 代替 Current Lo-fi。

## 3. 版本、Route 與程式隔離

### 3.1 三個版本都必須保留

- Current Lo-fi：原 URL、原 route、原視覺與原行為保持可用。
- Before archive：保持原狀，只供封存與作品集比對。
- High-fi：建立新的獨立 route，例如 `/high-fi`，或依現有架構建立等效的明確入口。

不得覆蓋、搬移、重新導向或用 High-fi 取代原 Lo-fi 首頁。最後必須能在同一次執行中分別開啟 Lo-fi 與 High-fi 並排比較。

### 3.2 避免 shared components 污染 Lo-fi

可以 reuse 純資料、純邏輯或不含外觀的功能，但不能讓 High-fi 的 CSS、tokens、layout、assets 或視覺 variants 影響 Lo-fi。

執行原則：

- 優先建立 High-fi 專用 component variant、theme scope 或 route-level style scope。
- High-fi 樣式必須有明確根節點或命名空間，不使用會外洩的全域 selector。
- 若既有 shared component 的視覺修改會同步改變 Lo-fi，禁止直接修改；建立 High-fi 專用版本。
- 不複製整套商業邏輯製造兩份難以同步的 state machine；視覺層隔離，資料與純邏輯可在安全時共用。
- 不進行與 High-fi 無關的 refactor、格式化、依賴升級或架構重建。

### 3.3 回歸保護

完成後對相同 Lo-fi route 與關鍵操作重新驗證，確認：

- URL 與導覽仍可用
- 畫面外觀沒有 High-fi 樣式滲入
- 操作結果、表單、狀態及資料不變
- Before archive 未被修改

## 4. 越群汽車 Design System

### 4.1 設計原則

採用 Nike-style 的系統原則，但必須轉譯成越群汽車，而不是仿製 Nike 視覺或電商版型。

保留：

- 強而清楚的攝影主導 Hero
- 中性色主導的 restrained chrome
- 扁平、少裝飾、少陰影
- pill CTA 與清楚的操作層級
- 8px-base spacing system
- 乾淨、規律、模組化的版面
- 內容與影像提供情緒，UI 保持克制

移除或避免：

- Nike Logo、品牌識別或可辨識的直接仿作
- 96px 超大型全大寫運動 campaign 語言
- PLP／PDP、商品 swatch、促銷價等電商語彙
- 潮流運動品牌、豪華冷感、過度科技或卡通化風格
- 裝飾性漸層、玻璃擬態、厚重陰影與浮誇動效

目標感受：專業、可信、清楚、有力量、務實、容易行動，讓使用者一眼理解這是汽車維修與保養服務。

### 4.2 色彩 Tokens

以下為預設建議；若專案已有已確認的越群品牌色，使用既有品牌色並保持相同語意層級，不得另創第二套紅色系統。

| Token | 建議值 | 用途 |
|---|---:|---|
| `brand-primary` | `#C91F28` | 主要 CTA、active、品牌重點 |
| `brand-primary-deep` | `#991820` | pressed／深色重點，不作大面積底色 |
| `brand-primary-soft` | `#F8E9EA` | 柔和品牌提示、選取背景 |
| `ink` | `#151515` | 主標、主文字 |
| `charcoal` | `#3D3D3D` | 內文與次要標題 |
| `muted` | `#6F6F6F` | 輔助資訊 |
| `canvas` | `#FFFFFF` | 主背景 |
| `soft-gray` | `#F5F5F5` | 區塊、輸入背景、低層級容器 |
| `hairline` | `#D9D9D9` | 邊線、分隔線 |
| `on-primary` | `#FFFFFF` | 紅色 CTA 上文字 |

規則：

- 白、淺灰、黑／深灰承載大部分介面；紅色用於品牌識別、主操作與關鍵狀態。
- 不使用整頁大面積紅底，不把所有 icon、標題與卡片都染紅。
- 語意色（成功、警告、錯誤、資訊）維持可辨識語意，不全部改為品牌紅。
- 文字與互動控制需符合 WCAG 2.1 AA 對比；不可只靠顏色傳達狀態。

### 4.3 Typography

所有越群自有 UI 的中文以 `Noto Sans TC` 為第一字體，搭配合適的 sans-serif fallback。LINE 系統 chrome 則以貼近該平台的系統字體呈現，不以品牌字體破壞 LINE 真實感。

| 用途 | Desktop | Tablet | Mobile | Weight / line-height |
|---|---:|---:|---:|---|
| Hero | 56–64px | 44–52px | 36–40px | 700 / 1.15 |
| H1 | 40–48px | 36–40px | 30–34px | 700 / 1.2 |
| H2 | 32px | 28–32px | 26–28px | 700 / 1.25 |
| H3 | 24px | 22–24px | 20–22px | 600 / 1.35 |
| Body | 16px | 16px | 16px | 400 / 1.6 |
| Body Strong | 16px | 16px | 16px | 500–600 / 1.5 |
| Button | 16px | 16px | 16px | 600 / 1.5 |
| Caption | 14px | 14px | 14px | 400–500 / 1.5 |
| Small | 12px | 12px | 12px | 400 / 1.5 |

不得為了「像 Nike」而使用全大寫英文、壓縮中文行高或讓 Hero 文字遮擋重要照片內容。

### 4.4 Spacing、形狀與深度

- 採 8px 基準：`4 / 8 / 16 / 24 / 32 / 48 / 64 / 80`。
- 元件內距、欄距、section rhythm 使用上述階梯，避免零散魔術數字。
- 主要 CTA 採 pill：建議高度 48px、水平 padding 24–32px、`border-radius: 9999px`。
- Input／Select／Textarea 建議 12–16px 圓角，不必全部做成 pill。
- 資訊卡可用 12–20px 圓角，但避免滿頁浮動卡片。
- 以 border、surface contrast、留白及攝影創造層次；預設無陰影，必要時只用非常輕的單層陰影。
- Focus-visible 必須清楚，不得以移除 outline 取代設計。

## 5. 主官網：網站，不是 App

### 5.1 硬性定位

主官網是 responsive website，不是 App、手機 App 外框或只把手機版放大的 landing page。保留 Current Lo-fi 的實際 IA、區塊、CTA 與內容；下列只規範其視覺與 RWD 行為，不授權增刪區塊。

### 5.2 Hero

- 使用「技師正在維修、保養或檢查車輛」的真實情境照。
- 可見技師、打開的引擎蓋、檢查動作、工具或維修廠環境，讓服務類型立即可辨識。
- 避免單純展示車輛、租車商品圖、車輛販售感、過度擺拍或卡通插畫。
- 參考現代紅白汽車服務網站的乾淨、明亮、可信語言，但不照抄版型或品牌資產。
- 文字與 CTA 必須在各裁切比例保持可讀，不遮住技師臉部、手部或關鍵維修動作。
- 圖片需設定合適 `srcset`／尺寸策略、避免 layout shift，並提供有意義的 alt text。

### 5.3 RWD Breakpoints 與行為

以下為設計驗證區間；若專案已有 breakpoint，可沿用最接近者，但三種狀態都必須實際檢查。

#### Desktop（建議 `>= 1200px`）

- 使用網站型水平主導覽，保留完整主要入口與清楚的主 CTA。
- 內容使用置中的 max-width container，不讓長文無限制延伸。
- Hero 可採左右雙欄或大幅橫向影像；文字與 CTA 不得漂浮到不可讀區域。
- 多欄區塊可依 Lo-fi 內容使用 3–4 欄；維持一致欄距與卡片高度邏輯。
- Footer 保留完整資訊層級，不做 App 式 bottom navigation。

#### Tablet（建議 `768–1199px`）

- 導覽可縮減為精簡 header／menu，但主要 CTA 必須容易找到。
- 多欄由 Desktop 的 3–4 欄重排為 2 欄，不以縮小字體硬塞。
- Hero 可縮為較緊湊的雙欄或上下排列，依照片主體與文字可讀性選擇。
- Section padding 與圖片比例應重新配置，不只等比例縮小 Desktop。
- 觸控目標最小 44×44px，hover 不能是唯一提示。

#### Mobile（建議 `< 768px`，至少驗證 390px）

- 單欄長頁為主，允許自然捲動；不為塞進一屏而壓縮內容。
- Header 使用 mobile website navigation，不做原生 App top bar／bottom tab bar。
- Hero 重新裁切為適合窄螢幕的比例；標題、說明、CTA 可上下堆疊。
- CTA 在需要時可滿寬，但不得固定遮擋內容、表單或 footer。
- 多欄內容改為單欄；水平 carousel 只在 Current Lo-fi 已有相同行為時使用。
- 所有表單、卡片、圖片、Rich Menu 預覽不得造成水平 overflow。

### 5.4 RWD 共通要求

- 不得用 CSS scale 將 Desktop 等比例縮小。
- 導覽、欄數、順序、間距、圖片裁切、文字尺寸與 CTA 佈局需在 breakpoint 主動重排。
- 內容順序與 IA 保持一致；responsive reorder 不得改變語意或鍵盤閱讀順序。
- 在常見中間寬度不得出現跳版、截字、重疊、孤立 CTA 或不可點擊控制。

## 6. LINE 聊天室

### 6.1 平台邊界

LINE 聊天室需盡量貼近真實 LINE UI 的結構與視覺語言，不建立「看起來像聊天介面」的越群自製 App。

應貼近 LINE 的項目包括：

- 聊天室頂部列、返回、標題與系統控制的層級
- LINE 式聊天背景、左右訊息泡泡、間距、時間與已讀位置
- 系統訊息、日期分隔、輸入區與附加功能的基本語言
- Rich Menu 在聊天情境中的尺寸、分隔、展開／收合與點擊感

越群品牌只應主要出現在：

- 官方帳號名稱／頭像（依現有資產）
- 訊息內容與越群提供的卡片內容
- Rich Menu 圖像與文字
- 進入 LIFF 後的品牌介面

不得：

- 把整個 LINE chrome 改成紅色或套用越群官網 header
- 將聊天室做成 dashboard、客服後台或自有聊天 App
- 使用不存在於 Lo-fi 的聊天功能或假造可用系統能力
- 宣稱是 LINE 的像素級複製或使用未授權的 LINE 品牌資產

本任務不要求額外生成獨立 LINE 畫面素材；若 Current Lo-fi 已包含 LINE 畫面，才針對既有畫面進行 fidelity refinement。

### 6.2 Rich Menu 必改項目

- 第一層 Rich Menu 必須有「真人客服」。
- 移除所有「找小編」文字、按鈕、提示、引導與同義文案。
- 「真人客服」入口必須保持在第一層，不得藏入第二層、更多選單或只放在文字訊息中。
- 點擊後沿用 Current Lo-fi 已確認的目的地與資料邏輯，不自行新增另一套客服流程。

### 6.3 歡迎訊息唯一文案

請更新為以下內容，保留語意、標點與「真人客服」名稱；排版可依聊天泡泡寬度自然換行：

> 您好！👋 歡迎來到越群汽車！
>
> 想預約保養、查看維修進度，或遇到車況問題，都可以從下方選單開始。
>
> 若需要進一步協助，也可以直接點選「真人客服」與服務人員聯繫。

全專案搜尋並確認不再出現「找小編」。

## 7. LIFF

### 7.1 定位

LIFF 是從 LINE 進入的越群品牌服務頁，不是主官網的縮小版，也不是聊天泡泡的延伸。它使用越群 Design System，優先服務手機上的任務完成。

### 7.2 UI 與互動要求

- 以 Current Lo-fi 的 LIFF flow、欄位、步驟、狀態與資料為準。
- 以 390px 為主要驗證寬度，同時檢查較窄與較寬手機。
- 表單 label 永遠可見；placeholder 不取代 label。
- 輸入框、選單、日期／時間、上傳、同意項與 CTA 具清楚 default、focus、filled、error、disabled 狀態。
- 主要 CTA 易於觸及；若 sticky，必須預留 safe area 與內容底部空間，不可遮住欄位或訊息。
- 錯誤訊息靠近對應欄位，明確說明如何修正，並支援鍵盤與讀屏順序。
- 長頁可自然捲動；步驟、返回、取消與完成狀態沿用現有邏輯。
- 開啟鍵盤、錯誤展開、長文案與放大字級時不得重疊或截斷。
- 從 LIFF 進入 LINE Chat 或回到網站的既有邊界不得被品牌化改寫。

## 8. 元件清單與狀態

先從 Current Lo-fi 建立完整 inventory；至少檢查下列類型。只實作現況需要的元件，不因本清單新增功能。

| 類別 | High-fi 要求 | 必查狀態 |
|---|---|---|
| Website Header / Nav | 三種 RWD 佈局、清楚 active 與主要 CTA | default、active、menu open、focus |
| Hero | 維修情境照、可讀文字、RWD crop | desktop、tablet、mobile、image fallback |
| Button | Primary red、neutral secondary、pill CTA | default、hover、focus-visible、pressed、disabled、loading（若既有） |
| Link | 不只靠顏色、鍵盤可辨識 | default、hover、focus、visited（適用時） |
| Input / Select / Textarea | 明確 label、12–16px radius | empty、focus、filled、error、disabled |
| Checkbox / Radio | 觸控區至少 44px、文字可點 | default、selected、focus、disabled、error |
| Card / Service Item | 扁平、border／surface 分層、少陰影 | default、interactive focus、selected（若既有） |
| Status / Alert | 語意色、icon／文字雙重提示 | info、success、warning、error |
| Step / Progress | 對應既有流程，不新增步驟 | current、complete、upcoming、error（若既有） |
| Modal / Drawer | 焦點管理、關閉、背景鎖定 | open、close、keyboard、overflow |
| LINE Message | 平台語言優先，不套官網卡片 | incoming、outgoing、time、read、system |
| Rich Menu | 第一層真人客服、無找小編 | expanded、collapsed、pressed（依既有） |
| LIFF Header / Form | 手機優先、safe area、清楚返回 | default、scroll、keyboard open、validation |
| Footer | 網站式完整資訊、RWD 重排 | desktop、tablet、mobile |

所有 icon 使用同一套簡潔線性或實心規則，搭配可存取文字；不得用 emoji 代替功能 icon（文案中指定的 👋 除外）。

## 9. 可以修改

- High-fi route 內的色彩、字體、字級、字重與視覺 hierarchy
- High-fi 專用 spacing、grid、container、RWD layout 與圖片裁切
- High-fi 專用 component styling、iconography、border、radius 與克制的狀態回饋
- 不改變語意、順序與結果的文字排版與換行
- 符合本文件的維修／檢查車輛 Hero 圖片
- 為隔離 Lo-fi 所需的 High-fi 專用 view、variant、theme 或 scoped stylesheet
- 不影響資料邏輯的 accessibility 補強，如 focus-visible、語意標籤與對比修正

## 10. 不可以修改

- Current Lo-fi 與 Before archive 的 route、視覺、元件或行為
- 目前已確認的 UX flow、IA、功能、頁面／步驟順序與資料邏輯
- CTA 的目的地、LINE／LIFF／Website 邊界及既有轉場
- 表單欄位、必填條件、驗證、狀態機、價格、日期、時間與 mock data
- 未經要求新增、刪除、合併或重命名功能
- 使用 Before archive 或舊截圖覆蓋 Current Lo-fi 決策
- 把官網做成 App、把 LIFF 做成縮小官網、把 LINE 做成自製聊天 App
- 對 shared components 進行會改變 Lo-fi 的全域視覺修改
- 以 plugin 建議為理由推翻本文件或 Current Lo-fi
- 無關的 refactor、套件升級、檔案整理、格式化或技術棧更換

## 11. 建議實作順序

1. 檢視 Current Lo-fi 與 Before route，完成 route／flow／component／data 盤點。
2. 安裝指定 plugin，確認成功；失敗則如實回報。
3. 建立 High-fi 獨立 route 與樣式隔離邊界，先驗證 Lo-fi 未受影響。
4. 建立 High-fi tokens 與最小必要的基礎元件 variants。
5. 依 Current Lo-fi 流程逐頁套用 High-fi，先官網，再 LIFF，最後 LINE fidelity refinement。
6. 套用 Rich Menu「真人客服」與唯一歡迎文案，移除所有「找小編」。
7. 完成 Desktop／Tablet／Mobile RWD 與元件狀態。
8. 進行功能回歸、視覺 QA、accessibility 與 overflow／overlap 檢查。
9. 交付 route、變更摘要、驗證結果及未解風險；不得只回報「完成」。

每一步只做達成目標所需的最小修改。若 Current Lo-fi 與本文件發生產品邏輯衝突，先停下並提出具體差異。

## 12. 驗收標準

### 12.1 版本與隔離

- [ ] `http://192.168.0.128:5173/` 的 Current Lo-fi 原入口仍可獨立開啟。
- [ ] Before archive 原 route 仍可獨立開啟且未被修改。
- [ ] High-fi 有明確、獨立的新 route。
- [ ] 三者可在同一次執行中並排比較。
- [ ] Lo-fi 的畫面與關鍵操作沒有 High-fi CSS、tokens、assets 或 component 變更滲入。
- [ ] High-fi 沒有以 Before archive 為來源恢復舊流程或舊文案。

### 12.2 UX、功能與資料回歸

- [ ] 已列出並走完 Current Lo-fi 的所有主要 route、screen 與分支。
- [ ] Website → LIFF → LINE Chat 的既有邊界與轉場未改變。
- [ ] 所有 CTA 目的地、表單欄位、驗證、狀態與完成結果與 Current Lo-fi 一致。
- [ ] 既有 mock data、金額、日期、時間及條件分支未被擅改。
- [ ] 沒有未經要求的新功能、刪除功能或 IA 重排。

### 12.3 官網 RWD

- [ ] 官網明確呈現為網站，而非 App UI。
- [ ] 至少在 1440px、1024px、768px、390px 檢查完整頁面。
- [ ] Desktop、Tablet、Mobile 的 nav、欄數、spacing、圖片與 CTA 有主動重排，不是等比例縮放。
- [ ] Hero 是技師修車／檢查車輛的情境照，且各尺寸裁切不遮關鍵人物或內容。
- [ ] 無水平 overflow、截字、重疊、跳版、被遮擋控制或不可點擊區域。
- [ ] Mobile 沒有原生 App 式 bottom navigation，除非 Current Lo-fi 明確已有且屬需求。

### 12.4 LINE 與 LIFF

- [ ] LINE 聊天室 chrome、泡泡、時間、輸入區與 Rich Menu 的視覺語言貼近真實 LINE。
- [ ] LINE 聊天室沒有被越群紅色 Design System 全面覆蓋，也不像自製聊天 App。
- [ ] 第一層 Rich Menu 清楚顯示「真人客服」。
- [ ] 全專案搜尋「找小編」結果為 0。
- [ ] 歡迎訊息與本文件指定文案逐字一致（僅允許依泡泡寬度換行）。
- [ ] LIFF 使用越群 Design System，並在 390px 完成所有既有手機流程。
- [ ] LIFF 在鍵盤開啟、驗證訊息展開、長頁及 safe area 情境無遮擋與重疊。

### 12.5 Design System 與可存取性

- [ ] 中文越群 UI 使用 Noto Sans TC；LINE chrome 維持平台感。
- [ ] 白／淺灰／黑中性色承載大部分介面，紅色集中於品牌與主操作。
- [ ] UI 扁平、少陰影、pill CTA、8px spacing，沒有不必要的漸層或浮誇效果。
- [ ] 一般文字及互動控制達 WCAG 2.1 AA 對比。
- [ ] 鍵盤操作、focus-visible、label、error message 與讀屏順序可用。
- [ ] 主要觸控目標至少 44×44px，狀態不只靠顏色表達。

### 12.6 技術與交付

- [ ] 專案既有 build／typecheck／test 全部通過。
- [ ] High-fi 與 Lo-fi 關鍵頁面無 console error 或未處理 warning。
- [ ] 已進行完整頁面截圖或等效視覺檢查，包含 breakpoint 間的中間寬度。
- [ ] 交付內容列出 Lo-fi、Before、High-fi 的實際 URL／route。
- [ ] 交付內容列出修改檔案、隔離策略、驗證項目與任何未解限制。

## 13. 最終回報格式

完成後請用以下結構回報，不要只說「已完成」：

```markdown
## Routes
- Current Lo-fi: ...
- Before archive: ...
- High-fi: ...

## Implemented
- ...

## Lo-fi Isolation
- High-fi styles/components were isolated by: ...
- Lo-fi regression result: ...

## Verification
- Build/typecheck/test: ...
- Viewports checked: ...
- Main flows checked: ...
- Console/overflow/overlap/accessibility: ...

## Known Limitations or Questions
- None / ...
```

