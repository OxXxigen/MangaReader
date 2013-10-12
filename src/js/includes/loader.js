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
			"keypress #searchMangaName" : "searchMangaReturnKey",
			"click .manga-link" : "manga_link_click",
			"click .btn_add_manga" : "addManga",
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
		addManga : function(e){
			var data   = $(e.target).data(),
				plugin = data.plugin,
				manga  = data.manga
			if ($.isEmptyObject(plugin) || $.isEmptyObject(manga)) throw "Нет данных для сохранения";
			result = confirm("Сохранить мангу?");
			if (retult === false) return false;
			
		},
		searchMangaReturnKey : function(e){
			if (e.keyCode === 13) this.searchManga();
		},
		searchManga: function(event, MangaName){
			var mangaName = $(this.el).find('#searchMangaName').val();
			if (!$.isEmptyObject(MangaName))
				mangaName = MangaName;
			ReaderObj.searchManga(
				mangaName,
				$('.mangahost:checked').map(function(){return this.id}).get(),
				function(tpl,obj){
					console.log(obj);
					appState.set({
						state: "search",
						mangaName : mangaName,
						searchResults: tpl
					});
					if (!$.isEmptyObject(mangaName))
						controller.navigate('!/search/' + mangaName, {trigger: true});
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
			"!/search(/:MangaName)": "search", // Блок удачи
			"!/manga/:hostname/:mangaPath(/:vol)(/:chapter)(/:page)" : "manga"
		},

		home: function () {
			appState.set({ state: "home" });
		},

		search: function (MangaName) {
			appState.set({ state: "search",searchResults:null,mangaName:null});
			if (MangaName) block.searchManga(null,MangaName);
		},
		manga: function(hostname, mangaPath, volume, chapter, page) {
			var info = ReaderObj.getMangaInfo(hostname, mangaPath);
			var pages = {}
			if (!$.isEmptyObject(volume) && !$.isEmptyObject(chapter)){
				pages = ReaderObj.getPages(hostname,mangaPath,volume,chapter);
				var manga_pages = _.template(
									$('#template-manga-window').html(), {
										pages:pages,
										page:page
									});
			}

			appState.set({ 
				state     : "manga",
				hostname  : hostname,
				mangaPath : mangaPath,
				mangaInfo : info,
				pages     : pages,
				page      : page,
				selVolume : volume,
				selChapter : chapter,
				selPage    : page,
				manga_pages : manga_pages
			});

			if (!$.isEmptyObject(pages)) {
				$('#manga-window').modal('show');
				if (!$.isEmptyObject(page)){
					$('#carousel-manga-block').carousel(Number(page));
				} else {
					$('#carousel-manga-block').children('.left.carousel-control').hide();
				}
			}
			imgResize();
		}
	});

	appState = new AppState();
	block = new Block({ model: appState });
	controller = new Controller(); // Создаём контроллер
	Backbone.history.start();

	$('body').on('slid.bs.carousel','#carousel-manga-block',function () {
		var first = $('.carousel-inner .item:first', this).is('.active');
		var last  = $('.carousel-inner .item:last', this).is('.active');

		var currElem = $('.carousel-inner .item.active', this);
		var next = currElem.next().find('img');
		next.attr('src', next.attr('realsrc'));
		$(this).children('.carousel-control').show();
		if (last)
			$(this).children('.right.carousel-control').hide();
		if (first)
			$(this).children('.left.carousel-control').hide();

		var $currImage = currElem.find('img');
		$currImage.attr('src', $currImage.data('lazy-load-src'));
		$currImage.removeAttr('data-lazy-load-src');

		var $nextImage = $('.active.item', this).next('.item').find('img');
		$nextImage.attr('src', $nextImage.data('lazy-load-src'));
		$nextImage.removeAttr('data-lazy-load-src');

		var $prevImage = $('.active.item', this).prev('.item').find('img');
		$prevImage.attr('src', $prevImage.data('lazy-load-src'));
		$prevImage.removeAttr('data-lazy-load-src');

		scrollToImg();

		var id = currElem.find('img:visible').data('img_id');
		$('#page_select').val(id);
	});

	$('body').on('change','#page_select', function(){
		$("#carousel-manga-block").carousel(Number(this.value-1));
	});

	$('body').on('click','#carusel-next',function(){
		$("#carousel-manga-block").carousel('next');
	});

	$('body').on('click','#carusel-prev',function(){
		$("#carousel-manga-block").carousel('prev');
	});

	$('body').on('click','#carousel-manga-block',function(){
		$("#carousel-manga-block").carousel('next');
	});

	$('body').on('change','#changeMangaSelect',function(){
		var mangaUrl = this.value;
		var changeUrl = '!/manga' + mangaUrl;
		controller.navigate(changeUrl, {trigger: true});
	});
	/*$('body').on('click','#btnCloseMangaWindow',function(){
		var changeUrl = '!/manga/' + $(this).data('hostname') + '/' + $(this).data('mangapath');
		controller.navigate(changeUrl, {trigger: true});
	});*/

	$('body').on('click','#btn-resize',function(){
		setZoom();
	});
});

function setZoom() {
	var zoom = localStorage.getItem('zoom') === 'true' ? true : false;
	zoom = !zoom;
	localStorage.setItem('zoom',zoom);
	imgResize();
}

function imgResize(){
	var zoom = localStorage.getItem('zoom') === 'true' ? true : false;
	var height = (zoom) ? screen.height : 'auto';
	var width  = (zoom) ? '' : '100%';
	$('.carousel-inner .item img').css({
		height : height,
		width  : width
	});
}

function scrollToImg(){
	$('.modal').animate({
		scrollTop: $('.modal-body').position().top
	}, 300);
}