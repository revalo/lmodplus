const defaults = {
    "customUploadName": false,
    "showTypes": true,
    "showDueDateHelpers": true,
}

function setSetting(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getSetting(key, defaultValue) {
    if (defaultValue == undefined && defaults[key] != undefined)
        defaultValue  = defaults[key]

    let val = localStorage.getItem(key);
    if (val != undefined && val != "undefined") return JSON.parse(val);
    return defaultValue;
}

Vue.component("settings-component", {
    data: function () {
      return {
          customUploadName: false,
          showTypes: false,
          showDueDateHelpers: true,
      }
    },
    watch: {
        customUploadName: function(a, b) {
            setSetting("customUploadName", a);
        },
        showTypes: function(a, b) {
            setSetting("showTypes", a);
        },
        showDueDateHelpers: function(a, b) {
            setSetting("showDueDateHelpers", a);
        }
    },
    mounted: function() {
        this.customUploadName = getSetting("customUploadName");
        this.showTypes = getSetting("showTypes");
        this.showDueDateHelpers = getSetting("showDueDateHelpers");
    },
    template: '#settings-template'
})
