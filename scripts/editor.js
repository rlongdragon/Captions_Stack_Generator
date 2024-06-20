function updateImgs() {
  let imgs = app.getElementsByClassName("screenshotImg");
  let offset = document.getElementById("offset").value;
  for (let i = 0; i < imgs.length; i++) {
    /**
     * @type {HTMLImageElement} img
     */
    let img = imgs[i];
    img.style.zIndex = 1000 - i;
  }
  document.getElementById("app").style.setProperty("--imageOffset", (216 - offset) + "px");
}

document.getElementById("offset").addEventListener("change", () => {
  document.getElementById("app").style.setProperty("--imageOffset", (216 - document.getElementById("offset").value) + "px");
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "getVideoData":
      let img = document.createElement("img");
      img.className = "screenshotImg";
      img.src = request.videoData;
      document.getElementById("app").appendChild(img);
      updateImgs();
      break;
  }

  sendResponse({ farewell: "thanks for sending! goodbye" });
});

document.getElementById("offset").min = document.getElementById("min-offset").value;
document.getElementById("min-offset").max = document.getElementById("offset").value;
document.getElementById("offset").max = document.getElementById("max-offset").value;
document.getElementById("max-offset").min = document.getElementById("offset").value;

document.getElementById("min-offset").addEventListener("change", () => {
  document.getElementById("offset").min = document.getElementById("min-offset").value;
  document.getElementById("max-offset").max = document.getElementById("offset").value;
  document.getElementById("max-offset").min = document.getElementById("offset").value;
});

document.getElementById("max-offset").addEventListener("change", () => {
  document.getElementById("offset").max = document.getElementById("max-offset").value;
  document.getElementById("min-offset").max = document.getElementById("offset").value;
  document.getElementById("min-offset").min = document.getElementById("offset").value;
});


let canvasBlob;
function generate() {
  html2canvas(document.getElementById("app"), { backgroundColor: null, scale: parseInt(document.getElementById("scale").value) }).then(function (canvas) {
    document.getElementById("preview").innerHTML = "";
    document.getElementById("preview").appendChild(canvas);
    canvas.toBlob(function (blob) {
      canvasBlob = blob;
    });
  });
}
document.getElementById("generate").addEventListener("click", generate);

function copyImg() {
  if (canvasBlob) {
    const item = new ClipboardItem({ "image/png": canvasBlob });
    navigator.clipboard.write([item]).then(function () {
      console.log("Image copied to clipboard");
    }).catch(function (error) {
      console.error("Unable to write to clipboard. Error:", error);
    });
  }
}
document.getElementById("copyImg").addEventListener("click", copyImg);

function downloadImg() {
  if (canvasBlob) {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.href = URL.createObjectURL(canvasBlob);
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();
    a.download = `screenshot_${year}${month}${day}_${hour}${min}${sec}.png`;
    a.click();
    document.body.removeChild(a);
  }
}
document.getElementById("downloadImg").addEventListener("click", downloadImg);


