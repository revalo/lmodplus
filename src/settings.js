function setSetting(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getSetting(key, defaultValue) {
    let val = localStorage.getItem(key);
    if (val != undefined && val != "undefined") return JSON.parse(val);
    return defaultValue;
}

Vue.component("settings-component", {
    data: function () {
      return {
          customUploadName: false,
          track: true,
      }
    },
    watch: {
        track: function(a, b) {
            setSetting("track", a);
        },
        customUploadName: function(a, b) {
            setSetting("customUploadName", a);
        },
    },
    mounted: function() {
        this.track = getSetting("track", true);
        this.customUploadName = getSetting("customUploadName", false);
    },
    template: '#settings-template'
})
