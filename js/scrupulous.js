(function ($) {
  $.fn.scrupulous = function (args) {

    //future homes for options as needed
    var options = {
      beforeSubmit:          null, // pre validation processing
      valid:                 null,  //Pass a valid function through args
      invalid:               null, //Pass an invalid function through args
      namespace :            'scrupulous',
      errorClassName:        'error-message', //class name of the error label
      parentClassName:       'form-group', //class name of the parent element where the error label is appended
      defaultErrorMessage:   'This field has an error', //default error message if no title is provided
      setErrorMessage:       null  // used to set custom HTML5 validationMessage
    };
    
    options.validationTrigger  = 'change.' +  options.namespace + ' keyup.' +  options.namespace; //event to pass for the validation event defaults to when a field changes

    $.extend( options, args );

    var $forms        = this,
        $inputs       = $forms.find('select, input, textarea'),
        emailPattern  = "[^@]+@[^@]+\.[a-zA-Z]{2,6}",
        browser       = {},
        $el,$form,$formGroup,elId,validity,errorMessage;


    //stop everything if checkValidity does not exist, and I'm talking to you <= IE9.
    if(typeof document.createElement( 'input' ).checkValidity != 'function') {
      $forms.on('submit.' + options.namespace, function(e){
        if(options.valid !== null) {
          //e.preventDefault();
          return options.valid.call(this);
        } 
        else {
          return true;
        }

      });
      return false;
      //stop everything else
    }

    //prevent calling scrupulous again.
    if(this.hasClass('scrupulous')) {
      return false;
    }


    $forms.addClass('scrupulous');
    $forms.find('input[type="email"]').attr('pattern',emailPattern);

    $forms.attr('novalidate',true); //set all forms to novalidate to avoid default browser validation

    /*----------------------------------------------
      equalTo(el);
     function that checks if a value is equal to another value
     based on the id value contained in data-equal-to attribue. 
     ----------------------------------------------*/
    var equalTo = function(el,parent){
      var equalToParentId;
      if ( typeof parent !== 'undefined'){
        equalToParentId = parent;
      }
      else {
        equalToParentId = $(el).attr('data-equal-to');
      }
      if($('#' + equalToParentId).length >= 0) {
        // Compare to another input's value
        if (el.value != $('#' + equalToParentId).val()) {
          return false;
        } else {
          return true;
        }
      } else {
        // Plain Object / Primitive evaluation
        if (window.console){
          console.log('No data-equal-to element defined.');
        }
        return (el.value == equalToParentId);
      }
    };


    /*----------------------------------------------
      luhnCheck(el)
      Returns if an inputs value passes the standard 
      luhn check alg
    ----------------------------------------------*/
    var luhnCheck = function(el){

      var number = el.value;
      var
        arr = [0, 2, 4, 6, 8, 1, 3, 5, 7, 9],
        len = number.length,
        bit = 1,
        sum = 0,
        val;
      
      /** no way to validate a masked card, will have to let the backend handle it **/
      if ( number.match(/^[xX*-]+\d{4}$/g) ){
        return true;
      }
      
      while (len) {
        val = parseInt(number.charAt(--len), 10);
        sum += (bit ^= 1) ? arr[val] : val;
      }

      return sum && sum % 10 === 0;

    };


    /*----------------------------------------------
      checkboxValidity(el)
      function to check if any checkboxes/radios 
      are checked then validate that section of 
      the form 
    ----------------------------------------------*/

    var checkboxValidity = function(el){
      var inputName = el.name,
          isChecked = false;
      $('input[name="' + inputName + '"]').each(function(){
        if(this.checked === true){
          isChecked = true;
        }
      });

      if(!isChecked && el.required === true){
        return false;
      }
      else {
        return true;
      }
    };

    /** for browsers that don't support input type = number **/
    var numberTypeValidity = function($el){
      var min,max,step,val=Number($el.val());

      if(!$.isNumeric( $el.val())){
        return false;
      }

      if (typeof $el.attr("max") !== 'undefined') {
        max = Number($el.attr("max"));
        if ( max < val ){
          return false;
        }
      }
      if (typeof $el.attr("min") !== 'undefined') {
        min = Number($el.attr("min"));
        if ( min > val ){
          return false;
        }
      }
      if ( typeof $el.attr("step") !== 'undefined' ){
        step = Number($el.attr("step"));
        if ( val % step !== 0 ){
          return false;
        }
      }
      return true;
    };

    var isNumberField = function($el){
      return $el.is("input") && $el.attr("type") !== 'undefined' && $el.attr("type").toLowerCase() == "number";
    };

    /*----------------------------------------------
      setValid($el)
      function that removes all invalid classes and 
      error labels. 
    ----------------------------------------------*/

    var setValid = function($el) {
      //dont validate on hidden inputs
      if(!$el.is(':hidden')) {
        $el.addClass('valid');
        $el.removeClass('invalid');
        $formGroup = $el.parents('.' + options.parentClassName);
        //let Developer know that form-group does not exist
        if($formGroup.length === 0) {
          //no form group, check and see if we have an input group
          $formGroup =  $el.parents('.input-group');
          if($formGroup.length === 0) {
            /*
            Don't think we need this on valid anymore.
            if(window.console){
              console.log('Warning: Scrupulous needs a .form-group, .input-group or parentClassName element to append errors. id: ' + $el.attr('id'));  
            }*/
            return false;
          }
        }
        $formGroup.addClass('has-success');
        $formGroup.removeClass('has-error');
        $formGroup.find('.' + options.errorClassName).remove();
      }
    };

    /*----------------------------------------------
      setInvalid($el)
      function that addes invalid classes and appends
      error message labels to the parent div. 
    ----------------------------------------------*/
    var setInvalid = function($el) {
      //dont validate on hidden inputs
      if(!$el.is(':hidden')) {
        $el.addClass('invalid');
        $el.removeClass('valid');
        $formGroup =  $el.parents('.' + options.parentClassName);
        //let Developer know that form-group does not exist
        if($formGroup.length === 0) {
          //no form group, check and see if we have an input group
          $formGroup =  $el.parents('.input-group');
          if($formGroup.length === 0) {
            if(window.console){
              console.log('Warning: Scrupulous needs a .form-group, .input-group or parentClassName element to append errors. id: ' + $el.attr('id'));  
            }
            return false;
          }
        }
        $formGroup.addClass('has-error');
        $formGroup.removeClass('has-success');
        
        var originalValidationMessage = $el[0].validationMessage;
        
        if(options.setErrorMessage !== null){
          options.setErrorMessage.apply(this, $el);
        }
        
        errorMessage = $el[0].validationMessage;
        
        if (typeof errorMessage === 'undefined' || errorMessage.length === 0 || errorMessage === originalValidationMessage){
          errorMessage = $el.attr('title');  
        }
        
        if(errorMessage === undefined) {
          errorMessage = options.defaultErrorMessage;
        }

        $el[0].setCustomValidity("");

        //only append if there isn't one. helpful with radios and checkboxes
        if($formGroup.find('.' + options.errorClassName).length === 0) {
          $formGroup.append('<label class="' + options.errorClassName + ' inactive" for="' + $el.attr('id') + '">' + errorMessage + '</label>');
         
        }
        var t = setTimeout(function(){
          $('.' + options.errorClassName).removeClass('inactive');
        },10);
      }
    };

    var validityChecker = function(el){
      var elValidity = el.checkValidity();
          $el = $(el);

      //if it is an equal-to check status
      if($(el).attr('data-equal-to') !== undefined){
        elValidity = equalTo(el);
      }

      if($(el).attr('data-not-equal-to') !== undefined){
        elValidity = !equalTo(el);
      }

      if($(el).attr('data-not-equal-to-with-base') !== undefined){
        elValidity = elValidity && !equalTo(el,$(el).attr('data-not-equal-to-with-base'));
      }

      if($el.is(':checkbox') || $el.is(':radio')){
        elValidity = checkboxValidity(el);
      }

      if ( ! browser.inputtype.number && isNumberField($(el)) ){
        /** browser doesn't support number type **/
        elValidity = numberTypeValidity($el);
      }

      if($(el).attr('data-creditcard') !== undefined){
        if ( elValidity ) {
          /** first see if html pattern matches, if so, do luhn check. otherwise return false **/
          elValidity = luhnCheck( el );
        }
      }

      if(elValidity === true){
        setValid($el);
      }
      else {
        setInvalid($el);
      }
    };
    
    /**
     * Load browser support for HTML5 elements.
     */
    var loadInputTypeSupport = function(){
      var types = "search,number,range,color,tel,url,email,date,month,week,time,datetime,datetime-local";
      var typeArray = types.split(",");
      var input = document.createElement( 'input' );
      browser.inputtype = {};
      for ( var a = 0; a < typeArray.length; a++ ){
        input.setAttribute("type","text");
        input.setAttribute("type",typeArray[a]);
        if ( input.type !== 'text' ){
          browser.inputtype[typeArray[a]] = true;
        }
        else {
          browser.inputtype[typeArray[a]] = false;
        }
      }
    };

    loadInputTypeSupport();


      $inputs.each(function(){


        // bind Check Validity on validationTrigger for all inputs
        $(this).on(options.validationTrigger, function(e){

          if (e.ctrlKey) {
            return false;
          }

          var $this = $(this);

          // trim the value and save back to form input before continuing.
          $this.val($.trim($this.val()));

          if($this.attr('type') === 'number' && isNaN($this.val())){
            //exist because letters in a number field register as a blank value
            $this.val('');
          }
          if($this.val() !== '') {
            validityChecker(this);
          }
          else {
            //if the form is blank AND required we need to rip out the valid classes
            if($this.is(':required')) {
              $this.removeClass('valid').parentsUntil('form-group').removeClass('has-success');
            }

          }

        });


        if ( ! $(this).is("select") ) {
          // if the input isn't a select, bind change keyup and mouseup
          $( this ).on( 'change.' + options.namespace + ' keyup.' + options.namespace + ' mouseup.' + options.namespace, function(){validityEventCheck(this);} );

        }
        else {
          // If we are a select, only bind change and input.. not the others, some browsers are cranky
          $( this ).on( 'change.' + options.namespace + ' input.' + options.namespace, function(){validityEventCheck(this);} );
        }

      });

      var validityEventCheck = function(el){

        var elValidity = el.checkValidity();
        $el        = $( el );

        if ( $el.is( ':disabled' ) !== true ) {

          if ( $el.hasClass( 'fn-equal-to' ) ) {
            elValidity = equalTo( this );
          }

          if ( $el.hasClass( 'fn-notequal-to' ) ) {
            elValidity = ! equalTo( this );
          }

          if ( $el.is( ':checkbox' ) || $el.is( ':radio' ) ) {
            elValidity = checkboxValidity( this );
          }

          if ( elValidity === true ) {
            setValid( $el );
          }

        }
      };


      //Check Validity for all elements on submit
      $forms.on('submit.' + options.namespace,function(e){
        $form = $(this);

        if(typeof options.beforeSubmit === "function") {
          options.beforeSubmit.call(this);
        }

        $form.find('select, input, textarea').not(':disabled').each(function(){
          validityChecker(this);
        });
        if($form.find('.has-error').length > 0){
           //unsuccessful validation
          var errorScrollTop = $form.find('.has-error:first').offset().top - 100;
          if(errorScrollTop < $(window).scrollTop()) {
            $("html, body").animate({ scrollTop: errorScrollTop }, 300);
          }
          $form.find('.has-error .invalid:first').focus();
         
           //call the invalid callback, rely on that to return true or false to submit the form
          if(options.invalid !== null) {
            return options.invalid.call(this);
          }

          //prevent the form from submitting no matter what
          e.preventDefault();
        }
        else {
          //successful validation
          
          //call the invalid callback, rely on that to return true or false to submit the form
          if(options.valid !== null) {
            return options.valid.call(this);
          } 
          else {
            return true;
          }
        }
        return false;
      });
  };
})( jQuery );
