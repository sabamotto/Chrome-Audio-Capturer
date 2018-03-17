let interval;
let timeLeft;

const t = function(id, param) {
  return chrome.i18n.getMessage(`popup_${id}`, param);
};

const localize = function() {
  document.querySelectorAll("*[id]").forEach((elem) => {
    const localizedText = t(elem.id);
    if (localizedText) elem.innerText = localizedText;
  });
};

const displayStatus = function() { //function to handle the display of time and buttons
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const status = document.getElementById("status");
    const timeRem = document.getElementById("timeRem");
    const startButton = document.getElementById('start');
    const finishButton = document.getElementById('finish');
    const cancelButton = document.getElementById('cancel');
    //CODE TO BLOCK CAPTURE ON YOUTUBE, DO NOT DELETE
    // if(tabs[0].url.toLowerCase().includes("youtube")) {
    //   status.innerHTML = "Capture is disabled on this site due to copyright";
    // } else {
      chrome.runtime.sendMessage({currentTab: tabs[0].id}, (response) => {
        if(response) {
          chrome.storage.sync.get({
            maxTime: 1200000,
            limitRemoved: false
          }, (options) => {
            if(options.maxTime > 1200000) {
              chrome.storage.sync.set({
                maxTime: 1200000
              });
              timeLeft = 1200000 - (Date.now() - response);
            } else {
              timeLeft = options.maxTime - (Date.now() - response);
            }
            status.innerHTML = t("capturing");
            if(options.limitRemoved) {
              timeRem.innerHTML = `${parseTime(Date.now() - response)}`;
              interval = setInterval(() => {
                timeRem.innerHTML = `${parseTime(Date.now() - response)}`;
              });
            } else {
              timeRem.innerHTML = t("remain", [parseTime(timeLeft)]);
              interval = setInterval(() => {
                timeLeft = timeLeft - 1000;
                timeRem.innerHTML = t("remain", [parseTime(timeLeft)]);
              }, 1000);
            }
          });
          finishButton.style.display = "block";
          cancelButton.style.display = "block";
        } else {
          startButton.style.display = "block";
        }
      });
    // }
  });
};

const parseTime = function(time) { //function to display time remaining or time elapsed
  let minutes = Math.floor((time/1000)/60);
  let seconds = Math.floor((time/1000) % 60);
  if (minutes < 10 && minutes >= 0) {
    minutes = '0' + minutes;
  } else if (minutes < 0) {
    minutes = '00';
  }
  if (seconds < 10 && seconds >= 0) {
    seconds = '0' + seconds;
  } else if (seconds < 0) {
    seconds = '00';
  }
  return `${minutes}:${seconds}`;
};

//manipulation of the displayed buttons upon message from background
chrome.runtime.onMessage.addListener((request, sender) => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const status = document.getElementById("status");
    const timeRem = document.getElementById("timeRem");
    const buttons = document.getElementById("buttons");
    const startButton = document.getElementById('start');
    const finishButton = document.getElementById('finish');
    const cancelButton = document.getElementById('cancel');
    if(request.captureStarted && request.captureStarted === tabs[0].id) {
      chrome.storage.sync.get({
        maxTime: 1200000,
        limitRemoved: false
      }, (options) => {
        if(options.maxTime > 1200000) {
          chrome.storage.sync.set({
            maxTime: 1200000
          });
          timeLeft = 1200000 - (Date.now() - request.startTime);
        } else {
          timeLeft = options.maxTime - (Date.now() - request.startTime);
        }
        status.innerHTML = t("capturing");
        if(options.limitRemoved) {
          timeRem.innerHTML = `${parseTime(Date.now() - request.startTime)}`;
          interval = setInterval(() => {
            timeRem.innerHTML = `${parseTime(Date.now() - request.startTime)}`;
          }, 1000);
        } else {
          timeRem.innerHTML = t("remain", [parseTime(timeLeft)]);
          interval = setInterval(() => {
            timeLeft = timeLeft - 1000;
            timeRem.innerHTML = t("remain", [parseTime(timeLeft)]);
          }, 1000);
        }
      });
      finishButton.style.display = "block";
      cancelButton.style.display = "block";
      startButton.style.display = "none";
    } else if(request.captureStopped && request.captureStopped === tabs[0].id) {
      status.innerHTML = "";
      finishButton.style.display = "none";
      cancelButton.style.display = "none";
      startButton.style.display = "block";
      timeRem.innerHTML = "";
      clearInterval(interval);
    }
  });
});


//initial display for popup menu when opened
document.addEventListener('DOMContentLoaded', function() {
  localize();
  displayStatus();

  const startKey = document.getElementById("startKey");
  const stopKey = document.getElementById("stopKey");
  const startButton = document.getElementById('start');
  const finishButton = document.getElementById('finish');
  const cancelButton = document.getElementById('cancel');
  startButton.onclick = () => {chrome.runtime.sendMessage("startCapture")};
  finishButton.onclick = () => {chrome.runtime.sendMessage("stopCapture")};
  cancelButton.onclick = () => {chrome.runtime.sendMessage("cancelCapture")};
  chrome.runtime.getPlatformInfo((info) => {
    if(info.os === "mac") {
      startKey.innerHTML = "&#x21E7;&#x2318;U";
      stopKey.innerHTML = "&#x21E7;&#x2318;X";
    } else {
      startKey.innerHTML = "Ctrl + Shift + S";
      stopKey.innerHTML = "Ctrl + Shift + X";
    }
  })
  const options = document.getElementById("options");
  options.onclick = () => {chrome.runtime.openOptionsPage()};
  const git = document.getElementById("GitHub");
  git.onclick = () => {chrome.tabs.create({url: "https://github.com/arblast/Chrome-Audio-Capturer"})};
});
