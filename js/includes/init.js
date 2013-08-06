var Controller = Backbone.Router.extend({
	routes: {
		"": "home", // Пустой hash-тэг
		"!/": "home", // Начальная страница
		"!/home": "home", // Начальная страница
		"!/search": "search", // Блок удачи
	},

	home: function () {
		$(".block").hide(); // Прячем все блоки
		$("#home-tab").show(); // Показываем нужный
	},

	search: function () {
		$(".block").hide();
		$("#search-tab").show();
	}
});
$(function(){
    var controller = new Controller(); // Создаём контроллер
    controller.on('route:home');
    Backbone.history.start(); // Запускаем HTML5 History push
});