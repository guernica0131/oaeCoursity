Drupal.settings.spotlight_settings = Drupal.settings.spotlight_settings || {};

(function ($) {

 /**
  * Get the total displacement of given region.
  *
  * @param region
  *   Region name. Either "top" or "bottom".
  *
  * @return
  *   The total displacement of given region in pixels.
  */
  if (Drupal.overlay) {
    Drupal.overlay.getDisplacement = function (region) {
      var displacement = 0;
      var lastDisplaced = $('.overlay-displace-' + region + ':last');
      if (lastDisplaced.length) {
        displacement = lastDisplaced.offset().top + lastDisplaced.outerHeight();

        // In modern browsers (including IE9), when box-shadow is defined, use the
        // normal height.
        var cssBoxShadowValue = lastDisplaced.css('box-shadow');
        var boxShadow = (typeof cssBoxShadowValue !== 'undefined' && cssBoxShadowValue !== 'none');
        // In IE8 and below, we use the shadow filter to apply box-shadow styles to
        // the toolbar. It adds some extra height that we need to remove.
        if (!boxShadow && /DXImageTransform\.Microsoft\.Shadow/.test(lastDisplaced.css('filter'))) {
          displacement -= lastDisplaced[0].filters.item('DXImageTransform.Microsoft.Shadow').strength;
          displacement = Math.max(0, displacement);
        }
      }
      return displacement;
    };
  };

 /**
  * Form behavior for Spotlight
  */
 Drupal.behaviors.panopolySpotlight = {
   attach: function (context, settings) {
     if ($('.field-name-field-basic-spotlight-items').length) {
     	var rotation_time = Drupal.settings.spotlight_settings.rotation_time;
       $('.field-name-field-basic-spotlight-items').tabs().tabs("rotate", rotation_time, true);
       // $('.field-name-field-basic-spotlight-items').css('height', $('.field-name-field-basic-spotlight-items').height());
       // $('.field-name-field-basic-spotlight-items').css('overflow', 'hidden');
     }
   }
 }

 /**
  * Create responsive magic for Table Widget
  */
 Drupal.behaviors.panopolyWidgetTables = {
   attach: function (context, settings) {

     $('table.tablefield', context).each(function() {
       var table = $(this); // cache table object.
       var head = table.find('thead th');
       var rows = table.find('tbody tr').clone(); // appending afterwards does not break original table.

       // create new table
       var newtable = $(
         '<table class="mobile-table">' +
         '  <tbody>' +
         '  </tbody>' +
         '</table>'
       );

       // cache tbody where we'll be adding data.
       var newtable_tbody = newtable.find('tbody');

       rows.each(function(i) {
         var cols = $(this).find('td');
         var classname = i % 2 ? 'even' : 'odd';
         cols.each(function(k) {
           var new_tr = $('<tr class="' + classname + '"></tr>').appendTo(newtable_tbody);
           new_tr.append(head.clone().get(k));
           new_tr.append($(this));
         });
       });

       $(this).after(newtable);
     });

   }
 }
})(jQuery);
;/**/
;(function($){
	$.extend( $.ui.tabs.prototype, {
		rotation: null,
		rotationDelay: null,
		continuing: null,
		rotate: function( ms, continuing ) {
			var self = this,
				o = this.options;

			if((ms > 1 || self.rotationDelay === null) && ms !== undefined){//only set rotationDelay if this is the first time through or if not immediately moving on from an unpause
				self.rotationDelay = ms;
			}

			if(continuing !== undefined){
				self.continuing = continuing;
			}

			var rotate = self._rotate || ( self._rotate = function( e ) {
				clearTimeout( self.rotation );
				self.rotation = setTimeout(function() {
					var t = o.active;
					self.option( "active",  ++t < self.anchors.length ? t : 0 );
				}, ms );

				if ( e ) {
					e.stopPropagation();
				}
			});

			var stop = self._unrotate || ( self._unrotate = !continuing
				? function(e) {
					if (e.clientX) { // in case of a true click
						self.rotate(null);
					}
				}
				: function( e ) {
					t = o.active;
					rotate();
				});

			// start rotation
			if ( ms ) {
				this.element.bind( "tabsactivate", rotate );
				this.anchors.bind( o.event + ".tabs", self.pause );
				rotate();
			// stop rotation
			} else {
				clearTimeout( self.rotation );
				this.element.unbind( "tabsactivate", rotate );
				this.anchors.unbind( o.event + ".tabs", self.pause );
				delete this._rotate;
				delete this._unrotate;
			}

			//rotate immediately and then have normal rotation delay
			if(ms === 1){
				//set ms back to what it was originally set to
				ms = self.rotationDelay;
			}

			return this;
		},
		pause: function() {
			var self = this,
				o = this.options;

			self.rotate(0);
		},
		unpause: function(){
			var self = this,
				o = this.options;

			self.rotate(1, self.continuing);
		}
	});
})(jQuery);
;/**/
(function($) {

/**
 * Initialize editor libraries.
 *
 * Some editors need to be initialized before the DOM is fully loaded. The
 * init hook gives them a chance to do so.
 */
Drupal.wysiwygInit = function() {
  // This breaks in Konqueror. Prevent it from running.
  if (/KDE/.test(navigator.vendor)) {
    return;
  }
  jQuery.each(Drupal.wysiwyg.editor.init, function(editor) {
    // Clone, so original settings are not overwritten.
    this(jQuery.extend(true, {}, Drupal.settings.wysiwyg.configs[editor]));
  });
};

/**
 * Attach editors to input formats and target elements (f.e. textareas).
 *
 * This behavior searches for input format selectors and formatting guidelines
 * that have been preprocessed by Wysiwyg API. All CSS classes of those elements
 * with the prefix 'wysiwyg-' are parsed into input format parameters, defining
 * the input format, configured editor, target element id, and variable other
 * properties, which are passed to the attach/detach hooks of the corresponding
 * editor.
 *
 * Furthermore, an "enable/disable rich-text" toggle link is added after the
 * target element to allow users to alter its contents in plain text.
 *
 * This is executed once, while editor attach/detach hooks can be invoked
 * multiple times.
 *
 * @param context
 *   A DOM element, supplied by Drupal.attachBehaviors().
 */
Drupal.behaviors.attachWysiwyg = {
  attach: function (context, settings) {
    // This breaks in Konqueror. Prevent it from running.
    if (/KDE/.test(navigator.vendor)) {
      return;
    }

    $('.wysiwyg', context).once('wysiwyg', function () {
      if (!this.id || typeof Drupal.settings.wysiwyg.triggers[this.id] === 'undefined') {
        return;
      }
      var $this = $(this);
      var params = Drupal.settings.wysiwyg.triggers[this.id];
      for (var format in params) {
        params[format].format = format;
        params[format].trigger = this.id;
        params[format].field = params.field;
      }
      var format = 'format' + this.value;
      // Directly attach this editor, if the input format is enabled or there is
      // only one input format at all.
      if ($this.is(':input')) {
        Drupal.wysiwygAttach(context, params[format]);
      }
      // Attach onChange handlers to input format selector elements.
      if ($this.is('select')) {
        $this.change(function() {
          // If not disabled, detach the current and attach a new editor.
          Drupal.wysiwygDetach(context, params[format]);
          format = 'format' + this.value;
          Drupal.wysiwygAttach(context, params[format]);
        });
      }
      // Detach any editor when the containing form is submitted.
      $('#' + params.field).parents('form').submit(function (event) {
        // Do not detach if the event was cancelled.
        if (event.isDefaultPrevented()) {
          return;
        }
        Drupal.wysiwygDetach(context, params[format], 'serialize');
      });
    });
  },

  detach: function (context, settings, trigger) {
    var wysiwygs;
    // The 'serialize' trigger indicates that we should simply update the
    // underlying element with the new text, without destroying the editor.
    if (trigger == 'serialize') {
      // Removing the wysiwyg-processed class guarantees that the editor will
      // be reattached. Only do this if we're planning to destroy the editor.
      wysiwygs = $('.wysiwyg-processed', context);
    }
    else {
      wysiwygs = $('.wysiwyg', context).removeOnce('wysiwyg');
    }
    wysiwygs.each(function () {
      var params = Drupal.settings.wysiwyg.triggers[this.id];
      Drupal.wysiwygDetach(context, params, trigger);
    });
  }
};

/**
 * Attach an editor to a target element.
 *
 * This tests whether the passed in editor implements the attach hook and
 * invokes it if available. Editor profile settings are cloned first, so they
 * cannot be overridden. After attaching the editor, the toggle link is shown
 * again, except in case we are attaching no editor.
 *
 * @param context
 *   A DOM element, supplied by Drupal.attachBehaviors().
 * @param params
 *   An object containing input format parameters.
 */
Drupal.wysiwygAttach = function(context, params) {
  if (typeof Drupal.wysiwyg.editor.attach[params.editor] == 'function') {
    // (Re-)initialize field instance.
    Drupal.wysiwyg.instances[params.field] = {};
    // Provide all input format parameters to editor instance.
    jQuery.extend(Drupal.wysiwyg.instances[params.field], params);
    // Provide editor callbacks for plugins, if available.
    if (typeof Drupal.wysiwyg.editor.instance[params.editor] == 'object') {
      jQuery.extend(Drupal.wysiwyg.instances[params.field], Drupal.wysiwyg.editor.instance[params.editor]);
    }
    // Store this field id, so (external) plugins can use it.
    // @todo Wrong point in time. Probably can only supported by editors which
    //   support an onFocus() or similar event.
    Drupal.wysiwyg.activeId = params.field;
    // Attach or update toggle link, if enabled.
    if (params.toggle) {
      Drupal.wysiwygAttachToggleLink(context, params);
    }
    // Otherwise, ensure that toggle link is hidden.
    else {
      $('#wysiwyg-toggle-' + params.field).hide();
    }
    // Attach editor, if enabled by default or last state was enabled.
    if (params.status) {
      Drupal.wysiwyg.editor.attach[params.editor](context, params, (Drupal.settings.wysiwyg.configs[params.editor] ? jQuery.extend(true, {}, Drupal.settings.wysiwyg.configs[params.editor][params.format]) : {}));
    }
    // Otherwise, attach default behaviors.
    else {
      Drupal.wysiwyg.editor.attach.none(context, params);
      Drupal.wysiwyg.instances[params.field].editor = 'none';
    }
  }
};

/**
 * Detach all editors from a target element.
 *
 * @param context
 *   A DOM element, supplied by Drupal.attachBehaviors().
 * @param params
 *   An object containing input format parameters.
 * @param trigger
 *   A string describing what is causing the editor to be detached.
 *
 * @see Drupal.detachBehaviors
 */
Drupal.wysiwygDetach = function (context, params, trigger) {
  // Do not attempt to detach an unknown editor instance (Ajax).
  if (typeof Drupal.wysiwyg.instances[params.field] == 'undefined') {
    return;
  }
  trigger = trigger || 'unload';
  var editor = Drupal.wysiwyg.instances[params.field].editor;
  if (jQuery.isFunction(Drupal.wysiwyg.editor.detach[editor])) {
    Drupal.wysiwyg.editor.detach[editor](context, params, trigger);
  }
};

/**
 * Append or update an editor toggle link to a target element.
 *
 * @param context
 *   A DOM element, supplied by Drupal.attachBehaviors().
 * @param params
 *   An object containing input format parameters.
 */
Drupal.wysiwygAttachToggleLink = function(context, params) {
  if (!$('#wysiwyg-toggle-' + params.field).length) {
    var text = document.createTextNode(params.status ? Drupal.settings.wysiwyg.disable : Drupal.settings.wysiwyg.enable);
    var a = document.createElement('a');
    $(a).attr({ id: 'wysiwyg-toggle-' + params.field, href: 'javascript:void(0);' }).append(text);
    var div = document.createElement('div');
    $(div).addClass('wysiwyg-toggle-wrapper').append(a);
    $('#' + params.field).after(div);
  }
  $('#wysiwyg-toggle-' + params.field)
    .html(params.status ? Drupal.settings.wysiwyg.disable : Drupal.settings.wysiwyg.enable).show()
    .unbind('click.wysiwyg', Drupal.wysiwyg.toggleWysiwyg)
    .bind('click.wysiwyg', { params: params, context: context }, Drupal.wysiwyg.toggleWysiwyg);

  // Hide toggle link in case no editor is attached.
  if (params.editor == 'none') {
    $('#wysiwyg-toggle-' + params.field).hide();
  }
};

/**
 * Callback for the Enable/Disable rich editor link.
 */
Drupal.wysiwyg.toggleWysiwyg = function (event) {
  var context = event.data.context;
  var params = event.data.params;
  if (params.status) {
    // Detach current editor.
    params.status = false;
    Drupal.wysiwygDetach(context, params);
    // After disabling the editor, re-attach default behaviors.
    // @todo We HAVE TO invoke Drupal.wysiwygAttach() here.
    Drupal.wysiwyg.editor.attach.none(context, params);
    Drupal.wysiwyg.instances[params.field] = Drupal.wysiwyg.editor.instance.none;
    Drupal.wysiwyg.instances[params.field].editor = 'none';
    Drupal.wysiwyg.instances[params.field].field = params.field;
    $(this).html(Drupal.settings.wysiwyg.enable).blur();
  }
  else {
    // Before enabling the editor, detach default behaviors.
    Drupal.wysiwyg.editor.detach.none(context, params);
    // Attach new editor using parameters of the currently selected input format.
    params = Drupal.settings.wysiwyg.triggers[params.trigger]['format' + $('#' + params.trigger).val()];
    params.status = true;
    Drupal.wysiwygAttach(context, params);
    $(this).html(Drupal.settings.wysiwyg.disable).blur();
  }
}

/**
 * Parse the CSS classes of an input format DOM element into parameters.
 *
 * Syntax for CSS classes is "wysiwyg-name-value".
 *
 * @param element
 *   An input format DOM element containing CSS classes to parse.
 * @param params
 *   (optional) An object containing input format parameters to update.
 */
Drupal.wysiwyg.getParams = function(element, params) {
  var classes = element.className.split(' ');
  var params = params || {};
  for (var i = 0; i < classes.length; i++) {
    if (classes[i].substr(0, 8) == 'wysiwyg-') {
      var parts = classes[i].split('-');
      var value = parts.slice(2).join('-');
      params[parts[1]] = value;
    }
  }
  // Convert format id into string.
  params.format = 'format' + params.format;
  // Convert numeric values.
  params.status = parseInt(params.status, 10);
  params.toggle = parseInt(params.toggle, 10);
  params.resizable = parseInt(params.resizable, 10);
  return params;
};

/**
 * Allow certain editor libraries to initialize before the DOM is loaded.
 */
Drupal.wysiwygInit();

// Respond to CTools detach behaviors event.
$(document).bind('CToolsDetachBehaviors', function(event, context) {
  Drupal.behaviors.attachWysiwyg.detach(context, {}, 'unload');
});

})(jQuery);
;/**/
