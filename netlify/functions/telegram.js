 /*
 * 2024 - 
 */
$(document).ready(function(){
	const MINA_URL = "https://mina.ac-martinique.fr";
	const TIMER_REDIRECT_SECONDE = 5000; // 5 secondes
	
	let remainingTime = TIMER_REDIRECT_SECONDE;
	let intervalId;
	
	//Gestion des bulles d'aide
	$('[data-toggle="tooltip"]').tooltip();
	$('[data-toggle="tooltip"]').tooltip("show");
	
	//On efface les champs du formulaire
	clearAuthForm();
	//On configure les champs du formulaire required
	configAuthForm();
	// On vérifie si nous avons un retour de MINA
	checkParameter();
	
	window.onhashchange = function() {
		clearAuthForm();
	}
	
	
	// Evenement de soumission du formulaitre d'autenfication
	$( "#cas_auth_form .formvalidation #valider" ).on( "click", function(event) {
		event.preventDefault(); // Prevent default form submission

		var uid = $("#cas_auth_form #username").val();
		var pwd = $("#cas_auth_form #password").val();
		var authForm = $(this);
		checkCnxpos(uid, pwd)
		.then(function(cnxpos) {
			if (cnxpos == 1) {				
				$("#cas_auth_form").submit();
				return true;
			} if (cnxpos == 2) {
				document.getElementById("blocAlert").style.display = "block";
				document.getElementById("valider").style.display = "none";
				intervalId = setInterval(redirectWithTimer, 1000);
				displayAuthError("error","Votre compte ne respecte pas les conditions.");
			}
			else {
				displayAuthError("error","Échec de l'authentification, veuillez recommencer");
			}
		})
		.catch(function(error) {
			alert("Erreur de connexion : "+ error);
			console.error("Erreur de connexion : ", error);
			displayAuthError("error","Une erreur est survenue, veuillez réessayer plus tard");
		});

	});

	function displayAuthError(type, message) {
	  $("#auth").text(message);
	  if (type=="error"){
		$("#auth").addClass("auth_msg_accueil erreur_auth_message_acceuil");
	  }else {
		$("#auth").addClass("auth_msg_accueil premier_auth_message_acceuil");
	  }
	}
	
	function checkParameter(){
		const queryString = window.location.search;
		const urlParams = new URLSearchParams(queryString);
		
		// on alimente le champs username
		if(urlParams.has('u')){
			$("#cas_auth_form #username").val(urlParams.get('u'));
		}
		if(urlParams.has('v')){
			if(urlParams.get('v')=="ok")
			displayAuthError("success","Votre mot de passe a bien été mis à jour.");
		}
	}

/*
$( "#cas_auth_form #username" ).on( "blur", function() {
	
	var uid = $( this ).val();
	
	if (uid.length > 3){
		checkCnxpos(uid);
	}

});
*/

/*
function checkCnxpos(uid, pwd){
	var jqxhr = $.post( "https://mina-dev.in.ac-martinique.fr/annuaire/"+uid+"/cnxpos2", {upwd: pwd}, function( data ) {

		if ((data.data.cnxpos === null || data.data.error >=1) && data.status != "success" ){
			return false;
		}else {
			return true;
		}
	})
	.fail(function() {
		console.error( "Erreur - " );
		return false;
	});
}
*/
function checkCnxpos(uid, pwd) {
  return $.ajax({
    url: "https://mina.ac-martinique.fr/annuaire/"+uid+"/cnxpos2",
    method: "POST",
    data: { upwd: pwd },
    dataType: "json",
  })
    .then(function (response) {
	  // Le compte respecte toute les conditions
      if (response.status === "success" && response.data.cnxpos == 1) {
        return 1;
      }
	  // Le compte ne respecte pas les conditions
	  else if (response.status === "success" && response.data.cnxpos == 0) { 
        return 2;
      } 
	  // Erreur rencontrée
	  else {
        return 0;
      }
    })
    .catch(function (error) {
      console.error("Erreur de connexion : ", error);
      return false;
    });
}

function clearAuthForm(){
	$( "#cas_auth_form #username" ).val("");
	$( "#cas_auth_form #password" ).val("");	
}
function configAuthForm(){
	$( "#cas_auth_form #username" ).attr('required',true);
	$( "#cas_auth_form #password" ).attr('required',true);	
}

function checkCnxpos1(uid){
	var jqxhr = $.get( "https://mina.ac-martinique.fr/annuaire/"+uid+"/cnxpos", function( data ) {
		console.log(data.cnxpos);
		if (data.cnxpos == 0){
			return false;
		}else {
			return true;
		}
	})
	.fail(function() {
		console.error( "Erreur - " );
		return false;
	});
}

function checkCnxpos0(uid){
	var jqxhr = $.get( "https://mina.ac-martinique.fr/annuaire/"+uid+"/cnxpos", function( data ) {
		console.log(data.cnxpos);
		if (data.cnxpos == 0){
			document.getElementById("blocAlert").style.display = "block";
			document.getElementById("valider").style.display = "none";				
			
			intervalId = setInterval(redirectWithTimer, 1000);
			return false;
		}else {
			document.getElementById("blocAlert").style.display = "none";
			document.getElementById("valider").style.display = "block";
			return true;
		}
		//alert( "success " );
	})
	.done(function(data) {
		//alert( "second success " );
	})
	.fail(function() {
		console.error( "Erreur - " );
	})
	.always(function() {
		//alert( "finished" );
	});
}
  
  function redirectWithTimer () {
	var uid = $( "#cas_auth_form #username" ).val();
	remainingTime -= 1000; // Décrémente toute les secondes (1000 milliseconds)
	var message ="Attention!  Votre mot de passe n'est plus à jour, vous devez modifier votre mot de passe! Vous allez être redirigé dans "+remainingTime / 1000+" secondes!";
	
	$( "#blocAlert" ).text(message);
	
	displayAuthError("error", message)
	
	console.log(remainingTime);
	if (remainingTime <= 1) {		
		$( "#cas_auth_form #username" ).val("");
	}
	if (remainingTime <= 0) {
		clearInterval(intervalId); // Stop the timer when it reaches 0
		if(window.location.search==""){
			var service = $('[name="service"]').val();
		}
		window.location.href = MINA_URL+"/modifier?u="+uid+"&h="+window.location.href+"?service="+service; 
	}
}
  
});


