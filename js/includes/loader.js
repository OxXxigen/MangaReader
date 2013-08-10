"use strict";
var ReaderController = function() {
	var THIS = this;

	var _plugins = Array(
		'readmanga.js'/*,
		'manga24.js'*/
	);

	this.plugins = {};

	this.addPlugin = function(data) { this.plugins[data.name] = data; }

	this.loadPluginsData = function() {
		_plugins.forEach(function(pluginName){
			$.ajax({
				url      : "plugins/"+pluginName,
				async    : false,
				dataType : 'script'
			})
		});
	}

	this.searchManga = function(mangaName, mangaList, callback) {
		if( mangaName === '') errors("Название манги не введено");

		mangaList.forEach(function(host){
			var q = THIS.plugins[host].searchManga(mangaName);
		})
	}

	var errors = function(text) {
		throw text;
	}
}
var ReaderObj = new ReaderController();
ReaderObj.loadPluginsData();



var appState, block, controller;
$(function(){
	var AppState = Backbone.Model.extend({
		defaults: {}
	});

	var Block = Backbone.View.extend({
		el: $("article"),
		events: {
			"click #action-mangaSearch": "searchManga" // Обработчик клика на кнопке поиск манги
		},
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
		},
		searchManga: function(){
			var mangaName = $(this.el).find('#searchMangaName').val();
			ReaderObj.searchManga(
				mangaName,
				$('.mangahost:checked').map(function(){return this.id}).get(),
				function(){

				}
			);
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