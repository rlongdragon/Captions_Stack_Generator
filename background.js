function getVideoScreenshot() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];

    function getVideoScreenshot() {
      v = document.querySelector('video');
      c = document.createElement('canvas');
      c.height = v.videoHeight || parseInt(v.style.height);
      c.width = v.videoWidth || parseInt(v.style.width);
      ctx = c.getContext('2d');
      ctx.drawImage(v, 0, 0);
      c.toDataURL()

      let option = {
        action: "getVideoData",
        videoData: c.toDataURL()
      };

      chrome.runtime.sendMessage(option)
    };

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getVideoScreenshot,

    }).then(() => console.log('擷取關鍵影格'));
  });
}


chrome.commands.onCommand.addListener((command) => {
  console.log(`Command: ${command}`);
  switch (command) {
    case "screenshot":
      getVideoScreenshot();
      break;
  }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  switch (request.action) {
    case "getVideoData":
      // check editor opened
      let isOpen = await (new Promise(async (resolve, reject) => {
        setTimeout(() => {
          resolve(0)
        }, 1000)

        let getRes = await chrome.runtime.sendMessage({ action: "checkEditorOpened" })
        if (getRes) {
          resolve(1)
        }
      }))

      if (isOpen) {
        break
      }
      // open window
      chrome.windows.create({
        url: chrome.runtime.getURL("./popup/editor.html"),
        type: "popup",
        width: 898,
        height: 400,
        focused: true,
      });

      let waitForWindowLoad = await (new Promise(async (resolve, reject) => {
        setTimeout(() => {
          reject(0)
        }, 5000)
        chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
          if (request.action == "editorWindowOnload") {
            resolve(1)
          }
        })
      }))

      if (waitForWindowLoad) {
        chrome.runtime.sendMessage(request)
      }

      break;
  }

});