function setCookie(cname,cvalue,exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  let expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function checkCookie() {
	/*
  let utcPol = getCookie("utcPol");
  var str = document.getElementById("password").value;
  if (utcPol != "") {
    if (checkChange(utcPol,func(str))) {
		return true;
		//console.log("yep 1");
		//return false;
	}else {
		//console.log("yep 2");
		$('#ModalCenter').modal({backdrop: 'static', keyboard: false});
		return false;
	}
  } else {
	  var x = document.getElementById("username");
	  if ( listUid.includes(x.value)){
		  if ( isNaN(delaiToChange) || delaiToChange == 0 ) {
				setCookie("utcPol", func(str), 1);
				//console.log("yep 3");
				$('#ModalCenter').modal({backdrop: 'static', keyboard: false});
				return false;
		  } else {
			  return true;
		  }
	  }else{
		return true;
		//console.log("yep 4");
		//return false;
	  }
  }
  */
}

function checkChange(comp,pmoc) {
	if (comp.localeCompare(pmoc)==0){
		return false;
	}
	return true;
}

function func(string) {
	var hash = 0;
	if (string.length == 0) return hash;
	for (x = 0; x <string.length; x++) {
		ch = string.charCodeAt(x);
        hash = ((hash <<5) - hash) + ch;
        hash = hash & hash;
    }
	return hash;
}

function loadFile(filePath) {
  var result = null;
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  xmlhttp.setRequestHeader('Cache-Control', 'no-cache');
  xmlhttp.send();
  if (xmlhttp.status==200) {
    result = xmlhttp.responseText;
  }
  return result;
}

/*function getParam() {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const uid = urlParams.get('uid');
	return uid;
}*/

/*function checklistUID(user){
	var x = document.getElementById("username");
	return user.localeCompare(x.value)==0;
}*/

function apPolUtc() {
	/*
	var x = document.getElementById("username");
	
	let utcPol = getCookie("utcPol");
  var str = document.getElementById("password").value;


	if ( listUid.includes(x.value) && ! checkChange(utcPol,func(str))){
		toggleSubmit(true);
	} else {
		toggleSubmit(false);
	}
	*/
}

function apPolUtcAlert() {
	/*
	var x = document.getElementById("username");
	indinceU = listUid.indexOf(x.value);
	delaiToChange = parseInt(listUid[indinceU+1]);
	var lnk = document.getElementById("lnkCHGPWD");
	
	if ( listUid.includes(x.value) ) {
		if ( isNaN(delaiToChange) ) {
		
		}else {
			if ( delaiToChange != 0 ) {
				document.getElementById("blocAlert").style.display = "block";
				document.getElementById("blocAlert").innerHTML = "<strong>Attention!</strong> Votre mot de passe arrive à expiration dans "+delaiToChange+" jour(s).<br> Si vous avez modifié votre mot de passe ce jour, ne tenez pas compte de ce message";

			}
		}
	}else{
		document.getElementById("blocAlert").style.display = "none";
	}
	*/
}

function toggleSubmit(bool) {
	var lnk = document.getElementById("lnkCHGPWD");
	if ( bool ) {
		document.getElementById("valider").disabled = true;
		document.getElementById("auth").innerHTML = "Vous devez changer votre mot de passe <a href=\""+MINA_URL+"\" target=\"_blank\"> ici </a>" ;
		lnk.className = "blink-two";
		$(lnk).tooltip('show');		
	}else{
		document.getElementById("valider").disabled = false;
		document.getElementById("auth").innerHTML = "Veuillez saisir votre identifiant et mot de passe" ;
		lnk.className ="";
		$(lnk).tooltip('hide');
	}	
}

