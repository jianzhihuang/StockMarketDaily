// ===============================================================
// ===           個人化設定區 (請依需求修改)             ===
// ===============================================================

// 1. 貼上您從 Financial Modeling Prep 網站上取得的 API 金鑰
const FMP_API_KEY = 'your_api_key_here';

// 2. 設定您要接收通知的 Email 地址
const YOUR_EMAIL_ADDRESS = 'YOUR_EMAIL_ADDRESS';

// 3. 設定您要監控的商品清單
const SYMBOLS_TO_TRACK = [
  { ticker: 'SPY', type: 'stock' },
  { ticker: 'QQQ', type: 'stock' },
  { ticker: 'BTCUSD', type: 'crypto' },
  { ticker: 'ETHUSD', type: 'crypto' }
];

// 4. 設定警報觸發的門檻
const DAILY_DROP_PERCENTAGE = -3.0;
const ATH_DROP_PERCENTAGES = [10, 15, 20, 25, 30, 35, 40, 50];

// 5. 馬丁格爾策略模擬參數
const MARTINGALE_TOTAL_CAPITAL = 10000;
const MARTINGALE_INTERVAL_PERCENT = 5;
const MARTINGALE_MULTIPLIER = 1.5;  // 每次加倍的倍數 (例如1.5倍表示每次投入是上次的1.5倍)

// --- ★★★ 策略分化更新：為不同商品類型設定不同層數 ★★★ ---
const MARTINGALE_LEVELS_STOCK = 6;  // 股票/ETF 使用 6 層策略
const MARTINGALE_LEVELS_CRYPTO = 10; // 加密貨幣使用 10 層策略


// ===============================================================
// ===            核心程式碼 (已加入策略分化邏輯)          ===
// ===============================================================

function checkMarketStatus() {
  let reportBlocks_HTML = [];
  let alertMessages_HTML = [];

  const allTickers = SYMBOLS_TO_TRACK.map(asset => asset.ticker).join(',');
  const quotes = getBatchQuotes(allTickers);
  if (!quotes) return;
  
  const quoteMap = quotes.reduce((map, q) => { map[q.symbol] = q; return map; }, {});
  ATH_DROP_PERCENTAGES.sort((a, b) => a - b);

  for (const asset of SYMBOLS_TO_TRACK) {
    const quote = quoteMap[asset.ticker];
    if (!quote) continue;
    
    const currentPrice = quote.price;
    const dailyChange = quote.change;
    const dailyChangePercent = quote.changesPercentage;
    const displayName = asset.name || asset.ticker;

    let block_HTML = `<p><b>📊 ${displayName}</b> | 價格: ${currentPrice.toFixed(2)} | 日漲跌: ${dailyChange.toFixed(2)} (${dailyChangePercent.toFixed(2)}%)`;
    
    if (asset.type === 'stock' || asset.type === 'crypto') {
      const historicalData = getHistoricalData(asset.ticker);
      if (historicalData && historicalData.length > 0) {
        const allTimeHigh = Math.max(...historicalData.map(d => d.high));
        block_HTML += ` | 歷史高點: ${allTimeHigh.toFixed(2)}</p>`;
        
        let targetPriceList = `<p><b>回檔目標價位表 (基於高點 ${allTimeHigh.toFixed(2)}):</b></p><ul>`;
        for (const p of ATH_DROP_PERCENTAGES) {
          const targetPrice = allTimeHigh * (1 - p / 100);
          const diffFromCurrent = ((targetPrice - currentPrice) / currentPrice) * 100;
          targetPriceList += `<li>回檔 ${p}% 價位: ${targetPrice.toFixed(2)} (尚需跌 ${diffFromCurrent.toFixed(2)}%)</li>`;
        }
        targetPriceList += '</ul>';
        block_HTML += targetPriceList;

        // --- ★★★ 策略分化更新：根據商品類型決定要產生的表格層數 ★★★ ---
        let martingaleTable = '';
        if (asset.type === 'stock') {
          martingaleTable = createMartingaleTable_HTML(allTimeHigh, currentPrice, MARTINGALE_LEVELS_STOCK);
        } else if (asset.type === 'crypto') {
          martingaleTable = createMartingaleTable_HTML(allTimeHigh, currentPrice, MARTINGALE_LEVELS_CRYPTO);
        }
        block_HTML += martingaleTable;

        // 警報邏輯
        const athDropPercent = ((allTimeHigh - currentPrice) / allTimeHigh) * 100;
        if (dailyChangePercent <= DAILY_DROP_PERCENTAGE) {
          alertMessages_HTML.push(`<li>❗️ [每日警報] ${displayName} 今日下跌 ${dailyChangePercent.toFixed(2)}% (現價: ${currentPrice.toFixed(2)})，已超過 ${DAILY_DROP_PERCENTAGE}% 門檻。</li>`);
        }
        let triggeredAthLevel = 0;
        for (const p of ATH_DROP_PERCENTAGES) { if (athDropPercent >= p) { triggeredAthLevel = p; } }
        if (triggeredAthLevel > 0) {
          alertMessages_HTML.push(`<li>🔥🔥 [高點回檔] ${displayName} (現價: ${currentPrice.toFixed(2)}) 已從高點回檔 ${athDropPercent.toFixed(2)}%，觸發了 ${triggeredAthLevel}% 的警報！</li>`);
        }
      }
    }
    reportBlocks_HTML.push(block_HTML);
  }

  // 組合郵件
  let finalHtmlBody = `
    <html><body style="font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 14px;">
    <h2>每日市場綜合報告</h2>
    ${reportBlocks_HTML.join('<hr style="border: none; border-top: 1px solid #ccc;">')}
  `;
  let emailSubject;
  if (alertMessages_HTML.length > 0) {
    emailSubject = `【市場警報】${alertMessages_HTML.length}則監控條件已被觸發！`;
    finalHtmlBody += `<h3 style="color: #D32F2F;">--- 觸發的警報 ---</h3><ul>${alertMessages_HTML.join('')}</ul>`;
  } else {
    emailSubject = `【每日市場報告】所有監控項目狀態更新`;
    finalHtmlBody += '<p>--- 今日未觸發任何警報條件 ---</p>';
  }
  finalHtmlBody += '</body></html>';
  sendEmailNotification(emailSubject, finalHtmlBody);
}

