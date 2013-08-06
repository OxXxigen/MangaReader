function Loader() {
	this.firstStart = function(){
		const_plugins.forEach(function(pluginName){
			loadScript("plugins/" + pluginName);
		});
	}
	this.firstStart();
}

var loader = new Loader();