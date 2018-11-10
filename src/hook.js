(function() {
  const tabStorage = {};
  const networkFilters = {
      urls: [
          "https://learning-modules.mit.edu/plus",
          "*://plus.mit.edu/*"
      ]
  };

  chrome.webRequest.onBeforeRequest.addListener((details) => {
      console.log("req");
      return {redirectUrl: chrome.extension.getURL("src/html/main.html")};
  }, networkFilters, ['blocking']);
}());
