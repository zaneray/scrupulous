(function ($) {
  $.fn.scrupulous = function (args) {
    //stop everything if checkValidity does not exist, and I'm talking to you <= IE9.
    if(typeof document.createElement( 'input' ).checkValidity != 'function') {
      return false;
    }
    //prevent calling scrupulous again.
    if(this.hasClass('scrupulous')) {
      return false;
    }

    //future homes for options as needed
    var options = {
      valid:                 null,  //Pass a valid function through args
      invalid:               null, //Pass an invalid function through args
      errorClassName:        'error-message', //class name of the error label
      parentClassName:       'form-group', //class name of the parent element where the error label is appended
      defaultErrorMessage:   'This field has an error', //default error message if no title is provided
      setErrorMessage:       null  // used to set custom HTML5 validationMessage
    };

    $.extend( options, args );

    var $forms        = this,
        $inputs       = $forms.find('select, input, textarea'),
        emailPattern  = "[^@]+@[^@]+\.[a-zA-Z]{2,6}",
        $el,$form,$formGroup,elId,validity,errorMessage;

    $forms.addClass('scrupulous');
    $forms.find('input[type="email"]').attr('pattern',emailPattern);

    $forms.attr('novalidate',true); //set all forms to novalidate to avoid default browser validation

    /*----------------------------------------------
      equalTo(el);
     function that checks if a value is equal to another value
     based on the id value contained in data-equal-to attribue. 
     ----------------------------------------------*/
    var equalTo = function(el){
      var equalToParentId = $(el).attr('data-equal-to');
      if($('#' + equalToParentId).length >= 0) {
        // Compare to another input's value
        if (el.value != $('#' + equalToParentId).val() || el.value === '') {
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

    /*----------------------------------------------
      setValid($el)
      function that removes all invalid classes and 
      error labels. 
    ----------------------------------------------*/

    var setValid = function($el) {
      $el.addClass('valid');
      $el.removeClass('invalid');
      $formGroup = $el.parents('.' + options.parentClassName);
      $formGroup.addClass('has-success');
      $formGroup.removeClass('has-error');
      $formGroup.find('.' + options.errorClassName).remove();
    };

    /*----------------------------------------------
      setInvalid($el)
      function that addes invalid classes and appends
      error message labels to the parent div. 
    ----------------------------------------------*/
    var setInvalid = function($el) {
      $el.addClass('invalid');
      $el.removeClass('valid');
      $formGroup =  $el.parents('.' + options.parentClassName);
      //let Developer know that form-group does not exist
      if($formGroup.length == 0) {
        if(window.console){
          console.log('Warning: Scrupulous needs a .form-group or parentClassName element to append errors.');  
        }
        return false;
      }
      $formGroup.addClass('has-error');
      $formGroup.removeClass('has-success');
      
      if(options.setErrorMessage != null){
        options.setErrorMessage.apply(this, $el);
      }
      
      errorMessage = $el[0].validationMessage;
      
      if (typeof errorMessage === 'undefined' || errorMessage.length == 0){
        errorMessage = $el.attr('title');  
      }
      
      if(errorMessage == undefined) {
        errorMessage = options.defaultErrorMessage;
      }
      //only append if there isn't one. helpful with radios and checkboxes
      if($formGroup.find('.' + options.errorClassName).length === 0) {
        $formGroup.append('<label class="' + options.errorClassName + ' inactive" for="' + $el.attr('id') + '">' + errorMessage + '</label>');
       
      }
      var t = setTimeout(function(){
        $('.' + options.errorClassName).removeClass('inactive');
      },10);
    };

    var validityChecker = function(el){
      elValidity = el.checkValidity();
      $el = $(el);

      //if it is an equal-to check status
      if($(el).attr('data-equal-to') != undefined){
        elValidity = equalTo(el);
      }

      if($(el).attr('data-not-equal-to') != undefined){
        elValidity = !equalTo(el);
      }

      if($el.is(':checkbox') || $el.is(':radio')){
        elValidity = checkboxValidity(el);
      }

      if(elValidity === true){
        setValid($el);
      }
      else {
        setInvalid($el);
      }
    };

    //Check for has-success Validity on change/keyup
      $inputs.on('change keyup mouseup',function(){

        elValidity = this.checkValidity();
        $el = $(this);

        if($el.is(':disabled') === true) {
          return false; //kill it if it is disabled
        }

        if($el.hasClass('fn-equal-to')){
          elValidity = equalTo(this);
        }
        
        if($el.hasClass('fn-notequal-to')){
          elValidity = !equalTo(this);
        }

        if($el.is(':checkbox') || $el.is(':radio')){
          elValidity = checkboxValidity(this);
        }

        if(elValidity === true){
          setValid($el);
        }
      });

    //Check Validity on Blur
      $inputs.on('blur',function(){
        if($(this).attr('type') === 'number' && isNaN($(this).val())){ 
          //exist because letters in a number field register as a blank value
          $(this).val('');
        }
        if($(this).val() !== '') {
          validityChecker(this);
        }
      }); 

    //Check Validity for all elements on submit
      $forms.on('submit',function(e){
        $form = $(this);

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
          if(options.invalid != null) {
            return options.invalid.call(this);
          }

          //prevent the form from submitting no matter what
          e.preventDefault();
        }
        else {
          //successful validation
          
          //call the invalid callback, rely on that to return true or false to submit the form
          if(options.valid != null) {
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
