angular.module('prosePair').service('listService', function(){
	var service = {};
	var cache = {};

	service.cleanDate = function(date){
		if (!date){
			var d = new Date();
    		var curr_date = d.getDate();
    		var curr_month = d.getMonth() + 1; 
    		var curr_year = d.getFullYear();

    		return curr_date + "-" + curr_month + "-" + curr_year;

		}else{
			var parts = date.toString().split('T')[0].split('-')
    		return parts[1] + "-" + parts[2] + "-" + parts[0];
		}
    	
	};

	service.getPageNum = function(name){
		return cache[name].page;
	}

	service.clearCache = function(cName, full){
		if (!full){
			cache[cName].list = [];
			cache[cName].page = 0;
		}else{
			delete cache[cName];
		}
	}

	service.getCache = function(name, dir, callback, fallback){
		switch (dir){
			case 'forward':
				cache[name].page += 1;
				break;
			case 'backward':
				cache[name].page -= 1;
				break;
			case 'start':
				cache[name].page = 0;
		}

		var page = ifCache(name);
		if (page.status){
			callback(page.data);
		}else if (fallback){
			fallback();
		}
	}

	service.forceCache = function(info){
		cache[info.name][info.key] = info.data
	}

	service.reShiftCache = function(cName, newItem, setShift){
		cache[cName].total += 1;

		if (cache[cName].list.length == 0){
			cache[cName].list.push([newItem]);
		}else{
			for (var p = cache[cName].list.length - 1; p >= 0; p--){
				var currentPage = cache[cName].list[p];

				if (currentPage.length == cache[cName].cap){
					cache[cName].list.push([currentPage.pop()])
				}

				for (var i = currentPage.length; i > 0; i--){
					currentPage[i] = currentPage[i - 1];
				}
			
				if (p > 0){
					currentPage[i] = cache[cName].list[p - 1].pop();
				}else{
					currentPage[i] = newItem;
				}
			
			}
		}

		var max = this.getSkipVal(cName) < 20;
		var min = true;

		setShift(cache[cName].list[0], min, max);
	}

	service.addCache = function(newVal, cName, cap, data, total, callback){
		if (!(cName in cache) || newVal){
			setCache(cName, cap, total);
		}

		putIntoCache(cName, data, function(){
			var list = cache[cName].list[cache[cName].page];
			callback(list);
		});
	};

	service.getMinMax = function(name){
		var min = cache[name].page <= 0;
		var max = cache[name].page == cache[name].list.length - 1 && this.getSkipVal(name) >= cache[name].total;

		return {'max': max, 'min': min};
	};

	service.getSkipVal = function(cName){
		var list = cache[cName].list;
		var cap = cache[cName].cap;
		var skip = 0;

		if (list.length > 0){
			skip += list[list.length - 1].length;

			if (list.length > 1){
				skip += (list.length - 1) * cap;
			}

		}

		return skip;
	};

	function ifCache(cName){
		var page = {
			'status': cache[cName].list.length > cache[cName].page
		}

		if (page.status){
			page.data = cache[cName].list[cache[cName].page];
		}

		return page;
	}

	function setCache(cName, cap, total){
		if (cName in cache){
			delete cache[cName];
		}

		cache[cName] = {
			'list': [],
			'cap': cap,
			'page': 0,
			'total': total
		}
	}

	function isUnique(name, page, id){
		var list = cache[name].list[page];

		for (var i = 0; i < list.length; i++){
			var otherID = list[i]._id;
			if (otherID == id){
				return false;
			}
		}

		return true;
	}

	function putIntoCache(cName, data, callback){

		var index = 0;

		var cArr = cache[cName].list;
		var cap = cache[cName].cap;

		if (cArr.length > 0){
			while (cArr[cArr.length - 1].length < cap && index < data.length){
				if (isUnique(cName, cArr.length - 1, data[index]._id)){
					cArr[cArr.length - 1].push(data[index]);
				}

				index++;
			}
		}

		while (index < data.length){
			var page = [];

			while (page.length < cap && index < data.length){
				page.push(data[index]);
				index++;
			}

			if (page.length > 0){
				cArr.push(page);
			}
		}

		cache[cName].list = cArr;

		if (callback){
			callback();
		}
	}
	
	return service;
});