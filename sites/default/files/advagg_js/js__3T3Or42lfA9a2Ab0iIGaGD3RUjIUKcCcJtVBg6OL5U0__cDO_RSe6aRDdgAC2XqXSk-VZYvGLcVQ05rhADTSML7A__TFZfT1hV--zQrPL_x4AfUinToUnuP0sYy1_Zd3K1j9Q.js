/**
 * @file
 * Defines the behavior of the toolbar menu toggle button.
 */
(function ($) {

  Drupal.behaviors.toolbarMenuButton = {
    attach: function(context, settings) {
      var $tray = $('#navbar-tray');
      var $button = $('#toolbar-menu-button');
      var $oa_navbar = $('#oa-navbar');
      var $navbar = $('#navbar-bar');

      if ($navbar.length) {
        // move the shortcuts tray to the top of the admin menu tray
        var $shortcuts = $('#navbar-tray--2 .navbar-lining').children();
        if ($shortcuts.length && $tray.length) {
          var $short_tray = $shortcuts.detach();
          $('#navbar-tray .navbar-lining').prepend($short_tray);
        }
      }
      if ($tray.length && $button.length) {
        $button.unbind('click');
        $tray.removeClass('active'); // start closed
        $('body').removeClass('navbar-tray-open');
        $tray.addClass('navbar-tray-vertical'); // use vertical admin menu
        $tray.removeClass('navbar-tray-horizontal');
        $button.click(function(e) {
          $('body').toggleClass('navbar-tray-open');
          $tray.toggleClass('active');

          // When it's stickied, we need to push the tray down.
          if ($oa_navbar.css('position') !== 'static') {
            // Use attr for !important to override radix.
            $tray.attr('style', 'top: ' + $oa_navbar.height() + 'px !important');
          }
          else {
            $tray.attr('style', 'top: 0 !important');
          }
        });
      }
    }
  }

}(jQuery));
;/**/
/**
 * @file
 * Manage spacing for dashboard and navbar tray.
 */

(function ($) {

  Drupal.behaviors.oaDashboard = {
    attach: function(context, settings) {
      var $oa_navbar = $('#oa-navbar');
      var $navbar = $('#navbar-bar');
      var $oa_responsive_navbar = $('#oa-responsive-regions-navbar');

      var $height = 0;
      if ($navbar.length) {
        // if using OA navbar, hide the navbar module's nav bar and remove its offset
        $navbar.hide();
        $navbar.removeAttr('data-offset-top');
      }
      if ($oa_navbar.length) {
        if ($oa_navbar.css('position') !== 'static') {
          $oa_navbar.attr('data-offset-top', '');
          $height = $oa_navbar.height();
        }
        else if ($oa_responsive_navbar.length) {
          $oa_responsive_navbar.attr('data-offset-top', '');
          $height = $oa_responsive_navbar.height();
        }
      }
      if (typeof(Drupal.displace) != "undefined") {
        Drupal.displace();  // recalculate offsets
      }
      else if ($height > 0) {
        // navbar not being used, so just offset the body padding
        $('body').css('padding-top', $height);
      }
    }
  }

}(jQuery));
;/**/
(function($) {

  Drupal.behaviors.oa_toolbar_search = {
    attach: function(context, settings) {
      var $form = $('.toolbar-search form');
      var $search_bar = $form.find('.search-text');
      var $dropdown = $form.find('.dropdown-menu');
      var $dropdown_toggle = $form.find('.dropdown-toggle');

      if ($form.length) {
        $form.submit(function() {
          var term = $search_bar.val();
          var type = $dropdown.find('input:checked').val();
          $form.attr('action', determineSearchPath(term, type, settings.oa_search.space));
        });

        $dropdown.click(function(e) {
          e.stopPropagation();
        });
      }
    }
  };

  Drupal.behaviors.oa_sidebar_search = {
    attach: function(context, settings) {
      $('.pane-oa-sidebar-search form', context).each(function( index ) {
        var $form = $(this);
        var $search_bar = $form.find('.search-text');
        var $options = $form.find('.options');
        var $spaces = $form.find('.form-item-space-select');
        if ($form.length) {
          $form.submit(function() {
            var term = $search_bar.val();
            var type = $options.find('input:checked').val();
            var arg = 0;
            var argtext = '';
            if ($spaces.length) {
              arg = $spaces.find('select').val();
              argtext = $spaces.find('select option:selected').text();
              if (term.length === 0) {
                if ($options.hasClass('solr-search')) {
                  term = ' ';
                }
                else {
                  term = '*';
                }
              }
            }
            $form.attr('action', determineSearchPath(term, type, settings.oa_search.space, arg, argtext));
          });
        }
      });
    }
  };

  function determineSearchPath(term, type, space, arg, argtext) {
    var path =  Drupal.settings.basePath +  'search' + '/' + (type === 'users' ? 'user' : 'node') + '/' + term;
    if (type === 'this_space') {
      // %3A instead of : because of some weird double encoding on the backend.
      path += '?f[0]=' + encodeURIComponent('og_group_ref%3Atitle:' + space);
    }
    else if (arg > 0) {
      if (type === 'users') {
        path += '?f[0]=' + encodeURIComponent('og_user_node:' + arg);
      }
      else {
        path += '?f[0]=' + encodeURIComponent('og_group_ref%3Atitle:' + argtext);
      }
    }
    return path;
  }

})(jQuery);
;/**/
/**
 * @file
 * Manage spacing for banners in oa_appearance.
 */

