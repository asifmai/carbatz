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

      // Get required data from raw Data
      const regex = /(?<=\|).+?(?=\|)/gi
      const res = regex.exec(rawData)
      if (res != null) {

        // Check if the message is desired
        if (isDesired(res[0])) {

          // Convert to JS Object and Save to Current Date folder
          count++;
          const filePath = `${dtString}/${count.toString()}.json`
          fs.writeFileSync(filePath, JSON.stringify(convertoObject(res[0])));
        }
      }      
    })

    // Goto stats page
    await page.goto('https://www.bet365.com/#/IP/', { timeout: 0, waitUntil: 'load' });
  });
}

function isDesired(val) {
    const desiredKeywords = ["CT","CL","EV","MA","PA"];
    for (let i = 0; i < desiredKeywords.length; i++) {
      if (val.startsWith(desiredKeywords[i])) {
        return true;
      }
    }
    return false;
}

function convertoObject(val) {
  let obj = {};
  let raw = val.split(';');
  obj.type = raw[0];
  for (let a = 1; a < raw.length - 1; a++) {
    const c = raw[a].split('=');
    obj[c[0]] = c[1]
  }
  return obj;
}