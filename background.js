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