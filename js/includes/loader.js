const_plugins.forEach(function(pluginName){
	// $.getScript("plugins/"+pluginName, function(data){
	// 	console.log(data);
	// });
	$.ajax({
		url      : "plugins/"+pluginName,
		async    : false,
		dataType : 'json',
		success  : function(data){
			plugins[pluginName] = data;
			console.log(data);
		}
	})
});

var appState, block, controller;
$(function(){
	var AppState = Backbone.Model.extend({
		defaults: {
		}
	});

	var Block = Backbone.View.extend({
		el: $("article"),
		templates: { // Шаблоны на разное состояние
			"home": _.template($('#template-home').html()),
			"search": _.template($('#template-search').html())
		},
		initialize: function () { // Подписка на событие модели
			this.model.bind('change', this.render, this);
		},
		render: function () {
			var state = this.model.get("state");
			$(this.el).html(this.templates[state](this.model.toJSON()));
			return this;
		}
	});

	var Controller = Backbone.Router.extend({
		routes: {
			"": "home", // Пустой hash-тэг
			"!/": "home", // Начальная страница
			"!/home": "home", // Начальная страница
			"!/search": "search", // Блок удачи
		},

		home: function () {
			appState.set({ state: "home" });
		},

		search: function () {
			appState.set({ state: "search" });
		}
	});

	appState = new AppState();
	block = new Block({ model: appState });
	controller = new Controller(); // Создаём контроллер
	Backbone.history.start();
});