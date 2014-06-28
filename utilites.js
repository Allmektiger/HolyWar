/*
Developer: Emian Amanullah (emian@shuf.com)
Distributed under GNU GPL 2.
*/

// Cookies

function setCookie(name, value) {
  var valueEscaped = escape(value);
  var expiresDate = new Date();
  expiresDate.setTime(expiresDate.getTime() + 3 * 365 * 24 * 60 * 60 * 1000);
  var expires = expiresDate.toGMTString();
  var newCookie = name + "=" + valueEscaped + "; path=/; expires=" + expires;
  if (valueEscaped.length <= 4000) {document.cookie = newCookie + ";";}
    else return null;
}

function getCookie(name) {
  var prefix = name + "=";
  var cookieStartIndex = document.cookie.indexOf(prefix);
  if (cookieStartIndex == -1) return null;
  var cookieEndIndex = document.cookie.indexOf(";", cookieStartIndex + prefix.length);
  if (cookieEndIndex == -1) cookieEndIndex = document.cookie.length;
  return unescape(document.cookie.substring(cookieStartIndex + prefix.length, cookieEndIndex));
}

// Music

function playTrack(next) {
  document.getElementById("track"+next).play();
}
function playOn(amount) {
  document.getElementById("clickSnd").play();
  for (var i=1; i<=amount; i++) {
    document.getElementById("track"+i).pause();
  }
  document.getElementById("track1").play();
}
function playOff(amount) {
  document.getElementById("clickSnd").play();
  for (var i=1; i<=amount; i++) {
    document.getElementById("track"+i).pause();
  }
}

// Other

function random(n) {
  return(Math.floor(Math.random()*1000)%n);
}

function Clone(obj) {
  if(obj == null || typeof(obj) != 'object')  return obj; 
  var temp = {};
  for (var key in obj)
    temp[key] = Clone(obj[key]);
  return temp;
}
