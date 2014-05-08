/**
 * @file views_load_more.js
 *
 * Handles the AJAX pager for the view_load_more plugin.
 */
(function ($) {

  /**
   * Provide a series of commands that the server can request the client perform.
   */
  Drupal.ajax.prototype.commands.viewsLoadMoreAppend = function (ajax, response, status) {
    // Get information from the response. If it is not there, default to
    // our presets.
    var wrapper = response.selector ? $(response.selector) : $(ajax.wrapper);
    var method = response.method || ajax.method;
    var effect = ajax.getEffect(response);

    // We don't know what response.data contains: it might be a string of text
    // without HTML, so don't rely on jQuery correctly iterpreting
    // $(response.data) as new HTML rather than a CSS selector. Also, if
    // response.data contains top-level text nodes, they get lost with either
    // $(response.data) or $('<div></div>').replaceWith(response.data).
    var new_content_wrapped = $('<div></div>').html(response.data);
    var new_content = new_content_wrapped.contents();

    // For legacy reasons, the effects processing code assumes that new_content
    // consists of a single top-level element. Also, it has not been
    // sufficiently tested whether attachBehaviors() can be successfully called
    // with a context object that includes top-level text nodes. However, to
    // give developers full control of the HTML appearing in the page, and to
    // enable Ajax content to be inserted in places where DIV elements are not
    // allowed (e.g., within TABLE, TR, and SPAN parents), we check if the new
    // content satisfies the requirement of a single top-level element, and
    // only use the container DIV created above when it doesn't. For more
    // information, please see http://drupal.org/node/736066.
    if (new_content.length != 1 || new_content.get(0).nodeType != 1) {
      new_content = new_content_wrapped;
    }
    // If removing content from the wrapper, detach behaviors first.
    var settings = response.settings || ajax.settings || Drupal.settings;
    Drupal.detachBehaviors(wrapper, settings);
    if ($.waypoints != undefined) {
      $.waypoints('refresh');
    }

    // Set up our default query options. This is for advance users that might
    // change there views layout classes. This allows them to write there own
    // jquery selector to replace the content with.
    var content_query = response.options.content || '.view-content';

    // If we're using any effects. Hide the new content before adding it to the DOM.
    if (effect.showEffect != 'show') {
      new_content.find(content_query).children().hide();
    }

    // Add the new content to the page.
    wrapper.find('.pager a').remove();
    wrapper.find('.pager').parent('.item-list').html(new_content.find('.pager'));
    wrapper.find(content_query)[method](new_content.find(content_query).children());
    if (effect.showEffect != 'show') {
      wrapper.find(content_query).children(':not(:visible)')[effect.showEffect](effect.showSpeed);
    }

    // Additional processing over new content
    wrapper.trigger('views_load_more.new_content', new_content.clone());

    // Attach all JavaScript behaviors to the new content
    // Remove the Jquery once Class, TODO: There needs to be a better
    // way of doing this, look at .removeOnce() :-/
    var classes = wrapper.attr('class');
    var onceClass = classes.match(/jquery-once-[0-9]*-[a-z]*/);
    wrapper.removeClass(onceClass[0]);
    var settings = response.settings || ajax.settings || Drupal.settings;
    Drupal.attachBehaviors(wrapper, settings);
  }

  /**
   * Attaches the AJAX behavior to Views Load More waypoint support.
   */
  Drupal.behaviors.ViewsLoadMore = {
    attach: function (context, settings) {
      if (settings && settings.viewsLoadMore && settings.views.ajaxViews) {
        opts = {
          offset: '100%'
        };
        $.each(settings.viewsLoadMore, function(i, setting) {
          var view = '.view-id-' + setting.view_name + '.view-display-id-' + setting.view_display_id + ' .pager-next a';
          $(view).waypoint(function(event, direction) {
            $(view).waypoint('remove');
            $(view).click();
          }, opts);
        });
      }
    },
    detach: function (context, settings, trigger) {
      if (settings && Drupal.settings.viewsLoadMore && settings.views.ajaxViews) {
        $.each(settings.viewsLoadMore, function(i, setting) {
          var view = '.view-id-' + setting.view_name + '.view-display-id-' + setting.view_display_id + ' .pager-next a';
          $(view, context).waypoint('destroy');
        });
      }
    }
     };
})(jQuery);
;
/**
 * @file
 * Processes the FullCalendar options and passes them to the integration.
 */

