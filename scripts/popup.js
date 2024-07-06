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

      chrome.runtime.sendMessage(option);
    };

    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: getVideoScreenshot,

    }).then(() => console.log('擷取關鍵影格'));
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

document.getElementById("howToUse").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("./popup/help.html") });
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "getVideoData":
      console.log("getVideoData");
      console.log(request.videoData);
      document.getElementById("screenshotImg").src = request.videoData;
      break;
  }

});