/**
 * --- ★★★ 策略分化更新：此函式現在接收 maxLevels 參數，變得更靈活 ★★★ ---
 */
function createMartingaleTable_HTML(ath, currentPrice, maxLevels) {
  let html = `<p><b>馬丁格爾策略模擬 (本金: $${MARTINGALE_TOTAL_CAPITAL.toLocaleString()}, 共 ${maxLevels} 層, ${MARTINGALE_MULTIPLIER}x加倍):</b></p>
              <table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%; max-width: 800px;">
                <tr style="background-color: #f2f2f2; text-align: center;">
                  <th>層數</th><th>觸發價</th><th>加倍倍數</th><th>累積倍數</th><th>本次投入</th><th>累積投入</th><th>累積均價</th><th>狀態</th>
                </tr>`;
  let totalParts = 0;
  for (let i = 0; i < maxLevels; i++) { totalParts += Math.pow(MARTINGALE_MULTIPLIER, i); }
  const baseInvestment = MARTINGALE_TOTAL_CAPITAL / totalParts;
  let cumulativeCost = 0;
  let cumulativeShares = 0;
  for (let i = 0; i < maxLevels; i++) {
    const level = i + 1;
    const dropPercent = level * MARTINGALE_INTERVAL_PERCENT;
    const entryPrice = ath * (1 - dropPercent / 100);
    const cumulativeMultiplier = Math.pow(MARTINGALE_MULTIPLIER, i);
    const stepMultiplier = (i === 0) ? "-" : `${MARTINGALE_MULTIPLIER}x`;
    const investmentThisLevel = baseInvestment * cumulativeMultiplier;
    const sharesToBuy = investmentThisLevel / entryPrice;
    cumulativeCost += investmentThisLevel;
    cumulativeShares += sharesToBuy;
    const averagePrice = cumulativeCost / cumulativeShares;
    const status = (currentPrice <= entryPrice) ? "✅ 已觸發" : "⏳ 未觸發";
    const rowStyle = (currentPrice <= entryPrice) ? ' style="background-color: #E8F5E9;"' : '';
    html += `<tr${rowStyle}>
               <td style="text-align: center;">${level}</td>
               <td style="text-align: right;">${entryPrice.toFixed(2)} (跌${dropPercent.toFixed(1)}%)</td>
               <td style="text-align: center;">${stepMultiplier}</td>
               <td style="text-align: center;">${cumulativeMultiplier.toFixed(2)}x</td>
               <td style="text-align: right;">$${Math.round(investmentThisLevel).toLocaleString()}</td>
               <td style="text-align: right;">$${Math.round(cumulativeCost).toLocaleString()}</td>
               <td style="text-align: right;">${averagePrice.toFixed(2)}</td>
               <td style="text-align: center;">${status}</td>
             </tr>`;
  }
  html += '</table>';
  return html;
}

function getBatchQuotes(symbols) {
  const encodedSymbols = encodeURIComponent(symbols);
  const url = `https://financialmodelingprep.com/api/v3/quote/${encodedSymbols}?apikey=${FMP_API_KEY}`;
  const response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
  if (response.getResponseCode() === 200) { return JSON.parse(response.getContentText()); }
  return null;
}
function getHistoricalData(symbol) {
  const encodedSymbol = encodeURIComponent(symbol);
  const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${encodedSymbol}?apikey=${FMP_API_KEY}`;
  const response = UrlFetchApp.fetch(url, {'muteHttpExceptions': true});
  if (response.getResponseCode() === 200) { return JSON.parse(response.getContentText()).historical; }
  return null;
}
function sendEmailNotification(subject, htmlBody) {
  MailApp.sendEmail({
    to: YOUR_EMAIL_ADDRESS,
    subject: subject,
    htmlBody: htmlBody
  });
  Logger.log('HTML 報告郵件已發送至 ' + YOUR_EMAIL_ADDRESS);
}