(function ($) {

Drupal.fullcalendar.plugins.fullcalendar = {
  options: function (fullcalendar, settings) {
    if (settings.ajax) {
      fullcalendar.submitInit(settings);
    }

    var options = {
      eventClick: function (calEvent, jsEvent, view) {
        if (settings.sameWindow) {
          window.open(calEvent.url, '_self');
        }
        else {
          window.open(calEvent.url);
        }
        return false;
      },
      drop: function (date, allDay, jsEvent, ui) {
        for (var $plugin in Drupal.fullcalendar.plugins) {
          if (Drupal.fullcalendar.plugins.hasOwnProperty($plugin) && $.isFunction(Drupal.fullcalendar.plugins[$plugin].drop)) {
            try {
              Drupal.fullcalendar.plugins[$plugin].drop(date, allDay, jsEvent, ui, this, fullcalendar);
            }
            catch (exception) {
              alert(exception);
            }
          }
        }
      },
      events: function (start, end, callback) {
        // Fetch new items from Views if possible.
        if (settings.ajax && settings.fullcalendar_fields) {
          fullcalendar.dateChange(settings.fullcalendar_fields);
          if (fullcalendar.navigate) {
            if (!fullcalendar.refetch) {
              fullcalendar.fetchEvents();
            }
            fullcalendar.refetch = false;
          }
        }

        fullcalendar.parseEvents(callback);

        if (!fullcalendar.navigate) {
          // Add events from Google Calendar feeds.
          for (var entry in settings.gcal) {
            if (settings.gcal.hasOwnProperty(entry)) {
              fullcalendar.$calendar.find('.fullcalendar').fullCalendar('addEventSource',
                $.fullCalendar.gcalFeed(settings.gcal[entry][0], settings.gcal[entry][1])
              );
            }
          }
        }

        // Set navigate to true which means we've starting clicking on
        // next and previous buttons if we re-enter here again.
        fullcalendar.navigate = true;
      },
      eventDrop: function (event, dayDelta, minuteDelta, allDay, revertFunc) {
        $.post(
          Drupal.settings.basePath + 'fullcalendar/ajax/update/drop/' + event.eid,
          'field=' + event.field + '&entity_type=' + event.entity_type + '&index=' + event.index + '&day_delta=' + dayDelta + '&minute_delta=' + minuteDelta + '&all_day=' + allDay + '&dom_id=' + event.dom_id,
          fullcalendar.update
        );
        return false;
      },
      eventResize: function (event, dayDelta, minuteDelta, revertFunc) {
        $.post(
          Drupal.settings.basePath + 'fullcalendar/ajax/update/resize/' + event.eid,
          'field=' + event.field + '&entity_type=' + event.entity_type + '&index=' + event.index + '&day_delta=' + dayDelta + '&minute_delta=' + minuteDelta + '&dom_id=' + event.dom_id,
          fullcalendar.update
        );
        return false;
      }
    };

    // Merge in our settings.
    $.extend(options, settings.fullcalendar);

    // Pull in overrides from URL.
    if (settings.date) {
      $.extend(options, settings.date);
    }

    return options;
  }
};

}(jQuery));
;
(function($) {

Drupal.fullcalendar.plugins.colorbox = {
  options: function (fullcalendar, settings) {
    if (!settings.colorbox) {
      return;
    }
    settings = settings.colorbox;

    var options = {
      eventClick: function(calEvent, jsEvent, view) {
        // Use colorbox only for events based on entities
        if (calEvent.eid !== undefined) {
          // Open in colorbox if exists, else open in new window.
          if ($.colorbox) {
            var url = calEvent.url;
            if (settings.colorboxClass !== '') {
              url += ' ' + settings.colorboxClass;
            }
            $.colorbox({
              href: url,
              width: settings.colorboxWidth,
              height: settings.colorboxHeight,
              iframe: settings.colorboxIFrame === 1 ? true : false
            });
          }
        }
        return false;
      }
    };
    return options;
  }
};

}(jQuery));
;
(function($) {

Drupal.fullcalendar.plugins.fullcalendar_options = {
  options: function (fullcalendar, settings) {
    if (!settings.fullcalendar_options) {
      return;
    }
    var options = settings.fullcalendar_options;

    if (options.dayClick) {
      options.dayClick = function (date, allDay, jsEvent, view) {
        // No need to change the view if it's already set.
        if (view == options.dayClickView) {
          return;
        }

        fullcalendar.$calendar.find('.fullcalendar')
          .fullCalendar('gotoDate', date)
          .fullCalendar('changeView', options.dayClickView);
      };
    }
    else {
      delete options.dayClick;
    }

    return options;
  }
};

}(jQuery));
;
/**
 * @file
 * Integrates Views data with the FullCalendar plugin.
 */

(function ($) {

Drupal.behaviors.fullcalendar = {
  attach: function (context, settings) {
    // Process each view and its settings.
    for (var dom_id in settings.fullcalendar) {
      if (settings.fullcalendar.hasOwnProperty(dom_id)) {
        // Create a new fullcalendar object unless one exists.
        if (typeof Drupal.fullcalendar.cache[dom_id] === "undefined") {
          Drupal.fullcalendar.cache[dom_id] = new Drupal.fullcalendar.fullcalendar(dom_id);
        }
      }
    }

    // Trigger a window resize so that calendar will redraw itself.
    $(window).resize();
  }
};

}(jQuery));
;
