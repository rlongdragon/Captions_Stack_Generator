window.onload = () => {
  const option = {
    action: "editorWindowOnload",
  };
  chrome.runtime.sendMessage(option)
}


let activeImg = 0;
let activePosition = [{ x: 0, y: 0 }];

function updateImgs() {
  let imgs = app.getElementsByClassName("screenshotImg");
  let offset = document.getElementById("offset").value;
  for (let i = 0; i < imgs.length; i++) {
    /**
     * @type {HTMLImageElement} img
     */
    let img = imgs[i];
    img.style.zIndex = 1000 - i;

    img.addEventListener("contextmenu", (e) => {
      e.preventDefault();

      let imgs = app.getElementsByClassName("screenshotImg");
      for (let i = 0; i < imgs.length; i++) {
        imgs[i].style.outline = "none";
        imgs[i].style.borderRadius = "0px";
      }

      document.getElementById("setCustomOffset").style.display = "none";

      img.style.outline = "5px solid #2453c2";
      img.style.borderRadius = "5px";
      let contextMenu = document.getElementById("menu");
      contextMenu.style.display = "block";
      contextMenu.style.left = e.clientX + "px";
      if (e.clientY + parseInt((contextMenu.getBoundingClientRect()).height) > window.innerHeight){
        contextMenu.style.top = (window.innerHeight - (contextMenu.getBoundingClientRect()).height) + "px"
      } else {
        contextMenu.style.top = e.clientY + "px";
      }

      activeImg = i;
      activePosition = [{ x: e.clientX, y: e.clientY }];
    });
  }
  document.getElementById("app").style.setProperty("--imageOffset", (216 - offset) + "px");
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "getVideoData":
      let img = document.createElement("img");
      img.className = "screenshotImg";
      img.src = request.videoData;
      document.getElementById("app").appendChild(img);
      updateImgs();
      break;
    case "checkEditorOpened":
      sendResponse(1)
      break
  }

  sendResponse({ farewell: "thanks for sending! goodbye" });
});

document.getElementById("offset").min = document.getElementById("min-offset").value;
document.getElementById("min-offset").max = document.getElementById("offset").value;
document.getElementById("offset").max = document.getElementById("max-offset").value;
document.getElementById("max-offset").min = document.getElementById("offset").value;

document.getElementById("min-offset").addEventListener("input", () => {
  document.getElementById("offset").min = document.getElementById("min-offset").value;
  document.getElementById("max-offset").max = document.getElementById("offset").value;
  document.getElementById("max-offset").min = document.getElementById("offset").value;
});

document.getElementById("max-offset").addEventListener("input", () => {
  document.getElementById("offset").max = document.getElementById("max-offset").value;
  document.getElementById("min-offset").max = document.getElementById("offset").value;
  document.getElementById("min-offset").min = document.getElementById("offset").value;
});

document.getElementById("offset").addEventListener("input", () => {
  document.getElementById("app").style.setProperty("--imageOffset", (216 - document.getElementById("offset").value) + "px");
  document.getElementById("min-offset").max = document.getElementById("offset").value;
  document.getElementById("max-offset").min = document.getElementById("offset").value;
});

let canvasBlob;
async function generate() {
  return (new Promise((resole, reject) => {
    try {
      html2canvas(document.getElementById("app"), { backgroundColor: null, scale: parseInt(document.getElementById("scale").value) }).then(function (canvas) {
        document.getElementById("preview").innerHTML = "";
        document.getElementById("preview").appendChild(canvas);
        canvas.toBlob(function (blob) {
          canvasBlob = blob;
          resole(1)
        });
      });
    } catch {
      reject(0)
    }
  }))
}
document.getElementById("generate").addEventListener("click", generate);

async function copyImg() {
  if (!canvasBlob) {
    console.log(await generate())
  }

  const item = new ClipboardItem({ "image/png": canvasBlob });
  navigator.clipboard.write([item]).then(function () {
    console.log("Image copied to clipboard");
  }).catch(function (error) {
    console.error("Unable to write to clipboard. Error:", error);
  });
}
document.getElementById("copyImg").addEventListener("click", copyImg);

