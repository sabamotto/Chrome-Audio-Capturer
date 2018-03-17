const t = function(id, param) {
  return chrome.i18n.getMessage(`options_${id}`, param);
};

const localize = function() {
  document.querySelectorAll("*[id]").forEach((elem) => {
    const localizedText = t(elem.id);
    if (localizedText) elem.innerText = localizedText;
  });
};

document.addEventListener('DOMContentLoaded', () => {
  localize();

  const quick = document.getElementById('quick');
  const mute = document.getElementById('mute');
  const detection = document.getElementById('detection');
  const maxTime = document.getElementById('maxTime');
  const save = document.getElementById('save');
  const status = document.getElementById('status');
  const mp3Select = document.getElementById('mp3');
  const wavSelect = document.getElementById('wav');
  const quality = document.getElementById("quality");
  const qualityLi = document.getElementById("qualityLi");
  const qualityValue = document.getElementById("qualityValue");
  const limitRemoved = document.getElementById("removeLimit");
  let currentFormat;
  //initial settings
  chrome.storage.sync.get({
    quickMode: false,
    muteTab: false,
    maxTime: 1200000,
    format: "mp3",
    quality: 192,
    limitRemoved: false,
    detection: false
  }, (options) => {
    quick.checked = options.quickMode;
    mute.checked = options.muteTab;
    detection.checked = options.detection;
    limitRemoved.checked = options.limitRemoved;
    maxTime.disabled = options.limitRemoved;
    maxTime.value = options.maxTime/60000;
    currentFormat = options.format;
    if (options.format === "mp3") {
      mp3Select.checked = true;
      qualityLi.style.display = "block";
    } else {
      wavSelect.checked = true;
    }
    if (options.quality === "96") {
      quality.selectedIndex = 0;
    } else if(options.quality === "192") {
      quality.selectedIndex = 1;
    } else {
      quality.selectedIndex = 2;
    }
  });

  const resetStatus = () => {
    status.innerHTML = "";
  };

  mute.onchange = resetStatus;
  
  quick.onchange = resetStatus;

  detection.onchange = resetStatus;

  maxTime.onchange = () => {
    resetStatus();
    if(maxTime.value > 20) {
      maxTime.value = 20;
    } else if (maxTime.value < 1) {
      maxTime.value = 1;
    } else if (isNaN(maxTime.value)) {
      maxTime.value = 20;
    }
  };

  mp3Select.onclick = () => {
    resetStatus();
    currentFormat = "mp3";
    qualityLi.style.display = "block";
  };

  wavSelect.onclick = () => {
    resetStatus();
    currentFormat = "wav";
    qualityLi.style.display = "none";
  };

  quality.onchange = resetStatus;
  quality.oninput = () => {
    qualityValue.innerHTML = `CBR ${quality.value}kbps`;
  };

  limitRemoved.onchange = () => {
    if(limitRemoved.checked) {
      maxTime.disabled = true;
      status.innerHTML = t("warning");
    } else {
      maxTime.disabled = false;
      resetStatus();
    }
  };

  save.onclick = () => {
    chrome.storage.sync.set({
      quickMode: quick.checked,
      muteTab: mute.checked,
      maxTime: maxTime.value*60000,
      format: currentFormat,
      quality: quality.value,
      limitRemoved: limitRemoved.checked,
      detection: detection.checked
    });
    status.innerHTML = t("saved");
  };
});
