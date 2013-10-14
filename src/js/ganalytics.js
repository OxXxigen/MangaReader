var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-44856908-1']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = 'https://ssl.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

/*аналитика ошибок JS*/
window.onerror = function(msg, url, line) {
	var preventErrorAlert = true;
	_gaq.push(['_trackEvent', 'JS Error', msg, navigator.userAgent + ' -> ' + url + " : " + line, 0, true]);
	return preventErrorAlert;
};

/*Простенькие сообщения об ошибках jquery*/
jQuery.error = function (message) {
	_gaq.push(['_trackEvent', 'jQuery Error', message, navigator.userAgent, 0, true]);
}