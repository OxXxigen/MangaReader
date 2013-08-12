"use strict";
var ReaderController = function() {
	var THIS = this;

	var _plugins = Array(
		'readmanga.js',
		'adultmanga.js'/*,
		'manga24.js'*/
	);

	this.plugins = {};

	this.addPlugin = function(data) { this.plugins[data.name] = data; }

	var errors = function(text) {
		throw text;
	}

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

		var ret_obj = {};
		mangaList.forEach(function(host){
			var tmp_obj = THIS.plugins[host].searchManga(mangaName);
			ret_obj[host] = tmp_obj;
		});

		var tpl = _.template($('#template-search-result').html(),{data:ret_obj});

		if (callback) callback(tpl,ret_obj);
	}

	this.getMangaInfo = function (host, mangaPath, callback) {
		var info = this.plugins[host].getMangaInfo(mangaPath);
		if (callback) callback(info);
		return info;
	}
	this.getPages = function(host, mangaPath, volume, chapter, callback) {
		var pages = this.plugins[host].getPages(mangaPath,volume,chapter);
		if (callback) callback(pages);
		return pages;
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
			"click #action-mangaSearch": "searchManga", // Обработчик клика на кнопке поиск манги
			'click .manga-link' : "manga_link_click"
		},
		templates: { // Шаблоны на разное состояние
			"home": _.template($('#template-home').html()),
			"search": _.template($('#template-search').html()),
			"manga": _.template($('#template-manga-title').html())
		},
		initialize: function () { // Подписка на событие модели
			this.model.bind('change', this.render, this);
		},
		render: function () {
			var state = this.model.get("state");
			$('ul.navbar-nav li').removeClass('active')
				.parent().find('li#page-' + state).addClass('active');
			$(this.el).html(this.templates[state](this.model.toJSON()));
			return this;
		},
		searchManga: function(){
			var mangaName = $(this.el).find('#searchMangaName').val();
			ReaderObj.searchManga(
				mangaName,
				$('.mangahost:checked').map(function(){return this.id}).get(),
				function(tpl,obj){
					$('#search-results').html(tpl);
				}
			);
		},
		manga_link_click: function(){
			// return false;
		}
	});

	var Controller = Backbone.Router.extend({
		routes: {
			"": "home", // Пустой hash-тэг
			"!/": "home", // Начальная страница
			"!/home": "home", // Начальная страница
			"!/search": "search", // Блок удачи
			"!/manga/:hostname/:mangaPath(/:vol)(/:chapter)(/:page)" : "manga"
		},

		home: function () {
			appState.set({ state: "home" });
		},

		search: function () {
			appState.set({ state: "search" });
		},
		manga: function(hostname, mangaPath, volume, chapter, page) {
			var info = ReaderObj.getMangaInfo(hostname, mangaPath);
			var pages = {}
			if (!$.isEmptyObject(volume) && !$.isEmptyObject(chapter)){
				pages = ReaderObj.getPages(hostname,mangaPath,volume,chapter);
				console.log(pages);
			}
			appState.set({ 
				state     : "manga",
				hostname  : hostname,
				mangaPath : mangaPath,
				mangaInfo : info,
				pages     : pages,
				page      : page
			});
		}
	});

	appState = new AppState();
	block = new Block({ model: appState });
	controller = new Controller(); // Создаём контроллер
	Backbone.history.start();

	//controller.navigate("!/home",{trigger:true})
});