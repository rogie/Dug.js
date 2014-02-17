/*

 @name		 Dug.js — A JSONP to HTML Script
 @author     Rogie King <rogiek@gmail.com>
 @version	 1.0
 @license    WTFPL — http://en.wikipedia.org/wiki/WTFPL
 @donate	 My paypal email is rogiek@gmail.com if you want to buy me a brew.

*/

var dug = function( opts ){

	if(this.constructor != dug ){
		dug.instance = new dug( opts ).show();
		return dug.instance;
	}

	var options = {
			target: null,
			endpoint: '',
			templateDelimiters: ['{{','}}'],
			callbackParam: 'callback',
			cacheExpire: 1000 * 60 * 2,
			beforeRender: function(){},
			afterRender: function(){},
			success: function(){},
			error: function(){},
			template: 'You need a template, silly :P'
		},
		getTemplate = function( template ){
			var template = template || options.template,
				tpl;
			if( template.match(/^(#|\.)\w/) ){
				if( 'querySelectorAll' in document ){
					tpl = document.querySelectorAll( template );
					if( tpl.length > 0 ){
						tpl = tpl[0];
					}
				} else {
					tpl = document.getElementById( template.replace(/^#/,'') );
				}
				if( tpl && 'tagName' in tpl ){
					template = tpl.innerHTML;
				}
			}
			return template;
		},
		ext = function(o1,o2){
			for(var key in o2){
				if( key in o1 ){
					if( o1[key] && o1[key].constructor == Object ){
						ext(o1[key],o2[key]);
					}else{
						o1[key] = o2[key];
					}
				}
			}
		},
		ago = function(time){
			var date = new Date((time || "")),
				diff = (((new Date()).getTime() - date.getTime()) / 1000),
				day_diff = Math.floor(diff / 86400);
			if ( isNaN(day_diff) || day_diff < 0)
				return;
			return day_diff == 0 && (
					diff < 60 && "just now" ||
					diff < 120 && "1 minute ago" ||
					diff < 3600 && Math.floor(diff/60) + " minutes ago" ||
					diff < 7200 && "1 hour ago" ||
					diff < 86400 && Math.floor(diff/3600) + " hours ago") ||
				  day_diff == 1 && "Yesterday" ||
				  day_diff < 7 && day_diff + " days ago" ||
				  day_diff < 31 && Math.ceil(day_diff/7) + " week" + (Math.ceil(day_diff/7) > 1? 's' : '') + " ago" ||
				  day_diff < 365 && Math.ceil(day_diff/30) + " months ago" ||
				  day_diff >= 365 && Math.ceil(day_diff/365) + " year" + (Math.ceil(day_diff/365)>1?"s":"") + " ago";
		},
		cache = function( key, json ){
			if( (typeof localStorage !== undefined) && (typeof JSON !== undefined) ){
				var now = new Date().getTime(),
					cachedData = null;
				if( json == undefined ){
					try{ cachedData = JSON.parse(unescape(localStorage.getItem(key))); }catch(e){}
					if( cachedData ){
						if( (now - cachedData.time) < options.cacheExpire ){
							cachedData = cachedData.data;
						} else {
							localStorage.removeItem(key);
							cachedData = null;
						}
					}else{
						cachedData = null;
					}
					return cachedData;
				}else{
					try{
						localStorage.setItem(key, escape(JSON.stringify({time:now,data:json})));
					}catch(e){
						console.log(e);
					}
				}
			}else{
				return null;
			}
		},
		get = function(){
			dug.requests = (dug.requests == undefined? 1:dug.requests+1);
			var get = document.createElement('script');
			var	callkey = 'callback' + dug.requests,
				kids = document.body.children,
				script = document.scripts[document.scripts.length-1],
				url = render(options.endpoint),
				scriptInBody = script.parentNode.nodeName != 'head';
				dug[callkey] = function(json,cached){
					json = json.results? json.results : json;
					if( cached !== true ){
						cache(url,json);
					}
					var vessel = document.createElement('div');
					options.beforeRender.call(this,json);
					vessel.innerHTML = render( getTemplate() ,json, options.templateDelimiters);
					if( options.target == null ){
						script.parentNode.insertBefore(vessel,script);
						options.target = vessel;
					}else{
						if( options.target.nodeName ){
							options.target.innerHTML = vessel.innerHTML;
						}else if (typeof options.target == 'string' ){
							document.getElementById(options.target).innerHTML = vessel.innerHTML;
						}
					}
					options.afterRender.call(this,options.target);
					options.success.call(this,json);
				}
				get.onerror = options.error;
			if( cachedData = cache(url) ){
				dug[callkey](cachedData,true);
			}else{
				get.src = url + (url.indexOf('?') > -1? '&': '?') + options.callbackParam + '=dug.' + callkey;
				document.getElementsByTagName('head')[0].appendChild(get);
			}
		},
		init = function( opts ){
			if( opts && opts != undefined ){
				if (opts.constructor == Object) {
					ext(options,opts);
				}
			}
		};

	//private methods
	function render( tpl, data, delims ){

		tpl = unescape(tpl);

		function dotData( d,dotKey ){
   	   		var invert = '';

   	   		//run filters
   	   		var filters = dotKey.split('|'),
   	   			name 	= filters.shift();

   	   		if( name.indexOf("!") > -1 ){
   	   			name = name.replace(/!/ig,'');
   	   			invert = '!';
   	   		}
   	   		try{
   	   			val = eval(invert + "d['" + name.split('.').join("']['") + "']");
   	   			if( filters ){
   	   				for( var i =0, max = filters.length; i < max; ++i ){
   	   					var chunks = filters[i].split(':'),
   	   						filter = chunks.shift(),
   	   						params = chunks;

   	   					f = eval(filter);

	   	   				if( typeof f == 'function' ){
	   	   					newval = f.apply(d,[val].concat(params) );
	   	   				}
	   	   				val = newval;
	   	   			}
   	   			}
   	   		}catch(e){
   	   			val = '';
   	   		}
   	   		return val;
   		}
   		var delims = delims || ['{{','}}'];
   		var scopeMatch = new RegExp(delims[0] + '[^' + delims[1] + ']*' + delims[1], 'igm' );
                var matches = tpl.match(scopeMatch);

                if (!matches)
                    return tpl;

                matches.forEach(function(m) {
                        tagMatch 	= new RegExp(delims[0] + '|' + delims[1],'ig'),
                        scopeName 	= m.replace(tagMatch,'');

		   	// # = scope iterator
		   	if( scopeName[0] == '#' ){
		   		name = scopeName.slice(1,scopeName.length);
		   		startFrag 	= tpl.indexOf( m );
		   		endFrag 	= tpl.indexOf( m.replace('#','/') ) + m.length;
		   		frag 		= tpl.substring( startFrag + m.length , endFrag - m.length );
		   		dataFrag    = dotData( data, name );
		   		rendered    = '';

		   		//loop over the scope
		   		if( dataFrag ){
			   		if( dataFrag.constructor == Array ){
			   			for( var i = 0, max = dataFrag.length; i < max; ++i ){
			   				rendered += render( frag, dataFrag[i] );
			   			}
			   		}else{
			   			rendered = render( frag, dataFrag, delims );
			   		}
			   		//recalculate fragment position (as contents may have shifted in flight)
			   		startFrag 	= tpl.indexOf( m );
		   			endFrag 	= tpl.indexOf( m.replace('#','/') ) + m.length;
			   		tpl = tpl.slice(0,startFrag) + rendered + tpl.slice(endFrag,tpl.length);
		   		}

		   	// regular variable
		   	} else {

		   		val = dotData(data,scopeName) || '';
		   		tpl = tpl.replace( m, val );
		   	}
		});
	   return tpl;
	}

	//public methods (getter/setters)
	for( var o in options ){
		(function(methodName){
			this[methodName] = function( arg ){
			if( arguments.length ){
				options[methodName] = arg;
			} else {
				return options[methodName];
			}
		}
		}).call(this,o);
	}

	this.show = function( opts ){
		init( opts );
		get();
		return this;
	}

	//utility methods
	dug.render = render;
	dug.extend = ext;
	dug.cache  = cache;
	dug.ago    = ago;

	init( opts );
}
//so that we can read vars
dug._script = document.scripts[document.scripts.length-1];

