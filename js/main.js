
var map;
var panel;
var initialize;
var calculate;
var direction;

function validEmail(email) { // see:
  var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
  return re.test(email);
}

// get all data in form and return object
function getFormData() {
  var elements = document.getElementById("gform").elements; // all form elements
  var fields = Object.keys(elements).map(function(k) {
    if(elements[k].name !== undefined) {
      return elements[k].name;
    // special case for Edge's html collection
    }else if(elements[k].length > 0){
      return elements[k].item(0).name;
    }
  }).filter(function(item, pos, self) {
    return self.indexOf(item) == pos && item;
  });
  var data = {};
  fields.forEach(function(k){
    data[k] = elements[k].value;
	if(elements[k].name === 'message') {
		data[k] = data[k].replace(/\r\n|\r|\n/g,"<br />");
	}
    var str = ""; // declare empty string outside of loop to allow
                  // it to be appended to for each item in the loop
    if(elements[k].type === "checkbox"){ // special case for Edge's html collection
      str = str + elements[k].checked + ", "; // take the string and append 
                                              // the current checked value to 
                                              // the end of it, along with 
                                              // a comma and a space
      data[k] = str.slice(0, -2); // remove the last comma and space 
                                  // from the  string to make the output 
                                  // prettier in the spreadsheet
    }else if(elements[k].length){
      for(var i = 0; i < elements[k].length; i++){
        if(elements[k].item(i).checked){
          str = str + elements[k].item(i).value + ", "; // same as above
          data[k] = str.slice(0, -2);
        }
      }
    }
  });
  //console.log(data);
  return data;
}
function initAutocomplete() {
 
  var autocomplete = new google.maps.places.Autocomplete(
	  /** @type {!HTMLInputElement} */(document.getElementById('autocomplete')),
	  {types: ['geocode','establishment'], componentRestrictions: {country: 'fr'}});
	var autocomplete_2 = new google.maps.places.Autocomplete(
      /** @type {!HTMLInputElement} */(document.getElementById('autocomplete_2')),
      {types: ['geocode','establishment'], componentRestrictions: {country: 'fr'}});
  var autocomplete3 = new google.maps.places.Autocomplete(
	  /** @type {!HTMLInputElement} */(document.getElementById('lieu_depart')),
	  {types: ['geocode','establishment'], componentRestrictions: {country: 'fr'}});
var autocomplete4 = new google.maps.places.Autocomplete(
	  /** @type {!HTMLInputElement} */(document.getElementById('lieu_arrive')),
	  {types: ['geocode','establishment'], componentRestrictions: {country: 'fr'}});
}

initialize = function(){
	if($('#map').length>0){
	  var latLng = new google.maps.LatLng(47.2172500,-1.5533600); 
	  var myOptions = {
		zoom      : 10, // Zoom par défaut
		center    : latLng, // Coordonnées de départ de la carte de type latLng 
		mapTypeId : google.maps.MapTypeId.TERRAIN, // Type de carte, différentes valeurs possible HYBRID, ROADMAP, SATELLITE, TERRAIN
		maxZoom   : 30
  };
  
  map      = new google.maps.Map(document.getElementById('map'), myOptions);
  
  
  
  direction = new google.maps.DirectionsRenderer({
	  map   : map 
	  });
	}
	if($('#autocomplete').val() != "" && $('#autocomplete_2').val() != "" && ($('#select').val() !=null && $('#select').val() != "")){
		calculate();
	}
};

calculate = function(){
    origin      = document.getElementById('autocomplete').value; // Le point départ
    destination = document.getElementById('autocomplete_2').value; // Le point d'arrivé
    if(origin && destination){
        var request = {
            origin      : origin,
            destination : destination,
            travelMode  : google.maps.DirectionsTravelMode.DRIVING // Mode de conduite
        }
        var directionsService = new google.maps.DirectionsService(); // Service de calcul d'itinéraire
        directionsService.route(request, function(response, status){ // Envoie de la requête pour calculer le parcours
            if(status == google.maps.DirectionsStatus.OK){
                direction.setDirections(response); // Trace l'itinéraire sur la carte et les différentes étapes du parcours
            }
        });
    }
};

$(document).ready(function(){
	initialize();
	$('#date_depart').datetimepicker({
		locale: 'fr',
		format: 'DD/MM/YYYY'
	});
	$('#time_depart').datetimepicker({
		locale: 'fr',
		format: 'LT'
	});

});

var tds = document.getElementsByTagName("td");
for(var i=0; i<tds.length; i++){
	var td = tds[i];
	if(td.hasAttribute("headers")){
		var th = document.getElementById(td.getAttribute("headers"));
		if(th != null){
			td.setAttribute("data-headers", th.textContent);
		}
	}        
}

function handleBookFormSubmit(event) {  // handles form submit withtout any jquery
	event.preventDefault();
	setDataBeforeContact();
	$('#modalContact').modal('toggle');
    return false;
}

function setDataBeforeContact() {  // handles form submit withtout any jquery
	$("#lieu_depart").val($("#autocomplete").val());
	$("#lieu_arrive").val($("#autocomplete_2").val());
	$("#vehicule").val($("#select-vehicule option:selected").val());
}

function resetForm() {
	document.getElementById("gform").reset();
}

function handleContactFormSubmit(event) {  // handles form submit withtout any jquery
  event.preventDefault();           // we are submitting via xhr below
  var data = getFormData();         // get the values submitted in the form
  if( !validEmail(data.email) ) {   // if email is not valid show error
    document.getElementById('email-invalid').style.display = 'block';
  } else {
    var url = event.target.action;
	$('#modalContact').modal('hide');
	$.ajax({
		type : "post",
		dataType : "JSON",
		url : url,
		data : data,
		success : function(object) {
			resetForm();
			$('#success_message').show();
			$('#error_message').hide();
			$('#modalConfirm').modal('toggle');
		},
		error : function(request) {
			$('#error_message').show();
			$('#success_message').hide();
			$('#modalConfirm').modal('toggle');
		}
	});
  }

return false;
}
function loaded() {
  //console.log('contact form submission handler loaded successfully');
  // bind to the submit event of our form
  var bookForm = document.getElementById('book-form');
  bookForm.addEventListener("submit", handleBookFormSubmit, false);
  var gForm = document.getElementById('gform');
  gForm.addEventListener("submit", handleContactFormSubmit, false);
};

document.addEventListener('DOMContentLoaded', loaded, false);

var class_additionnel="fadeInDown animated";
var _timer=4000;

var change_text=(function(){
	$('.text_anim>*:first-Child').css({'display':'none'}).attr('class','');
	$('.text_anim').append($('.text_anim>*:first-Child'));
$('.text_anim>*:first-Child').css({'display':'block'}).attr('class',class_additionnel);
	setTimeout(change_text,_timer);
});
$(document).ready(function(){
	$('.text_anim>*').each(function(){$(this).css({'display':'none'}).attr('class','');});
	$('.text_anim>*:first-Child').css({'display':'block'}).attr('class',class_additionnel);
	change_text();
});
