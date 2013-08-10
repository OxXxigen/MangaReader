ReaderObj.addPlugin({
	name     : "ReadManga",
	lang     : "ru",
	iconPath : "http://readmanga.me/favicon.ico",
	host     : "http://readmanga.me",
	searchManga : function( mangaName ) {
		var mangaObj = [];
		$.ajax({
			url      : "http://readmanga.me/search",
			data     : {q:mangaName},
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
	}
});