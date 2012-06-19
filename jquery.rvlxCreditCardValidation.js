/**
 * Summary: Credit Card Validation Plugin
 *
 * Developer: Mark Terpstra
 *
 */
(function($) {

  // The expressions are currently not configurable.  This could overwhelm the user to have to understand
  // regular expressions to validate card types.
  var expressions =
  {
    'visa'      : /^4[0-9]{12}(?:[0-9]{3})?$/,
    'mastercard': /^5[1-5][0-9]{14}$/,
    'amex'      : /^3[47][0-9]{13}$/,
    'diners'    : /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
    'discover'  : /^6(?:011|5[0-9]{2})[0-9]{12}$/,
    'jcb'       : /^(?:2131|1800|35\d{3})\d{11}$/
  };

  // These are the default configuration settings.  They will be merged with any custom settings
  // and stored at the element level itself.
  var config =
  {
    'visa'        : {'css'        : 'visa',
                     'active'     : true,
                     'onSuccess'  : null,
                     'onFailure'  : null
                    },
    'mastercard'  : {'css'        : 'mastercard',
                     'active'     : true,
                     'onSuccess'  : null,
                     'onFailure'  : null
                    },
    'amex'        : {'css'        : 'amex',
                     'active'     : false,
                     'onSuccess'  : null,
                     'onFailure'  : null
                    },
    'diners'      : {'css'        : 'diners',
                     'active'     : false,
                     'onSuccess'  : null,
                     'onFailure'  : null
                    },
    'discover'    : {'css'        : 'discover',
                     'active'     : false,
                     'onSuccess'  : null,
                     'onFailure'  : null
                    },
    'jcb'         : {'css'        : 'jcb',
                     'active'     : false,
                     'onSuccess'  : null,
                     'onFailure'  : null
                    }
  };

  $.fn.validateCreditCard = function(settings) {

    // Sanitize the arguments passed from the caller.
    settings = $.isPlainObject(settings) ? settings : {};


    // Remove any existing bindings to the Revelex credit card validation plugin.
    this.unbind('change.rvlxCreditCardValidation keyup.rvlxCreditCardValidation');

    // Store a distinct configuration at the element level so we can change them later.
    this.each(function(){
      $(this).data('rvlxCreditCardValidationConfig', $.extend(true, {}, config, settings));
    });

     // Bind this functionality to both the change and key up events.
    this.bind('change.rvlxCreditCardValidation keyup.rvlxCreditCardValidation', _handler);

    /**
    * This function is the base Luhn Algorithm.  This function is designed to
    * take any number as input and check if it is a valid Luhn (mod 10) number.
    * There should be no credit card specific code in this function.  No length
    * checks, etc...  Luhn numbers can be used for many other applications such
    * as validating an account number.
    *
    * @param  str Numeric String
    *
    * @return True if the number is valid.
    *         False if the number is invalid.
    */
    function _isLuhn(str)
    {
      var total = 0;

      for (var i=0; i < str.length; i+=1)
      {
        multiplier = (i % 2) ? 2 : 1;
        ch = multiplier * parseInt(str.charAt(str.length - i - 1));
        t1 = (ch % 10);
        t2 = (ch - t1) / 10;
        total += t1 + t2;
      }

      return (!total || (total % 10)) ? false : true;
    }


    /**
     * This is the single handler to validate the credit card input.  Choosing to stay away from embedded functions
     * to avoid repetitive code bound to multiple elements.
     */
    function _handler()
    {
      var obj = $(this),
          str = obj.val(),
          result_selector = obj.data('result'),
          result_target = (result_selector) ? $(result_selector) : obj,
          is_numeric = /^\d+$/.test(str),
          is_luhn = _isLuhn(str),
          element_config  = obj.data('rvlxCreditCardValidationConfig'),
          match = '',
          remove_classes = '';

      console.log(element_config);

      for (var key in element_config)
      {
        // Add the classes to remove to a string so we only have to call remove class once.
        remove_classes += ' ' + element_config[key]['css'];

        if (is_numeric && is_luhn && element_config[key]['active'] && expressions[key].test(str))
        {
          match = key;
        }
      }
      result_target.removeClass(remove_classes);

      if (match.length)
      {
        // Apply the css for the matching card type.
        result_target.addClass(element_config[match]['css']);

        // Call the card type specific callback.  Keep in mind the scope of how this callback is used.  In this case
        // allow the scope to be the resulting element.  This is not neccessilly the input box.
        if (element_config[match]['onSuccess'])
        {
          element_config[match]['onSuccess'].call(result_target, element_config);
        }

        // @todo: Add a "overall" successful custom event.  Raise that custom event here.
      }

      // @todo: An overall failure status may be useful as well.
    }

    // Return the collection to be used for chaining.
    return this;
  };
})(jQuery);
