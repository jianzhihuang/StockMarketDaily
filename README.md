# 📈 StockMarketDaily

> 一個基於 Google Apps Script 的自動化股市監控與警報系統，支援股票、ETF、加密貨幣監控，並提供馬丁格爾投資策略模擬。

## ✨ 功能特色

### 🎯 智能監控
- **多資產支援**：股票 (SPY, QQQ)、加密貨幣 (BTCUSD, ETHUSD)
- **雙重警報機制**：每日跌幅警報 + 歷史高點回檔警報  
- **實時數據**：透過 Financial Modeling Prep API 獲取即時市場數據

### 📊 策略模擬
- **馬丁格爾策略**：資金分配模擬
- **差異化配置**：股票 6 層 vs 加密貨幣 10 層策略
- **視覺化報表**：詳細的投資層級表格

### 📧 自動通知
- **HTML 郵件報告**：市場綜合報告
- **智能警報**：只在觸發條件時發送警報
- **每日更新**：定期市場狀態摘要

---

## 🚀 快速開始

### 📋 前置準備

1. **Google 帳戶**：用於 Google Apps Script
2. **Financial Modeling Prep API Key**：[免費註冊](https://financialmodelingprep.com/)

### 📥 安裝步驟

#### 步驟 1：建立 Google Apps Script 專案

1. 前往 [Google Apps Script](https://script.google.com/)
2. 點選「新增專案」
3. 將專案命名為「StockMarketDaily」

<img width="3600" height="1627" alt="image" src="https://github.com/user-attachments/assets/eb80f6b6-bdb1-4617-aa45-a939e55d797e" />


#### 步驟 2：匯入程式碼

1. 刪除預設的 `Code.gs` 內容
2. 複製 `checkMarketStatus.gs` 的完整程式碼
3. 貼上至編輯器中
4. 儲存專案 (Ctrl+S)

<img width="3400" height="1657" alt="image" src="https://github.com/user-attachments/assets/f9b6f6d2-8cf7-49b6-a966-75387bec67e5" />



#### 步驟 3：設定 API 權限

1. 點選編輯器上方的「執行」按鈕
2. 授權應用程式存取權限
3. 依序點選：允許 → 進階 → 前往專案 → 允許

<img width="915" height="618" alt="image" src="https://github.com/user-attachments/assets/3b73f33d-7a01-40e9-b25a-106ce20d1415" />
<img width="1970" height="1802" alt="image" src="https://github.com/user-attachments/assets/1c4724a3-d8eb-4939-aa0d-d93cf20a16ea" />
<img width="2022" height="1836" alt="image" src="https://github.com/user-attachments/assets/354eba27-904d-485b-b4be-83b75516deb0" />
<img width="2022" height="1090" alt="image" src="https://github.com/user-attachments/assets/566d823f-75c3-4bb0-a854-dbbf3644df7d" />
<img width="1422" height="1450" alt="image" src="https://github.com/user-attachments/assets/ee0978dc-85e6-4b2f-b4a2-8afdd7334bf8" />


---

## ⚙️ 個人化設定

### 🔑 API 金鑰設定

```javascript
// 1. 貼上您的 Financial Modeling Prep API 金鑰
const FMP_API_KEY = 'your_api_key_here';
```

**取得 API 金鑰步驟：**
1. 註冊 [Financial Modeling Prep](https://financialmodelingprep.com/) 帳戶
2. 前往控制面板取得免費 API 金鑰
3. 複製金鑰並替換程式碼中的 `'your_api_key_here'`

<img width="3813" height="1695" alt="image" src="https://github.com/user-attachments/assets/a0f772e9-41c2-4623-a150-746b197aa83d" />


### 📧 郵件設定

```javascript
// 2. 設定接收通知的 Email 地址
const YOUR_EMAIL_ADDRESS = 'your.email@example.com';
```

### 📈 監控標的設定

```javascript
// 3. 自訂您要監控的投資標的
const SYMBOLS_TO_TRACK = [
  { ticker: 'SPY', type: 'stock' },     // SPDR S&P 500 ETF
  { ticker: 'QQQ', type: 'stock' },     // Invesco QQQ ETF
  { ticker: 'BTCUSD', type: 'crypto' }, // 比特幣
  { ticker: 'ETHUSD', type: 'crypto' }  // 以太坊
];
```

### 🚨 警報參數調整

```javascript
// 4. 警報觸發條件
const DAILY_DROP_PERCENTAGE = -3.0;                        // 每日跌幅警報門檻
const ATH_DROP_PERCENTAGES = [10, 15, 20, 25, 30, 35, 40, 50]; // 歷史高點回檔警報

// 5. 馬丁格爾策略參數
const MARTINGALE_TOTAL_CAPITAL = 10000;      // 總投資資本
const MARTINGALE_INTERVAL_PERCENT = 5;        // 每層觸發間隔 (%)
const MARTINGALE_MULTIPLIER = 1.5;           // 每層加倍倍數
```

---

## 🔄 自動化執行設定

### ⏰ 定時觸發器設定

1. 在 Google Apps Script 編輯器中，點選左側「觸發器」圖示
2. 點選「新增觸發器」
3. 設定以下參數：
   - **函數**：`checkMarketStatus`
   - **事件來源**：時間驅動
   - **時間觸發器類型**：日期計時器
   - **時間**：建議設定為美股開盤後或收盤 <img width="2358" height="1219" alt="image" src="https://github.com/user-attachments/assets/be8dead3-4a56-4666-8c1f-e1d432219d68" />


<img width="3805" height="1661" alt="image" src="https://github.com/user-attachments/assets/44dccf51-a570-4049-b020-c32bd408f543" />
<img width="1074" height="1229" alt="image" src="https://github.com/user-attachments/assets/58d6398f-c828-40ad-856a-c4a3b45ea762" />


---

## 📊 報告範例

### 📧 郵件報告格式

當系統運作時，您將收到包含以下資訊的 HTML 郵件報告：

- **基本資訊**：當前價格、日漲跌幅、歷史高點
- **回檔目標價位表**：各回檔百分比對應的價位
- **馬丁格爾策略表**：詳細的投資層級模擬
- **警報摘要**：觸發的警報條件列表


<img width="3348" height="1527" alt="image" src="https://github.com/user-attachments/assets/113f6da3-93aa-4cc3-8b0b-265a225d7d88" />

---

## 🛠️ 疑難排解

### ❓ 常見問題

#### Q: 執行時出現「授權錯誤」？
**A:** 確保已完成所有權限授權步驟：
1. 重新執行函數
2. 在彈出視窗中選擇「檢視權限」
3. 依序完成授權流程

#### Q: 收不到郵件通知？
**A:** 檢查以下設定：
1. 確認 Email 地址設定正確
2. 檢查垃圾郵件資料夾
3. 驗證 Gmail 設定允許來自 Apps Script 的郵件

#### Q: API 呼叫失敗？
**A:** 檢查 API 設定：
1. 確認 API 金鑰正確無誤
2. 檢查 API 使用配額是否超限
3. 驗證網路連線狀態

#### Q: 如何修改監控標的？
**A:** 編輯 `SYMBOLS_TO_TRACK` 陣列：
```javascript
// 新增監控標的範例
{ ticker: 'TSLA', type: 'stock' },    // Tesla 股票
{ ticker: 'ADAUSD', type: 'crypto' }  // Cardano 加密貨幣
```

---

## 🔧 技術規格

### 📚 依賴服務
- **Google Apps Script**：執行環境
- **Financial Modeling Prep API**：市場數據來源
- **Gmail API**：郵件發送服務

### 🔌 API 端點
- 即時報價：`/api/v3/quote/{symbols}`
- 歷史數據：`/api/v3/historical-price-full/{symbol}`

### 💾 資料更新頻率
- **即時數據**：每次執行時更新
- **歷史數據**：用於計算歷史高點
- **建議執行頻率**：每日一次 (美股時段)

---

## 📄 授權聲明

此專案使用 Financial Modeling Prep API 提供的市場數據。請確保遵守其[使用條款](https://financialmodelingprep.com/terms-of-service)。

---

## 🤝 貢獻與支援

如有問題或建議，歡迎通過以下方式聯繫：
- 提交 Issue 報告問題
- 提出 Pull Request 貢獻改進
- 分享使用心得與優化建議

---

*最後更新：2025年8月15日*