(function ($) {

  Drupal.behaviors.oaAppearance = {
    attach: function(context, settings) {
      var $oa_navbar = $('#oa-navbar', context);
      var $banner = $('.oa-banner', context);
      if ($oa_navbar.length && $banner.length) {
        var $height = $oa_navbar.height();
        var $width = $oa_navbar.width();
        $delta_height = 0;
        $banner.each( function(index) {
          if (!$(this).hasClass('oa-banner-appeared') &&
              !$(this).hasClass('oa-banner-hidden')) {
            // set the image sizes before image gets loaded
            var $img_width = parseInt($(this).attr('data-width'));
            var $img_height = parseInt($(this).attr('data-height'));
            if ($img_width > 0) {
              // stretched banner image
              var $max_height = document.documentElement.clientHeight / 3;
              var $new_width = $new_height * $img_width / $img_height;
              var $new_height = Math.min( $img_height * $width / $img_width, $max_height);
              if ($(this).parents('#oa-navbar').length) {
                // this image is within the navbar
                $delta_height -= $(this).height();
                $delta_height += $new_height;
              }
              $(this).css('height', $new_height + 'px');
              $(this).css('max-height', $max_height + 'px');
              $(this).addClass('oa-banner-hidden');
              var $image = $('.oa-banner-overlay-img', this);
              if ($image.length) {
                $image.css('width', '100%');
              }
            }
            else {
              // non-stretching banner image
              $(this).addClass('oa-banner-appeared');
            }
          }
        });
        if ($delta_height > 0) {
          var $total_height = $height + $delta_height;
          $('body').css('padding-top', $total_height + 'px');
          if (typeof(Drupal.displace) != "undefined") {
            Drupal.displace();  // recalculate offsets
          }
          else {
            $oa_navbar.height($total_height);
          }
        }
      }
    }
  };

  $(window).load(function() {
    var $oa_navbar = $('#oa-navbar');
    var $image = $('.oa-banner-overlay-img');
    var $banner = $('.oa-banner');
    if ($banner.length) {
      $banner.each( function(index) {
        $(this).css( 'height', 'auto'); // let the banner resize from now on
        $(this).addClass('oa-banner-appeared');
        $(this).removeClass('oa-banner-hidden');
      });
    }
    if (($oa_navbar.length) && (typeof(Drupal.displace) == "undefined")) {
      $height = $oa_navbar.height();
      $('body').css('padding-top', $height + 'px');
    }
    // this is needed to allow bootstrap tour to display correctly
    $(window).trigger('resize');
  });

}(jQuery));
;/**/
(function ($) {

Drupal.behaviors.textarea = {
  attach: function (context, settings) {
    $('.form-textarea-wrapper.resizable', context).once('textarea', function () {
      var staticOffset = null;
      var textarea = $(this).addClass('resizable-textarea').find('textarea');
      var grippie = $('<div class="grippie"></div>').mousedown(startDrag);

      grippie.insertAfter(textarea);

      function startDrag(e) {
        staticOffset = textarea.height() - e.pageY;
        textarea.css('opacity', 0.25);
        $(document).mousemove(performDrag).mouseup(endDrag);
        return false;
      }

      function performDrag(e) {
        textarea.height(Math.max(32, staticOffset + e.pageY) + 'px');
        return false;
      }

      function endDrag(e) {
        $(document).unbind('mousemove', performDrag).unbind('mouseup', endDrag);
        textarea.css('opacity', 1);
      }
    });
  }
};

})(jQuery);
;/**/
window.tinyMCEPreInit = {"base":"\/openatrium\/profiles\/openatrium\/libraries\/tinymce\/jscripts\/tiny_mce","suffix":"","query":""};;/**/
