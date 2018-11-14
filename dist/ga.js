var service = analytics.getService('lmodplus');
var tracker = service.getTracker('UA-5270250-8');

service.getConfig().addCallback(
    function(config) {
      var permitted = localStorage.getItem("track");
      if (permitted == undefined || permitted == "true")
        config.setTrackingPermitted(true);
      else
        config.setTrackingPermitted(false);
});
