var screenShooter = function(tabID){
	this.tabID  = typeof tabID === 'undefined' ? null : tabID;
	this.canvas = document.createElement('canvas');
	this.context = this.canvas.getContext('2d');
};
screenShooter.prototype.screenShot = function(callback){
	var THIS = this;
	chrome.tabs.captureVisibleTab(this.tabID, function(img) {
		if (!THIS.isFull && callback) callback(img);
		var imageObj = new Image();
		imageObj.onload = function() {
			THIS.context.drawImage(imageObj, 0, window.scrollY);
		};
		imageObj.src = img;
		/*показываем какие блоки скриняться*/
		THIS.context.strokeRect(0, window.scrollY, window.innerWidth, window.innerHeight);
		if (THIS.isFull) {
			var height = document.height; // максимальная высота окна
			var innerHeight = window.innerHeight; // доступная высота окна

			if (height - innerHeight <= window.scrollY) {
				THIS.isFull = false;
				if (callback) callback(THIS.canvas.toDataURL());
			} else {
				// setTimeout(function(){
					window.scrollTo(0, window.scrollY + window.innerHeight);
					THIS.screenShot(callback);
				// },100);
			}
		}
	});
}
screenShooter.prototype.fullScreenShoot = function(callback) {
	var height = document.height; // максимальная высота окна
	var innerHeight = window.innerHeight; // доступная высота окна

	$(this.canvas).attr({
		'width' : document.width,
		'height' : document.height
	});
	// this.context.strokeRect(15, 15, 266, 266);
	this.isFull = true;
	window.scrollTo(0, 0); // выкручиваем на самый верх
	// var interval = setInterval(function(){
		// if (height - innerHeight <= window.scrollY) clearInterval(interval);
		// alert('qwe');
		// window.scrollTo(0, window.scrollY + innerHeight);

		this.screenShot(callback);

	// },500);
}

var screenObj = new screenShooter(null);
$(function(){
	// screenObj.screenShot(function(img){
	// 	$('.img-responsive').attr('src',img);
	// });
	// screenObj.fullScreenShoot(function(img){
	// 	// $('.img-responsive').attr('src',img);
	// 	$('body').append($('<img>').attr('src',img))
	// });
});