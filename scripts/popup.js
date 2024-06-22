document.getElementById("screenshot").addEventListener('click', () => {
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

      console.log((async () => {
        const response = await chrome.runtime.sendMessage(option);
        console.log(response);
      })());
    };

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getVideoScreenshot,

    }).then(() => console.log('Injected a function!'));
  });
});

document.getElementById("popEditor").addEventListener('click', () => {
  chrome.windows.create({
    url: chrome.runtime.getURL("./popup/editor.html"),
    type: "popup",
    width: 898,
    height: 400,
    focused: true,
  });
  window.top = window;
});


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "getVideoData":
      console.log("getVideoData");
      console.log(request.videoData);
      document.getElementById("screenshotImg").src = request.videoData;
      break;
  }

  sendResponse({ farewell: "thanks for sending! goodbye awa" });
});