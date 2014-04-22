Scrupulous
=======

Scrupulous.js is super simple, client side, inline form validation using HTML5 attributes. Add all the standard HTML5 form attributes and call the plugin and it will automatically add inline validation with full styleable elements and class names. <a href="http://zaneray.github.io/scrupulous/">View the demo here.</a>

Scrupulous.js is built around [Bootstrap](http://getbootstrap.com/), using the same class name and HTML structure for simple implementation. Not using Bootstrap? No problem, just update the class names in the CSS file and with minor changes it should still work fine. 

#Setup
* scrupulous.css: you will need to include the scrupulous.css which adds some additional styling to the form elements. 
* jQuery: Scrupulous should work with most newer versions of jQuery, Have not tested how far back it is supported
* scrupulous.js: Runs a jQuery plugin. 
* Call the $.scrupulous() plugin on the form(s) you would like to validate. 

		$(function(){
			$('.validate-form').scrupulous();	
		});

##HTML
Then just add standard HTML5 attributes to your form and Scrupulous takes care of the rest. 

	<form class="validate-form" method="post" action="/">
		<div class="form-group">
			<label for="email">Email</label>
			<input type="email" class="form-control" id="email" name="email" title="Please Enter a Valid Email Address" required>
        </div>
    </form>

Note that the title of the field becomes the error message, mimmicking the default browser HTML5 validation messaging.

##HTML with Errors

If an error is detected the resulting HTML is generated dynamically.

	<div class="form-group has-error">
		<label for="name">Name</label>
		<input type="text" class="form-control invalid" id="name" name="name" title="Please Enter a Name" required>
    	<label class="error-message" for="name">Please Enter a Name</label>
    </div>

##Valid HTML

When the form validates the following HTML is generated dynamically 

	<div class="form-group has-success">
		<label for="name">Name</label>
		<input type="text" class="form-control valid" id="name" name="name" title="Please Enter a Name" required>
	</div>

#Additional Validation Methods
There are additional validation methods that come in handy that can be controlled by data attributes. 

<dl>
<dt><b>data-equal-to:</b></dt>
<dd>ID of an element to check whether the values of the two elements are equal. Example is password fields where you want to make sure that both passwords match. </dd>
</dl>

###Example
The data-equal-to attribute value is the id of the first password field. 

  <div class="form-group">
    <label for="inputpw">Password</label>
    <input type="password" pattern=".{6,}" class="form-control" id="inputpw" title="Passwords are at Least 6 Characters" placeholder="Minimum 6 Characters" required>
  </div>
  <div class="form-group">
    <label for="inputpwrepeat">Repeat Password</label>
    <input type="password" pattern=".{6,}" class="form-control" data-equal-to="inputpw" id="inputpwrepeat" title="Passwords Must Match" required>
  </div>

#Optional Properties
More properties to be added as new features are needed. 

<dl>
<dt><b>valid:</b></dt>
<dd>A Callback if the form is valid. <b>Must return <i>true</i> or <i>false</i></b>. Helpful if you are relying on another service to validate the form after the scrupulous script has determined the form. Examples: Credit Card Validation, Address Verification, Username Verification.</dd>
<dt><b>invalid:</b></dt>
<dd>Callback if the form is invalid. Always prevents form submission. Helpful if you need added functionality such as showing a global message above the form.</dd>
<dt><b>setErrorMessage:</b></dt>
<dd>Helper function used to set up custom error messaging.  Helpful for cases where special messaging is needed for specific error modes.</dd>
<dt><b>errorClassName:</b></dt>
<dd>Default: 'error-message'. Customize the class name of error messages, useful when integrating into an existing project that does not use Bootstrap.</dd>
<dt><b>parentClassName:</b></dt>
<dd>Default: 'form-group'. Customize the class name of the parent container of the form element, useful when integrating into an existing project that does not use Bootstrap.</dd>
<dt><b>defaultErrorMessage:</b></dt>
<dd>Default: 'This field has an error'. Message display in the error label if no title tag is provided on the input element with an error.</dd>
</dl>

###Example
Example showing valid and invalid callbacks and setErrorMessage helper function
<pre><code>
  $('.callback-form').scrupulous({
    valid: function(){
      alert('Valid Callback - Submit the Form');
      return true;
    },
    invalid: function(){
      alert('Invalid Callback -  Stop the Form');
      return false;
    },
    setErrorMessage: function(el){
      
      /** example to put custom message on inputs with type='number' **/
      var input = $(el);
      var message = null;
      var tag = el.tagName.toLowerCase();
      var type = ( tag == "input" ) ? input.attr("type").toLowerCase() : ( tag == "select" ) ? "select" : "unknown";
      
      /** use different messages if input value is too large vs too small **/
      if ( type == "number" ) {
        if (typeof input.attr("max") !== 'undefined' && input.attr("max") &lt; input.val()) {
          message = "Please enter " + input.attr("max") + " or less";
        }
        else if (typeof input.attr("min") !== 'undefined' && input.attr("min") &gt; input.val()) {
          message = "Please enter " + input.attr("min") + " or more";
        }
      }
      
      /** use setCustomValidity method built into browser to update the message **/
      if ( message !== null ){
        el.setCustomValidity(message);
      }
    }
  });
</code></pre>

#Legacy Browser Support
Currently if the browser does not support element.checkValidity Scrupulous will silently fail. You should be using solid server side validation as a backup. It may be possible to use it in conjunction with a HTML5 form validation polyfill. Let us know if you have any luck. 

##Modernizr.load Example
Scrupulous may also be loaded with Modernizr.load as well. 
<pre><code>
  Modernizr.load({
      test: Modernizr.input.required,
      yep: 'js/scrupulous.js',
      complete: function() {
        $('#my-form').scrupulous();
      }
    });
</code></pre>    


