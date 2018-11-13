function getUrlVars(url) {
  var vars = {};
  var parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
  });
  return vars;
}

(function() {
  const tabStorage = {};
  const networkFilters = {
      urls: [
        "*://learning-modules.mit.edu/class/*",
        "*://learning-modules.mit.edu/portal/*",
        "*://learning-modules.mit.edu/materials/*"
      ]
  };

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "setIsOld") {
        localStorage.setItem("old", request.old);
    }
  });

  chrome.webRequest.onBeforeRequest.addListener((details) => {
    let r = false;
    const old = localStorage.getItem("old");

    if (old == undefined) r = true;
    else if (old == "false") r = true;
    else if (old == "true") r = false;

    if (r) {
      if (details.url.indexOf("materials") >= 0) localStorage.setItem("state", "materials");
      if (details.url.indexOf("portal") >= 0) localStorage.setItem("state", "assignments");
      
      var urlParams = getUrlVars(details.url);
      if (urlParams["uuid"] != undefined) {
        return ({redirectUrl: chrome.extension.getURL("src/html/main.html") + "#" + urlParams["uuid"]});
      }
      return ({redirectUrl: chrome.extension.getURL("src/html/main.html")});
    }
  }, networkFilters, ['blocking']);
}());