async function downloadImg() {
  if (!canvasBlob) {
    console.log(await generate())
  }

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
document.getElementById("downloadImg").addEventListener("click", downloadImg);

// menu
document.body.addEventListener("click", (e) => {
  if (!(e.target.className.includes("menuArea"))) {
    console.log(e.target.className);
    if (document.getElementById("menu").style.display !== "none") {
      document.getElementById("menu").style.display = "none";

      if (document.getElementById("setCustomOffset").style.display === "none") {
        let app = document.getElementById("app");
        let imgs = app.getElementsByClassName("screenshotImg");
        for (let i = 0; i < imgs.length; i++) {
          imgs[i].style.outline = "none";
          imgs[i].style.borderRadius = "0px";
        }
      }
    } else if (document.getElementById("setCustomOffset").style.display !== "none") {
      document.getElementById("setCustomOffset").style.display = "none";

      let app = document.getElementById("app");
      let imgs = app.getElementsByClassName("screenshotImg");
      for (let i = 0; i < imgs.length; i++) {
        imgs[i].style.outline = "none";
        imgs[i].style.borderRadius = "0px";
      }
    }
  }
});

document.getElementById("upImg").addEventListener("click", () => {
  if (activeImg > 0) {
    let app = document.getElementById("app");
    let imgs = app.children;
    let img = imgs[activeImg];
    let prevImg = imgs[activeImg - 1];
    app.insertBefore(img, prevImg);
    updateImgs();
  }
});
document.getElementById("downImg").addEventListener("click", () => {
  if (activeImg < app.children.length - 1) {
    let app = document.getElementById("app");
    let imgs = app.children;
    let img = imgs[activeImg];
    let nextImg = imgs[activeImg + 1];
    app.insertBefore(nextImg, img);
    updateImgs();
  }
});
document.getElementById("topImg").addEventListener("click", () => {
  if (activeImg > 0) {
    let app = document.getElementById("app");
    let imgs = app.children;
    let img = imgs[activeImg];
    app.insertBefore(img, imgs[0]);
    updateImgs();
  }
});
document.getElementById("bottomImg").addEventListener("click", () => {
  if (activeImg < app.children.length - 1) {
    let app = document.getElementById("app");
    let imgs = app.children;
    let img = imgs[activeImg];
    app.appendChild(img);
    updateImgs();
  }
});

// let lestSetCustomOffsetValue = document.querySelectorAll(".screenshotImg")[activeImg].style.getPropertyValue("--imageOffset");
let lestSetCustomOffsetValue = 48;
document.getElementById("customOffset").addEventListener("click", () => {
  lestSetCustomOffsetValue = document.getElementById("customOffsetValue").value;
  document.getElementById("lastOffsetValue").innerText = lestSetCustomOffsetValue;

  document.getElementById("customOffsetValue").value =
    document.querySelectorAll(".screenshotImg")[activeImg].style.getPropertyValue("--imageOffset")
      ?
      216 - parseInt(document.querySelectorAll(".screenshotImg")[activeImg].style.getPropertyValue("--imageOffset"))
      :
      216 - parseInt(document.getElementById("app").style.getPropertyValue("--imageOffset"));

  let setCustomOffset = document.getElementById("setCustomOffset")
  setCustomOffset.style.left = activePosition[0].x + "px";
  setCustomOffset.style.top = activePosition[0].y + "px";
  setCustomOffset.style.display = "block";
});
document.getElementById("lastOffset").addEventListener("click", () => {
  document.getElementById("customOffsetValue").value = lestSetCustomOffsetValue;
  document.getElementById("customOffsetValue").dispatchEvent(new Event("input"));
});
document.getElementById("showAll").addEventListener("click", () => {
  document.getElementById("customOffsetValue").value = 216;
  document.getElementById("customOffsetValue").dispatchEvent(new Event("input"));
});
document.getElementById("customOffsetValue").addEventListener("input", () => {
  document.querySelectorAll(".screenshotImg")[activeImg].style.setProperty("--imageOffset", (216 - document.getElementById("customOffsetValue").value) + "px");
});
document.getElementById("deleteImg").addEventListener("click", () => {
  let imgs = app.getElementsByClassName("screenshotImg");
  imgs[activeImg].remove();
  updateImgs();
});


let lastScrollTop = 0;
window.addEventListener("scroll", () => {
  let dy = window.scrollY - lastScrollTop;
  console.log(dy);
  let menus = document.getElementsByClassName("menu");
  for (let i = 0; i < menus.length; i++) {
    let menu = menus[i];
    let top = parseInt(menu.style.top);
    menu.style.top = (top - dy) + "px";
  }
  lastScrollTop = window.scrollY;
});
