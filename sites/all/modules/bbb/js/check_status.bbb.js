(function($) {

    var interval = null;

    Drupal.behaviors.bbbCheckStatusInit = {
        attach: function(context, settings) {
            Drupal.bbbCheckStatus();
            interval = setInterval("Drupal.bbbCheckStatus();", 5000);

        }
    }

    Drupal.bbbCheckStatus = function() {
        var url = bbb_check_status_url;
        //console.log(_this);
        $.getJSON(url, function(data) {
            console.log(data);
            if (data.running == true) {
                clearInterval(interval);
                return location.href = location.href + '/meeting/attend';
            } else {

            }
        });
    }
})(jQuery);