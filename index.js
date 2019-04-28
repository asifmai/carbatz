const puppeteer = require('puppeteer');
const fs = require('fs');

runBot()

function runBot() {
  return new Promise(async (resolve, reject) => {
    const results = [];

    // Load Chromium Browser - for background working use headless: true
    const browser = await puppeteer.launch({ headless: false });
    
    // Open a new Page
    const page = await browser.newPage();    
    
    // Define Page header so that the website do not know that this is a headless browser
    const headlessUserAgent = await page.evaluate(() => navigator.userAgent);
    const chromeUserAgent = headlessUserAgent.replace('HeadlessChrome', 'Chrome');
    await page.setUserAgent(chromeUserAgent);
    await page.setExtraHTTPHeaders({
      'accept-language': 'en-US,en;q=0.8'
    });

    // Goto homepage because bet365 won't let us go directly to stats page
    await page.goto('https://www.bet365.com/', { timeout: 0, waitUntil: 'load' });

    // Define client and set an event when web socket data is recieved
    const client = page._client;
    client.on('Network.webSocketFrameReceived', ({requestId, timestamp, response}) => {
      const rawData = response.payloadData;

      // Get required data from raw Data
      const regex = /(?<=\|).+?(?=\|)/gi
      const res = regex.exec(rawData)
      if (res != null) {
        results.push(res[0]);
      }
      
      // Save into JSON file
      fs.writeFileSync('results.json', JSON.stringify(results));
    })

    // Goto stats page
    await page.goto('https://www.bet365.com/#/IP/', { timeout: 0, waitUntil: 'load' });
  });
}