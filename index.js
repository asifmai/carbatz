const puppeteer = require('puppeteer');
const fs = require('fs');
const chromiumPath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"

runBot()

function runBot() {
  return new Promise(async (resolve, reject) => {

    // Create a new Folder with name as current date and time
    let count = 0;
    const dt = new Date();
    const dtString = `${dt.getDate()}${dt.getMonth()}${dt.getFullYear()}${dt.getHours()}${dt.getMinutes()}${dt.getSeconds()}`;
    fs.mkdirSync(dtString)

    // Load Chromium Browser - for background working use headless: true
    const browser = await puppeteer.launch({ headless: false, executablePath: chromiumPath });
    
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
      const data = rawData.replace(/[]/g, '');
      count++;
      const filePath = `${dtString}/${count.toString()}.txt`
      fs.writeFileSync(filePath, data);
    })

    // Goto stats page
    await page.goto('https://www.bet365.com/#/IP/', { timeout: 0, waitUntil: 'load' });
  });
}