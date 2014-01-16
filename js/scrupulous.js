(function ($) {
  $.fn.scrupulous = function (callback) {
    //stop everything if checkValidity does not exist, and I'm talking to you <= IE9.
    if(typeof document.createElement( 'input' ).checkValidity != 'function') {
      return false;
    }
    var $forms        = this,
        $inputs       = $forms.find('select, input, textarea').not(':disabled'),
        emailPattern  = "[^@]+@[^@]+\.[a-zA-Z]{2,6}",
        $el,$form,$formGroup,elId,validity,errorMessage;

    $forms.find('input[type="email"]').attr('pattern',emailPattern);

    $forms.attr('novalidate',true); //set all forms to novalidate to avoid default browser validation


    /*----------------------------------------------
      equalTo(el);
     function that checks if a value is equal to another value
     based on the id value contained in data-equal-to attribue. 
     ----------------------------------------------*/
    var equalTo = function(el){
      var equalToParentId = $(el).attr('data-equal-to');
      
      if($('#' + equalToParentId).length) {
        // Compare to another input's value
        if (el.value != $('#' + equalToParentId).val() || el.value === '') {
          return false;
        } else {
          return true;
        }
      } else {
        // Plain Object / Primitive evaluation
        return (el.value == equalToParentId);
      }
    };

    /*----------------------------------------------
      checkboxValidity(el)
      function to check if any checkboxes/radios are checked then validate that
      section of the form 
    ----------------------------------------------*/

    var checkboxValidity = function(el){
      var inputName = el.name,
          isChecked = false;
      $('input[name=' + inputName + ']').each(function(){
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
      $formGroup = $el.parents('.form-group');
      $formGroup.addClass('has-success');
      $formGroup.removeClass('has-error');
      $formGroup.find('.error-message').remove();
    };

    /*----------------------------------------------
    setInvalid($el)
    function that addes invalid classes and appends
    error message labels to the parent div. 
    ----------------------------------------------*/
    var setInvalid = function($el) {
      $el.addClass('invalid');
      $el.removeClass('valid');
      $formGroup =  $el.parents('.form-group');
      //let Developer know that form-group does not exist
      if($formGroup.length == 0) {
        console.log('Warning: Scrupulous needs a .form-group element to append errors.');
      }
      $formGroup.addClass('has-error');
      $formGroup.removeClass('has-success');
      errorMessage = $el.attr('title');
      if(errorMessage == undefined) {
        errorMessage = 'This field has an error';
      }
      //only append if there isn't one. helpful with radios and checkboxes
      if($formGroup.find('.error-message').length === 0) {
        $formGroup.append('<label class="error-message inactive" for="' + $el.attr('id') + '">' + errorMessage + '</label>');
       
      }
      var t = setTimeout(function(){
        $('.error-message').removeClass('inactive');
      },10);
    };

    var validityChecker = function(el){
      elValidity = el.checkValidity();
      $el = $(el);

      //if it is an equal-to check status
      if($(el).hasClass('fn-equal-to')){
        elValidity = equalTo(el);
      }
      
      //if it is a not equal-to check status
      if($(el).hasClass('fn-notequal-to')){
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
      $inputs.on('change keyup',function(){
        elValidity = this.checkValidity();
        $el = $(this);

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
        if($(this).attr('type') === 'number' && $(this).val() == ''){ 
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

        if( typeof callBack !== "function" ) { callBack = function(){};}
        callBack.call(this);

        $form.find('select, input, textarea').each(function(){
          validityChecker(this);
        });
        if($form.find('.has-error').length > 0){
           //don't submit
          var errorScrollTop = $form.find('.has-error:first').offset().top - 100;
          if(errorScrollTop < $(window).scrollTop()) {
            $("html, body").animate({ scrollTop: errorScrollTop }, 300);
          }
          $form.find('.has-error .invalid:first').focus();

          e.preventDefault();
        }
      });
  };
})( jQuery );