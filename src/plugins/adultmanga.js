ReaderObj.addPlugin({
	name     : "AdultManga",
	lang     : "ru",
	host     : "http://adultmanga.ru/",
	iconPath : "http://res.adultmanga.ru/static/0R4VOGUgXUqx2epShobaZ4E2NTNwNZHIKIpnoLLH5tB.ico",
	searchManga : function( mangaName ) {
		var mangaObj = [];
		$.ajax({
			url      : this.host + "search",
			data     : {
				q       : mangaName,
				el_5685 : 'ex', //исключаем из поиска арты и додзинси
				el_2141 : 'ex'
			},
			async    : false,
			dataType : 'html',
			success  : function(data){
				$('.cTable:not(.no-hover) tr',data).each(function(i, row){
					var _td = $('td:eq(1)',row);
					title = $("a:eq(0)",_td).text();
					manga_url = $("a:eq(0)",_td).attr('href');
					manga_pic = $("a:eq(1)",_td).attr('rel');
					if (manga_url === undefined) return true;
					obj = {
						title : title,
						manga_pic : manga_pic,
						manga_url : manga_url
					}
					mangaObj.push(obj);
				});
			}
		});
		return mangaObj;
	},
	getMangaInfo : function( mangaPath ) {
		var titleImagesArr = [],
		    chaptersArray  = [],
		    description    = '';
		$.ajax({
			url      : this.host + mangaPath,
			async    : false,
			dataType : "html",
			success  : function( page ) {
				titleImagesArr = $('a.full-list-pic', page).map(function(){return this.href}).get();
				if ($.isEmptyObject(titleImagesArr))
					titleImagesArr = $('#slider > a', page).map(function(){return this.href}).get();
				description    = $.trim($('.manga-description p:first', page ).text());
				chaptersArray  = $('.cTable:eq(2) tr:not(:first)', page).map(function( id, row ){
					link_obj = $("td:eq(1) a", row);
					status   = $("td:eq(1) sup", row).text();
					link     = link_obj.attr('href');
					tmp      = /vol(\d+)\/(\d+)$/i.exec(link);
					volum    = tmp[1];
					chapter  = tmp[2];
					title = $.trim(link_obj.text().replace(status,'')).replace(/(\s{3}|\n|\t)/g,'');
					return {
						url     : link,
						title   : title,
						volum   : volum,
						chapter : chapter,
						status  : status
					};
				}).get();
			}
		})
		return {
			titleImagesArr : titleImagesArr,
			chaptersArray  : chaptersArray,
			description    : description
		};
	},
	getPages : function( mangaPath, volume , chapter ){
		var pages = {};
		$.ajax({
			url      : this.host + mangaPath + "/vol" + volume + "/" + chapter +'?mature=1',
			async    : false,
			dataType : 'html',
			success  : function(data){
				scriptBlock = $('script:contains(pictures =)', data).html()
				pages = (function(script){
						try{
							eval(script);
						}catch(e){}
						return pictures;
				})(scriptBlock);
			}
		});
		return pages;
	}
});