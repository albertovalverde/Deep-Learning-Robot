/*!
 * The jSignage digital signage library
 * http://www.spinetix.com/
 * Copyright 2012, SpinetiX S.A.
 * Released under the GPL Version 2 license.
 *
 * Includes code from the jQuery JavaScript Library v1.5.1
 * http://jquery.com/
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * and jQuery v1.11.0
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 * Copyright 2011, The Dojo Foundation
 * Released under the MIT, BSD, and GPL Licenses.
 *
 * $Date: 2016-02-01 16:25:48 +0100 (Mon, 01 Feb 2016) $
 * $Revision: 27884 $
 */

jSignage = signage = (function() {

var version = new String( "1.2.1" );
version.major = 1;
version.minor = 2;
version.revision = 1;

var 
	_jSignage = this.jSignage,
	_$ = this.$,
    jSignage = function( selector, context ) {
        // The jSignage object is actually just the init constructor 'enhanced'
        return new jSignage.fn.init( selector, context, rootjSignage );
    },
    rootjSignage,
    quickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/,
    rnotwhite1 = /\S/,
    trimLeft = /^\s+/,
    trimRight = /\s+$/,
    rdigit = /\d/,
    rvalidchars = /^[\],:{}\s]*$/,
    rvalidescape = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
    rvalidtokens = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
    rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
    rnocache = /<(?:script|style)/i,
    promiseMethods = "then done fail isResolved isRejected promise".split( " " ),
    toString = Object.prototype.toString,
    hasOwn = Object.prototype.hasOwnProperty,
    push = Array.prototype.push,
    slice = Array.prototype.slice,
    trim = String.prototype.trim,
    indexOf = Array.prototype.indexOf,
    class2type = {},
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,
    // #7653, #8125, #8152: local protocol detection
    rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/;

/*
   To optimize run times with many document, jSignage.js may be run only once, and the jSignage object may be shared
   among multiple document, but it still needs some global variables to be unique for each document, which are by
   convention to be put in one single object.
*/

function createStandardXHR() {
	try {
		return new window.XMLHttpRequest();
	} catch( e ) {}
}

function createActiveXHR() {
	try {
		return new window.ActiveXObject( "Microsoft.XMLHTTP" );
	} catch( e ) {}
}

jSignage.parseJSON = function( data ) {
    if ( window.JSON && window.JSON.parse ) {
        return window.JSON.parse( data+"" );
    } else {
	    // Make sure the incoming data is actual JSON
	    // Logic borrowed from http://json.org/json2.js
        data = jSignage.trim( data+"" );
        if ( rvalidchars.test( data.replace( rvalidescape, "@" ).replace( rvalidtokens, "]" ).replace( rvalidbraces, "" ) ) )
		    return (new Function("return " + data))();
	    else
		    jSignage.error( "Invalid JSON: " + data );
	}
};

jSignage.parseXML = function( data ) {
    if ( window.parseXML ) {
        return window.parseXML( data );
    } else if ( window.DOMParser ) {
        var parser = new window.DOMParser();
        return parser.parseFromString( data, "application/xml" );
    }
    jSignage.error( "No XML Parser" );
};

function AjaxSettings( ajaxLocation, ajaxLocParts ) {
    this.url = ajaxLocation;
    this.isLocal = rlocalProtocol.test( ajaxLocParts[ 1 ] );
};

AjaxSettings.prototype = {
    type: "GET",
	global: true,
	processData: true,
	async: true,
	contentType: "application/x-www-form-urlencoded; charset=UTF-8",

    accepts: {
	    xml: "application/xml, text/xml",
	    html: "text/html",
	    svg: "image/svg+xml",
	    text: "text/plain",
	    rss: "application/rss+xml, text/rss+xml, application/xml, text/xml",
	    json: "application/json, text/javascript",
	    "*": "*/*"
    },

    contents: {
	    svg: /svg/,
	    xml: /xml/,
	    html: /html/,
	    json: /json/
    },

    responseFields: {
	    xml: "responseXML",
	    text: "responseText",
	    json: "responseJSON"
    },

    converters: {
	    "* text": window.String,
	    "text html": true,
	    "text svg": true,
	    "text json": jSignage.parseJSON,
	    "text xml": jSignage.parseXML
    },

	// For options that shouldn't be deep extended:
	// you can add your own custom options here if
	// and when you create one that shouldn't be
	// deep extended (see ajaxExtend)
	flatOptions: {
		url: true,
		context: true
	},

    //jsc: 1,

    xhr: window.ActiveXObject!==undefined ? // Support: IE6+
	    function() {
		    // XHR cannot access local files, always use ActiveX for that case
		    return !this.isLocal && /^(get|post|head|put|delete|options)$/i.test( this.type ) && createStandardXHR() || createActiveXHR();
	    } :
	    // For all other browsers, use the standard XMLHttpRequest object
	    createStandardXHR
};

function jSignageGlobal() {
    this.readyBound = false;	    
    this.isReady = false;       // Is the DOM ready to be used? Set to true once it occurs.
    this.readyWait = 1;         // A counter to track how many items to wait for before the ready event fires. See #6781
    this.readyList = null;      // Create readyList deferred
    this.inReadyList = false;   // Are we processing the ready list ?
    this.postLayoutCallback = {};
    this.guuid_counter = 0;
    this.stickyCannedLayer = {};
    this.sticky_counter = 0;
    this.LOCALE = 'en_US';
    this.localeDB = {};
    this.enforceAsciiDigits_ = false;
    this.verticalDevicePixelSize = null;
    this.horizontalDevicePixelSize = null;
    this.getURLFlags = null;
    this.ajaxLocation = document.documentURI;
    if ( !this.ajaxLocation ) {
        try {
	        this.ajaxLocation = location.href;
        } catch( e ) {
	        // Use the href attribute of an A element
	        // since IE will modify it given document.location
	        this.ajaxLocation = document.createElement( "a" );
	        this.ajaxLocation.href = "";
	        this.ajaxLocation = this.ajaxLocation.href;
        }
    }
    this.ajaxLocParts = rurl.exec( this.ajaxLocation.toLowerCase() );
    if ( this.ajaxLocParts===null )
        this.ajaxLocParts = [ "file", "", "" ];
    this.ajaxSettings = new AjaxSettings( this.ajaxLocation, this.ajaxLocParts );
	// Counter for holding the number of active queries
	this.active = 0;
	// Last-Modified header cache for next request
	this.lastModified = {};
	this.etag = {};
}

window.__jSignage__global = new jSignageGlobal();

jSignage.features = {
    textArea: true,         // Supports the <textArea> element of SVG 1.2 and implements it correctly
    animation: true,        // Supports the <animation> element of SVG 1.2
    audio: true,            // Supports the <audio> element of SVG 1.2
    video: true,            // Supports the <video> element of SVG 1.2
    viewportFill: true,     // Supports the viewport-fill attribute of SVG 1.2
    SMILTimeEvent: true,    // Generates beginEvent and endEvent
    SVGAnimation: true,     // Supports SVG animations, including the .beginElement() and .endElement() methods
    animateColor: false,    // Supports deprecated animateColor
    canvas: false,          // Supports canvas element of svg 2.0
    iframe: false           // Supports iframe element of svg 2.0
};

var ua = window.navigator && window.navigator.userAgent || 'SpinetiX';

if ( /Trident\/7\.0/.test( ua ) || /Edge/.test( ua ) ) {
    jSignage.features.Edge = true;
} else if ( /WebKit/.test(ua) ) {
    jSignage.features.WebKit = true;
    if ( !/Chrome/.test(ua) )
        jSignage.features.Safari = true;
} else if ( /Opera/.test(ua) ) {
    jSignage.features.Opera = true;
    jSignage.features.animateColor = true;
} else if ( /MSIE/.test(ua) ) {
    jSignage.features.MSIE = true;
    if ( !Date.now ) Date.now = function now() { return +new Date(); };
    jSignage.originOfTime = Date.now();
} else if ( /Gecko/.test( ua ) ) {
    jSignage.features.Gecko = true;
} else if ( /SpinetiX/.test(ua) ) {
    jSignage.features.SpinetiX = true;
    jSignage.features.canvas = true;
    jSignage.features.iframe = true;
    jSignage.features.animateColor = true;
}

if ( document.implementation ) {
    jSignage.features.textArea = document.implementation.hasFeature( 'http://www.w3.org/Graphics/SVG/feature/1.2/#TextFlow', '' );
    if ( jSignage.features.Opera )
        jSignage.features.textArea = false; // Opera's line breaking and flow layout enging is broken !
    if ( jSignage.features.Gecko || jSignage.features.WebKit || jSignage.features.Edge )
        jSignage.features.textArea = false; // Firefox and WebKit do not support textArea
    if ( jSignage.features.WebKit || jSignage.features.Gecko || jSignage.features.Edge ) {
        jSignage.features.animation = false;
        jSignage.features.audio = false;
        jSignage.features.video = false;
    } else {
        jSignage.features.animation = document.implementation.hasFeature( 'http://www.w3.org/Graphics/SVG/feature/1.2/#Animation', '' );
        jSignage.features.audio = document.implementation.hasFeature( 'http://www.w3.org/Graphics/SVG/feature/1.2/#Audio', '' );
        jSignage.features.video = document.implementation.hasFeature( 'http://www.w3.org/Graphics/SVG/feature/1.2/#Video', '' );
    }
    if ( !jSignage.features.animation || !jSignage.features.audio || !jSignage.features.video ) {
        jSignage.features.SVGAnimation = false; // Won't be able to do a .beginElement on all SMIL elements
        jSignage.features.SMILTimeEvent = false;
    } else {
        jSignage.features.SVGAnimation = document.implementation.hasFeature( 'http://www.w3.org/Graphics/SVG/feature/1.2/#TimedAnimation', '' ) || document.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#Animation', '' ) || document.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#SVG-animation', '' );
        jSignage.features.SMILTimeEvent = document.implementation.hasFeature( 'http://www.w3.org/TR/SVG11/feature#AnimationEventsAttribute', '' );
    }
    jSignage.features.viewportFill = document.implementation.hasFeature( 'http://www.w3.org/Graphics/SVG/feature/1.2/#PaintAttribute', '' );
}

jSignage.fn = jSignage.prototype = {
	constructor: jSignage,
	init: function( selector, context, rootjSignage ) {
		var match, elem, ret, doc;

		// Handle $(""), $(null), or $(undefined)
		if ( !selector ) {
			return this;
		}

		// Handle $(DOMElement)
		if ( selector.nodeType ) {
			this.context = this[0] = selector;
			this.length = 1;
			return this;
		}

		// The svg top element only exists once, optimize finding it
		if ( selector === "svg" && !context && document.documentElement ) {
			this.context = document;
			this[0] = document.documentElement;
			this.selector = "svg";
			this.length = 1;
			return this;
		}

		// Handle XML strings
		if ( typeof selector === "string" ) {
			// Are we dealing with XML string or an ID?
			match = quickExpr.exec( selector );

			// Verify a match, and that no context was specified for #id
			if ( match && (match[1] || !context) ) {

				// HANDLE: $(xml) -> $(array)
				if ( match[1] ) {
					context = context instanceof jSignage ? context[0] : context;
					doc = (context ? context.ownerDocument || context : document);
					selector = jSignage.buildFragment( [ match[1] ], doc );
					jSignage.merge( this, selector );
				    // HANDLE: $(html, props)
					if ( rsingleTag.test( match[1] ) && jSignage.isPlainObject( context ) ) {
					    for ( match in context ) {
					        // Properties of context are called as methods if possible
					        if ( jSignage.isFunction( this[match] ) ) {
					            this[match]( context[match] );

					            // ...and otherwise set as attributes
					        } else {
					            this.attr( match, context[match] );
					        }
					    }
					}
					return this;
				// HANDLE: $("#id")
				} else {
					elem = document.getElementById( match[2] );
					if ( elem && elem.parentNode ) {
						this.length = 1;
						this[0] = elem;
					}

					this.context = document;
					this.selector = selector;
					return this;
				}

			// HANDLE: $(expr, $(...))
			} else if ( !context || context.jsignage ) {
				return (context || rootjSignage).find( selector );

			// HANDLE: $(expr, context)
			// (which is just equivalent to: $(context).find(expr)
			} else {
				return this.constructor( context ).find( selector );
			}

		// HANDLE: $(function)
		// Shortcut for document ready
		} else if ( jSignage.isFunction( selector ) ) {
			return rootjSignage.ready( selector );
		}

		if (selector.selector !== undefined) {
			this.selector = selector.selector;
			this.context = selector.context;
		}

		return jSignage.makeArray( selector, this );
	},

	// Start with an empty selector
	selector: "",

	// The current version of jSignage being used
	jsignage: version,

	// The default length of a jSignage object is 0
	length: 0,

	// The number of elements contained in the matched element set
	size: function() {
		return this.length;
	},

	toArray: function() {
		return slice.call( this, 0 );
	},

	// Get the Nth element in the matched element set OR
	// Get the whole matched element set as a clean array
	get: function( num ) {
		return num == null ?

			// Return a 'clean' array
			this.toArray() :

			// Return just the object
			( num < 0 ? this[ this.length + num ] : this[ num ] );
	},

	// Take an array of elements and push it onto the stack
	// (returning the new matched element set)
	pushStack: function( elems, name, selector ) {
		// Build a new jSignage matched element set
		var ret = this.constructor();

		if ( jSignage.isArray( elems ) ) {
			push.apply( ret, elems );

		} else {
			jSignage.merge( ret, elems );
		}

		// Add the old object onto the stack (as a reference)
		ret.prevObject = this;

		ret.context = this.context;

		if ( name === "find" ) {
			ret.selector = this.selector + (this.selector ? " " : "") + selector;
		} else if ( name ) {
			ret.selector = this.selector + "." + name + "(" + selector + ")";
		}

		// Return the newly-formed element set
		return ret;
	},

	// Execute a callback for every element in the matched set.
	// (You can seed the arguments with an array of args, but this is
	// only used internally.)
	each: function( callback, args ) {
		return jSignage.each( this, callback, args );
	},

	ready: function( fn ) {
    	jSignage.ready.promise().done( fn );
	    return this;
    },

	eq: function( i ) {
		return i === -1 ?
			this.slice( i ) :
			this.slice( i, +i + 1 );
	},

	first: function() {
		return this.eq( 0 );
	},

	last: function() {
		return this.eq( -1 );
	},

	slice: function() {
		return this.pushStack( slice.apply( this, arguments ),
			"slice", slice.call(arguments).join(",") );
	},

	map: function( callback ) {
		return this.pushStack( jSignage.map(this, function( elem, i ) {
			return callback.call( elem, i, elem );
		}));
	},

	pop: function() {
		return this.prevObject || this.constructor(null);
	},

	// For internal use only.
	// Behaves like an Array's method, not like a jSignage method.
	push: push,
	sort: [].sort,
	splice: [].splice
};

// Give the init function the jSignage prototype for later instantiation
jSignage.fn.init.prototype = jSignage.fn;

var reImg = /<\s*img(\s+[^>]*)>/g;
var reSrc = /\s+src\s*=\s*["']([^"']+)["']/;
var reTags = /<[^>]*>/g;
var reSpaces = /[\t\n\v\f\r \u00a0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000]+/g;
var reNextLines = /[\r\n].*$/;

jSignage.extend = jSignage.fn.extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !jSignage.isFunction(target) ) {
		target = {};
	}

	// extend jSignage itself if only one argument is passed
	if ( length === i ) {
		target = this;
		--i;
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( jSignage.isPlainObject(copy) || (copyIsArray = jSignage.isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && jSignage.isArray(src) ? src : [];

					} else {
						clone = src && jSignage.isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = jSignage.extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

// String to Object options format cache
var rnotwhite = (/\S+/g);
var optionsCache = {};
var utcTZ = /^UTC(?:\/UTC([+-])(\d\d?)(?:\.(\d\d))?)?$/;

function isArraylike( obj ) {
    var length = obj.length,
		type = jSignage.type( obj );

    if ( type === "function" || jSignage.isWindow( obj ) ) {
        return false;
    }

    if ( obj.nodeType === 1 && length ) {
        return true;
    }
    if ( toString.call(obj) === "[object HTMLCollection]" ){
        // HTMLCollection are object but the in is not implemented by SpinetiX
        return true;
    }

    return type === "array" || length === 0 ||
		typeof length === "number" && length > 0 && ( length - 1 ) in obj;
}

// Convert String-formatted options into Object-formatted ones and store in cache
function createOptions( options ) {
	var object = optionsCache[ options ] = {};
	jSignage.each( options.match( rnotwhite ) || [], function( _, flag ) {
		object[ flag ] = true;
	});
	return object;
}

// Port of jSignage core

jSignage.extend({
	noConflict: function( deep ) {
		window.$ = _$;

		if ( deep ) {
			window.jSignage = _jSignage;
		}

		return jSignage;
	},

	// Hold (or release) the ready event
	holdReady: function( hold ) {
		if ( hold ) {
			window.__jSignage__global.readyWait++;
		} else {
			window.__jSignage__global.ready( true );
		}
	},

	// Handle when the DOM is ready
	ready: function( wait ) {

		// Abort if there are pending holds or we're already ready
		if ( wait === true ? --window.__jSignage__global.readyWait : window.__jSignage__global.isReady ) {
			return;
		}

		// Remember that the DOM is ready
		window.__jSignage__global.isReady = true;

		// If a normal DOM Ready event fired, decrement, and wait if need be
		if ( wait !== true && --window.__jSignage__global.readyWait > 0 ) {
			return;
		}

		// SVG does not define what the default font is. Assume Arial is always there as this probably has the most unicode coverage.
		var svg = document.documentElement;
		if ( !svg.getAttribute( 'font-family' ) )
		    svg.setAttribute( 'font-family', 'Arial' );

		// Fix for missing handling of viewport-fill attribute
		if ( !jSignage.features.viewportFill ) {
		    var viewportFill = svg.getAttribute( 'viewport-fill' );
		    if ( viewportFill!==null && viewportFill!==''  ) {
		        var viewBox = jSignage.getDocumentViewbox();
		        var bg = jSignage._createElement( 'rect', { x: viewBox.x, y:viewBox.y, width:viewBox.width, height:viewBox.height, fill: viewportFill, stroke: 'none' } );
		        for ( var child = svg.firstElementChild; child; child=child.nextElementSibling )
		            if ( child.localName!='set' && child.localName!='animate' )
		                break;
		        svg.insertBefore( bg, child );
		    }
		}

		// If there are functions bound, to execute
		window.__jSignage__global.inReadyList = true;
		window.__jSignage__global.readyList.resolveWith( document, [ jSignage ] );
		window.__jSignage__global.inReadyList = false;

		// Trigger any bound ready events
		if ( jSignage.fn.trigger ) {
			jSignage( document ).trigger("ready").off("ready");
		}
	},

	isFunction: function( obj ) {
		return jSignage.type(obj) === "function";
	},

	isArray: Array.isArray || function( obj ) {
		return jSignage.type(obj) === "array";
	},

	// A crude way of determining if an object is a window
	isWindow: function( obj ) {
		return obj && typeof obj === "object" && ( "setTimeout" in obj || "createTimer" in obj );
	},

	isNaN: function( obj ) {
		return obj == null || !rdigit.test( obj ) || isNaN( obj );
	},

	type: function( obj ) {
		return obj == null ?
			String( obj ) :
			class2type[ toString.call(obj) ] || "object";
	},

	isPlainObject: function( obj ) {
		// Must be an Object.
		// Because of IE, we also have to check the presence of the constructor property.
		// Make sure that DOM nodes and window objects don't pass through, as well
		if ( !obj || jSignage.type(obj) !== "object" || obj.localName || jSignage.isWindow( obj ) ) {
			return false;
		}

		// Not own constructor property must be Object
		if ( obj.constructor &&
			!hasOwn.call(obj, "constructor") &&
			!hasOwn.call(obj.constructor.prototype, "isPrototypeOf") ) {
			return false;
		}

		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.

		var key;
		for ( key in obj ) {}

		return key === undefined || hasOwn.call( obj, key );
	},

	isEmptyObject: function( obj ) {
		for ( var name in obj ) {
			return false;
		}
		return true;
	},

	error: function( msg ) {
		throw msg;
	},

	getDocumentViewbox: function() {
	    var svg = document.documentElement;
	    return svg.getRectTrait ? svg.getRectTrait( 'viewBox' ) : svg.viewBox.baseVal;
	},

	xmlToJSON: function( xml ) {
	    var r = [];
	    if ( xml ) for ( var item=xml.firstElementChild; item; item=item.nextElementSibling ) {
	        var obj = { };
	        for ( var field=item.firstElementChild; field; field=field.nextElementSibling )
	            obj[field.localName] = field.textContent;
	        r.push( obj );
	    }
	    return r;
	},

	parseRSS: function( feed, baseURI, targetChannel, multilineTitle ) {
	    if ( window.parseRSS2 ) {
	        return window.parseRSS2( feed, baseURI, targetChannel, multilineTitle );
	    } else if ( window.parseRSS ) {
	        var doc = window.parseRSS( feed, null, baseURI || './' );
            var data = jSignage.xmlToJSON( doc && doc.documentElement );
            if ( data && !multilineTitle ) {
                for ( var i=0; i<data.length; i++ ) {
                    var title = data[i].title;
                    if ( title )
                        data[i].title = title.replace( reNextLines, '' );
                }
            }
            return data;
        } else if ( window.DOMParser ) {
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString( feed, "text/xml" );
            var rss = xmlDoc.documentElement;
            var r = [ ], filteredOut = targetChannel ? true :  false ;
            if ( rss ) for ( var channel=rss.firstElementChild; channel; channel=channel.nextElementSibling ) {
                if ( channel.localName=='channel' ) {                    
                    for ( var item=channel.firstElementChild; item; item=item.nextElementSibling ) {
                        var name = item.localName, cobj = { };
                        if ( name=='link' ) {
                            cobj.channel = item.textContent;
                            filteredOut = targetChannel && cobj.channel!=targetChannel;
                        } else if ( name=='title' ) {
                            cobj.channelTitle = item.textContent.replace( reTags, '' ).replace( reSpaces, ' ' );
                            if ( !multilineTitle )
                                cobj.channelTitle = cobj.channelTitle.replace( reNextLines, '' );
                        } else if ( name=='description' ) {
                            cobj.channelDescription = item.textContent.replace( reTags, '' ).replace( reSpaces, ' ' );
                        } else if ( name=='image' ) {
                            for ( var url = item.firstElementChild; url; url=url.nextElementSibling ) {
                                if ( url.localName=='url' ) {
                                    cobj.image = url.textContent;
                                    break;
                                }
                            }
                        } else if ( name=='item' && !filteredOut ) {
                            var obj = { }, url='', weakUrl='';
                            for ( var k in cobj )
                                obj[k] = cobj[k];
                            for ( var field=item.firstElementChild; field; field=field.nextElementSibling ) {
                                var t = field.textContent, img, src;
                                if ( field.localName=='description' && !weakUrl ) {
                                    while ( img=reImg.exec( t ) ) {
                                        var tag = img[1];
                                        var src = reSrc.exec( tag );
                                        if ( src ) {
                                            weakUrl = src[1];
                                            break;
                                        }
                                    }                            
                                }
                                if ( field.localName=='enclosure' ) {
                                    if ( !url )
                                        url = field.getAttribute( 'url' );
                                } else if ( field.localName=='content' && field.namespaceURI=='http://search.yahoo.com/mrss/' ) {
                                    if ( !url )
                                        url = field.getAttribute( 'url' );
                                } else {
                                    var v = t.replace( reTags, '' ).replace( reSpaces, ' ' );
                                    if ( field.localName=='title' && !multilineTitle )
                                        v = v.replace( reNextLines, '' );
	                                obj[field.localName] = v;
	                            }
	                        }
	                        if ( url || weakUrl )
	                            obj.enclosure = url || weakUrl;
	                        r.push( obj );
                        }
                    }
                }
            }
            return r;
        }
        return [];
	},

	parseCSV: function( csv, separator, columns, keepNSWSP, keepQuotes ) {
        if ( window.parseCSV2 )
            return parseCSV2( csv, separator, columns, keepNSWSP, keepQuotes );

	    var array = [];

	    if ( !separator )
	        separator = ',';

        if ( keepQuotes ) {
            lines = csv.split( /[\r\n]+/ );
            var reSplitCSVColumns = keepNSWSP ? separator : new RegExp( ' *'+separator+' *' );
            var i = 0;
            if ( !columns ) {
                i = 1;
                columns = lines[0].split( reSplitCSVColumns );
            }
            for ( ; i<lines.length; i++ ) {
                var v = lines[i].split( reSplitCSVColumns ), obj = { };
                for ( var j=0; j<columns.length && j<v.length; j++ )
                    if ( columns[j] )
                        obj[columns[j]] = v[j];
                array.push( obj );
            }
	    } else {
	        var reMatchCSVColumn = new RegExp( '(?: *"((?:[^"]*(?:"")?)*)" *|' + ( keepNSWSP ? '(.*?)' : ' *(.*?) *' ) + ')(?:'+separator+'|([\r\n]+)|($))', 'g' );
	        var reDoubleQuotes = /""/g;
	        var eof = false;
	        function readLine() {
	            var v = [];
	            while ( true ) {
	                var start = reMatchCSVColumn.lastIndex;
	                var r = reMatchCSVColumn.exec( csv );
	                if ( !r || r.index!=start ) {
	                    eof = true;
	                    break;
	                }
	                v.push( r[1] ? r[1].replace( reDoubleQuotes, '"' ) : r[2] );
	                if ( r[3] ) // EOL
	                    break;
	                if ( r[4]!==undefined ) {
	                    eof = true;
	                    break;
	                }
	            }
	            return v;
	        }
	        if ( !columns )
	            columns = readLine();
	        while ( !eof ) {
                var v = readLine(), obj = { };
                for ( var j=0; j<columns.length && j<v.length; j++ )
                    if ( columns[j] )
                        obj[columns[j]] = v[j];
                array.push( obj );
	        }
	    }

        return array;
	},

	parseTXT: function( text ) {
	    return text.split( /[\r\n]+/ );
	},

	parseICAL: function( text, start, end, maxItems ) {
	    if ( window.parseICAL ) {
	        var calendar = window.parseICAL( text );
	        if ( calendar ) {
	            var data = null;
	            if ( calendar.getScheduleAsJSON ) {
	                data = calendar.getScheduleAsJSON( start || Date.now(), end || Date.now()+316e9, maxItems || 0 );
	            } else {
	                var doc = calendar.getScheduleAsRSS( start, end, null );
	                data = jSignage.xmlToJSON( doc && doc.documentElement );
	                if ( data && data.length > maxItems )
	                    data = data.slice( 0, maxItems );
	            }
                return data;
	        }
	    }
	    return [];
	},

	localTime: function( epoch_ms, olson_city_name ) {
        if ( document.documentElement.previewMode ) 
            return new Date("Sept 30, 2036 22:10:27");
	    if ( Date.localTime )
	        return Date.localTime( epoch_ms, olson_city_name );
	    var utc = utcTZ.exec( olson_city_name );
	    if ( utc ) {
	        var offsetInMinutes = 0;
	        if ( utc[1] ) {
	            if ( utc[2] )
	                offsetInMinutes += parseInt( utc[2], 10 ) * 60;
	            if ( utc[3] )
	                offsetInMinutes += parseInt( utc[3], 10 );
	            if ( utc[1] == '-' )
	                offsetInMinutes = -offsetInMinutes;
	        }
	        var d = new Date( epoch_ms + offsetInMinutes * 60000 );
	        return new Date( d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getMilliseconds() );
	    }
	    if ( olson_city_name && typeof ( moment ) == 'function' ) {
	        var d = moment( epoch_ms ).tz( olson_city_name );
	        return new Date( d.year(), d.month(), d.date(), d.hours(), d.minutes(), d.seconds(), d.milliseconds() );
	    }
	    return new Date( epoch_ms );
	},

	timeLocal: function( date, olson_city_name ) {
	    if ( Date.timeLocal )
	        return Date.timeLocal( date, olson_city_name );
	    var utc = utcTZ.exec( olson_city_name );
	    if ( utc ) {
	        var offsetInMinutes = 0;
	        if ( utc[1] ) {
	            if ( utc[2] )
	                offsetInMinutes += parseInt( utc[2], 10 ) * 60;
	            if ( utc[3] )
	                offsetInMinutes += parseInt( utc[3], 10 );
	            if ( utc[1] == '-' )
	                offsetInMinutes = -offsetInMinutes;
	        }
	        return Date.UTC( date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds() ) - offsetInMinutes * 60000;
	    }
	    if ( olson_city_name && typeof ( moment ) == 'function' )
	        return moment.tz( date.getTime(), olson_city_name ).valueOf();
        return date.getTime();
	},

	noop: function() {},

	// Evalulates a script in a global context
	globalEval: function( data ) {
		if ( data && rnotwhite1.test(data) ) {
			// Inspired by code by Andrea Giammarchi
			// http://webreflection.blogspot.com/2007/08/global-scope-evaluation-and-dom.html
			var head = document.documentElement,
				script = document.createElementNS( document.documentElement.namespaceURI, "script" );
			script.textContent = data;
			// Use insertBefore instead of appendChild to circumvent an IE6 bug.
			// This arises when a base node is used (#2709).
			head.insertBefore( script, head.firstElementChild );
			head.removeChild( script );
		}
	},

	nodeName: function( elem, name ) {
		return elem.localName && elem.localName.toUpperCase() === name.toUpperCase();
	},

    // args is for internal usage only
	each: function ( obj, callback, args ) {
	    var value,
			i = 0,
			length = obj.length,
			isArray = isArraylike( obj );

	    if ( args ) {
	        if ( isArray ) {
	            for ( ; i < length; i++ ) {
	                value = callback.apply( obj[i], args );

	                if ( value === false ) {
	                    break;
	                }
	            }
	        } else {
	            for ( i in obj ) {
	                value = callback.apply( obj[i], args );

	                if ( value === false ) {
	                    break;
	                }
	            }
	        }

	        // A special, fast, case for the most common use of each
	    } else {
	        if ( isArray ) {
	            for ( ; i < length; i++ ) {
	                value = callback.call( obj[i], i, obj[i] );

	                if ( value === false ) {
	                    break;
	                }
	            }
	        } else {
	            for ( i in obj ) {
	                value = callback.call( obj[i], i, obj[i] );

	                if ( value === false ) {
	                    break;
	                }
	            }
	        }
	    }

	    return obj;
	},

	// Use native String.trim function wherever possible
	trim: trim ?
		function( text ) {
			return text == null ?
				"" :
				trim.call( text );
		} :

		// Otherwise use our own trimming functionality
		function( text ) {
			return text == null ?
				"" :
				text.toString().replace( trimLeft, "" ).replace( trimRight, "" );
		},

    // results is for internal usage only
	makeArray: function ( arr, results ) {
	    var ret = results || [];

	    if ( arr != null ) {
	        if ( isArraylike( Object( arr ) ) ) {
	            jSignage.merge( ret,
					typeof arr === "string" ?
					[arr] : arr
				);
	        } else {
	            push.call( ret, arr );
	        }
	    }

	    return ret;
	},

	inArray: function ( elem, arr, i ) {
	    var len;

	    if ( arr ) {
	        if ( arr.indexOf )
	            return arr.indexOf( elem, i );

	        len = arr.length;
	        i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

	        for ( ; i < len; i++ ) {
	            // Skip accessing in sparse arrays
	            if ( arr[i] === elem ) {
	                return i;
	            }
	        }
	    }

	    return -1;
	},

	merge: function( first, second ) {
		var i = first.length,
			j = 0;

		if ( typeof second.length === "number" ) {
			for ( var l = second.length; j < l; j++ ) {
				first[ i++ ] = second[ j ];
			}

		} else {
			while ( second[j] !== undefined ) {
				first[ i++ ] = second[ j++ ];
			}
		}

		first.length = i;

		return first;
	},

	grep: function( elems, callback, inv ) {
		var ret = [], retVal;
		inv = !!inv;

		// Go through the array, only saving the items
		// that pass the validator function
		for ( var i = 0, length = elems.length; i < length; i++ ) {
			retVal = !!callback( elems[ i ], i );
			if ( inv !== retVal ) {
				ret.push( elems[ i ] );
			}
		}

		return ret;
	},

    // arg is for internal usage only
	map: function ( elems, callback, arg ) {
	    var value,
			i = 0,
			length = elems.length,
			isArray = isArraylike( elems ),
			ret = [];

	    // Go through the array, translating each of the items to their new values
	    if ( isArray ) {
	        for ( ; i < length; i++ ) {
	            value = callback( elems[i], i, arg );

	            if ( value != null ) {
	                ret.push( value );
	            }
	        }

	        // Go through every key on the object,
	    } else {
	        for ( i in elems ) {
	            value = callback( elems[i], i, arg );

	            if ( value != null ) {
	                ret.push( value );
	            }
	        }
	    }

	    // Flatten any nested arrays
	    return Array.prototype.concat.apply( [], ret );
	},

	// A global GUID counter for objects
	guid: 1,

	proxy: function ( fn, context ) {
	    var args, proxy, tmp;

	    if ( typeof context === "string" ) {
	        tmp = fn[context];
	        context = fn;
	        fn = tmp;
	    }

	    // Quick check to determine if target is callable, in the spec
	    // this throws a TypeError, but we will just return undefined.
	    if ( !jSignage.isFunction( fn ) ) {
	        return undefined;
	    }

	    // Simulated bind
	    args = slice.call( arguments, 2 );
	    proxy = function () {
	        return fn.apply( context || this, args.concat( slice.call( arguments ) ) );
	    };

	    // Set the guid of unique handler to the same of original handler, so it can be removed
	    proxy.guid = fn.guid = fn.guid || jSignage.guid++;

	    return proxy;
	},

	// Mutifunctional method to get and set values to a collection
	// The value/s can be optionally by executed if its a function
	access: function( elems, key, value, exec, fn, pass ) {
		var length = elems.length;

		// Setting many attributes
		if ( typeof key === "object" ) {
			for ( var k in key ) {
				jSignage.access( elems, k, key[k], exec, fn, value );
			}
			return elems;
		}

		// Setting one attribute
		if ( value !== undefined ) {
			// Optionally, function values get executed if exec is true
			exec = !pass && exec && jSignage.isFunction(value);

			for ( var i = 0; i < length; i++ ) {
				fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
			}

			return elems;
		}

		// Getting an attribute
		return length ? fn( elems[0], key ) : undefined;
	},

	now: function() {
		return (new Date()).getTime();
	},

    /*
     * Create a callback list using the following parameters:
     *
     *	options: an optional list of space-separated options that will change how
     *			the callback list behaves or a more traditional option object
     *
     * By default a callback list will act like an event callback list and can be
     * "fired" multiple times.
     *
     * Possible options:
     *
     *	once:			will ensure the callback list can only be fired once (like a Deferred)
     *
     *	memory:			will keep track of previous values and will call any callback added
     *					after the list has been fired right away with the latest "memorized"
     *					values (like a Deferred)
     *
     *	unique:			will ensure a callback can only be added once (no duplicate in the list)
     *
     *	stopOnFalse:	interrupt callings when a callback returns false
     *
     */
    Callbacks: function( options ) {
	    // Convert options from String-formatted to Object-formatted if needed
	    // (we check in cache first)
	    options = typeof options === "string" ?
		    ( optionsCache[ options ] || createOptions( options ) ) :
		    jSignage.extend( {}, options );

	    var // Flag to know if list is currently firing
		    firing,
		    // Last fire value (for non-forgettable lists)
		    memory,
		    // Flag to know if list was already fired
		    fired,
		    // End of the loop when firing
		    firingLength,
		    // Index of currently firing callback (modified by remove if needed)
		    firingIndex,
		    // First callback to fire (used internally by add and fireWith)
		    firingStart,
		    // Actual callback list
		    list = [],
		    // Stack of fire calls for repeatable lists
		    stack = !options.once && [],
		    // Fire callbacks
		    fire = function( data ) {
			    memory = options.memory && data;
			    fired = true;
			    firingIndex = firingStart || 0;
			    firingStart = 0;
			    firingLength = list.length;
			    firing = true;
			    for ( ; list && firingIndex < firingLength; firingIndex++ ) {
				    if ( list[ firingIndex ].apply( data[ 0 ], data[ 1 ] ) === false && options.stopOnFalse ) {
					    memory = false; // To prevent further calls using add
					    break;
				    }
			    }
			    firing = false;
			    if ( list ) {
				    if ( stack ) {
					    if ( stack.length ) {
						    fire( stack.shift() );
					    }
				    } else if ( memory ) {
					    list = [];
				    } else {
					    self.disable();
				    }
			    }
		    },
		    // Actual Callbacks object
		    self = {
			    // Add a callback or a collection of callbacks to the list
			    add: function() {
				    if ( list ) {
					    // First, we save the current length
					    var start = list.length;
					    (function add( args ) {
						    jSignage.each( args, function( _, arg ) {
							    var type = jSignage.type( arg );
							    if ( type === "function" ) {
								    if ( !options.unique || !self.has( arg ) ) {
									    list.push( arg );
								    }
							    } else if ( arg && arg.length && type !== "string" ) {
								    // Inspect recursively
								    add( arg );
							    }
						    });
					    })( arguments );
					    // Do we need to add the callbacks to the
					    // current firing batch?
					    if ( firing ) {
						    firingLength = list.length;
					    // With memory, if we're not firing then
					    // we should call right away
					    } else if ( memory ) {
						    firingStart = start;
						    fire( memory );
					    }
				    }
				    return this;
			    },
			    // Remove a callback from the list
			    remove: function() {
				    if ( list ) {
					    jSignage.each( arguments, function( _, arg ) {
						    var index;
						    while ( ( index = jSignage.inArray( arg, list, index ) ) > -1 ) {
							    list.splice( index, 1 );
							    // Handle firing indexes
							    if ( firing ) {
								    if ( index <= firingLength ) {
									    firingLength--;
								    }
								    if ( index <= firingIndex ) {
									    firingIndex--;
								    }
							    }
						    }
					    });
				    }
				    return this;
			    },
			    // Check if a given callback is in the list.
			    // If no argument is given, return whether or not list has callbacks attached.
			    has: function( fn ) {
				    return fn ? jSignage.inArray( fn, list ) > -1 : !!( list && list.length );
			    },
			    // Remove all callbacks from the list
			    empty: function() {
				    list = [];
				    firingLength = 0;
				    return this;
			    },
			    // Have the list do nothing anymore
			    disable: function() {
				    list = stack = memory = undefined;
				    return this;
			    },
			    // Is it disabled?
			    disabled: function() {
				    return !list;
			    },
			    // Lock the list in its current state
			    lock: function() {
				    stack = undefined;
				    if ( !memory ) {
					    self.disable();
				    }
				    return this;
			    },
			    // Is it locked?
			    locked: function() {
				    return !stack;
			    },
			    // Call all callbacks with the given context and arguments
			    fireWith: function( context, args ) {
				    if ( list && ( !fired || stack ) ) {
					    args = args || [];
					    args = [ context, args.slice ? args.slice() : args ];
					    if ( firing ) {
						    stack.push( args );
					    } else {
						    fire( args );
					    }
				    }
				    return this;
			    },
			    // Call all the callbacks with the given arguments
			    fire: function() {
				    self.fireWith( this, arguments );
				    return this;
			    },
			    // To know if the callbacks have already been called at least once
			    fired: function() {
				    return !!fired;
			    }
		    };

	    return self;
    },

	Deferred: function( func ) {
		var tuples = [
				// action, add listener, listener list, final state
				[ "resolve", "done", jSignage.Callbacks("once memory"), "resolved" ],
				[ "reject", "fail", jSignage.Callbacks("once memory"), "rejected" ],
				[ "notify", "progress", jSignage.Callbacks("memory") ]
			],
			state = "pending",
			promise = {
				state: function() {
					return state;
				},
				always: function() {
					deferred.done( arguments ).fail( arguments );
					return this;
				},
				then: function( /* fnDone, fnFail, fnProgress */ ) {
					var fns = arguments;
					return jSignage.Deferred(function( newDefer ) {
						jSignage.each( tuples, function( i, tuple ) {
							var fn = jSignage.isFunction( fns[ i ] ) && fns[ i ];
							// deferred[ done | fail | progress ] for forwarding actions to newDefer
							deferred[ tuple[1] ](function() {
								var returned = fn && fn.apply( this, arguments );
								if ( returned && jSignage.isFunction( returned.promise ) ) {
									returned.promise()
										.done( newDefer.resolve )
										.fail( newDefer.reject )
										.progress( newDefer.notify );
								} else {
									newDefer[ tuple[ 0 ] + "With" ]( this === promise ? newDefer.promise() : this, fn ? [ returned ] : arguments );
								}
							});
						});
						fns = null;
					}).promise();
				},
				// Get a promise for this deferred
				// If obj is provided, the promise aspect is added to the object
				promise: function( obj ) {
					return obj != null ? jSignage.extend( obj, promise ) : promise;
				}
			},
			deferred = {};

		// Keep pipe for back-compat
		promise.pipe = promise.then;

		// Add list-specific methods
		jSignage.each( tuples, function( i, tuple ) {
			var list = tuple[ 2 ],
				stateString = tuple[ 3 ];

			// promise[ done | fail | progress ] = list.add
			promise[ tuple[1] ] = list.add;

			// Handle state
			if ( stateString ) {
				list.add(function() {
					// state = [ resolved | rejected ]
					state = stateString;

				// [ reject_list | resolve_list ].disable; progress_list.lock
				}, tuples[ i ^ 1 ][ 2 ].disable, tuples[ 2 ][ 2 ].lock );
			}

			// deferred[ resolve | reject | notify ]
			deferred[ tuple[0] ] = function() {
				deferred[ tuple[0] + "With" ]( this === deferred ? promise : this, arguments );
				return this;
			};
			deferred[ tuple[0] + "With" ] = list.fireWith;
		});

		// Make the deferred a promise
		promise.promise( deferred );

		// Call given func if any
		if ( func ) {
			func.call( deferred, deferred );
		}

		// All done!
		return deferred;
	},

	// Deferred helper
	when: function( subordinate /* , ..., subordinateN */ ) {
		var i = 0,
			resolveValues = slice.call( arguments ),
			length = resolveValues.length,

			// the count of uncompleted subordinates
			remaining = length !== 1 || ( subordinate && jSignage.isFunction( subordinate.promise ) ) ? length : 0,

			// the master Deferred. If resolveValues consist of only a single Deferred, just use that.
			deferred = remaining === 1 ? subordinate : jSignage.Deferred(),

			// Update function for both resolve and progress values
			updateFunc = function( i, contexts, values ) {
				return function( value ) {
					contexts[ i ] = this;
					values[ i ] = arguments.length > 1 ? slice.call( arguments ) : value;
					if ( values === progressValues ) {
						deferred.notifyWith( contexts, values );

					} else if ( !(--remaining) ) {
						deferred.resolveWith( contexts, values );
					}
				};
			},

			progressValues, progressContexts, resolveContexts;

		// add listeners to Deferred subordinates; treat others as resolved
		if ( length > 1 ) {
			progressValues = new Array( length );
			progressContexts = new Array( length );
			resolveContexts = new Array( length );
			for ( ; i < length; i++ ) {
				if ( resolveValues[ i ] && jSignage.isFunction( resolveValues[ i ].promise ) ) {
					resolveValues[ i ].promise()
						.done( updateFunc( i, resolveContexts, resolveValues ) )
						.fail( deferred.reject )
						.progress( updateFunc( i, progressContexts, progressValues ) );
				} else {
					--remaining;
				}
			}
		}

		// if we're not waiting on anything, resolve the master
		if ( !remaining ) {
			deferred.resolveWith( resolveContexts, resolveValues );
		}

		return deferred.promise();
	},

	sub: function() {
		function jSignageSubclass( selector, context ) {
			return new jSignageSubclass.fn.init( selector, context );
		}
		jSignage.extend( true, jSignageSubclass, this );
		jSignageSubclass.superclass = this;
		jSignageSubclass.fn = jSignageSubclass.prototype = this();
		jSignageSubclass.fn.constructor = jSignageSubclass;
		jSignageSubclass.subclass = this.subclass;
		jSignageSubclass.fn.init = function init( selector, context ) {
			if ( context && context instanceof jSignage && !(context instanceof jSignageSubclass) ) {
				context = jSignageSubclass(context);
			}

			return jSignage.fn.init.call( this, selector, context, rootjSignageSubclass );
		};
		jSignageSubclass.fn.init.prototype = jSignageSubclass.fn;
		var rootjSignageSubclass = jSignageSubclass(document);
		return jSignageSubclass;
	},

	browser: { svg: true, version: '1.2' },
	
    childNodes: function( elem ) {
        var children = [];
        for ( var e=elem.firstElementChild; e!=null; e=e.nextElementSibling )
            children.push( e );
        return children;
    },

	eachElement: function( ctx, callback ) {
	    var root = ctx.documentElement ? ctx.documentElement : ctx;
	    var x = root;
        for ( var idx=0; x!=null; idx++ ) {
            if ( callback.call( x, idx, x )===false )
                return;
            if ( x.firstElementChild!=null ) {
                x=x.firstElementChild;
            } else do {
                if ( x==root ) {
	                x=null;
                } else if ( x.nextElementSibling!=null ) {
	                x=x.nextElementSibling;
	                break;
                } else {
	                x=x.parentNode;
	            }
            } while ( x!=null );
        }
	}
});

function completed() {
    if ( jSignage.features.MSIE || jSignage.features.Edge )
        window.removeEventListener( "load", completed, false );
	else if ( jSignage.features.Opera || jSignage.features.Gecko )
	    document.documentElement.removeEventListener( 'SVGLoad', completed, false );
	else
	    document.documentElement.removeEventListener( 'load', completed, false );
	jSignage.ready();
}

jSignage.ready.promise = function( obj ) {
	if ( !window.__jSignage__global.readyList ) {
		window.__jSignage__global.readyList = jSignage.Deferred();
		if ( jSignage.features.MSIE || jSignage.features.Edge )
            window.addEventListener( "load", completed, false );
		else if ( jSignage.features.Opera || jSignage.features.Gecko )
		    document.documentElement.addEventListener( 'SVGLoad', completed, false );
		else
		    document.documentElement.addEventListener( 'load', completed, false );
	}
	return window.__jSignage__global.readyList.promise( obj );
};

// Populate the class2type map
jSignage.each("Boolean Number String Function Array Date RegExp Error Object".split(" "), function(i, name) {
	class2type[ "[object " + name + "]" ] = name.toLowerCase();
});

// IE doesn't match non-breaking spaces with \s
if ( rnotwhite1.test( "\xA0" ) ) {
	trimLeft = /^[\s\xA0]+/;
	trimRight = /[\s\xA0]+$/;
}

// All jSignage objects should point back to these
jSignage.rootjSignage = rootjSignage = jSignage(document);

// Cleanup functions for the document ready method
var DOMContentLoaded = function() {
	document.documentElement.removeEventListener( "load", DOMContentLoaded, false );
	jSignage.ready();
};

// Expose jSignage to the global object
return jSignage;

})();

(function() {

jSignage.support = {
	deleteExpando: true,
	noCloneEvent: true
};

var _scriptEval = true;
jSignage.support.scriptEval = function() {
	return _scriptEval;
};

var rbrace = /^(?:\{.*\}|\[.*\])$/;

jSignage.extend({

	// Unique for each copy of jSignage on the page
	// Non-digits removed to match rinlinejSignage
	expando: "jSignage" + ( jSignage.fn.jsignage+ Math.random() ).replace( /\D/g, "" ),

	hasData: function( elem ) {
		elem = elem[ jSignage.expando ];
		return !!elem && !isEmptyDataObject( elem );
	},

	data: function( elem, name, data, pvt /* Internal Use Only */ ) {

		var internalKey = jSignage.expando, getByName = typeof name === "string", thisCache,
            cache = elem,
			id = elem[ jSignage.expando ] && jSignage.expando;

		// Avoid doing any more work than we need to when trying to get data on an
		// object that has no data at all
		if ( (!id || (pvt && id && !cache[ id ][ internalKey ])) && getByName && data === undefined ) {
			return;
		}

		if ( !id ) {
    		id = jSignage.expando;
		}

		if ( !cache[ id ] ) {
			cache[ id ] = { toJSON: jSignage.noop };
		}

		// An object can be passed to jSignage.data instead of a key/value pair; this gets
		// shallow copied over onto the existing cache
		if ( typeof name === "object" || typeof name === "function" ) {
			if ( pvt ) {
				cache[ id ][ internalKey ] = jSignage.extend(cache[ id ][ internalKey ], name);
			} else {
				cache[ id ] = jSignage.extend(cache[ id ], name);
			}
		}

		thisCache = cache[ id ];

		// Internal jSignage data is stored in a separate object inside the object's data
		// cache in order to avoid key collisions between internal data and user-defined
		// data
		if ( pvt ) {
			if ( !thisCache[ internalKey ] ) {
				thisCache[ internalKey ] = {};
			}

			thisCache = thisCache[ internalKey ];
		}

		if ( data !== undefined ) {
			thisCache[ name ] = data;
		}

		// TODO: This is a hack for 1.5 ONLY. It will be removed in 1.6. Users should
		// not attempt to inspect the internal events object using jSignage.data, as this
		// internal data object is undocumented and subject to change.
		if ( name === "events" && !thisCache[name] ) {
			return thisCache[ internalKey ] && thisCache[ internalKey ].events;
		}

		return getByName ? thisCache[ name ] : thisCache;
	},

	removeData: function( elem, name, pvt /* Internal Use Only */ ) {

		var internalKey = jSignage.expando,
			cache = elem,
			id = jSignage.expando;

		// If there is already no cache entry for this object, there is no
		// purpose in continuing
		if ( !cache[ id ] ) {
			return;
		}

		if ( name ) {
			var thisCache = pvt ? cache[ id ][ internalKey ] : cache[ id ];

			if ( thisCache ) {
				delete thisCache[ name ];

				// If there is no data left in the cache, we want to continue
				// and let the cache object itself get destroyed
				if ( !isEmptyDataObject(thisCache) ) {
					return;
				}
			}
		}

		// See jSignage.data for more information
		if ( pvt ) {
			delete cache[ id ][ internalKey ];

			// Don't destroy the parent cache unless the internal data object
			// had been the only thing left in it
			if ( !isEmptyDataObject(cache[ id ]) ) {
				return;
			}
		}

		var internalCache = cache[ id ][ internalKey ];

		delete cache[ id ];

		// We destroyed the entire user cache at once because it's faster than
		// iterating through each key, but we need to continue to persist internal
		// data if it existed
		if ( internalCache ) {
			cache[ id ] = {
			    toJSON: jSignage.noop
			};
			cache[id][internalKey] = internalCache;
		}
	},

	// For internal use only.
	_data: function( elem, name, data ) {
		return jSignage.data( elem, name, data, true );
	},

	_removeData: function( elem, name ) {
		return jSignage.removeData( elem, name, true );
	}

});

jSignage.fn.extend({
	data: function( key, value ) {
		var data = null;

		if ( typeof key === "undefined" ) {
			if ( this.length ) {
				data = jSignage.data( this[0] );
			}

			return data;

		} else if ( typeof key === "object" ) {
			return this.each(function() {
				jSignage.data( this, key );
			});
		}

		var parts = key.split(".");
		parts[1] = parts[1] ? "." + parts[1] : "";

		if ( value === undefined ) {
			data = this.triggerHandler("getData" + parts[1] + "!", [parts[0]]);

			// Try to fetch any internally stored data first
			if ( data === undefined && this.length ) {
				data = jSignage.data( this[0], key );
				data = dataAttr( this[0], key, data );
			}

			return data === undefined && parts[1] ?
				this.data( parts[0] ) :
				data;

		} else {
			return this.each(function() {
				var $this = jSignage( this ),
					args = [ parts[0], value ];

				$this.triggerHandler( "setData" + parts[1] + "!", args );
				jSignage.data( this, key, value );
				$this.triggerHandler( "changeData" + parts[1] + "!", args );
			});
		}
	},

	removeData: function( key ) {
		return this.each(function() {
			jSignage.removeData( this, key );
		});
	}
});

jSignage.acceptData = function( elem ) {
	var nodeType = +elem.nodeType || 1;
	return nodeType===1 || nodeType===9;
};

function dataAttr( elem, key, data ) {
	// If nothing was found internally, try to fetch any
	// data from the HTML5 data-* attribute
	if ( data === undefined && elem.nodeType===1 ) {
		data = elem.getAttribute( "data-" + key );

		if ( typeof data === "string" ) {
			try {
				data = data === "true" ? true :
				data === "false" ? false :
				data === "null" ? null :
				!jSignage.isNaN( data ) ? parseFloat( data ) :
					rbrace.test( data ) ? jSignage.parseJSON( data ) :
					data;
			} catch( e ) {}

			// Make sure we set the data so it isn't changed later
			jSignage.data( elem, key, data );

		} else {
			data = undefined;
		}
	}

	return data;
}

// TODO: This is a hack for 1.5 ONLY to allow objects with a single toJSON
// property to be considered empty objects; this property always exists in
// order to make sure JSON.stringify does not expose internal metadata
function isEmptyDataObject( obj ) {
	for ( var name in obj ) {
		if ( name !== "toJSON" ) {
			return false;
		}
	}

	return true;
}

var rreturn = /\r/g,
	rspecialurl = /^(?:href|src|style)$/;

jSignage.fn.extend({
	attr: function( name, value ) {
		return jSignage.access( this, name, value, true, jSignage.attr );
	},

	removeAttr: function( name, fn ) {
	    return this.attr( name, null );
	},

});

jSignage.extend({
	attrFn: {
		val: true,
		css: true,
		html: true,
		text: true,
		data: true,
		width: true,
		height: true,
		offset: true
	},

	attr: function( elem, name, value, pass ) {
		if ( !elem  )
			return undefined;

		if ( pass && name in jSignage.attrFn )
			return jSignage(elem)[name](value);

		var set = value !== undefined;  // Whether we are setting (or getting)

		if ( elem.nodeType===1 ) {
		    var attr;
		    if ( name=='xlink:href' || name=='href' ) {
			    if ( set ) {
			        if ( value===null )
			            elem.removeAttributeNS( jSignage.xlinkNS, 'href' );
			        else
				        elem.setAttributeNS( jSignage.xlinkNS, 'href', value );
	            }
			    if ( elem.hasAttributeNS && !elem.hasAttributeNS( jSignage.xlinkNS, 'href' ) )
				    return undefined;

			    attr = elem.getAttributeNS( jSignage.xlinkNS, 'href' );
		    } else {
			    if ( set ) {
			        if ( value===null )
			            elem.removeAttribute( name );
			        else
				        elem.setAttribute( name, value );
	            }
			    if ( elem.hasAttribute && !elem.hasAttribute( name ) )
				    return undefined;

			    attr = elem.getAttribute( name );
			}

			// Non-existent attributes return null, we normalize to undefined
			return attr === null ? undefined : attr;
		}

		// Handle everything which isn't a DOM element node
		if ( set ) {
		    if ( value===null )
		        delete elem.name;
		    else
			    elem[ name ] = value;
		}
		return elem[ name ];
	}
});

})();

/*!
 * Sizzle CSS Selector Engine
 *  Copyright 2011, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true,
	rBackslash = /\\/g,
	rNonWord = /\W/;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function() {
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function( selector, context, results, seed ) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var m, set, checkSet, extra, ret, cur, pop, i,
		prune = true,
		contextXML = Sizzle.isXML( context ),
		parts = [],
		soFar = selector;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec( "" );
		m = chunker.exec( soFar );

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {

		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );

		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set );
			}
		}

	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {

			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ?
				Sizzle.filter( ret.expr, ret.set )[0] :
				ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );

			set = ret.expr ?
				Sizzle.filter( ret.expr, ret.set ) :
				ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray( set );

			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}

		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );

		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}

		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}

	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function( results ) {
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort( sortOrder );

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[ i - 1 ] ) {
					results.splice( i--, 1 );
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function( expr, set ) {
	return Sizzle( expr, null, null, set );
};

Sizzle.matchesSelector = function( node, expr ) {
	return Sizzle( expr, null, null, [node] ).length > 0;
};

Sizzle.find = function( expr, context, isXML ) {
	var set;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var match,
			type = Expr.order[i];
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice( 1, 1 );

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace( rBackslash, "" );
				set = Expr.find[ type ]( match, context, isXML );

				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
	    if ( typeof context.getElementsByTagName !== "undefined" ) {
		    set =  context.getElementsByTagName( "*" );
		} else {
		    set = [];
		    jSignage.eachElement( context, function() {
		        set.push( this );
		    });
	    }
	}

	return { set: set, expr: expr };
};

Sizzle.filter = function( expr, set, inplace, not ) {
	var match, anyFound,
		old = expr,
		result = [],
		curLoop = set,
		isXMLFilter = set && set[0] && Sizzle.isXML( set[0] );

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				var found, item,
					filter = Expr.filter[ type ],
					left = match[1];

				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;

					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;

								} else {
									curLoop[i] = false;
								}

							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );

			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],

	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/,
		needsContext: /^\s*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(\s*((?:-\\d)?\\d*)\s*\\)|)(?=[^-]|$)/i
	},

	leftMatch: {},

	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},

	attrHandle: {
		href: function( elem ) {
			return elem.getAttribute( "href" );
		},
		type: function( elem ) {
			return elem.getAttribute( "type" );
		}
	},

	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !rNonWord.test( part ),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.localName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},

		">": function( checkSet, part ) {
			var elem,
				isPartStr = typeof part === "string",
				i = 0,
				l = checkSet.length;

			if ( isPartStr && !rNonWord.test( part ) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.localName && parent.localName.toLowerCase() === part ? parent : false;
					}
				}

			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];

					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},

		"": function(checkSet, part, isXML){
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "parentNode", part, doneName, checkSet, nodeCheck, isXML );
		},

		"~": function( checkSet, part, isXML ) {
			var nodeCheck,
				doneName = done++,
				checkFn = dirCheck;

			if ( typeof part === "string" && !rNonWord.test( part ) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn( "previousSibling", part, doneName, checkSet, nodeCheck, isXML );
		}
	},

	find: {
	    ID: function ( match, context, isXML ) {
	        if ( typeof context.getElementById !== "undefined" && !isXML ) {
	            var m = context.getElementById( match[1] );
	            return m ? [m] : [];
	        }
	    },

		NAME: function( match, context ) {
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [],
					results = context.getElementsByName( match[1] );

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			} else {
			    var ret = [];
			    var name = match[1];
			    jSignage.eachElement( context, function() {
			        if ( this.getAttribute('name')==name )
			            ret.push( this );
			    });
			    return ret.length === 0 ? null : ret;
			}
		},

		TAG: function( match, context ) {
			if ( typeof context.getElementsByTagName !== "undefined" ) {
				return context.getElementsByTagName( match[1] );
			} else {
			    var nodes = [];
			    var localName = match[1];
			    jSignage.eachElement( context, function() {
			        if ( this.localName==localName )
			            nodes.push( this );
			    });
			    return nodes;
			}
		}
	},

	preFilter: {
		CLASS: function( match, curLoop, inplace, result, not, isXML ) {
			match = " " + match[1].replace( rBackslash, "" ) + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n\r]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}

					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},

		ID: function( match ) {
			return match[1].replace( rBackslash, "" );
		},

		TAG: function( match, curLoop ) {
			return match[1].replace( rBackslash, "" ).toLowerCase();
		},

		CHILD: function( match ) {
			if ( match[1] === "nth" ) {
				if ( !match[2] ) {
					Sizzle.error( match[0] );
				}

				match[2] = match[2].replace(/^\+|\s*/g, '');

				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}
			else if ( match[2] ) {
				Sizzle.error( match[0] );
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},

		ATTR: function( match, curLoop, inplace, result, not, isXML ) {
			var name = match[1] = match[1].replace( rBackslash, "" );
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			// Handle if an un-quoted value was used
			match[4] = ( match[4] || match[5] || "" ).replace( rBackslash, "" );

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},

		PSEUDO: function( match, curLoop, inplace, result, not ) {
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);

				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);

					if ( !inplace ) {
						result.push.apply( result, ret );
					}

					return false;
				}

			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},

		POS: function( match ) {
			match.unshift( true );

			return match;
		}
	},
	
	filters: {
		enabled: function( elem ) {
			return elem.disabled === false && elem.type !== "hidden";
		},

		disabled: function( elem ) {
			return elem.disabled === true;
		},

		checked: function( elem ) {
			return elem.checked === true;
		},
		
		selected: function( elem ) {
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			if ( elem.parentNode ) {
				elem.parentNode.selectedIndex;
			}
			
			return elem.selected === true;
		},

		parent: function( elem ) {
			return !!elem.firstChild;
		},

		empty: function( elem ) {
			return !elem.firstChild;
		},

		has: function( elem, i, match ) {
			return !!Sizzle( match[3], elem ).length;
		},

		header: function( elem ) {
			return (/h\d/i).test( elem.localName );
		},

		text: function( elem ) {
			// IE6 and 7 will map elem.type to 'text' for new HTML5 types (search, etc) 
			// use getAttribute instead to test this case
			return "text" === elem.getAttribute( 'type' );
		},
		radio: function( elem ) {
			return "radio" === elem.type;
		},

		checkbox: function( elem ) {
			return "checkbox" === elem.type;
		},

		file: function( elem ) {
			return "file" === elem.type;
		},
		password: function( elem ) {
			return "password" === elem.type;
		},

		submit: function( elem ) {
			return "submit" === elem.type;
		},

		image: function( elem ) {
			return "image" === elem.type;
		},

		reset: function( elem ) {
			return "reset" === elem.type;
		},

		button: function( elem ) {
			return "button" === elem.type || elem.localName.toLowerCase() === "button";
		},

		input: function( elem ) {
			return (/input|select|textarea|button/i).test( elem.localName );
		}
	},
	setFilters: {
		first: function( elem, i ) {
			return i === 0;
		},

		last: function( elem, i, match, array ) {
			return i === array.length - 1;
		},

		even: function( elem, i ) {
			return i % 2 === 0;
		},

		odd: function( elem, i ) {
			return i % 2 === 1;
		},

		lt: function( elem, i, match ) {
			return i < match[3] - 0;
		},

		gt: function( elem, i, match ) {
			return i > match[3] - 0;
		},

		nth: function( elem, i, match ) {
			return match[3] - 0 === i;
		},

		eq: function( elem, i, match ) {
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function( elem, match, i, array ) {
			var name = match[1],
				filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );

			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;

			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;

			} else {
				Sizzle.error( name );
			}
		},

		CHILD: function( elem, match ) {
			var type = match[1],
				node = elem;

			switch ( type ) {
				case "only":
				case "first":
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					if ( type === "first" ) { 
						return true; 
					}

					node = elem;

				case "last":
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}

					return true;

				case "nth":
					var first = match[2],
						last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 

						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;

					if ( first === 0 ) {
						return diff === 0;

					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},

		ID: function( elem, match ) {
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},

		TAG: function( elem, match ) {
		    return elem.nodeType === 1 && ( match === "*" || elem.localName.toLowerCase() === match );
		},
		
		CLASS: function( elem, match ) {
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},

		ATTR: function( elem, match ) {
			var name = match[1],
				result = Expr.attrHandle[name] && Expr.attrHandle.hasOwnProperty( name ) ?
					Expr.attrHandle[ name ]( elem ) : elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},

		POS: function( elem, match, i, array ) {
			var name = match[2],
				filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function( array, results ) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

makeArray = function( array, results ) {
	var i = 0,
		ret = results || [];

	if ( toString.call(array) === "[object Array]" ) {
		Array.prototype.push.apply( ret, array );

	} else {
		if ( typeof array.length === "number" ) {
			for ( var l = array.length; i < l; i++ ) {
				ret.push( array[i] );
			}

		} else {
			for ( ; array[i]; i++ ) {
				ret.push( array[i] );
			}
		}
	}

	return ret;
};

var sortOrder, siblingCheck;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( a === b ) {
			hasDuplicate = true;
			return 0;
		}

		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			return a.compareDocumentPosition ? -1 : 1;
		}

		return a.compareDocumentPosition(b) & 4 ? -1 : 1;
	};

} else {
	sortOrder = function( a, b ) {
		var al, bl,
			ap = [],
			bp = [],
			aup = a.parentNode,
			bup = b.parentNode,
			cur = aup;

		// The nodes are identical, we can exit early
		if ( a === b ) {
			hasDuplicate = true;
			return 0;

		// If the nodes are siblings (or identical) we can do a quick check
		} else if ( aup === bup ) {
			return siblingCheck( a, b );

		// If no parents were found then the nodes are disconnected
		} else if ( !aup ) {
			return -1;

		} else if ( !bup ) {
			return 1;
		}

		// Otherwise they're somewhere else in the tree so we need
		// to build up a full list of the parentNodes for comparison
		while ( cur ) {
			ap.unshift( cur );
			cur = cur.parentNode;
		}

		cur = bup;

		while ( cur ) {
			bp.unshift( cur );
			cur = cur.parentNode;
		}

		al = ap.length;
		bl = bp.length;

		// Start walking down the tree looking for a discrepancy
		for ( var i = 0; i < al && i < bl; i++ ) {
			if ( ap[i] !== bp[i] ) {
				return siblingCheck( ap[i], bp[i] );
			}
		}

		// We ended someplace up the tree so do a sibling check
		return i === al ?
			siblingCheck( a, bp[i], -1 ) :
			siblingCheck( ap[i], b, 1 );
	};

	siblingCheck = function( a, b, ret ) {
		if ( a === b ) {
			return ret;
		}

		var cur = a.nextSibling;

		while ( cur ) {
			if ( cur === b ) {
				return -1;
			}

			cur = cur.nextSibling;
		}

		return 1;
	};
}

// Utility function for retreiving the text value of an array of DOM nodes
Sizzle.getText = function( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ )
	    ret += elems[i].textContent;

	return ret;
};

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;

			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
				    if ( !isXML ) {
				        elem.sizcache = doneName;
				        elem.sizset = i;
				    }

				    if ( elem.localName.toLowerCase() === cur ) {
				        match = elem;
				        break;
				    }
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];

		if ( elem ) {
			var match = false;
			
			elem = elem[dir];

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}

					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

if ( document.documentElement.contains ) {
	Sizzle.contains = function( a, b ) {
		return a !== b && (a.contains ? a.contains(b) : true);
	};

} else if ( document.documentElement.compareDocumentPosition ) {
	Sizzle.contains = function( a, b ) {
		return !!(a.compareDocumentPosition(b) & 16);
	};

} else {
	Sizzle.contains = function( a, b ) {
		for ( var p = b.parentNode; p; p = p.parentNode )
		    if ( p===a )
		        return true;
		return false;
	};
}

Sizzle.isXML = function( elem ) {
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;

	return documentElement ? documentElement.localName !== "HTML" : false;
};

var posProcess = function( selector, context ) {
	var match,
		tmpSet = [],
		later = "",
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE
jSignage.find = Sizzle;
jSignage.expr = Sizzle.selectors;
jSignage.expr[":"] = jSignage.expr.filters;
jSignage.unique = Sizzle.uniqueSort;
jSignage.text = Sizzle.getText;
jSignage.isXMLDoc = Sizzle.isXML;
jSignage.contains = Sizzle.contains;

var runtil = /Until$/,
	rparentsprev = /^(?:parents|prevUntil|prevAll)/,
	// Note: This RegExp should be improved, or likely pulled from Sizzle
	rmultiselector = /,/,
	isSimple = /^.[^:#\[\.,]*$/,
	slice = Array.prototype.slice,
	POS = jSignage.expr.match.POS,
	// methods guaranteed to produce a unique set when starting from a unique set
	guaranteedUnique = {
		children: true,
		contents: true,
		next: true,
		prev: true
	};

jSignage.fn.extend({
	find: function( selector ) {
		var ret = this.pushStack( "", "find", selector ),
			length = 0;

		for ( var i = 0, l = this.length; i < l; i++ ) {
			length = ret.length;
			jSignage.find( selector, this[i], ret );

			if ( i > 0 ) {
				// Make sure that the results are unique
				for ( var n = length; n < ret.length; n++ ) {
					for ( var r = 0; r < length; r++ ) {
						if ( ret[r] === ret[n] ) {
							ret.splice(n--, 1);
							break;
						}
					}
				}
			}
		}

		return ret;
	},

	has: function( target ) {
		var targets = jSignage( target );
		return this.filter(function() {
			for ( var i = 0, l = targets.length; i < l; i++ ) {
				if ( jSignage.contains( this, targets[i] ) ) {
					return true;
				}
			}
		});
	},

	not: function( selector ) {
		return this.pushStack( winnow(this, selector, false), "not", selector);
	},

	filter: function( selector ) {
		return this.pushStack( winnow(this, selector, true), "filter", selector );
	},

	is: function( selector ) {
		return !!selector && jSignage.filter( selector, this ).length > 0;
	},

	closest: function( selectors, context ) {
		var ret = [], i, l, cur = this[0];

		if ( jSignage.isArray( selectors ) ) {
			var match, selector,
				matches = {},
				level = 1;

			if ( cur && selectors.length ) {
				for ( i = 0, l = selectors.length; i < l; i++ ) {
					selector = selectors[i];

					if ( !matches[selector] ) {
						matches[selector] = jSignage.expr.match.POS.test( selector ) ?
							jSignage( selector, context || this.context ) :
							selector;
					}
				}

				while ( cur && cur.ownerDocument && cur !== context ) {
					for ( selector in matches ) {
						match = matches[selector];

						if ( match.jsignage ? match.index(cur) > -1 : jSignage(cur).is(match) ) {
							ret.push({ selector: selector, elem: cur, level: level });
						}
					}

					cur = cur.parentNode;
					level++;
				}
			}

			return ret;
		}

		var pos = POS.test( selectors ) ?
			jSignage( selectors, context || this.context ) : null;

		for ( i = 0, l = this.length; i < l; i++ ) {
			cur = this[i];

			while ( cur ) {
				if ( pos ? pos.index(cur) > -1 : jSignage.find.matchesSelector(cur, selectors) ) {
					ret.push( cur );
					break;

				} else {
					cur = cur.parentNode;
					if ( !cur || !cur.ownerDocument || cur === context ) {
						break;
					}
				}
			}
		}

		ret = ret.length > 1 ? jSignage.unique(ret) : ret;

		return this.pushStack( ret, "closest", selectors );
	},

	// Determine the position of an element within
	// the matched set of elements
	index: function( elem ) {
		if ( !elem || typeof elem === "string" ) {
			return jSignage.inArray( this[0],
				// If it receives a string, the selector is used
				// If it receives nothing, the siblings are used
				elem ? jSignage( elem ) : this.parent().children() );
		}
		// Locate the position of the desired element
		return jSignage.inArray(
			// If it receives a jSignage object, the first element is used
			elem.jsignage ? elem[0] : elem, this );
	},

	merge: function( selector, context ) {
		var set = typeof selector === "string" ?
				jSignage( selector, context ) :
				jSignage.makeArray( selector ),
			all = jSignage.merge( this.get(), set );

		return this.pushStack( isDisconnected( set[0] ) || isDisconnected( all[0] ) ?
			all :
			jSignage.unique( all ) );
	},

	andSelf: function() {
		return this.add( this.prevObject );
	}
});

// A painfully simple check to see if an element is disconnected
// from a document (should be improved, where feasible).
function isDisconnected( node ) {
	return !node || !node.parentNode || node.parentNode.nodeType === 11;
}

jSignage.each({
	parent: function( elem ) {
		var parent = elem.parentNode;
		return parent && parent.nodeType !== 11 ? parent : null;
	},
	parents: function( elem ) {
		return jSignage.dir( elem, "parentNode" );
	},
	parentsUntil: function( elem, i, until ) {
		return jSignage.dir( elem, "parentNode", until );
	},
	next: function( elem ) {
		return jSignage.nth( elem, 2, "nextSibling" );
	},
	prev: function( elem ) {
		return jSignage.nth( elem, 2, "previousSibling" );
	},
	nextAll: function( elem ) {
		return jSignage.dir( elem, "nextSibling" );
	},
	prevAll: function( elem ) {
		return jSignage.dir( elem, "previousSibling" );
	},
	nextUntil: function( elem, i, until ) {
		return jSignage.dir( elem, "nextSibling", until );
	},
	prevUntil: function( elem, i, until ) {
		return jSignage.dir( elem, "previousSibling", until );
	},
	siblings: function( elem ) {
		return jSignage.sibling( elem.parentNode.firstChild, elem );
	},
	children: function( elem ) {
		return jSignage.sibling( elem.firstChild );
	},
	contents: function( elem ) {
	    if ( jSignage.nodeName( elem, "iframe" ) )
	        return elem.contentDocument || elem.contentWindow.document;
	    var childNodes = [];
	    for ( var child=elem.firstChild; child; child = child.nextSibling)
	        childNodes.push( child );
	    return jSignage.makeArray( childNodes );
	}
}, function( name, fn ) {
	jSignage.fn[ name ] = function( until, selector ) {
		var ret = jSignage.map( this, fn, until ), args = slice.call(arguments);

		if ( !runtil.test( name ) ) {
			selector = until;
		}

		if ( selector && typeof selector === "string" ) {
			ret = jSignage.filter( selector, ret );
		}

		ret = this.length > 1 && !guaranteedUnique[ name ] ? jSignage.unique( ret ) : ret;

		if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
			ret = ret.reverse();
		}

		return this.pushStack( ret, name, args.join(",") );
	};
});

jSignage.extend({
	filter: function( expr, elems, not ) {
		if ( not ) {
			expr = ":not(" + expr + ")";
		}

		var m = jSignage.find.matches(expr, elems);
		return jSignage.grep( m, function ( x ) {
		    return jSignage.inArray( x, elems ) >= 0;
		} );
	},

	dir: function( elem, dir, until ) {
		var matched = [],
			cur = elem[ dir ];

		while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jSignage( cur ).is( until )) ) {
			if ( cur.nodeType === 1 ) {
				matched.push( cur );
			}
			cur = cur[dir];
		}
		return matched;
	},

	nth: function( cur, result, dir, elem ) {
		result = result || 1;
		var num = 0;

		for ( ; cur; cur = cur[dir] ) {
			if ( cur.nodeType === 1 && ++num === result ) {
				break;
			}
		}

		return cur;
	},

	sibling: function( n, elem ) {
		var r = [];

		for ( ; n; n = n.nextSibling ) {
			if ( n.nodeType === 1 && n !== elem ) {
				r.push( n );
			}
		}

		return r;
	}
});

// Implement the identical functionality for filter and not
function winnow( elements, qualifier, keep ) {
	if ( jSignage.isFunction( qualifier ) ) {
		return jSignage.grep(elements, function( elem, i ) {
			var retVal = !!qualifier.call( elem, i, elem );
			return retVal === keep;
		});

	} else if ( qualifier.nodeType ) {
		return jSignage.grep(elements, function( elem, i ) {
			return (elem === qualifier) === keep;
		});

	} else if ( typeof qualifier === "string" ) {
		var filtered = jSignage.grep(elements, function( elem ) {
			return elem.nodeType === 1;
		});

		if ( isSimple.test( qualifier ) ) {
			return jSignage.filter(qualifier, filtered, !keep);
		} else {
			qualifier = jSignage.filter( qualifier, filtered );
		}
	}

	return jSignage.grep(elements, function( elem, i ) {
		return (jSignage.inArray( elem, qualifier ) >= 0) === keep;
	});
}

})();

jSignage.fn.extend({
	wrapAll: function( html ) {
		if ( jSignage.isFunction( html ) ) {
			return this.each(function(i) {
				jSignage(this).wrapAll( html.call(this, i) );
			});
		}

		if ( this[0] ) {
			// The elements to wrap the target around
			var wrap = jSignage( html, this[0].ownerDocument ).eq(0).clone(true);

			if ( this[0].parentNode ) {
				wrap.insertBefore( this[0] );
			}

			wrap.map(function() {
				var elem = this;

				while ( elem.firstElementChild ) {
					elem = elem.firstElementChild;
				}

				return elem;
			}).append(this);
		}

		return this;
	},

	wrapInner: function( html ) {
		if ( jSignage.isFunction( html ) ) {
			return this.each(function(i) {
				jSignage(this).wrapInner( html.call(this, i) );
			});
		}

		return this.each(function() {
			var self = jSignage( this ),
				contents = self.contents();

			if ( contents.length ) {
				contents.wrapAll( html );

			} else {
				self.append( html );
			}
		});
	},

	wrap: function( html ) {
		return this.each(function() {
			jSignage( this ).wrapAll( html );
		});
	},

	unwrap: function() {
		return this.parent().each(function() {
			if ( !jSignage.nodeName( this, "svg" ) )
				jSignage( this ).replaceWith( jSignage.childNodes(this) );
		}).pop();
	},

	append: function() {
		return this.domManip(arguments, function( elem ) {
		    if ( this.nodeType === 1 || this.nodeType === 9 ) {
		        if ( jSignage.isArray( elem ) ) {
		            for ( var i = 0; i < elem.length; i++ )
		                this.appendChild( elem[i] );
		        } else {
		            this.appendChild( elem );
		        }
		    }
		});
	},

	prepend: function() {
		return this.domManip(arguments, function( elem ) {
		    if ( this.nodeType === 1 || this.nodeType === 9 ) {
		        if ( jSignage.isArray( elem ) ) {
		            for ( var i = elem.length - 1; i >= 0; --i )
		                this.insertBefore( elem[i], this.firstChild );
		        } else {
		            this.insertBefore( elem, this.firstChild );
		        }
		    }
		});
	},

	before: function() {
		if ( this[0] && this[0].parentNode ) {
		    return this.domManip( arguments, function ( elem ) {
		        if ( jSignage.isArray( elem ) ) {
		            for ( var i = 0; i < elem.length; i++ )
		                this.parentNode.insertBefore( elem[i], this );
		        } else {
		            this.parentNode.insertBefore( elem, this );
		        }
			});
		}
	},

	after: function() {
		if ( this[0] && this[0].parentNode ) {
			return this.domManip(arguments, function( elem ) {
			    if ( jSignage.isArray( elem ) ) {
			        for ( var i = elem.length - 1; i >= 0; --i )
			            this.parentNode.insertBefore( elem[i], this.nextSibling );
			    } else {
			        this.parentNode.insertBefore( elem, this.nextSibling );
			    }
			});
		}
	},

	remove: function( selector ) {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ )
			if ( !selector || jSignage.filter( selector, [ elem ] ).length )
				if ( elem.parentNode ) 
					elem.parentNode.removeChild( elem );
		return this;
	},

	empty: function() {
		for ( var i = 0, elem; (elem = this[i]) != null; i++ )
		    elem.textContent = '';
		return this;
	},

	clone: function( dataAndEvents, deepDataAndEvents ) {
		dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
		deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;

		return this.map( function () {
			return jSignage.clone( this, dataAndEvents, deepDataAndEvents );
		});
	},

	replaceWith: function( value ) {
		if ( this[0] && this[0].parentNode ) {
			// Make sure that the elements are removed from the DOM before they are inserted
			// this can help fix replacing a parent with child elements
			if ( jSignage.isFunction( value ) ) {
				return this.each(function(i) {
					var self = jSignage(this), old = self.html();
					self.replaceWith( value.call( this, i, old ) );
				});
			}

			if ( typeof value !== "string" ) {
				value = jSignage( value ).detach();
			}

			return this.each(function() {
				var next = this.nextElementSibling, parent = this.parentNode;

				jSignage( this ).remove();

				if ( next ) {
					jSignage(next).before( value );
				} else {
					jSignage(parent).append( value );
				}
			});
		}
	},

	detach: function( selector ) {
		return this.remove( selector, true );
	},

	domManip: function( args, callback ) {
		var first, fragment, parent, value = args[0];

		if ( jSignage.isFunction(value) ) {
			return this.each(function(i) {
				var self = jSignage(this);
				args[0] = value.call(this, i, undefined);
				self.domManip( args, callback );
			});
		}

		if ( this[0] ) {
            fragment = jSignage.buildFragment( args, this );
            if ( fragment.length == 1 )
		        fragment = fragment[0];
            for ( var i = 0, l = this.length, lastIndex = l - 1; i < l; i++ )
                callback.call( this[i], ( l > 1 && i < lastIndex ) ? jSignage.clone( fragment, true, true ) : fragment );
		}

		return this;
	}
});

var rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/;
var rhtml = /<|&#?\w+;/;

jSignage.buildFragment = function ( args, nodes ) {
    var nodes = [];
    var doc = ( nodes && nodes[0] ? nodes[0].ownerDocument || nodes[0] : document );
    for ( var i = 0; i < args.length; i++ ) {
        var elem = args[i];
        if ( elem || elem === 0 ) {
            if ( typeof( elem ) === "object" ) {
                jSignage.merge( nodes, elem.nodeType ? [elem] : elem );
            } else if ( !rhtml.test( elem ) ) {
                nodes.push( doc.createTextNode( elem ) );
            } else {
                var nsuri = doc.documentElement ? doc.documentElement.namespaceURI : jSignage.svgNS;
                var ret = rsingleTag.exec( elem );
                if ( ret ) {
                    nodes.push( doc.createElementNS( nsuri, ret[1] ) );
                } else {
                    var g = parseXML( '<g xmlns="' + nsuri + '">' + elem + '</g>', doc );
                    if ( g ) {
                        for ( var x = g.firstChild, next; x; x = next ) {
                            nodes.push( x );
                            next = x.nextSibling;
                            g.removeChild( x );
                        }
                        g = null;
                    }
                }
            }
        }
    }
    return nodes;
};

jSignage.each({
	appendTo: "append",
	prependTo: "prepend",
	insertBefore: "before",
	insertAfter: "after",
	replaceAll: "replaceWith"
}, function( name, original ) {
	jSignage.fn[ name ] = function( selector ) {
		var ret = [], insert = jSignage( selector );
		for ( var i = 0, l = insert.length; i < l; i++ ) {
			var elems = (i > 0 ? this.clone(true) : this).get();
			jSignage( insert[i] )[ original ]( elems );
			ret = ret.concat( elems );
		}
		return this.pushStack( ret, name, insert.selector );
	};
});

(function(){

jSignage.extend({
    xmlNS: 'http://www.w3.org/XML/1998/namespace',
    svgNS: 'http://www.w3.org/2000/svg',
    spxNS: 'http://www.spinetix.com/namespace/1.0/spx',
    xlinkNS: 'http://www.w3.org/1999/xlink',
    xmlevNS: 'http://www.w3.org/2001/xml-events',
    xhtmlNS: 'http://www.w3.org/1999/xhtml',

    setTimeout: function ( callback, ms ) {
        if ( !ms || ms < 0 )
            ms = 0;
        if ( jSignage.timeline ) {
            var action = new TimedAction( ms/1000, 'callback', callback );
            jSignage.timeline.scheduleRelative( null, action );
            return action;
        }
        if ( 'createTimer' in window ) {
            var timer = createTimer( ms, -1 );
            timer.addEventListener( 'SVGTimer', callback, false );
            timer.start();
            return timer;
        }
        return window.setTimeout( callback, ms );
    },

    clearTimeout: function( timer ) {
        if ( jSignage.timeline )
            jSignage.timeline.cancel( timer );
        else if ( 'createTimer' in window )
            timer.stop();
        else
            window.clearTimeout( timer );
    },

    setInterval: function( callback, ms ) {
        if ( !ms || ms < 0 )
            ms = 0;
        if ( 'createTimer' in window ) {
            var timer = createTimer( ms, ms );
            timer.addEventListener( 'SVGTimer', callback, false );
            timer.start();
            return timer;
        }
        return window.setInterval( callback, ms );
    },

    setIntervalSync: function( callback, ms ) {
        if ( 'createTimer' in window ) {
            var rem = Date.now() % ms;
            if ( isNaN(rem) || rem<=0 )
                rem = 0;
            var timer = createTimer( ms-rem, ms );
            timer.addEventListener( 'SVGTimer', callback, false );
            timer.start();
            return timer;
        }
        return window.setInterval( callback, ms );
    },

    clearInterval: function( timer ) {
        if ( 'createTimer' in window )
            timer.stop();
        else
            window.clearInterval( timer );
    },

    getCurrentTime: function() {
        if ( jSignage.features.MSIE )
            return (Date.now() - jSignage.originOfTime)/1000;
        else
            return document.documentElement.getCurrentTime();
    },

    getDisplayTime: function () {
        if ( navigator.spxDocumentTime !== undefined )
            return navigator.spxDocumentTime;
        return jSignage.getCurrentTime();
    }
});

// Layer support

var smilTimecount = /^([0-9]+(?:\.[0-9]+)?)(h|min|s|ms)?$/;
var smilClockValueHMS = /^([0-9]+):([0-9][0-9]):([0-9][0-9](?:\.[0-9]+)?)$/;
var smilClockValueMS = /^([0-9]+):([0-9][0-9](?:\.[0-9]+)?)$/;
var viewport_attributes = [ 'top', 'bottom', 'left', 'right', 'width', 'height', 'viewBox', 'transform' ];
var timing_attributes = [ 'begin', 'dur', 'repeatDur', 'repeatCount', 'min', 'max' ];
var reSplitList = / *[ ,] */;
var reTimePoint = /^((?:[\w\u00c0-\uFFFF\-]|\\.)+)\.(begin|end)/;
var reRGBA = /^rgba\(([^,]+,[^,]+,[^,]+),\s*([^\)]+)\)$/;
var reSplitShadows = /(?:[^,\(]+(?:\([^\)]*\))?)+/g;
var reSplitShadowParams = /(?:[^\s\(]+(?:\([^\)]*\))?)+/g;

function parseTimePoint( timePoint ) {
    var tp = {
        timed: null,
        point: null,
        offset: 0
    };
    var ref = reTimePoint.exec( timePoint );
    if ( ref ) {
        tp.timed = jSignage.timedLayers[ref[1]];
        tp.point = ref[2];
        if ( ref[0].length >= timePoint.length )
            tp.offset = 0;
        else if ( timePoint.charAt(ref[0].length)=='+' )
            tp.offset = jSignage.durInSeconds( timePoint.substring( ref[0].length+1 ), 0 );
        else if ( timePoint.charAt(ref[0].length)=='-' )
            tp.offset = -jSignage.durInSeconds( timePoint.substring( ref[0].length+1 ), 0 );
    } else {
        tp.offset = jSignage.durInSeconds( timePoint, 0 );
    }
    return tp;
}

function computeActiveDur( smil ) {
    var dur = smil.getAttribute( 'dur' );
    if ( dur!='indefinite' && dur!='media' ) {
        dur = jSignage.durInSeconds( dur, -1 );
        if ( dur < 0 )
            dur = smil.localName=='audio' || smil.localName=='video' || smil.localName=='animation' ? 'media' : 'indefinite';
    }
    var repeatDur = smil.getAttribute( 'repeatDur' );
    if ( repeatDur!='indefinite' ) {
        repeatDur = jSignage.durInSeconds( repeatDur, -1 );
        if ( repeatDur<0 )
            repeatDur = null;
    }
    var repeatCount = smil.getAttribute( 'repeatCount' );
    if ( repeatCount!='indefinite' ) {
        repeatCount = jSignage.durInSeconds( repeatCount, -1 );
        if ( repeatCount<0 )
            repeatCount = null;
    }
    var min = jSignage.durInSeconds( smil.getAttribute( 'min' ), -1 );
    if ( min < 0 )
        min = 0;
    var max = jSignage.durInSeconds( smil.getAttribute( 'max' ), -1 );
    if ( max < 0 )
        max = 'indefinite';
    var p0 = typeof(dur)=='number' && dur>=0 ? dur : 'indefinite', AD;
    if ( p0==0 ) {
        AD = 0;
    } else if ( repeatDur===null && repeatCount===null ) {
        AD = p0;
    } else {
        var p1 = repeatCount===null || repeatCount==='indefinite' || typeof(dur)!='number' || dur<0 ? 'indefinite' : repeatCount * dur;
        var p2 = repeatDur===null || repeatDur==='indefinite' ? 'indefinite' : repeatDur;
        AD = p1==='indefinite' ? p2 : p2==='indefinite' ? p1 : Math.min( p1, p2 );
    }
    if ( typeof(AD)=='number' && AD < min )
        AD = min;
    if ( typeof(max)=='number' && ( AD=='indefinite' || AD > max ) )
        AD = max;
    return AD;
}

function TimedAction( dueDate, type, target ) {
    this.dueDate = dueDate;
    this.type = type;
    this.target = target;
}

TimedAction.prototype = {
    trig: function( tNow ) {
        if ( this.type=='beginLayer' ) {
            this.target.begin( tNow );
        } else if ( this.type=='endLayer' ) {
            this.target.end( tNow );
        } else if ( this.type=='callback' ) {
            this.target( tNow );
        } else if ( this.type=='beginElement' ) {
            if ( jSignage.features.SVGAnimation )
                this.target.beginElement();
            else
                launchSoftAnimation( tNow, this.target );
        } else if ( this.type=='endElement' ) {
            if ( jSignage.features.SVGAnimation )
                this.target.endElement();
            else
                cancelSoftAnimation( this.target );
        }
    }
};

function Timeline() {
    this.actions = [ ];                 // List of actions sorted by 1) dueDate, 2) order of insertion
    this.currentDate = 0;               // Current position in the timeline
    this.timer = null;
    this.intimeout = false;
}

Timeline.prototype = {
    schedule: function( action ) {
        var oldDueDate = this.actions.length ? this.actions[0].dueDate : null;
        // Binary search for correct position
        var i, a = 0, b = this.actions.length;
        while ( a+1 < b ) {
            i = Math.floor((a+b)/2);
            if ( this.actions[i].dueDate > action.dueDate )
                b = i;
            else
                a = i;
        }
        if ( a==this.actions.length || this.actions[a].dueDate > action.dueDate )
            i = a;
        else
            i = b;
        while ( i<this.actions.length && this.actions[i].dueDate==action.dueDate )
            ++i;
        if ( i==this.actions.length )
            this.actions.push( action );
        else
            this.actions.splice( i, 0, action );
        var newDueDate = this.actions[0].dueDate;
        if ( !this.intimeout && ( oldDueDate==null || newDueDate < oldDueDate ) ) {
            now = jSignage.getCurrentTime();
            if ( newDueDate <= now ) {
                this.timeout( newDueDate );
            } else {
                if ( this.timer )
                    clearTimeout( this.timer );
                var timeline = this;
                this.timer = setTimeout( function() {
                    timeline.timeout( newDueDate );
                }, (newDueDate-now)*1000 );
            }
        }
    },

    scheduleRelative: function( tNow, action ) {
        this.schedule( new TimedAction( (tNow || jSignage.getCurrentTime())+action.dueDate, action.type, action.target ) );        
    },

    cancel: function( action ) {
        // Binary search for correct position
        var i, a = 0, b = this.actions.length;
        if ( b==0 )
            return;
        while ( a+1 < b ) {
            i = Math.floor((a+b)/2);
            if ( this.actions[i].dueDate > action.dueDate )
                b = i;
            else
                a = i;
        }
        if ( b==this.actions.length )
            --b;
        for ( i = b; i>=0 && this.actions[i].dueDate==action.dueDate; --i ) {
            if ( this.actions[i].type==action.type && this.actions[i].target==action.target ) {
                this.actions.splice( i, 1 );
                return;
            }
        }
        for ( i = a; i<this.actions.length && this.actions[i].dueDate==action.dueDate; i++ ) {
            if ( this.actions[i].type==action.type && this.actions[i].target==action.target ) {
                this.actions.splice( i, 1 );
                return;
            }
        }
    },

    timeout: function( tNow ) {
        if ( this.timer ) {
            clearTimeout( this.timer );
            this.timer = null;
        }
        this.intimeout = true;
        while ( this.actions.length>0 && this.actions[0].dueDate<=tNow ) {
            var action = this.actions.shift();
            action.trig( tNow );
        }
        this.intimeout = false;
        if ( this.actions.length ) {
            var timeline = this;
            var nextDueDate = this.actions[0].dueDate;
            this.timer = setTimeout( function() {
                timeline.timeout( nextDueDate );
            }, (nextDueDate-jSignage.getCurrentTime())*1000 );
        }
    },

    scheduleElement: function( trigger, smil, endCallback ) {
        var tp = parseTimePoint( trigger ), dur;
        if ( endCallback )
            dur = computeActiveDur( smil );

        if ( tp.timed==null ) {
            this.schedule( new TimedAction( tp.offset, 'beginElement', smil ) );
            if ( endCallback && dur!='indefinite' )
                this.schedule( new TimedAction( tp.offset+dur, 'callback', endCallback ) );
        } else {
            if ( tp.point=='begin' || tp.point=='beginEvent' ) {
                tp.timed.beginActions.push( new TimedAction( tp.offset, 'beginElement', smil ) );
                if ( endCallback && dur!='indefinite' )
                    tp.timed.beginActions.push( new TimedAction( tp.offset+dur, 'callback', endCallback ) );
            } else if ( tp.point=='end' || tp.point=='endEvent' ) {
                tp.timed.endActions.push( new TimedAction( tp.offset, 'beginElement', smil ) );
                if ( endCallback && dur!='indefinite' )
                    tp.timed.endActions.push( new TimedAction( tp.offset+dur, 'callback', endCallback ) );
            }
            if ( tp.timed.activeStart!=null ) {
                if ( tp.point=='begin' ) {
                    this.schedule( new TimedAction( tp.timed.activeStart+tp.offset, 'beginElement', smil ) );
                    if ( endCallback && dur!='indefinite' )
                        this.schedule( new TimedAction( tp.timed.activeStart+tp.offset+dur, 'callback', endCallback ) );
                } else if ( ( tp.point=='end' || tp.point=='endEvent' ) && tp.offset<0 && tp.timed.activeEnd!='indefinite' ) {
                    this.schedule( new TimedAction( tp.timed.activeEnd+tp.offset, 'beginElement', smil ) );
                    if ( endCallback && dur!='indefinite' && tp.offset+dur<0 )
                        this.schedule( new TimedAction( tp.timed.activeEnd+tp.offset+dur, 'callback', endCallback ) );
                }
            }
        }
    }
};

function SoftAnimatedElement( targetElement ) {
    this.targetElement = targetElement || null; // Element whose attribute(s) are animated
    this.animatedAttributes = { };              // Map of attribute name to SoftAnimatedAttribute object
    this.animatedAttributesCount = 0;
}

var attributeTypeTable = {
    'audio-level': 1, 'fill-opacity': 1, 'font-size': 1, 'line-increment': 1, opacity: 1, 'solid-opacity': 1, 'stop-opacity': 1,
    'stroke-dashoffset': 1, 'stroke-miterlimit': 1, 'stroke-opacity': 1, 'stroke-width': 1, 'viewport-fill-opacity': 1,
    cx: 1, cy: 1, r: 1, rx: 1, ry: 1, x: 1, y: 1, width: 1, height: 1, x1: 1, x2: 1, y1: 1, y2: 1, offset: 1, pathLength: 1,
    'stroke-dasharray': 2, points: 2, rotate: 2,
    'color': 3, 'solid-color': 3, fill: 3, stroke: 3, 'viewport-fill': 3,
    transform: 4,
    motion: 5
};

var attributeLacunaTable = {
    'audio-level': 1, 'fill-opacity': 1, opacity: 1, 'solid-opacity': 1, 'stop-opacity': 1, 'stroke-opacity': 1, 'viewport-fill-opacity': 1
};

function SoftAnimatedAttribute( target, name ) {
    this.target = target || null;       // Target SoftAnimatedElement object
    this.name = name || '';             // Name of attribute
    this.type = 0;                      // Type of attribute ( 0 => text, 1 => number, 2 => vector, 3 => color, 4 => transform, 5 => motion )
    this.rawBase = '';                  // Raw base value
    this.baseValue = null;              // Base value, parsed
    this.animations = [ ];              // Array of active SoftAnimation objects in sandwich order

    this.type = attributeTypeTable[this.name] || 0;
    if ( this.target ) {
        var text = this.target.targetElement.getAttribute( this.name );
        if ( text===null ) text='';
        this.rawBase = text;
        this.baseValue = this.parse( text );
    }
}

var reSplitValues = /\s*;\s*/;
var reSplitVector = /\s+,?\s*|,\s*/;
var reTransformMatrix = /^matrix\s*\(\s*([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)(?:\s+,?\s*|,\s*)([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)(?:\s+,?\s*|,\s*)([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)(?:\s+,?\s*|,\s*)([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)(?:\s+,?\s*|,\s*)([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)(?:\s+,?\s*|,\s*)([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*\)/;
var reTransformTranslate = /^translate\s*\(\s*([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)(?:(?:\s+,?\s*|,\s*)([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?))?\s*\)/;
var reTransformScale = /^scale\s*\(\s*([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)(?:(?:\s+,?\s*|,\s*)([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?))?\s*\)/;
var reTransformRotate = /^rotate\s*\(\s*([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)(?:(?:\s+,?\s*|,\s*)([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?))?(?:(?:\s+,?\s*|,\s*)([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?))?\s*\)/;
var reTransformSkew = /^skew([XY])\s*\(\s*([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)\s*\)/;
var reSplitCSS = /;\s*/;

function addVector( a, b ) {
    var n1 = Math.min( a.length, b.length );
    var r = [];
    for ( var i=0; i<n1; i++ )
        r.push( a[i] + b[i] );
    for ( ; i<a.length; i++ )
        r.push( a[i] );
    for ( ; i<b.length; i++ )
        r.push( b[i] );
    return r;
}

function subVector( a, b ) {
    var n1 = Math.min( a.length, b.length );
    r = [];
    for ( var i=0; i<n1; i++ )
        r.push( a[i] - b[i] );
    for ( ; i<a.length; i++ )
        r.push( a[i] );
    for ( ; i<b.length; i++ )
        r.push( -b[i] );
    return r;
}

function scalarMulVector( a, coef ) {
    var r = [];
    for ( var i=0; i<a.length; i++ )
        r.push( a[i] * coef );
    return r;
}

function transformMatrix( type, v ) {
    if ( type=='matrix' )
        return [ v[0], v[1], v[2], v[3], v[4], v[5] ];
    if ( type=='translate' )
        return [ 1, 0, 0, 1, v[0], v[1] ];
    if ( type=='scale' )
        return [ v[0], 0, 0, v[1], 0, 0 ];
    if ( type=='rotate' ) {
        var teta = v[0] * Math.PI / 180;
        var mat = [ Math.cos( teta ), Math.sin( teta ), -Math.sin( teta ), Math.cos( teta ), 0, 0 ];
        if ( v[1] || v[2] )
            mat = postMultiply( [ 1, 0, 0, 1, v[1], v[2] ], postMultiply( mat, [ 1, 0, 0, 1, -v[1], -v[2] ] ) );
        return mat;
    }
    if ( type=='skewX' )
        return [ 1, 0, Math.tan( v[0] ), 1, 0, 0 ];
    if ( type=='skewY' )
        return [ 1, Math.tan( v[0] ), 0, 1, 0, 0 ];
    return [ 1, 0, 0, 1, 0, 0 ];
}

function postMultiply( value, mat ) {
    return [
        value[0]*mat[0] + value[2]*mat[1],
        value[1]*mat[0] + value[3]*mat[1],
        value[0]*mat[2] + value[2]*mat[3],
        value[1]*mat[2] + value[3]*mat[3],
        value[0]*mat[4] + value[2]*mat[5] + value[4],
        value[1]*mat[4] + value[3]*mat[5] + value[5]
    ];
}

var cssProperties = {
    'audio-level': true, color: true, direction: true, fill: true, 'fill-opacity': true, 'fill-rule': true,
    opacity: true, 'solid-color': true, 'solid-opacity': true, 'stop-color': true, 'stop-opacity': true, stroke: true,
    'stroke-dasharray': true, 'stroke-dashoffset': true, 'stroke-linecap': true, 'stroke-miterlimit': true, 'stroke-opacity': true,
    'stroke-width': true, 'text-align': true, 'text-anchor': true, 'viewport-fill': true, 'viewport-fill-opacity': true,
    visibility: true, 'clip-path': true
};

SoftAnimatedAttribute.prototype = {
    apply: function( tNow ) {
        var value = this.baseValue;
        for ( var i=0; i<this.animations.length; i++ )
            value = this.animations[i].apply( tNow, value );
        if ( jSignage.isArray( value ) ) {
            if ( this.type==2 )
                value = value.join( ',' );
            else if ( this.type==3 )
                value = 'rgb(' + (!value[0]||value[0]<0 ? 0 : value[0]>255 ? 255 : Math.floor(value[0])) + ',' + (!value[1]||value[1]<0 ? 0 : value[1]>255 ? 255 : Math.floor(value[1])) + ',' + (!value[2]||value[2]<0 ? 0 : value[2]>255 ? 255 : Math.floor(value[2])) + ')';
            else if ( this.type==4 )
                value = 'matrix(' + (value[0]||0) + ',' + (value[1]||0) + ',' + (value[2]||0) + ',' + (value[3]||0) + ',' + (value[4]||0) + ',' + (value[5]||0) + ')';
        }
        if ( jSignage.features.WebKit && cssProperties[this.name] )
            this.target.targetElement.style[this.name] = value;
        else
            this.target.targetElement.setAttribute( this.name, value );
    },

    parse: function( text ) {
        var value = null;
        if ( this.type==1 ) {
             value = parseFloat( text );
             if ( isNaN(value ) )
                value = attributeLacunaTable[this.name] || 0;
        } else if ( this.type==2 ) {
            var value = text.split( reSplitVector );
            for ( var i=0; i<value.length; i++ ) {
                value[i] = parseFloat( value[i] );
                if ( isNaN(value[i]) )
                    value[i] = 0;
            }
        } else if ( this.type==3 ) {
            var rgb = jSignage.colorToRGB( text );
            value = [ rgb.red, rgb.green, rgb.blue ];
        } else if ( this.type==4 ) {
            value = [ 1, 0, 0, 1, 0, 0 ];
            if ( text!='' && text!='none' ) {
                for ( var i=0; i<text.length; ) {
                    while ( i<text.length && text.charAt[i]==' ' ) i++;
                    var sub = text.substring(i);
                    var m = reTransformMatrix.exec( sub ), mat;
                    if ( m ) {
                        mat = transformMatrix( 'matrix', [ parseFloat(m[1]), parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4]), parseFloat(m[5]), parseFloat(m[6]) ] );
                    } else {
                        m = reTransformTranslate.exec( sub );
                        if ( m ) {
                            mat = transformMatrix( 'translate', [ parseFloat(m[1]), m[2] ? parseFloat(m[2]) : 0 ] );
                        } else {
                            m = reTransformScale.exec( sub );
                            if ( m ) {
                                mat = transformMatrix( 'scale', [ parseFloat(m[1]), m[2] ? parseFloat(m[2]) : parseFloat(m[1]) ] );
                            } else {
                                m = reTransformRotate.exec( sub );
                                if ( m ) {
                                    mat = transformMatrix( 'rotate', [ parseFloat(m[1]), m[2] ? parseFloat(m[2]) : 0, m[3] ? parseFloat(m[3]) : 0 ] );
                                } else {
                                    m = reTransformSkew.exec( sub );
                                    if ( m ) {
                                        if ( m[1]=='X' )
                                            mat = transformMatrix( 'skewX', [ parseFloat(m[2]) ] );
                                        else
                                            mat = transformMatrix( 'skewY', [ parseFloat(m[2]) ] );
                                    } else {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    value = postMultiply( value, mat );
                    i += m[0].length;
                    while ( i<text.length && text.charAt[i]==' ' ) i++;
                    if ( i<text.length && text.charAt[i]==',' ) i++;
                }
            }
        } else {
            value = text;
        }
        return value;
    },

    addition: function( a, b ) {
        var r = null;
        if ( this.type==1 )
            r = a + b;
        else if ( this.type==2 || this.type==3 )
            r = addVector( a, b );
        else if ( this.type==4 )
            r = postMultiply( a, b );
        else
            r = a;
        return r;
    },

    substraction: function( a, b ) {
        var r = null;
        if ( this.type==1 )
            r = a - b;
        else if ( this.type==2 || this.type==3 || this.type==4 )
            r = subVector( a, b );
        else
            r = a;
        return r;
    },

    scalarMultiply: function( a, coef ) {
        var r = null;
        if ( this.type==1 )
            r = a * coef;
        else if ( this.type==2 || this.type==3 || this.type==4 )
            r = scalarMulVector( a, coef );
        else
            r = a;
        return r;
    }
};

function SoftAnimation( tStart, elem, target ) {
    this.tStart = tStart || 0;
    this.elem = elem || null;
    this.target = target || null;       // Target SoftAnimatedAttribute object
    this.simpleDur = 0;                 // Simple duration of the animation function
    this.activeEnd = 'indefinite';      // End of active animation
    this.values = [ ];
    this.calcMode = 0;                  // 0 => discrete, 1 => linear, 2 => paced, 3 => spline
    this.additive = false;
    this.accumulate = false;
    this.keyTimes = [ ];
    this.keySplines = [ ];
    this.freeze = false;
    this.toAnimation = false;
    this.byAnimation = false;
    
    if ( !elem || !target )
        return;

    this.simpleDur = jSignage.durInSeconds( elem.getAttribute( 'dur' ), 0 );
    var activeDur = computeActiveDur( elem );
    if ( activeDur!='indefinite' )
        this.activeEnd = tStart + activeDur;    
    this.freeze = elem.getAttribute( 'fill' )=='freeze';

    if ( elem.localName=='set' ) {
        this.calcMode = 0;
        this.additive = false;
        this.accumulate = false;
        var to = elem.getAttribute( 'to' );
        if ( to!==null && to!=='' ) {
            this.toAnimation = true;
            this.values = [ to ];
        }
    } else {
        if ( elem.localName=='animateTransform' ) {
            this.transformType = elem.getAttribute( 'type' );
            if ( this.transformType!='translate' && this.transformType!='scale' && this.transformType!='rotate' && this.transformType!='skewX' && this.transformType!='skewY' ) {
                this.transformType = null;
                return;
            }
        }
        var calcMode = elem.getAttribute( 'calcMode' );
        if ( calcMode=='discrete' )
            this.calcMode = 0;
        else if ( calcMode=='linear' )
            this.calcMode = 1;
        else if ( calcMode=='paced' )
            this.calcMode = 2;
        else if ( calcMode=='spline' )
            this.calcMode = 3;
        else if ( this.target.type==1 || this.target.type==2 || this.target.type==3 || this.target.type==4 )
            this.calcMode = 1;
        else if ( this.target.type==5 )
            this.calcMode = 2;
        else
            this.calcMode = 0;

        this.additive = elem.getAttribute( 'additive' )=='sum';

        this.accumulate = elem.getAttribute( 'accumulate' )=='sum';

        var keyTimes = elem.getAttribute( 'keyTimes' );
        if ( keyTimes!==null && keyTimes!=='' ) {
            keyTimes = keyTimes.split( reSplitValues );
            for ( var i=0; i<keyTimes.length; i++ ) {
                keyTimes[i] = parseFloat( keyTimes[i] );
                if ( isNaN(keyTimes[i]) || keyTimes[i]<0 || keyTimes[i]>1 || ( i>0 && keyTimes[i]<keyTimes[i-1] ) )
                    break;
            }
            if ( i==keyTimes.length )
                this.keyTimes = keyTimes;
        }

        var values = elem.getAttribute( 'values' );
        if ( values!==null && values!=='' ) {
            var v = values.split( reSplitValues );
            for ( var i=0; i<v.length; i++ )
                this.values[i] = this.transformType ? this.parseTransform(v[i]) : this.target.parse( v[i] );
        }
        if ( this.values.length==0 ) {
            var to = elem.getAttribute( 'to' );
            if ( to!==null && to!=='' ) {
                var from = elem.getAttribute( 'from' );
                if ( from!==null && from!=='' ) {
                    this.keyTimes = [ ];
                    this.values = [ this.transformType ? this.parseTransform(from) : this.target.parse( from ), this.transformType ? this.parseTransform(to) : this.target.parse( to ) ];
                } else {
                    this.toAnimation = true;
                    this.values = [ this.transformType ? this.parseTransform(to) : this.target.parse( to ) ];
                }
            } else {
                var by = elem.getAttribute( 'by' );
                if( by!==null && by!=='' ) {
                    var from = elem.getAttribute( 'from' );
                    if ( from!==null && from!=='' ) {
                        this.keyTimes = [ ];
                        from = this.transformType ? this.parseTransform(from) : this.target.parse( from );
                        this.values = [ from, this.transformType ? addVector( from, this.parseTransform( by ) ) : this.target.addition( from, this.target.parse( by ) ) ];
                    } else {
                        this.byAnimation = true;
                        this.values = [ this.transformType ? this.parseTransform(by) : this.target.parse( by ) ];
                    }
                }
            }
        }
    }

    if ( this.values.length > 1 ) {
        if ( this.calcMode==0 ) {
            if ( this.keyTimes.length!=this.values.length || this.keyTimes[0]!=0 ) {
                this.keyTimes = [];
                for ( var i=0; i<this.values.length; i++ )
                    this.keyTimes.push( i / this.values.length );
            }
        } else {
            if ( this.keyTimes.length!=this.values.length || this.keyTimes[0]!=0 || this.keyTimes[this.keyTimes.length-1]!=1 ) {
                this.keyTimes = [];
                for ( var i=0; i<this.values.length; i++ )
                    this.keyTimes.push( i / (this.values.length-1) );
            }
        }
    }
}

SoftAnimation.prototype = {
    parseTransform: function( text ) {
        if ( this.transformType=='translate' ) {
            var v = text.split( reSplitVector );
            var tx = parseFloat( v[0] ), ty = parseFloat( v[1] );
            if ( isNaN( tx ) )
                tx = 0;
            if ( isNaN( ty ) )
                ty = 0;
            return [ tx, ty ];
        } else if ( this.transformType=='scale' ) {
            var v = text.split( reSplitVector );
            var sx = parseFloat( v[0] ), sy = parseFloat( v[1] );
            if ( isNaN( sx ) )
                sx = 1;
            if ( isNaN( sy ) )
                sy = sx;
            return [ sx, sy ];
        } else if ( this.transformType=='rotate' ) {
            var v = text.split( reSplitVector );
            var teta = parseFloat( v[0] ), cx = parseFloat( v[1] ), cy = parseFloat( v[2] );
            if ( isNaN( teta ) )
                teta = 0;
            if ( isNaN( cx ) )
                cx = 0;
            if ( isNaN( cy ) )
                cy = 0;
            return [ teta, cx, cy ];
        } else {
            var skew = parseFloat( text );
            if ( isNaN( skew ) )
                skew = 0;
            return [ skew ];
        }
    },

    apply: function( tNow, base ) {
        var value = null;
        if ( this.activeEnd!='indefinite' && tNow > this.activeEnd )
            tNow = this.activeEnd;
        var tSimple = 0, iterCount = 0;

        if ( this.simpleDur > 0 && tNow>this.tStart ) {
            tSimple = ( (tNow-this.tStart) % this.simpleDur ) / this.simpleDur;
            iterCount = Math.floor( (tNow-this.tStart) / this.simpleDur );
            if ( tNow==this.activeEnd && tSimple==0 && iterCount > 0 ) {
                --iterCount;
                tSimple = 1;
            }
        }
        if ( this.toAnimation ) {
            value = this.values[0];
        } else if ( this.byAnimation ) {
            value = base + this.values[0];
        } else if ( this.calcMode==0 ) {
            for ( var i=1; i<this.values.length; i++ )
                if ( tSimple<this.keyTimes[i] )
                    break;
            value = this.values[ i-1 ];
        } else {
            for ( var i=1; i<this.values.length-1; i++ )
                if ( tSimple<this.keyTimes[i] )
                    break;
            var t0 = this.keyTimes[i-1], v0 = this.values[i-1];
            var t1 = this.keyTimes[i], v1 = this.values[i];
            if ( this.calcMode==1 ) {
                if ( this.transformType )
                    value = addVector( v0, scalarMulVector( subVector( v1, v0 ), ( tSimple - t0 ) / ( t1 - t0 ) ) );
                else
                    value = this.target.addition( v0, this.target.scalarMultiply( this.target.substraction( v1, v0 ), ( tSimple - t0 ) / ( t1 - t0 ) ) );
            }
        }
        if ( this.accumulate && iterCount>0 ) {
            if ( this.transformType )
                value = addVector( value, scalarMulVector( this.values[this.values.length-1], iterCount ) );
            else
                value = this.target.addition( value, this.target.scalarMultiply( this.values[this.values.length-1], iterCount ) );
        }
        if ( this.transformType )
            value = transformMatrix( this.transformType, value );
        if ( this.additive )
            value = this.target.addition( base, value );
        return value;
    }
};

function applyAnimations() {
    var tNow = jSignage.getCurrentTime();
    for ( var targetElement in jSignage.softAnimatedElements )
        for ( var targetAttribute in jSignage.softAnimatedElements[targetElement].animatedAttributes )
            jSignage.softAnimatedElements[targetElement].animatedAttributes[targetAttribute].apply( tNow );
}

function launchSoftAnimation( tStart, elem ) {
    if ( !tStart )
        tStart = jSignage.getCurrentTime();
    var targetElement = elem.parentNode;
    var href = elem.getAttributeNS( jSignage.xlinkNS, 'href' ) || elem.getAttribute( 'href' );
    if ( href && href[0]=='#' )
        targetElement = document.getElementById( href.substring(1) );
    if ( !targetElement )
        return;
    if ( !targetElement.id )
        targetElement.id = jSignage.guuid();
    var attributeName = elem.getAttribute( 'attributeName' );
    if ( !attributeName ) {
        if ( elem.localName=='animateTransform' )
            attributeName = 'transform';
        else if ( elem.localName=='animateMotion' )
            attributeName = 'motion';
        else
            return;
    }
    var softAnimatedElement = jSignage.softAnimatedElements[targetElement.id];
    if ( !softAnimatedElement ) {
        softAnimatedElement = new SoftAnimatedElement( targetElement );
        jSignage.softAnimatedElements[targetElement.id] = softAnimatedElement;
        jSignage.softAnimatedElementsCount++;
    }
    var softAnimatedAttribute = softAnimatedElement.animatedAttributes[attributeName];
    if ( !softAnimatedAttribute ) {
        softAnimatedAttribute = new SoftAnimatedAttribute( softAnimatedElement, attributeName );
        softAnimatedElement.animatedAttributes[attributeName] = softAnimatedAttribute;
        softAnimatedElement.animatedAttributesCount++;
    }
    var softAnimation = new SoftAnimation( tStart, elem, softAnimatedAttribute );
    for ( var i=0; i<softAnimatedAttribute.animations.length; i++ )
        if ( softAnimatedAttribute.animations[i].tStart > tStart )
            break;
    if ( i<softAnimatedAttribute.animations.length )
        softAnimatedAttribute.animations.splice( i, 0, softAnimation );
    else
        softAnimatedAttribute.animations.push( softAnimation );
    softAnimatedAttribute.apply( tStart );
    if ( !softAnimation.freeze && softAnimation.activeEnd!='indefinite' )
        jSignage.timeline.schedule( new TimedAction( softAnimation.activeEnd, 'endElement', elem ) );
    if ( !jSignage.softAnimationTimeout )
        jSignage.softAnimationTimeout = jSignage.setInterval( applyAnimations, 1000/60 );
}

function cancelSoftAnimation( elem ) {
    var targetElement = elem.parentNode;
    var href = elem.getAttributeNS( jSignage.xlinkNS, 'href' ) || elem.getAttribute( 'href' );
    if ( href && href[0]=='#' )
        targetElement = document.getElementById( href.substring(1) );
    if ( !targetElement )
        return;
    if ( !targetElement.id )
        return;
    var attributeName = elem.getAttribute( 'attributeName' );
    if ( !attributeName ) {
        if ( elem.localName=='animateTransform' )
            attributeName = 'transform';
        else if ( elem.localName=='animateMotion' )
            attributeName = 'motion';
        else
            return;
    }
    var softAnimatedElement = jSignage.softAnimatedElements[targetElement.id];
    if ( !softAnimatedElement )
        return;
    var softAnimatedAttribute = softAnimatedElement.animatedAttributes[attributeName];
    if ( !softAnimatedAttribute )
        return;
    for ( var i=0; i<softAnimatedAttribute.animations.length; i++ )
        if ( softAnimatedAttribute.animations[i].elem==elem )
            break;
    if ( i==softAnimatedAttribute.animations.length )
        return;
    softAnimatedAttribute.animations.splice( i, 1 );
    if ( softAnimatedAttribute.animations.length==0 ) {
        if ( jSignage.features.WebKit && cssProperties[attributeName] )
            softAnimatedElement.targetElement.style[attributeName] = softAnimatedAttribute.rawBase;
        softAnimatedElement.targetElement.setAttribute( attributeName, softAnimatedAttribute.rawBase );
        delete softAnimatedElement.animatedAttributes[attributeName];
        if ( --softAnimatedElement.animatedAttributesCount==0 ) {
            delete jSignage.softAnimatedElements[targetElement.id];
            if ( --jSignage.softAnimatedElementsCount==0 ) {
                jSignage.clearInterval( jSignage.softAnimationTimeout );
                jSignage.softAnimationTimeout = null;
            }
        }
    }
}

function TimedLayer( target ) {
    this.target = target || null;       // realMediaTarget element of the target layer
    this.attr = { };                    // SMIL Timing attributes. As per SMIL, attributes may be modified only outside of the rendering tree.

    // These members set by this.resolve() based on SMIL timing attributes
    this.beginOffset = 'indefinite';    // Begin time relative to parent layer
    this.activeDur = 'indefinite';      // Computed duration, including repeats
    this.initialVisibility = false;     // initialVisibility=='always'
    this.fillFreeze = false;            // fill=='freeze'
    this.ends = null;                   // End this layer when we end
    this.endsOffset = 0;                // Offset to end the this.ends layer

    // These members set by this.begin()
    this.activeStart = null;            // Start date of the current active interval
    this.activeEnd = null;              // End date of the current active interval

    // Actions triggered by the layer
    this.beginActions = [];             // List of actions on begin event
    this.endActions = [];               // List of actions on end event
    this.subLayers = [];                // List of sub layers
}

TimedLayer.prototype = {
    addSubLayer: function( subLayer ) {
        for ( var i=0; i<this.subLayers.length; i++ )
            if ( this.subLayers[i]==subLayer )
                return;
        this.subLayers.push( subLayer );
    },

    addEventListener: function( event, handler, delay ) {
        var array = event=='beginEvent' ? this.beginActions : event=='endEvent' ? this.endActions: null;
        if ( array ) {
            for ( var i=0; i<array.length; i++ )
                if ( array[i].target==handler )
                    break;
            if ( i==array.length )
                array.push( new TimedAction( delay || 0, 'callback', handler ) );
        }
    },

    removeEventListener: function( event, handler ) {
        var array = event=='beginEvent' ? this.beginActions : event=='endEvent' ? this.endActions: null;
        if ( array ) {
            for ( var i=0; i<array.length; i++ )
                if ( array[i].target==handler )
                    break;
            if ( i<array.length )
                array.splice( i, 1 );
        }
    },

    begin: function( tNow ) {
        this.activeStart = tNow;
        this.activeEnd = typeof(this.activeDur)=='number' ? tNow + this.activeDur : 'indefinite';
        if ( !this.initialVisibility )
            this.target.setAttribute( 'display', 'inherit' );
        for ( var i=0; i<this.beginActions.length; i++ ) {
            if ( this.beginActions[i].dueDate==0 )
                this.beginActions[i].trig( tNow );
            else if ( this.beginActions[i].dueDate > 0 )
                jSignage.timeline.scheduleRelative( tNow, this.beginActions[i] );
        }
        for ( i=0; i<this.subLayers.length; i++ ) {
            var subLayer = this.subLayers[i];
            if ( subLayer.beginOffset!='indefinite' )
                jSignage.timeline.schedule( new TimedAction( tNow+subLayer.beginOffset, 'beginLayer', subLayer ) );
        }
        if ( this.activeEnd!=='indefinite' ) {
            for ( var i=0; i<this.endActions.length; i++ )
                if ( this.endActions[i].dueDate < 0 )
                    jSignage.timeline.scheduleRelative( this.activeEnd, this.endActions[i] );
            jSignage.timeline.schedule( new TimedAction( this.activeEnd, 'endLayer', this ) );
        }
    },

    end: function( tNow ) {
        if ( this.activeStart==null )
            return;
        if ( !this.fillFreeze )
            this.target.setAttribute( 'display', 'none' );
        this.activeStart = null;
        this.activeEnd = null;
        for ( var i=0; i<this.endActions.length; i++ ) {
            if ( this.endActions[i].dueDate==0 )
                this.endActions[i].trig( tNow );
            else if ( this.endActions[i].dueDate > 0 )
                jSignage.timeline.scheduleRelative( tNow, this.endActions[i] );
        }
    },

    endAt: function( tNow, offset ) {
        if ( this.activeStart==null )
            return;
        if ( !offset || offset<0 )
            return this.end();
        if ( !tNow )
            tNow = jSignage.getCurrentTime();
        var tNewEnd = tNow + offset;
        if ( this.activeEnd!='indefinite' && this.activeEnd < tNewEnd )
            return;
        this.changeActiveEnd( tNow, tNewEnd );
    },

    setMediaDur: function( tNow, mediaDur ) {
        var oldDur = this.target.getAttribute( 'dur' );
        if ( oldDur!==null && oldDur!=='' && oldDur!=='media' )
            return;
        this.target.setAttribute( 'dur', mediaDur );
        var newDur = computeActiveDur( this.target );
        if ( newDur!='indefinite' && newDur!=this.activeDur ) {
            this.activeDur = newDur;
            if ( this.activeStart==null )
                return;
            if ( !tNow )
                tNow = jSignage.getCurrentTime();
            this.changeActiveEnd( tNow, this.activeStart + this.activeDur );
        }
    },

    changeActiveEnd: function( tNow, tNewEnd ) {
        if ( this.activeEnd!='indefinite' ) {
            jSignage.timeline.cancel( new TimedAction( this.activeEnd, 'endLayer', this ) );
            for ( var i=0; i<this.endActions.length; i++ )
                if ( this.endActions[i].dueDate < 0 )
                    jSignage.timeline.cancel( new TimedAction( this.activeEnd+this.endActions[i].dueDate, this.endActions[i].type, this.endActions[i].target ) );
        }
        this.activeEnd = tNewEnd;
        for ( var i=0; i<this.endActions.length; i++ ) {
            if ( this.endActions[i].dueDate < 0 ) {
                var tAction = tNewEnd+this.endActions[i].dueDate;
                if ( tAction == tNow )
                    this.endActions[i].trig( tNow );
                else if ( tAction > tNow )
                    jSignage.timeline.schedule( new TimedAction( tAction, this.endActions[i].type, this.endActions[i].target ) );
            }
        }
        jSignage.timeline.schedule( new TimedAction( tNewEnd, 'endLayer', this ) );
    },

    resolve: function() {
        var begin = this.target.getAttribute( 'begin' );
        if ( begin!='indefinite' )
            begin = jSignage.durInSeconds( begin, 0 );
        this.beginOffset = begin;
        this.activeDur = computeActiveDur( this.target );
        this.initialVisibility = this.target.getAttribute( 'initialVisibility' )=='always';
        this.fillFreeze = this.target.getAttribute( 'fill' )=='freeze';
        if ( !this.initialVisibility )
            this.target.setAttribute( 'display', 'none' );
        var end = this.target.getAttribute( 'end' );
        if ( end!=='' && end!==null && end!='indefinite' ) {
            var tp = parseTimePoint( end );
            if ( tp.timed==null ) {
                this.schedule( new TimedAction( tp.offset, 'endLayer', this ) );
            } else {
                if ( tp.point=='begin' || tp.point=='beginEvent' )
                    tp.timed.beginActions.push( new TimedAction( tp.offset, 'endLayer', this ) );
                else if ( tp.point=='end' || tp.point=='endEvent' )
                    tp.timed.endActions.push( new TimedAction( tp.offset, 'endLayer', this ) );
                if ( tp.timed.activeStart!=null ) {
                    if ( tp.point=='begin' )
                        jSignage.timeline.schedule( new TimedAction( tp.timed.activeStart+tp.offset, 'endLayer', this ) );
                    else if ( ( tp.point=='end' || tp.point=='endEvent' ) && tp.offset<0 && tp.timed.activeEnd!='indefinite' )
                        jSignage.timeline.schedule( new TimedAction( tp.timed.activeEnd+tp.offset, 'endLayer', this ) );
                }
            }
        }
    }
};

if ( !jSignage.features.SMILTimeEvent ) {
    jSignage.timeline = new Timeline();     // Main scheduler for layers
    jSignage.timedLayers = new Object();    // Index of layer ids to TimedLayer objects
    if ( !jSignage.features.SVGAnimation ) {
        jSignage.softAnimatedElements = new Object();
        jSignage.softAnimatedElementsCount = 0;
    }
}

jSignage.extend({
    inv: function ( mat ) {
        var det = mat.a * mat.d - mat.b * mat.c;
        var imat = null;
        if ( det!=0 ) {
            imat = { a: mat.d/det, b: -mat.b/det, c: -mat.c/det, d: mat.a/det };
            imat.e = -imat.a * mat.e - imat.c * mat.f;
            imat.f = -imat.b * mat.e - imat.d * mat.f;
        }
        return imat;
    },

    mul: function ( M, T ) {
        if ( !T ) return M;
        return {
            a: M.a*T.a+M.c*T.b,
            b: M.b*T.a+M.d*T.b,
            c: M.a*T.c+M.c*T.d,
            d: M.b*T.c+M.d*T.d,
            e: M.a*T.e+M.c*T.f+M.e,
            f: M.b*T.e+M.d*T.f+M.f
        };
    },

    mat: function ( S ) {
        var M = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
        if ( S && S.getComponent ) {
            M.a = S.getComponent(0);
            M.b = S.getComponent(1);
            M.c = S.getComponent(2);
            M.d = S.getComponent(3);
            M.e = S.getComponent(4);
            M.f = S.getComponent(5);
        } else if ( S ) {
            M = S;
        }
        return M;
    },

    getCTM: function( elem ) {
        return jSignage.mat( elem.getDeviceCTM ? elem.getDeviceCTM() : elem.getScreenCTM() );
    },

    appendCanvasElement: function( parent, x, y, width, height ) {
        var canvas = null, child = null;
        if ( jSignage.features.canvas ) {
            child = canvas = jSignage._createElement( 'canvas', { x: x, y:y, width: width, height: height } );
        } else {
            canvas = document.createElementNS( jSignage.xhtmlNS, 'canvas' );
            canvas.width = width;
            canvas.height = height;
            child = jSignage._createElement( 'image', {
                x: x,
                y: y,
                width: width,
                height: height,
                preserveAspectRatio: 'none',
                type: 'image/png'
            });
            child.id = jSignage.guuid();
            canvas.setAttribute( 'image-id', child.id );
        }
        if ( canvas && child )
            parent.appendChild( child );
        return canvas;
    },

    getContext2D: function( canvas ) {
        var x = parseFloat( canvas.getAttribute( 'x' ) );
        var y = parseFloat( canvas.getAttribute( 'y' ) );
        var width = parseFloat( canvas.getAttribute( 'width' ) );
        var height = parseFloat( canvas.getAttribute( 'height' ) );
        var w = canvas.width/width, h = canvas.height/height;
        var ctx = canvas.getContext( '2d' );
        ctx.setTransform( w, 0, 0, h, -w*x, -h*y );
        return ctx;
    },

    flushContext2D: function( ctx ) {
        if ( !jSignage.features.canvas ) {
            var png = ctx.canvas.toDataURL( 'image/png' );
            var image = document.getElementById( ctx.canvas.getAttribute( 'image-id' ) );
            if ( image )
                image.setAttributeNS( jSignage.xlinkNS, 'href', png );
        }
    },

    measureText: jSignage.features.canvas ? function( ctx, text ) { return ctx.measureText( text ); } : function( ctx, text ) {
        var metrics = ctx.measureText( text );
        if ( !('actualBoundingBoxLeft' in metrics ) ) {
            if ( ctx.textAlign=='start' || ctx.textAlign=='left' ) {
                metrics.actualBoundingBoxLeft = 0;
                metrics.actualBoundingBoxRight = metrics.width;
            } else if ( ctx.textAlign=='end' || ctx.textAlign=='right' ) {
                metrics.actualBoundingBoxLeft = metrics.width;
                metrics.actualBoundingBoxRight = 0;
            } else {
                metrics.actualBoundingBoxLeft = metrics.width/2;
                metrics.actualBoundingBoxRight = metrics.width/2;
            }
            var fontSize = 0;
            var m = /([0-9]+)px/.exec( ctx.font );
            if ( m )
                fontSize = m[1] / 0.8;
            var baseline = ctx.textBaseline=='top' ? 0.8*fontSize : ctx.textBaseline=='bottom' ? -0.2*fontSize : ctx.textBaseline=='middle' ? 0.3*fontSize : ctx.textBaseline=='hanging' ? 0.7*fontSize : 0;
            metrics.emHeightAscent = metrics.fontBoundingBoxAscent = metrics.actualBoundingBoxAscent = 0.8*fontSize - baseline;
            metrics.emHeightDescent = metrics.fontBoundingBoxDescent = metrics.actualBoundingBoxDescent = baseline + 0.2*fontSize;
            metrics.hangingBaseline = 0.7*fontSize - baseline;
            metrics.alphabeticBaseline = metrics.ideographicBaseline = -baseline;
        }
        return metrics;
    },

    setLineDash:
        jSignage.features.Gecko ? function( ctx, lineDash ) { ctx.mozDash = lineDash; } :
        jSignage.features.MSIE || jSignage.features.Safari ? function( ctx, lineDash ) { } :
        function( ctx, lineDash ) { ctx.setLineDash( lineDash ); }
});

function mkshape( shape, corners, rx, ry, x, y, width, height, spread ) {
    var p = new jSignage.pathData();
    if ( spread ) {
        x = Math.min( x - spread, x + width / 2 );
        y = Math.min( y - spread, y + height / 2 );
        width = Math.max( 0, width + 2 * spread );
        height = Math.max( 0, height + 2 * spread );
    }
    if ( shape=='round' ) {
        if ( spread ) {
            rx = Math.max( 0, rx + spread );
            ry = Math.max( 0, ry + spread );
        }
        if ( corners=='left' ) {
            var min = Math.min( width, height );
            p.moveTo( x+width-rx, y ).arcTo( rx, ry, 0, 0, 1, x+width, y+ry );
            p.lineTo( x+width, y+height-ry ).arcTo( rx, ry, 0, 0, 1, x+width-rx, y+height );
            p.lineTo( x+rx, y+height ).quadTo( x, y+height, x-rx, y+height-ry );
            p.lineTo( x-min/2+rx, y+height/2+ry ).quadTo( x-min/2, y+height/2, x-min/2+rx, y+height/2-ry );
            p.lineTo( x-rx, y+ry ).quadTo( x, y, x+rx, y );
        } else if ( corners=='right' ) {
            var min = Math.min( width, height );
            p.moveTo( x, y+ry ).arcTo( rx, ry, 0, 0, 1, x+rx, y );
            p.lineTo( x+width-rx, y ).quadTo( x+width, y, x+width+rx, y+ry );
            p.lineTo( x+width+min/2-rx, y+height/2-ry ).quadTo( x+width+min/2, y+height/2, x+width+min/2-rx, y+height/2+ry );
            p.lineTo( x+width+rx, y+height-ry ).quadTo( x+width, y+height, x+width-rx, y+height );
            p.lineTo( x+rx, y+height ).arcTo( rx, ry, 0, 0, 1, x, y+height-ry );
        } else {
            var i = 0;
            if ( !corners || corners[i]=='topLeft' ) { p.moveTo( x, y+ry ).arcTo( rx, ry, 0, 0, 1, x+rx, y ); ++i; } else p.moveTo( x, y );
            if ( !corners || corners[i]=='topRight' ) { p.lineTo( x+width-rx, y).arcTo( rx, ry, 0, 0, 1, x+width, y+ry ); ++i; } else p.lineTo( x+width, y );
            if ( !corners || corners[i]=='bottomRight' ) { p.lineTo( x+width, y+height-ry ).arcTo( rx, ry, 0, 0, 1, x+width-rx, y+height ); ++i; } else p.lineTo( x+width, y+height );
            if ( !corners || corners[i]=='bottomLeft' ) { p.lineTo( x+rx, y+height ).arcTo( rx, ry, 0, 0, 1, x, y+height-ry ); } else p.lineTo( x, y+height );
        }
    } else if ( shape=='snip' ) {
        if ( spread && ( rx > 0 && ry > 0 ) ) {
            var z = 1 + spread * ( 1/rx + 1/ry - Math.sqrt( 1/(rx*rx)+1/(ry*ry) ) );
            rx = Math.max( 0, rx * z );
            ry = Math.max( 0, ry * z );
        }
        if ( corners=='left' ) {
            var min = Math.min( width, height );
            p.moveTo( x, y ).lineTo( x+width-rx, y, x+width, y+ry, x+width, y+height-ry, x+width-rx, y+height, x, y+height, x-min/2, y+height/2 );
        } else if ( corners=='right' ) {
            var min = Math.min( width, height );
            p.moveTo( x, y+ry ).lineTo( x+rx, y, x+width, y, x+width+min/2, y+height/2, x+width, y+height, x+rx, y+height, x, y+height-ry );
        } else {
            var i = 0;
            if ( !corners || corners[i]=='topLeft' ) { p.moveTo( x, y+ry ).lineTo( x+rx, y ); ++i; } else p.moveTo( x, y );
            if ( !corners || corners[i]=='topRight' ) { p.lineTo( x+width-rx, y, x+width, y+ry ); ++i; } else p.lineTo( x+width, y );
            if ( !corners || corners[i]=='bottomRight' ) { p.lineTo( x+width, y+height-ry, x+width-rx, y+height ); ++i; } else p.lineTo( x+width, y+height );
            if ( !corners || corners[i]=='bottomLeft' ) { p.lineTo( x+rx, y+height, x, y+height-ry ); } else p.lineTo( x, y+height );
        }
    } else if ( corners=='left' ) {
        var min = Math.min( width, height );
        p.moveTo( x+width, y ).lineTo( x+width, y+height, x, y+height, x-min/2, y+height/2, x, y );
    } else if ( corners=='right' ) {
        var min = Math.min( width, height );
        p.moveTo( x, y ).lineTo( x+width, y, x+width+min/2, y+height/2, x+width, y+height, x, y+height );
    } else {
        p.moveTo( x, y ).lineTo( x+width, y, x+width, y+height, x, y+height );
    }
    return p.close();
}

function ellipse_length( rx, ry ) {
    if ( rx <= 0 || ry <= 0 )
        return 0;
    var z = 1;
    if ( rx!=ry ) {
        var h = ((rx-ry)*(rx-ry))/((rx+ry)*(rx+ry));
        var f = 1, f2 = 1, p = 1, hp = 1;
        for ( var n = 1; n <= 6; n++ ) {
            var m = 2 * n - 1;
            f *= n;
            f2 *= m;
            p *= 2;
            hp *= h;
            var x = f2 / (p*f);
            z += (x*x*hp)/(m*m);
        }
    }
    return Math.PI * ( rx + ry ) * z;
}

function shape_up( shape, corners, rx, ry, x, y, width, height, spread, frameSize, color ) {
    var tl = false, tr = false, br = false, bl = false, i = 0;
    if ( !corners || corners[i]=='topLeft' ) { tl = true; ++i; }
    if ( !corners || corners[i]=='topRight' ) { tr = true; ++i; }
    if ( !corners || corners[i]=='bottomRight' ) { br = true; ++i; }
    if ( !corners || corners[i]=='bottomLeft' ) { bl = true; ++i; }
    var p = new jSignage.pathData();
    x = Math.min( x - spread, x + width / 2 );
    y = Math.min( y - spread, y + height / 2 );
    width = Math.max( 0, width + 2 * spread );
    height = Math.max( 0, height + 2 * spread );
    if ( shape=='round' ) {
        var rx = Math.max( 0, rx + spread );
        var ry = Math.max( 0, ry + spread );
        var ix = Math.max( 0, rx - frameSize );
        var iy = Math.max( 0, ry - frameSize );
        if ( tl )
            p.moveTo( x, y+ry ).arcTo( rx, ry, 0, 0, 1, x+rx, y );
        else
            p.moveTo( x, y );
        if ( tr )
            p.lineTo( x+width-rx, y).arcTo( rx, ry, 0, 0, 1, x+width-rx*(1-Math.SQRT1_2), y+ry*(1-Math.SQRT1_2) ).lineTo( x+width-rx+(rx-frameSize)*Math.SQRT1_2, y+ry-(ry-frameSize)*Math.SQRT1_2 ).arcTo( ix, iy, 0, 0, 0, x+width-Math.max(rx,frameSize), y+frameSize );
        else
            p.lineTo( x+width, y ).lineTo( x+width-frameSize, y+frameSize );
        if ( tl )
            p.lineTo( x+Math.max(rx,frameSize), y+frameSize ).arcTo( ix, iy, 0, 0, 0, x+frameSize, y+Math.max(ry,frameSize) );
        else
            p.lineTo( x+frameSize, y+frameSize );
        if ( bl )
            p.lineTo( x+frameSize, y+height-Math.max(ry,frameSize) ).arcTo( ix, iy, 0, 0, 0, x+rx-(rx-frameSize)*Math.SQRT1_2, y+height-ry+(ry-frameSize)*Math.SQRT1_2 ).lineTo( x+rx*(1-Math.SQRT1_2), y+height-ry*(1-Math.SQRT1_2) ).arcTo( rx, ry, 0, 0, 1, x, y+height-ry );
        else
            p.lineTo( x+frameSize, y+height-frameSize, x, y+height );
    } else if ( shape=='snip' ) {
        var ix = 0, iy = 0;
        if ( rx > 0 && ry > 0 ) {
            var k = 1/rx + 1/ry - Math.sqrt( 1/(rx*rx)+1/(ry*ry) );
            ix = Math.max( 0, rx * ( 1 + (spread-frameSize) * k ) );
            iy = Math.max( 0, ry * ( 1 + (spread-frameSize) * k ) );
            rx = Math.max( 0, rx * ( 1 + spread * k ) );
            ry = Math.max( 0, ry * ( 1 + spread * k ) );
        }
        if ( tl )
            p.moveTo( x, y+ry ).lineTo( x+rx, y );
        else
            p.moveTo( x, y );
        if ( tr )
            p.lineTo( x+width-rx, y, x+width-rx/2, y+ry/2, x+width-frameSize-ix/2, y+frameSize+iy/2, x+width-frameSize-ix, y+frameSize );
        else
            p.lineTo( x+width, y ).lineTo( x+width-frameSize, y+frameSize );
        if ( tl )
            p.lineTo( x+frameSize+ix, y+frameSize, x+frameSize, y+frameSize+iy );
        else
            p.lineTo( x+frameSize, y+frameSize );
        if ( bl )
            p.lineTo( x+frameSize, y+height-frameSize-iy, x+frameSize+ix/2, y+height-frameSize-iy/2, x+rx/2, y+height-ry/2, x, y+height-ry );
        else
            p.lineTo( x+frameSize, y+height-frameSize, x, y+height );
    } else {
        p.moveTo( x, y ).lineTo( x+width, y, x+width-frameSize, y+frameSize, x+frameSize, y+frameSize, x+frameSize, y+height-frameSize, x, y+height );
    }
    return jSignage._createElement( 'path', { d: p.close(), fill: color } );
}

function shape_down( shape, corners, rx, ry, x, y, width, height, spread, frameSize, color ) {
    var tl = false, tr = false, br = false, bl = false, i = 0
    if ( !corners || corners[i]=='topLeft' ) { tl = true; ++i; }
    if ( !corners || corners[i]=='topRight' ) { tr = true; ++i; }
    if ( !corners || corners[i]=='bottomRight' ) { br = true; ++i; }
    if ( !corners || corners[i]=='bottomLeft' ) { bl = true; ++i; }
    var p = new jSignage.pathData();
    x = Math.min( x - spread, x + width / 2 );
    y = Math.min( y - spread, y + height / 2 );
    width = Math.max( 0, width + 2 * spread );
    height = Math.max( 0, height + 2 * spread );
    if ( shape=='round' ) {
        var rx = Math.max( 0, rx + spread );
        var ry = Math.max( 0, ry + spread );
        var ix = Math.max( 0, rx - frameSize );
        var iy = Math.max( 0, ry - frameSize );
        if ( tr )
            p.moveTo( x+width-frameSize, y+Math.max(ry, frameSize) ).arcTo( ix, iy, 0, 0, 0, x+width-rx+(rx-frameSize)*Math.SQRT1_2, y+ry-(ry-frameSize)*Math.SQRT1_2 ).lineTo( x+width-rx*(1-Math.SQRT1_2), y+ry*(1-Math.SQRT1_2) ).arcTo( rx, ry, 0, 0, 1, x+width, y+ry );
        else
            p.moveTo( x+width-frameSize, y+frameSize ).lineTo( x+width, y );
        if ( br )
            p.lineTo( x+width, y+height-ry ).arcTo( rx, ry, 0, 0, 1, x+width-rx, y+height );
        else
            p.lineTo( x+width, y+height );
        if ( bl )
            p.lineTo( x+rx, y+height ).arcTo( rx, ry, 0, 0, 1, x+rx*(1-Math.SQRT1_2), y+height-ry*(1-Math.SQRT1_2) ).lineTo( x+rx-(rx-frameSize)*Math.SQRT1_2, y+height-ry+(ry-frameSize)*Math.SQRT1_2 ).arcTo( ix, iy, 0, 0, 0, x+Math.max(rx,frameSize), y+height-frameSize );
        else
            p.lineTo( x, y+height, x+frameSize, y+height-frameSize );
        if ( br )
            p.lineTo( x+width-Math.max(rx, frameSize), y+height-frameSize ).arcTo( ix, iy, 0, 0, 0, x+width-frameSize, y+height-Math.max(ry, frameSize) );
        else
            p.lineTo( x+width-frameSize, y+height-frameSize );
    } else if ( shape=='snip' ) {
        var ix = 0, iy = 0;
        if ( rx > 0 && ry > 0 ) {
            var k = 1/rx + 1/ry - Math.sqrt( 1/(rx*rx)+1/(ry*ry) );
            ix = Math.max( 0, rx * ( 1 + (spread-frameSize) * k ) );
            iy = Math.max( 0, ry * ( 1 + (spread-frameSize) * k ) );
            rx = Math.max( 0, rx * ( 1 + spread * k ) );
            ry = Math.max( 0, ry * ( 1 + spread * k ) );
        }
        if ( tr )
            p.moveTo( x+width-frameSize, y+frameSize+iy ).lineTo( x+width-frameSize-ix/2, y+frameSize+iy/2, x+width-rx/2, y+ry/2, x+width, y+ry );
        else
            p.moveTo( x+width-frameSize, y+frameSize ).lineTo( x+width, y );
        if ( br )
            p.lineTo( x+width, y+height-ry, x+width-rx, y+height );
        else
            p.lineTo( x+width, y+height );
        if ( bl )
            p.lineTo( x+rx, y+height, x+rx/2, y+height-ry/2, x+frameSize+ix/2, y+height-frameSize-iy/2, x+frameSize+ix, y+height-frameSize );
        else
            p.lineTo( x, y+height, x+frameSize, y+height-frameSize );
        if ( br )
            p.lineTo( x+width-frameSize-ix, y+height-frameSize, x+width-frameSize, y+height-frameSize-iy );
        else
            p.lineTo( x+width-frameSize, y+height-frameSize );
    } else {
        p.moveTo( x+width, y ).lineTo( x+width, y+height ).lineTo( x, y+height ).lineTo( x+frameSize, y+height-frameSize ).lineTo( x+width-frameSize, y+height-frameSize ).lineTo( x+width-frameSize, y+frameSize );
    }
    return jSignage._createElement( 'path', { d: p.close(), fill: color } );
}


// Composition order, from back to front
// 1) Outset shadows
// 2) As a group with blurred edges
//   a) Back color
//   b) Media content (clipped)
// 3) Inset shadows
// 4) Frame
// 5) Reflection

function build_frame( deco, g, g2, width, height, media, postLayoutCallback, x, y, bbw, bbh, parent, frame_box ) {
    var backColor = deco.backColor || 'none';
    var backOpacity = jSignage.getPercent( deco.backOpacity, 1 );
    var frameColor = deco.frameColor || 'none';
    var shape = deco.shape || 'square';
    var corners = deco.corners;

    if ( deco.uiStyle ) {
        shape = deco.uiStyle=='manzana' ? 'round' : deco.uiStyle;
        if ( backColor=='none' )
            backColor = jSignage.uiColor;
        shades = jSignage.shades( backColor );
        if ( deco.uiStyle!='manzana' ) {
            frameSize = '5%';
            frameColor = shades.darker;
            backColor = shades.normal;
        }
    }

    var top = 0, right = 0, bottom = 0, left = 0;
    var min = Math.min(width,height);
    var frameSize = frameColor=='none' ? 0 : jSignage.relAbs( deco.frameSize, min, 0.06*min );
    var frameOpacity = jSignage.getPercent( deco.frameOpacity, 1 );
    var frameStyle = deco.frameStyle || 'solid';
    var reflectionSize = deco.specialFX=='reflection' ? Math.min( jSignage.relAbs( deco.reflectionSize, height, height*0.3 ), height ) : 0;
    var rx = jSignage.relAbs( deco.rx, min, 0.2*min );
    var ry = jSignage.relAbs( deco.ry, min, rx );
    if ( rx > min*.5 ) rx = min*.5;
    if ( ry > min*.5 ) ry = min*.5;

    var insetShadows = [], boxShadows = [], softEdgeSize = 0;
    var fx = 0, fy = 0, fw = width, fh = height;
    if ( corners ) {
        if ( corners=='left' ) {
            fx -= min/2;
            fw += min/2;
        } else if ( corners=='right' ) {
            fw += min/2;
        }
    }
    if ( frame_box ) {
        frame_box.x1 = fx;
        frame_box.y1 = fy;
        frame_box.x2 = fx + fw;
        frame_box.y2 = fy + fh;
    }

    if ( deco.softEdge ) {
        softEdgeSize = Math.max( jSignage.relAbs( deco.softEdgeSize, min, 0.06*min ), 0 );
        if ( frameSize || ( deco.softEdgeColor && deco.softEdgeColor!='transparent' ) ) {
            insetShadows.push({
                dx: 0,
                dy: 0,
                blur: softEdgeSize/2,
                spread: softEdgeSize/2,
                color: frameSize ? frameColor : deco.softEdgeColor,
                opacity : 1
            });
            softEdgeSize = 0;
        }
    }

    if ( deco.shadowIn ) {
        var shadowInSize = Math.max( jSignage.relAbs( deco.shadowInSize, min, 0.06*min ), 0 );
        insetShadows.push({
            dx: 0,
            dy: 0,
            blur: shadowInSize,
            spread: shadowInSize/4,
            color: deco.shadowInColor || 'black',
            opacity: 'shadowInOpacity' in deco ? deco.shadowInOpacity : 1
        });
    }

    if ( deco.shadow ) {
        var radius = Math.max( jSignage.relAbs( deco.shadowSize, min, 0.03*min ), 0 );
        boxShadows.push({
            dx: 0,
            dy: 0,
            blur: radius/3,
            spread: 0,
            color: deco.shadowColor || 'black',
            opacity: 'shadowOpacity' in deco ? deco.shadowOpacity : 1
        });
    }

    if ( deco.boxShadow ) {
        var m, n;
        while ( m = reSplitShadows.exec( deco.boxShadow ) ) {
            var inset = false, shadow = { dx: 0, dy: 0, blur: 0, spread: 0, color: 'currentColor', opacity: 1 }, na = 0, nb = 0;
            while ( n = reSplitShadowParams.exec( m[0] ) ) {
                if ( n[0]=='inset' ) {
                    inset = true;
                } else {
                    var f = parseFloat( n[0] );
                    if ( isNaN(f) ) {
                        if ( nb==0 ) shadow.color = n[0];
                        ++nb;
                    } else {
                        if ( na==0 ) shadow.dx = f;
                        else if ( na==1 ) shadow.dy = f;
                        else if ( na==2 && f > 0 ) shadow.blur = f;
                        else if ( na==3 && f > 0 ) shadow.spread = f;
                        ++na;
                    }
                }
            }
            var rgba = reRGBA.exec( shadow.color );
            if ( rgba ) {
                shadow.color = 'rgb(' + rgba[1] + ')';
                shadow.opacity = rgba[2];
            }
            if ( inset ) insetShadows.push( shadow ); else boxShadows.push( shadow );
        }
    }

    var defs = [], back = null, frame = null;

    if ( boxShadows.length ) {
        for ( var i=boxShadows.length-1; i >= 0 ; --i ) {        
            var B = boxShadows[i];
            var d = mkshape( shape, corners, rx, ry, B.dx, B.dy, width, height, B.spread );
            var p = jSignage._createElement( 'path', { d: d, fill: B.color, 'fill-opacity': B.opacity } );
            var fX1 = Math.min( 0, B.dx - B.spread - B.blur*1.5 );
            var fY1 = Math.min( 0, B.dy - B.spread - B.blur*1.5 );
            var fX2 = Math.max( 0, B.dx + B.spread + B.blur*1.5 );
            var fY2 = Math.max( 0, B.dy + B.spread + B.blur*1.5 );
            if ( frame_box ) {
                if ( fx+fX1 < frame_box.x1 ) frame_box.x1 = fx+fX1;
                if ( fy+fY1 < frame_box.y1 ) frame_box.y1 = fy+fY1;
                if ( fx+fw+fX2 > frame_box.x2 ) frame_box.x2 = fx+fw+fX2;
                if ( fy+fh+fY2 > frame_box.y2 ) frame_box.y2 = fy+fh+fY2;
            }
            if ( B.blur ) {
                var F = jSignage._createElement( 'filter', { filterUnits: 'userSpaceOnUse', x: fx+fX1, y: fy+fY1, width: fw+fX2-fX1, height: fh+fY2-fY1 } );
                defs.push( F );
                F.appendChild( jSignage._createElement( 'feGaussianBlur', { stdDeviation: B.blur/2 } ) );
                F.id = jSignage.guuid();
                p.setAttribute( 'filter', 'url(#'+F.id+')' );
            }
            g.insertBefore( p, media || g2 );
        }
    }

    if ( backColor!='none' && backOpacity > 0 ) {
        var d = mkshape( shape, corners, rx, ry, 0, 0, width, height );
        if ( deco.uiStyle=='manzana' ) {
            var linearGradient = jSignage._createElement( 'linearGradient', { gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 0, y2: height } );
            defs.push( linearGradient );
            linearGradient.id = jSignage.guuid();
            linearGradient.appendChild( jSignage._createElement( 'stop', { offset: 0, 'stop-color': shades.lighter } ) );
            linearGradient.appendChild( jSignage._createElement( 'stop', { offset: 0.5, 'stop-color': shades.normal } ) );
            linearGradient.appendChild( jSignage._createElement( 'stop', { offset: 0.5, 'stop-color': shades.darker } ) );
            linearGradient.appendChild( jSignage._createElement( 'stop', { offset: 01, 'stop-color': shades.darker } ) );
            backColor = 'url(#'+linearGradient.id+')';
        }
        back = jSignage._createElement( 'path', { d: d, fill: backColor, stroke: 'none', 'fill-opacity': backOpacity } );
    }

    if ( frameSize ) {
        if ( media && !deco.padding ) {
            // The image must be cropped a little bit to maintain the aspect ratio of the layer
            if ( width > height ) {
                left = right = frameSize;
                top = bottom = frameSize*height/width;
            } else {
                left = right = frameSize*width/height;
                top = bottom = frameSize;
            }
        } else {
            left = right = top = bottom = frameSize;
        }
        if ( frameStyle=='dotted' || frameStyle=='dashed' ) {
            var frame = jSignage._createElement( 'g', { 'stroke-linecap': frameStyle=='dotted' ? 'round' : 'butt', fill: 'none', stroke: frameColor, 'stroke-opacity': frameOpacity, 'stroke-width': frameSize } );
            if ( shape=='round' && ( frameStyle=='dotted' || rx > 2*frameSize || ry > 2*frameSize ) ) {
                var tl = false, tr = false, br = false, bl = false, i = 0;
                var frx = Math.max( rx-frameSize/2, 0 );
                var fry = Math.max( ry-frameSize/2, 0 );
                var l = ellipse_length( frx, fry ) / 4, lTop, lRight, lBottom, lLeft;
                lTop = lBottom = width - frameSize;
                lLeft = lRight = height - frameSize;
                if ( !corners || corners[i]=='topLeft' ) { tl = true; lTop += l - frx; lLeft -= fry; ++i; }
                if ( !corners || corners[i]=='topRight' ) { tr = true; lTop += l - frx; lRight -= fry; ++i; }
                if ( !corners || corners[i]=='bottomRight' ) { br = true; lBottom += l - frx; lRight -= fry; ++i; }
                if ( !corners || corners[i]=='bottomLeft' ) { bl = true; lBottom += l - frx; lLeft -= fry; ++i; }
                if ( frameStyle=='dotted' ) {
                    var h = new jSignage.pathData();
                    var numDots = Math.floor( lTop / ( 2 * frameSize ) );
                    if ( numDots > 1 ) --numDots;
                    var gap = lTop/(1+numDots);
                    if ( tl )
                        h.moveTo( frameSize/2, frameSize/2+fry ).arcTo( frx, fry, 0, 0, 1, frameSize/2+frx, frameSize/2 );
                    else
                        h.moveTo( frameSize/2, frameSize/2 );
                    if ( tr )
                        h.lineTo( width-frameSize/2-frx, frameSize/2 ).arcTo( frx, fry, 0, 0, 1, width-frameSize/2, frameSize/2+fry ).lineTo( width-frameSize/2, frameSize/2+fry+gap/4 );
                    else
                        h.lineTo( width-frameSize/2+gap/4, frameSize/2 );
                    frame.appendChild( jSignage._createElement( 'path', { d: h, 'stroke-dasharray': '0 ' + gap } ) );
                    numDots = Math.floor( lRight / ( 2 * frameSize ) ) - 1;
                    if ( numDots < 1 ) numDots = 1;
                    gap = lRight / (1+numDots);
                    if ( gap >= frameSize*1.5 ) {
                        var v = new jSignage.pathData();
                        v.moveTo( width-frameSize/2, frameSize/2 + ( tr ? fry: 0 ) + gap );
                        v.lineTo( width-frameSize/2, height - frameSize/2 - gap - ( br ? fry : 0 ) + gap/4 );
                        frame.appendChild( jSignage._createElement( 'path', { d: v, 'stroke-dasharray': '0 ' + gap } ) );
                    }
                    h = new jSignage.pathData();
                    numDots = Math.floor( lBottom / ( 2 * frameSize ) );
                    if ( numDots > 1 ) --numDots;
                    gap = lBottom/(1+numDots);
                    if ( br )
                        h.moveTo( width-frameSize/2, height-frameSize/2-fry ).arcTo( frx, fry, 0, 0, 1, width-frameSize/2-frx, height-frameSize/2 );
                    else
                        h.moveTo( width-frameSize/2, height-frameSize/2 );
                    if ( bl )
                        h.lineTo( frameSize/2+frx, height-frameSize/2 ).arcTo( frx, fry, 0, 0, 1, frameSize/2, height-frameSize/2-fry ).lineTo( frameSize/2, height-frameSize/2-fry-gap/4 );
                    else
                        h.lineTo( frameSize/2-gap/4, height-frameSize/2 );
                    frame.appendChild( jSignage._createElement( 'path', { d: h, 'stroke-dasharray': '0 ' + gap } ) );
                    numDots = Math.floor( lLeft / ( 2 * frameSize ) ) - 1;
                    if ( numDots < 1 ) numDots = 1;
                    gap = lLeft / (1+numDots);
                    if ( gap >= frameSize*1.5 ) {
                        v = new jSignage.pathData();
                        v.moveTo( frameSize/2, height - frameSize/2 - ( bl ? fry : 0 ) - gap );
                        v.lineTo( frameSize/2, frameSize/2 + ( tl ? fry : 0 ) + gap - gap/4 );
                        frame.appendChild( jSignage._createElement( 'path', { d: v, 'stroke-dasharray': '0 ' + gap } ) );                        
                    }
                } else {

                    if ( !tl ) { lTop += frameSize/2; lLeft -= frameSize*1.5; }
                    if ( !tr ) { lTop += frameSize/2; lRight -= frameSize*1.5; }
                    if ( !br ) { lBottom += frameSize/2; lRight -= frameSize*1.5; }
                    if ( !bl ) { lBottom += frameSize/2; lLeft -= frameSize*1.5; }

                    var numDots = Math.floor( ( lTop + frameSize ) / ( 3 * frameSize ) );
                    if ( numDots < 2 ) numDots = 2;
                    var gap = ( lTop - 2*frameSize )/(numDots-1) - frameSize*2;
                    var h = new jSignage.pathData(), c;
                    if ( tl ) {
                        h.moveTo( frameSize/2, frameSize/2+fry ).arcTo( frx, fry, 0, 0, 1, frameSize/2+frx, frameSize/2 );
                    } else {
                        c = new jSignage.pathData();
                        c.moveTo( frameSize/2, frameSize*2 ).lineTo( frameSize/2, frameSize/2 ).lineTo( frameSize*2, frameSize/2 );
                        frame.appendChild( jSignage._createElement( 'path', { d: c } ) );
                        h.moveTo( frameSize*2+gap, frameSize/2 );
                    }
                    if ( tr ) {
                        h.lineTo( width-frameSize/2-frx, frameSize/2 ).arcTo( frx, fry, 0, 0, 1, width-frameSize/2, frameSize/2 + fry );
                    } else {
                        c = new jSignage.pathData();
                        c.moveTo( width-frameSize*2, frameSize/2 ).lineTo( width-frameSize/2, frameSize/2 ).lineTo( width-frameSize/2, frameSize*2 );
                        frame.appendChild( jSignage._createElement( 'path', { d: c } ) );
                        h.lineTo( width-frameSize*2-gap, frameSize/2 );
                    }
                    frame.appendChild( jSignage._createElement( 'path', { d: h, 'stroke-dasharray': '' + frameSize*2 + ' ' + gap } ) );

                    numDots = Math.floor( ( lBottom + frameSize ) / ( 3 * frameSize ) );
                    if ( numDots < 2 ) numDots = 2;
                    gap = ( lBottom - 2*frameSize )/(numDots-1) - frameSize*2;
                    h = new jSignage.pathData();
                    if ( br ) {
                        h.moveTo( width-frameSize/2, height-frameSize/2-fry ).arcTo( frx, fry, 0, 0, 1, width-frameSize/2-frx, height-frameSize/2 );
                    } else {
                        c = new jSignage.pathData();
                        c.moveTo( width-frameSize/2, height-frameSize*2 ).lineTo( width-frameSize/2, height-frameSize/2 ).lineTo( width-frameSize*2, height-frameSize/2 );
                        frame.appendChild( jSignage._createElement( 'path', { d: c } ) );
                        h.moveTo( width-frameSize*2-gap, height-frameSize/2 );
                    }
                    if ( bl ) {
                        h.lineTo( frameSize/2+frx, height-frameSize/2 ).arcTo( frx, fry, 0, 0, 1, frameSize/2, height-frameSize/2-fry );
                    } else {
                        c = new jSignage.pathData();
                        c.moveTo( frameSize*2, height-frameSize/2 ).lineTo( frameSize/2, height-frameSize/2 ).lineTo( frameSize/2, height-frameSize*2 );
                        frame.appendChild( jSignage._createElement( 'path', { d: c } ) );
                        h.lineTo( frameSize*2+gap, height-frameSize/2 );
                    }
                    frame.appendChild( jSignage._createElement( 'path', { d: h, 'stroke-dasharray': '' + frameSize*2 + ' ' + gap } ) );

                    numDots = Math.floor( ( lRight-frameSize ) / ( 3 * frameSize ) );
                    if ( numDots < 1 ) numDots = 1;
                    gap = ( lRight - numDots*2*frameSize ) / ( numDots + 1);
                    if ( gap >= frameSize*0.75 ) {
                        h = new jSignage.pathData();
                        h.moveTo( width-frameSize/2, (tr ? frameSize/2+fry : frameSize*2 )+gap ).lineTo( width-frameSize/2, height-(br ? frameSize/2+fry : frameSize*2) );
                        frame.appendChild( jSignage._createElement( 'path', { d: h, 'stroke-dasharray': '' + frameSize*2 + ' ' + gap } ) );
                    }

                    numDots = Math.floor( ( lLeft-frameSize ) / ( 3 * frameSize ) );
                    if ( numDots < 1 ) numDots = 1;
                    gap = ( lLeft - numDots*2*frameSize ) / ( numDots + 1);
                    if ( gap >= frameSize*0.75 ) {
                        h = new jSignage.pathData();
                        h.moveTo( frameSize/2, height-gap-(bl ? frameSize/2+fry : frameSize*2) ).lineTo( frameSize/2, tl ? frameSize/2+fry : frameSize*2 );
                        frame.appendChild( jSignage._createElement( 'path', { d: h, 'stroke-dasharray': '' + frameSize*2 + ' ' + gap } ) );
                    }
                }
            } else if ( shape=='snip' && ( frameStyle=='dotted' || rx*rx+ry*ry >= 16*frameSize*frameSize ) ) {
                var lTop = width-frameSize, lRight = height-frameSize, lBottom = width-frameSize, lLeft = height-frameSize;
                var tl = false, tr = false, br = false, bl = false, frx = 0, fry = 0, i = 0;
                if ( rx > 0 && ry > 0 ) {
                    var z = 1 - frameSize/2 * ( 1/rx + 1/ry - Math.sqrt( 1/(rx*rx)+1/(ry*ry) ) );
                    frx = Math.max( 0, rx * z );
                    fry = Math.max( 0, ry * z );
                }
                lTop = lBottom = width - frameSize;
                lLeft = lRight = height - frameSize;
                var lCorner = Math.sqrt(frx*frx+fry*fry);
                if ( !corners || corners[i]=='topLeft' ) { lTop -= frx; lLeft -= fry; tl = true; ++i; }
                if ( !corners || corners[i]=='topRight' ) { lTop -= frx; lRight -= fry; tr = true; ++i; }
                if ( !corners || corners[i]=='bottomRight' ) { lBottom -= frx; lRight -= fry; br = true; ++i; }
                if ( !corners || corners[i]=='bottomLeft' ) { lBottom -= frx; lLeft -= fry; bl = true; ++i; }
                if ( frameStyle=='dotted' ) {
                    var h = new jSignage.pathData();
                    var numDots = Math.floor( lTop / ( 2 * frameSize ) );
                    if ( numDots > 1 ) --numDots;
                    var gap = lTop/(1+numDots);
                    h.moveTo( frameSize/2 + ( tl ? frx : 0 ), frameSize/2 ).lineTo( width - frameSize/2 - ( tr ? frx : 0 ) + gap/4, frameSize/2 );
                    frame.appendChild( jSignage._createElement( 'path', { d: h, 'stroke-dasharray': '0 ' + gap } ) );
                    h = new jSignage.pathData();
                    numDots = Math.floor( lBottom / ( 2 * frameSize ) );
                    if ( numDots > 1 ) --numDots;
                    gap = lBottom/(1+numDots);
                    h.moveTo( width - frameSize/2 - ( br ? frx : 0 ), height-frameSize/2 ).lineTo( frameSize/2 + ( bl ? frx : 0 ) - gap/4, height-frameSize/2 );
                    frame.appendChild( jSignage._createElement( 'path', { d: h, 'stroke-dasharray': '0 ' + gap } ) );
                    h = new jSignage.pathData();
                    numDots = Math.floor( lRight / ( 2 * frameSize ) );
                    if ( numDots > 1 ) --numDots;
                    gap = lRight/(1+numDots);
                    h.moveTo( width - frameSize/2, frameSize/2 + ( tr ? fry : 0 ) ).lineTo( width - frameSize/2, height - frameSize/2 - ( br ? fry : 0 ) + gap/4 );
                    frame.appendChild( jSignage._createElement( 'path', { d: h, 'stroke-dasharray': '0 ' + gap } ) );
                    h = new jSignage.pathData();
                    numDots = Math.floor( lLeft / ( 2 * frameSize ) );
                    if ( numDots > 1 ) --numDots;
                    gap = lLeft/(1+numDots);
                    h.moveTo( frameSize/2, height - frameSize/2 - ( bl ? fry : 0 ) ).lineTo( frameSize/2, frameSize/2 + ( tl ? fry : 0 ) - gap/4 );
                    frame.appendChild( jSignage._createElement( 'path', { d: h, 'stroke-dasharray': '0 ' + gap } ) );
                    numDots = Math.floor( lCorner / ( 2 * frameSize ) ) - 1;
                    if ( numDots < 1 ) numDots = 1;
                    gap = lCorner / (1+numDots);
                    if ( gap >= frameSize*1.5 ) {
                        var v = new jSignage.pathData();
                        var dx = frx * gap / lCorner, dy = fry * gap / lCorner;
                        if ( tr )
                            v.moveTo( width-frameSize/2-frx+dx, frameSize/2+dy ).lineTo( width-frameSize/2-dx*.75, frameSize/2+fry-dy*.75 );
                        if ( br )
                            v.moveTo( width-frameSize/2-dx, height-frameSize/2-fry+dy ).lineTo( width-frameSize/2-frx+dx*.75, height-frameSize/2-dy*.75 );
                        if ( bl )
                            v.moveTo( frameSize/2+frx-dx, height-frameSize/2-dy ).lineTo( frameSize/2+dx*.75, height-frameSize/2-fry+dy*.75 );
                        if ( tl )
                            v.moveTo( frameSize/2+dx, frameSize/2+fry-dy ).lineTo( frameSize/2+frx-dx*.75, frameSize/2+dy*.75 );
                        frame.appendChild( jSignage._createElement( 'path', { d: v, 'stroke-dasharray': '0 ' + gap } ) );
                    }
                } else {
                    var numDots = Math.floor( (lTop-frameSize) / ( 3 * frameSize ) ) - 1;
                    if ( numDots < 1 ) numDots = 1;
                    var gap = (lTop-frameSize)/(1+numDots)-2*frameSize;
                    if ( gap >= 0 ) {
                        var h = new jSignage.pathData();
                        h.moveTo( frameSize*2+(tl ? frx : 0)+gap, frameSize/2 ).lineTo( width-frameSize*2-(tr ? frx : 0)-gap, frameSize/2 );
                        frame.appendChild( jSignage._createElement( 'path', { d: h, 'stroke-dasharray': '' + frameSize*2 + ' ' + gap } ) );
                    }
                    numDots = Math.floor( (lRight-frameSize) / ( 3 * frameSize ) ) - 1;
                    if ( numDots < 1 ) numDots = 1;
                    gap = (lRight-frameSize)/(1+numDots)-2*frameSize;
                    if ( gap >= 0 ) {
                        h = new jSignage.pathData();
                        h.moveTo( width-frameSize/2, 2*frameSize+(tr ? fry : 0)+gap ).lineTo( width-frameSize/2, height-2*frameSize-(br ? fry : 0)-gap );
                        frame.appendChild( jSignage._createElement( 'path', { d: h, 'stroke-dasharray': '' + frameSize*2 + ' ' + gap } ) );
                    }
                    numDots = Math.floor( (lBottom-frameSize) / ( 3 * frameSize ) ) - 1;
                    if ( numDots < 1 ) numDots = 1;
                    gap = (lBottom-frameSize)/(1+numDots)-2*frameSize;
                    if ( gap >= 0 ) {
                        h = new jSignage.pathData();
                        h.moveTo( width-2*frameSize-(br ? frx : 0)-gap, height-frameSize/2 ).lineTo( 2*frameSize+(bl ? frx : 0)+gap, height-frameSize/2 );
                        frame.appendChild( jSignage._createElement( 'path', { d: h, 'stroke-dasharray': '' + frameSize*2 + ' ' + gap } ) );
                    }
                    numDots = Math.floor( (lLeft-frameSize) / ( 3 * frameSize ) ) - 1;
                    if ( numDots < 1 ) numDots = 1;
                    gap = (lLeft-frameSize)/(1+numDots)-2*frameSize;
                    if ( gap >= 0 ) {
                        h = new jSignage.pathData();
                        h.moveTo( frameSize/2, height-2*frameSize-(bl ? fry : 0)-gap ).lineTo( frameSize/2, 2*frameSize+(tl ? fry : 0)+gap );
                        frame.appendChild( jSignage._createElement( 'path', { d: h, 'stroke-dasharray': '' + frameSize*2 + ' ' + gap } ) );
                    }
                    var dx = frx * frameSize * 1.5 / lCorner, dy = fry * frameSize * 1.5 / lCorner;
                    numDots = Math.floor( (lCorner-frameSize) / ( 3 * frameSize ) ) - 1;
                    if ( numDots < 1 ) numDots = 1;
                    gap = (lCorner-frameSize)/(1+numDots)-2*frameSize;
                    var ddx = frx * gap / lCorner, ddy = fry * gap / lCorner;
                    if ( gap >= frameSize*.65 ) {
                        h = new jSignage.pathData();
                        if ( tr )
                            h.moveTo( width-frameSize/2-frx+dx+ddx, frameSize/2+dy+ddy ).lineTo( width-frameSize/2-dx-ddx, frameSize/2+fry-dy-ddy );
                        if ( br )
                            h.moveTo( width-frameSize/2-dx-ddx, height-frameSize/2-fry+dy+ddy ).lineTo( width-frameSize/2-frx+dx+ddx, height-frameSize/2-dy-ddy );
                        if ( bl )
                            h.moveTo( frameSize/2+frx-dx-ddx, height-frameSize/2-dy-ddy ).lineTo( frameSize/2+dx+ddx, height-frameSize/2-fry+dy+ddy );
                        if ( tl )
                            h.moveTo( frameSize/2+dx+ddx, frameSize/2+fry-dy-ddy ).lineTo( frameSize/2+frx-dx-ddx, frameSize/2+dy+ddy );
                        frame.appendChild( jSignage._createElement( 'path', { d: h, 'stroke-dasharray': '' + frameSize*2 + ' ' + gap } ) );
                    }
                    var c = new jSignage.pathData();
                    if ( tr ) {
                        c.moveTo( width-frameSize*2-frx, frameSize/2 ).lineTo( width-frameSize/2-frx, frameSize/2 ).lineTo( width-frameSize/2-frx+dx, frameSize/2+dy );
                        c.moveTo( width-frameSize/2-dx, frameSize/2+fry-dy ).lineTo( width-frameSize/2, frameSize/2+fry ).lineTo( width-frameSize/2, frameSize*2+fry );
                    } else {
                        c.moveTo( width-frameSize*2, frameSize/2 ).lineTo( width-frameSize/2, frameSize/2 ).lineTo( width-frameSize/2, frameSize*2 );
                    }
                    if ( br ) {
                        c.moveTo( width-frameSize/2, height-frameSize*2-fry ).lineTo( width-frameSize/2, height-frameSize/2-fry ).lineTo( width-frameSize/2-dx, height-frameSize/2-fry+dy );
                        c.moveTo( width-frameSize/2-frx+dx, height-frameSize/2-dy ).lineTo( width-frameSize/2-frx, height-frameSize/2 ).lineTo( width-frameSize*2-frx, height-frameSize/2 );
                    } else {
                        c.moveTo( width-frameSize/2, height-frameSize*2 ).lineTo( width-frameSize/2, height-frameSize/2 ).lineTo( width-frameSize*2, height-frameSize/2 );
                    }
                    if ( bl ) {
                        c.moveTo( frameSize*2+frx, height-frameSize/2 ).lineTo( frameSize/2+frx, height-frameSize/2 ).lineTo( frameSize/2+frx-dx, height-frameSize/2-dy );
                        c.moveTo( frameSize/2+dx, height-frameSize/2-fry+dy ).lineTo( frameSize/2, height-frameSize/2-fry ).lineTo( frameSize/2, height-frameSize*2-fry );
                    } else {
                        c.moveTo( frameSize*2, height-frameSize/2 ).lineTo( frameSize/2, height-frameSize/2 ).lineTo( frameSize/2, height-frameSize*2 );
                    }
                    if ( tl ) {
                        c.moveTo( frameSize/2, frameSize*2+fry ).lineTo( frameSize/2, frameSize/2+fry ).lineTo( frameSize/2+dx, frameSize/2+fry-dy );
                        c.moveTo( frameSize/2+frx-dx, frameSize/2+dy ).lineTo( frameSize/2+frx, frameSize/2 ).lineTo( frameSize*2+frx, frameSize/2 );
                    } else {
                        c.moveTo( frameSize/2, frameSize*2 ).lineTo( frameSize/2, frameSize/2 ).lineTo( frameSize*2, frameSize/2 );
                    }
                    frame.appendChild( jSignage._createElement( 'path', { d: c } ) );
                }
            } else if ( frameStyle=='dotted' ) {
                var h = new jSignage.pathData();
                var numDots = Math.floor( (width-frameSize) / ( 2 * frameSize ) );
                if ( numDots > 1 ) --numDots;
                var gap = (width-frameSize)/(1+numDots);
                h.moveTo( frameSize/2, frameSize/2 ).lineTo( width-frameSize/2+gap/4, frameSize/2 );
                h.moveTo( width-frameSize/2, height-frameSize/2 ).lineTo( frameSize/2-gap/4, height-frameSize/2 );
                frame.appendChild( jSignage._createElement( 'path', { d: h, 'stroke-dasharray': '0 ' + gap } ) );
                numDots = Math.floor( (height-frameSize) / ( 2 * frameSize ) ) - 1;
                if ( numDots < 1 ) numDots = 1;
                gap = (height-frameSize) / (1+numDots);
                if ( gap >= frameSize*1.5 ) {
                    var v = new jSignage.pathData();
                    v.moveTo( width-frameSize/2, frameSize/2+gap ).lineTo( width-frameSize/2, height-frameSize/2-gap+gap/4 );
                    v.moveTo( frameSize/2, height-frameSize/2-gap ).lineTo( frameSize/2, frameSize/2+gap-gap/4 );
                    frame.appendChild( jSignage._createElement( 'path', { d: v, 'stroke-dasharray': '0 ' + gap } ) );
                }
            } else {
                var frx = 0, fry = 0;
                if ( shape=='round' ) {
                    frx = Math.max( rx - frameSize/2, 0 );
                    fry = Math.max( ry - frameSize/2, 0 );
                } else if ( shape=='snip' && rx > 0 && ry > 0 ) {
                    var z = 1 - frameSize/2 * ( 1/rx + 1/ry - Math.sqrt( 1/(rx*rx)+1/(ry*ry) ) );
                    frx = Math.max( 0, rx * z );
                    fry = Math.max( 0, ry * z );
                } else {
                    corners = null;
                }
                var numDots = Math.floor( (width-Math.max(frameSize,frameSize/2+frx)*2) / ( 3 * frameSize ) ) - 1;
                if ( numDots < 1 ) numDots = 1;
                var gap = (width-Math.max(frameSize,frameSize/2+frx)*2)/(1+numDots)-frameSize*2;
                if ( gap >= frameSize/2 ) {
                    var h = new jSignage.pathData();
                    h.moveTo( Math.max(frameSize*2, frameSize*1.5+frx)+gap, frameSize/2 ).lineTo( width-Math.max(frameSize*2,frameSize*1.5+frx)-gap, frameSize/2 );
                    h.moveTo( width-Math.max(frameSize*2,frameSize*1.5+frx)-gap, height-frameSize/2 ).lineTo( Math.max(frameSize*2,frameSize*1.5+frx)+gap, height-frameSize/2 );
                    frame.appendChild( jSignage._createElement( 'path', { d: h, 'stroke-dasharray': '' + frameSize*2 + ' ' + gap } ) );
                }
                numDots = Math.floor( (height-Math.max(frameSize,frameSize/2+fry)*2) / ( 3 * frameSize ) ) - 1;
                if ( numDots < 1 ) numDots = 1;
                gap = (height-Math.max(frameSize,frameSize/2+fry)*2)/(1+numDots)-frameSize*2;
                if ( gap >= frameSize/2 ) {
                    var v = new jSignage.pathData();
                    v.moveTo( width-frameSize/2, Math.max(frameSize*2,frameSize*1.5+fry)+gap ).lineTo( width-frameSize/2, height-Math.max(frameSize*2,frameSize*1.5+fry)-gap );
                    v.moveTo( frameSize/2, height-Math.max(frameSize*2,frameSize*1.5+fry)-gap ).lineTo( frameSize/2, Math.max(frameSize*2,frameSize*1.5+fry)+gap );
                    frame.appendChild( jSignage._createElement( 'path', { d: v, 'stroke-dasharray': '' + frameSize*2 + ' ' + gap } ) );
                }
                var c = new jSignage.pathData(), i = 0;
                c.moveTo( frameSize/2, Math.max( frameSize*2, frameSize*1.5 + fry ) );
                if ( !corners || corners[i]=='topLeft' ) {
                    c.lineTo( frameSize/2, frameSize/2 + fry );
                    if ( shape=='round' )
                        c.arcTo( frx, fry, 0, 0, 1, frameSize/2+frx, frameSize/2 );
                    else
                        c.lineTo( frameSize/2+frx, frameSize/2 );
                    ++i;
                } else {
                    c.lineTo( frameSize/2, frameSize/2 );
                }
                c.lineTo( Math.max( frameSize*2, frameSize*1.5 + frx ), frameSize/2 );
                c.moveTo( width-Math.max( frameSize*2, frameSize*1.5 + frx ), frameSize/2 );
                if ( !corners || corners[i]=='topRight' ) {
                    c.lineTo( width-frameSize/2-frx, frameSize/2 );
                    if ( shape=='round' )
                        c.arcTo( frx, fry, 0, 0, 1, width-frameSize/2, frameSize/2+fry );
                    else
                        c.lineTo( width-frameSize/2, frameSize/2+fry );
                    ++i;
                } else {
                    c.lineTo( width-frameSize/2, frameSize/2 );
                }
                c.lineTo( width-frameSize/2, Math.max( frameSize*2, frameSize*1.5 + fry ) );
                c.moveTo( width-frameSize/2, height-Math.max( frameSize*2, frameSize*1.5 + fry ) );
                if ( !corners || corners[i]=='bottomRight' ) {
                    c.lineTo( width-frameSize/2, height-frameSize/2-fry );
                    if ( shape=='round' ) 
                        c.arcTo( frx, fry, 0, 0, 1, width-frameSize/2-frx, height-frameSize/2 );
                    else
                        c.lineTo( width-frameSize/2-frx, height-frameSize/2 );
                    ++i;
                } else {
                    c.lineTo( width-frameSize/2, height-frameSize/2 );
                }
                c.lineTo( width-Math.max( frameSize*2, frameSize*1.5 + frx ), height-frameSize/2 );
                c.moveTo( Math.max( frameSize*2, frameSize*1.5 + frx ), height-frameSize/2 );
                if ( !corners || corners[i]=='bottomLeft' ) {
                    c.lineTo( frameSize/2+frx, height-frameSize/2 );
                    if ( shape=='round' )
                        c.arcTo( frx, fry, 0, 0, 1, frameSize/2, height-frameSize/2-fry );
                    else
                        c.lineTo( frameSize/2, height-frameSize/2-fry );
                    ++i;
                } else {
                    c.lineTo( frameSize/2, height-frameSize/2 );
                }
                c.lineTo( frameSize/2, height-Math.max( frameSize*2, frameSize*1.5 + fry ) );
                frame.appendChild( jSignage._createElement( 'path', { d: c } ) );
            }
        } else if ( frameStyle=='double' ) {
            var frame = jSignage._createElement( 'g', { fill: 'none', stroke: frameColor, 'stroke-opacity': frameOpacity, 'stroke-width': frameSize/3 } );
            frame.appendChild( jSignage._createElement( 'path', { d: mkshape( shape, corners, rx, ry, 0, 0, width, height, -frameSize/6 ) } ) );
            frame.appendChild( jSignage._createElement( 'path', { d: mkshape( shape, corners, rx, ry, 0, 0, width, height, -(5*frameSize)/6 ) } ) );
        } else if ( frameStyle=='outset' || frameStyle=='inset' ) {
            var shades = jSignage.shades( frameColor );
            var frame = jSignage._createElement( 'g', { fill: 'none', stroke: 'none', 'fill-opacity': frameOpacity } );
            frame.appendChild( shape_up( shape, corners, rx, ry, 0, 0, width, height, 0, frameSize, frameStyle=='inset' ? shades.darker : shades.lighter ) );
            frame.appendChild( shape_down( shape, corners, rx, ry, 0, 0, width, height, 0, frameSize, frameStyle=='inset' ? shades.lighter : shades.darker ) );
        } else if ( frameStyle=='ridge' || frameStyle=='groove' ) {
            var shades = jSignage.shades( frameColor );
            var frame = jSignage._createElement( 'g', { fill: 'none', stroke: 'none', 'fill-opacity': frameOpacity } );
            frame.appendChild( shape_up( shape, corners, rx, ry, 0, 0, width, height, 0, frameSize/2, frameStyle=='groove' ? shades.darker : shades.lighter ) );
            frame.appendChild( shape_up( shape, corners, rx, ry, 0, 0, width, height, -frameSize/2, frameSize/2, frameStyle=='groove' ? shades.lighter : shades.darker ) );
            frame.appendChild( shape_down( shape, corners, rx, ry, 0, 0, width, height, -frameSize/2, frameSize/2, frameStyle=='groove' ? shades.darker : shades.lighter ) );
            frame.appendChild( shape_down( shape, corners, rx, ry, 0, 0, width, height, 0, frameSize/2, frameStyle=='groove' ? shades.lighter : shades.darker ) );
        } else {
            var d = mkshape( shape, corners, rx, ry, 0, 0, width, height, -frameSize/2 );
            frame = jSignage._createElement( 'path', { d: d, fill: 'none', stroke: frameColor, 'stroke-opacity': frameOpacity, 'stroke-width': frameSize } );
        }
    }

    if ( deco.padding ) {
        var pads = String(deco.padding).split( reSplitList ), n = pads.length;
        if ( n > 0 ) {
            if ( n<2 ) pads[1] = pads[0];
            if ( n<3 ) pads[2] = pads[0];
            if ( n<4 ) pads[3] = pads[1];
            top += Math.min( jSignage.relAbs( pads[0], min ), min * .45 );
            right += Math.min( jSignage.relAbs( pads[1], min ), min*.45 );
            bottom += Math.min( jSignage.relAbs( pads[2], min ), min*.45 );
            left += Math.min( jSignage.relAbs( pads[3], min ), min * .45 );
            if ( left + right > width ) {
                var lpr = width / ( left + right );
                left *= lpr;
                right *= lpr;
            }
            if ( top + bottom > height ) {
                var tpb = height / ( top + bottom );
                top *= tpb;
                bottom *= tpb;
            }
        }
    }

    if ( media ) {
        media.setAttribute( 'x', left );
        media.setAttribute( 'y', top );
        media.setAttribute( 'width', width-right-left );
        media.setAttribute( 'height', height-bottom-top );
    } else {
        g2.setAttribute( 'transform', 'translate('+left+','+top+')' );
        g2.setAttribute( 'width', width-right-left );
        g2.setAttribute( 'height', height-bottom-top );
    }

    var mustClip = false, crx = rx, cry = ry, cfs = 0;
    if ( media && media.localName!='animation' ? deco.clip!==false : deco.clip ) {
        if ( frameSize && ( frameOpacity < 1 || frameStyle=='dotted' || frameStyle=='dashed' || frameStyle=='double' ) ) {
            cfs = frameSize;
            if ( shape=='round' ) {
                crx = Math.max( rx-frameSize, 0 );
                cry = Math.max( ry-frameSize, 0 );
            } else if ( shape=='snip' ) {
                var z = 1 - frameSize * ( 1/rx + 1/ry - Math.sqrt( 1/(rx*rx)+1/(ry*ry) ) );
                crx = Math.max( 0, rx * z );
                cry = Math.max( 0, ry * z );
            }
        }
        var cl = left-cfs, ct = top-cfs, cr = right-cfs, cb = bottom-cfs;
        if ( cl < 0 || ct < 0 || cr < 0 || cb < 0 ) {
            mustClip = true;
        } else if ( shape=='round' ) {
            if ( crx > 0 && cry > 0 ) {
                var i = 0;
                if ( !corners || corners[i]=='topLeft' ) {
                    mustClip = mustClip || cl < crx && ct < cry && (crx-cl)*(crx-cl)/(crx*crx)+(cry-ct)*(cry-ct)/(cry*cry) > 1;
                    ++i;
                }
                if ( !corners || corners[i]=='topRight' ) {
                    mustClip = mustClip || cr < crx && ct < cry && (crx-cr)*(crx-cr)/(crx*crx)+(cry-ct)*(cry-ct)/(cry*cry) > 1;
                    ++i;
                }
                if ( !corners || corners[i]=='bottomRight' ) {
                    mustClip = mustClip || cr < crx && cb < cry && (crx-cr)*(crx-cr)/(crx*crx)+(cry-cb)*(cry-cb)/(cry*cry) > 1;
                    ++i;
                }
                if ( !corners || corners[i]=='bottomLeft' ) {
                    mustClip = mustClip || cl < crx && cb < cry && (crx-cl)*(crx-cl)/(crx*crx)+(cry-cb)*(cry-cb)/(cry*cry) > 1;
                    ++i;
                }
            }
        } else if ( shape=='snip' ) {
            if ( crx > 0 && cry > 0 ) {
                var i = 0;
                if ( !corners || corners[i]=='topLeft' ) {
                    mustClip = mustClip || cl/crx+ct/cry < 1;
                    ++i;
                }
                if ( !corners || corners[i]=='topRight' ) {
                    mustClip = mustClip || cr/crx+ct/cry < 1;
                    ++i;
                }
                if ( !corners || corners[i]=='bottomRight' ) {
                    mustClip = mustClip || cr/crx+cb/cry < 1;
                    ++i;
                }
                if ( !corners || corners[i]=='bottomLeft' ) {
                    mustClip = mustClip || cl/crx+cb/cry < 1;
                    ++i;
                }
            }
        }
    }

    if ( softEdgeSize || mustClip ) {
        if ( shape=='square' && !softEdgeSize ) {
            var clipPath = jSignage._createElement( 'clipPath' );
            clipPath.id = jSignage.guuid();
            clipPath.appendChild( jSignage._createElement( 'rect', { x: cfs, y: cfs, width: width-cfs*2, height: height-cfs*2 } ) );
            defs.push( clipPath );
            ( media || g2 ).setAttribute( 'clip-path', 'url(#'+clipPath.id+')' );
        } else {
            var backImage = null;
            if ( back && softEdgeSize ) {
                back.id = jSignage.guuid();
                defs.push( back );
                backImage = jSignage._createElement( 'feImage', { result: 'B' } );
                backImage.setAttributeNS( jSignage.xlinkNS, 'href', '#'+back.id );
                back = null;
            }
            var d = mkshape( shape, corners, crx, cry, cfs, cfs, width-cfs*2, height-cfs*2, -softEdgeSize/2 );
            var p = jSignage._createElement( 'path', { d: d, stroke: 'none', fill: 'black', 'fill-opacity': 1 } );
            p.id = jSignage.guuid();
            defs.push( p );
            var F = jSignage._createElement( 'filter', { filterUnits: 'userSpaceOnUse', x: fx, y: fy, width: fw, height: fh } );
            F.id = jSignage.guuid();
            defs.push( F );
            var feImage = jSignage._createElement( 'feImage', { result: 'S' } );
            feImage.setAttributeNS( jSignage.xlinkNS, 'href', '#'+p.id );
            F.appendChild( feImage );
            if ( softEdgeSize )
                F.appendChild( jSignage._createElement( 'feGaussianBlur', { in: 'S', stdDeviation: softEdgeSize/5, result: 'S' } ) );
            if ( backImage ) {
                F.appendChild( backImage );
                var feMerge = jSignage._createElement( 'feMerge' );
                feMerge.appendChild( jSignage._createElement( 'feMergeNode', { in: 'B' } ) );
                feMerge.appendChild( jSignage._createElement( 'feMergeNode', { in: 'SourceGraphic' } ) );
                F.appendChild( feMerge );
                F.appendChild( jSignage._createElement( 'feComposite', { operator: 'in', in2: 'S' } ) );
            } else {
                F.appendChild( jSignage._createElement( 'feComposite', { in: 'SourceGraphic', operator: 'in', in2: 'S' } ) );
            }
            ( media || g2 ).setAttribute( 'filter', 'url(#'+F.id+')' );
        }
    }

    if ( back )
        g.insertBefore( back, media || g2 );

    for ( var i=insetShadows.length-1; i >= 0 ; --i ) {
        var B = insetShadows[i];
        var d = mkshape( shape, corners, rx, ry, B.dx, B.dy, width, height, -frameSize-B.spread );
        var p = jSignage._createElement( 'path', { d: d, fill: 'black', stroke: 'none', 'fill-opacity': 1 } );
        p.id = jSignage.guuid();
        defs.push( p );
        var F = jSignage._createElement( 'filter', { filterUnits: 'userSpaceOnUse', x: fx, y: fy, width: fw, height: fh } );
        F.id = jSignage.guuid();
        defs.push( F );
        var feImage = jSignage._createElement( 'feImage', { result: 'S' } );
        feImage.setAttributeNS( jSignage.xlinkNS, 'href', '#'+p.id );
        F.appendChild( feImage );
        if ( B.blur )
            F.appendChild( jSignage._createElement( 'feGaussianBlur', { in: 'S', stdDeviation: B.blur/2, result: 'S' } ) );
        F.appendChild( jSignage._createElement( 'feComposite', { in: 'SourceGraphic', operator: 'out', in2: 'S' } ) );
        var d2 = mkshape( shape, corners, rx, ry, 0, 0, width, height, 0 );
        var p2 = jSignage._createElement( 'path', { d: d2, fill: B.color, stroke: 'none', 'fill-opacity': B.opacity, filter: 'url(#'+F.id+')' } );
        g.appendChild( p2 );
    }

    if ( frame )
        g.appendChild( frame );

    if ( reflectionSize ) {
        var reflectionOpacity = jSignage.getPercent( deco.reflectionOpacity, 1 );
        var F = jSignage._createElement( 'filter', { filterUnits: 'userSpaceOnUse', x: fx, y: height-reflectionSize, width: fw, height: reflectionSize } );
        F.id = jSignage.guuid();
        defs.push( F );
        var g4 = jSignage._createElement( 'g', { transform: 'matrix(1,0,0,-1,0,'+(2*height)+')', filter: 'url(#'+F.id+')' } );
        if ( back )
            g4.appendChild( back.cloneNode( true ) );
        var use = jSignage._createElement( 'use' );
        if ( media ) {
            if ( !media.id )
                media.id = jSignage.guuid();
            use.setAttributeNS( jSignage.xlinkNS, 'href', '#'+media.id );
        } else {
            use.setAttributeNS( jSignage.xlinkNS, 'href', '#'+g2.id );
        }
        g4.appendChild( use );
        if ( frame )
            g4.appendChild( frame.cloneNode( true ) );
        g.appendChild( g4 );
        var grv = jSignage._createElement( 'linearGradient', { gradientUnits: 'userSpaceOnUse', x1: 0, y1: reflectionSize, x2: 0, y2: 0 } );
        grv.id = jSignage.guuid();
        grv.appendChild( jSignage._createElement( 'stop', { offset: 0, 'stop-color': '#000000', 'stop-opacity': reflectionOpacity } ) );
        grv.appendChild( jSignage._createElement( 'stop', { offset: 0.5, 'stop-color': '#000000', 'stop-opacity': 0.3*reflectionOpacity } ) );
        grv.appendChild( jSignage._createElement( 'stop', { offset: 1, 'stop-color': '#000000', 'stop-opacity': 0 } ) );
        defs.push( grv );
        var rv = jSignage._createElement( 'rect', { x: fx, y: 0, width: fw, height: reflectionSize, stroke: 'none', fill: 'url(#'+grv.id+')' } );
        rv.id = jSignage.guuid();
        defs.push( rv );
        var grh = jSignage._createElement( 'linearGradient', { gradientUnits: 'userSpaceOnUse', x1: fx, y1: 0, x2: fx+fw, y2: 0 } );
        grh.id = jSignage.guuid();
        grh.appendChild( jSignage._createElement( 'stop', { offset: 0, 'stop-color': '#000000', 'stop-opacity': 0.25 } ) );
        grh.appendChild( jSignage._createElement( 'stop', { offset: 0.25, 'stop-color': '#000000', 'stop-opacity': 0.75 } ) );
        grh.appendChild( jSignage._createElement( 'stop', { offset: 0.75, 'stop-color': '#000000', 'stop-opacity': 0.75 } ) );
        grh.appendChild( jSignage._createElement( 'stop', { offset: 1, 'stop-color': '#000000', 'stop-opacity': 0.25 } ) );
        defs.push( grh );
        var rh = jSignage._createElement( 'rect', { x: fx, y: 0, width: fw, height: reflectionSize, stroke: 'none', fill: 'url(#'+grh.id+')' } );
        rh. id = jSignage.guuid();
        defs.push( rh );
        var feImageV = jSignage._createElement( 'feImage', { result: 'V' } );
        feImageV.setAttributeNS( jSignage.xlinkNS, 'href', '#'+rv.id );
        F.appendChild( feImageV );
        var feImageH = jSignage._createElement( 'feImage', { result: 'H' } );
        feImageH.setAttributeNS( jSignage.xlinkNS, 'href', '#'+rh.id );
        F.appendChild( feImageH );
        F.appendChild( jSignage._createElement( 'feComposite', { in: 'SourceGraphic', operator: 'in', in2: 'V' } ) );
        F.appendChild( jSignage._createElement( 'feComposite', { operator: 'in', in2: 'H' } ) );
        if ( frame_box ) {
            if ( fy+fh+reflectionSize > frame_box.y2 ) frame_box.y2 = fy+fh+reflectionSize;
        }
    }

    if ( defs.length ) {
        var D = jSignage._createElement( 'defs' );
        for ( var i=0; i < defs.length; i++ )
            D.appendChild( defs[i] );
        var child = g.firstElementChild;
        if ( child.localName=='set' || child.localName=='animate' )
            child = child.nextElementSibling;
        g.insertBefore( D, child );
    }

    if ( g2 && postLayoutCallback )
        postLayoutCallback.call( g2, width-right-left, height-top-bottom, x+left, y+top, bbw, bbh, parent );
}

function resize_media_frame( deco, g, width, height, preserveAspectRatio ) {
    var x, next, media=null;

    for ( x=g.firstElementChild; x; x=x.nextElementSibling )
        if ( x.localName!='set' && x.localName!='animate' )
            break;

    if ( !x )
        return;

    for ( ; x; x=next ) {
        next = x.nextElementSibling;
        var name = x.localName;
        if (name == 'image' || name == 'video' || name == 'animation' || name == 'iframe' || name == 'foreignObject')
            media = x;
        else
            g.removeChild( x );
    }

    if ( media ) {
        if ( deco ) {
            build_frame( deco, g, null, width, height, media, null, 0, 0, 0, 0, g, null );
        } else {
            media.setAttribute( 'width', width );
            media.setAttribute( 'height', height );
        }
        media.setAttribute( 'preserveAspectRatio', preserveAspectRatio );
    }
}

jSignage.extend({

    guuid: function() { return "guuid_"+(++window.__jSignage__global.guuid_counter); },

    _createElement: function( name, attr ) {
        var elem = document.createElementNS( jSignage.svgNS, name );
        if ( attr!==undefined ) for ( var key in attr )
            elem.setAttribute( key, attr[key] );
        return elem;
    },

    createElement: function( name, attr ) { return jSignage(jSignage._createElement(name, attr)); },

    setAttributes: function( elem, attr ) {
        for ( var key in attr )
            elem.setAttribute( key, attr[key] );
    },

    setViewportAttr: function( elem, attr ) {
        if ( attr ) {
            for ( var i=0; i<viewport_attributes.length; i++ ) {
                var name=viewport_attributes[i];
                if ( name in attr )
                    elem.setAttributeNS( jSignage.spxNS, name, attr[name] );
            }
            if ( 'opacity' in attr )
                elem.setAttribute( 'opacity', attr.opacity );
            if ( 'audioLevel' in attr )
                elem.setAttribute( 'audio-level', attr['audioLevel'] );
            if ( 'audioPan' in attr )
                elem.setAttribute( 'audio-pan', attr['audioPan'] );
            elem.id = 'id' in attr ? attr.id : jSignage.guuid();
        } else { 
            elem.id = jSignage.guuid();
        }
    },

    setTimingAttr: function( elem, attr, media ) {
        var hasTiming = false;
        elem.setAttribute( 'dur', media ? 'media' : 'indefinite' );
        if ( attr ) for ( var i=0; i<timing_attributes.length; i++ ) {
            var name=timing_attributes[i];
            if ( name in attr ) {
                hasTiming = true;
                elem.setAttribute( name, attr[name] );
            }
        }
        return hasTiming;
    },

    addSetForTiming: function( elem, attr, always, media ) {
        if ( jSignage.timeline ) {
            jSignage.setTimingAttr( elem, attr, media );
            return elem;
        }
        var set = jSignage._createElement( "set", { attributeName: 'display', to: 'inherit' } );
        if ( jSignage.setTimingAttr( set, attr, media ) || always ) {
            elem.setAttribute( 'display', 'none' );
            set.id = jSignage.guuid();
            elem.insertBefore( set, elem.firstElementChild );
        } else {
            set = null;
        }
        return set;
    },

    setClipRect: function( elem, x, y, width, height, parent ) {
        var clipPath = jSignage._createElement( 'clipPath' );
        var id = jSignage.guuid();
        clipPath.id = id;
        clipPath.appendChild( jSignage._createElement( 'rect', { x: x, y: y, width: width, height: height } ) );
        ( parent || elem ).appendChild( clipPath );
        elem.setAttribute( 'clip-path', 'url(#'+id+')' );
    },

    _mkshape: function( shape, corners, rx, ry, x, y, width, height ) {
        var d = null;
        if ( shape=='round' ) {
            if ( corners && jSignage.isArray( corners ) ) {
                d = new jSignage.pathData();
                var i = 0;
                if ( corners[i]=='topLeft' ) { d.moveTo( x, ry+y ); d.arcTo( rx, ry, 0, 0, 1, x+rx, y ); ++i; } else d.moveTo( x, y );
                if ( corners[i]=='topRight' ) { d.lineTo( x+width-rx, y ); d.arcTo( rx, ry, 0, 0, 1, x+width, y+ry ); ++i; } else d.lineTo( x+width, y );
                if ( corners[i]=='bottomRight' ) { d.lineTo( x+width, y+height-ry ); d.arcTo( rx, ry, 0, 0, 1, x+width-rx, y+height ); ++i; } else d.lineTo( x+width, y+height );
                if ( corners[i]=='bottomLeft' ) { d.lineTo( x+rx, y+height ); d.arcTo( rx, ry, 0, 0, 1, x, y+height-ry ); } else d.lineTo( x, y+height );
                d.close();
            } else if ( corners=='left' ) {            
                var min = Math.min( width, height );
                d = new jSignage.pathData();
                d.moveTo( x+width-rx, y );
                d.arcTo( rx, ry, 0, 0, 1, x+width, y+ry );
                d.lineTo( x+width, y+height-ry );
                d.arcTo( rx, ry, 0, 0, 1, x+width-rx, y+height );
                d.lineTo( x+rx, y+height );
                d.quadTo( x, y+height, x-rx, y+height-ry );
                d.lineTo( x-min/2+rx, y+height/2+ry );
                d.quadTo( x-min/2, y+height/2, x-min/2+rx, y+height/2-ry );
                d.lineTo( x-rx, y+ry );
                d.quadTo( x, y, x+rx, y );
                d.close();
            } else if ( corners=='right' ) {
                var min = Math.min( width, height );
                d = new jSignage.pathData();
                d.moveTo( x, y+ry );
                d.arcTo( rx, ry, 0, 0, 1, x+rx, y );
                d.lineTo( x+width-rx, y );
                d.quadTo( x+width, y, x+width+rx, y+ry );
                d.lineTo( x+width+min/2-rx, y+height/2-ry );
                d.quadTo( x+width+min/2, y+height/2, x+width+min/2-rx, y+height/2+ry );
                d.lineTo( x+width+rx, y+height-ry );
                d.quadTo( x+width, y+height, x+width-rx, y+height );
                d.lineTo( x+rx, y+height );
                d.arcTo( rx, ry, 0, 0, 1, x, y+height-ry );
                d.close();
            } else {
                return jSignage._createElement( 'rect', { x: x, y: y, width: width, height: height, rx: rx, ry: ry });
            }
        } else if ( shape=='snip' ) {
            d = new jSignage.pathData();
            var i = 0;
            if ( !corners || corners[i]=='topLeft' ) { d.moveTo( x, y+ry ); d.lineTo( x+rx, y ); ++i; } else d.moveTo( x, y );
            if ( !corners || corners[i]=='topRight' ) { d.lineTo( x+width-rx, y ); d.lineTo( x+width, y+ry ); ++i; } else d.lineTo( x+width, y );
            if ( !corners || corners[i]=='bottomRight' ) { d.lineTo( x+width, y+height-ry ); d.lineTo( x+width-rx, y+height ); ++i; } else d.lineTo( x+width, y+height );
            if ( !corners || corners[i]=='bottomLeft' ) { d.lineTo( x+rx, y+height ); d.lineTo( x, y+height-ry ); } else d.lineTo( x, y+height );
            d.close();
        } else if ( corners=='left' ) {
            var min = Math.min( width, height );
            d = new jSignage.pathData();
            d.moveTo( x+width, y );
            d.lineTo( x+width, y+height, x, y+height, x-min/2, y+height/2, x, y );
            d.close();
        } else if ( corners=='right' ) {
            var min = Math.min( width, height );
            d = new jSignage.pathData();
            d.moveTo( x, y );
            d.lineTo( x+width, y, x+width+min/2, y+height/2, x+width, y+height, x, y+height );
            d.close();
        } else {
            return jSignage._createElement( 'rect', { x: x, y: y, width: width, height: height });
        }
        return jSignage._createElement( 'path', { d: d.toString() } );
    },

    relAbs: function( x, size, fallback ) {
        if ( x===undefined || x===null || x===false )
            return fallback || 0;
        if ( typeof(x) == 'number' )
            return x;
        if ( x.charAt(x.length-1)=='%' )
            x = parseFloat(x) * size / 100;
        else
            x = parseFloat(x);
        if ( isNaN(x) )
            x = fallback || 0;
        return x;
    },

    addFrame: function( g, attr, postLayoutCallback, media ) {
        var deco = attr && attr.frame, shades;
        if ( !deco ) {
            if ( media )
                g.appendChild( media );
            if ( postLayoutCallback )
                jSignage.postLayoutCallback( g, postLayoutCallback );
            return;
        }

        var g2 = null;

        if ( media ) {
            g.appendChild( media );
        } else {
            g2 = jSignage._createElement( 'g' );
            g2.id = jSignage.guuid();
            g.appendChild( g2 );
            g.setAttributeNS( jSignage.spxNS, 'g2-id', g2.id );
        }

        jSignage.postLayoutCallback( g, function( width, height, x, y, bbw, bbh, parent, frame_box ) {
            build_frame( deco, g, g2, width, height, media, postLayoutCallback, x, y, bbw, bbh, parent, frame_box );
        });
    },

    _customLayer: function( type, attr, attr2, postLayoutCallback ) {
        var g = jSignage._createElement( 'g' );
        g.setAttributeNS( jSignage.spxNS, 'layer-type', type );
        jSignage.setViewportAttr( g, attr );
        jSignage.addSetForTiming( g, attr2 || attr, true );
        jSignage.addFrame( g, attr, postLayoutCallback );
        return g;
    },

    customLayer: function( type, attr, attr2, postLayoutCallback ) {
        return jSignage( jSignage._customLayer( type, attr, attr2, postLayoutCallback ) );
    },

    subclass: function( parent, init, methods ) { // Creates a constructor with a custom prototype and inheritance chain
        var ctor;

        if ( !methods ) {
            methods = init;
            init = parent;
            parent = null;
            ctor = function( name, args ) {
                if ( name ) {
                    var obj = this;
                    jSignage.fn.init.call( this, jSignage._customLayer( name, args, null, function( width, height, x, y, bbw, bbh, parent ) {
                        if ( obj.postLayout )
                            obj.postLayout( this, width, height, x, y, bbw, bbh, parent );
                    }), null, jSignage.rootjSignage );
                    init.call( this, args );
                }
            };
        } else {
            ctor = function( name, args ) {
                parent.call( this, name, args );
                if ( name )
                    init.call( this, args );
            };
        }
        ctor.prototype = parent ? new parent() : jSignage();
        jSignage.extend( ctor.prototype, methods );
        return ctor;
    },

    findChildById: function( root, id ) {
        var res = null;
        jSignage.eachElement( root, function() {
            if ( this.id==id ) {
                res = this; 
                return false;
            }
        });
        return res;
    },

    findMediaChild: function( root ) {
        var res = null;
        jSignage.eachElement( root, function() {
            var name = this.localName;
            if ( name=='video' || name=='audio' || name=='animation' ) {
                res = this; 
                return false;
            }
        });
        return res;
    },

    isLayer: function( elem ) {
        var name = elem.localName;
        if (name == 'video' || name == 'audio' || name == 'animation' || name == 'image' || name == 'textArea' || name == 'svg' || name == 'foreignObject' || name == 'iframe')
            return true;
        if ( name=='g' && elem.getAttributeNS( jSignage.spxNS, 'layer-type' ) )
            return true;
        return false;
    },

    getRealMediaTarget: function( root ) {
        var target = root;
        while ( target!==null ) {
            var effectTargetID=target.getAttributeNS( jSignage.spxNS, "effect-target-id" );
            if ( !effectTargetID )
                break;
            target = jSignage.findChildById( target, effectTargetID );
        }
        return target;
    },

    getTimingElement: function( root ) {
        if ( root==document.documentElement )
            return null;
        if ( jSignage.timeline ) {
            if ( root.localName=='g' && !root.getAttributeNS( jSignage.spxNS, 'layer-type' ) )
                return null;
            if ( !root.id )
                root.id = jSignage.guuid();
            if ( !jSignage.timedLayers[root.id] )
                jSignage.timedLayers[root.id] = new TimedLayer( root );
            return root;
        }
        var name=root.localName;
        if ( name=='video' || name=='animation' || name=='audio' ) {
            return root;
        } else {
            if ( name=='g' ) {
                var type = root.getAttributeNS( jSignage.spxNS, 'layer-type' );
                if ( type=='media' ) {
                    child = jSignage.findMediaChild( jSignage.getG2( root ) );
                    if ( child )
                        return child;
                } else if ( !type ) {
                    return null;
                }
            }
            var child = root.firstElementChild;
            if ( child && ( child.localName=='set' || child.localName=='animate' ) )
                return child;
        }
        return jSignage.addSetForTiming( root, null, true );
    },

    setLoopingInfo: function( args, ctx ) {
        if ( !('dur' in args) || args.dur=='media' || args.dur=='auto' ) {
            ctx.looping = true;
            ctx.loopCount = 1;
            ctx.dur='indefinite';
            if ( 'repeatDur' in args ) {
                ctx.dur=args.repeatDur;
                ctx.loopCount = -1;
            } else if ( 'repeatCount' in args ) {
                if ( args.repeatCount=='indefinite' ) {
                    ctx.loopCount = -1;
                } else {
                    var repeatCount=parseFloat(args.repeatCount);
                    if ( !isNaN(repeatCount) && repeatCount>=1 )
                        ctx.loopCount=Math.floor(repeatCount);
                }
            }
            ctx.reloadLoopCount = ctx.loopCount;
        } else {
            ctx.looping = false;
            ctx.dur = args.dur;
        }
        jSignage.copyProps( args, ctx, [ 'begin', 'end', 'min', 'max' ] );
    },

    copyProps: function( src, dst, lst ) {
        if ( lst.length ) {
            for ( var i=0; i<lst.length; i++ ) {
                var p = lst[i];
                if ( p in src )
                    dst[p]=src[p];
            }
        } else {
            for ( var p in src )
                if ( p in lst )
                    dst[ lst[p] ] = src[p];
        }
    },

    _isTextAreaLayer: function( layerType ) {
        if ( !layerType )
            return false;
        var l = layerType.length;
        return layerType=='textArea' || ( l>8 && layerType.substring( l-8 )=='TextArea' );
    },

    getBBox: function( elem, futureParent ) {
        var width = NaN, height = NaN, r = null;
        var w = elem.getAttributeNS( jSignage.spxNS, 'width' );
        if ( w!=null && w!='' && w!='auto' && w.charAt(w.length-1)!='%' )
            width = parseFloat( w );
        var h = elem.getAttributeNS( jSignage.spxNS, 'height' );
        if ( h!=null && h!='' && h!='auto' && h.charAt(h.length-1)!='%' )
            height = parseFloat( h );
        if ( !isNaN(width) && width >= 0 && !isNaN(height) && height>=0 ) {
            r = document.documentElement.createSVGRect();
            r.width = width;
            r.height = height;
            r.auto = false;
            return r;
        }
        if ( futureParent )
            futureParent.appendChild( elem );
        if ( !jSignage.features.textArea ) {
            var media = jSignage.getRealMediaTarget( elem );
            if ( media.localName=='g' ) {
                var type = media.getAttributeNS( jSignage.spxNS, 'layer-type' );
                if ( jSignage._isTextAreaLayer(type) ) {
                    for ( var textArea=media.firstElementChild; textArea; textArea=textArea.nextElementSibling )
                        if ( textArea.localName=='textArea' )
                            break;
                    if ( textArea ) {
                        r = document.documentElement.createSVGRect();
                        if ( isNaN(width) || width < 0 )
                            r.width = jSignage.getTextAreaWidth( textArea, futureParent );
                        else
                            r.height = jSignage.getTextAreaHeight( textArea, futureParent );
                    }
                }
            }
        }
        if ( !r )
            r=elem.getBBox();
        if ( r === null )
            r = document.documentElement.createSVGRect();
        r.auto = true;
        if ( !isNaN(width) && width >= 0 )
            r.width = width;
        if ( !isNaN(height) && height>=0 )
            r.height = height;
        if ( futureParent )
            futureParent.removeChild( elem );
        return r;
    },

    isInRenderingTree: function( elem ) {
        var top = document.documentElement;
        while ( elem && elem!=top )
            elem = elem.parentNode;
        return elem==top;
    },

    _applyTransform: function( subtree, elem, x1, y1, x2, y2 ) {
        var xw = 0, yw = 0;
        var viewBox = elem.getAttributeNS( jSignage.spxNS, 'viewBox' );

        if ( viewBox==null || viewBox=='' || viewBox=='none' ) {
            viewBox = null;
        } else {
            viewBox = viewBox.split( reSplitList );
            if ( viewBox.length!=4 )
                viewBox = null;
            for ( var i=0; i<4; i++ ) {
                viewBox[i] = parseFloat(viewBox[i]);
                if ( isNaN(viewBox[i]) || ( i>=2 && viewBox[i]==0 ) ) {
                    viewBox = null;
                    break;
                }
            }       
        }

        var transform = elem.getAttributeNS( jSignage.spxNS, 'transform' );
        if ( transform==null || transform=='' || transform=='none' )
            transform = null;
        else
            transform = transform.split( reSplitList );

        var tbase = x1 || y1 ? 'translate('+x1+','+y1+')' : '';
        subtree.setAttribute( 'transform', tbase );

        if ( transform || viewBox ) {
            var xx = 1, yy = 1, xy = 0, yx = 0, x0 = 0, y0 = 0, t;
            if ( transform ) for ( var i=0; i<transform.length; i++ ) {
                if ( transform[i]=='rotateLeft' ) {
                    t = xx; xx = xy; xy = -t;
                    t = yy; yy = -yx; yx = t; 
                } else if ( transform[i]=='rotateRight' ) {
                    t = xx; xx = -xy; xy = t;
                    t = yy; yy = yx; yx = -t; 
                } else if ( transform[i]=='flipHorizontal' ) {
                    xx = -xx; yx = -yx;
                } else if ( transform[i]=='flipVertical' ) {
                    yy = -yy; xy = -xy;
                }
            }
            xw = Math.abs(xx)*(x2-x1) + Math.abs(xy)*(y2-y1);
            yw = Math.abs(yx)*(x2-x1) + Math.abs(yy)*(y2-y1);
            if ( viewBox ) {
                var sx = xw / viewBox[2];
                var sy = yw / viewBox[3];
                xx *= sx; yx *= sy; xy *= sx; yy *= sy;
                xw = viewBox[2];
                yw = viewBox[3];
                x0 = viewBox[0];
                y0 = viewBox[1];
            }
            if ( subtree!=elem ) tbase = '';
            if ( tbase!='' ) tbase += ' ';
            if ( transform )
                tbase += 'matrix('+ xx +','+ xy +',' + yx +','+ yy +','+ (x2-x1)/2 +','+ (y2-y1)/2 +') translate('+ (-x0-xw/2) +','+ (-y0-yw/2) +')';
            else
                tbase += 'matrix('+ xx +','+ xy +',' + yx +','+ yy +','+ (-x0) +','+ (-y0) +')';
            elem.setAttribute( 'transform', tbase );
        } else {
            if ( subtree!=elem )
                elem.setAttribute( 'transform', '' );
            xw = x2 - x1;
            yw = y2 - y1;
        }
        return [ xw, yw ];
    },

    _calcLayout: function( subtree, bbw, bbh, skip, parent ) {
        var elem=jSignage.getRealMediaTarget(subtree);
        var x1, y1, x2, y2, xw, yw;
        if ( !skip ) {
            var left = elem.getAttributeNS( jSignage.spxNS, 'left' );
            if ( left==null || left=='' || left=='auto' )
                left=null;
            else if ( left.charAt(left.length-1)=='%' )
                left = parseFloat(left) * bbw / 100;
            else
                left = parseFloat(left);
            var top = elem.getAttributeNS( jSignage.spxNS, 'top' );
            if ( top==null || top=='' || top=='auto' )
                top=null;
            else if ( top.charAt(top.length-1)=='%' )
                top = parseFloat(top) * bbh / 100;
            else
                top = parseFloat(top);
            var right = elem.getAttributeNS( jSignage.spxNS, 'right' );
            if ( right==null || right=='' || right=='auto' )
                right=null;
            else if ( right.charAt(right.length-1)=='%' )
                right = parseFloat(right) * bbw / 100;
            else
                right = parseFloat(right);
            var bottom = elem.getAttributeNS( jSignage.spxNS, 'bottom' );
            if ( bottom==null || bottom=='' || bottom=='auto' )
                bottom=null;
            else if ( bottom.charAt(bottom.length-1)=='%' )
                bottom = parseFloat(bottom) * bbh / 100;
            else
                bottom = parseFloat(bottom);
            var width = elem.getAttributeNS( jSignage.spxNS, 'width' );
            if ( width==null || width=='' || width=='auto' )
                width=null;
            else if ( width.charAt(width.length-1)=='%' )
                width = parseFloat(width) * bbw / 100;
            else
                width = parseFloat(width);
            var height = elem.getAttributeNS( jSignage.spxNS, 'height' );
            if ( height==null || height=='' || height=='auto' )
                height=null;
            else if ( height.charAt(height.length-1)=='%' )
                height = parseFloat(height) * bbh / 100;
            else
                height = parseFloat(height);

	        if ( left==null ) {
		        if ( width==null ) {
			        if ( right==null ) {
				        x1 = 0;
				        x2 = bbw;
			        } else {			        
				        x1 = 0;
				        x2 = bbw - right;
			        }
		        } else {
			        if ( right==null ) {
				        x1 = 0;
				        x2 = width;
			        } else {
				        x1 = bbw - right - width;
				        x2 = bbw - right;
			        }
		        }
	        } else {
		        if ( width==null ) {
			        if ( right==null ) {
				        x1 = left;
				        x2 = bbw;
			        } else {
				        x1 = left;
				        x2 = bbw - right;
			        }
		        } else {
			        x1 = left;
			        x2 = left + width;
		        }
	        }

	        if ( top==null ) {
		        if ( height==null ) {
			        if ( bottom==null ) {
				        y1 = 0;
				        y2 = bbh;
			        } else {
				        y1 = 0;
				        y2 = bbh - bottom;
			        }
		        } else {
			        if ( bottom==null ) {
				        y1 = 0;
				        y2 = height;
			        } else {
				        y1 = bbh - bottom - height;
				        y2 = bbh - bottom;
			        }
		        }
	        } else {
		        if ( height==null ) {
			        if ( bottom==null ) {
				        y1 = top;
				        y2 = bbh;
			        } else {
				        y1 = top;
				        y2 = bbh - bottom;
			        }
		        } else {
			        y1 = top;
			        y2 = top + height;
		        }
	        }
	        if ( x1 > x2 ) { var t = x1; x1 = x2; x2 = t; }
	        if ( y1 > y2 ) { var t = y1; y1 = y2; y2 = t; }
	        
	        var xwyw = jSignage._applyTransform( subtree, elem, x1, y1, x2, y2 );
	        xw = xwyw[0];
	        yw = xwyw[1];
        } else {
            x1 = 0;
            xw = x2 = bbw;
            y1 = 0;
            yw = y2 = bbh;
        }
	    if ( !skip || elem.localName!='textArea' ) {
	        elem.setAttributeNS( null, 'width', xw );
	        elem.setAttributeNS( null, 'height', yw );
	    }
	    var frame_box = { x1: 0, y1: 0, x2: xw, y2: yw };
	    if ( skip!==2 ) {
            var postLayoutCallback = elem.getAttributeNS( jSignage.spxNS, "postLayoutCallback" );
            if ( postLayoutCallback ) {
                window.__jSignage__global.postLayoutCallback[postLayoutCallback].call( elem, xw, yw, x1, y1, bbw, bbh, parent, frame_box );
                delete window.__jSignage__global.postLayoutCallback[postLayoutCallback];
                elem.setAttributeNS( jSignage.spxNS, "postLayoutCallback", '' );
            }
            elem.setAttributeNS( jSignage.spxNS, 'fx1', frame_box.x1 );
            elem.setAttributeNS( jSignage.spxNS, 'fy1', frame_box.y1 );
            elem.setAttributeNS( jSignage.spxNS, 'fx2', frame_box.x2 );
            elem.setAttributeNS( jSignage.spxNS, 'fy2', frame_box.y2 );
	    } else {
	        var fx1 = parseFloat( elem.getAttributeNS( jSignage.spxNS, 'fx1' ) );
	        if ( isFinite( fx1 ) )
                frame_box.x1 = fx1;
	        var fy1 = parseFloat( elem.getAttributeNS( jSignage.spxNS, 'fy1' ) );
	        if ( isFinite( fy1 ) )
                frame_box.y1 = fy1;
	        var fx2 = parseFloat( elem.getAttributeNS( jSignage.spxNS, 'fx2' ) );
	        if ( isFinite( fx2 ) )
                frame_box.x2 = fx2;
	        var fy2 = parseFloat( elem.getAttributeNS( jSignage.spxNS, 'fy2' ) );
	        if ( isFinite( fy2 ) )
                frame_box.y2 = fy2;
	    }
	    if ( elem!=subtree ) {
	        subtree.setAttributeNS( null, 'width', x2-x1 );
	        subtree.setAttributeNS( null, 'height', y2-y1 );
	        // Call post layout callback for effects and transitions
            var target = subtree;
            var timeBase = jSignage.getTimingElement( elem ).id;
            while ( target!==null ) {
                var effectTargetID=target.getAttributeNS( jSignage.spxNS, "effect-target-id" );
                if ( !effectTargetID )
                    break;
                var postLayoutCallback = target.getAttributeNS( jSignage.spxNS, "postLayoutCallback" );
                var inner = jSignage.findChildById( target, effectTargetID );
                if ( postLayoutCallback ) {
                    window.__jSignage__global.postLayoutCallback[postLayoutCallback].call( target, timeBase, inner, x2-x1, y2-y1, x1, y1, bbw, bbh, frame_box.x1, frame_box.y1, frame_box.x2, frame_box.y2 );
                    delete window.__jSignage__global.postLayoutCallback[postLayoutCallback];
                    target.setAttributeNS( jSignage.spxNS, "postLayoutCallback", '' );
                }
                target = inner;
            }
	    }
    },

    postLayoutCallback: function( elem, callback ) {
        var cbid = jSignage.guuid();
        window.__jSignage__global.postLayoutCallback[cbid] = callback;
        var chain = elem.getAttributeNS( jSignage.spxNS, 'postLayoutCallback' );
        elem.setAttributeNS( jSignage.spxNS, 'postLayoutCallback', cbid );
        return chain ? window.__jSignage__global.postLayoutCallback[chain] : null;
    },

    addToLayout: function( parent, child, before ) {
        var bbw=null, bbh=null, ancestor;
        for( ancestor=parent; ancestor!=null; ancestor=ancestor.parentNode ) {
            if ( ancestor==document.documentElement )
                break;
            if ( bbw==null ) {               
                var w = ancestor.getAttributeNS( null, 'width' );
                if ( w!=null && w!='' ) {
                    var h = ancestor.getAttributeNS( null, 'height' );
                    if ( h!=null && h!='' ) {
                        bbw = w;
                        bbh = h;
                    }
                }
            }
        }
        if ( ancestor==document.documentElement ) {
            if ( bbw==null ) {
                var viewBox = jSignage.getDocumentViewbox();
                if ( viewBox!=null ) {
                    bbw = viewBox.width;
                    bbh = viewBox.height;
                }
            }
            if ( bbw!=null )
                jSignage._calcLayout( child, bbw, bbh, 0, parent );
        }
        if ( before )
            parent.insertBefore( child, before );
        else
            parent.appendChild( child );
    },

    scheduleLayer: function( parent, timingElement ) {    
        if ( jSignage.timeline ) {            
            var timed = jSignage.timedLayers[timingElement.id];
            timed.resolve();
            if ( timed.beginOffset!='indefinite' ) {
                var parentTimingElement = jSignage.getTimingElement( parent );
                if ( parentTimingElement ) {
                    var timedParent = jSignage.timedLayers[parentTimingElement.id];
                    timedParent.addSubLayer( timed );
                    if ( timedParent.activeStart!==null ) {
                        dueDate = timedParent.activeStart + timed.beginOffset;
                        return new TimedAction( dueDate, 'beginLayer', timed );
                    }
                } else {
                    return new TimedAction( timed.beginOffset, 'beginLayer', timed );
                }
            }
        } else {
            var begin = timingElement.getAttribute( 'begin' );
            if ( begin!='indefinite' ) {
                var parentTimingElement = jSignage.getTimingElement( parent );
                if ( parentTimingElement )
                    timingElement.setAttribute( 'begin', jSignage.triggerWithOffset( parentTimingElement.id+'.begin', jSignage.durInSeconds( begin ) ) );
            }
        }
        return null;
    },

    scheduleLayerAbsolute: function( timingElement ) {    
        if ( jSignage.timeline ) {            
            var timed = jSignage.timedLayers[timingElement.id];
            timed.resolve();
            if ( timed.beginOffset!='indefinite' )
                return new TimedAction( timed.beginOffset, 'beginLayer', timed );
        }
        return null;
    },

    beginLayerAt: function( timingElement, beginTime ) {
        if ( jSignage.timeline )
            jSignage.timeline.scheduleRelative( null, new TimedAction( beginTime || 0, 'beginLayer', jSignage.timedLayers[timingElement.id] ) );
        else if ( beginTime )
            timingElement.beginElementAt( beginTime );
        else
            timingElement.beginElement();
    },

    endLayerAt: function( timingElement, endTime ) {
        if ( jSignage.timeline )
            jSignage.timedLayers[timingElement.id].endAt( null, endTime || 0 );
        else if ( endTime )
            timingElement.endElementAt( endTime );
        else
            timingElement.endElement();
    },

    setLayerMediaDur: function( timingElement, mediaDur ) {
        if ( jSignage.timeline ) {
            jSignage.timedLayers[timingElement.id].setMediaDur( null, mediaDur );
        } else {
            if ( timingElement.getAttribute( 'dur' )=='media' ) {
                var parent = timingElement.parentNode;
                var before = timingElement.nextElementSibling;
                parent.removeChild( timingElement );
                timingElement.setAttribute( 'dur', mediaDur );
                parent.insertBefore( timingElement, before );
            }
        }
    },

    add: function( parent, child, timingElement, before ) {
        parent = jSignage.getRealMediaTarget(parent);
        if ( !timingElement ) {
            var realChild = jSignage.getRealMediaTarget(child);
            if ( jSignage.isLayer( realChild ) )
                timingElement = jSignage.getTimingElement( realChild );
        }
        if ( timingElement ) {
            var begin = timingElement.getAttribute( 'begin' );
            if ( !begin ) {
                if ( jSignage.isInRenderingTree(parent) && window.__jSignage__global.isReady && !window.__jSignage__global.inReadyList )
                    begin = 'now';
                else
                    begin = '0';
                timingElement.setAttribute( 'begin', begin );
            }
            if ( begin.substring( 0, 3 )=='now' ) {
                var beginTime = 0;
                if ( begin!='now' ) {
                    var offset = jSignage.durInSeconds( begin.substring( 4 ), 0 );
                    if ( begin.charAt(3)=='+' )
                        beginTime = offset;
                    else if ( begin.charAt(3)=='-' )
                        beginTime = -offset;
                }
                timingElement.setAttribute( 'begin', 'indefinite' );
                jSignage.scheduleLayer( parent, timingElement );
                jSignage.addToLayout( jSignage.getG2(parent), child, before );
                jSignage.beginLayerAt( timingElement, beginTime );
            } else {
                var action = jSignage.scheduleLayer( parent, timingElement );
                jSignage.addToLayout( jSignage.getG2(parent), child, before );
                if ( action )
                    jSignage.timeline.schedule( action );
            }
        } else {
            jSignage.getG2(parent).insertBefore( child, before || null );
        }
    },

    addAndKick: function( parent, child, timingElement, beginTime, before ) {
        timingElement.setAttribute( 'begin', 'indefinite' );
        jSignage.scheduleLayer( parent, timingElement );
        jSignage.addToLayout( jSignage.getG2(jSignage.getRealMediaTarget(parent)), child, before );
        jSignage.beginLayerAt( timingElement, beginTime || 0 );
    },

    svgAnimation: function( target, name, attr, endCallback ) {
        var elem, href = null, id = null;
        if ( 'href' in attr ) {
            href = attr.href;
            delete attr.href;
        }
        if ( 'id' in attr ) {
            id = attr.id;
            delete attr.id;
        }
        if ( !jSignage.features.animateColor && name=='animateColor' )
            name = 'animate';
        var trigger = 'begin' in attr ? attr.begin : 'indefinite';
        if ( jSignage.timeline ) {
            attr.begin = 'indefinite';
            elem = jSignage._createElement( name, attr );            
            if ( trigger!='indefinite' )
                jSignage.timeline.scheduleElement( trigger, elem, endCallback );
        } else {
            elem = jSignage._createElement( name, attr );
            if ( endCallback && trigger!='indefinite' )
                elem.addEventListener( 'endEvent', endCallback );
        }
        elem.id = id || jSignage.guuid();
        if ( href )
            elem.setAttributeNS( jSignage.xlinkNS, 'href', href );
        target.appendChild( elem );
        return elem;
    },

    beginAnimation: function( smil, offset, endCallback ) {
        if ( offset ) {
            if ( jSignage.timeline )
                jSignage.timeline.scheduleRelative( null, new TimedAction( offset, 'beginElement', smil ) );
            else
                smil.beginElementAt( offset );
        } else {
            if ( jSignage.features.SVGAnimation )
                smil.beginElement();
            else
                launchSoftAnimation( null, smil );
        }
        if ( endCallback ) {
            if ( jSignage.timeline ) {
                var activeDur = computeActiveDur( smil );
                if ( typeof(activeDur) == 'number' )
                    jSignage.timeline.scheduleRelative( null, new TimedAction( offset+activeDur, 'callback', endCallback ) );
            } else {
                var handler = smil.addEventListener( 'endEvent', function() {
                    smil.removeEventListener( 'endEvent', handler );
                    endCallback();
                }, false );
            }
        }
    },

    removeAnimation: function( smil ) {
        if ( !jSignage.features.SVGAnimation )
            cancelSoftAnimation( smil );
        smil.parentNode.removeChild( smil );
    },

    durInSeconds: function( qdur, def ) {
        if ( qdur===undefined || qdur===null )
            return def || 0;
        var tc = smilTimecount.exec( qdur );
        if ( tc ) {
            var dur = parseFloat( tc[1] );
            if ( tc[2] ) {
                if ( tc[2]=='h' )
                    dur *= 3600;
                else if ( tc[2]=='min' )
                    dur *= 60;
                else if ( tc[2]=='ms' )
                    dur /= 1000;
            }
            return dur;
        }
        var cv = smilClockValueHMS.exec( qdur );
        if ( cv )
            return parseInt(cv[1], 10)*3600 + parseInt(cv[2], 10)*60 + parseFloat(cv[3]);
        var cv = smilClockValueMS.exec( qdur );
        if ( cv )
            return parseInt(cv[1], 10)*60 + parseFloat(cv[2]);
        return def || 0;
    },

    getEffectTrigger: function( subtree, eventName, args ) {
        var media = jSignage.getRealMediaTarget( subtree );
        if ( media==null )
            return 'indefinite';
        var timing = jSignage.getTimingElement( media );
        var trigger = timing.id+"."+eventName;
        return trigger;
    },

    triggerWithOffset: function( trigger, offset ) {
        if ( trigger=='indefinite' )
            return trigger;
        if ( trigger==0 )
            return offset;
        if ( offset < 0 )
            return trigger+offset;
        if ( offset > 0 )
            return trigger+'+'+offset;
        return trigger;
    },

    wrapInNewElement: function( x, postLayoutCallback, name ) {
        var parent=x.parentNode, id;
        var g = document.createElementNS( jSignage.svgNS, name || 'g' );
        var oldid = x.id, id = jSignage.guuid();
        g.id = oldid || jSignage.guuid();
        x.id = id;
        if ( jSignage.timedLayers && oldid && jSignage.timedLayers[oldid] ) {
            jSignage.timedLayers[id] = jSignage.timedLayers[oldid];
            delete jSignage.timedLayers[oldid];
        }
        g.setAttributeNS( jSignage.spxNS, 'effect-target-id', id );
        if ( postLayoutCallback )
            jSignage.postLayoutCallback( g, postLayoutCallback );
        if ( parent ) {
            parent.insertBefore( g, x );
            parent.removeChild( x );
        }
        g.appendChild( x );
        if ( postLayoutCallback && parent && jSignage.isInRenderingTree( parent ) ) {
            var bbox = jSignage.getBBox( x, null );
            if ( bbox && bbox.height>0 && bbox.width>0 )
                jSignage._calcLayout( g, bbox.width, bbox.height, 2, parent );
        }
        return g;
    },

    groupEach: function( subtree, callback ) {
        var layer = jSignage.getRealMediaTarget( subtree );
        if ( layer ) {
            callback.call( layer );
            if ( layer.localName=='g' && layer.getAttributeNS( jSignage.spxNS, 'layer-type' )=='group' ) {
                for ( var child=jSignage.getG2(layer).firstElementChild; child!=null; child=child.nextElementSibling )
                    if ( child.localName!='set' && child.localName!='animate' )
                        groupEach( child, callback );
            }
        }
    },

    setInitialVisibility: function( subtree, always ) {
        if ( always===undefined )
            always=true;
        var layer = jSignage.getRealMediaTarget( subtree );
        if ( layer==null )
            return null;
        var name=layer.localName, t=null;
        if ( name=='audio' || name=='video' || name=='animation' || jSignage.timeline ) {
	        layer.setAttribute( 'initialVisibility', always ? 'always' : 'whenStarted' );
	        t = layer;
	    } else {
	        var tm = null;
            if ( name=='g' ) {
                var type = layer.getAttributeNS( jSignage.spxNS, 'layer-type' );
                if ( type=='media' ) {
                    tm = jSignage.findMediaChild( jSignage.getG2( layer ) );
                    if ( tm )
                        tm.setAttribute( 'initialVisibility', always ? 'always' : 'whenStarted' );
                }
            }
            t = layer.firstElementChild;
            if ( t && ( t.localName=='set' || t.localName=='animate' ) ) {
                if ( layer.getAttribute( 'display' )=='none' ) {
                    if ( always ) {
                        layer.setAttribute( 'display', 'inherit' );
                        if ( t.localName=='set' && t.getAttribute( 'fill' )!='freeze' ) {
                            var n = jSignage._createElement( 'animate', { attributeName: 'display', values: 'inherit;none', keyTimes: '0;1', fill: 'freeze', dur: t.getAttribute('dur'), begin: t.getAttribute('begin') } );
                            layer.insertBefore( n, t );
                            layer.removeChild( t );
                            n.id = t.id;
                            t = n;
                        }
                    }
                } else {
                    if ( !always ) {
                        layer.setAttribute( 'display', 'none' );
                        if ( t.localName=='animate' ) {
                            var n = jSignage._createElement( 'set', { attributeName: 'display', to: 'inherit', dur: t.getAttribute('dur'), begin: t.getAttribute('begin') } );
                            layer.insertBefore( n, t );
                            layer.removeChild( t );
                            n.id = t.id;
                            t = n;
                        } else if ( t.localName=='set' ) {
                            var next=t.nextElementSibling;
                            layer.removeChild( t );
                            t.setAttribute( 'fill', 'freeze' );
                            layer.insertBefore( t, next );
                        }
                    }
                }
            }
            if ( tm )
                t = tm;
	    }
	    return t;
    },

    setFillFreeze: function( subtree, freeze ) {
        if  ( freeze===undefined )
            freeze=true;
        var layer = jSignage.getRealMediaTarget( subtree );
        if ( layer==null )
            return null;
        var name=layer.localName, t=null;
        if ( jSignage.timeline ) {
	        t = jSignage.getTimingElement( layer );
	        t.setAttribute( 'fill', freeze ? 'freeze' : 'remove' );
        } else if ( name=='audio' || name=='video' || name=='animation' ) {
	        layer.setAttribute( 'fill', freeze ? 'freeze' : 'remove' );
	        t = layer;
	    } else {
	        var tm = null;
            if ( name=='g' ) {
                var type = layer.getAttributeNS( jSignage.spxNS, 'layer-type' );
                if ( type=='media' ) {
                    tm = jSignage.findMediaChild( jSignage.getG2( layer ) );
                    if ( tm )
                        tm.setAttribute( 'fill', freeze ? 'freeze' : 'remove' );
                }
            }
            t = layer.firstElementChild;
            if ( t && ( t.localName=='set' || t.localName=='animate' ) ) {
                if ( layer.getAttribute( 'display' )=='none' ) {
                    if ( t.localName=='set' ) {
                        var next=t.nextElementSibling;
                        layer.removeChild( t );
                        t.setAttribute( 'fill', freeze ? 'freeze' : 'remove' );
                        layer.insertBefore( t, next );
                    }
                } else {
                    if ( !freeze && t.localName=='set' ) {
                        var n = jSignage._createElement( 'animate', { attributeName: 'display', values: 'inherit;none', keyTimes: '0;1', fill: 'freeze', dur: t.getAttribute('dur'), begin: t.getAttribute('begin') } );
                        layer.insertBefore( n, t );
                        layer.removeChild( t );
                        n.id = t.id;
                        t = n;
                    } else if ( freeze && t.localName=='animate' ) {
                        var n = jSignage._createElement( 'set', { attributeName: 'display', to: 'inherit', dur: t.getAttribute('dur'), begin: t.getAttribute('begin') } );
                        layer.insertBefore( n, t );
                        layer.removeChild( t );
                        n.id = t.id;
                        t = n;
                    }
                }
            }
            if ( tm )
                t = tm;
	    }
        return t;
    },

    removeAfter: function( layer, timingElement, timeAfterEnd, handler ) {
        jSignage.endEventOnce( timingElement, function() {
            layer.parentNode.removeChild( layer );
            if ( handler )
                handler();
        }, timeAfterEnd || 0 );
    },

    beginEvent: function( timingElement, handler ) {
        if ( jSignage.timeline )
            jSignage.timedLayers[timingElement.id].addEventListener( 'beginEvent', handler );
        else
            timingElement.addEventListener( 'beginEvent', handler, false );
    },

    endEvent: function( timingElement, handler ) {
        if ( jSignage.timeline )
            jSignage.timedLayers[timingElement.id].addEventListener( 'endEvent', handler );
        else
            timingElement.addEventListener( 'endEvent', handler, false );
    },

    endEventOnce: function( timingElement, handler, delay ) {
        if ( jSignage.timeline ) {
            function once() {
                timed.removeEventListener( 'endEvent', once );
                handler();
            }
            var timed = jSignage.timedLayers[timingElement.id];
            timed.addEventListener( 'endEvent', once, delay );
        } else {
            function once() {
                timingElement.removeEventListener( 'endEvent', once );
                if ( delay )
                    jSignage.setTimeout( handler, delay*1000 );
                else
                    handler();                
            }
            timingElement.addEventListener( 'endEvent', once, false );
        }
    },

    repeatCount: function( args ) {
        var repeatCount = 1;
        if ( args && 'repeatCount' in args ) {
            if ( args.repeatCount=='indefinite' ) {
                repeatCount = 'indefinite';
            } else {
                repeatCount = parseInt( args.repeatCount, 10 );
                if ( isNaN(repeatCount) || repeatCount < 1 )
                    repeatCount = 1;
            }
        }
        return repeatCount;
    },

    repeatDur: function( args ) {
        var repeatDur = 0;
        if ( args && 'repeatDur' in args ) {
            if ( args.repeatDur=='indefinite' )
                repeatDur = 'indefinite';
            else
                repeatDur = jSignage.durInSeconds( args.repeatDur, 0 );
        }
        return repeatDur;
    },

    repeatInterval: function( args, max ) {
        var repeatInterval = jSignage.durInSeconds( args && args.repeatInterval, 1 );
        if ( max && repeatInterval < max )
            repeatInterval=max;
        return repeatInterval;
    },

    getDevicePixelSize: function( vertical ) {
        if ( window.__jSignage__global.verticalDevicePixelSize===null ) {
            var svg = document.documentElement;
            var ctm = svg.getDeviceCTM ? svg.getDeviceCTM( true ) : svg.getScreenCTM();
            if ( !ctm ) {
                window.__jSignage__global.verticalDevicePixelSize = 1;
                window.__jSignage__global.horizontalDevicePixelSize = 1;
                return 1;
            }
            if ( ctm.getComponent ) {
                if ( ctm.getComponent(2)==0 )
                    window.__jSignage__global.verticalDevicePixelSize = Math.abs(ctm.getComponent(3));
                else
                    window.__jSignage__global.verticalDevicePixelSize = Math.abs(ctm.getComponent(2));
                if ( ctm.getComponent(1)==0 )
                    window.__jSignage__global.horizontalDevicePixelSize = Math.abs(ctm.getComponent(0));
                else
                    window.__jSignage__global.horizontalDevicePixelSize = Math.abs(ctm.getComponent(1));
            } else {
                if ( ctm.c==0 )
                    window.__jSignage__global.verticalDevicePixelSize = Math.abs(ctm.d);
                else
                    window.__jSignage__global.verticalDevicePixelSize = Math.abs(ctm.c);
                if ( ctm.b==0 )
                    window.__jSignage__global.horizontalDevicePixelSize = Math.abs(ctm.a);
                else
                    window.__jSignage__global.horizontalDevicePixelSize = Math.abs(ctm.b);
            }
            if ( window.__jSignage__global.verticalDevicePixelSize<=0 )
                window.__jSignage__global.verticalDevicePixelSize = 1;
            if ( window.__jSignage__global.horizontalDevicePixelSize<=0 )
                window.__jSignage__global.horizontalDevicePixelSize = 1;
        }
        return vertical ? window.__jSignage__global.verticalDevicePixelSize : window.__jSignage__global.horizontalDevicePixelSize;
    },

    getLocalCoord: function( elem, clientX, clientY ) {
        var click = document.documentElement.createSVGPoint();
        click.x = clientX;
        click.y = clientY;
        try {
            var ictm = elem.getScreenCTM().inverse();
            click = click.matrixTransform( ictm );
        } catch ( e ) {
        }
        return click;
    },

    getG2: function( g ) {
        var id = g.getAttributeNS( jSignage.spxNS, 'g2-id' );
        if ( id )
            return jSignage.findChildById( g, id );
        return g;
    },

    updateCannedById: function( id, layers ) {
        $('#'+id).updateCanned( layers );
    },

    updateCannedByIdOne: function( id, layer ) {
        $('#'+id).updateMe( layer );
    }
});

function getChangeNumber( str ) {
    if ( !str )
        return null;
    var nums = str.split( '.' );
    var r = [];
    for ( var i=0; i<nums.length; i++ ) {
        var n = parseInt( nums[i], 10 );
        if ( !isNaN(n) && n >= 0 )
            r.push( n );
        else
            return null;
    }
    if ( r.length > 0 )
        return r;
    return null;
}

function compareChangeNumber( newNums, oldNums ) {
    if ( !newNums || !newNums.length || !oldNums || !oldNums.length )
        return 1;
    for ( var i=0; i<newNums.length && i<oldNums.length; i++ )
        if ( newNums[i]!=oldNums[i] )
            return i+1;
    if ( i<newNums.length || i<oldNums.length )
        return i+1;
    return 0;
}

jSignage.changeGeometry = function( attachPoint, subtree, args, changeNumber ) {
    var elem = jSignage.getRealMediaTarget( subtree );
    var left = typeof(args.left) == 'number' ? args.left : parseFloat(args.left);
    var top = typeof(args.top) == 'number' ? args.top : parseFloat(args.top);
    var width = typeof(args.width) == 'number' ? args.width : parseFloat(args.width);
    var height = typeof(args.height) == 'number' ? args.height : parseFloat(args.height);    
    elem.setAttributeNS( jSignage.spxNS, 'transform', args.transform || '' );
    if ( elem.localName=='iframe' ) {
        var srcdoc = elem.getAttribute( 'srcdoc' );
        if ( srcdoc ) {
            srcdoc = srcdoc.replace( /width: [0-9.-]*px/, 'width: '+width+'px' );
            srcdoc = srcdoc.replace( /height: [0-9.-]*px/, 'height: '+height+'px' );
            elem.setAttribute( 'srcdoc', srcdoc );
        }
    } else {
        var preserveAspectRatio = jSignage._computePAR( args.mediaAlign, args.mediaFit );
        elem.setAttribute( 'preserveAspectRatio', preserveAspectRatio );
    }
    var xwyw = jSignage._applyTransform( subtree, elem, left, top, left+width, top+height );    
    elem.setAttributeNS( jSignage.spxNS, 'changeNumber', changeNumber || '' );
    elem.setAttribute( 'width', xwyw[0] );
    elem.setAttribute( 'height', xwyw[1] );
    if ( elem.localName=='g' )
        resize_media_frame( args.frame, elem, xwyw[0], xwyw[1], preserveAspectRatio );
};

jSignage.fn.extend({
    g2: function() {
        return jSignage.getG2( jSignage.getRealMediaTarget(this[0]) );
    },

    add: function( elem ) {
        if ( this.length==0 || !elem )
            return;
        var me=this[0];
        jSignage.each( elem, function() {
            if ( this.jsignage )
                jSignage.each( this, function() {
                    jSignage.add( me, this );
                } );
            else
                jSignage.add( me, this );
        });
        if ( elem.sticky )
            this.setSticky( elem.sticky );
        return this;
    },

    setSticky: function ( attr ) {
        if ( ++window.__jSignage__global.sticky_counter == 10 ) {
            // Avoid memory leaks by doing some cleanup from time to time
            for ( var id in window.__jSignage__global.stickyCannedLayer ) {
                if ( !document.getElementById( id ) )
                    delete window.__jSignage__global.stickyCannedLayer[id];
            }
            window.__jSignage__global.sticky_counter = 0;
        }
        for ( var i = 0; i<this.length; i++ ) {
            var id = this[i].id;
            if ( id ) {
                if ( !(id in window.__jSignage__global.stickyCannedLayer) )
                    window.__jSignage__global.stickyCannedLayer[id] = {};
                for ( var x in attr )
                    window.__jSignage__global.stickyCannedLayer[id][x] = attr[x];
            }
        }
    },

    updateCanned: function( layers ) {
        if ( !this[0] || this[0].localName!='g' )
            return this;
        if ( !layers ) layers = [];
        var sticky = window.__jSignage__global.stickyCannedLayer[ this[0].id ];
        var text_modifier = sticky && sticky.text_modifier, args_modifier = sticky && sticky.args_modifier, jsonTransform = sticky && sticky.jsonTransform;
        var real = jSignage.getRealMediaTarget( this[0] );
        var attachPoint = jSignage.getG2( real ), head, newIds={};

        // Check who's part of the new layer list
        for ( var i=0; i<layers.length; i++ ) {
            var args = layers[i] && layers[i].args;
            if ( args ) {
                var id = args.id;
                if ( id )
                    newIds[id] = i;
            }
        }

        var head = attachPoint.firstElementChild;
        while ( head && ( head.localName=='set' || head.localName=='animate' ) )
            head = head.nextElementSibling;

        // Weed out any existing layer that is not part the new layer list and reorder them
        for ( var x=head; x; x=nextX ) {
            var nextX = x.nextElementSibling, id=x.id;
            if ( !id || !(id in newIds) ) {
                attachPoint.removeChild( x );
                if ( x==head ) {
                    head = attachPoint.firstElementChild;
                    while ( head && ( head.localName=='set' || head.localName=='animate' ) )
                        head = head.nextElementSibling;
                }
            } else {
                for ( var prev=x; prev!=head; prev=pp ) {
                    var pp = prev.previousElementSibling;
                    prevNum = newIds[pp.id];
                    if ( prevNum < newIds[id] )
                        break;
                }
                if ( prev!=x ) {
                    attachPoint.insertBefore( x, prev );
                    if ( prev==head )
                        head = x;
                }
            }
        }

        // Add new layers, update existing ones
        x = head;
        for ( i=0; i<layers.length; i++ ) if ( layers[i] ) {
            var layer = layers[i], args = layer.args, append = true;
            var layerId = args && args.id;
            if ( !args || !layerId )
                continue;
            if ( x && x.id==layerId ) {
                nextX = x.nextElementSibling;
                var oldChangeNumber = getChangeNumber( jSignage.getRealMediaTarget(x).getAttributeNS( jSignage.spxNS, 'changeNumber' ) );
                var newChangeNumber = getChangeNumber( layer.changeNumber );
                var newer = compareChangeNumber( newChangeNumber, oldChangeNumber );
                if ( newer==1 ) {
                    attachPoint.removeChild( x );
                } else if ( newer>=2 ) {
                    if ( layer.ctor=='media' || layer.ctor=='image' || layer.ctor=='video' || layer.ctor=='animation' || layer.ctor=='iframe' ) {
                        if ( jsonTransform )
                            jsonTransform( layer );
                        jSignage.changeGeometry( attachPoint, x, args, layer.changeNumber );
                        append = false;
                    } else {
                        attachPoint.removeChild( x );
                    }
                } else {
                    append = false;
                }
                x = nextX;
            }
            if ( append ) {
                if ( !args.begin )
                    args.begin = '0s';
                if ( jsonTransform )
                    jsonTransform( layer );
                var jl = jSignage.uncan( layer, text_modifier, args_modifier );
                if ( jl && jl.jsignage && jl[0] )
                    jSignage.add( attachPoint, jl[0], null, x );
            }
        }
        return this;
    },

    updateMe: function( layer ) {
        if ( !this[0] || !layer || !layer.args )
            return this;
        var me = this[0];
        var attachPoint = me.parentNode;
        if ( !attachPoint )
            return this;
        var sibling = me.nextElementSibling;
        var sticky = window.__jSignage__global.stickyCannedLayer[ attachPoint.id ];
        var text_modifier = sticky && sticky.text_modifier, args_modifier = sticky && sticky.args_modifier, jsonTransform = sticky && sticky.jsonTransform;
        attachPoint.removeChild( me );
        if ( !layer.args.begin )
            layer.args.begin = '0s';
        if ( jsonTransform )
            jsonTransform( layer );
        var jl = jSignage.uncan( layer, text_modifier, args_modifier );
        if ( jl && jl.jsignage && jl[0] )
            jSignage.add( attachPoint, jl[0], null, sibling );
        return this;
    },

    addTo: function( target ) {
        if ( target.localName===undefined )
            target=jSignage(target);
        if ( target.jsignage ) {
            if ( target.length==0 )
                return;
            if ( this.sticky )
                target.setSticky( this.sticky );
            target=target[0];
        }
        jSignage.each( this, function() {
            jSignage.add( target, this );
        });
        return this;
    },

    setInitialVisibility: function( always ) {
        jSignage.each( this, function() {
            jSignage.setInitialVisibility( this, always );
        });
        return this;
    },

    setFillFreeze: function( freeze ) {
        jSignage.each( this, function() {
            jSignage.setFillFreeze( this, freeze );
        });
        return this;
    },

    removeAfter: function( timeAfterEnd, handler ) {
        timeAfterEnd = jSignage.durInSeconds( timeAfterEnd, 0 );
        jSignage.each( this, function() {
            jSignage.removeAfter( this, jSignage.getTimingElement( jSignage.getRealMediaTarget( this ) ), timeAfterEnd, handler );
        });
        return this;
    },

    begin: function( beginTime ) {
        jSignage.each( this, function() {
            jSignage.beginLayerAt( jSignage.getTimingElement( jSignage.getRealMediaTarget(this) ), beginTime || 0 );
        });
        return this;
    },

    end: function( endTime ) {
        jSignage.each( this, function() {
            jSignage.endLayerAt( jSignage.getTimingElement( jSignage.getRealMediaTarget(this) ), endTime || 0 );
        });
        return this;
    },

    endsWith: function( peer, offset ) {
        if ( !peer[0] )
            return this;
        var end = jSignage.triggerWithOffset( jSignage.getTimingElement( jSignage.getRealMediaTarget(peer[0]) ).id+'.endEvent', jSignage.durInSeconds( offset, 0 ) );
        jSignage.each( this, function() {
            jSignage.getTimingElement( jSignage.getRealMediaTarget(this) ).setAttribute( 'end', end );
        });
        return this;
    },

    setVisible: function( on ) {
        if ( on && !this.isOn )
            this.show();
        else if ( !on && this.isOn )
            this.hide();
        return this;
    },

    show: function() {
        this.isOn = true;
        if ( this.outEffectInProgressUntil && jSignage.getCurrentTime() < this.outEffectInProgressUntil )
            this.begin( this.outEffectInProgressUntil-jSignage.getCurrentTime() );
        else
            this.begin();
        return this;
    },

    hide: function() {
        this.isOn = false;
        this.end( this.longestOutEffect || 0 );
        if ( this.longestOutEffect )
            this.outEffectInProgressUntil = jSignage.getCurrentTime() + this.longestOutEffect;
        return this;
    },

    pause: function() {
        jSignage.each( this, function() {
            jSignage.groupEach( this, function() {
                jSignage.getTimingElement( this ).pauseElement();
            });
        });
        return this;
    },

    resume: function() {
        jSignage.each( this, function() {
            jSignage.groupEach( this, function() {
                jSignage.getTimingElement( this ).resumeElement();
            });
        });
        return this;
    },

    effectIn: function( callback ) {
        var wrapper=this;
        this.each( function(i) {
            wrapper[i] = jSignage.wrapInNewElement( this, function( timeBase, inner, width, height, x, y, bbw, bbh, fx1, fy1, fx2, fy2 ) {
                callback.call( this, timeBase+'.begin', inner, width, height, x, y, bbw, bbh, fx1, fy1, fx2, fy2 );
            } );
        });
        return this;
    },

    effectOut: function( dur, callback ) {
        if ( !this.longestOutEffect || this.longestOutEffect < dur )
            this.longestOutEffect = dur;
        var wrapper=this;
        this.each( function(i) {
            wrapper[i] = jSignage.wrapInNewElement( this, function( timeBase, inner, width, height, x, y, bbw, bbh, fx1, fy1, fx2, fy2 ) {
                callback.call( this, jSignage.triggerWithOffset( timeBase+'.end', -dur ), inner, width, height, x, y, bbw, bbh, fx1, fy1, fx2, fy2 );
            } );
        });
        return this;
    }

});

// Basic layer types

var extensionToType = {
    jpeg: 0, jpg: 0, png: 0,
    gif: 1, avi: 1, divx: 1, m4v: 1, mov: 1, qt: 1, mp4: 1, wmv: 1, mkv: 1, mpeg: 1, mpg: 1, mpe: 1, mp2t: 1, ts: 1, mpegts: 1, mpegps: 1, m2v: 1, mp2: 1, m1v: 1, mpv2: 1, m2p: 1, webm: 1, asf: 1, asr: 1, asx: 1, wsx: 1, wvx: 1, mjpg: 1, mjpeg: 1, '264': 1, '265': 1, '3gp': 1, '3gpp': 1, '3g2': 1, vob: 1, h264: 1, h265: 1, m4ves: 1,
    mp3: 2, mpa: 2, wav: 2, aac: 2, m4a: 2, m4b: 2, m4c: 2, wma: 2, wax: 1, ac3: 2, mka: 2,
    svg: 3, smil: 3,
    htm: 4, html: 4
};

var textAreaProps = { lineIncrement: 'line-increment', textAlign: 'text-align', displayAlign: 'display-align', fontFamily: 'font-family', fontSize: 'font-size', fontStyle: 'font-style', fontWeight: 'font-weight', fontVariant: 'font-variant', fill: 'fill', direction: 'direction', unicodeBidi: 'unicode-bidi', pointerEvents: 'pointer-events', focusable: 'focusable', navNext: 'nav-next', navPrev: 'nav-prev', focusHighlight: 'focusHighlight', editable: 'editable' };
var tspanProps = { lineIncrement: 'line-increment', fontFamily: 'font-family', fontSize: 'font-size', fontStyle: 'font-style', fontWeight: 'font-weight', fontVariant: 'font-variant', fill: 'fill', direction: 'direction', unicodeBidi: 'unicode-bidi' };
var shapeProps = { fill: 'fill', fillRule: 'fill-rule', fillOpacity: 'fill-opacity', stroke: 'stroke', strokeWidth: 'stroke-width', strokeLineCap: 'stroke-linecap', strokeLineJoin: 'stroke-linejoin', strokeMiterLimit: 'stroke-miterlimit', strokeDashArray: 'stroke-dasharray', strokeDashOffset: 'stroke-dashoffset', strokeOpacity: 'stroke-opacity', pointerEvents: 'pointer-events', focusable: 'focusable', navNext: 'nav-next', navPrev: 'nav-prev', focusHighlight: 'focusHighlight' };
var animateProps = [ 'calcMode', 'from', 'to', 'by', 'additive', 'accumulate', 'end', 'dur', 'min', 'max', 'repeatCount', 'repeatDur', 'fill', 'id' ];
var timingProps = [ 'end', 'dur', 'min', 'max', 'repeatCount', 'repeatDur', 'fill' ];
var mediaAlignToPAR = { topLeft: 'xMinYMin', topMid: 'xMidYMin', topRight: 'xMaxYMin', midLeft: 'xMinYMid', center: 'xMidYMid', midRight: 'xMaxYMid', bottomLeft: 'xMinYMax', bottomMid: 'xMidYMax', bottomRight: 'xMaxYMax' };
var textProps = [ 'font-family', 'font-size', 'font-style', 'font-weight', 'font-variant', 'fill', 'direction', 'unicode-bidi' ];
var mediaProps = { transformBehavior: 'transformBehavior', pointerEvents: 'pointer-events', focusable: 'focusable', navNext: 'nav-next', navPrev: 'nav-prev', focusHighlight: 'focusHighlight' };

function _mkstyle( attr ) {
    var style='';
    for ( var x in attr ) {
        if ( style!='' ) style += '; ';
        style += x + ': ';
        style += attr[x];
        if ( x=='font-size' )
            style += 'px';
    }
    return style;
}

// Emulates "10.11.7 Text in an area layout rules" from the SVG 1.2 specification

var classOP = "\xA1\xBF\u2E18";
var classCL = "\u3001\u3002\uFE11\uFE12\uFE50\uFE52\uFF0C\uFF0E\uFF61\uFF64";
var classCP = ")]";
var classQU = "\"'\u275B\u275C\u275D\u275E\u2E00\u2E01\u2E06\u2E07\u2E08\u2E0B";
var classGL = "\xA0\u202F\u180E\u034F\u2007\u2011\u0F08\u0F0C\u0F12\u035C\u035D\u035E\u035F\u0360\u0361\u0362";
var classNS = "\u17D6\u203C\u203D\u2047\u2048\u2049\u3005\u301C\u303C\u303B\u309B\u309C\u309D\u309E\u30A0\u30FB\u30FC\u30FD\u30FE\uFE54\uFE55\uFF1A\uFF1B\uFF65\uFF70\uFF9E\uFF9F";
var classEX = "!?\u05C6\u061B\u061E\u061F\u06D4\u07F9\u0F0D\uFF01\uFF1F";
var classSY = "/";
var classIS = ",.:;\u037E\u0589\u060C\u060D\u07F8\u2044\uFE10\uFE13\uFE14";
var classPR = "+\\\xB1\u2116\u2212\u2213";
var classPO = "%\xA2\xB0\u060B\u066A\u2030\u2031\u2032\u2033\u2034\u2035\u2036\u2037\u20A7\u2103\u2109\uFDFC\uFE6A\uFF05\uFFE0";
var classNU = "0123456789\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669\u066B\u066C\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9\u07C0\u07C1\u07C2\u07C3\u07C4\u07C5\u07C6\u07C7\u07C8\u07C9\u0966\u0967\u0968\u0969\u096A\u096B\u096C\u096D\u096E\u096F\u09E6\u09E7\u09E8\u09E9\u09EA\u09EB\u09EC\u09ED\u09EE\u09EF\u0A66\u0A67\u0A68\u0A69\u0A6A\u0A6B\u0A6C\u0A6D\u0A6E\u0A6F\u0AE6\u0AE7\u0AE8\u0AE9\u0AEA\u0AEB\u0AEC\u0AED\u0AEE\u0AEF\u0B66\u0B67\u0B68\u0B69\u0B6A\u0B6B\u0B6C\u0B6D\u0B6E\u0B6F\u0BE6\u0BE7\u0BE8\u0BE9\u0BEA\u0BEB\u0BEC\u0BED\u0BEE\u0BEF\u0C66\u0C67\u0C68\u0C69\u0C6A\u0C6B\u0C6C\u0C6D\u0C6E\u0C6F\u0CE6\u0CE7\u0CE8\u0CE9\u0CEA\u0CEB\u0CEC\u0CED\u0CEE\u0CEF\u0D66\u0D67\u0D68\u0D69\u0D6A\u0D6B\u0D6C\u0D6D\u0D6E\u0D6F\u0E50\u0E51\u0E52\u0E53\u0E54\u0E55\u0E56\u0E57\u0E58\u0E59\u0ED0\u0ED1\u0ED2\u0ED3\u0ED4\u0ED5\u0ED6\u0ED7\u0ED8\u0ED9\u0F20\u0F21\u0F22\u0F23\u0F24\u0F25\u0F26\u0F27\u0F28\u0F29\u1040\u1041\u1042\u1043\u1044\u1045\u1046\u1047\u1048\u1049\u1090\u1091\u1092\u1093\u1094\u1095\u1096\u1097\u1098\u1099\u17E0\u17E1\u17E2\u17E3\u17E4\u17E5\u17E6\u17E7\u17E8\u17E9\u1810\u1811\u1812\u1813\u1814\u1815\u1816\u1817\u1818\u1819\u1946\u1947\u1948\u1949\u194A\u194B\u194C\u194D\u194E\u194F\u19D0\u19D1\u19D2\u19D3\u19D4\u19D5\u19D6\u19D7\u19D8\u19D9\u1A80\u1A81\u1A82\u1A83\u1A84\u1A85\u1A86\u1A87\u1A88\u1A89\u1A90\u1A91\u1A92\u1A93\u1A94\u1A95\u1A96\u1A97\u1A98\u1A99\u1B50\u1B51\u1B52\u1B53\u1B54\u1B55\u1B56\u1B57\u1B58\u1B59\u1BB0\u1BB1\u1BB2\u1BB3\u1BB4\u1BB5\u1BB6\u1BB7\u1BB8\u1BB9\u1C40\u1C41\u1C42\u1C43\u1C44\u1C45\u1C46\u1C47\u1C48\u1C49\u1C50\u1C51\u1C52\u1C53\u1C54\u1C55\u1C56\u1C57\u1C58\u1C59\uA620\uA621\uA622\uA623\uA624\uA625\uA626\uA627\uA628\uA629\uA8D0\uA8D1\uA8D2\uA8D3\uA8D4\uA8D5\uA8D6\uA8D7\uA8D8\uA8D9\uA900\uA901\uA902\uA903\uA904\uA905\uA906\uA907\uA908\uA909\uA9D0\uA9D1\uA9D2\uA9D3\uA9D4\uA9D5\uA9D6\uA9D7\uA9D8\uA9D9\uAA50\uAA51\uAA52\uAA53\uAA54\uAA55\uAA56\uAA57\uAA58\uAA59\uABF0\uABF1\uABF2\uABF3\uABF4\uABF5\uABF6\uABF7\uABF8\uABF9";
var classID = /[\u2E80-\u2FFF\u3040-\u30FF\u3130-\u318F\u3400-\u4DB5\u4E00-\uA4CF\uF900-\uFAD9\uFE62-\uFE66\uFF01-\uFF5A]/;
var classIN = "\u2024\u2025\u2026\uFE19";
var classHY = "-";
var classBA = "\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2008\u2009\u200A\u205F\t\xAD\u058A\u2010\u2012\u2013\u05BE\u0F0B\u1361\u17D8\u17DA\u2027\x7C\u16EB\u16EC\u16ED\u2056\u2058\u2059\u205A\u205B\u205C\u205D\u205E\u2E19\u2E2A\u2E2B\u2E2C\u2E2D\u2E30\u0964\u0965\u0E5A\u0E5B\u104A\u104B\u1735\u1736\u17D4\u17D5\u1B5E\u1B5F\uA8CE\uA8CF\uAA5D\uAA5E\uAA5F\u0F34\u0F7F\u0F85\u0FBE\u0FBF\u0FD2\u1804\u1805\u1B5A\u1B5B\u1B5D\u1B60\u1C3B\u1C3C\u1C3D\u1C3E\u1C3F\u1C7E\u1C7F\u2CFA\u2CFB\u2CFC\u2CFF\u2E0E\u2E0F\u2E10\u2E11\u2E12\u2E13\u2E14\u2E15\u2E17\uA60D\uA60F\uA92E\uA92F";
var classBB = "\xB4\u1FFD\u02DF\u02C8\u02CC\u0F01\u0F02\u0F03\u0F04\u0F06\u0F07\u0F09\u0F0A\u0FD0\u0FD1\u0FD3\uA874\uA875\u1816";
var classB2 = "\u2014";
var classZW = "\u200B";
var classCM = "\u0903\u093B\u093E\u093F\u0940\u0949\u094A\u094B\u094C\u094E\u094F\u0982\u0983\u09BE\u09BF\u09C0\u09C7\u09C8\u09CB\u09CC\u09D7\u0A03\u0A3E\u0A3F\u0A40\u0A83\u0ABE\u0ABF\u0AC0\u0AC9\u0ACB\u0ACC\u0B02\u0B03\u0B3E\u0B40\u0B47\u0B48\u0B4B\u0B4C\u0B57\u0BBE\u0BBF\u0BC1\u0BC2\u0BC6\u0BC7\u0BC8\u0BCA\u0BCB\u0BCC\u0BD7\u0C01\u0C02\u0C03\u0C41\u0C42\u0C43\u0C44\u0C82\u0C83\u0CBE\u0CC0\u0CC1\u0CC2\u0CC3\u0CC4\u0CC7\u0CC8\u0CCA\u0CCB\u0CD5\u0CD6\u0D02\u0D03\u0D3E\u0D3F\u0D40\u0D46\u0D47\u0D48\u0D4A\u0D4B\u0D4C\u0D57\u0D82\u0D83\u0DCF\u0DD0\u0DD1\u0DD8\u0DD9\u0DDA\u0DDB\u0DDC\u0DDD\u0DDE\u0DDF\u0DF2\u0DF3\u0F3E\u0F3F\u0F7F\u102B\u102C\u1031\u1038\u103B\u103C\u1056\u1057\u1062\u1063\u1064\u1067\u1068\u1069\u106A\u106B\u106C\u106D\u1083\u1084\u1087\u1088\u1089\u108A\u108B\u108C\u108F\u109A\u109B\u109C\u17B6\u17BE\u17BF\u17C0\u17C1\u17C2\u17C3\u17C4\u17C5\u17C7\u17C8\u1923\u1924\u1925\u1926\u1929\u192A\u192B\u1930\u1931\u1933\u1934\u1935\u1936\u1937\u1938\u19B0\u19B1\u19B2\u19B3\u19B4\u19B5\u19B6\u19B7\u19B8\u19B9\u19BA\u19BB\u19BC\u19BD\u19BE\u19BF\u19C0\u19C8\u19C9\u1A19\u1A1A\u1A1B\u1A55\u1A57\u1A61\u1A63\u1A64\u1A6D\u1A6E\u1A6F\u1A70\u1A71\u1A72\u1B04\u1B35\u1B3B\u1B3D\u1B3E\u1B3F\u1B40\u1B41\u1B43\u1B44\u1B82\u1BA1\u1BA6\u1BA7\u1BAA\u1BE7\u1BEA\u1BEB\u1BEC\u1BEE\u1BF2\u1BF3\u1C24\u1C25\u1C26\u1C27\u1C28\u1C29\u1C2A\u1C2B\u1C34\u1C35\u1CE1\u1CF2\uA823\uA824\uA827\uA880\uA881\uA8B4\uA8B5\uA8B6\uA8B7\uA8B8\uA8B9\uA8BA\uA8BB\uA8BC\uA8BD\uA8BE\uA8BF\uA8C0\uA8C1\uA8C2\uA8C3\uA952\uA953\uA983\uA9B4\uA9B5\uA9BA\uA9BB\uA9BD\uA9BE\uA9BF\uA9C0\uAA2F\uAA30\uAA33\uAA34\uAA4D\uAA7B\uABE3\uABE4\uABE6\uABE7\uABE9\uABEA\uABEC\u0488\u0489\u20DD\u20DE\u20DF\u20E0\u20E2\u20E3\u20E4\uA670\uA671\uA672\u0300\u0301\u0302\u0303\u0304\u0305\u0306\u0307\u0308\u0309\u030A\u030B\u030C\u030D\u030E\u030F\u0310\u0311\u0312\u0313\u0314\u0315\u0316\u0317\u0318\u0319\u031A\u031B\u031C\u031D\u031E\u031F\u0320\u0321\u0322\u0323\u0324\u0325\u0326\u0327\u0328\u0329\u032A\u032B\u032C\u032D\u032E\u032F\u0330\u0331\u0332\u0333\u0334\u0335\u0336\u0337\u0338\u0339\u033A\u033B\u033C\u033D\u033E\u033F\u0340\u0341\u0342\u0343\u0344\u0345\u0346\u0347\u0348\u0349\u034A\u034B\u034C\u034D\u034E\u034F\u0350\u0351\u0352\u0353\u0354\u0355\u0356\u0357\u0358\u0359\u035A\u035B\u035C\u035D\u035E\u035F\u0360\u0361\u0362\u0363\u0364\u0365\u0366\u0367\u0368\u0369\u036A\u036B\u036C\u036D\u036E\u036F\u0483\u0484\u0485\u0486\u0487\u0591\u0592\u0593\u0594\u0595\u0596\u0597\u0598\u0599\u059A\u059B\u059C\u059D\u059E\u059F\u05A0\u05A1\u05A2\u05A3\u05A4\u05A5\u05A6\u05A7\u05A8\u05A9\u05AA\u05AB\u05AC\u05AD\u05AE\u05AF\u05B0\u05B1\u05B2\u05B3\u05B4\u05B5\u05B6\u05B7\u05B8\u05B9\u05BA\u05BB\u05BC\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610\u0611\u0612\u0613\u0614\u0615\u0616\u0617\u0618\u0619\u061A\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652\u0653\u0654\u0655\u0656\u0657\u0658\u0659\u065A\u065B\u065C\u065D\u065E\u065F\u0670\u06D6\u06D7\u06D8\u06D9\u06DA\u06DB\u06DC\u06DF\u06E0\u06E1\u06E2\u06E3\u06E4\u06E7\u06E8\u06EA\u06EB\u06EC\u06ED\u0711\u0730\u0731\u0732\u0733\u0734\u0735\u0736\u0737\u0738\u0739\u073A\u073B\u073C\u073D\u073E\u073F\u0740\u0741\u0742\u0743\u0744\u0745\u0746\u0747\u0748\u0749\u074A\u07A6\u07A7\u07A8\u07A9\u07AA\u07AB\u07AC\u07AD\u07AE\u07AF\u07B0\u07EB\u07EC\u07ED\u07EE\u07EF\u07F0\u07F1\u07F2\u07F3\u0816\u0817\u0818\u0819\u081B\u081C\u081D\u081E\u081F\u0820\u0821\u0822\u0823\u0825\u0826\u0827\u0829\u082A\u082B\u082C\u082D\u0859\u085A\u085B\u0900\u0901\u0902\u093A\u093C\u0941\u0942\u0943\u0944\u0945\u0946\u0947\u0948\u094D\u0951\u0952\u0953\u0954\u0955\u0956\u0957\u0962\u0963\u0981\u09BC\u09C1\u09C2\u09C3\u09C4\u09CD\u09E2\u09E3\u0A01\u0A02\u0A3C\u0A41\u0A42\u0A47\u0A48\u0A4B\u0A4C\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81\u0A82\u0ABC\u0AC1\u0AC2\u0AC3\u0AC4\u0AC5\u0AC7\u0AC8\u0ACD\u0AE2\u0AE3\u0B01\u0B3C\u0B3F\u0B41\u0B42\u0B43\u0B44\u0B4D\u0B56\u0B62\u0B63\u0B82\u0BC0\u0BCD\u0C3E\u0C3F\u0C40\u0C46\u0C47\u0C48\u0C4A\u0C4B\u0C4C\u0C4D\u0C55\u0C56\u0C62\u0C63\u0CBC\u0CBF\u0CC6\u0CCC\u0CCD\u0CE2\u0CE3\u0D41\u0D42\u0D43\u0D44\u0D4D\u0D62\u0D63\u0DCA\u0DD2\u0DD3\u0DD4\u0DD6\u0E31\u0E34\u0E35\u0E36\u0E37\u0E38\u0E39\u0E3A\u0E47\u0E48\u0E49\u0E4A\u0E4B\u0E4C\u0E4D\u0E4E\u0EB1\u0EB4\u0EB5\u0EB6\u0EB7\u0EB8\u0EB9\u0EBB\u0EBC\u0EC8\u0EC9\u0ECA\u0ECB\u0ECC\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F71\u0F72\u0F73\u0F74\u0F75\u0F76\u0F77\u0F78\u0F79\u0F7A\u0F7B\u0F7C\u0F7D\u0F7E\u0F80\u0F81\u0F82\u0F83\u0F84\u0F86\u0F87\u0F8D\u0F8E\u0F8F\u0F90\u0F91\u0F92\u0F93\u0F94\u0F95\u0F96\u0F97\u0F99\u0F9A\u0F9B\u0F9C\u0F9D\u0F9E\u0F9F\u0FA0\u0FA1\u0FA2\u0FA3\u0FA4\u0FA5\u0FA6\u0FA7\u0FA8\u0FA9\u0FAA\u0FAB\u0FAC\u0FAD\u0FAE\u0FAF\u0FB0\u0FB1\u0FB2\u0FB3\u0FB4\u0FB5\u0FB6\u0FB7\u0FB8\u0FB9\u0FBA\u0FBB\u0FBC\u0FC6\u102D\u102E\u102F\u1030\u1032\u1033\u1034\u1035\u1036\u1037\u1039\u103A\u103D\u103E\u1058\u1059\u105E\u105F\u1060\u1071\u1072\u1073\u1074\u1082\u1085\u1086\u108D\u109D\u135D\u135E\u135F\u1712\u1713\u1714\u1732\u1733\u1734\u1752\u1753\u1772\u1773\u17B7\u17B8\u17B9\u17BA\u17BB\u17BC\u17BD\u17C6\u17C9\u17CA\u17CB\u17CC\u17CD\u17CE\u17CF\u17D0\u17D1\u17D2\u17D3\u17DD\u180B\u180C\u180D\u18A9\u1920\u1921\u1922\u1927\u1928\u1932\u1939\u193A\u193B\u1A17\u1A18\u1A56\u1A58\u1A59\u1A5A\u1A5B\u1A5C\u1A5D\u1A5E\u1A60\u1A62\u1A65\u1A66\u1A67\u1A68\u1A69\u1A6A\u1A6B\u1A6C\u1A73\u1A74\u1A75\u1A76\u1A77\u1A78\u1A79\u1A7A\u1A7B\u1A7C\u1A7F\u1B00\u1B01\u1B02\u1B03\u1B34\u1B36\u1B37\u1B38\u1B39\u1B3A\u1B3C\u1B42\u1B6B\u1B6C\u1B6D\u1B6E\u1B6F\u1B70\u1B71\u1B72\u1B73\u1B80\u1B81\u1BA2\u1BA3\u1BA4\u1BA5\u1BA8\u1BA9\u1BE6\u1BE8\u1BE9\u1BED\u1BEF\u1BF0\u1BF1\u1C2C\u1C2D\u1C2E\u1C2F\u1C30\u1C31\u1C32\u1C33\u1C36\u1C37\u1CD0\u1CD1\u1CD2\u1CD4\u1CD5\u1CD6\u1CD7\u1CD8\u1CD9\u1CDA\u1CDB\u1CDC\u1CDD\u1CDE\u1CDF\u1CE0\u1CE2\u1CE3\u1CE4\u1CE5\u1CE6\u1CE7\u1CE8\u1CED\u1DC0\u1DC1\u1DC2\u1DC3\u1DC4\u1DC5\u1DC6\u1DC7\u1DC8\u1DC9\u1DCA\u1DCB\u1DCC\u1DCD\u1DCE\u1DCF\u1DD0\u1DD1\u1DD2\u1DD3\u1DD4\u1DD5\u1DD6\u1DD7\u1DD8\u1DD9\u1DDA\u1DDB\u1DDC\u1DDD\u1DDE\u1DDF\u1DE0\u1DE1\u1DE2\u1DE3\u1DE4\u1DE5\u1DE6\u1DFC\u1DFD\u1DFE\u1DFF\u20D0\u20D1\u20D2\u20D3\u20D4\u20D5\u20D6\u20D7\u20D8\u20D9\u20DA\u20DB\u20DC\u20E1\u20E5\u20E6\u20E7\u20E8\u20E9\u20EA\u20EB\u20EC\u20ED\u20EE\u20EF\u20F0\u2CEF\u2CF0\u2CF1\u2D7F\u2DE0\u2DE1\u2DE2\u2DE3\u2DE4\u2DE5\u2DE6\u2DE7\u2DE8\u2DE9\u2DEA\u2DEB\u2DEC\u2DED\u2DEE\u2DEF\u2DF0\u2DF1\u2DF2\u2DF3\u2DF4\u2DF5\u2DF6\u2DF7\u2DF8\u2DF9\u2DFA\u2DFB\u2DFC\u2DFD\u2DFE\u2DFF\u302A\u302B\u302C\u302D\u302E\u302F\u3099\u309A\uA66F\uA67C\uA67D\uA6F0\uA6F1\uA802\uA806\uA80B\uA825\uA826\uA8C4\uA8E0\uA8E1\uA8E2\uA8E3\uA8E4\uA8E5\uA8E6\uA8E7\uA8E8\uA8E9\uA8EA\uA8EB\uA8EC\uA8ED\uA8EE\uA8EF\uA8F0\uA8F1\uA926\uA927\uA928\uA929\uA92A\uA92B\uA92C\uA92D\uA947\uA948\uA949\uA94A\uA94B\uA94C\uA94D\uA94E\uA94F\uA950\uA951\uA980\uA981\uA982\uA9B3\uA9B6\uA9B7\uA9B8\uA9B9\uA9BC\uAA29\uAA2A\uAA2B\uAA2C\uAA2D\uAA2E\uAA31\uAA32\uAA35\uAA36\uAA43\uAA4C\uAAB0\uAAB2\uAAB3\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uABE5\uABE8\uABED\uFB1E\uFE00\uFE01\uFE02\uFE03\uFE04\uFE05\uFE06\uFE07\uFE08\uFE09\uFE0A\uFE0B\uFE0C\uFE0D\uFE0E\uFE0F\uFE20\uFE21\uFE22\uFE23\uFE24\uFE25\uFE26\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u0009\u000A\u000B\u000C\u000D\u000E\u000F\u0010\u0011\u0012\u0013\u0014\u0015\u0016\u0017\u0018\u0019\u001A\u001B\u001C\u001D\u001E\u001F\u007F\u0080\u0081\u0082\u0083\u0084\u0085\u0086\u0087\u0088\u0089\u008A\u008B\u008C\u008D\u008E\u008F\u0090\u0091\u0092\u0093\u0094\u0095\u0096\u0097\u0098\u0099\u009A\u009B\u009C\u009D\u009E\u009F\u0600\u0601\u0602\u0603\u06DD\u070F\u17B4\u17B5\u200B\u200C\u200D\u200E\u200F\u202A\u202B\u202C\u202D\u202E\u2060\u2061\u2062\u2063\u2064\u206A\u206B\u206C\u206D\u206E\u206F\uFEFF\uFFF9\uFFFA\uFFFB";
var classWJ = "\u2060\uFEFF";
var classBK = "\x0C\x0B\u2028\u2029";

var pairTable = [
    "^^^^^^^^^^^^^^^^^^^^@^^^^^^",
    "_^^%%^^^^%%____%%__^#^_____",
    "_^^%%^^^^%%%%__%%__^#^_____",
    "^^^%%%^^^%%%%%%%%%%^#^%%%%%",
    "%^^%%%^^^%%%%%%%%%%^#^%%%%%",
    "_^^%%%^^^______%%__^#^_____",
    "_^^%%%^^^______%%__^#^_____",
    "_^^%%%^^^__%___%%__^#^_____",
    "_^^%%%^^^__%%__%%__^#^_____",
    "%^^%%%^^^__%%%_%%__^#^%%%%%",
    "%^^%%%^^^__%%__%%__^#^_____",
    "%^^%%%^^^%%%%_%%%__^#^_____",
    "%^^%%%^^^__%%_%%%__^#^_____",
    "_^^%%%^^^_%___%%%__^#^_____",
    "_^^%%%^^^_____%%%__^#^_____",
    "_^^%_%^^^__%___%%__^#^_____",
    "_^^%_%^^^______%%__^#^_____",
    "%^^%%%^^^%%%%%%%%%%^#^%%%%%",
    "_^^%%%^^^______%%_^^#^_____",
    "___________________^_______",
    "%^^%%%^^^__%%_%%%__^#^_____",
    "%^^%%%^^^%%%%%%%%%%^#^%%%%%",
    "_^^%%%^^^_%___%%%__^#^___%%",
    "_^^%%%^^^_%___%%%__^#^____%",
    "_^^%%%^^^_%___%%%__^#^%%%%_",
    "_^^%%%^^^_%___%%%__^#^___%%",
    "_^^%%%^^^_%___%%%__^#^____%"
];

// class Numbers:
// SP=-1 BK=-2 CB=-3 CR=-4 LF=-5 NL=-6 SG=-7
// OP=0 CL=1 CP=2 QU=3 GL=4 NS=5 EX=6 SY=7 IS=8 PR=9 PO=10 NU=11 AL=12 ID=13 IN=14 HY=15 BA=16 BB=17 B2=18 ZW=19 CM=20 WJ=21 H2=22 H3=23 JL=24 JV=25 JT=26
// Rules: DIRECT_BRK = _ INDIRECT_BRK = % COMBINING_INDIRECT_BRK = # COMBINING_PROHIBITED_BRK = @ PROHIBITED_BRK = ^ EXPLICIT_BRK = !

var classLookup = null;

function addClass( members, num ) {
    for ( var i=0; i<members.length; i++ )
        classLookup[members.charAt(i)] = num;
}

function checkClassLookup() {
    if ( classLookup )
        return;
    classLookup = new Object;
    addClass( classCM, 20 ); addClass( classOP, 0 ); addClass( classCL, 1 ); addClass( classCP, 2 ); addClass( classQU, 3 );
    addClass( classGL, 4 ); addClass( classNS, 5 ); addClass( classEX, 6 ); addClass( classSY, 7 ); addClass( classIS, 8 );
    addClass( classPR, 9 ); addClass( classPO, 10 ); addClass( classNU, 11 ); addClass( classIN, 14 ); addClass( classHY, 15 );
    addClass( classBA, 16 ); addClass( classBB, 17 ); addClass( classB2, 18 ); addClass( classZW, 19 ); addClass( classWJ, 21 );
    classLookup[' '] = -1; addClass( classBK, -2 ); classLookup['\r'] = -4;  classLookup['\n'] = -5; classLookup['\x85'] = -6;
}

function lookupClass( unichar ) {
    var cl = classLookup[unichar];
    if ( cl===undefined )
        cl = classID.test(unichar)? 13 : 12;
    return cl;
}

function LineBreaker() {
    this.panicLevel = 0;
    this.trailingSpace = null;
}

LineBreaker.prototype = {
    findBrk: function( textContent, startIndex ) {
        var action = '^', i, beforeChar, beforeClass, prevChar, prevClass;

        if ( this.beforeChar===undefined ) {
            beforeChar = textContent.charAt( startIndex++ );
            beforeClass = lookupClass( beforeChar );
            if ( beforeClass==-1 )
                beforeClass = 21;
            else if ( beforeClass==-5 || beforeClass==-4 )
                beforeClass = -2;
        } else {
            beforeChar = this.beforeChar;
            beforeClass = this.beforeClass;
        }
        prevChar = beforeChar;
        prevClass = beforeClass;

        for ( i=startIndex; i<textContent.length && beforeClass!=-2 && ( beforeClass!=-4 || textContent.charAt(i)=='\n' ); i++ ) {
            prevChar = beforeChar;
            prevClass = beforeClass;
            var c = textContent.charAt( i );
            if ( c==' ' ) {
                beforeChar = c;
                continue;
            }
            var afterClass = lookupClass( c );
            if ( afterClass==-2 || afterClass==-6 || afterClass==-5 ) {
                action = '^' ;
                beforeChar = c;
                beforeClass = -2;
                continue;
            }
            if ( afterClass==-4 ) {
                action = '^';
                beforeChar = c;
                beforeClass = -4;
                continue;
            }
            action = this.panicLevel<=1 ? pairTable[beforeClass].charAt( afterClass ) : '_';
            if ( action=='%' ) {
                if ( beforeChar!=' ' && !this.panicLevel )
                    action = '^';
            } else if ( action=='#' ) {
                if ( beforeChar!=' ' ) {
                    action = '^';
                    beforeChar = c;
                    continue;
                }
            } else if ( action=='@' ) {
                action = '^';
                if ( beforeChar!=' ' ) {
                    beforeChar = c;
                    continue;
                }
            }
            beforeChar = c;
            beforeClass = afterClass;
            if ( action!='^' )
                break;
        }
        if ( action=='^' && i<textContent.length )
            action = '!';
        this.action = action;
        this.trailingSpace = prevChar==' ' || prevClass==16 ? prevChar : null;
        this.beforeChar = beforeChar;
        this.beforeClass = beforeClass;
        return i;
    },

    dup: function() {
        var copy = new LineBreaker;
        copy.trailingSpace = null;
        copy.beforeChar = this.beforeChar;
        copy.beforeClass = this.beforeClass;
        copy.panicLevel = this.panicLevel;
    }
};

var mandatoryBreak = /\x0D\x0A|[\x0A-\x0D\x85\u2028\u2029]/g;

function layoutTextInAnArea( g2, futureParent ) {
    var telem, tidx, textContent, x=0, y=0, textAttr={ }, fontSize;

    checkClassLookup();
    for ( var textArea=g2.firstElementChild; textArea; textArea=textArea.nextElementSibling )
        if ( textArea.localName=='textArea' )
            break;
    if ( !textArea )
        return 0;

    var lineIncrement = parseFloat( textArea.getAttribute( 'line-increment' ) );
    if ( isNaN(lineIncrement) || lineIncrement < 0 )
        lineIncrement = -1;

    for ( var g=textArea; g && g.nodeType==1; g=g.parentNode ) {
        fontSize = parseFloat( g.getAttribute( 'font-size' ) );
        if ( !isNaN(fontSize) && fontSize>=0 )
            break;
    }
    if ( isNaN(fontSize) || fontSize < 0 )
        fontSize = -1;
    var textAlign = textArea.getAttribute( 'text-align' ) || 'start';
    var displayAlign = textArea.getAttribute( 'display-align' ) || 'before';
    var width = parseFloat(textArea.getAttribute( 'width' ));
    if ( isNaN(width) || width<0 )
        width = -1;
    var height = parseFloat(textArea.getAttribute( 'height' ));
    if ( isNaN(height) || height<0 )
        height = -1;
    var gg = textArea.nextElementSibling;
    if ( !gg || gg.localName!='g' )
        return 0;
    var g3 = gg.firstElementChild;
    if ( g3 )
        gg.removeChild( g3 );
    for ( var i=0; i<textProps.length; i++ ) {
        var av = textArea.getAttribute( textProps[i] );
        if ( av!==null && av!=='' )
            textAttr[ textProps[i] ] = av;
    }
    gg.setAttribute( 'transform', textArea.getAttribute( 'transform' ) || '' );
    g3 = jSignage._createElement( 'g', textAttr );
    (futureParent || gg).appendChild( g3 );

    for ( telem=textArea.firstElementChild; telem; telem=telem.nextElementSibling )
        if ( telem.localName=='tspan' || telem.localName=='tbreak' )
            break;
    tidx = 0;
    textContent = telem && telem.localName=='tspan' ? telem.firstElementChild && telem.firstElementChild.localName=='tbreak' ? '\n' : telem.textContent : '\n';

    while ( telem ) {   // Loop over the lines
        var maxFontSize = -1, t2=null, bbox, wrapped=false;
        var text = document.createElementNS( jSignage.svgNS, 'text' );
        text.setAttributeNS( jSignage.xmlNS, 'space', 'preserve' );
        g3.appendChild( text );
        if ( telem.localName=='tspan' ) {
            t2 = telem.cloneNode(false);
            text.appendChild( t2 );
        }
        var lineBreaker = new LineBreaker();
        var rollback = {
            t2: t2,
            t2Content: '',
            lineBreaker: new LineBreaker(),
            telem: telem,
            textContent: textContent,
            tidx: tidx,
            sol: true,
            maxFontSize: maxFontSize
        };
  
        while ( !wrapped ) {   // Loop over the tspans
            if ( telem ) {
                if ( width<0 ) {
                    while ( rollback.sol && tidx < textContent.length ) {
                        if ( textContent.charAt(tidx)==' ' || lookupClass( textContent.charAt(tidx) )==16 )
                            ++tidx;
                        else
                            rollback.sol = false;
                    }
                    mandatoryBreak.lastIndex = tidx;
                    var ex = mandatoryBreak.exec( textContent );
                    if ( ex ) {
                        breakIdx = mandatoryBreak.lastIndex;
                        lineBreaker.action = '!';
                    } else {
                        breakIdx = textContent.length;
                    }
                } else {
                    breakIdx =  lineBreaker.findBrk( textContent, tidx );
                }
                if ( breakIdx > tidx ) {
                    var fs = parseFloat( telem.getAttribute( 'font-size' ) ), breakIdx;
                    if ( isNaN(fs) || fs<0 )
                        fs = fontSize;
                    if ( fs>=0 && ( maxFontSize<0 || fs>maxFontSize ) )
                        maxFontSize = fs;
                }
            }
            if ( !telem || breakIdx<textContent.length ) {
                if ( t2 && telem )
                    t2.textContent += textContent.substring( tidx, lineBreaker.trailingSpace===null ? breakIdx : breakIdx-1 );
                bbox = text.getBBox();
                if ( width>=0 && bbox.width > width-2 ) {
                    if ( rollback.t2 ) for ( var tt=rollback.t2.nextElementSibling; tt; tt=tt.nextElementSibling )
                        text.removeChild( tt );
                    t2 = rollback.t2;
                    if ( t2 )
                        t2.textContent = rollback.t2Content;
                    lineBreaker = rollback.lineBreaker;
                    telem = rollback.telem;
                    textContent = rollback.textContent;
                    tidx = rollback.tidx;
                    maxFontSize = rollback.maxFontSize;
                    if ( rollback.sol ) {
                        if ( ++lineBreaker.panicLevel==3 ) {
                            if ( t2 )
                                text.removeChild( t2 );
                            if ( futureParent ) {
                                futureParent.removeChild( g3 );
                                gg.appendChild( g3 );
                            }
                            return y;
                        }
                    } else {
                        wrapped = true;
                    }
                } else {
                    if ( !telem || lineBreaker.action=='!' ) {
                        wrapped = true;
                        tidx = breakIdx;
                    } else {
                        rollback.t2 = t2;
                        rollback.t2Content = t2.textContent;
                        rollback.lineBreaker = lineBreaker.dup();
                        rollback.telem = telem;
                        rollback.textContent = textContent;
                        rollback.tidx = breakIdx;
                        rollback.maxFontSize = maxFontSize;
                        rollback.sol = false;
                        if ( lineBreaker.trailingSpace!==null && breakIdx==0 )
                            t2.previousElementSibling.textContent += lineBreaker.trailingSpace;
                        if ( lineBreaker.trailingSpace===null || breakIdx==0 ) {
                            if ( lineBreaker.beforeChar!='\xAD' )
                                t2.textContent += lineBreaker.beforeChar;
                        } else if ( lineBreaker.beforeChar=='\xAD' ) {
                            t2.textContent += lineBreaker.trailingSpace;
                        } else {
                            t2.textContent += lineBreaker.trailingSpace + lineBreaker.beforeChar;
                        }
                        tidx = breakIdx+1;
                    }
                }
            } else {
                if ( lineBreaker.action=='!' )
                    wrapped = true;
                if ( t2 )
                    t2.textContent += textContent.substring( tidx, lineBreaker.trailingSpace===null ? breakIdx : breakIdx-1 );
                tidx = textContent.length;
            }
            if ( telem && tidx >= textContent.length ) {
                for ( telem=telem.nextElementSibling; telem; telem=telem.nextElementSibling )
                    if ( ( telem.localName=='tspan' && ( telem.textContent.length>0 || ( telem.firstElementChild && telem.firstElementChild.localName=='tbreak' ) ) ) || telem.localName=='tbreak' )
                        break;
                if ( telem ) {
                    if ( telem.localName=='tspan' && ( !telem.firstElementChild || telem.firstElementChild.localName!='tbreak' ) ) {
                        t2 = telem.cloneNode(false);
                        text.appendChild( t2 );
                        textContent = telem.textContent;
                    } else {
                        t2 = null;
                        textContent = '\n';
                    }
                } else {
                    t2 = null;
                    textContent = '';
                }
                tidx = 0;
            }
        }
        var prevY = y;
        y += lineIncrement>=0 ? lineIncrement : maxFontSize>=0 ? maxFontSize*1.1 : bbox.height*1.1;
        if ( height>=0 && y>height ) {
            g3.removeChild( text );
            y = prevY;
            break;
        }
        if ( text.firstElementChild ) {
            text.setAttribute( 'y', y );
            if ( width>=0 ) {
                text.setAttribute( 'x', textAlign=='end' ? width-1 : textAlign=='center' ? width/2 : 1 );
                text.setAttribute( 'text-anchor', textAlign=='end' ? 'end' : textAlign=='center' ? 'middle' : 'start' );
            } else {
                text.setAttribute( 'x', 0 );
                text.setAttribute( 'text-anchor', 'start' );
                bbox = text.getBBox();
                if ( bbox.width > x )
                    x = bbox.width;
            }
        } else {
            g3.removeChild( text );
        }
    }
    if ( futureParent )
        futureParent.removeChild( g3 );
    if ( height>=0 ) {
        if ( displayAlign=='after' )
            g3.setAttribute( 'transform', 'translate(0,'+ (height-y) +')' );
        else if ( displayAlign=='center' )
            g3.setAttribute( 'transform', 'translate(0,'+ (height-y)/2 +')' );
    }
    if ( futureParent )
        gg.appendChild( g3 );
    return width>=0 ? y : x+2;
}

var mediaViewportAttr = [ 'x', 'y', 'width', 'height' ];

function createXHTMLObject( width, height, type, data, params ) {
    var object = document.createElementNS( jSignage.xhtmlNS, 'object' );
    if ( !isNaN(width) )
        object.setAttribute( 'width', width );
    if ( !isNaN(height) )
        object.setAttribute( 'height', height );
    if ( type )
        object.setAttribute( 'type', type );
    if ( data )
        object.setAttribute( 'data', data );
    for ( var name in params ) {
        var param = document.createElementNS( jSignage.xhtmlNS, 'param' );
        param.setAttribute( 'name', name );
        param.setAttribute( 'value', params[name] );
        object.appendChild( param );
    }
    return object;
}

function media_error( timingElement, media ) {
    jSignage.endLayerAt( timingElement );
}

function media_ended( timingElement, media ) {
    if ( timingElement.getAttribute( 'dur' )=='media' )
        jSignage.endLayerAt( timingElement );
}

function media_dur( timingElement, media, dur ) {
    jSignage.setLayerMediaDur( timingElement, dur );
}

function realizeMedia( timingElement, media ) {
    var name = media.localName;
    var g = document.createElementNS( jSignage.svgNS, 'g' ), i, v;
    var audioLevel = parseFloat( media.getAttribute( 'audio-level' ) );
    var src = media.getAttributeNS( jSignage.xlinkNS, 'href' );
    if ( name=='audio' ) {
        if ( Audio ) {
            var audio = new Audio( src );
            g.appendChild( audio );
            if ( !isNaN(audioLevel) )
                audio.volume = audioLevel;
            audio.addEventListener( 'error', function() { timingElement, media_error( media ); }, false);
            audio.addEventListener( 'ended', function() { timingElement, media_ended( media ); }, false);
            audio.addEventListener( 'durationchange', function() { media_dur( timingElement, media, audio.duration ); }, false);
            audio.play();
        }
    } else {
        v = media.getAttribute( 'opacity' );
        if ( v!==null && v!=='' )
            g.setAttribute( 'opacity', v );
        var width = parseFloat( media.getAttribute( 'width' ) );
        var height = parseFloat( media.getAttribute( 'height' ) );
        var autoRepeat = media.getAttribute( 'repeatCount' ) || media.getAttribute( 'repeatCount' );
        var viewportFill = media.getAttribute( 'viewport-fill' );
        if ( viewportFill!==null && viewportFill!=='' ) {
            var bg = jSignage._createElement( 'rect', { fill: viewportFill, stroke: 'none' } );
            for ( i=0; i<mediaViewportAttr.length; i++ ) {
                v = media.getAttribute( mediaViewportAttr[i] );
                if ( v!==null && v!=='' )
                    bg.setAttribute( mediaViewportAttr[i], v );
            }
            g.appendChild( bg );
        }
        if ( name=='animation' ) {
            /*
            jSignage.get( src, function( data ) {
                var svg = data.documentElement;
                if ( svg.localName!='svg' )
                    return;
                var svgWidth = svg.getAttribute( 'width' ), svgHeight = svg.getAttribute( 'height' );
                svgWidth = jSignage.relAbs( svgWidth, width, width );
                svgHeight = jSignage.relAbs( svgWidth, height, height );
                svg.setAttribute( 'x', media.getAttribute( 'x' ) || 0 );
                svg.setAttribute( 'y', media.getAttribute( 'y' ) || 0 );
                svg.setAttribute( 'width', svgWidth );
                svg.setAttribute( 'height', svgHeight );
                var xxx = jSignage._createElement( 'script' );
                xxx.type = 'text/javascript';
                xxx.innerHTML = "alert('titi');";
                g.appendChild( svg );
                svg.appendChild( xxx );
            }, 'xml' );
            */
        } else if ( name=='video' ) {
            if ( jSignage.features.MSIE ) {
                var x = parseFloat( media.getAttribute( 'x' ) );
                var y = parseFloat( media.getAttribute( 'y' ) );
                if ( isNaN(x) ) x=0;
                if ( isNaN(y) ) y=0;
                if ( isNaN(width) ) width=640;
                if ( isNaN(height) ) height=360;
                var u = Math.min(width,height) / 90;
                g.setAttribute( 'transform', 'translate('+x+','+y+')' );
                g.appendChild( jSignage._createElement( 'rect', {
                    fill: viewportFill || 'black',
                    stroke: 'none',
                    width: width,
                    height: height
                }));
                g.appendChild( jSignage._createElement( 'circle', {
                    fill: '#808080',
                    'fill-opacity': 0.5,
                    stroke: '#C0C0C0',
                    'stroke-width': u,
                    cx: width/2,
                    cy: height/2,
                    r: 15*u
                }));
                g.appendChild( jSignage._createElement( 'polygon', {
                    fill: '#C0C0C0',
                    stroke: 'none',
                    points: [
                        width/2-u*5, height/2-u*10,
                        width/2+u*10, height/2,
                        width/2-u*5, height/2+u*10
                    ].join( ' ' )
                }));
                g.appendChild( jSignage._createElement( 'path', {
                    fill: 'none',
                    stroke: '#C0C0C0',
                    'stroke-width': u,
                    d: new jSignage.pathData()
                        .moveTo( width/2 - u*40, height/2 - u*25 )
                        .lineTo( width/2 + u*40, height/2 - u*25 )
                        .lineTo( width/2 + u*40, height/2 + u*25 )
                        .lineTo( width/2 - u*40, height/2 + u*25 )
                        .close()
                        .moveTo( width/2, height/2 - u*25 )
                        .lineTo( width/2-u*10, height/2 - u*40 )
                        .moveTo( width/2, height/2 - u*25 )
                        .lineTo( width/2+u*10, height/2 - u*40 )
                        .toString()
                }));
                media_dur( timingElement, media, 5 );
            } else {
                var fo = document.createElementNS( jSignage.svgNS, 'foreignObject' );
                for ( i=0; i<mediaViewportAttr.length; i++ ) {
                    v = media.getAttribute( mediaViewportAttr[i] );
                    if ( v!==null && v!=='' )
                        fo.setAttribute( mediaViewportAttr[i], v );
                }
                g.appendChild( fo );
                var body = document.createElementNS( jSignage.xhtmlNS, 'body' );
                body.setAttribute( 'style', 'margin: 0' );
                fo.appendChild( body );
                var vlc = document.createElementNS( jSignage.xhtmlNS, 'embed' );
                if ( !isNaN(width) )
                    vlc.setAttribute( 'width', width );
                if ( !isNaN(height) )
                    vlc.setAttribute( 'height', height );
                vlc.setAttribute( 'type', 'application/x-vlc-plugin' );
                vlc.setAttribute( 'pluginspage', 'http://www.videolan.org' );
                vlc.setAttribute( 'windowless', 'true' );
                vlc.setAttribute( 'branding', 'false' );
                vlc.setAttribute( 'controls', 'false' );
                vlc.setAttribute( 'toolbar', 'false' );
                vlc.setAttribute( 'target', src );
                body.appendChild( vlc );
            }
        }
    }
    media.parentNode.insertBefore( g, media.nextElementSibling );
    if ( vlc ) {
        vlc.addEventListener( 'MediaPlayerEncounteredError', function() { media_error( timingElement, media ); }, false );
        vlc.addEventListener( 'MediaPlayerEndReached', function() { media_ended( timingElement, media ); }, false);
        vlc.addEventListener( 'MediaPlayerPlaying', function() { media_dur( timingElement, media, vlc.input.length/1000 ); }, false);
    }
}

function unrealizeMedia( media ) {
    var fo = media.nextElementSibling;
    if ( fo && fo.localName=='g' )
        media.parentNode.removeChild( fo );
}

function wholePixelBox( ctm, ictm, x1, y1, x2, y2 ) {
    if ( !ictm )
        return { x1: x1, y1: y1, x2: x2, y2: y2 };
    var px1 = Math.floor( ctm.a * x1 + ctm.c * y1 + ctm.e );
    var py1 = Math.floor( ctm.b * x1 + ctm.d * y1 + ctm.f );
    var px2 = Math.ceil( ctm.a * x2 + ctm.c * y2 + ctm.e );
    var py2 = Math.ceil( ctm.b * x2 + ctm.d * y2 + ctm.f );
    return {
        x1: ictm.a * px1 + ictm.c * py1 + ictm.e,
        y1: ictm.b * px1 + ictm.d * py1 + ictm.f,
        x2: ictm.a * px2 + ictm.c * py2 + ictm.e,
        y2: ictm.b * px2 + ictm.d * py2 + ictm.f
    };
}

function createLinearGradient( cssLinearGradient, width, height ) {
    var parts = [], m, z = [], angle = 180, i = 0, x, y;

    while ( m = reSplitShadows.exec( cssLinearGradient ) )
        parts.push( jSignage.trim(m[0]) );
    if ( !parts.length )
        return null;
    while ( m = reSplitShadowParams.exec( parts[0] ) )
        z.push( m[0] );
    if ( z.length > 1 && z[0]=='to' ) {
        var left = false, right = false, top = false, bottom = false;
        for ( x=1; x < z.length; x++ ) {
            if ( z[x]=='left' ) left = true;
            else if ( z[x]=='right' ) right = true;
            else if ( z[x]=='top' ) top = true;
            else if ( z[x]=='bottom' ) bottom = true;
        }
        if ( ( left && right ) || ( top && bottom ) || ( !left && !light && !top && !bottom ) )
            return null;
		if ( right )
			angle = top ? 45 : bottom ? 135 : 90;
		else if ( left )
			angle = top ? -45 : bottom ? -135 : -90;
		else
			angle = top ? 0 : 180;
        i = 1;
    } else if ( z.length==1 && z[0].length > 3 && z[0].substring( z[0].length-3 )=='deg' ) {
        angle = parseFloat( z[0] );
        if ( isNaN( angle ) )
            angle = 180;
        else
            i = 1;
    }
    if ( i + 2 > parts.length )
        return null;
    var startColor = parts[i], startOpacity = 1, endColor = parts[i+1], endOpacity = 1;
    var rgba = reRGBA.exec( startColor );
    if ( rgba ) {
        startColor = 'rgb(' + rgba[1] + ')';
        startOpacity = rgba[2];
    }
    rgba = reRGBA.exec( endColor );
    if ( rgba ) {
        endColor = 'rgb(' + rgba[1] + ')';
        endOpacity = rgba[2];
    }
    angle -= Math.floor( angle / 360 ) * 360;
    if ( angle > 180 ) angle -= 360;
    var mx = 1, my = 1;
    if ( angle < 0 ) {
        mx = -1;
        angle = -angle;
    }
    if ( angle > 90 ) {
        my = -1;
        angle = 180 - angle;
    }
    if ( angle <= 45 ) {
        var t = Math.tan( angle / 180 * Math.PI );
        y = ( height/2 + width/2 * t ) / ( 1 + t*t );
        x = - t * y;
    } else {
        var c = Math.tan( (90-angle) / 180 * Math.PI );
        x = - ( width/2 + height/2 * c ) / ( 1 + c*c );
        y = - c * x;
    }
    x = x * mx;
    y = y * my;
    var gradient = jSignage._createElement( 'linearGradient', { gradientUnits: 'userSpaceOnUse', x1: width/2+x, y1: height/2+y, x2: width/2-x, y2: height/2-y } );
    gradient.id = jSignage.guuid();
    gradient.appendChild( jSignage._createElement( 'stop', { offset: 0, 'stop-color': startColor, 'stop-opacity': startOpacity } ) );
    gradient.appendChild( jSignage._createElement( 'stop', { offset: 1, 'stop-color': endColor, 'stop-opacity': endOpacity } ) );
    return gradient;
}

function createFilterForTextShadow( textShadow, width, height ) {
    var shadows = [], m, n, i, last = null;
    while ( m = reSplitShadows.exec( textShadow ) ) {
        if ( m[0]==last ) {
            shadows.push( null );
        } else {
            var shadow = [];
            while ( n = reSplitShadowParams.exec( m[0] ) )
                shadow.push( n[0] );
            if ( shadow.length ) {
                shadows.push( shadow );
                last = m[0];
            }
        }
    }
    if ( !shadows.length )
        return null;
    var feFilter = jSignage._createElement( 'filter', { filterUnits: 'userSpaceOnUse' } );
    feFilter.id = jSignage.guuid();
    var left = 0, top = 0, right = 0, bottom = 0, sin = [], sout = [];
    for ( i=0; i < shadows.length; i++ ) {
        var shadow = shadows[i], dx = 0, dy = 0, blur = 0, color = 'currentColor', opacity = 1, inset = false;
        m = 0; n = 0;
        for ( var j=0; j < shadow.length; j++ ) {
            if ( shadow[j]=='inset' ) {
                inset = true;
            } else {
                var f = parseFloat( shadow[j] );
                if ( isNaN(f) ) {
                    if ( m==0 ) color = shadow[j];
                    ++m;
                } else {
                    if ( n==0 ) dx = f;
                    else if ( n==1 ) dy = f;
                    else if ( n==2 ) blur = f;
                    ++n;
                }
            }
        }
        if ( blur < 0 ) blur = 0;
        if ( !inset ) {
            left = Math.max( left, -dx+blur*1.5 );
            right = Math.max( right, dx+blur*1.5 );
            top = Math.max( top, -dy+blur*1.5 );
            bottom = Math.max( bottom, dy+blur*1.5 );
        }
        var rgba = reRGBA.exec( color );
        if ( rgba ) {
            color = 'rgb(' + rgba[1] + ')';
            opacity = rgba[2];
        }
        if ( blur )
            feFilter.appendChild( jSignage._createElement( 'feGaussianBlur', { in: 'SourceAlpha', stdDeviation: blur/2, result: 'blur' } ) );
        feFilter.appendChild( jSignage._createElement( 'feOffset', { in: blur ? 'blur' : 'SourceAlpha', dx: dx, dy: dy, result: 'offsetBlur' } ) );
        feFilter.appendChild( jSignage._createElement( 'feFlood', { 'flood-color': color, 'flood-opacity': opacity } ) );
        if ( inset ) {
            feFilter.appendChild( jSignage._createElement( 'feComposite', { operator: 'in', in2: 'SourceAlpha' } ) );
            var result = 'S'+i;
            feFilter.appendChild( jSignage._createElement( 'feComposite', { operator: 'out', in2: 'offsetBlur', result: result } ) );
            sin.push( result );
            for ( ; i+1 < shadows.length && !shadows[i+1]; i++ )
                sin.push( result );
        } else {
            var result = 'S'+i;
            feFilter.appendChild( jSignage._createElement( 'feComposite', { operator: 'in', in2: 'offsetBlur', result: result } ) );
            sout.push( result );
            for ( ; i+1 < shadows.length && !shadows[i+1]; i++ )
                sout.push( result );
        }
    }
    var feMerge = feFilter.appendChild( jSignage._createElement( 'feMerge' ) );
    for ( i=sout.length-1; i>=0 ; --i )
        feMerge.appendChild( jSignage._createElement( 'feMergeNode', { in: sout[i] } ) );
    feMerge.appendChild( jSignage._createElement( 'feMergeNode', { in: 'SourceGraphic' } ) );
    for ( i=sin.length-1; i>=0 ; --i )
        feMerge.appendChild( jSignage._createElement( 'feMergeNode', { in: sin[i] } ) );
    feFilter.setAttribute( 'x', -left );
    feFilter.setAttribute( 'width', left+width+right );
    feFilter.setAttribute( 'y', -top );
    feFilter.setAttribute( 'height', top+height+bottom );
    return feFilter;
}

jSignage.filterEffect = function() {
    this.feFilter = jSignage._createElement( 'filter', { filterUnits: 'userSpaceOnUse' } );
    this.feFilter.id = jSignage.guuid();
    this.regions = {};
    this.result = null;
};

jSignage.getMaxFontSize = function( layer, defaultSize ) {
    var maxFontSize = -1;
    var layerFontSize = layer.args && typeof(layer.args)=='object' && 'fontSize' in layer.args ? layer.args.fontSize : -1;
    var textContent = layer.textContent || '';
    if ( jSignage.isArray( textContent ) ) {
        for ( var i=0; i < textContent.length; i++ ) {
            var t = textContent[i];
            if ( typeof(t)=='object' && t && 'fontSize' in t )
                maxFontSize = Math.max( maxFontSize, t.fontSize );
            else
                maxFontSize = Math.max( maxFontSize, layerFontSize );
        }
    } else if ( typeof(textContent)=='object' && textContent && 'fontSize' in textContent ) {
        maxFontSize = Math.max( maxFontSize, textContent.fontSize );
    } else {
        maxFontSize = Math.max( maxFontSize, layerFontSize );
    }
    return maxFontSize < 0 ? defaultSize : maxFontSize;
};

jSignage.filterEffect.prototype = {
    get: function( width, height ) {
        var left, top, right, bottom;
        if ( this.result ) {
            left = Math.max( this.result.left, 0 );
            top = Math.max( this.result.top, 0 );
            right = Math.max( this.result.right, 0 );
            bottom = Math.max( this.result.bottom, 0 );
        } else {
            left = top = right = bottom = 0;
        }
        this.feFilter.setAttribute( 'x', -left );
        this.feFilter.setAttribute( 'width', left + width + right );
        this.feFilter.setAttribute( 'y', -top );
        this.feFilter.setAttribute( 'height', top + height + bottom );
        return this.feFilter;
    },

    getRegion: function( region ) {
        return this.regions[region] || { left: 0, top: 0, right: 0, bottom: 0 };
    },

    feMerge: function() {
        var m = jSignage._createElement( 'feMerge' );
        var rout = { left: 0, top: 0, right: 0, bottom: 0 }, inputs, result = null;
        if ( arguments.length > 0 && jSignage.isArray(arguments[0]) ) {
            inputs = arguments[0];
            if ( arguments.length > 1 )
                result = arguments[1];
        } else {
            inputs = arguments;
        }
        for ( var i = inputs.length-1; i>=0; --i ) {
            m.appendChild( jSignage._createElement( 'feMergeNode', { in: inputs[i] } ) );
            var rin = this.getRegion( inputs[i] );
            rout.left = Math.max( rin.left, rout.left );
            rout.top = Math.max( rin.top, rout.top );
            rout.right = Math.max( rin.right, rout.right );
            rout.bottom = Math.max( rin.bottom, rout.bottom );
        }
        this.feFilter.appendChild( m );
        this.result = rout;
        if ( result!==null ) {
            m.setAttribute( 'result', result );
            this.regions[result] = rout;
        }
        return m;
    },

    feGaussianBlur: function( input, stdDev, output ) {
        var rin = this.getRegion( input ), rout;
        var result = output || input, child = null;
        if ( jSignage.isArray( stdDev ) ) {
            child = jSignage._createElement( 'feGaussianBlur', {
                'in': input,
                stdDeviation: stdDev[0] + ' ' + stdDev[1],
                result: result
            });
            rout = {
                left: rin.left + 3*stdDev[0],
                right: rin.right + 3*stdDev[0],
                top: rin.top + 3*stdDev[1],
                bottom: rin.bottom + 3*stdDev[1]
            };
        } else {
            child = jSignage._createElement( 'feGaussianBlur', {
                'in': input,
                stdDeviation: stdDev,
                result: result
            });
            rout = {
                left: rin.left + 3*stdDev,
                right: rin.right + 3*stdDev,
                top: rin.top + 3*stdDev,
                bottom: rin.bottom + 3*stdDev
            };
        }
        this.feFilter.appendChild( child );
        this.result = this.regions[result] = rout;
        return child;
    },

    feOffset: function( input, dx, dy, output ) {
        var result = output || input;
        var child = jSignage._createElement( 'feOffset', {
            'in': input,
            dx: dx,
            dy: dy,
            result: result
        });
        this.feFilter.appendChild( child );
        var rin = this.getRegion( input );
        this.result = this.regions[result] = {
            left: rin.left - dx,
            top: rin.top - dy,
            right: rin.right + dx,
            bottom: rin.bottom + dy
        };
        return child;
    },

    feColor: function( input, color, opacity, output ) {
        var result = output || input;
        var child = jSignage._createElement( 'feFlood', {
            'flood-color': color,
            'flood-opacity': opacity
        });
        this.feFilter.appendChild( child );
        this.feFilter.appendChild( jSignage._createElement( 'feComposite', {
            in2: input,
            operator: 'in',
            result: result
        }));
        this.result = this.regions[result] = this.getRegion( input );
        return child;
    },

    feColorNegative: function( input, color, opacity, output ) {
        var result = output || input;
        var child = jSignage._createElement( 'feFlood', {
            'flood-color': color,
            'flood-opacity': opacity
        });
        this.feFilter.appendChild( child );
        this.feFilter.appendChild( jSignage._createElement( 'feComposite', {
            in2: input,
            operator: 'out',
            result: result
        }));
        this.result = this.regions[result] = { left: 0, top: 0, right: 0, bottom: 0 };
        return child;
    },

    feColorMatrix: function( input, matrix, output ) {
        var result = output || input;
        var child = jSignage._createElement( 'feColorMatrix', {
            'in': input,
            values: matrix.join(' '),
            result: result
        });
        this.feFilter.appendChild( child );
        this.result = this.regions[result] = this.getRegion( input );
        return child;
    },

    feSaturate: function( input, value, output ) {
        var result = output || input;
        var child = jSignage._createElement( 'feColorMatrix', {
            'in': input,
            type: 'saturate',
            values: value,
            result: result
        });
        this.feFilter.appendChild( child );
        this.result = this.regions[result] = this.getRegion( input );
        return child;
    },

    feHueRotate: function( input, value, output ) {
        var result = output || input;
        var child = jSignage._createElement( 'feColorMatrix', {
            'in': input,
            type: 'hueRotate',
            values: value,
            result: result
        });
        this.feFilter.appendChild( child );
        this.result = this.regions[result] = this.getRegion( input );
        return child;
    },

    feComposite: function( input, op, in2, output ) {
        var result = output || input;
        var child = jSignage._createElement( 'feComposite', {
            'in': input,
            operator: op,
            in2: in2,
            result: result
        });
        this.feFilter.appendChild( child );
        var rin = this.getRegion( input ), rin2 = this.getRegion( in2 ), rout;
        if ( op=='in' ) {
            rout = {
                left: Math.min( rin.left, rin2.left ),
                top: Math.min( rin.top, rin2.top ),
                right: Math.min( rin.right, rin2.right ),
                bottom: Math.min( rin.bottom, rin2.bottom )
            };
        } else if ( op=='out' ){
            rout = rin;
        } else {
            rout = {
                left: Math.max( rin.left, rin2.left ),
                top: Math.max( rin.top, rin2.top ),
                right: Math.max( rin.right, rin2.right ),
                bottom: Math.max( rin.bottom, rin2.bottom )
            };
        }
        this.result = this.regions[result] = rout;
        return child;
    }
};

function getAll( context, tag ) {
    var elems, elem, i = 0, found;

    for ( found = [], elems = context.childNodes || context; ( elem = elems[i] ) != null; i++ ) {
        if ( !tag || jSignage.nodeName( elem, tag ) ) {
            found.push( elem );
        } else {
            jSignage.merge( found, getAll( elem, tag ) );
        }
    }

    return tag === undefined || tag && jSignage.nodeName( context, tag ) ? jSignage.merge( [context], found ) : found;
}

function cloneCopyEvent( src, dest ) {

    if ( dest.nodeType !== 1 || !jSignage.hasData( src ) ) {
        return;
    }

    var type, i, l,
		oldData = jSignage._data( src ),
		curData = jSignage._data( dest, oldData ),
		events = oldData.events;

    if ( events ) {
        delete curData.handle;
        curData.events = {};

        for ( type in events ) {
            for ( i = 0, l = events[type].length; i < l; i++ ) {
                jSignage.event.add( dest, type, events[type][i] );
            }
        }
    }

    // make the cloned public data object a copy from the original
    if ( curData.data ) {
        curData.data = jSignage.extend( {}, curData.data );
    }
}


jSignage.extend({

    g: function( args ) {
        var layer = jSignage.customLayer( 'group', args, null, function( width, height, x, y, bbw, bbh, parent ) {
            for ( var child=jSignage.getG2(this).firstElementChild; child!=null; child=child.nextElementSibling ) {
                if ( child.localName!='set' && child.localName!='animate' ) {
                    var realChild = jSignage.getRealMediaTarget(child);
                    if ( jSignage.isLayer( realChild ) )
                        jSignage._calcLayout( child, width, height, 0, parent );
                }
            }
        });
        var attr = { };
        jSignage.copyProps( args, attr, shapeProps );
        jSignage.setAttributes( layer.g2(), attr );
        return layer;
    },

    textArea: function( attr, layerType, postLayoutCallback ) {
        var textAreaAttr = { 'text-align': 'center', 'display-align': 'center', fill: 'black' }, layer, g, g2;
        jSignage.copyProps( attr, textAreaAttr, textAreaProps );
        if ( attr && attr.textFillGradient )
            textAreaAttr.fill = 'url()';
        var textArea = jSignage._createElement( 'textArea', textAreaAttr );
        textArea.setAttributeNS( jSignage.xmlNS, 'space', 'preserve' );
        if ( jSignage.features.textArea && ( !attr || !attr.noTextArea ) ) {
            if ( layerType || attr && ( attr.fontSize === 'max' || ( attr.fontSize && typeof(attr.fontSize)=='string' && attr.fontSize.charAt(attr.fontSize.length-1) == '%' ) || attr.frame || attr.textShadow || attr.textFilter || attr.textBorderSize || attr.textFillGradient ) ) {
                layer = jSignage.customLayer( layerType || 'textArea', attr, null, function( width, height, x, y, bbw, bbh, parent ) {
                    textArea.setAttribute( 'width', width );
                    textArea.setAttribute( 'height', height );
                    if ( attr && attr.fontSize==='max' ) {
                        textArea.setAttribute( 'font-size', height );
                        textArea.setAttribute( 'line-increment', height/1.2 );
                    } else if ( attr && attr.fontSize && typeof ( attr.fontSize ) == 'string' && attr.fontSize.charAt( attr.fontSize.length - 1 ) == '%' ) {
                        var relativeFontSize = parseFloat( attr.fontSize );
                        if ( !isNaN( relativeFontSize ) && relativeFontSize > 0 )
                            textArea.setAttribute( 'font-size', height * relativeFontSize / 100 );
                    }
                    if ( postLayoutCallback )
                        postLayoutCallback.call( this, textArea, width, height, x, y, bbw, bbh, parent );
                    var filter = null, gradient = null;
                    if ( attr ) {
                        if ( attr.textBorderSize > 0 ) {
                            textArea.setAttribute( 'stroke-width', attr.textBorderSize );
                            textArea.setAttribute( 'stroke', attr.textBorderColor || 'black' );
                        }
                        if ( attr.textFillGradient ) {
                            var gr = attr.textFillGradient;
                            if ( typeof(gr)=='string' && gr.substring( 0, 16 )=='linear-gradient(' && gr.substring( gr.length-1 )==')' )
                                gradient = createLinearGradient( gr.substring( 16, gr.length-1 ), width, height );
                        }
                        if ( attr.textShadow || attr.textFilter ) {
                            var filterWidth = parseFloat( textArea.getAttribute( 'width' ) );
                            var filterHeight = parseFloat( textArea.getAttribute( 'height' ) ) * 1.1;
                            if ( attr.textShadow )
                                filter = createFilterForTextShadow( attr.textShadow, filterWidth, filterHeight );
                            else
                                filter = attr.textFilter.get( filterWidth, filterHeight );
                        }
                    }
                    if ( gradient ) {
                        g2.appendChild( gradient );
                        textArea.setAttribute( 'fill', 'url(#'+gradient.id+')' );
                    }
                    if ( filter ) {
                        g2.appendChild( filter );
                        textArea.setAttribute( 'filter', 'url(#'+filter.id+')' );
                    }
                });
                g2 = layer.g2();
                g2.appendChild( textArea );
            } else {
                jSignage.setViewportAttr( textArea, attr );
                jSignage.addSetForTiming( textArea, attr );
                layer = jSignage( textArea );
            }
        } else {
            textArea.setAttribute( 'display', 'none' );
            layer = jSignage.customLayer( layerType || 'textArea', attr, null, function( width, height, x, y, bbw, bbh, parent ) {
                textArea.setAttribute( 'width', width );
                textArea.setAttribute( 'height', height );
                if ( attr && attr.fontSize==='max' ) {
                    textArea.setAttribute( 'font-size', height );
                    textArea.setAttribute( 'line-increment', height/1.2 );
                }
                if ( postLayoutCallback )
                    postLayoutCallback.call( this, textArea, width, height, x, y, bbw, bbh, parent );
                layoutTextInAnArea( this, parent );
                var filter = null, gradient = null;
                if ( attr ) {
                    if ( attr.textBorderSize > 0 ) {
                        g.setAttribute( 'stroke-width', attr.textBorderSize );
                        g.setAttribute( 'stroke', attr.textBorderColor || 'black' );
                    }
                    if ( attr.textFillGradient ) {
                        var gr = attr.textFillGradient;
                        if ( typeof(gr)=='string' && gr.substring( 0, 16 )=='linear-gradient(' && gr.substring( gr.length-1 )==')' )
                            gradient = createLinearGradient( gr.substring( 16, gr.length-1 ), width, height );
                    }
                    if ( attr.textShadow || attr.textFilter ) {
                        var filterWidth = parseFloat( textArea.getAttribute( 'width' ) );
                        var filterHeight = parseFloat( textArea.getAttribute( 'height' ) ) * 1.1;
                        if ( attr.textShadow )
                            filter = createFilterForTextShadow( attr.textShadow, filterWidth, filterHeight );
                        else
                            filter = attr.textFilter.get( filterWidth, filterHeight );
                    }
                }
                if ( gradient ) {
                    g2.appendChild( gradient );
                    g.setAttribute( 'fill', 'url(#'+gradient.id+')' );
                }
                if ( filter ) {
                    g2.appendChild( filter );
                    g.setAttribute( 'filter', 'url(#'+filter.id+')' );
                }
            });
            g2 = layer.g2();
            g2.appendChild( textArea );
            g = jSignage._createElement( 'g' );
            g2.appendChild( g );
        }
        return layer;
    },

    getGG: function( textArea ) {
        if ( jSignage.features.textArea )
            return textArea;
        var gg = textArea.nextElementSibling;
        if ( !gg || gg.localName!='g' )
            return null;
        return gg;
    },

    getTextAreaHeight: function( textArea, futureParent ) {
        var textHeight = 0;
        var oldHeight = textArea.getAttribute( 'height' );
        textArea.setAttribute( 'height', 'auto' );
        if ( jSignage.features.textArea ) {
            if ( futureParent ) {
                var oldParent = textArea.parentNode, oldPlace = textArea.nextElementSibling;
                futureParent.appendChild( textArea );
            }
            var bbox = textArea.getBBox();
            if ( bbox )
                textHeight = bbox.height;
            if ( futureParent ) {
                futureParent.removeChild( textArea );
                if ( oldParent )
                    oldParent.insertBefore( textArea, oldPlace );
            }
        } else {
            textHeight = layoutTextInAnArea( textArea.parentNode, futureParent );
        }
        textArea.setAttribute( 'height', oldHeight );
        return textHeight;
    },

    getTextAreaWidth: function( textArea, futureParent ) {
        var textWidth = 0;
        var oldWidth = textArea.getAttribute( 'width' );
        textArea.setAttribute( 'width', 'auto' );
        if ( jSignage.features.textArea ) {
            if ( futureParent ) {
                var oldParent = textArea.parentNode, oldPlace = textArea.nextElementSibling;
                futureParent.appendChild( textArea );
            }
            var bbox = textArea.getBBox();
            if ( bbox )
                textWidth = bbox.width;
            if ( futureParent ) {
                futureParent.removeChild( textArea );
                if ( oldParent )
                    oldParent.insertBefore( textArea, oldPlace );
            }
        } else {
            textWidth = layoutTextInAnArea( textArea.parentNode, futureParent );
        }
        textArea.setAttribute( 'width', oldWidth );
        return textWidth;
    },

    getPercent: function( val, def ) {
        if ( def===undefined )
            def=0;
        if ( val===undefined || val===null )
            return def;
        val = val+'';
        var r = parseFloat( val );
        if ( isNaN(r) )
            return def;
        if ( val.charAt(val.length-1)=='%' )
            r /= 100;
        return r;
    },

    _appendStops: function( gradient, stops ) {
        for ( var i=0; i<stops.length; i++ ) {
            var s = stops[i];
            var stop = jSignage._createElement( 'stop', { offset: s.offset, 'stop-color': s.color } );
            if ( 'opacity' in s )
                stop.setAttribute( 'stop-opacity', s.opacity );
            gradient.appendChild( stop );
        }
    },

    _linearGradient: function( args ) {
        var gradient = jSignage._createElement( 'linearGradient', {
            gradientUnits: args.gradientUnits || 'userSpaceOnUse',
            x1: args.x1 || 0,
            y1: args.y1 || 0,
            x2: args.x2 || 0,
            y2: args.y2 || 0
        } );
        gradient.id = args.id || jSignage.guuid();
        jSignage._appendStops( gradient, args.stops || [ ] );
        return gradient;
    },

    linearGradient: function( args ) {
        return jSignage( jSignage._linearGradient( args ) );
    },

    _radialGradient: function( args ) {
        var gradient = jSignage._createElement( 'radialGradient', {
            gradientUnits: args.gradientUnits || 'userSpaceOnUse',
            cx: args.cx || 0,
            cy: args.cy || 0,
            r: args.r || 0
        });
        gradient.id = args.id || jSignage.guuid();
        jSignage._appendStops( gradient, args.stops || [ ] );
        return gradient;
    },

    radialGradient: function( args ) {
        return jSignage( jSignage._radialGradient( args ) );
    },

    _solidColor: function( color, opacity ) {
        if ( opacity===undefined ) opacity = 1;
        var solidColor = jSignage._createElement( 'solidColor', { 'solid-color': color, 'solid-opacity': opacity } );
        solidColor.id = jSignage.guuid();
        return solidColor;
    },

    solidColor: function( color, opacity ) {
        return jSignage( jSignage._solidColor( color, opacity ) );
    },

    _makeShape: function( name, attr, args ) {
        jSignage.copyProps( args, attr, shapeProps );
        var elem = jSignage._createElement( name, attr );
        elem.id = args && args.id ? args.id : jSignage.guuid();
        return jSignage( elem );
    },

    _findSMILContainer: function( elem ) {
        for( ancestor=elem; ancestor!=null; ancestor=ancestor.parentNode ) {
            var real = jSignage.getRealMediaTarget(ancestor);
            if ( jSignage.isLayer( real ) )
                return jSignage.getTimingElement( real );
        }
        return null;
    },

    _addAnimate: function( target, name, attributeName, args, args2 ) {
        var attr = { }, trigger;
        if ( args.values ) attr.values = args.values.join( ';' );
        if ( args.keyTimes ) attr.keyTimes = args.keyTimes.join( ';' );
        if ( args.keySplines ) attr.keySplines = args.keySplines.join( ';' );
        if ( attributeName )
            attr.attributeName = attributeName;
        jSignage.copyProps( args, attr, animateProps );
        if ( args2 ) for ( var key in args2 ) attr[key] = args2[key];
        if ( args.begin=='indefinite' ) {
            attr.begin = 'indefinite';
        } else {
            var timingElement = jSignage._findSMILContainer( target );
            if ( timingElement )
                attr.begin = jSignage.triggerWithOffset( timingElement.id+'.begin', jSignage.durInSeconds( args.begin, 0 ) );
            else
                attr.begin = args.begin || 'indefinite';
        }
        jSignage.svgAnimation( target, name, attr );
    },

    rect: function( args ) {
        var attr = {
            x: args.x || 0,
            y: args.y || 0,
            width: args.width || 0,
            height: args.height || 0
        };
        if ( args.rx ) attr.rx=args.rx;
        if ( args.ry ) attr.ry=args.ry;
        return jSignage._makeShape( 'rect', attr, args );
    },

    circle: function( args ) {
        return jSignage._makeShape( 'circle', {
            cx: args.cx || 0,
            cy: args.cy || 0,
            r: args.r || 0
        }, args );
    },

    ellipse: function( args ) {
        return jSignage._makeShape( 'ellipse', {
            cx: args.cx || 0,
            cy: args.cy || 0,
            rx: args.rx || 0,
            ry: args.ry || 0
        }, args );
    },

    line: function( args ) {
        return jSignage._makeShape( 'line', {
            x1: args.x1 || 0,
            y1: args.y1 || 0,
            x2: args.x2 || 0,
            y2: args.y2 || 0
        }, args );
    },

    polyline: function( args ) {
        return jSignage._makeShape( 'polyline', {
            points: args.points && args.points.join( ' ' ) || ''
        }, args );
    },

    polygon: function( args ) {
        return jSignage._makeShape( 'polygon', {
            points: args.points && args.points.join( ' ' ) || ''
        }, args );
    },

    path: function( args ) {
        var attr = {
            d: args.d || ''
        };
        if ( args.pathLength!==undefined )
            attr.pathLength = args.pathLength;
        return jSignage._makeShape( 'path', attr, args );
    },

    _mkanti: function( ctm, shape, corners, rx, ry, x, y, width, height ) {
        var anti = [], da = [], i, ictm = jSignage.inv( ctm );
       
        var box = wholePixelBox( ctm, ictm, x, y, x+width, y+height );

        if ( shape=='round' ) {
            i = 0;
            if ( !corners || corners[i]=='topLeft' ) {
                da.push( new jSignage.pathData().moveTo( box.x1, y+ry ).lineTo( x, y+ry ).arcTo( rx, ry, 0, 0, 1, x+rx, y ).lineTo( x+rx, box.y1 ).lineTo( box.x1, box.y1 ).close() );
                ++i;
            }
            if ( !corners || corners[i]=='topRight' ) {
                da.push( new jSignage.pathData().moveTo( x+width-rx, box.y1).lineTo( x+width-rx, y ).arcTo( rx, ry, 0, 0, 1, x+width, y+ry ).lineTo( box.x2, y+ry ).lineTo( box.x2, box.y1 ).close() );
                ++i;
            }
            if ( !corners || corners[i]=='bottomRight' ) {
                da.push( new jSignage.pathData().moveTo( box.x2, y+height-ry ).lineTo( x+width, y+height-ry ).arcTo( rx, ry, 0, 0, 1, x+width-rx, y+height ).lineTo( x+width-rx, box.y2 ).lineTo( box.x2, box.y2 ).close() );
                ++i;
            }
            if ( !corners || corners[i]=='bottomLeft' )
                da.push( new jSignage.pathData().moveTo( x+rx, box.y2 ).lineTo( x+rx, y+height ).arcTo( rx, ry, 0, 0, 1, x, y+height-ry ).lineTo( box.x1, y+height-ry ).lineTo( box.x1, box.y2 ).close() );
        } else if ( shape=='snip' ) {
            i = 0;
            if ( !corners || corners[i]=='topLeft' ) {
                da.push( new jSignage.pathData().moveTo( box.x1, y+ry ).lineTo( x+rx, box.y1 ).lineTo( box.x1, box.y1 ).close() );
                ++i;
            }
            if ( !corners || corners[i]=='topRight' ) {
                da.push( new jSignage.pathData().moveTo( x+width-rx, box.y1 ).lineTo( box.x2, y+ry ).lineTo( box.x2, box.y1 ).close() );
                ++i;
            }
            if ( !corners || corners[i]=='bottomRight' ) {
                da.push( new jSignage.pathData().moveTo( box.x2, y+height-ry ).lineTo( x+width-rx, box.y2 ).lineTo( box.x2, box.y2 ).close() );
                ++i;
            }
            if ( !corners || corners[i]=='bottomLeft' )
                da.push( new jSignage.pathData().moveTo( x+rx, box.y2 ).lineTo( box.x1, y+height-ry ).lineTo( box.x1, box.y2 ).close() );
        }
        for ( i=0; i<da.length; i++ )
            anti.push( jSignage._createElement( 'path', { d: da[i].toString() } ) );
        return anti;
    },

    _mksoft: function( ctm, shape, corners, rx, ry, x, y, width, height, thickness, color, opacityIn, opacityOut, nocorner, type ) {
        var g = jSignage._createElement( 'g', {
            transform: 'translate('+x+','+y+')',
            stroke: 'none'
        });
        if ( shape=='square' ) {
            shape = 'round';
            corners = [ ];
        }
        var xtl, ytl, xtr, ytr, xbr, ybr, xbl, ybl, i=0;
        if ( !corners || corners[i]=='topLeft' ) { xtl = rx; ytl = ry; ++i; } else xtl = ytl = nocorner;
        if ( !corners || corners[i]=='topRight' ) { xtr = rx; ytr = ry; ++i; } else xtr = ytr = nocorner;
        if ( !corners || corners[i]=='bottomRight' ) { xbr = rx; ybr = ry; ++i; } else xbr = ybr = nocorner;
        if ( !corners || corners[i]=='bottomLeft' ) { xbl = rx; ybl = ry; ++i; } else xbl = ybl = nocorner;

        function pushStops( stops, offsetIn, offsetOut ) {
            if ( type==='gaussian' ) {
                var curve = [ [ 0, 0 ], [ 0.28, 0.15 ], [ 0.5, 0.5 ], [ 0.72, 0.85 ], [ 1, 1 ] ];
                for ( var i = 0; i < curve.length; i++ ) {
                    var p = curve[i];
                    stops.push({
                        offset: offsetIn + p[0]*(offsetOut-offsetIn),
                        color: color,
                        opacity: opacityIn + p[1]*(opacityOut-opacityIn)
                    });
                }
            } else {
                stops.push( { offset: offsetIn, color: color, opacity: opacityIn } );
                stops.push( { offset: offsetOut, color: color, opacity: opacityOut } );
            }
        }

        ctm = jSignage.mul( ctm, { a:1, b: 0, c: 0, d: 1, e: x, f: y } );
        var ictm = jSignage.inv( ctm );
        var box = wholePixelBox( ctm, ictm, 0, 0, width, height );

        function wholePixel( x, y ) {
            if ( !ictm )
                return { x: x, y: y };
            var px = Math.round( ctm.a * x + ctm.c * y + ctm.e );
            var py = Math.round( ctm.b * x + ctm.d * y + ctm.f );
            return {
                x: ictm.a * px + ictm.c * py + ictm.e,
                y: ictm.b * px + ictm.d * py + ictm.f
            };
        }

        function quad( x1, y1, x2, y2, x3, y3, x4, y4, gx1, gy1, gx2, gy2 ) {
            var stops = [ { offset: 0, color: color, opacity: 0 } ];
            pushStops( stops, 0, 1 );
            var gr = jSignage._linearGradient({ x1: gx1, y1: gy1, x2: gx2, y2: gy2, stops: stops });
            g.appendChild( gr );
            var P1 = wholePixel( x1, y1 ), P2 = wholePixel( x2, y2 ), P3 = wholePixel( x3, y3 ), P4 = wholePixel( x4, y4 );
            var d = new jSignage.pathData();
            d.moveTo( P1.x, P1.y ).lineTo( P2.x, P2.y ).lineTo( P3.x, P3.y ).lineTo( P4.x, P4.y ).close();
            g.appendChild( jSignage._createElement( 'path', {
                d: d.toString(),
                stroke: 'none',
                fill: 'url(#'+gr.id+')'
            } ) );
        }

        function arc( cx, cy, rxi, ryi, rxo, ryo, x1, y1, x2, y2, x3, y3, x4, y4 ) {
            if ( rxo<=0 || ryo<=0 )
                return;
            var r = ( rxo+ryo)/2, gr;
            if ( r <= thickness ) {
                var stops = [];
                pushStops( stops, 0, 1 );
                gr = jSignage._radialGradient({ cx: cx, cy: cy, r: thickness, stops: stops });
            } else {
                var stops = [
                    { offset: 0, color: color, opacity: 0 },
                    { offset: (r-thickness)/r, color: color, opacity: 0 }
                ];
                pushStops( stops, (r-thickness)/r, 1 );
                gr = jSignage._radialGradient({ cx: cx, cy: cy, r: r, stops: stops });
            }
            g.appendChild( gr );

            var d = new jSignage.pathData();
            if ( rxi < rxo && ryi < ryo ) {
                var P0 = wholePixel( cx, cy ), P1 = wholePixel( x1, y1 ), P2 = wholePixel( x2, y2 ), P3 = wholePixel( x3, y3 ), P4 = wholePixel( x4, y4 );
                d.moveTo( P0.x, P0.y ).lineTo( P1.x, P1.y ).lineTo( P2.x, P2.y ).arcTo( rxi, ryi, 0, 0, 0, P3.x, P3.y ).lineTo( P4.x, P4.y ).close();
            } else {
                var P0 = wholePixel( cx, cy ), P1 = wholePixel( x1, y1 ), P4 = wholePixel( x4, y4 );
                d.moveTo( P0.x, P0.y ).lineTo( P1.x, P1.y ).arcTo( rxo, ryo, 0, 0, 0, P4.x, P4.y ).close();
            }
            g.appendChild( jSignage._createElement( 'path', {
                d:  d.toString(),
                stroke: 'none',
                fill: 'url(#'+gr.id+')'
            } ) );
        }

        function trix( rx, ry ) {
            if ( rx==0 && ry==0 )
                return 0;
            var t2 = (ry*ry)/(rx*rx);
            return rx - thickness*( -Math.sqrt(t2/(1+t2 )) + ( 1 - Math.sqrt(1/(1 +t2)) )*rx/ry );
        }

        if ( shape=='round' ) {
            var XTL = xtl ? Math.max( xtl, thickness ) : 0, YTL = ytl ? Math.max( ytl, thickness ) : 0;
            var XTR = xtr ? Math.max( xtr, thickness ) : 0, YTR = ytr ? Math.max( ytr, thickness ) : 0;
            var XBL = xbl ? Math.max( xbl, thickness ) : 0, YBL = ybl ? Math.max( ybl, thickness ) : 0;
            var XBR = xbr ? Math.max( xbr, thickness ) : 0, YBR = ybr ? Math.max( ybr, thickness ) : 0;
            if ( XTL || YTL )
                arc( XTL, YTL, xtl, ytl, XTL, YTL, XTL, box.y1, xtl, box.y1, box.x1, ytl, box.x1, YTL );
            quad( XTL, 0, width-XTR, 0, width-XTR, thickness, XTL, thickness, 0, thickness, 0, 0 );
            if ( XTR || YTR )
                arc( width-XTR, YTR, xtr, ytr, XTR, YTR, box.x2, YTR, box.x2, ytr, width-xtr, box.y1, width-XTR, box.y1 );
            quad( width, YTR, width, height-YBR, width-thickness, height-YBR, width-thickness, YTR, width-thickness, 0, width, 0 );
            if ( XBR || YBR )
                arc( width-XBR, height-YBR, xbr, ybr, XBR, YBR, width-XBR, box.y2, width-xbr, box.y2, box.x2, height-xbr, box.x2, height-XBR );
            quad( width-XBR, height, XBL, height, XBL, height-thickness, width-XBR, height-thickness, 0, height-thickness, 0, height );
            if ( XBL || YBL )
                arc( XBL, height-YBL, xbl, ybl, XBL, YBL, box.x1, height-YBL, box.x1, height-ybl, xbl, box.y2, XBL, box.y2 );
            quad( 0, height-YBL, 0, YTL, thickness, YTL, thickness, height-YBL, thickness, 0, 0, 0 );
        } else if ( shape=='snip' ) {
            var trx=trix(rx,ry)-rx;
            var n = Math.sqrt(trx*trx+thickness*thickness) / Math.sqrt(rx*rx+ry*ry), rxn=rx*n, ryn=ry*n;
            var ixtl = Math.max( trix( xtl, ytl ), thickness ), iytl = Math.max( trix( ytl, xtl ), thickness );
            var ixtr = Math.max( trix( xtr, ytr ), thickness ), iytr = Math.max( trix( ytr, xtr ), thickness );
            var ixbl = Math.max( trix( xbl, ybl ), thickness ), iybl = Math.max( trix( ybl, xbl ), thickness );
            var ixbr = Math.max( trix( xbr, ybr ), thickness ), iybr = Math.max( trix( ybr, xbr ), thickness );
            quad( 0, ytl, thickness, iytl, ixtl, thickness, xtl, 0, xtl+rxn, ryn, xtl, 0 );
            quad( xtl, 0, width-xtr, 0, width-ixtr, thickness, ixtl, thickness, xtl, thickness, xtl, 0 );
            quad( width-xtr, 0, width-ixtr, thickness, width-thickness, iytr, width, ytr, width-rxn, ytr+ryn, width, ytr );
            quad( width-thickness, iytr, width, ytr, width, height-ybr, width-thickness, height-iybr, width-thickness, ytr, width, ytr );
            quad( width, height-ybr, width-thickness, height-iybr, width-ixbr, height-thickness, width-xbr, height, width-xbr-rxn, height-ryn, width-xbr, height );
            quad( width-ixbr, height-thickness, width-xbr, height, xbl, height, ixbl, height-thickness, xbl, height-thickness, xbl, height );
            quad( xbl, height, ixbl, height-thickness, thickness, height-iybl, 0, height-ybl, rxn, height-ybl-ryn, 0, height-ybl );
            quad( thickness, height-iybl, 0, height-ybl, 0, ytl, thickness, iytl, thickness, ytl, 0, ytl );
        }
        return g;
    },

    _computePAR: function( mediaAlign, mediaFit ) {
        var preserveAspectRatio;
        if ( !mediaFit )
            mediaFit = 'meet';
        if ( mediaFit=='fill' ) {
            preserveAspectRatio = 'none';
        } else {
            preserveAspectRatio = mediaAlignToPAR[mediaAlign || 'center'] || 'xMidYMid';
            if ( mediaFit=='slice' )
                preserveAspectRatio += ' slice';
        }
        return preserveAspectRatio;
    },

    _anyMedia: function( name, attr ) {
        var media = jSignage._createElement( name ), layer = null, html5 = false, iframe = null;
        if ( ( name=='image' || name=='iframe' ) && ( !('dur' in attr) || attr.dur=='media' ) && !('repeatDur' in attr) && !('repeatCount' in attr) )
            attr.dur = 'indefinite';
        if ( name == 'iframe' ) {
            if ( 'html' in attr ) {
                html5 = attr.html;
                if ( typeof ( html5 ) == 'object' && html5.jsignage )
                    html5 = html5[0];
                if ( typeof ( html5 ) == 'object' && html5.nodeType )
                    html5 = html5.innerHTML;
                if ( typeof ( html5 ) != 'string' )
                    html5 = '' + html5;
            }
            if ( jSignage.features.iframe ) {
                iframe = media;
                if ( attr.frameWidth && attr.frameWidth != 'auto' )
                    iframe.setAttribute( 'frameWidth', attr.frameWidth );
                if ( 'zoom' in attr ) {
                    var zoom = parseFloat( attr.zoom );
                    if ( isFinite( zoom ) && zoom > 0 && zoom != 100 )
                        iframe.setAttribute( 'zoom', zoom );
                }
                if ( attr.scrollX )
                    iframe.setAttribute( 'scrollX', attr.scrollX );
                if ( attr.scrollY )
                    iframe.setAttribute( 'scrollY', attr.scrollY );
            } else {
                media = jSignage._createElement( 'foreignObject' );
                iframe = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'iframe' );
                iframe.setAttribute( 'width', '100%' );
                iframe.setAttribute( 'height', '100%' );
                iframe.setAttribute( 'seamless', 'true' );
                if ( !html5 )
                    iframe.setAttribute( 'style', 'background-color: white' );
                var body = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'body' );
                body.appendChild( iframe );
                media.appendChild( body );
            }
            iframe.setAttribute( 'scrolling', attr.scrolling || 'no' );
            var sandbox = 'allow-forms';
            if ( attr.javascript != 'disabled' )
                sandbox += ' allow-scripts';
            if ( attr.security == 'disabled' )
                sandbox += ' allow-same-origin allow-top-navigation';
            iframe.setAttribute( 'sandbox', sandbox );
            if ( !html5 )
                iframe.setAttribute( 'src', attr.href || attr.src );
        } else {
            if ( 'href' in attr )
                media.setAttributeNS( jSignage.xlinkNS, "xlink:href", attr.href );
        }
        if ( attr.accounting )
            media.setAttributeNS( jSignage.spxNS, "spx:accounting", attr.accounting );
        for ( var key in mediaProps )
            if ( attr[key] )
                media.setAttributeNS( jSignage.svgNS, mediaProps[key], attr[key] );
        if ( attr.spx )
            for ( var key in attr.spx )
                media.setAttributeNS( jSignage.spxNS, "spx:"+key, attr.spx[key] );
        if ( attr.mediaAlign || attr.mediaFit )
            media.setAttribute( 'preserveAspectRatio', jSignage._computePAR( attr.mediaAlign, attr.mediaFit ) );
        var layer = null, layerFit = attr.layerFit || 'none';
        if ( attr.frame || ( name!='image' && name!='iframe' && !jSignage.features[name] ) ) {
            var layer = jSignage._createElement( 'g' );
            layer.setAttributeNS( jSignage.spxNS, 'layer-type', 'media' );
            jSignage.setViewportAttr( layer, attr );
            if ( name!='image' && name!='iframe' && !jSignage.features[name] ) {
                jSignage.addSetForTiming( layer, attr, true, true );
                var timingElement = jSignage.getTimingElement( layer );
                jSignage.beginEvent( timingElement, function() {
                    realizeMedia( timingElement, media );
                });
                jSignage.endEvent( timingElement, function() {
                    unrealizeMedia( media );
                });
                if ( !attr.frame ) {
                    jSignage.postLayoutCallback( layer, function( width, height ) {
                        media.setAttribute( 'width', width );
                        media.setAttribute( 'height', height );
                    });
                }
            } else if ( name=='image' || name=='iframe' ) {
                jSignage.addSetForTiming( layer, attr, true );
            } else {
                jSignage.setTimingAttr( media, attr, true );
                media.id = jSignage.guuid();
                if ( !jSignage.timeline ) {
                    layer.setAttribute( 'display', 'none' );
                    var set = jSignage._createElement( "set", { attributeName: 'display', to: 'inherit', begin: media.id+'.begin', end: media.id+'.end' } );
                    set.id = jSignage.guuid();
                    layer.insertBefore( set, layer.firstElementChild );
                }
            }
            jSignage.addFrame( layer, attr, null, media );
            layer = jSignage( layer );
        } else {
            jSignage.setViewportAttr( media, attr );
            if ( name=='image' || name=='iframe' )
                jSignage.addSetForTiming( media, attr );
            else
                jSignage.setTimingAttr( media, attr, true );
            layer = jSignage(media);
        }
        if ( layerFit!='none' && window.Image && name!='iframe' ) {
            var layerAlign = attr.layerAlign || 'center';
            var chainedCallback = jSignage.postLayoutCallback( layer[0], function( width, height, x, y, bbw, bbh, parent ) {
                var img = new Image(), elem = this, tx = 0, ty = 0;
                img.src = attr.href;
                img.onload = function() {
                    var img_ratio = img.width/img.height, layer_ratio = width/height;
                    if ( ( layerFit=='horizontal' || layerFit=='both' ) && img_ratio < layer_ratio ) {
                        var new_width = height * img_ratio;
                        if ( layerAlign=='topRight' || layerAlign=='midRight' || layerAlign=='bottomRight' )
                            tx = width - new_width;
                        else if ( layerAlign!='topLeft' && layerAlign!='midLeft' && layerAlign!='bottomLeft' )
                            tx = ( width - new_width ) /2;
                        elem.setAttributeNS( null, 'width', new_width );
                        width = new_width;
                    }
                    if ( ( layerFit=='vertical' || layerFit=='both' ) && img_ratio > layer_ratio ) {
                        var new_height = width / img_ratio;
                        if ( layerAlign=='bottomLeft' || layerAlign=='bottomMid' || layerAlign=='bottomRight' )
                            ty = height - new_height;
                        else if ( layerAlign!='topLeft' && layerAlign!='topMid' && layerAlign!='topRight' )
                            ty = ( height - new_height ) / 2;
                        elem.setAttributeNS( null, 'height', new_height );
                        height = new_height;
                    }
                    if ( tx || ty )
                        elem.setAttribute( 'transform', 'translate(' + tx + ',' + ty + ') ' + elem.getAttribute( 'transform' ) );
                    if ( chainedCallback )
                        chainedCallback.call( elem, width, height, x+tx, y+ty, bbw, bbh, parent );
                };
                img.onerror = function() {
                    if ( chainedCallback )
                        chainedCallback.call( elem, width, height, x, y, bbw, bbh, parent );
                };
            });
        } else if ( html5!==false || (name == 'iframe' && !jSignage.features.iframe && attr.frameWidth && attr.frameWidth != 'auto')) {
            var chainedCallback = jSignage.postLayoutCallback( layer[0], function( width, height, x, y, bbw, bbh, parent ) {
                var elem = this;
                var textAlign = attr.textAlign || 'center';
                var verticalAlign = attr.verticalAlign || 'middle';
                var frameWidth = width, frameHeight = height;
                if ( name == 'iframe' && !jSignage.features.iframe && attr.frameWidth && attr.frameWidth != 'auto' ) {
                    var frameWidth = parseFloat( attr.frameWidth );
                    if ( isFinite( frameWidth ) && frameWidth > 0 && width > 0 ) {
                        frameWidth = Math.ceil( frameWidth );
                        var scale = width / attr.frameWidth;
                        frameHeight = height / scale;
                        if ( !jSignage.features.iframe ) {
                            elem.setAttribute( 'width', frameWidth );
                            elem.setAttribute( 'height', frameHeight );
                            elem.setAttribute( 'transform', 'scale(' + scale + ')' );
                        }
                    }
                }
                if ( html5 !== false ) {
                    var srcdoc = '<!DOCTYPE html>\r\n'
                               + '<body style="margin: 0; width: ' + frameWidth + 'px; height: ' + frameHeight + 'px; display: table">\r\n'
                               + '<div style="display: table-cell; text-align: ' + textAlign + '; vertical-align: ' + verticalAlign + '">'
                               + html5
                               + '</div>\r\n'
                               + '</body>\r\n';
                    iframe.setAttribute( 'srcdoc', srcdoc );
                }
                if ( chainedCallback )
                    chainedCallback.call( elem, width, height, x, y, bbw, bbh, parent );
            });
        }
        return layer;
    },

    image: function( attr ) { return jSignage._anyMedia( "image", attr ); },

    video: function( attr ) { return jSignage._anyMedia( "video", attr ); },

    audio: function( attr ) { return jSignage._anyMedia( "audio", attr ); },

    animation: function( attr ) { return jSignage._anyMedia( "animation", attr ); },

    iframe: function( attr ) { return jSignage._anyMedia( "iframe", attr ); },

    media: function( attr ) {
        if ( !('href' in attr ) )
            return jSignage.animation( attr );
        var lastDotPos = attr.href.lastIndexOf( '.' );
        if ( lastDotPos < 0 )
            return jSignage.animation( attr );
        var type = extensionToType[ attr.href.substring( lastDotPos+1 ).toLowerCase() ];
        if ( type===0 )
            return jSignage.image( attr );
        else if ( type===1 )
            return jSignage.video( attr );
        else if ( type===2 )
            return jSignage.audio( attr );
        else if ( type===3 )
            return jSignage.animation( attr );
        else if ( type===4 )
            return jSignage.iframe( attr );
        return jSignage.animation( attr );
    },

    tspan: function( text, attr ) {
        return new jSignage._textAccu().tspan( text, attr );
    },

    tbreak: function( attr ) {
        return new jSignage._textAccu().tbreak( attr );
    },

    _textAccu: function() {
    },

    clone: function ( elem, dataAndEvents, deepDataAndEvents ) {
        var clone;

        if ( jSignage.isArray( elem ) ) {
            clone = [];
            for ( var i = 0; i < elem.length; i++ )
                clone.push( elem[i].cloneNode( true ) );
        } else {
            clone = elem.cloneNode( true );
        }

        // Copy the events from the original to the clone
        if ( dataAndEvents ) {
            if ( deepDataAndEvents ) {
                var srcElements = getAll( elem );
                var destElements = getAll( clone );

                for ( var i = 0; ( node = srcElements[i] ) != null; i++ ) {
                    cloneCopyEvent( node, destElements[i] );
                }
            } else {
                cloneCopyEvent( elem, clone );
            }
        }

        return clone;
    },

    guessSlideDur: function( ctor, args, defaultDur ) {
        if ( ctor=='media' && args.href ) {
            var lastDotPos = args.href.lastIndexOf( '.' );
            if ( lastDotPos >= 0 && extensionToType[ args.href.substring( lastDotPos+1 ).toLowerCase() ]===0 )
                ctor = 'image';
        }
        if ( ctor=='image' || jSignage._isTextAreaLayer( ctor ) || ctor=='iframe' )
            return args && 'dur' in args ? jSignage.durInSeconds( args.dur, defaultDur ) : defaultDur;
        if ( args && ( args.dur=='indefinite' || args.repeatDur=='indefinite' || args.repeatCount=='indefinite' ) )
            return defaultDur;
        if ( args ) {
            var repeatDur = jSignage.durInSeconds( args.repeatDur );
            var dur = jSignage.durInSeconds( args.dur, -1 );
            if ( dur === 0 )
                return 0;
            var repeatCount = 'repeatCount' in args ? parseFloat( args.repeatCount ) : 0;
            if ( isNaN(repeatCount) || repeatCount <= 0 )
                repeatCount = 0;
            if ( repeatCount === 0 ) {
                if ( repeatDur > 0 )
                    return repeatDur;
                if ( dur > 0 )
                    return dur;
            }
            if ( repeatCount > 0 && dur > 0 ) {
                var p2 = dur * repeatCount;
                return repeatDur > 0 && repeatDur < p2 ? repeatDur : p2;                
            }
        }
        return 'media';
    },

    geometryCallback: function( layer, callback ) {
        var layer = jSignage.getRealMediaTarget( layer );
        if ( jSignage.isInRenderingTree( layer ) ) {
            var x = parseFloat( layer.getAttributeNS( jSignage.spxNS, 'left' ) );
            var y = parseFloat( layer.getAttributeNS( jSignage.spxNS, 'top' ) );
            var w = parseFloat( layer.getAttributeNS( jSignage.spxNS, 'width' ) );
            var h = parseFloat( layer.getAttributeNS( jSignage.spxNS, 'height' ) );
            if ( isFinite(x) && isFinite(y) && isFinite(w) && isFinite(h) )
                callback( x, y, w, h );
        } else {
            var chainedCallback = jSignage.postLayoutCallback( layer, function( width, height, x, y, bbw, bbh, parent ) {
                callback( x, y, width, height );
                if ( chainedCallback )
                    chainedCallback.call( this, width, height, x, y, bbw, bbh, parent );
            });
        }
    }

});

jSignage._textAccu.prototype = new Array();

jSignage.extend( jSignage._textAccu.prototype, {
    tspan: function( text, attr ) {
        var obj = { };
        if ( attr )
            for ( var x in attr )
                obj[x] = attr[x];
        obj.text = text;
        this.push( obj );
        return this;
    },

    tbreak: function( attr ) {
        return this.tspan( '\n', attr );
    }
});

jSignage.fn.extend({
    eachMedia: function( callback ) {
        return this.each( function() {
            var media = jSignage.getRealMediaTarget( this );
            if ( jSignage._isTextAreaLayer( media.getAttributeNS( $.spxNS, 'layer-type' ) ) ) {
                media = jSignage.getG2( media );
                if ( media.localName=='g' ) {
                    for ( var x=media.firstElementChild; x;  x=x.nextElementSibling ) {
                        if ( x.localName=='textArea' || x.localName=='text' ) {
                            media = x;
                            break;
                        }
                    }
                }
            }
            callback.call(media);
        } );
    },

	text: function( text ) {
		if ( jSignage.isFunction(text) ) {
			return this.each(function(i) {
				var self = jSignage( this );
				self.text( text.call(this, i, self.text()) );
			});
		}

		if ( text!==undefined ) {
            var first = true;

            function addSpan( textElem, t, withBreaks, nofill ) {
                if ( jSignage.type(t)==="object" ) {
                    var tspanAttr = { }, text = '';
                    jSignage.copyProps( t, tspanAttr, tspanProps );
                    if ( nofill )
                        delete tspanAttr.fill;
                    if ( t.text!==undefined )
                        text = String(t.text);
                    if ( text.length==0 ) {
                        var tspan = jSignage._createElement( 'tspan', tspanAttr );
                        if ( t.id && first ) {
                            tspan.id = t.id;
                            first = false;
                        }
                        textElem.appendChild( tspan );
                    } else {
                        for ( var pos=0; pos < text.length; ) {
                            var cr = text.indexOf( '\r', pos );
                            var lf = text.indexOf( '\n', pos );
                            var newLine = cr==-1 ? lf : lf==-1 ? cr : cr < lf ? cr : lf;
                            if ( newLine<0 || !withBreaks )
                                newLine = text.length;
                            if ( newLine > pos ) {
                                var tspan = jSignage._createElement( 'tspan', tspanAttr );
                                if ( t.id && first ) {
                                    tspan.id = t.id;
                                    first = false;
                                }
                                tspan.textContent = text.substring( pos, newLine );
                                textElem.appendChild( tspan );
                            }
                            if ( newLine < text.length ) {
                                var tspan = jSignage._createElement( 'tspan', tspanAttr );
                                if ( t.id && first ) {
                                    tspan.id = t.id;
                                    first = false;
                                }
                                tspan.appendChild( jSignage._createElement( 'tbreak' ) );
                                textElem.appendChild( tspan );
                                if ( newLine==cr && lf==cr+1 )
                                    ++newLine;
                            }
                            pos = newLine+1;
                        }
                    }
                } else {
                    if ( typeof t != 'string' )
                        t = '' + t;
                    for ( var pos=0; pos < t.length; ) {
                        var cr = t.indexOf( '\r', pos );
                        var lf = t.indexOf( '\n', pos );
                        var newLine = cr==-1 ? lf : lf==-1 ? cr : cr < lf ? cr : lf;
                        if ( newLine<0 || !withBreaks )
                            newLine = t.length;
                        if ( newLine > pos ) {
                            var tspan = jSignage._createElement( 'tspan' );
                            tspan.textContent = t.substring( pos, newLine );
                            textElem.appendChild( tspan );
                        }
                        if ( newLine < t.length ) {
                            var tbreak = jSignage._createElement( 'tbreak' );
                            textElem.appendChild( tbreak );
                            if ( newLine==cr && lf==cr+1 )
                                ++newLine;
                        }
                        pos = newLine+1;
                    }
                }
            }

            return this.eachMedia( function() {
                if ( this.localName=='text' ) {
                    if ( ( jSignage.type(text)==="object" && ( text.constructor===jSignage._textAccu || text.constructor===Array ) ) || jSignage.isArray( text ) ) {
                        this.textContent = '';
                        for ( var i=0; i<text.length; i++ )
                            addSpan( this, text[i], false, false );
                    } else if ( jSignage.type(text)==="object" ) {
                        this.textContent = '';
                        addSpan( this, text, false, false );
                    } else {
                        this.textContent = text;
                    }
                } else if ( this.localName=='textArea' ) {
                    var others = [];
		            for ( var x=this.firstElementChild; x; x=x.nextElementSibling )
		                if ( x.localName!='tspan' && x.localName!='tbreak' )
		                    others.push( x );
		            this.textContent = '';
		            for ( var i=0; i<others.length; i++ )
		                this.appendChild( others[i] );
		            var nofill = this.getAttribute( 'fill' ).substring( 0, 4 )=='url(';
                    if ( ( jSignage.type(text)==="object" && ( text.constructor===jSignage._textAccu || text.constructor===Array ) ) || jSignage.isArray( text ) ) {
                        for ( var i=0; i<text.length; i++ )
                            addSpan( this, text[i], true, nofill );
                    } else {
                        addSpan( this, text, true, nofill );
                    }
                    if ( !jSignage.features.textArea && jSignage.isInRenderingTree(this) )
                        layoutTextInAnArea( this.parentNode, null );
                } else {
                    this.textContent = text;
                }
            });
        }

		return jSignage.text( this );
	},

    ref: function() {
        return 'url(#' + this[0].id + ')';
    },

    animateColor: function( attributeName, args ) {
        var target = this[0];
        var parentName = this[0] && this[0].localName;
        if ( args===undefined ) {
            args = attributeName;
            if ( parentName==='solidColor' )
                attributeName = 'solid-color';
            else if ( parentName==='stop' || parentName==='linearGradient' || parentName==='radialGradient' )
                attributeName = 'stop-color';
            else if ( parentName==='text' || parentName==='textArea' || parentName==='tspan' )
                attributeName = 'fill';
            else
                attributeName = 'color';
        } else if ( parentName==='linearGradient' || parentName==='radialGradient' ) {
            var idx = 0;
            for ( var child = this[0].firstElementChild; child; child=child.nextElementSibling ) {
                if ( child.localName=='stop' ) {
                    target = child;
                    if ( ++idx > attributeName )
                        break;
                }
            }
            attributeName = 'stop-color';
        }
        jSignage._addAnimate( target, 'animateColor', attributeName, args );
        return this;
    },

    animateOpacity: function( attributeName, args ) {
        var target = this[0];
        if ( args===undefined ) {
            var parentName = this[0] && this[0].localName;
            args = attributeName;
            if ( parentName==='solidColor' )
                attributeName = 'solid-opacity';
            else if ( parentName==='stop' || parentName==='linearGradient' || parentName==='radialGradient' )
                attributeName = 'stop-opacity';
            else if ( parentName==='text' || parentName==='textArea' || parentName==='tspan' )
                attributeName = 'fill-opacity';
            else
                attributeName = 'opacity';
        } else if ( attributeName=='fill' ) {
            attributeName = 'fill-opacity';
        } else if ( attributeName=='stroke' ) {
            attributeName = 'stroke-opacity';
        } else {
            var parentName = this[0] && this[0].localName;
            if ( parentName==='linearGradient' || parentName==='radialGradient' ) {
                var idx = 0;
                for ( var child = this[0].firstElementChild; child; child=child.nextElementSibling ) {
                    if ( child.localName=='stop' ) {
                        target = child;
                        if ( ++idx > attributeName )
                            break;
                    }
                }
                attributeName = 'stop-opacity';
            }
        }
        jSignage._addAnimate( target, 'animate', attributeName, args );
        return this;
    },

    animateZoom: function( args ) {
        var targs = { additive: 'sum' };
        jSignage.copyProps( args, targs, timingProps );
        var layer = this[0];
        jSignage.geometryCallback( layer, function( x, y, w, h ) {
            var cx = w/2, cy = h/2;
            targs.to = targs.from = cx + ',' + cy;
            jSignage._addAnimate( layer, 'animateTransform', 'transform', targs, { type: 'translate' } );
            jSignage._addAnimate( layer, 'animateTransform', 'transform', args, {
                type: 'scale',
                additive: 'sum'
            });
            targs.to = targs.from = (-cx) + ',' + (-cy);
            jSignage._addAnimate( layer, 'animateTransform', 'transform', targs, { type: 'translate' } );
        });
        return this;
    },

    animateRotate: function( args ) {
        var targs = { additive: 'sum' };
        jSignage.copyProps( args, targs, timingProps );
        var layer = this[0];
        jSignage.geometryCallback( layer, function( x, y, w, h ) {
            var cx = w/2, cy = h/2;
            targs.to = targs.from = cx + ',' + cy;
            jSignage._addAnimate( layer, 'animateTransform', 'transform', targs, { type: 'translate' } );
            jSignage._addAnimate( layer, 'animateTransform', 'transform', args, {
                type: 'rotate',
                additive: 'sum'
            });
            targs.to = targs.from = (-cx) + ',' + (-cy);
            jSignage._addAnimate( layer, 'animateTransform', 'transform', targs, { type: 'translate' } );
        });
        return this;
    },

    animateMotion: function( args ) {
        var attr = { };
        if ( args.path ) attr.path = args.path;
        if ( args.keyPoints ) attr.keyPoints = args.keyPoints.join( ';' );
        if ( args.rotate ) attr.rotate = args.rotate;
        jSignage._addAnimate( this[0], 'animateMotion', null, args, attr );
        return this;
    }
});

})();

// Basic transitions and effects

(function(){

var blurOrientations = [ 'vertical', 'horizontal', 'isotropic' ];

function blurPostLayout( orientation, reverse, begin, dur, inner, width, height, fade, fx1, fy1, fx2, fy2 ) {
    if ( orientation=='random' )
        orientation = jSignage.randomChoice( blurOrientations );
    var stdDevX, stdDevY;
    if ( orientation=='horizontal' ) {
        stdDevX = 40;
        stdDevY = 0;
    } else if ( orientation=='vertical' ) {
        stdDevX = 0;
        stdDevY = 40;
    } else {
        stdDevX = 40;
        stdDevY = 40;
    }
    var D = jSignage._createElement( 'defs' );
    this.appendChild( D );    
    var F = jSignage._createElement( 'filter', {
        filterUnits: 'userSpaceOnUse',
        x: fx1-3*stdDevX,
        y: fy1-3*stdDevY,
        width: fx2-fx1+6*stdDevX,
        height: fy2-fy1+6*stdDevY
    });
    F.id = jSignage.guuid();
    var G = jSignage._createElement( 'feGaussianBlur' );
    F.appendChild( G );
    D.appendChild( F );
    jSignage.svgAnimation( this, 'set', {
        attributeName: 'filter',
        to: 'url(#'+F.id+')',
        begin: begin,
        dur: dur
    });
    jSignage.svgAnimation( G, 'animate', {
        attributeName: 'stdDeviation',
        from : reverse ? '0,0' : stdDevX+','+stdDevY,
        to : reverse ? stdDevX+','+stdDevY : '0,0',
        calcMode: 'spline',
        keySplines: reverse ? '0.25,0.75,0.25,0.75' : '0.75,0.25,0.75,0.25',
        begin: begin,
        dur: dur
    });
    var C = jSignage._createElement( 'clipPath' );
    C.id = jSignage.guuid();
    C.appendChild( jSignage._createElement( 'rect', {
        x: fx1,
        y: fy1,
        width: fx2-fx1,
        height: fy2-fy1
    }));
    D.appendChild( C );
    jSignage.svgAnimation( this, 'set', {
        attributeName: 'clip-path',
        to: 'url(#'+C.id+')',
        begin: begin,
        dur: dur
    });
    if ( fade===2 ) {
        jSignage.svgAnimation( this, 'animate', {
            attributeName: 'opacity',
            from: reverse ? 1 : 0,
            to: reverse ? 0 : 1,
            begin: begin,
            dur: dur
        });
    } else if ( fade ) {
        jSignage.svgAnimation( this, 'animate', {
            attributeName: 'opacity',
            values: reverse ? '1;1;0' : '0;1;1',
            keyTimes: reverse ? '0;0.65;1' : '0;0.35;1',
            begin: begin,
            dur: dur
        });
    }
    jSignage.svgAnimation( this, 'animateTransform', {
        attributeName: 'transform',
        type: 'translate',
        additive: 'sum',
        values: ((fx2-fx1)/2)+','+((fy2-fy1)/2)+';'+((fx2-fx1)/2)+','+((fy2-fy1)/2),
        begin: begin,
        dur: dur,
        href: '#'+inner.id
    });
    jSignage.svgAnimation( this, 'animateTransform', {
        attributeName: 'transform',
        type: 'scale',
        additive: 'sum',
        from: reverse ? '1,1' : (1+3*stdDevX/width)+','+(1+3*stdDevY/height),
        to: reverse ? (1+3*stdDevX/width)+','+(1+3*stdDevY/height) : '1,1',
        begin: begin,
        dur: dur,
        href: '#'+inner.id
    });
    jSignage.svgAnimation( this, 'animateTransform', {
        attributeName: 'transform',
        type: 'translate',
        additive: 'sum',
        values: ((fx1-fx2)/2)+','+((fy1-fy2)/2)+';'+((fx1-fx2)/2)+','+((fy1-fy2)/2),
        begin: begin,
        dur: dur,
        href: '#'+inner.id
    });
}

var slideDirections = [ 'rightToLeft', 'leftToRight', 'bottomToTop', 'topToBottom' ];

function slidePostLayout( direction, reverse, begin, dur, inner, fx1, fy1, fx2, fy2 ) {
    var x0=0, y0=0, x1=0, y1=0, width = fx2-fx1, height = fy2-fy1;
    if ( direction=='random' )
        direction = jSignage.randomChoice( slideDirections );
    if ( reverse ) {
        if ( direction=='rightToLeft' )
            x1 = -width;
        else if ( direction=='leftToRight' )
            x1 = width;
        else if ( direction=='bottomToTop' )
            y1 = -height;
        else if ( direction=='topToBottom' )
            y1 = height;
    } else {
        if ( direction=='rightToLeft' )
            x0 = width;
        else if ( direction=='leftToRight' )
            x0 = -width;
        else if ( direction=='bottomToTop' )
            y0 = height;
        else if ( direction=='topToBottom' )
            y0 = -height;
    }
    var clipPath = jSignage._createElement( "clipPath" );
    clipPath.id = jSignage.guuid();
    var clipRect = { x: fx1, y: fy1, width: fx2-fx1, height: fy2-fy1 };
    clipPath.appendChild( jSignage._createElement( "rect", clipRect ) );
    this.appendChild( clipPath );
    jSignage.svgAnimation( this, 'set', {
        attributeName: 'clip-path',
        to: 'url(#'+clipPath.id+')',
        fill: reverse ? 'freeze' : 'remove',
        begin: begin,
        dur: dur
    });
    jSignage.svgAnimation( this, 'animateTransform', {
        attributeName: 'transform',
        additive: 'sum',
        type: 'translate',
        from: x0+','+y0,
        to: x1+','+y1,
        begin: begin,
        dur: dur,
        fill: reverse ? 'freeze' : 'remove',
        href: '#'+inner.id
    });
}

var flyDirections = slideDirections;

function flyPostLayout( direction, acceleration, reverse, begin, dur, inner, fx1, fy1, fx2, fy2, x, y, bbw, bbh ) {
    var dx = 0, dy = 0;
    if ( direction=='random' )
        direction = jSignage.randomChoice( flyDirections );
    if ( ( !reverse && direction=='leftToRight' ) || ( reverse && direction=='rightToLeft' ) )
        dx = -x-(fx2-fx1);
    else if ( ( !reverse && direction=='rightToLeft' ) || ( reverse && direction=='leftToRight' ) )
        dx = bbw-x-fx1;
    else if ( ( !reverse && direction=='topToBottom' ) || ( reverse && direction=='bottomToTop' ) )
        dy = -y-(fy2-fy1);
    else if ( ( !reverse && direction=='bottomToTop' ) || ( reverse && direction=='topToBottom' ) )
        dy = bbh-y-fy1;
    var clipPath = jSignage._createElement( "clipPath" );
    clipPath.id = jSignage.guuid();
    clipPath.appendChild( jSignage._createElement( "rect", { x: -x, y: -y, width: bbw, height: bbh } ) );
    this.appendChild( clipPath );
    jSignage.svgAnimation( this, 'set', {
        attributeName: 'clip-path',
        to: 'url(#'+clipPath.id+')',
        fill: reverse ? 'freeze' : 'remove',
        begin: begin,
        dur: dur
    });   
    jSignage.svgAnimation( this, 'animateTransform', {
        attributeName: 'transform',
        additive: 'sum',
        type: 'translate',
        from: reverse ? '0,0' : dx+','+dy,
        to: reverse ? dx+','+dy : '0,0',
        calcMode: 'spline',
        keySplines: reverse ? (1-1/acceleration)+',0,1,'+(1/acceleration) : '0,'+(1-1/acceleration)+','+(1/acceleration)+',1',
        begin: begin,
        dur: dur,
        fill: reverse ? 'freeze' : 'remove',
        href: '#'+inner.id
    });
}

var wipeTypes = [ 'bar', 'box', 'barnDoor', 'iris' ];
var wipeNotBoxTypes = [ 'bar', 'barnDoor', 'iris' ];
var wipeBarSubtypes = slideDirections;
var wipeBoxSubtypes = [ 'topRight', 'bottomRight', 'bottomLeft', 'topCenter', 'rightCenter', 'bottomCenter', 'leftCenter', 'topLeft' ];
var wipeBarndoorSubtypes = [ 'horizontal', 'vertical' ];
var wipeIrisSubtypes = [ 'rectangle' ];

function wipePostLayout( type, subType, reverse, begin, dur, L1, T1, R1, B1 ) {
    var L0=L1, T0=T1, R0=R1, B0=B1;
    if ( type=='random' )
        type = jSignage.randomChoice( wipeTypes );
    else if ( type=='randomNotBox' )
        type = jSignage.randomChoice( wipeNotBoxTypes );        
    if ( type=='bar' ) {
        if ( subType=='random' )
            subType = jSignage.randomChoice( wipeBarSubtypes );
        if ( subType=='rightToLeft' )
            L0 = R0;
        else if ( subType=='topToBottom' )
            B0 = T0;
        else if ( subType=='bottomToTop' )
            T0 = B0;
        else  if ( subType=='leftToRight' )
            R0 = L0;
    } else if ( type=='box' ) {
        if ( subType=='random' )
            subType = jSignage.randomChoice( wipeBoxSubtypes );
        if ( subType=='topRight' ) {
            L0 = R0;
            B0 = T0;
        } else if ( subType=='bottomRight' ) {
            L0 = R0;
            T0 = B0;
        } else if ( subType=='bottomLeft' ) {
            R0 = L0;
            T0 = B0;
        } else if ( subType=='topCenter' ) {
            L0 = R0 = (L0+R0)/2;
            B0 = T0;
        } else if ( subType=='rightCenter' ) {
            L0 = R0;
            T0 = B0 = (T0+B0)/2;
        } else if ( subType=='bottomCenter' ) {
            L0 = R0 = (L0+R0)/2;
            T0 = B0;
        } else if ( subType=='leftCenter' ) {
            R0 = L0;
            B0 = T0 = (B0+T0)/2;
        } else if ( subType=='topLeft' ) {
            R0 = L0;
            B0 = T0;
        }
    } else if ( type=='barnDoor' ) {
        if ( subType=='random' )
            subType = jSignage.randomChoice( wipeBarndoorSubtypes );
        if ( subType=='horizontal' )
            T0 = B0 = (T0+B0)/2;
        else  if ( subType=='vertical' )
            L0 = R0 = (L0+R0)/2;
    } else if ( type=='iris' ) {
        L0 = R0 = (L0+R0)/2;
        T0 = B0 = (T0+B0)/2;
    }
    var clipPath = jSignage._createElement( "clipPath" );
    clipPath.id = jSignage.guuid();
    var clipRect = jSignage._createElement( "rect", { x: L1, y: T1, width: R1-L1, height: B1-T1 } );
    if ( L0!=L1 )
        jSignage.svgAnimation( clipRect, 'animate', {
            attributeName: 'x',
            from: reverse ? L1 : L0,
            to: reverse ? L0 : L1,
            begin: begin,
            dur: dur
        });
    if ( T0!=T1 )
        jSignage.svgAnimation( clipRect, 'animate', {
            attributeName: 'y',
            from: reverse ? T1 : T0,
            to: reverse ? T0 : T1,
            begin: begin,
            dur: dur
        });
    if ( R0-L0!=R1-L1 )
        jSignage.svgAnimation( clipRect, 'animate', {
            attributeName: 'width',
            from: reverse ? R1-L1 : R0-L0,
            to: reverse ? R0-L0 : R1-L1,
            begin: begin,
            dur: dur
        });
    if ( B0-T0!=B1-T1 )
        jSignage.svgAnimation( clipRect, 'animate', {
            attributeName: 'height',
            from: reverse ? B1-T1 : B0-T0,
            to: reverse ? B0-T0 : B1-T1,
            begin: begin,
            dur: dur
        });
    clipPath.appendChild( clipRect );
    this.appendChild( clipPath );
    jSignage.svgAnimation( this, 'set', {
        attributeName: 'clip-path',
        to: 'url(#'+clipPath.id+')',
        begin: begin,
        dur: dur
    });
}

function pagePostLayout( out, trigger, dur, width, height ) {
    jSignage.svgAnimation( this, 'animate', {
        attributeName: 'opacity',
        from: out ? '1' : '0',
        to: out ? '0' : '1',
        begin: trigger,
        dur: dur
    });
    jSignage.svgAnimation( this, 'animateTransform', {
        attributeName: 'transform',
        type: 'translate',
        additive: 'sum',
        values: (width/2)+','+(height/2)+';'+(width/2)+','+(height/2),
        begin: trigger,
        dur: dur
    });
    jSignage.svgAnimation( this, 'animateTransform', {
        attributeName: 'transform',
        type: 'scale',
        additive: 'sum',
        values: out ? '1;0.8' : '0.8;1',
        begin: trigger,
        dur: dur
    });
    jSignage.svgAnimation( this, 'animateTransform', {
        attributeName: 'transform',
        type: 'translate',
        additive: 'sum',
        values: (-width/2)+','+(-height/2)+';'+(-width/2)+','+(-height/2),
        begin: trigger,
        dur: dur
    });
}

var pivotOrientations = [ 'horizontal', 'vertical' ];

function pivotPostLayout( orientation, out, trigger, delay, dur, inner, width, height ) {
    if ( orientation=='random' )
        orientation = jSignage.randomChoice( pivotOrientations );
    jSignage.svgAnimation( this, 'animateTransform', {
        attributeName: 'transform',
        type: 'translate',
        additive: 'sum',
        values: (width/2)+','+(height/2)+';'+(width/2)+','+(height/2),
        begin: trigger,
        dur: dur
    });
    var attr = {
        attributeName: 'transform',
        type: 'scale',
        additive: 'sum',
        begin: trigger,
        dur: dur
    };
    var zero = orientation=='vertical' ? '1,0' : '0,1';
    if ( out ) {
        attr.values = '1,1;'+zero;
    } else if ( delay ) {
        attr.values = zero+';'+zero+';1,1';
        attr.keyTimes = '0;'+delay+';1';
    } else {
        attr.values = zero+';1,1';
    }
    jSignage.svgAnimation( this, 'animateTransform', attr );
    jSignage.svgAnimation( this, 'animateTransform', {
        attributeName: 'transform',
        type: 'translate',
        additive: 'sum',
        values: (-width/2)+','+(-height/2)+';'+(-width/2)+','+(-height/2),
        begin: trigger,
        dur: dur
    });
    if ( delay ) {
        jSignage.svgAnimation( this, 'set', {
            attributeName: 'display',
            to: 'none',
            begin: trigger,
            dur: delay*dur
        });
    }
}

var cubeDirections = [ 'leftToRight', 'rightToLeft', 'topToBottom', 'bottomToTop' ];

function cubePostLayout( direction, out, trigger, dur, inner, width, height ) {
    if ( direction=='random' )
        direction = jSignage.randomChoice( cubeDirections );
    var s0, s1, t0, t1;
    if ( out ) {
        s0 = '1,1';
        if ( direction=='leftToRight' || direction=='rightToLeft' )
            s1 = '0,1';
        else
            s1 = '1,0';
        t0 = '0,0';
        if ( direction=='leftToRight' )
            t1 = width+',0';
        else if ( direction=='topToBottom' )
            t1 = '0,'+height;
        else
            t1 = '0,0';
    } else {
        s1 = '1,1';
        if ( direction=='leftToRight' || direction=='rightToLeft' )
            s0 = '0,1';
        else
            s0 = '1,0';
        t1 = '0,0';
        if ( direction=='rightToLeft' )
            t0 = width+',0';
        else if ( direction=='bottomToTop' )
            t0 = '0,'+height;
        else
            t0 = '0,0';
    }
    if ( t0!=t1 ) {
        jSignage.svgAnimation( this, 'animateTransform', {
            attributeName: 'transform',
            type: 'translate',
            additive: 'sum',
            values: t0+';'+t1,
            calcMode: 'spline',
            keyTimes: '0;1',
            keySplines: '0.5 0 0.5 1',
            begin: trigger,
            dur: dur
        });
    }
    jSignage.svgAnimation( this, 'animateTransform', {
        attributeName: 'transform',
        type: 'scale',
        additive: 'sum',
        values: s0+';'+s1,
        calcMode: 'spline',
        keyTimes: '0;1',
        keySplines: '0.5 0 0.5 1',
        begin: trigger,
        dur: dur
    });
}

function zoomPostLayout( factor, keepZooming, out, trigger, dur, inner, width, height ) {
    if ( !out || !keepZooming ) {
        jSignage.svgAnimation( this, 'animateTransform', {
            attributeName: 'transform',
            type: 'translate',
            additive: 'sum',
            values: (width/2)+','+(height/2)+';'+(width/2)+','+(height/2),
            begin: trigger,
            dur: keepZooming && !out ? 'indefinite' : dur
        });
        if ( keepZooming && !out )
            jSignage.svgAnimation( this, 'animateTransform', {
                attributeName: 'transform',
                type: 'scale',
                additive: 'sum',
                from: factor,
                to: factor+(1-factor)*3600/dur,
                begin: trigger,
                dur: '3600'
            });
        else
            jSignage.svgAnimation( this, 'animateTransform', {
                attributeName: 'transform',
                type: 'scale',
                additive: 'sum',
                from: out ? '1' : factor,
                to: out ? factor : '1',
                begin: trigger,
                dur: dur
            });        
        jSignage.svgAnimation( this, 'animateTransform', {
            attributeName: 'transform',
            type: 'translate',
            additive: 'sum',
            values: (-width/2)+','+(-height/2)+';'+(-width/2)+','+(-height/2),
            begin: trigger,
            dur: keepZooming && !out ? 'indefinite' : dur
        });
    }
    jSignage.svgAnimation( this, 'animate', {
        attributeName: 'opacity',
        from: out ? '1' : '0',
        to: out ? '0' : '1',
        begin: trigger,
        dur: dur
    });
};

var transitionsList = [ 'crossFade', 'slide', 'push', 'wipe', 'flip', 'cubeFace', 'zoom' ]; //, 'blur' ];

jSignage.extend({

    random: function( args ) {
        return function() {
            return jSignage[jSignage.randomChoice(transitionsList)]( args );
        };
    },

    crossFade: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 1 );
        return {
            durIn: dur,
            durExit: dur,
            wrapIn: function( trigger ) {
                jSignage.svgAnimation( this, 'animate', {
                    attributeName: 'opacity',
                    from: '0',
                    to: '1',
                    begin: trigger,
                    dur: dur
                });
            }
        };
    },

    blur: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 1 );
        var orientation = args && args.orientation || 'random';
        var actualOrientation = orientation=='random' ? jSignage.randomChoice( blurOrientations ) : orientation;
        return {
            durIn: dur,
            durExit: dur,
            wrapExit: function( trigger, inner, width, height ) {
                if ( orientation=='random' )
                    actualOrientation = jSignage.randomChoice( blurOrientations );
                blurPostLayout.call( this, actualOrientation, true, trigger, dur, inner, width, height, false, 0, 0, width, height );
            },
            wrapIn: function( trigger, inner, width, height ) {
                blurPostLayout.call( this, actualOrientation, false, trigger, dur, inner, width, height, 2, 0, 0, width, height );
            }
        };
    },

    fade: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 1 );
        if ( args && args.color ) return {
            durIn: dur/2,
            durOut: dur/2,
            wrapIn : function( trigger, inner, width, height ) {
                var rect = jSignage._createElement( 'rect', {
                    width: width,
                    height: height,
                    stroke: 'none',
                    fill: args.color
                } );
                jSignage.svgAnimation( rect, 'animate', {
                    attributeName: 'fill-opacity',
                    from: '1',
                    to: '0',
                    begin: trigger,
                    dur: dur/2,
                    fill: 'freeze'
                });
                this.appendChild( rect );
            },
            wrapOut: function( trigger, inner, width, height ) {
                var rect = jSignage._createElement( 'rect', {
                    width: width,
                    height: height,
                    stroke: 'none',
                    fill: args.color,
                    'fill-opacity': 0
                } );
                jSignage.svgAnimation( rect, 'animate', {
                    attributeName: 'fill-opacity',
                    from: '0',
                    to: '1',
                    dur: dur/2,
                    begin: trigger,
                    fill: 'freeze'
                });
                this.appendChild( rect );
            }
        };
        else return {
            durIn: dur/2,
            durOut: dur/2,
            wrapIn : function( trigger, inner, width, height ) {
                jSignage.svgAnimation( this, 'animate', {
                    attributeName: 'opacity',
                    from: '0',
                    to: '1',
                    begin: trigger,
                    dur: dur/2
                });
            },
            wrapOut: function( trigger, inner ) {
                jSignage.svgAnimation( this, 'animate', {
                    attributeName: 'opacity',
                    from: '1',
                    to: '0',
                    begin: trigger,
                    dur: dur/2
                });
            }
        };
    },

    slide: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var direction = args && args.direction || 'random';
        return {
            durExit: dur,
            durIn: dur,
            wrapIn: function( trigger, inner, width, height ) {
                slidePostLayout.call( this, direction, false, trigger, dur, inner, 0, 0, width, height );
            }
        };
    },

    push: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var direction = args && args.direction || 'random';
        var actualdir = direction=='random' ? jSignage.randomChoice( slideDirections ) : direction;
        return {
            durExit: dur,
            durIn: dur,
            wrapExit: function( trigger, inner, width, height ) {
                if ( direction=='random' )
                    actualdir = jSignage.randomChoice( slideDirections );
                slidePostLayout.call( this, actualdir, true, trigger, dur, inner, 0, 0, width, height );
            },
            wrapIn: function( trigger, inner, width, height ) {
                slidePostLayout.call( this, actualdir, false, trigger, dur, inner, 0, 0, width, height );
            }
        };
    },

    wipe: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var type = args && args.type || 'random';
        var subType = args && args.subType || 'random';
        return {
            durExit: dur,
            durIn: dur,
            wrapIn: function( trigger, inner, width, height ) {
                wipePostLayout.call( this, type, subType, false, trigger, dur, 0, 0, width, height );
            }
        };
    },

    page: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.375 );
        var d1 = dur*2/3, d2 = d1, t2 = dur/3;
        return {
            durExit: d1,
            durIn: dur,
            wrapExit: function( trigger ) {
                jSignage.svgAnimation( this, 'animate', {
                    attributeName: 'opacity',
                    from: '1',
                    to: '0',
                    fill: 'freeze',
                    begin: trigger,
                    dur: d1
                });
            },
            wrapIn: function( trigger, inner, width, height ) {               
                jSignage.svgAnimation( this, 'set', {
                    attributeName: 'opacity',
                    to: '0',
                    begin: trigger,
                    dur: t2
                });
                pagePostLayout.call( this, false, jSignage.triggerWithOffset(trigger,t2), d2, width, height );
            }
        };
    },

    flip: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var orientation = args && args.orientation || 'random';
        var actualOrientation = orientation=='random' ? jSignage.randomChoice( pivotOrientations ) : orientation;
        return {
            durExit: dur/2,
            durIn: dur,
            wrapExit: function( trigger, inner, width, height ) {
                if ( orientation=='random' )  
                    actualOrientation = jSignage.randomChoice( pivotOrientations );
                pivotPostLayout.call( this, actualOrientation, true, trigger, 0, dur/2, inner, width, height );
            },
            wrapIn: function( trigger, inner, width, height ) {
                pivotPostLayout.call( this, actualOrientation, false, trigger, 0.5, dur, inner, width, height );
            }
        };
    },

    cubeFace: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var direction = args && args.direction || 'random';
        var actualDirection = direction=='random' ? jSignage.randomChoice( cubeDirections ) : direction;
        return {
            durExit: dur,
            durIn: dur,
            wrapExit: function( trigger, inner, width, height ) {
                if ( direction=='random' )  
                    actualDirection = jSignage.randomChoice( cubeDirections );
                cubePostLayout.call( this, actualDirection, true, trigger, dur, inner, width, height );
            },
            wrapIn: function( trigger, inner, width, height ) {
                cubePostLayout.call( this, actualDirection, false, trigger, dur, inner, width, height );
            }
        };
    },

    zoom: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 1 );
        var factorIn = 1/(1+jSignage.getPercent( args && args.factorIn, 0.2 ));
        var factorOut = 1+jSignage.getPercent( args && args.factorOut, 0.2 );
        var keepZooming = args && args.keepZooming || false;
        return {
            durOut: dur/2,
            durIn: dur/2,
            wrapIn: function( trigger, inner, width, height ) {
                zoomPostLayout.call( this, factorIn, keepZooming, false, trigger, dur/2, inner, width, height );
            },
            wrapOut: function( trigger, inner, width, height ) {
                zoomPostLayout.call( this, factorOut, keepZooming, true, trigger, dur/2, inner, width, height );
            }
        };
    }
});

jSignage.fn.extend({

    audioFadeIn: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 3 );
        return this.effectIn( function( trigger ) {
            jSignage.svgAnimation( this, 'animate', {
                attributeName: 'audio-level',
                values: '0.004;0.016;0.063;0.11;0.19;0.33;0.58;1',
                keyTimes: '0;0.25;0.5;0.6;0.7;0.8;0.9;1',
                begin: trigger,
                dur: dur
            });
        });
    },

    audioFadeOut: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 3 );
        return this.effectOut( dur, function( trigger ) {
            jSignage.svgAnimation( this, 'animate', {
                attributeName: 'audio-level',
                values: '1;0.58;0.33;0.19;0.11;0.063;0.016;0.004',
                keyTimes: '0;0.1;0.2;0.3;0.4;0.5;0.75;1',
                begin: trigger,
                dur: dur
            });
        });
    },

    fadeIn: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 1 );
        return this.effectIn( function( trigger ) {
            jSignage.svgAnimation( this, 'animate', {
                attributeName: 'opacity',
                from: '0',
                to: '1',
                begin: trigger,
                dur: dur
            });
        });
    },

    fadeOut: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 1 );
        return this.effectOut( dur, function( trigger ) {
            jSignage.svgAnimation( this, 'animate', {
                attributeName: 'opacity',
                from: '1',
                to: '0',
                begin: trigger,
                dur: dur
            });
        });
    },

    blink: function( args ) {
        var offset = jSignage.durInSeconds( args && args.offset, 0);
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var repeatInterval = jSignage.repeatInterval( args, dur );
        var repeatCount = jSignage.repeatCount( args );
        var repeatDur = jSignage.repeatDur( args );
        var opacity = String(args.opacity || 0);
        var op = parseFloat( opacity );
        if ( isNaN(op) ) op = 0;
        if ( op<0.001 )
            op = 0.001;
        return this.effectIn( function( trigger ) {
            attr = {
                attributeName: 'opacity',
                calcMode: 'discrete',
                values: op + ';1',
                keyTimes: '0;'+(dur/repeatInterval),
                begin: jSignage.triggerWithOffset( trigger, offset ),
                dur: repeatInterval
            };
            if ( repeatCount!=1 )
                attr.repeatCount = repeatCount;
            if ( repeatDur!=0 )
                attr.repeatDur = repeatDur;
            jSignage.svgAnimation( this, 'animate', attr );
        });
    },

    nudge: function( args ) {
        if ( !args ) args = { };
        var offset = jSignage.durInSeconds( args.offset, 0);
        var dur = jSignage.durInSeconds( args.dur, 0.5 );
        var repeatInterval = jSignage.repeatInterval( args, dur );
        var repeatCount = jSignage.repeatCount( args );
        var repeatDur = jSignage.repeatDur( args );
        var nudgeX = String(args.nudgeX || 0), nudgeY = String(args.nudgeY || 0), nudgeZ = String(args.nudgeZ || 0), nX, nY, nZ;
        var nX = parseFloat( nudgeX );
        if ( isNaN(nX) ) nX = 0;
        var relX = nudgeX.indexOf('%') >= 0;
        var nY = parseFloat( nudgeY );
        if ( isNaN(nY) ) nY = 0;
        var relY = nudgeY.indexOf('%') >= 0;
        var nZ = parseFloat( nudgeZ );
        if ( isNaN(nZ) ) nZ = 0;
        var relZ = true;
        var t = dur/repeatInterval;

        return this.effectIn( function( trigger, inner, width, height, left, top ) {
            var begin = jSignage.triggerWithOffset( trigger, offset );
            if ( nX!=0 || nY!=0 ) {
                var mX = relX ? nX*width/100 : nX;
                var mY = relY ? nY*height/100 : nY;
                attr = {
                    attributeName: 'transform',
                    type: 'translate',
                    additive: 'sum',
                    values: '0,0;'+mX+','+mY+';0,0;0,0',
                    keyTimes: '0;'+(t/2)+';'+t+';1',
                    begin: begin,
                    dur: repeatInterval
                };
                if ( repeatCount!=1 )
                    attr.repeatCount = repeatCount;
                if ( repeatDur!=0 )
                    attr.repeatDur = repeatDur;
                jSignage.svgAnimation( this, 'animateTransform', attr );
            }
            if ( nZ!=0 ) {
                var mZ = 1+nZ/100;
                var a1 = {
                    attributeName: 'transform',
                    type: 'translate',
                    additive: 'sum',
                    values: (-width/2)+','+(-height/2)+';'+(-width/2)+','+(-height/2),
                    begin: begin,
                    dur: repeatInterval
                };
                var animateTransform = {
                    attributeName: 'transform',
                    type: 'scale',
                    additive: 'sum',
                    values: '1;'+mZ+';1;1',
                    keyTimes: '0;'+(t/2)+';'+t+';1',
                    begin: begin,
                    dur: repeatInterval
                };
                var a2 = {
                    attributeName: 'transform',
                    type: 'translate',
                    additive: 'sum',
                    values: (width/2)+','+(height/2)+';'+(width/2)+','+(height/2),
                    begin: begin,
                    dur: repeatInterval
                };
                if ( repeatCount!=1 ) {
                    a1.repeatCount = repeatCount;
                    animateTransform.repeatCount = repeatCount;
                    a2.repeatCount = repeatCount;
                }
                if ( repeatDur!=0 ) {
                    a1.repeatDur = repeatDur;
                    animateTransform.repeatDur = repeatDur;
                    a2.repeatDur = repeatDur;
                }
                jSignage.svgAnimation( this, 'animateTransform', a2 );
                jSignage.svgAnimation( this, 'animateTransform', animateTransform );
                jSignage.svgAnimation( this, 'animateTransform', a1 );
            }
        });
    },

    blurIn: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 1 );
        var orientation = args && args.orientation || 'random';
        return this.effectIn( function( trigger, inner, width, height, x, y, bbw, bbh, FX1, FY1, FX2, FY2 ) {
            blurPostLayout.call( this, orientation, false, trigger, dur, inner, width, height, true, FX1, FY1, FX2, FY2 );
        });
    },

    blurOut: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 1 );
        var orientation = args && args.orientation || 'random';
        return this.effectOut( dur, function( trigger, inner, width, height, x, y, bbw, bbh, FX1, FY1, FX2, FY2 ) {
            blurPostLayout.call( this, orientation, true, trigger, dur, inner, width, height, true, FX1, FY1, FX2, FY2 );
        });
    },

    slideIn: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var direction = args && args.direction || 'random';
        return this.effectIn( function( trigger, inner, width, height, x, y, bbw, bbh, FX1, FY1, FX2, FY2 ) {
            slidePostLayout.call( this, direction, false, trigger, dur, inner, FX1, FY1, FX2, FY2 );
        });
    },

    slideOut: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var direction = args && args.direction || 'random';
        return this.effectOut( dur, function( trigger, inner, width, height, x, y, bbw, bbh, FX1, FY1, FX2, FY2 ) {
            slidePostLayout.call( this, direction, true, trigger, dur, inner, FX1, FY1, FX2, FY2 );
        });
    },

    wipeIn: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var type = args && args.type || 'random';
        var subType = args && args.subType || 'random';
        return this.effectIn( function( trigger, inner, width, height, x, y, bbw, bbh, FX1, FY1, FX2, FY2 ) {
            wipePostLayout.call( this, type, subType, false, trigger, dur, FX1, FY1, FX2, FY2 );
        });
    },

    wipeOut: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var type = args && args.type || 'random';
        var subType = args && args.subType || 'random';
        if ( type=='bar' ) {
            if ( subType=='rightToLeft' )
                subType='leftToRight';
            else if ( subType=='topToBottom' )
                subType='bottomToTop';
            else if ( subType=='bottomToTop' )
                subType='topToBottom';
            else
                subType='rightToLeft';
        }
        return this.effectOut( dur, function( trigger, inner, width, height, x, y, bbw, bbh, FX1, FY1, FX2, FY2 ) {
            wipePostLayout.call( this, type, subType, true, trigger, dur, FX1, FY1, FX2, FY2 );
        });
    },

    flyIn: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var direction = args && args.direction || 'random';
        var acceleration = args && args.acceleration || '3';
        return this.effectIn( function( trigger, inner, width, height, x, y, bbw, bbh, FX1, FY1, FX2, FY2 ) {
            flyPostLayout.call( this, direction, acceleration, false, trigger, dur, inner, FX1, FY1, FX2, FY2, x, y, bbw, bbh );
        });
    },

    flyOut: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var direction = args && args.direction || 'random';
        var acceleration = args && args.acceleration || '3';
        return this.effectOut( dur, function( trigger, inner, width, height, x, y, bbw, bbh, FX1, FY1, FX2, FY2 ) {
            flyPostLayout.call( this, direction, acceleration, true, trigger, dur, inner, FX1, FY1, FX2, FY2, x, y, bbw, bbh );
        });
    },

    pageIn: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.25 );
        return this.effectIn( function( trigger, inner, width, height ) {
            pagePostLayout.call( this, false, trigger, dur, width, height );
        });
    },

    pageOut: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.25 );
        return this.effectOut( dur, function( trigger, inner, width, height ) {
            pagePostLayout.call( this, true, trigger, dur, width, height );
        });
    },
    
    pivotIn: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var orientation = args && args.orientation || 'random';
        return this.effectIn( function( trigger, inner, width, height, x, y, bbw, bbh ) {
            pivotPostLayout.call( this, orientation, false, trigger, 0, dur, inner, width, height );
        });
    },

    pivotOut: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var orientation = args && args.orientation || 'random';
        return this.effectOut( dur, function( trigger, inner, width, height, x, y, bbw, bbh ) {
            pivotPostLayout.call( this, orientation, true, trigger, 0, dur, inner, width, height );
        });
    },

    cubeFaceIn: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var direction = args && args.direction || 'random';
        return this.effectIn( function( trigger, inner, width, height, x, y, bbw, bbh ) {
            cubePostLayout.call( this, direction, false, trigger, dur, inner, width, height );
        });
    },

    cubeFaceOut: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var direction = args && args.direction || 'random';
        return this.effectOut( dur, function( trigger, inner, width, height, x, y, bbw, bbh ) {
            cubePostLayout.call( this, direction, true, trigger, dur, inner, width, height );
        });
    },

    zoomIn: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 1 );
        var factor = 1/(1+jSignage.getPercent( args && args.factor, 0.2 ));
        return this.effectIn( function( trigger, inner, width, height, x, y, bbw, bbh ) {
            zoomPostLayout.call( this, factor, false, false, trigger, dur, inner, width, height );
        });
    },

    zoomOut: function( args ) {
        var dur = jSignage.durInSeconds( args && args.dur, 0.5 );
        var factor = 1+jSignage.getPercent( args && args.factor, 0.2 );
        return this.effectOut( dur, function( trigger, inner, width, height, x, y, bbw, bbh ) {
            zoomPostLayout.call( this, factor, false, true, trigger, dur, inner, width, height );
        });
    }
});

})();


// News, playlists and tickers

(function(){

function removeWithTimeout( parent, timeout ) {
    var children = arguments;
    jSignage.setTimeout( function() {
        for ( var i=2; i<children.length; i++ )
            parent.removeChild( children[i] );
    }, timeout );
}

function multi_page_switch( multiPageElement, page, trans, timingElement, gap, delayedOut, endEventHandler ) {
    var removePrevAfter = 0, startNextAt = gap;
    var prev = multiPageElement.lastElementChild, realPage = page;
    if ( prev && ( prev.localName=='set' || prev.localName=='animate' ) )
        prev = null;

    // Add in and out effects on next page

    if ( !page )
        page = jSignage.g()[0];
    timingElement = jSignage.setFillFreeze( page, true );

    if ( trans && jSignage.isFunction(trans) )
        trans = trans();

    if ( trans ) {
        if ( delayedOut ) {
            if ( prev )
                startNextAt += trans.durOut || 0;
            removePrevAfter += trans.durOut || 0;
        }
        if ( trans.durExit )
            removePrevAfter += trans.durExit + gap;
        if ( trans.wrapIn && realPage ) {
            page = jSignage.wrapInNewElement( page, function( timeBase, inner, width, height, x, y, bbw, bbh, fx1, fy1, fx2, fy2 ) {
                trans.wrapIn.call( this, timingElement.id+'.begin', inner, width, height, x, y, bbw, bbh, fx1, fy1, fx2, fy2 );
            } );
        }
        if ( trans.durOut && trans.wrapOut && realPage ) {
            page = jSignage.wrapInNewElement( page, function( timeBase, inner, width, height, x, y, bbw, bbh, fx1, fy1, fx2, fy2 ) {
                trans.wrapOut.call( this, delayedOut ? timingElement.id+'.end' : timingElement.id+'.end'+'-'+trans.durOut, inner, width, height, x, y, bbw, bbh, fx1, fy1, fx2, fy2 );
            } );
        }
        if ( prev && trans.wrapExit && multiPageElement.wrapExitParams ) {
            multiPageElement.wrapExitParams[0] = timingElement.id+'.begin';
            trans.wrapExit.apply( prev, multiPageElement.wrapExitParams );
        }
        if ( jSignage.timeline && !trans.wrapExit )
            removePrevAfter += 0.250;
    }

    if ( realPage ) {
        // Prepare next page for an exit effect just in case
        page = jSignage.wrapInNewElement( page, function( timeBase, inner, width, height, x, y, bbw, bbh, fx1, fy1, fx2, fy2 ) {
            multiPageElement.wrapExitParams = [ null, inner, width, height, x, y, bbw, bbh, fx1, fy1, fx2, fy2 ];
        } );
    } else {
        multiPageElement.wrapExitParams = null;
    }

    if ( prev ) {
        if ( removePrevAfter <= 0 )
            multiPageElement.removeChild( prev );
        else
            removeWithTimeout( multiPageElement, removePrevAfter*1000, prev );
    }

    if ( endEventHandler && realPage )
        jSignage.endEventOnce( timingElement, endEventHandler );
    jSignage.addAndKick( multiPageElement, page, timingElement, startNextAt );
}

function new_slide( ctx, index, slideshowG2, slideShowTiming ) {
    var newSlide = null, newDelay = 0;

    if ( ctx.data && ctx.data.length && index == ctx.data.length ) {
        index = !ctx.looping || ( ctx.loopCount > 0 && --ctx.loopCount == 0 ) ? -1 : 0;
        if ( index == 0 && ctx.futureDelay ) {
            if ( ctx.looping && ctx.loopCount < 0 ) {
                var loopDur = jSignage.getCurrentTime() - ctx.futureLoopStart;
                var numIter = Math.floor( ctx.futureDelay / loopDur ) - 1;
                if ( numIter > 0 )
                    newDelay = numIter * loopDur;
            }
            delete ctx.futureDelay;
        }
    }

    if ( index==0 && ctx.iterating )
        ctx.iterating.call( ctx, ctx.iteration++ );

    if ( index>=0 && ctx.data && ctx.data.length )
        newSlide = ctx.renderToSVG ? ctx.renderToSVG.call( ctx.data[index], index, ctx.data[index] ) : ctx.data[index];

    if ( !newSlide || !newSlide.jsignage || newSlide.length < 1 ) {
        delete ctx.futureDelay;
        ctx.active = false;
        multi_page_switch( slideshowG2, null, ctx.defaultTransition, null, jSignage.durInSeconds( ctx.defaultGap, 0 ), ctx.delayedOut, null );
        ctx.layer.hide();
        return;
    }

    var slide = newSlide[0];
    var timingElement = jSignage.getTimingElement( jSignage.getRealMediaTarget( slide ) );
    if ( ctx.minimumSlideDur )
        timingElement.setAttribute( 'min', ctx.minimumSlideDur );
    if ( ctx.maximumSlideDur )
        timingElement.setAttribute( 'max', ctx.maximumSlideDur );
    if ( ctx.defaultSlideDur && ( timingElement.getAttribute('dur')=='indefinite' || timingElement.getAttribute('repeatDur')=='indefinite' || timingElement.getAttribute('repeatCount')=='indefinite' ) && !timingElement.getAttribute('end') ) {
        timingElement.setAttribute( 'dur', ctx.defaultSlideDur );
        timingElement.setAttribute( 'repeatDur', '' );
        timingElement.setAttribute( 'repeatCount', '' );
    }

    multi_page_switch(
        slideshowG2,
        slide,
        newSlide.transition || ctx.defaultTransition,
        timingElement,
        jSignage.durInSeconds( newSlide.gap || ctx.defaultGap, 0 ) + newDelay,
        ctx.delayedOut,
        function() {
            new_slide( ctx, index+1, slideshowG2, slideShowTiming );
        }
    );
}

function new_crawl( ctx, index, crawlerG2, bbw, bbh ) {

    while ( true ) {
        var newCrawl = null;

        if ( ctx.data && ctx.data.length && index==ctx.data.length )
            index = !ctx.looping || ( ctx.loopCount>0 && --ctx.loopCount==0 ) ? -1 : 0;

        if ( index==0 && ctx.iterating )
            ctx.iterating.call( ctx, ctx.iteration++ );

        if ( index>=0 && ctx.data && ctx.data.length )
            newCrawl = ctx.renderToSVG ? ctx.renderToSVG.call( ctx.data[index], index, ctx.data[index], bbw, bbh ) : ctx.data[index];

        if ( !newCrawl || !newCrawl.jsignage || newCrawl.length < 1 ) {
            delete ctx.futureDelay;
            ctx.idleing = true;
            ctx.idleStart = jSignage.getCurrentTime();
            if ( crawlerG2.lastElementChild.localName=='clipPath' ) {
                ctx.active = false;
                ctx.layer.hide();
            }
            return;
        }

        var crawl = newCrawl[0];
        var timingElement = jSignage.getTimingElement( crawl );
        var bbox = jSignage.getBBox( crawl, crawlerG2 );
        if ( bbox.height>0 && bbox.width>0 )
            break;
        ++index;
    }
    var scale_factor = ctx.vertical ? bbw/bbox.width : bbh/bbox.height;
    if ( bbox.auto && scale_factor!=1 ) {
        // Text, in particular, does not scale linearly because of hinting, so do it again with the final scale factor.
        crawl.setAttribute( 'transform', 'scale(' + scale_factor +')' );
        bbox = jSignage.getBBox( crawl, crawlerG2 );
        scale_factor = ctx.vertical ? bbw/bbox.width : bbh/bbox.height;
    }

    var h, vbh, w, cloneDistance, crawlDistance, scaleTransform;
    if ( ctx.vertical ) {
        w = bbw;
        vbh = bbh;
        h = bbox.height*scale_factor;
        scaleTransform = "translate("+(bbw-w)/2+",0) scale("+scale_factor+") translate("+(-bbox.x)+","+(-bbox.y)+")";
        cloneDistance = h;
        crawlDistance = bbh + h;
    } else {
        vbh = h = bbh;
        w = bbox.width*scale_factor;
        scaleTransform = "scale("+scale_factor+") translate("+(-bbox.x)+","+(-bbox.y)+")";
        cloneDistance = w;
        crawlDistance = bbw + w;
    }
    crawl.setAttribute( "transform", scaleTransform );
    var unitsPerSecond = vbh * ctx.speed;
    if ( ctx.smooth )
        unitsPerSecond = jSignage.smoothMotion( unitsPerSecond, ctx.deviceRefreshRate, ctx.devicePixelSize );
    var crawlDur = crawlDistance/unitsPerSecond;
    var delay = ( cloneDistance + ctx.spacing * vbh ) / unitsPerSecond;
    if ( delay < 0.5 ) // Do not display too many items at the same times to not overload the player        
        delay = 0.5;

    if ( ctx.futureDelay ) {
        ctx.futureLoopDur += delay;
        if ( ctx.data && ctx.data.length && index + 1 == ctx.data.length ) {
            if ( ctx.looping && ctx.loopCount < 0 && ctx.futureLoopDur ) {
                var numIter = Math.floor( ctx.futureDelay / ctx.futureLoopDur ) - 2;
                if ( numIter > 0 )
                    delay += numIter * ctx.futureLoopDur;
            }
            delete ctx.futureDelay;
        }
    }

    var attr = {
        attributeName: 'transform',
        type: 'translate',
        additive: 'sum',
        begin: 'indefinite',
        fill: 'freeze',
        dur: crawlDur
    };
    if ( ctx.vertical ) {
        if ( ctx.leftToRight ) {
            attr.from = '0,-'+cloneDistance/scale_factor;
            attr.by = '0,'+crawlDistance/scale_factor;
        } else {
            attr.from = '0,'+bbh/scale_factor;
            attr.by = '0,-'+crawlDistance/scale_factor;
        }
    } else {
        if ( ctx.leftToRight ) {
            attr.from = '-'+cloneDistance/scale_factor+',0';
            attr.by = String(crawlDistance/scale_factor)+',0';
        } else {
            attr.from = bbw/scale_factor+',0';
            attr.by = '-'+crawlDistance/scale_factor+',0';
        }
    }
    var anim = jSignage.svgAnimation( crawl, 'animateTransform', attr );
    timingElement.setAttribute( 'begin', 'indefinite' );   
    jSignage.addInnerLayerOwnSize( crawlerG2, crawl, bbox.width, bbox.height );
    jSignage.beginLayerAt( timingElement );
    jSignage.beginAnimation( anim, 0, function() {
        crawlerG2.removeChild( crawl );
        if ( crawlerG2.lastElementChild.localName == 'clipPath' ) {
            if ( !ctx.skipping ) {
                ctx.active = false;
                ctx.layer.hide();
            }
        }
    } );

    if ( delay >= crawlDur ) {
        ctx.skipping = true;
        jSignage.setTimeout( function () {
            delete ctx.skipping;
            new_crawl( ctx, index + 1, crawlerG2, bbw, bbh );
        }, delay * 1000 )
    } else {
        var delayTimer = jSignage.svgAnimation( crawl, 'set', {
            attributeName: 'visibility',
            to: 'inherit',
            begin: 'indefinite',
            dur: delay
        } );
        jSignage.beginAnimation( delayTimer, 0, function () {
            new_crawl( ctx, index + 1, crawlerG2, bbw, bbh );
        } );
    }
    ctx.idleing = false;
}

function playlistElementToSVG( index, element ) {
    var media;
    if ( typeof(element)=="string" ) {
        media = jSignage.media({ href: element });
    } else {
        var attr = { href: element.href };
        if ( 'dur' in element )
            attr.dur = element.dur;
        media = jSignage.media( attr );
        if ( element.transition )
            media.transition = element.transition;
    }
    return media;
}

function table_next( ctx, order ) {
    var secondary = false;
    if ( order=='rightToLeft' ) {
        if ( ctx.col > 0 ) {
            ctx.col--;
        } else {
            ctx.col = ctx.columns-1;
            secondary = true;
        }
    } else if ( order=='topToBottom' ) {
        if ( ctx.row+1 < ctx.rows ) {
            ctx.row++;
        } else {
            ctx.row = 0;
            secondary = true;
        }
    } else if ( order=='bottomToTop' ) {
        if ( ctx.row > 0 ) {
            ctx.row--;
        } else {
            ctx.row = ctx.rows-1;
            secondary = true;
        }
    } else {
        if ( ctx.col+1 < ctx.columns ) {
            ctx.col++;
        } else {
            ctx.col = 0;
            secondary = true;
        }
    }
    return secondary;
}

function table_cells( ctx, g, width, height ) {
    var delay=0;
    while ( true ) {
        var d = null, layer = null;
        if ( ctx.data ) {
            if ( ctx.data2D ) {
                if ( ctx.primaryOrder=='leftToRight' || ctx.primaryOrder=='rightToLeft' ) {
                    if ( ctx.row < ctx.data.length )
                        d = ctx.data[ctx.row][ctx.col];
                    else
                        return;
                } else {
                    if ( ctx.col < ctx.data.length )
                        d = ctx.data[ctx.col][ctx.row];
                    else
                        return;
                }
            } else if ( ctx.idx < ctx.data.length ) {
                d = ctx.data[ctx.idx];
            } else {
                return;
            }
        }
        if ( d && d.jsignage ) {
            layer = d;
        } else if ( ctx.renderToSVG && ( !ctx.data2D || d ) ) {
            if ( ctx.primaryOrder=='leftToRight' || ctx.primaryOrder=='rightToLeft' )
                layer = ctx.renderToSVG.call( d, ctx.col, ctx.row, d );
            else
                layer = ctx.renderToSVG.call( d, ctx.row, ctx.col, d );
        }
        if ( layer && layer.jsignage && layer[0] ) {
            var x = (ctx.col*width)/ctx.columns, y = (ctx.row*height)/ctx.rows;
            var w = width/ctx.columns, h = height/ctx.rows, padx = 0, pady = 0;
            if ( ctx.columnPaddingRel )
                padx = w*ctx.columnPadding/100;
            else
                padx = ctx.columnPadding;
            if ( ctx.rowPaddingRel )
                pady = h*ctx.rowPadding/100;
            else
                pady = ctx.rowPadding;
            var pad = ctx.cellPaddingRel ? (width>height ? width : height)*ctx.cellPadding/100 : ctx.cellPadding;
            padx += pad;
            pady += pad;
            jSignage.kickInnerLayer( g, width, height, layer[0], x+padx/2, y+pady/2, w-padx, h-pady );
        }
        ctx.idx++;
        if ( table_next( ctx, ctx.primaryOrder ) ) {
            if ( table_next( ctx, ctx.secondaryOrder ) )
                return;
            if ( ctx.secondaryDelay ) {
                delay = ctx.delay+ctx.secondaryDelay;
                break;
            }
        }
        if ( ctx.delay ) {
            delay = ctx.delay;
            break;
        }
    }
    if ( delay ) {
        var delayTimer = jSignage.svgAnimation( g, 'set', {
            attributeName: 'visibility',
            to: 'inherit',
            begin: 'indefinite',
            dur: delay
        });
        jSignage.beginAnimation( delayTimer, 0, function() {
            g.removeChild( delayTimer );
            table_cells( ctx, g, width, height );
        });
    }
}

var slideshowProps = [ 'data', 'renderToSVG', 'defaultTransition', 'defaultGap', 'delayedOut', 'minimumSlideDur', 'maximumSlideDur', 'defaultSlideDur', 'iterating' ];
var crawlerProps = [ 'data', 'renderToSVG', 'iterating' ];
var tableProps = [ 'data', 'rows', 'columns', 'primaryOrder', 'secondaryOrder', 'delay', 'secondaryDelay', 'cellPadding', 'columnPadding', 'rowPadding', 'renderToSVG' ];
var textProps = [ 'fontFamily', 'fontSize', 'fontStyle', 'fontWeight', 'fontVariant', 'fill', 'direction', 'unicodeBidi' ];
var fitTextFactorsCoarse = [ 1.5, 2, 3, 4, 6, 8, 12, 16 ];
var fitTextFactorsFine = [ 1.25, 4/3, 1.5, 2, 2.5, 3, 4, 6, 8, 10, 12, 16 ];
var scrollingTextAreaArgs = [ 'lines', 'lineDur', 'pageDur', 'scrollDur', 'fontFamily', 'fontStyle', 'fontWeight', 'fontVariant', 'fill', 'direction', 'unicodeBidi', 'textAlign' ];
var textAreaArgs = [ 'id', 'begin', 'min', 'max', 'top', 'bottom', 'left', 'right', 'width', 'height', 'viewBox', 'transform', 'frame', 'fontFamily', 'fontStyle', 'fontWeight', 'fontVariant', 'fill', 'direction', 'unicodeBidi', 'textAlign' ];

jSignage.pathData = function() {
    this.d = '';
};

jSignage.pathData.prototype = {
    toString: function() {
        return this.d;
    },

    moveTo: function( x, y ) {
        this.d += 'M'+x+' '+y;
        return this;
    },

    close: function() {
        this.d += 'Z';
        return this;
    },
    
    cmd: function( c, n, args ) {
        this.d += c;
        for ( var i=0; i+n<=args.length; i+=n )
            for ( var j=0; j<n; j++ )
                this.d += ' '+args[i+j];
    },

    lineTo: function() { this.cmd( 'L', 2, arguments ); return this; },
    curveTo: function() { this.cmd( 'C', 6, arguments ); return this; },
    smoothCurveTo: function() { this.cmd( 'S', 4, arguments ); return this; },
    quadTo: function() { this.cmd( 'Q', 4, arguments ); return this; },
    smoothQuadTo: function() { this.cmd( 'T', 2, arguments ); return this; },
    arcTo: function() { this.cmd( 'A', 7, arguments ); return this; }
};

jSignage.extend({

    shuffle: function( src, num ) {
        if ( num===undefined )
            num = src.length;
        var dst = new Array, j;
        if ( num > 0 ) {
            dst[0] = src[0];
            for ( var i=1; i<num; i++ ) {
                j = Math.floor( Math.random()*(i+1) );
                dst[i] = dst[j];
                dst[j] = src[i];
            }
        }
        return dst;
    },

    randomChoice: function( array ) {
        return array[ Math.floor( Math.random()*array.length ) ];
    },

    // Note: root is jSignage.getRealMediaTarget(this[0]) !
    kickInnerLayer: function( root, width, height, layer, x, y, w, h, anchor ) {
        var cell = jSignage.getRealMediaTarget( layer );
        cell.setAttributeNS( jSignage.spxNS, 'left', x );
        cell.setAttributeNS( jSignage.spxNS, 'top', y );
        cell.setAttributeNS( jSignage.spxNS, 'width', w );
        cell.setAttributeNS( jSignage.spxNS, 'height', h );
        cell.setAttributeNS( jSignage.spxNS, 'bottom', '' );
        cell.setAttributeNS( jSignage.spxNS, 'right', '' );
        var timingElement = jSignage.getTimingElement( cell );
        var offset = jSignage.durInSeconds( timingElement.getAttribute( 'begin' ), 0 );
        if ( anchor!==undefined )
            timingElement.setAttribute( 'begin', anchor+offset );
        else
            timingElement.setAttribute( 'begin', 'indefinite' );
        var action = jSignage.scheduleLayerAbsolute( timingElement );
        var g2 = jSignage.getG2(root);
        jSignage._calcLayout( layer, width, height, 0, g2 );
        g2.appendChild( layer );
        if ( action )
            jSignage.timeline.schedule( action );
        if ( anchor===undefined )
            jSignage.beginLayerAt( timingElement, offset );
    },

    // Note: root is jSignage.getRealMediaTarget(this[0]) !
    addInnerLayerOwnSize: function( root, layer, layerWidth, layerHeight ) {
        var child = jSignage.getRealMediaTarget( layer );
        var timingElement = jSignage.getTimingElement( child );
        var action = jSignage.scheduleLayer( root, timingElement );
        var g2 = jSignage.getG2(root);
        jSignage._calcLayout( layer, layerWidth, layerHeight, true, g2 );
        g2.appendChild( layer );
        if ( action )
            jSignage.timeline.schedule( action );
    },

    guessCannedSlidesDur: function( canned, defaultDur ) {
        defaultDur = jSignage.durInSeconds( defaultDur ) || 'indefinite';
        if ( jSignage.isArray( canned ) ) {
            var total = 0;
            for ( var i = 0; i < canned.length; i++ ) {
                var dur = jSignage.guessCannedSlidesDur( canned[i], defaultDur );
                if ( dur=='media' || dur=='indefinite' )
                    return dur;
                total += dur;
            }
            return total;
        } else {
            return jSignage.guessSlideDur( canned.ctor, canned.args, defaultDur );
        }
    },

    slideshow: function( args, args2 ) {
        var ctx = { };
        if ( args )
            jSignage.copyProps( args, ctx, slideshowProps );
        if ( args2 )
            jSignage.copyProps( args2, ctx, slideshowProps );
        if ( args )
            jSignage.setLoopingInfo( args, ctx );
        ctx.iteration = 0;
        if ( typeof( args.begin ) == 'number' && args.begin + 60 < jSignage.getDisplayTime() ) {
            ctx.futureDelay = jSignage.getDisplayTime() - args.begin;
            ctx.futureLoopStart = args.begin;
        }
        var layer = jSignage.customLayer( 'slideshow', args, ctx );
        ctx.layer = layer;
        var slideShowTiming = jSignage.getTimingElement( layer[0] );
        var g2 = jSignage.getG2( layer[0] );
        layer.beginEvent( function() {
            ctx.active = true;
            if ( ctx.looping )
                ctx.loopCount = ctx.reloadLoopCount;
            new_slide( ctx, 0, g2, slideShowTiming );
        });
        layer.pushData = function() {
            if ( !ctx.data || !ctx.active )
                ctx.data = [];
            ctx.data = ctx.data.concat.apply( ctx.data, arguments );
            delete ctx.futureDelay;
            if ( !ctx.active && ctx.data && ctx.data.length ) {
                ctx.active = true;
                layer.show();
            }
        };
        return layer;
    },

    playlist: function( args ) {
        var args2 = {
            renderToSVG: playlistElementToSVG
        };
        args2.defaultSlideDur = args.defaultDur || 5;
        if ( 'minimumDur' in args )
          args2.minimumSlideDur = args.minimumDur;
        if ( 'maximumDur' in args )
          args2.maximumSlideDur = args.maximumDur;
        return jSignage.slideshow( args, args2 );
    },

    textBar: function( args ) {
        var argsSTA = { };
        jSignage.copyProps( args, argsSTA, scrollingTextAreaArgs );
        var argsSS = {
            renderToSVG: function( index, element ) {
                var text = args.renderToText ? args.renderToText.call( element, index, element ) : element;
                return jSignage.scrollingTextArea( argsSTA ).text( text );
            },
            defaultTransition: args.transition===undefined ? jSignage.push({ direction: 'bottomToTop' }) : args.transition
        };
        return jSignage.slideshow( args, argsSS );        
    },

    crawler: function( args, args2 ) {
        var svg = document.documentElement;
        var ctx = {
            vertical: args && ( args.direction=='bottomToTop' || args.direction=='topToBottom' ),
            leftToRight: args && ( args.direction=='leftToRight' || args.direction=='topToBottom' ),
            devicePixelSize: 1,
            deviceRefreshRate: svg.getDeviceRefreshRate && svg.getDeviceRefreshRate() || 60,
            speed: 1,
            smooth: args && 'smooth' in args ? args.smooth : true,
            spacing: 0.2
        };
        if ( args )
            jSignage.copyProps( args, ctx, crawlerProps );
        if ( args2 )
            jSignage.copyProps( args2, ctx, crawlerProps );
        ctx.devicePixelSize = jSignage.getDevicePixelSize( ctx.vertical );
        var speed = parseFloat( args2 && args2.speed || args.speed );
        if ( !isNaN(speed) && speed>0 )
            ctx.speed = speed/100;
        var spacing = parseFloat( args2 && 'spacing' in args2 ? args2.spacing : args && args.spacing );
        if ( !isNaN(spacing) && spacing>=0 )
            ctx.spacing = spacing/100;
        if ( args )
            jSignage.setLoopingInfo( args, ctx );
        ctx.iteration = 0;
        if ( typeof( args.begin ) == 'number' && args.begin + 60 < jSignage.getDisplayTime() ) {
            ctx.futureDelay = jSignage.getDisplayTime() - args.begin;
            ctx.futureLoopDur = 0;
        }
        var crawlerG2 = null, crawlerWidth = null, crawlerHeight = null;
        var layer = jSignage.customLayer( 'crawler', args, ctx, function( width, height ) {
            crawlerG2 = this;
            crawlerWidth = width;
            crawlerHeight = height;
            jSignage.setClipRect( crawlerG2, 0, 0, crawlerWidth, crawlerHeight );
            layer.beginEvent( function() {
                ctx.active = true;
                ctx.idleing = false;
                if ( ctx.looping )
                    ctx.loopCount = ctx.reloadLoopCount;
                new_crawl( ctx, 0, crawlerG2, crawlerWidth, crawlerHeight );
             } );
        } );
        ctx.layer = layer;
        var crawlerTiming = jSignage.getTimingElement( layer[0] );

        layer.pushData = function() {
            if ( !ctx.data || !ctx.active || ctx.idleing )
                ctx.data = [];
            ctx.data = ctx.data.concat.apply( ctx.data, arguments );
            delete ctx.futureDelay;
            if ( ctx.data && ctx.data.length ) {
                if ( !ctx.active ) {
                    ctx.active = true;
                    ctx.idleing = false;
                    layer.show();
                } else if ( ctx.idleing ) {
                    if ( ctx.looping )
                        ctx.loopCount = ctx.reloadLoopCount;
                    new_crawl( ctx, 0, crawlerG2, crawlerWidth, crawlerHeight );
                }
            }
        };

        layer.active = function() {
            return ctx.active;
        };

        layer.idleTime = function() {
            return ctx.active && ctx.idleing ? 1000*(jSignage.getCurrentTime() - ctx.idleStart) : 0;
        };

        return layer;
    },

    textTicker: function( args ) {
        var baseLine = parseFloat( String(args.baseLine) );
        var vertical = args.direction=='topToBottom' || args.direction=='bottomToTop';
        var fontSizeFactor = isNaN(baseLine) ? vertical ? 0.9 : 0.7 : 1 - baseLine/100;
        var lines = vertical ? args.lines || 5 : 1;

        var textAreaAttr = {
            displayAlign: 'before',
            textAlign : vertical ? ( 'textAlign' in args && args.textAlign!==undefined ? args.textAlign : 'center' ) : 'start'
        };

        jSignage.copyProps( args, textAreaAttr, textProps );

        return jSignage.crawler( args, {
            spacing: ( 'spacing' in args ? args.spacing : 50 ) / lines,
            speed: ( args.speed || 100 ) / lines,
            renderToSVG: function( index, element, width, height ) {
                var text = args.renderToText ? args.renderToText.call( element, index, element ) : element;
                if ( vertical ) {
                    textAreaAttr.width = width;
                    textAreaAttr.height = 'auto';
                    textAreaAttr.lineIncrement = height / lines;
                    textAreaAttr.fontSize = textAreaAttr.lineIncrement * fontSizeFactor;
                } else {
                    textAreaAttr.width = 'auto';
                    textAreaAttr.height = height;
                    textAreaAttr.fontSize = height * fontSizeFactor;
                }
                var layer = jSignage.textArea( textAreaAttr ).text( text );
                if ( vertical )
                    layer[0].setAttributeNS( null, 'width', width );
                return layer;
            }
        } );
    },

    mediaCrawler: function( args ) {
        return jSignage.crawler( args, {
            renderToSVG: function( index, element ) {
                return jSignage.media({
                    href: args.renderToURI ? args.renderToURI.call( element, index, element ) : element,
                    width: args.mediaWidth || 160,
                    height: args.mediaHeight || 90
                });
            }
        } );
    },

    table: function( args, args2 ) {
        var ctx = {
            data: null,
            rows: 1,
            columns: 1,
            delay: 0,
            secondaryDelay: 0,
            cellPadding: 0,
            cellPaddingRel: false,
            columnPadding: 0,
            columnPaddingRel: false,
            rowPadding: 0,
            rowPaddingRel: false,
            renderToSVG: null,
            data2D: false,
            idx: 0
        };
        jSignage.copyProps( args, ctx, tableProps );
        if ( args2 )
            jSignage.copyProps( args2, ctx, tableProps );
        if ( !ctx.primaryOrder )
            ctx.primaryOrder = ctx.columns==1 && ctx.rows>1 ? 'topToBottom' : 'leftToRight';
        if ( !ctx.secondaryOrder )
            ctx.secondaryOrder = ctx.primaryOrder=='leftToRight' || ctx.primaryOrder=='rightToLeft' ? 'topToBottom' : 'leftToRight';
        if ( ctx.data && jSignage.isArray(ctx.data) && ctx.data.length>0 && jSignage.isArray(ctx.data[0]) )
            ctx.data2D = true;
        if ( !ctx.rows || ctx.rows < 1 )
            ctx.rows = 1;
        if ( !ctx.columns || ctx.columns < 1 )
            ctx.columns = 1;
        if ( ctx.primaryOrder=='rightToLeft' || ctx.secondaryOrder=='rightToLeft' )
            ctx.col = ctx.columns-1;
        else
            ctx.col = 0;
        if ( ctx.primaryOrder=='bottomToTop' || ctx.secondaryOrder=='bottomToTop' )
            ctx.row = ctx.rows-1;
        else
            ctx.row = 0;
        if ( ctx.cellPadding ) {
            var spec = String(ctx.cellPadding);
            ctx.cellPadding = parseFloat(spec);
            if ( spec.charAt(spec.length-1)=='%' )
                ctx.cellPaddingRel = true;
            if ( isNaN(ctx.cellPadding) || ctx.cellPadding<0 )
                ctx.cellPadding = 0;
        }
        if ( ctx.columnPadding ) {
            var spec = String(ctx.columnPadding);
            ctx.columnPadding = parseFloat(spec);
            if ( spec.charAt(spec.length-1)=='%' )
                ctx.columnPaddingRel = true;
            if ( isNaN(ctx.columnPadding) || ctx.columnPadding<0 )
                ctx.columnPadding = 0;
        }
        if ( ctx.rowPadding ) {
            var spec = String(ctx.rowPadding);
            ctx.rowPadding = parseFloat(spec);
            if ( spec.charAt(spec.length-1)=='%' )
                ctx.rowPaddingRel = true;
            if ( isNaN(ctx.rowPadding) || ctx.rowPadding<0 )
                ctx.rowPadding = 0;
        }
        var layer = jSignage.customLayer( 'table', args, null, function( width, height ) {
            var tableElement = this;
            layer.beginEvent( function() {
                table_cells( ctx, tableElement, width, height );
            });
        });
        return layer;
    },

    fitTextArea: function( args ) {
        var factors = fitTextFactorsFine;

        if ( args && 'factors' in args ) {
            if ( args.factors=='fine' )
                factors = fitTextFactorsFine;
            else if ( args.factors=='coarse' )
                factors = fitTextFactorsCoarse;
            else if ( jSignage.isArray(args.factors) )
                factors = args.factors;
        }

        var layer = jSignage.textArea( args, 'fitTextArea', function( textArea, width, height, x, y, bbw, bbh, parent ) {
            var textHeight = jSignage.getTextAreaHeight( textArea, parent ), i, f = 1;
            for ( i=0; i<factors.length && textHeight > height*f; i++ ) {
                f = factors[i];
                textArea.setAttribute( 'transform', 'scale('+(1/f)+')' );
                textArea.setAttribute( 'width', width*f );                
                textHeight = jSignage.getTextAreaHeight( textArea, parent );
            }
            textArea.setAttribute( 'height', height*f );
        });
        return layer;
    },

    headlineTextArea: function( args ) {
        var scaleMethod = args && args.scaleMethod;
        var layer = jSignage.textArea( args, 'headlineTextArea', function( textArea, width, height, x, y, bbw, bbh, parent ) {
            var nLines = jSignage( 'tbreak', textArea ).length + 1;
            textArea.setAttribute( 'font-size', height/nLines );
            textArea.setAttribute( 'line-increment', height/nLines/1.2 );
            var w = jSignage.getTextAreaWidth( textArea, parent );
            if ( w <= 0 )
                return;
            var f = width / w;
            if ( f  < 1 && scaleMethod!=='none' ) {
                if ( scaleMethod==='uniform' ) {
                    textArea.setAttribute( 'transform', 'scale('+f+')' );
                    textArea.setAttribute( 'height', height/f );
                } else {
                    textArea.setAttribute( 'transform', 'scale('+f+',1)' );
                }
                w = jSignage.getTextAreaWidth( textArea, parent );
                f = width / w * 0.98;
                if ( scaleMethod==='uniform' ) {
                    textArea.setAttribute( 'transform', 'scale('+f+')' );
                    textArea.setAttribute( 'height', height/f );
                } else {
                    textArea.setAttribute( 'transform', 'scale('+f+',1)' );
                }
                textArea.setAttribute( 'width', width/f );
            }
        });
        return layer;
    },

    scrollingTextArea: function( args ) {
        var repeatDur, repeatCount;
        if ( args ) {
            repeatDur = args.repeatDur!==undefined ? args.repeatDur : args.dur;
            repeatCount = args.repeatCount;
        }
        var lines = args && Number(args.lines) || 1;
        var lineDur = null, pageDur = null;
        if ( args && args.pageDur )
            pageDur = jSignage.durInSeconds( args.pageDur, lines*1.5 );
        else
            lineDur = jSignage.durInSeconds( args && args.lineDur, 1.5 );
        var scrollDur = jSignage.durInSeconds( args && args.scrollDur, 0.5 );
        var args2 = {
            dur: 'indefinite'
        };
        jSignage.copyProps( args, args2, textAreaArgs );

        var layer = jSignage.textArea( args2, 'scrollingTextArea', function( textArea, width, height, x, y, bbw, bbh, parent ) {
            var lineIncrement = height/lines;
            textArea.setAttribute( 'line-increment', lineIncrement );
            textArea.setAttribute( 'font-size', lineIncrement/1.2 );
            var offset = -lineIncrement*0.21;
            var h = jSignage.getTextAreaHeight( textArea, parent );
            textArea.setAttribute( 'height', 'auto' );
            var totalLines = Math.round( h / lineIncrement ), totalDur;
            if ( pageDur ) {
                var totalPages = Math.ceil( totalLines / lines );
                totalDur = pageDur;
                if ( totalPages > 1 )
                    totalDur += (totalPages-1)*(scrollDur+pageDur);
            } else {
                totalDur = lines * lineDur;
                if ( totalLines > lines )
                    totalDur += (totalLines-lines)*(scrollDur+lineDur);
            }
            var values = [ '0,'+offset ];
            var keyTimes = [ 0 ];
            if ( pageDur ) {
                for ( var i=1; i < totalPages; i++ ) {
                    values.push( '0,'+(-lineIncrement*(i-1)*lines+offset) );
                    keyTimes.push( (pageDur*i+scrollDur*(i-1))/totalDur );
                    values.push( '0,'+(-lineIncrement*i*lines+offset) );
                    keyTimes.push( (pageDur*i+scrollDur*i)/totalDur );
                }
                if ( totalPages > 1 )
                    values.push( '0,'+(-lineIncrement*(totalPages-1)*lines+offset) );
                else
                    values.push( '0,'+offset );
            } else {
                for ( var i=lines; i < totalLines; i++ ) {
                    values.push( '0,'+(-lineIncrement*(i-lines)+offset) );
                    keyTimes.push( (lineDur*i+scrollDur*(i-lines))/totalDur );
                    values.push( '0,'+(-lineIncrement*(i+1-lines)+offset) );
                    keyTimes.push( (lineDur*i+scrollDur*(i-lines+1))/totalDur );
                }
                if ( totalLines > lines )
                    values.push( '0,'+(-lineIncrement*(totalLines-lines)+offset) );
                else
                    values.push( '0,'+offset );
            }
            keyTimes.push( 1 );
            var motion = {
                attributeName: 'transform',
                type: 'translate',
                additive: 'sum',
                values: values.join(';'),
                keyTimes: keyTimes.join(';'),
                dur: totalDur,
                begin: timingElement.id+'.begin',
                fill: 'freeze'
            };
            if ( repeatCount!==undefined )
                motion.repeatCount = repeatCount;
            if ( repeatDur !==undefined )
                motion.repeatDur = repeatDur;
            var gg = jSignage.getGG( textArea );
            var id = gg.id;
            if ( !id )
                gg.id = id = jSignage.guuid();
            motion.href = '#'+id;
            jSignage.svgAnimation( this, 'animateTransform', motion, function() {
                layer.end();
            });
            jSignage.setClipRect( this, 0, 0, width, height );
        });
        var timingElement = jSignage.getTimingElement( jSignage.getRealMediaTarget( layer[0] ) );
        return layer;
    },
    
    smoothMotion: function( unitsPerSecond, deviceRefreshRate, devicePixelSize ) {
        var pixelsPerRefresh = unitsPerSecond/deviceRefreshRate*devicePixelSize;
        if ( pixelsPerRefresh > 0.5 )
            pixelsPerRefresh = Math.ceil( pixelsPerRefresh );
        else
            pixelsPerRefresh = 1 / Math.floor( 1/pixelsPerRefresh );
        return pixelsPerRefresh*deviceRefreshRate/devicePixelSize;
    },

    pingPongTextArea: function( args ) {
        var direction = args && args.direction || 'rightToLeft';
        var horizontal = direction!='topToBottom' && direction!='bottomToTop';
        var speed = parseFloat( String(args && args.speed) );
        if ( isNaN(speed) ) speed = 1; else speed /= 100;
        var backSpeed = parseFloat( String(args && args.backSpeed) );
        if ( isNaN(backSpeed) ) backSpeed = speed; else backSpeed /= 100;
        var delay = jSignage.durInSeconds( args && args.delay, 0.5 );
        var backDelay = jSignage.durInSeconds( args && args.backDelay, delay );
        var smooth = args && 'smooth' in args ? args.smooth : true;
        var scrollBack = args && args.scrollBack || false;
        var svg = document.documentElement;
        var deviceRefreshRate = svg.getDeviceRefreshRate && svg.getDeviceRefreshRate() || 60;
        var devicePixelSize = jSignage.getDevicePixelSize( !horizontal );

        var layer = jSignage.textArea( args, 'pingPongTextArea', function( textArea, width, height, x, y, bbw, bbh, parent ) {
            var bbox = (horizontal ? jSignage.getTextAreaWidth : jSignage.getTextAreaHeight)( textArea, parent );
            var dist = horizontal ? bbox-width : bbox-height;
            if ( dist > 0 ) {
                // Add some margin for text layout errors.
                var plus = devicePixelSize*2;
                dist += plus;

                var x1=0, y1=0, x2=0, y2=0;
                if ( direction=='leftToRight' )
                    x1 = -dist;
                else if ( direction=='topToBottom' )
                    y1 = -dist;
                else if ( direction=='bottomToTop' )
                    y2 = -dist;
                else
                    x2 = -dist;

                var unitsPerSecond = height*speed;
                if ( smooth )
                    unitsPerSecond = jSignage.smoothMotion( unitsPerSecond, deviceRefreshRate, devicePixelSize );
                var forwardDur = dist/unitsPerSecond, backwardDur;
                if ( speed==backSpeed ) {
                    backwardDur = forwardDur;
                } else {
                    unitsPerSecond = height*backSpeed;
                    if ( smooth )
                        unitsPerSecond = jSignage.smoothMotion( unitsPerSecond, deviceRefreshRate, devicePixelSize );
                    backwardDur = dist/unitsPerSecond;
                }

                var values = [ x1+' '+y1 ], keyTimes = [ 0 ], dur = 0;
                if ( delay ) {
                    values.push( +x1+' '+y1 );
                    keyTimes.push( dur += delay );
                }
                values.push( x2+' '+y2 );
                keyTimes.push( dur += forwardDur );
                if ( backDelay ) {
                    values.push( x2+' '+y2 );
                    keyTimes.push( dur += backDelay );
                }
                if ( scrollBack ) {
                    values.push( x1+' '+y1 );
                    keyTimes.push( dur += backwardDur );
                }
                for ( var i=0; i<keyTimes.length; i++ )
                    keyTimes[i] /= dur;

                var gg = jSignage.getGG( textArea );
                var id = gg.id;
                if ( !id )
                    gg.id = id = jSignage.guuid();
                jSignage.svgAnimation( this, 'animateTransform', {
                    attributeName: 'transform',
                    type: 'translate',
                    additive: 'sum',
                    values: values.join( ';' ),
                    keyTimes: keyTimes.join( ';' ),
                    begin: timingElement.id+'.begin',
                    dur: dur,
                    repeatCount: 'indefinite',
                    href: '#'+id
                });
                if ( horizontal ) {
                    textArea.setAttribute( 'width', bbox+plus );
                    textArea.setAttribute( 'text-align', 'left' );
                } else {
                    textArea.setAttribute( 'height', bbox+plus );
                    textArea.setAttribute( 'display-align', 'before' );
                }
                if ( horizontal )
                    jSignage.setClipRect( this, 0, -height, width, 3*height );
                else
                    jSignage.setClipRect( this, -width, 0, 3*width, height );
            } else {
                if ( horizontal )
                    textArea.setAttribute( 'width', width );
                else
                    textArea.setAttribute( 'height', height );
            }
        });
        var timingElement = jSignage.getTimingElement( jSignage.getRealMediaTarget( layer[0] ) );
        return layer;
    },

    multiPage: function( args ) {
        var obj = jSignage.customLayer( 'multiPage', args );
        obj.currentPageTimingElement = null;

        obj.switchPage = function( layer, transition ) {
            var trans = transition || args.defaultTransition || null;
            if ( obj.currentPageTimingElement ) {
                jSignage.endLayerAt( obj.currentPageTimingElement );
                obj.currentPageTimingElement = null;
            }
            if ( layer && layer.jsignage && layer.length>0 ) {
                var timingElement = jSignage.getTimingElement( jSignage.getRealMediaTarget( layer[0] ) );
                obj.currentPageTimingElement = timingElement;
                multi_page_switch( obj.g2(), layer[0], trans, obj.currentPageTimingElement, 0, false, args.pageEnded ? function() {
                    // Check the page was not ended as a result of calling .switchPage()
                    if ( timingElement==obj.currentPageTimingElement )
                        args.pageEnded.call( obj );
                } : null );
            } else {
                multi_page_switch( obj.g2(), null, trans, null, 0, false, null );
            }
        };
        return obj;
    },

    widgetClass: jSignage.subclass(
        function( args ) {
            this.overlay = null;    // Handle to overlay rect that captures all pointer events
            this.attach = null;     // Handle to parent group element where graphic elements are attached
            this.dragging = false;
            this.draggable = true;
        }, {

        postLayout: function( g, width, height ) {
            jSignage.setClipRect( g, 0, 0, width, height );
            this.attach = jSignage._createElement( 'g' );
            this.overlay = jSignage._createElement( 'rect', {
                width: width,
                height: height,
                fill: 'none',
                stroke: 'none',
                'pointer-events': 'fill'
            });
            g.appendChild( this.attach );
            g.appendChild( this.overlay );        
            var obj=this;

            var drag = obj.draggable && ( obj.dragStart || obj.drag || obj.dragStop );

            if ( obj.mouseDown || drag ) {
                obj.overlay.addEventListener( 'mousedown', function(ev) {
                    var click = jSignage.getLocalCoord( obj.overlay, ev.clientX, ev.clientY );
                    if ( obj.mouseDown )
                        obj.mouseDown( ev, click.x, click.y );
                    if ( ev.button==0 && drag ) {
                        obj.dragging = true;
                        obj.dragX = click.x;
                        obj.dragY = click.y;
                        if ( obj.dragStart )
                            obj.dragStart( ev, click.x, click.y );
                    }
                });
            }

            if ( obj.mouseUp || drag ) {
                obj.overlay.addEventListener( 'mouseup', function(ev) {
                    var click = jSignage.getLocalCoord( obj.overlay, ev.clientX, ev.clientY );
                    if ( obj.mouseUp )
                        obj.mouseUp( ev, click.x, click.y );
                    if ( ev.button==0 && obj.dragging ) {
                        obj.dragging = false;
                        if ( obj.dragStop )
                            obj.dragStop( ev, click.x, click.y );
                    }
                });
            }

            if ( obj.mouseOut || drag ) {
                obj.overlay.addEventListener( 'mouseout', function(ev) {
                    if ( obj.mouseOut )
                        obj.mouseOut(ev);
                    if ( obj.dragging ) {
                        obj.dragging = false;
                        if ( obj.dragStop )
                            obj.dragStop( ev, null, null );
                    }
                });
            }

            if ( obj.mouseMove || drag ) {
                obj.overlay.addEventListener( 'mousemove', function(ev) {
                    var click = jSignage.getLocalCoord( obj.overlay, ev.clientX, ev.clientY );
                    if ( obj.mouseMove )
                        obj.mouseMove( ev, click.x, click.y );
                    if ( obj.dragging ) {
                        var rx = click.x-obj.dragX;
                        var ry = click.y-obj.dragY;
                        obj.dragX = click.x;
                        obj.dragY = click.y;
                        if ( obj.drag )
                            obj.drag( rx, ry );
                    }
                });
            }

            if ( obj.mouseClick ) {
                obj.overlay.addEventListener( 'click', function(ev) {
                    var click = jSignage.getLocalCoord( obj.overlay, ev.clientX, ev.clientY );
                    obj.mouseClick( ev, click.x, click.y );
                });
            }
        }
    })
});

jSignage.extend({
    scrollArea: function( args ) {
        return new jSignage.scrollAreaClass( 'scrollArea', args );
    },

    scrollAreaClass: jSignage.subclass(
        jSignage.widgetClass,
        function( args ) {
            this.scrollX = 0;
            this.scrollY = 0;
            this.child = null;
            this.visibleWidth = 0;
            this.visibleHeight = 0;
            this.childWidth = 0;
            this.childHeight = 0;
        }, {

        postLayout: function( g, width, height ) {
            jSignage.widgetClass.prototype.postLayout.call( this, g, width, height );
            this.visibleWidth = width;
            this.visibleHeight = height;
            if ( this.child )
                jSignage.addInnerLayerOwnSize( this.attach, this.child, this.childWidth, this.childHeight );
        },

        add: function( layer ) {
            if ( this.child ) {
                if ( this.child.parentNode )
                    this.child.parentNode.removeChild( child );
                this.child = null;
            }
            if ( !layer.jsignage || !layer[0] )
                return;
            var child = layer[0];
            var bbox = jSignage.getBBox( jSignage.getRealMediaTarget( child ), this.attach );
            if ( !bbox || bbox.width<=0 || bbox.height<=0 )
                return;
            this.child = child;
            this.childWidth = bbox.width;
            this.childHeight = bbox.height;
            if ( this.visibleWidth && this.visibleHeight )
                jSignage.addInnerLayerOwnSize( this.attach, this.child, this.childWidth, this.childHeight );
            return this;
        },

        scrollTo: function( scrollX, scrollY ) {
            if ( scrollX+this.visibleWidth > this.childWidth )
                scrollX = this.childWidth - this.visibleWidth;
            if ( scrollX < 0 )
                scrollX = 0;
            if ( scrollY+this.visibleHeight > this.childHeight )
                scrollY = this.childHeight - this.visibleHeight;
            if ( scrollY < 0 )
                scrollY = 0;
            this.scrollX = scrollX;
            this.scrollY = scrollY;
            jSignage.getRealMediaTarget( this.child ).setAttribute( 'transform', 'translate('+(-scrollX)+','+(-scrollY)+')' );
        },

        drag: function( pixOffsetX, pixOffsetY ) {
            this.scrollTo( this.scrollX-pixOffsetX, this.scrollY-pixOffsetY );
        }
    }),

    carousel: function( args ) {
        if ( !args || !args.data || !args.data.length || !args.renderToSVG )
            return;
        var type = args.type || 'strip';
        if ( type=='strip' )
            return new jSignage.stripCarouselClass( 'carousel', args );
        else if ( type=='wheel' )
            return new jSignage.wheelCarouselClass( 'carousel', args );
        else if ( type=='roller' )
            return new jSignage.rollerCarouselClass( 'carousel', args );
        else if ( type=='squeeze' )
            return new jSignage.squeezeCarouselClass( 'carousel', args );
        else if ( type=='electron' )
            return new jSignage.electronCarouselClass( 'carousel', args );
        throw "Invalid carousel type: "+type;
    },

    carouselClass: jSignage.subclass(
        jSignage.widgetClass,
        function( args ) {
            this.data = args.data;
            this.renderToSVG = args.renderToSVG;
            this.numVisible = args.numVisible || 3;
            this.pixPosition = 0;   // Pixel position inside the sliding window. 0 means first image is in the center spot.
            this.pixSlide = 0;      // Number of pixel from one slide position to the next.
            this.maxPixPosition = 0;// Max pixel position, i.e. when the list image is in the center spot.
            this.idxToSVG = { };    // Cache of handle to SVG code for each data index
            this.anim = null;       // Handle to running animation or null
            this.animTimeout = null;
            this.slideWidth = 0;    // Vignette nominal width, i.e. when the slide is in the center spot
            this.slideHeight = 0;   // Vignette nominal height
            this.initialSlide = args.initialSlide || 0;
            this.looping = args.looping || false;
            this.spacing = jSignage.getPercent( args.spacing, 0.1 );
            var dir = args.direction || 'leftToRight';
            this.vertical = dir=='topToBottom' || dir=='bottomToTop';
            this.horizontal = !this.vertical;
            this.reverse = dir=='rightToLeft' || dir=='bottomToTop';
            this.autoNext = !!args.autoNext;
            this.autoNextInterval = jSignage.durInSeconds( args.autoNextInterval, 5 );
            this.draggable = 'draggable' in args ? !!args.draggable : true;
            this.autoTimer = null;
        }, {

        setWH : function( width, height ) {
            if ( this.horizontal ) {
                this.width = width;
                this.height = height;
            } else {
                this.width = height;
                this.height = width;
            }
        },

        postLayout: function( g, width, height ) {
            jSignage.widgetClass.prototype.postLayout.call( this, g, width, height );
            var self = this;
            this.beginEvent( function() {
                self.pixPosition = self.pixSlide * self.initialSlide;
                self._place( self.firstVisibleIdxR( self.pixPosition ), self.lastVisibleIdxR( self.pixPosition ) );
                if ( self.autoNext ) {
                    if ( self.autoTimer ) {
                        jSignage.clearInterval( self.autoTimer );
                        self.autoTimer = null;
                    }
                    self.autoTimer = jSignage.setInterval( function() {
                        if ( jSignage.isInRenderingTree( g ) ) {
                            self.next();
                        } else {
                            jSignage.clearInterval( self.autoTimer );
                            self.autoTimer = null;
                        }
                    }, self.autoNextInterval*1000 );
                }
            });
            if ( this.autoNext ) {
                this.endEvent( function() {
                    jSignage.clearInterval( self.autoTimer );
                    self.autoTimer = null;
                });
            }
        },

        next: function() {
            this._land( 1 );
        },

        previous: function() {
            this._land( -1 );
        },

        dragStop: function() {
            this._land( 0 );
        },

        drag: function( pixOffsetX, pixOffsetY ) {
            this._cancelAnimation();
            var offset = this.horizontal ? pixOffsetX : pixOffsetY;
            if ( this.reverse )
                offset = -offset;
            var newPixPosition = this.pixPosition - offset;
            if ( !this.looping ) {
                if ( newPixPosition < 0 )
                    newPixPosition = 0;
                else if ( newPixPosition > this.maxPixPosition )
                    newPixPosition = this.maxPixPosition;
            }
            this.pixPosition = newPixPosition;
            var idxFirst = this.firstVisibleIdxR( this.pixPosition );
            var idxLast = this.lastVisibleIdxR( this.pixPosition );
            this._place( idxFirst, idxLast );
            this._reap( idxFirst, idxLast );
        },

        _startAnimation: function( anim, removeAfter ) {        
            this.anim = anim;
            if ( jSignage.isArray( this.anim ) )
                for ( var i=0; i<this.anim.length; i++ )
                    jSignage.beginAnimation( this.anim[i] );
            else
                jSignage.beginAnimation( this.anim );
            if ( this.animTimeout ) {
                jSignage.clearTimeout( this.animTimeout );
                this.animTimeout = null;
            }
            var obj = this;
            this.animTimeout = jSignage.setTimeout( function() {
                obj._cancelAnimation();
                obj._reap( obj.firstVisibleIdxR( obj.pixPosition ), obj.lastVisibleIdxR( obj.pixPosition ) );
            }, removeAfter*1000 );
        },

        _cancelAnimation: function() {
            if ( this.anim ) {
                if ( jSignage.isArray( this.anim ) )
                    for ( var i=0; i<this.anim.length; i++ )
                        jSignage.removeAnimation( this.anim[i] );
                else
                    jSignage.removeAnimation( this.anim );
                if ( this.animTimeout ) {
                    jSignage.clearTimeout( this.animTimeout );
                    this.animTimeout = null;
                }
                this.anim = null;
            }
        },

        _reap: function( idxLeft, idxRight ) {
            for ( var i in this.idxToSVG ) if ( i<idxLeft || i>idxRight ) {
                if ( this.idxToSVG[i] )
                    this.attach.removeChild( this.idxToSVG[i] );
                delete this.idxToSVG[i];
            }
        },

        _placeSlide: function( i, cx, cy, sx, sy, opacity, zOrder ) {
            if ( this.idxToSVG[i]===undefined ) {
                var idx;
                if ( this.looping ) {
                    idx = i % this.data.length;
                    if ( idx < 0 )
                        idx += this.data.length;
                } else {
                    idx = i;
                }
                var layer = this.renderToSVG.call( this.data[idx], idx, this.data[idx] );
                if ( layer && layer.jsignage && layer[0] ) {
                    var gt = jSignage._createElement( 'g' );
                    gt.id = jSignage.guuid();
                    this.attach.appendChild( gt );
                    var gs = jSignage._createElement( 'g' );
                    gs.id = jSignage.guuid();
                    gt.appendChild( gs );
                    if ( this.horizontal )
                        jSignage.kickInnerLayer( gs, this.width, this.height, layer[0], -this.slideWidth/2, -this.slideHeight/2, this.slideWidth, this.slideHeight, jSignage.getCurrentTime() );
                    else
                        jSignage.kickInnerLayer( gs, this.height, this.width, layer[0], -this.slideHeight/2, -this.slideWidth/2, this.slideHeight, this.slideWidth, jSignage.getCurrentTime() );
                    this.idxToSVG[i] = gt;
                } else {
                    this.idxToSVG[i] = null;
                }
            }
            var s = this.idxToSVG[i];
            if ( s ) {
                var next = s.nextElementSibling;
                if ( next ) {
                    var zn = parseFloat( next.getAttributeNS( jSignage.spxNS, 'zOrder' ) );
                    if ( zOrder > zn ) {
                        for ( var ib = next.nextElementSibling; ib; ib=ib.nextElementSibling )
                            if ( parseFloat( ib.getAttributeNS( jSignage.spxNS, 'zOrder' ) ) >= zOrder )
                                break;
                        this.attach.insertBefore( s, ib );
                    }
                }
                var prev = s.previousElementSibling;
                if ( prev ) {
                    var zp = parseFloat( prev.getAttributeNS( jSignage.spxNS, 'zOrder' ) );
                    if ( zOrder < zp ) {
                        for ( var ib = prev; ib.previousElementSibling; ib=ib.previousElementSibling )
                            if ( parseFloat( ib.previousElementSibling.getAttributeNS( jSignage.spxNS, 'zOrder' ) ) <= zOrder )
                                break;                               
                        this.attach.insertBefore( s, ib );
                    }
                }
                if ( this.reverse )
                    cx = this.width - cx;                
                if ( this.vertical ) { var t = cx; cx = cy; cy = t; t = sx; sx = sy; sy = t; }
                s.setAttribute( 'transform', 'translate('+cx+','+cy+')' );
                s.firstElementChild.setAttribute( 'transform', 'scale('+sx+','+sy+')' );
                s.setAttribute( 'opacity', opacity );
                s.setAttributeNS( jSignage.spxNS, 'zOrder', zOrder );
            }
        },

        _land: function( slideOffset ) {
            this._cancelAnimation();
            var dur = 0.5;
            var left = this.clipIdx( Math.round( this.pixPosition/this.pixSlide ) + slideOffset );
            var oldPixPosition = this.pixPosition;
            this.pixPosition = left * this.pixSlide;
            if ( this._anim ) {
                var oldIdxFirst = this.firstVisibleIdxR( oldPixPosition ), oldIdxLast = this.lastVisibleIdxR( oldPixPosition );
                var newIdxFirst = this.firstVisibleIdxR( this.pixPosition ), newIdxLast = this.lastVisibleIdxR( this.pixPosition );
                var idxFirst = Math.min( oldIdxFirst, newIdxFirst ), idxLast = Math.max( oldIdxLast, newIdxLast );
                this._place( idxFirst, idxLast );
                this._startAnimation( this._anim( oldPixPosition, this.pixPosition, idxFirst, idxLast, dur ), dur );
            } else {
                var idxFirst = this.firstVisibleIdxR( this.pixPosition ), idxLast = this.lastVisibleIdxR( this.pixPosition );
                this._place( idxFirst, idxLast );
                this._reap( idxFirst, idxLast );
            }
        },

        firstVisibleIdxR: function( pixPosition ) {
            return this.clipIdx( this.firstVisibleIdx( pixPosition ) );
        },

        lastVisibleIdxR: function( pixPosition ) {
            return this.clipIdx( this.lastVisibleIdx( pixPosition ) );
        },
        
        clipIdx: function( idx ) {
            if ( !this.looping ) {
                if ( idx < 0 )
                    idx = 0;
                else if ( idx > this.data.length-1 )
                    idx = this.data.length-1;
            }
            return idx;
        },

        animTranslate: function( oldX, oldY, newX, newY, dur, target ) {
            var tx, ty;
            if ( this.horizontal ) {
                tx = oldX-newX;
                ty = oldY-newY;
                if ( this.reverse )
                    tx = -tx;
            } else {
                tx = oldY-newY;
                ty = oldX-newX;
                if ( this.reverse )
                    ty = -ty;
            }
            return jSignage.svgAnimation( target!==undefined ? this.idxToSVG[target] : this.attach, 'animateTransform', {
                attributeName: 'transform',
                type: 'translate',
                additive: 'sum',
                begin: 'indefinite',
                dur: dur,
                from: tx+','+ty,
                to: '0,0'
            });
        },

        animScale: function( oldSX, oldSY, newSX, newSY, dur, target ) {
            var sx, sy;
            if ( this.horizontal ) {
                sx = oldSX/newSX;
                sy = oldSY/newSY;
            } else {
                sx = oldSY/newSY;
                sy = oldSX/newSX;
            }
            return jSignage.svgAnimation( target!==undefined ? this.idxToSVG[target].firstElementChild : this.attach, 'animateTransform', {
                attributeName: 'transform',
                type: 'scale',
                additive: 'sum',
                begin: 'indefinite',
                dur: dur,
                from: sx+','+sy,
                to: '1,1'
            });
        },

        mouseClick: function( ev, x, y ) {
            if ( this.vertical ) {
                var t = x;
                x = y;
                y = t;
            }
            if ( this.reverse )
                x = this.width - x;
            if ( this.clickAt )
                this.clickAt( x, y );
        }
    })
    
});

jSignage.extend({

    stripCarouselClass: jSignage.subclass(
        jSignage.carouselClass,
        function( args ) {
            this.margin = 0;
        }, {

        postLayout: function( g, width, height ) {
            this.setWH( width, height );
            this.margin = Math.min( this.width, this.height ) * this.spacing;
            this.pixSlide = this.width / this.numVisible;
            this.maxPixPosition = this.pixSlide * ( this.data.length - this.numVisible );
            this.slideWidth = this.pixSlide-this.margin*2;
            this.slideHeight = this.height;
            jSignage.carouselClass.prototype.postLayout.call( this, g, width, height );
        },

        firstVisibleIdx: function( pixPosition ) {
            return Math.floor( (pixPosition+this.margin) / this.pixSlide );
        },

        lastVisibleIdx: function( pixPosition ) {
            return Math.floor( (pixPosition+this.pixSlide*this.numVisible-this.margin) / this.pixSlide );
        },

        _anim: function( oldPixPosition, newPixPosition, idxFirst, idxLast, dur ) {
            return this.animTranslate( -oldPixPosition, 0, -newPixPosition, 0, dur );
        },

        _place: function( idxLeft, idxRight ) {
            for ( var i = idxLeft; i<=idxRight; i++ )
                this._placeSlide( i, this.pixSlide*i - this.pixPosition + this.margin + this.slideWidth/2, this.slideHeight/2, 1, 1, 1, 0 );
        }/*,

        clickAt: function( x, y ) {
            x += this.pixPosition;
            var choice = Math.floor( x / this.pixSlide );
            if ( y >= this.margin && y < this.margin+this.slideHeight && x >= this.pixSlide*choice+this.margin && x < this.pixSlide*choice+this.margin+this.slideWidth ) {
                alert( 'Click on #'+choice );
            }
        }*/
    }),

    rollerCarouselClass: jSignage.subclass(
        jSignage.carouselClass,
        function( args ) {
            this.delta = 0;
            this.r = 0;
            this.margin = 0;
        }, {

        postLayout: function( g, width, height ) {
            this.setWH( width, height );
            this.delta = Math.PI / this.numVisible;
            this.margin = this.delta * ( 1 - this.spacing/2 );
            this.r = this.width / 2;
            this.pixSlide = this.r * this.delta;
            this.maxPixPosition = this.pixSlide * ( this.data.length-1 );
            this.slideWidth = this.r * 2 * Math.sin( this.delta/2-this.margin );
            this.slideHeight = this.height;
            jSignage.carouselClass.prototype.postLayout.call( this, g, width, height );
        },

        firstVisibleIdx: function( pixPosition ) {
            return Math.ceil( ( pixPosition / this.r - Math.PI/2 ) / this.delta );
        },

        lastVisibleIdx: function( pixPosition ) {
            return Math.floor( ( pixPosition / this.r + Math.PI/2 ) / this.delta );
        },

        _place: function( idxFirst, idxLast ) {
            for ( var i=idxFirst; i<=idxLast; i++ ) {
                var teta = i*this.delta - this.pixPosition/this.r;
                var x0 = Math.sin( teta-this.delta/2+this.margin ) * this.r;
                var x1 = Math.sin( teta+this.delta/2-this.margin ) * this.r;
                this._placeSlide( i, this.width/2+(x1+x0)/2, this.height/2, (x1-x0)/this.slideWidth, 1, 1, Math.cos(teta) );
            }
        },

        _anim: function( oldPixPosition, newPixPosition, idxFirst, idxLast, dur ) {
            var anim = [];
            for ( var i=idxFirst; i<=idxLast; i++ ) if ( this.idxToSVG[i] ) {
                var teta0 = i*this.delta-oldPixPosition/this.r;
                var teta1 = i*this.delta-newPixPosition/this.r;
                var u0 = Math.sin( teta0-this.delta/2+this.margin );
                var v0 = Math.sin( teta0+this.delta/2-this.margin );
                var u1 = Math.sin( teta1-this.delta/2+this.margin );
                var v1 = Math.sin( teta1+this.delta/2-this.margin );
                anim.push( this.animScale( v0-u0, 1, v1-u1, 1, dur, i ) );
                anim.push( this.animTranslate( (v0+u0)*this.r/2, 0, (v1+u1)*this.r/2, 0, dur, i ) );
            }
            return anim;
        }
    }),

    squeezeCarouselClass: jSignage.subclass(
        jSignage.carouselClass,
        function( args ) {
            this.ratio = args.ratio || 1.8;
            this.C = 0;
            this.margin = 0;
        }, {

        _h: function( x ) {
            var h = Math.abs(x) + this.C / 2 * x * x;
            return x >= 0 ? h : -h;
        },

        _x: function( h ) {
            var x = ( Math.sqrt( 1 + 2 * this.C * Math.abs(h) ) - 1 ) / this.C;
            return h >= 0 ? x : -x;
        },

        postLayout: function( g, width, height ) {
            this.setWH( width, height );
            this.C = (2/this.width)*(1/this.ratio-1);
            this.pixSlide = 2 / this.numVisible * this._x( this.width/2 );
            this.margin = this.pixSlide * this.spacing / 2;
            this.maxPixPosition = this.pixSlide * ( this.data.length-1 );
            this.slideWidth = this._h(this.pixSlide/2-this.margin) * 2;
            this.slideHeight = this.height;
            jSignage.carouselClass.prototype.postLayout.call( this, g, width, height );
        },

        firstVisibleIdx: function( pixPosition ) {
            return Math.floor( (pixPosition-this.pixSlide*(this.numVisible-1)/2) / this.pixSlide );
        },

        lastVisibleIdx: function( pixPosition ) {
            return Math.ceil( (pixPosition+this.pixSlide*(this.numVisible-1)/2) / this.pixSlide );
        },

        _place: function( idxFirst, idxLast ) {
            for ( var i=idxFirst; i<=idxLast; i++ ) {
                var x = i*this.pixSlide - this.pixPosition;
                var h0 = this._h( x - this.pixSlide/2 + this.margin );
                var h1 = this._h( x + this.pixSlide/2 - this.margin );
                this._placeSlide( i, this.width/2+(h1+h0)/2, this.height/2, (h1-h0)/this.slideWidth, 1, 1, 0 );
            }
        },

        _anim: function( oldPixPosition, newPixPosition, idxFirst, idxLast, dur ) {
            var anim = [];
            for ( var i=idxFirst; i<=idxLast; i++ ) if ( this.idxToSVG[i] ) {
                var x0 = i*this.pixSlide - oldPixPosition;
                var x1 = i*this.pixSlide - newPixPosition;
                var u0 = this._h( x0 - this.pixSlide/2 + this.margin );
                var v0 = this._h( x0 + this.pixSlide/2 - this.margin );
                var u1 = this._h( x1 - this.pixSlide/2 + this.margin );
                var v1 = this._h( x1 + this.pixSlide/2 - this.margin );
                anim.push( this.animScale( v0-u0, 1, v1-u1, 1, dur, i ) );
                anim.push( this.animTranslate( (v0+u0)/2, 0, (v1+u1)/2, 0, dur, i ) );
            }
            return anim;
        }
    }),

    wheelCarouselClass: jSignage.subclass(
        jSignage.carouselClass,
        function( args ) {
            this.r = 0;
            this.delta = 0;
        }, {

        postLayout: function( g, width, height ) {
            this.setWH( width, height );
            this.slideHeight = this.height;
            this.delta = Math.PI / ( this.numVisible - 1 );
            var C = 2 * Math.sin( this.delta/2 ) * ( 1 - this.spacing/2 );
            this.r = this.width / ( 2 + C/2 );
            this.slideWidth = C * this.r;
            this.pixSlide = this.r * this.delta;
            this.maxPixPosition = this.pixSlide * ( this.data.length -1 );
            jSignage.carouselClass.prototype.postLayout.call( this, g, width, height );
        },

        firstVisibleIdx: function( pixPosition ) {
            return Math.ceil( ( pixPosition / this.r - 1.7 ) / this.delta );
        },

        lastVisibleIdx: function( pixPosition ) {
            return Math.floor( ( pixPosition / this.r + 1.7 ) / this.delta );
        },

        _place: function( idxFirst, idxLast ) {
            for ( var i = idxFirst; i<=idxLast; i++ ) {
                var teta = i*this.delta-this.pixPosition/this.r;
                var depth = Math.cos( teta );
                var z = (1+depth)/2;
                this._placeSlide( i, this.width/2+Math.sin( teta )*this.r, this.height/2, z, z, 1, depth );
            }
        },

        _anim: function( oldPixPosition, newPixPosition, idxFirst, idxLast, dur ) {
            var anim = [];
            for ( var i=idxFirst; i<=idxLast; i++ ) if ( this.idxToSVG[i] ) {
                var teta0 = i*this.delta-oldPixPosition/this.r;
                var teta1 = i*this.delta-newPixPosition/this.r;
                var s0 = 1+Math.cos(teta0), s1 = 1+Math.cos(teta1);
                anim.push( this.animScale( s0, s0, s1, s1, dur, i ) );
                anim.push( this.animTranslate( this.r*Math.sin(teta0), 0, this.r*Math.sin(teta1), 0, dur, i ) );
            }
            return anim;
        }
    }),

    electronCarouselClass: jSignage.subclass(
        jSignage.carouselClass,
        function( args ) {
            this.r = 0;
            this.r2 = 0;
        }, {

        postLayout: function( g, width, height ) {
            this.setWH( width, height );
            this.slideHeight = this.height * ( 0.5 - this.spacing/2 );
            this.r2 = this.height/2 - this.slideHeight / 2;
            this.delta = 2 * Math.PI / this.data.length;
            this.r = this.width / ( 2 * ( 1 + Math.sin( this.delta/2 ) ) );
            this.slideWidth = 2 * Math.sin( this.delta/2 ) * this.r * ( 1 - this.spacing );
            this.pixSlide = this.r * this.delta;
            this.maxPixPosition = this.pixSlide * ( this.data.length -1 );
            jSignage.carouselClass.prototype.postLayout.call( this, g, width, height );
        },

        firstVisibleIdx: function( pixPosition ) {
            return 0;
        },

        lastVisibleIdx: function( pixPosition ) {
            return this.data.length-1;
        },

        _place: function( idxFirst, idxLast ) {
            for ( var i = idxFirst; i<=idxLast; i++ ) {
                var teta = i*this.delta-this.pixPosition/this.r;
                var x = Math.sin( teta ) * this.r;
                var y = Math.cos( teta ) * this.r2;
                this._placeSlide( i, this.width/2+x, this.height/2+y, 1, 1, 1, y );
            }
        },

        _anim: function( oldPixPosition, newPixPosition, idxFirst, idxLast, dur ) {
            var anim = [];
            for ( var i=idxFirst; i<=idxLast; i++ ) if ( this.idxToSVG[i] ) {
                var teta0 = i*this.delta-oldPixPosition/this.r;
                var teta1 = i*this.delta-newPixPosition/this.r;
                var d = new jSignage.pathData, x, y;
                var xx = this.r*Math.sin(teta1);
                var yy = this.r2*Math.cos(teta1);
                var x = this.r*Math.sin(teta0)-xx;
                var y = this.r2*Math.cos(teta0)-yy;
                if ( this.reverse ) x = -x;
                if ( this.vertical ) { var t = x; x = y; y = t; }
                d.moveTo( x, y );
                for ( var j = 1; j < 10; j++ ) {
                    var teta = teta0+(teta1-teta0)*j/10;
                    x = this.r*Math.sin(teta)-xx;
                    y = this.r2*Math.cos(teta)-yy;
                    if ( this.reverse ) x = -x;
                    if ( this.vertical ) { var t = x; x = y; y = t; }
                    d.lineTo( x, y );
                }
                d.lineTo( 0, 0 );
                anim.push( jSignage.svgAnimation( this.idxToSVG[i], 'animateMotion', {
                    begin: 'indefinite',
                    dur: dur,
                    path: d
                }));
            }
            return anim;
        }
    })
});

var htmlColorKeywords = {
    black: '#000000', green: '#008000', silver: '#C0C0C0', lime: '#00FF00',
    gray: '#808080', olive: '#808000', white: '#FFFFFF', yellow: '#FFFF00',
    maroon: '#800000', navy: '#000080', red: '#FF0000', blue: '#0000FF',
    purple: '#800080', teal: '#008080', fuchsia: '#FF00FF', aqua: '#00FFFF'
};

var reHexColor1 = /^#([a-fA-F0-9])([a-fA-F0-9])([a-fA-F0-9])$/;
var reHexColor2 = /^#([a-fA-F0-9][a-fA-F0-9])([a-fA-F0-9][a-fA-F0-9])([a-fA-F0-9][a-fA-F0-9])$/;
var reRGBColor1 = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/;
var reRGBColor2 = /^rgb\(\s*([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)%\s*,\s*([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)%\s*,\s*([+-]?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)%\s*\)$/;

function hex2dec( h ) {
    var d = 0, i, c, x;
    for ( i=0; i<h.length; i++ ) {
        c = h.charCodeAt( i );
        x = ( c>=48 && c<=57 ) ? c-48 : ( c>=65 && c<=70 ) ? c-65+10 : ( c>=97 && c<=102 ) ? c-97+10 : 0;
        d = d*16+x;
    }
    return d;
}

jSignage.extend({
    popup: function( layer, args ) {
        if ( !layer || !layer.jsignage || !layer.length )
            return;
        var dimming = jSignage.getPercent( args && args.dimming, 0.5 );
        var popupDur = jSignage.durInSeconds( args && args.popupDur, 0 );
        var popoutDur = jSignage.durInSeconds( args && args.popoutDur, 0 );
        var svg = document.documentElement;
        var viewBox = jSignage.getDocumentViewbox();
        var dimmer = jSignage._createElement( 'rect', {
            width: viewBox.width,
            height: viewBox.height,
            stroke: 'none',
            fill: '#808080',
            'fill-opacity': 1-dimming
        });
        svg.appendChild( dimmer );
        if ( popupDur > 0 )
            jSignage.beginAnimation( jSignage.svgAnimation( dimmer, 'animate', {
                attributeName: 'fill-opacity',
                from: '0',
                to: 1-dimming,
                dur: popupDur
            }));
        var media = jSignage.getRealMediaTarget( layer[0] );
        var timingElement = jSignage.getTimingElement( media );
        jSignage.endEventOnce( timingElement, function() {
            svg.removeChild( layer[0] );
            if ( popoutDur ) {
                jSignage.beginAnimation( jSignage.svgAnimation( dimmer, 'animate', {
                    attributeName: 'fill-opacity',
                    from: 1-dimming,
                    to: '0',
                    fill: 'freeze',
                    dur: popoutDur
                }), 0, function() {
                    svg.removeChild( dimmer );
                });
            } else {
                svg.removeChild( dimmer );
            }
        });
        jSignage.addAndKick( svg, layer[0], timingElement, popupDur );
        var bbox = jSignage.getBBox( media, null );
        if ( bbox && bbox.height>0 && bbox.width>0 )
            layer[0].setAttribute( 'transform', 'translate('+(viewBox.width-bbox.width)/2+','+(viewBox.height-bbox.height)/2+')' );
    },

    uiStyle: 'manzana', uiColor: '#4080FF',

    _shadeCache: { },

    rgb: function( r, g, b ) {
        return 'rgb(' + Math.min( Math.max( Math.floor( r ), 0 ), 255 ) + ',' + Math.min( Math.max( Math.floor( g ), 0 ), 255 ) + ',' + Math.min( Math.max( Math.floor( b ), 0 ), 255 ) + ')';
    },

    colorToRGB: function( color ) {
        if ( color in htmlColorKeywords )
            color = htmlColorKeywords[color];
        var m = reHexColor2.exec( color );
        if ( m ) {
            return {
                red: hex2dec( m[1] ),
                green: hex2dec( m[2] ),
                blue: hex2dec( m[3] )
            };
        }
        m = reHexColor1.exec( color );
        if ( m ) {
            var r = hex2dec(m[1]), g = hex2dec(m[2]), b = hex2dec(m[3]);
            return {
                red: r*16+r,
                green: g*16+g,
                blue: b*16+b
            };
        }
        m = reRGBColor1.exec( color );
        if ( m ) {
            var r = parseFloat(m[1]), g = parseFloat(m[2]), b=parseFloat(m[3]);
            return {
                red: isNan(r) || r<0 ? 0 : r>255 ? 255: r,
                green: isNan(g) || g<0 ? 0 : g>255 ? 255: g,
                blue: isNan(b) || b<0 ? 0 : b>255 ? 255: b
            };
        }
        m = reRGBColor2.exec( color );
        if ( m ) {
            var r = parseFloat(m[1]), g = parseFloat(m[2]), b=parseFloat(m[3]);
            return {
                red: isNan(r) || r<0 ? 0 : r>100 ? 255: r*2.55,
                green: isNan(g) || g<0 ? 0 : g>100 ? 255: g*2.55,
                blue: isNan(b) || b<0 ? 0 : b>100 ? 255: b*2.55
            };
        }        
        var g = document.createElementNS( jSignage.svgNS, 'g' );
        g.setAttribute( 'fill', color );                   
        if ( g.getRGBColorTrait ) {
            return g.getRGBColorTrait( 'fill' );
        }
        try {
            var pv = g.getPresentationAttribute('fill').rgbColor;
            return {
                red: pv.red.getFloatValue( CSSPrimitiveValue.CSS_NUMBER ),
                green: pv.green.getFloatValue( CSSPrimitiveValue.CSS_NUMBER ),
                blue: pv.blue.getFloatValue( CSSPrimitiveValue.CSS_NUMBER )
            };
        } catch( e ) {
        }
        return { red: 0, green: 0, blue: 0 };
    },

    RGBToHSL: function( rgb ) {
        var hsl = { hue: 0, saturation: 0, lightness: 0 };
        var cmax = Math.max( rgb.red, rgb.green, rgb.blue );
        var cmin = Math.min( rgb.red, rgb.green, rgb.blue );
        var delta = cmax - cmin;
        hsl.lightness = ( cmax + cmin ) / 510;
        if ( delta > 0 ) {
            if ( cmax==rgb.red ) {
                var x = ( rgb.green - rgb.blue ) / delta;
                x = x - 6 * Math.floor( x / 6 );
                hsl.hue = 60 * x;
            } else if ( cmax==rgb.green ) {
                var x = ( rgb.blue - rgb.red ) / delta + 2;
                x = x - 6 * Math.floor( x / 6 );
                hsl.hue = 60 * x;
            } else if ( cmax==rgb.blue ) {
                var x = ( rgb.red - rgb.green ) / delta + 4;
                x = x - 6 * Math.floor( x / 6 );
                hsl.hue = 60 * x;
            }
            hsl.saturation = delta / ( 255 * ( 1 - Math.abs(2*hsl.lightness-1) ) );
        }
        return hsl;
    },

    HSLToRGB: function( hsl ) {
        var C = ( 1 - Math.abs( 2 * hsl.lightness - 1 ) ) * hsl.saturation;
        var x = hsl.hue / 60;
        x = x - 2 * Math.floor( x / 2 );
        var X = C * ( 1 - Math.abs( x - 1 ) );
        var m = hsl.lightness - C / 2;
        var rgb = { red: 0, green: 0, blue: 0 };
        if ( hsl.hue < 60 ) {
            rgb.red = C;
            rgb.green = X;
        } else if ( hsl.hue < 120 ) {
            rgb.red = X;
            rgb.green = C;
        } else if ( hsl.hue < 180 ) {
            rgb.green = C;
            rgb.blue = X;
        } else if ( hsl.hue < 240 ) {
            rgb.green = X;
            rgb.blue = C;
        } else if ( hsl.hue < 300 ) {
            rgb.red = X;
            rgb.blue = C;
        } else {
            rgb.red = C;
            rgb.blue = X;
        }
        rgb.red = Math.min(( rgb.red + m ) * 255, 255 );
        rgb.green = Math.min(( rgb.green + m ) * 255, 255 );
        rgb.blue = Math.min(( rgb.blue + m ) * 255, 255 );
        return rgb;
    },

    hsl: function ( h, s, l ) {
        h = h - 360 * Math.floor( h / 360 );
        s = Math.min( Math.max( s, 0 ), 1 );
        l = Math.min( Math.max( l, 0 ), 1 );
        var rgb = jSignage.HSLToRGB( { hue: h, saturation: s, lightness: l } );
        return jSignage.rgb( rgb.red, rgb.green, rgb.blue );
    },

    shades: function( color ) {
        if ( color in jSignage._shadeCache )
            return jSignage._shadeCache[color];
        var rgb = jSignage.colorToRGB( color );
        return jSignage._shadeCache[color] = {
            normal: color,
            darker: jSignage.rgb( rgb.red*0.75+32, rgb.green*0.75+32, rgb.blue*0.75+32 ),
            lighter: jSignage.rgb( rgb.red*0.5+128, rgb.green*0.5+128, rgb.blue*0.5+128 )
        };
    },

    progressWheel: function( args ) {
        var style = args && args.style || jSignage.uiStyle;
        var barCount=12, innerRadius, outerRadius, barWidth, lineCap, color='white';
        if ( style=='manzana' ) {
            innerRadius=0.5;
            outerRadius=0.9;
            barWidth=0.15;
            lineCap='round';
        } else if ( style=='round' ) {
            innerRadius = 0.8;
            outerRadius = 0.8;
            barWidth = 0.25;
            lineCap='round';
        } else if ( style=='square' ) {
            innerRadius = 0.7;
            outerRadius = 0.95;
            barWidth = 0.25;
            lineCap='butt';
        }
        barCount = args && args.barCount || barCount;
        innerRadius = jSignage.getPercent( args && args.innerRadius ) || innerRadius;
        outerRadius = jSignage.getPercent( args && args.outerRadius ) || outerRadius;
        barWidth = jSignage.getPercent( args && args.barWidth ) || barWidth;
        lineCap = args && args.lineCap || lineCap;
        color = args && args.color || 'white';
        var layer = jSignage.customLayer( 'progressWheel', args, null, function( width, height ) {
            var timingId = jSignage.getTimingElement( layer[0] ).id;
            var cx = width/2, cy = height/2, radius = Math.min( cx, cy );
            var ro = outerRadius*radius, ri = innerRadius*radius;
            jSignage.setAttributes( this, {
                stroke: color,
                'stroke-opacity': '0.3',
                'stroke-width': barWidth*radius,
                'stroke-linecap': lineCap
            });
            for ( var a=0; a<360; a+=360/barCount ) {
                var cos = Math.cos( a*Math.PI/180 ), sin = Math.sin( a*Math.PI/180 );
                var line = jSignage._createElement( 'line', {
                    x1: cx+ri*sin,
                    y1: cy-ri*cos,
                    x2: cx+ro*sin,
                    y2: cy-ro*cos
                });
                jSignage.svgAnimation( line, 'animate', {
                    attributeName: 'stroke-opacity',
                    begin: timingId+'.begin+'+(a/360),
                    dur: '1',
                    repeatCount: 'indefinite',
                    values: '1;0.3;0.3',
                    keyTimes: '0;0.5;1'
                });
                this.appendChild( line );
            }
        });
        return layer;
    },

    progressBar: function( args ) {
        var style = args && args.style || jSignage.uiStyle;
        var color = args && args.color || jSignage.uiColor;
        var shades = jSignage.shades( color );

        var layer = jSignage.customLayer( 'progressBar', args, null, function( width, height ) {
            var gradient;
            if ( style=='manzana' ) {
                gradient = jSignage._linearGradient({ x1: 0, y1: 0, x2: 0, y2: height, stops: [
                    { offset: 0, color: shades.lighter },
                    { offset: 0.5, color: shades.normal },
                    { offset: 0.5, color: shades.darker },
                    { offset: 1, color: shades.darker }
                ]});
            } else {
                gradient = jSignage._linearGradient({ x1: 0, y1: 0, x2: width, y2: 0, stops: [
                    { offset: 0, color: shades.normal },
                    { offset: 1, color: shades.lighter }
                ]});
            }
            this.appendChild( gradient );
            var r = style=='square' ? 0 : height*0.15;
            var bar = jSignage._createElement( 'rect', {
                width: layer.progress*width,
                height: height,
                fill: 'url(#'+gradient.id+')',
                stroke: 'none',
                rx: r,
                ry: r
            });
            layer.barElem = bar;
            layer.barWidth = width;
            this.appendChild( bar );
            if ( style=='square' || style=='round' ) {
                this.appendChild( jSignage._createElement( 'rect', {
                    width: width,
                    height: height,
                    fill: 'none',
                    stroke: shades.lighter,
                    'stroke-width': height*0.05,
                    rx: r,
                    ry: r
                }));
            }
        });
        layer.progress = 0;
        layer.setProgress = function( progress ) {
            progress = jSignage.getPercent( progress );
            if ( progress < 0 )
                progress = 0;
            if ( progress > 1 )
                progress = 1;
            this.progress = progress;
            if ( this.barElem )
                this.barElem.setAttribute( 'width', progress*this.barWidth );
        };
        return layer;
    },

    pushButton: function( args, child ) {
        args.frame = {
            uiStyle: args && args.style || jSignage.uiStyle,
            backColor: args && args.color,
            corners: args && args.direction,
            padding: '15%'
        };
        var layer = jSignage.g( args );
        if ( child!==undefined ) {
            if ( typeof child === "string" ) {
                targs = { fontSize: 'max', fill: 'white' };
                jSignage.copyProps( args, targs, textProps );
                child = jSignage.textArea( targs ).text( child );
            }
            layer.add( child );
        }
        return layer;
    }
});

})();

// Events

(function() {

var rformElems = /^(?:input|select|textarea)$/i,
	rkeyEvent = /^key/,
	rtextEvent = /^text/,
	rtimeEvent = /^(?:begin|end|repeat)/,
	rmouseEvent = /^(?:mouse|contextmenu)|click/,
	rfocusMorph = /^(?:focusinfocus|focusoutblur)$/,
	rtypenamespace = /^([^.]*)(?:\.(.+)|)$/,
	strundefined = typeof undefined,
	hasOwn = ({}).hasOwnProperty,
	rnotwhite = (/\S+/g),
    slice = Array.prototype.slice,
    concat = Array.prototype.concat,
    push = Array.prototype.push,
    indexOf = Array.prototype.indexOf;

function returnTrue() {
	return true;
}

function returnFalse() {
	return false;
}

jSignage.event = {

	add: function( elem, types, handler, data, selector ) {
		var tmp, events, t, handleObjIn,
			special, eventHandle, handleObj,
			handlers, type, namespaces, origType;

        if ( elem.nodeType===1 ) {
            if ( types=='beginEvent' || types=='endEvent' || types=='repeatEvent' )
                elem = jSignage.getTimingElement( jSignage.getRealMediaTarget(elem) );
            else
                elem = jSignage.getRealMediaTarget(elem);
        }

        var elemData = jSignage._data( elem );
		// Don't attach events to noData or text/comment nodes (but allow plain objects)
		if ( !elemData ) {
			return;
		}

		// Caller can pass in an object of custom data in lieu of the handler
		if ( handler.handler ) {
			handleObjIn = handler;
			handler = handleObjIn.handler;
			selector = handleObjIn.selector;
		}

		// Make sure that the handler has a unique ID, used to find/remove it later
		if ( !handler.guid ) {
			handler.guid = jSignage.guid++;
		}

		// Init the element's event structure and main handler, if this is the first
		if ( !(events = elemData.events) ) {
			events = elemData.events = {};
		}
		if ( !(eventHandle = elemData.handle) ) {
			eventHandle = elemData.handle = function( e ) {
				// Discard the second event of a jSignage.event.trigger() and
				// when an event is called after a page has unloaded
				return typeof jSignage !== strundefined && (!e || jSignage.event.triggered !== e.type) ?
					jSignage.event.dispatch.apply( eventHandle.elem, arguments ) :
					undefined;
			};
			// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
			eventHandle.elem = elem;
		}

		// Handle multiple events separated by a space
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// There *must* be a type, no attaching namespace-only handlers
			if ( !type ) {
				continue;
			}

			// If event changes its type, use the special event handlers for the changed type
			special = jSignage.event.special[ type ] || {};

			// If selector defined, determine special event api type, otherwise given type
			type = ( selector ? special.delegateType : special.bindType ) || type;

			// Update special based on newly reset type
			special = jSignage.event.special[ type ] || {};

			// handleObj is passed to all event handlers
			handleObj = jSignage.extend({
				type: type,
				origType: origType,
				data: data,
				handler: handler,
				guid: handler.guid,
				selector: selector,
				needsContext: selector && jSignage.expr.match.needsContext.test( selector ),
				namespace: namespaces.join(".")
			}, handleObjIn );

			// Init the event handler queue if we're the first
			if ( !(handlers = events[ type ]) ) {
				handlers = events[ type ] = [];
				handlers.delegateCount = 0;

				// Only use addEventListener/attachEvent if the special events handler returns false
				if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
					// Bind the global event handler to the element
					if ( type=='beginEvent' || type=='endEvent' ) {
					    jSignage[type]( elem, jSignage.timeline ? handler : eventHandle );
					} else if ( elem.addEventListener ) {
						elem.addEventListener( type, eventHandle, false );
					} else if ( elem.attachEvent ) {
						elem.attachEvent( "on" + type, eventHandle );
					}
				}
			}

			if ( special.add ) {
				special.add.call( elem, handleObj );

				if ( !handleObj.handler.guid ) {
					handleObj.handler.guid = handler.guid;
				}
			}

			// Add to the element's handler list, delegates in front
			if ( selector ) {
				handlers.splice( handlers.delegateCount++, 0, handleObj );
			} else {
				handlers.push( handleObj );
			}

		}

		// Nullify elem to prevent memory leaks in IE
		elem = null;
	},

	// Detach an event or set of events from an element
	remove: function( elem, types, handler, selector, mappedTypes ) {
		var j, handleObj, tmp,
			origCount, t, events,
			special, handlers, type,
			namespaces, origType;

        if ( elem.nodeType===1 ) {
            if ( types=='beginEvent' || types=='endEvent' || types=='repeatEvent' )
                elem = jSignage.getTimingElement( jSignage.getRealMediaTarget(elem) );
            else
                elem = jSignage.getRealMediaTarget(elem);
        }

        var elemData = jSignage.hasData( elem ) && jSignage._data( elem );
		if ( !elemData || !(events = elemData.events) ) {
			return;
		}

		// Once for each type.namespace in types; type may be omitted
		types = ( types || "" ).match( rnotwhite ) || [ "" ];
		t = types.length;
		while ( t-- ) {
			tmp = rtypenamespace.exec( types[t] ) || [];
			type = origType = tmp[1];
			namespaces = ( tmp[2] || "" ).split( "." ).sort();

			// Unbind all events (on this namespace, if provided) for the element
			if ( !type ) {
				for ( type in events ) {
					jSignage.event.remove( elem, type + types[ t ], handler, selector, true );
				}
				continue;
			}

			special = jSignage.event.special[ type ] || {};
			type = ( selector ? special.delegateType : special.bindType ) || type;
			handlers = events[ type ] || [];
			tmp = tmp[2] && new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" );

			// Remove matching events
			origCount = j = handlers.length;
			while ( j-- ) {
				handleObj = handlers[ j ];

				if ( ( mappedTypes || origType === handleObj.origType ) &&
					( !handler || handler.guid === handleObj.guid ) &&
					( !tmp || tmp.test( handleObj.namespace ) ) &&
					( !selector || selector === handleObj.selector || selector === "**" && handleObj.selector ) ) {
					handlers.splice( j, 1 );

					if ( handleObj.selector ) {
						handlers.delegateCount--;
					}
					if ( special.remove ) {
						special.remove.call( elem, handleObj );
					}
				}
			}

			// Remove generic event handler if we removed something and no more handlers exist
			// (avoids potential for endless recursion during removal of special event handlers)
			if ( origCount && !handlers.length ) {
				if ( !special.teardown || special.teardown.call( elem, namespaces, elemData.handle ) === false ) {
					jSignage.removeEvent( elem, type, elemData.handle );
				}

				delete events[ type ];
			}
		}

		// Remove the expando if it's no longer used
		if ( jSignage.isEmptyObject( events ) ) {
			delete elemData.handle;

			// removeData also checks for emptiness and clears the expando if empty
			// so use it instead of delete
			jSignage._removeData( elem, "events" );
		}
	},

	trigger: function( event, data, elem, onlyHandlers ) {
		var handle, ontype, cur,
			bubbleType, special, tmp, i,
            doc = document.documentElement.ownerDocument,   // Required to get the right document object on SpinetiX
			eventPath = [ elem || doc ],
			type = hasOwn.call( event, "type" ) ? event.type : event,
			namespaces = hasOwn.call( event, "namespace" ) ? event.namespace.split(".") : [];

		cur = tmp = elem = elem || doc;

		// Don't do events on text and comment nodes
		if ( elem.nodeType === 3 || elem.nodeType === 8 ) {
			return;
		}

		// focus/blur morphs to focusin/out; ensure we're not firing them right now
		if ( rfocusMorph.test( type + jSignage.event.triggered ) ) {
			return;
		}

		if ( type.indexOf(".") >= 0 ) {
			// Namespaced trigger; create a regexp to match event type in handle()
			namespaces = type.split(".");
			type = namespaces.shift();
			namespaces.sort();
		}
		ontype = type.indexOf(":") < 0 && "on" + type;

		// Caller can pass in a jSignage.Event object, Object, or just an event type string
		event = event[ jSignage.expando ] ?
			event :
			new jSignage.Event( type, typeof event === "object" && event );

		// Trigger bitmask: & 1 for native handlers; & 2 for jSignage (always true)
		event.isTrigger = onlyHandlers ? 2 : 3;
		event.namespace = namespaces.join(".");
		event.namespace_re = event.namespace ?
			new RegExp( "(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)" ) :
			null;

		// Clean up the event in case it is being reused
		event.result = undefined;
		if ( !event.target ) {
			event.target = elem;
		}

		// Clone any incoming data and prepend the event, creating the handler arg list
		data = data == null ?
			[ event ] :
			jSignage.makeArray( data, [ event ] );

		// Allow special events to draw outside the lines
		special = jSignage.event.special[ type ] || {};
		if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
			return;
		}

		// Determine event propagation path in advance, per W3C events spec (#9951)
		// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		if ( !onlyHandlers && !special.noBubble && !jSignage.isWindow( elem ) ) {

			bubbleType = special.delegateType || type;
			if ( !rfocusMorph.test( bubbleType + type ) ) {
				cur = cur.parentNode;
			}
			for ( ; cur; cur = cur.parentNode ) {
				eventPath.push( cur );
				tmp = cur;
			}

			// Only add window if we got to document (e.g., not plain obj or detached DOM)
			if ( tmp === (elem.ownerDocument || doc) ) {
				eventPath.push( tmp.defaultView || tmp.parentWindow || window );
			}
		}

		// Fire handlers on the event path
		i = 0;
		while ( (cur = eventPath[i++]) && !event.isPropagationStopped() ) {

			event.type = i > 1 ?
				bubbleType :
				special.bindType || type;

			// jSignage handler
			handle = ( jSignage._data( cur, "events" ) || {} )[ event.type ] && jSignage._data( cur, "handle" );
			if ( handle ) {
				handle.apply( cur, data );
			}

			// Native handler
			handle = ontype && cur[ ontype ];
			if ( handle && handle.apply && jSignage.acceptData( cur ) ) {
				event.result = handle.apply( cur, data );
				if ( event.result === false ) {
					event.preventDefault();
				}
			}
		}
		event.type = type;

		// If nobody prevented the default action, do it now
		if ( !onlyHandlers && !event.isDefaultPrevented() ) {

			if ( (!special._default || special._default.apply( eventPath.pop(), data ) === false) &&
				jSignage.acceptData( elem ) ) {

				// Call a native DOM method on the target with the same name name as the event.
				// Can't use an .isFunction() check here because IE6/7 fails that test.
				// Don't do default actions on window, that's where global variables be (#6170)
				if ( ontype && elem[ type ] && !jSignage.isWindow( elem ) ) {

					// Don't re-trigger an onFOO event when we call its FOO() method
					tmp = elem[ ontype ];

					if ( tmp ) {
						elem[ ontype ] = null;
					}

					// Prevent re-triggering of the same event, since we already bubbled it above
					jSignage.event.triggered = type;
					try {
						elem[ type ]();
					} catch ( e ) {
						// IE<9 dies on focus/blur to hidden element (#1486,#12518)
						// only reproducible on winXP IE8 native, not IE9 in IE8 mode
					}
					jSignage.event.triggered = undefined;

					if ( tmp ) {
						elem[ ontype ] = tmp;
					}
				}
			}
		}

		return event.result;
	},

	dispatch: function( event ) {

		// Make a writable jSignage.Event from the native event object
		event = jSignage.event.fix( event );

		var i, ret, handleObj, matched, j,
			handlerQueue = [],
			args = slice.call( arguments ),
			handlers = ( jSignage._data( this, "events" ) || {} )[ event.type ] || [],
			special = jSignage.event.special[ event.type ] || {};

		// Use the fix-ed jSignage.Event rather than the (read-only) native event
		args[0] = event;
		event.delegateTarget = this;

		// Call the preDispatch hook for the mapped type, and let it bail if desired
		if ( special.preDispatch && special.preDispatch.call( this, event ) === false ) {
			return;
		}

		// Determine handlers
		handlerQueue = jSignage.event.handlers.call( this, event, handlers );

		// Run delegates first; they may want to stop propagation beneath us
		i = 0;
		while ( (matched = handlerQueue[ i++ ]) && !event.isPropagationStopped() ) {
			event.currentTarget = matched.elem;

			j = 0;
			while ( (handleObj = matched.handlers[ j++ ]) && !event.isImmediatePropagationStopped() ) {

				// Triggered event must either 1) have no namespace, or
				// 2) have namespace(s) a subset or equal to those in the bound event (both can have no namespace).
				if ( !event.namespace_re || event.namespace_re.test( handleObj.namespace ) ) {

				    event.handleObj = handleObj;
				    if ( !event.originalEvent || !event.originalEvent.data )
				        event.data = handleObj.data;

					ret = ( (jSignage.event.special[ handleObj.origType ] || {}).handle || handleObj.handler )
							.apply( matched.elem, args );

					if ( ret !== undefined ) {
						if ( (event.result = ret) === false ) {
							event.preventDefault();
							event.stopPropagation();
						}
					}
				}
			}
		}

		// Call the postDispatch hook for the mapped type
		if ( special.postDispatch ) {
			special.postDispatch.call( this, event );
		}

		return event.result;
	},

	handlers: function( event, handlers ) {
		var sel, handleObj, matches, i,
			handlerQueue = [],
			delegateCount = handlers.delegateCount,
			cur = event.target;

		// Find delegate handlers
		// Black-hole SVG <use> instance trees (#13180)
		// Avoid non-left-click bubbling in Firefox (#3861)
		if ( delegateCount && cur.nodeType && (!event.button || event.type !== "click") ) {

			/* jshint eqeqeq: false */
			for ( ; cur != this; cur = cur.parentNode || this ) {
				/* jshint eqeqeq: true */

				// Don't check non-elements (#13208)
				// Don't process clicks on disabled elements (#6911, #8165, #11382, #11764)
				if ( cur.nodeType === 1 && (cur.disabled !== true || event.type !== "click") ) {
					matches = [];
					for ( i = 0; i < delegateCount; i++ ) {
						handleObj = handlers[ i ];

						// Don't conflict with Object.prototype properties (#13203)
						sel = handleObj.selector + " ";

						if ( matches[ sel ] === undefined ) {
							matches[ sel ] = handleObj.needsContext ?
								jSignage( sel, this ).index( cur ) >= 0 :
								jSignage.find( sel, this, null, [ cur ] ).length;
						}
						if ( matches[ sel ] ) {
							matches.push( handleObj );
						}
					}
					if ( matches.length ) {
						handlerQueue.push({ elem: cur, handlers: matches });
					}
				}
			}
		}

		// Add the remaining (directly-bound) handlers
		if ( delegateCount < handlers.length ) {
			handlerQueue.push({ elem: this, handlers: handlers.slice( delegateCount ) });
		}

		return handlerQueue;
	},

	fix: function( event ) {
		if ( event[ jSignage.expando ] ) {
			return event;
		}

		// Create a writable copy of the event object and normalize some properties
		var i, prop, copy,
			type = event.type,
			originalEvent = event,
			fixHook = this.fixHooks[ type ];

		if ( !fixHook ) {
			this.fixHooks[ type ] = fixHook =
			    rtimeEvent.test( type ) ? this.timeHooks :
				rmouseEvent.test( type ) ? this.mouseHooks :
				rkeyEvent.test( type ) ? this.keyHooks :
				rtextEvent.test( type ) ? this.textHooks :
				{};
		}
		copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;

		event = new jSignage.Event( originalEvent );

		i = copy.length;
		while ( i-- ) {
			prop = copy[ i ];
			event[ prop ] = originalEvent[ prop ];
		}

		// Support: IE<9
		// Fix target property (#1925)
		if ( !event.target ) {
			event.target = originalEvent.srcElement || document;
		}

		// Support: Chrome 23+, Safari?
		// Target should not be a text node (#504, #13143)
		if ( event.target.nodeType === 3 ) {
			event.target = event.target.parentNode;
		}

		// Support: IE<9
		// For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
		event.metaKey = !!event.metaKey;

		return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
	},

	// Includes some event props shared by KeyEvent and MouseEvent
	props: "bubbles cancelable currentTarget target timeStamp eventPhase".split(" "),

	fixHooks: {},
	
	timeHooks: {
	    props: "detail"
	},

	keyHooks: {
		props: "altKey ctrlKey metaKey relatedTarget shiftKey keyIdentifier".split(" "),
		filter: function( event, original ) {
		    /*
			// Add which for key events
			if ( event.which == null ) {
				event.which = original.charCode != null ? original.charCode : original.keyCode;
			}
			*/
			event.getModifierState = function( keyArg ) { return original.getModifierState( keyArg ); };
			return event;
		}
	},

	textHooks: {
		props: "relatedTarget data".split(" "),
		filter: function( event, original ) {
		    /*
			*/
			return event;
		}
	},

	mouseHooks: {
		props: "altKey ctrlKey metaKey relatedTarget shiftKey view which button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
		filter: function( event, original ) {
			var body, eventDoc, doc,
				button = original.button,
				fromElement = original.fromElement;

			// Add relatedTarget, if necessary
			if ( !event.relatedTarget && fromElement ) {
				event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
			}

			// Add which for click: 1 === left; 2 === middle; 3 === right
			// Note: button is not normalized, so don't use it
			if ( !event.which && button !== undefined ) {
				event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
			}

			return event;
		}
	},

	special: {
		load: {
			// Prevent triggered image.load events from bubbling to window.load
			noBubble: true
		}
	},

	simulate: function( type, elem, event, bubble ) {
		// Piggyback on a donor event to simulate a different one.
		// Fake originalEvent to avoid donor's stopPropagation, but if the
		// simulated event prevents default then we do the same on the donor.
		var e = jSignage.extend(
			new jSignage.Event(),
			event,
			{
				type: type,
				isSimulated: true,
				originalEvent: {}
			}
		);
		if ( bubble ) {
			jSignage.event.trigger( e, null, elem );
		} else {
			jSignage.event.dispatch.call( elem, e );
		}
		if ( e.isDefaultPrevented() ) {
			event.preventDefault();
		}
	}
};

jSignage.removeEvent = document.removeEventListener ?
	function( elem, type, handle ) {
		if ( elem.removeEventListener ) {
			elem.removeEventListener( type, handle, false );
		}
	} :
	function( elem, type, handle ) {
		var name = "on" + type;

		if ( elem.detachEvent ) {

			// #8545, #7054, preventing memory leaks for custom events in IE6-8
			// detachEvent needed property on element, by name of that event, to properly expose it to GC
			if ( typeof elem[ name ] === strundefined ) {
				elem[ name ] = null;
			}

			elem.detachEvent( name, handle );
		}
	};

jSignage.Event = function( src, props ) {
	// Allow instantiation without the 'new' keyword
	if ( !(this instanceof jSignage.Event) ) {
		return new jSignage.Event( src, props );
	}

	// Event object
	if ( src && src.type ) {
		this.originalEvent = src;
		this.type = src.type;

		// Events bubbling up the document may have been marked as prevented
		// by a handler lower down the tree; reflect the correct value.
		this.isDefaultPrevented = src.defaultPrevented ||
				src.defaultPrevented === undefined && (
				// Support: IE < 9
				src.returnValue === false ||
				// Support: Android < 4.0
				src.getPreventDefault && src.getPreventDefault() ) ?
			returnTrue :
			returnFalse;

	// Event type
	} else {
		this.type = src;
	}

	// Put explicitly provided properties onto the event object
	if ( props ) {
		jSignage.extend( this, props );
	}

	// Create a timestamp if incoming event doesn't have one
	this.timeStamp = src && src.timeStamp || jSignage.now();

	// Mark it as fixed
	this[ jSignage.expando ] = true;
};

// jSignage.Event is based on DOM3 Events as specified by the ECMAScript Language Binding
// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
jSignage.Event.prototype = {
	isDefaultPrevented: returnFalse,
	isPropagationStopped: returnFalse,
	isImmediatePropagationStopped: returnFalse,

	preventDefault: function() {
		var e = this.originalEvent;

		this.isDefaultPrevented = returnTrue;
		if ( !e ) {
			return;
		}

		// If preventDefault exists, run it on the original event
		if ( e.preventDefault ) {
			e.preventDefault();

		// Support: IE
		// Otherwise set the returnValue property of the original event to false
		} else {
			e.returnValue = false;
		}
	},
	stopPropagation: function() {
		var e = this.originalEvent;

		this.isPropagationStopped = returnTrue;
		if ( !e ) {
			return;
		}
		// If stopPropagation exists, run it on the original event
		if ( e.stopPropagation ) {
			e.stopPropagation();
		}

		// Support: IE
		// Set the cancelBubble property of the original event to true
		e.cancelBubble = true;
	},
	stopImmediatePropagation: function() {
		this.isImmediatePropagationStopped = returnTrue;
		this.stopPropagation();
	}
};

// Create mouseenter/leave events using mouseover/out and event-time checks
jSignage.each({
	mouseenter: "mouseover",
	mouseleave: "mouseout"
}, function( orig, fix ) {
	jSignage.event.special[ orig ] = {
		delegateType: fix,
		bindType: fix,

		handle: function( event ) {
			var ret,
				target = this,
				related = event.relatedTarget,
				handleObj = event.handleObj;

			// For mousenter/leave call the handler if related is outside the target.
			// NB: No relatedTarget if the mouse left/entered the browser window
			if ( !related || (related !== target && !jSignage.contains( target, related )) ) {
				event.type = handleObj.origType;
				ret = handleObj.handler.apply( this, arguments );
				event.type = fix;
			}
			return ret;
		}
	};
});

jSignage.fn.extend({

	on: function( types, selector, data, fn, /*INTERNAL*/ one ) {
		var type, origFn;

		// Types can be a map of types/handlers
		if ( typeof types === "object" ) {
			// ( types-Object, selector, data )
			if ( typeof selector !== "string" ) {
				// ( types-Object, data )
				data = data || selector;
				selector = undefined;
			}
			for ( type in types ) {
				this.on( type, selector, data, types[ type ], one );
			}
			return this;
		}

		if ( data == null && fn == null ) {
			// ( types, fn )
			fn = selector;
			data = selector = undefined;
		} else if ( fn == null ) {
			if ( typeof selector === "string" ) {
				// ( types, selector, fn )
				fn = data;
				data = undefined;
			} else {
				// ( types, data, fn )
				fn = data;
				data = selector;
				selector = undefined;
			}
		}
		if ( fn === false ) {
			fn = returnFalse;
		} else if ( !fn ) {
			return this;
		}

		if ( one === 1 ) {
			origFn = fn;
			fn = function( event ) {
				// Can use an empty set, since event contains the info
				jSignage().off( event );
				return origFn.apply( this, arguments );
			};
			// Use same guid so caller can remove using origFn
			fn.guid = origFn.guid || ( origFn.guid = jSignage.guid++ );
		}
		return this.each( function() {
			jSignage.event.add( this, types, fn, data, selector );
		});
	},
	one: function( types, selector, data, fn ) {
		return this.on( types, selector, data, fn, 1 );
	},
	off: function( types, selector, fn ) {
		var handleObj, type;
		if ( types && types.preventDefault && types.handleObj ) {
			// ( event )  dispatched jSignage.Event
			handleObj = types.handleObj;
			jSignage( types.delegateTarget ).off(
				handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
				handleObj.selector,
				handleObj.handler
			);
			return this;
		}
		if ( typeof types === "object" ) {
			// ( types-object [, selector] )
			for ( type in types ) {
				this.off( type, selector, types[ type ] );
			}
			return this;
		}
		if ( selector === false || typeof selector === "function" ) {
			// ( types [, fn] )
			fn = selector;
			selector = undefined;
		}
		if ( fn === false ) {
			fn = returnFalse;
		}
		return this.each(function() {
			jSignage.event.remove( this, types, fn, selector );
		});
	},

	trigger: function( type, data ) {
		return this.each(function() {
			jSignage.event.trigger( type, data, this );
		});
	},
	triggerHandler: function( type, data ) {
		var elem = this[0];
		if ( elem ) {
			return jSignage.event.trigger( type, data, elem, true );
		}
	}
});

jSignage.each( [ 'DOMFocusIn', 'DOMFocusOut', 'DOMActivate', 'click', 'mousedown', 'mouseup', 'mouseover', 'mousemove', 'mouseout', 'mouseenter', 'mouseleave', 'mousewheel', 'textInput', 'keydown', 'keyup', 'load', 'resize', 'scroll', 'SPXTransform', 'beginEvent', 'repeatEvent', 'endEvent' ], function( i, name ) {
	// Handle event binding
	jSignage.fn[ name ] = function( data, fn ) {
		return arguments.length > 0 ?
			this.on( name, null, data, fn ) :
			this.trigger( name );
	};
});

jSignage.fn.extend({
	hover: function( fnOver, fnOut ) {
		return this.mouseenter( fnOver ).mouseleave( fnOut || fnOver );
	},

	bind: function( types, data, fn ) {
		return this.on( types, null, data, fn );
	},
	unbind: function( types, fn ) {
		return this.off( types, null, fn );
	},

	delegate: function( selector, types, data, fn ) {
		return this.on( types, selector, data, fn );
	},
	undelegate: function( selector, types, fn ) {
		// ( namespace ) or ( selector, types [, fn] )
		return arguments.length === 1 ? this.off( selector, "**" ) : this.off( types, selector || "**", fn );
	}
});

// Ajax

var
	rhash = /#.*$/,
	rts = /([?&])_=[^&]*/,
	rheaders = /^(.*?):[ \t]*([^\r\n]*)\r?$/mg, // IE leaves an \r character at EOL
	rnoContent = /^(?:GET|HEAD)$/,
	rprotocol = /^\/\//,
	rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/,
	rquery = (/\?/),
	nonce = jSignage.now(),

	/* Prefilters
	 * 1) They are useful to introduce custom dataTypes (see ajax/jsonp.js for an example)
	 * 2) These are called:
	 *    - BEFORE asking for a transport
	 *    - AFTER param serialization (s.data is a string if s.processData is true)
	 * 3) key is the dataType
	 * 4) the catchall symbol "*" can be used
	 * 5) execution will start with transport dataType and THEN continue down to "*" if needed
	 */
	prefilters = {},

	/* Transports bindings
	 * 1) key is the dataType
	 * 2) the catchall symbol "*" can be used
	 * 3) selection will start with transport dataType and THEN go to "*" if needed
	 */
	transports = {};


function addToPrefiltersOrTransports( structure ) {

	// dataTypeExpression is optional and defaults to "*"
	return function( dataTypeExpression, func ) {

		if ( typeof dataTypeExpression !== "string" ) {
			func = dataTypeExpression;
			dataTypeExpression = "*";
		}

		var dataType,
			i = 0,
			dataTypes = dataTypeExpression.toLowerCase().match( rnotwhite ) || [];

		if ( jSignage.isFunction( func ) ) {
			// For each dataType in the dataTypeExpression
			while ( (dataType = dataTypes[i++]) ) {
				// Prepend if requested
				if ( dataType.charAt( 0 ) === "+" ) {
					dataType = dataType.slice( 1 ) || "*";
					(structure[ dataType ] = structure[ dataType ] || []).unshift( func );

				// Otherwise append
				} else {
					(structure[ dataType ] = structure[ dataType ] || []).push( func );
				}
			}
		}
	};
}

// Base inspection function for prefilters and transports
function inspectPrefiltersOrTransports( structure, options, originalOptions, jqXHR ) {

	var inspected = {},
		seekingTransport = ( structure === transports );

	function inspect( dataType ) {
		var selected;
		inspected[ dataType ] = true;
		jSignage.each( structure[ dataType ] || [], function( _, prefilterOrFactory ) {
			var dataTypeOrTransport = prefilterOrFactory( options, originalOptions, jqXHR );
			if ( typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[ dataTypeOrTransport ] ) {
				options.dataTypes.unshift( dataTypeOrTransport );
				inspect( dataTypeOrTransport );
				return false;
			} else if ( seekingTransport ) {
				return !( selected = dataTypeOrTransport );
			}
		});
		return selected;
	}

	return inspect( options.dataTypes[ 0 ] ) || !inspected[ "*" ] && inspect( "*" );
}

// A special extend for ajax options
// that takes "flat" options (not to be deep extended)
// Fixes #9887
function ajaxExtend( target, src ) {
	var deep, key,
		flatOptions = window.__jSignage__global.ajaxSettings.flatOptions || {};

	for ( key in src ) {
		if ( src[ key ] !== undefined ) {
			( flatOptions[ key ] ? target : ( deep || (deep = {}) ) )[ key ] = src[ key ];
		}
	}
	if ( deep ) {
		jSignage.extend( true, target, deep );
	}

	return target;
}

/* Handles responses to an ajax request:
 * - finds the right dataType (mediates between content-type and expected dataType)
 * - returns the corresponding response
 */
function ajaxHandleResponses( s, jqXHR, responses ) {
	var firstDataType, ct, finalDataType, type,
		contents = s.contents,
		dataTypes = s.dataTypes;

	// Remove auto dataType and get content-type in the process
	while ( dataTypes[ 0 ] === "*" ) {
		dataTypes.shift();
		if ( ct === undefined ) {
			ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
		}
	}

	// Check if we're dealing with a known content-type
	if ( ct ) {
		for ( type in contents ) {
			if ( contents[ type ] && contents[ type ].test( ct ) ) {
				dataTypes.unshift( type );
				break;
			}
		}
	}

	// Check to see if we have a response for the expected dataType
	if ( dataTypes[ 0 ] in responses ) {
		finalDataType = dataTypes[ 0 ];
	} else {
		// Try convertible dataTypes
		for ( type in responses ) {
			if ( !dataTypes[ 0 ] || s.converters[ type + " " + dataTypes[0] ] ) {
				finalDataType = type;
				break;
			}
			if ( !firstDataType ) {
				firstDataType = type;
			}
		}
		// Or just use first one
		finalDataType = finalDataType || firstDataType;
	}

	// If we found a dataType
	// We add the dataType to the list if needed
	// and return the corresponding response
	if ( finalDataType ) {
		if ( finalDataType !== dataTypes[ 0 ] ) {
			dataTypes.unshift( finalDataType );
		}
		return responses[ finalDataType ];
	}
}

/* Chain conversions given the request and the original response
 * Also sets the responseXXX fields on the jqXHR instance
 */
function ajaxConvert( s, response, jqXHR, isSuccess ) {
	var conv2, current, conv, tmp, prev,
		converters = {},
		// Work with a copy of dataTypes in case we need to modify it for conversion
		dataTypes = s.dataTypes.slice();

	// Create converters map with lowercased keys
	if ( dataTypes[ 1 ] ) {
		for ( conv in s.converters ) {
			converters[ conv.toLowerCase() ] = s.converters[ conv ];
		}
	}

	current = dataTypes.shift();

	// Convert to each sequential dataType
	while ( current ) {

		if ( s.responseFields[ current ] ) {
			jqXHR[ s.responseFields[ current ] ] = response;
		}

		// Apply the dataFilter if provided
		if ( !prev && isSuccess && s.dataFilter ) {
			response = s.dataFilter( response, s.dataType );
		}

		prev = current;
		current = dataTypes.shift();

		if ( current ) {

			// There's only work to do if current dataType is non-auto
			if ( current === "*" ) {

				current = prev;

			// Convert response if prev dataType is non-auto and differs from current
			} else if ( prev !== "*" && prev !== current ) {

				// Seek a direct converter
				conv = converters[ prev + " " + current ] || converters[ "* " + current ];

				// If none found, seek a pair
				if ( !conv ) {
					for ( conv2 in converters ) {

						// If conv2 outputs current
						tmp = conv2.split( " " );
						if ( tmp[ 1 ] === current ) {

							// If prev can be converted to accepted input
							conv = converters[ prev + " " + tmp[ 0 ] ] ||
								converters[ "* " + tmp[ 0 ] ];
							if ( conv ) {
								// Condense equivalence converters
								if ( conv === true ) {
									conv = converters[ conv2 ];

								// Otherwise, insert the intermediate dataType
								} else if ( converters[ conv2 ] !== true ) {
									current = tmp[ 0 ];
									dataTypes.unshift( tmp[ 1 ] );
								}
								break;
							}
						}
					}
				}

				// Apply converter (if not an equivalence)
				if ( conv !== true ) {

					// Unless errors are allowed to bubble, catch and return them
					if ( conv && s[ "throws" ] ) {
						response = conv( response );
					} else {
						try {
							response = conv( response );
						} catch ( e ) {
							return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
						}
					}
				}
			}
		}
	}

	return { state: "success", data: response };
}

jSignage.extend({
	// Creates a full fledged settings object into target
	// with both ajaxSettings and settings fields.
	// If target is omitted, writes into ajaxSettings.
	ajaxSetup: function( target, settings ) {
		return settings ?

			// Building a settings object
			ajaxExtend( ajaxExtend( target, window.__jSignage__global.ajaxSettings ), settings ) :

			// Extending ajaxSettings
			ajaxExtend( window.__jSignage__global.ajaxSettings, target );
	},

	ajaxPrefilter: addToPrefiltersOrTransports( prefilters ),
	ajaxTransport: addToPrefiltersOrTransports( transports ),

	// Main method
	ajax: function( url, options ) {

		// If url is an object, simulate pre-1.5 signature
		if ( typeof url === "object" ) {
			options = url;
			url = undefined;
		}

		// Force options to be an object
		options = options || {};

		var // Cross-domain detection vars
			parts,
			// Loop variable
			i,
			// URL without anti-cache param
			cacheURL,
			// Response headers as string
			responseHeadersString,
			// timeout handle
			timeoutTimer,

			// To know if global events are to be dispatched
			fireGlobals,

			transport,
			// Response headers
			responseHeaders,
			// Create the final options object
			s = jSignage.ajaxSetup( {}, options ),
			// Callbacks context
			callbackContext = s.context || s,
			// Context for global events is callbackContext if it is a DOM node or jSignage collection
			globalEventContext = s.context && ( callbackContext.nodeType || callbackContext.jsignage ) ?
				jSignage( callbackContext ) :
				jSignage.event,
			// Deferreds
			deferred = jSignage.Deferred(),
			completeDeferred = jSignage.Callbacks("once memory"),
			// Status-dependent callbacks
			statusCode = s.statusCode || {},
			// Headers (they are sent all at once)
			requestHeaders = {},
			requestHeadersNames = {},
			// The jqXHR state
			state = 0,
			// Default abort message
			strAbort = "canceled",
			// Fake xhr
			jqXHR = {
				readyState: 0,

				// Builds headers hashtable if needed
				getResponseHeader: function( key ) {
					var match;
					if ( state === 2 ) {
						if ( !responseHeaders ) {
							responseHeaders = {};
							while ( (match = rheaders.exec( responseHeadersString )) ) {
								responseHeaders[ match[1].toLowerCase() ] = match[ 2 ];
							}
						}
						match = responseHeaders[ key.toLowerCase() ];
					}
					return match == null ? null : match;
				},

				// Raw string
				getAllResponseHeaders: function() {
					return state === 2 ? responseHeadersString : null;
				},

				// Caches the header
				setRequestHeader: function( name, value ) {
					var lname = name.toLowerCase();
					if ( !state ) {
						name = requestHeadersNames[ lname ] = requestHeadersNames[ lname ] || name;
						requestHeaders[ name ] = value;
					}
					return this;
				},

				// Overrides response content-type header
				overrideMimeType: function( type ) {
					if ( !state ) {
						s.mimeType = type;
					}
					return this;
				},

				// Status-dependent callbacks
				statusCode: function( map ) {
					var code;
					if ( map ) {
						if ( state < 2 ) {
							for ( code in map ) {
								// Lazy-add the new callback in a way that preserves old ones
								statusCode[ code ] = [ statusCode[ code ], map[ code ] ];
							}
						} else {
							// Execute the appropriate callbacks
							jqXHR.always( map[ jqXHR.status ] );
						}
					}
					return this;
				},

				// Cancel the request
				abort: function( statusText ) {
					var finalText = statusText || strAbort;
					if ( transport ) {
						transport.abort( finalText );
					}
					done( 0, finalText );
					return this;
				}
			};

		// Attach deferreds
		deferred.promise( jqXHR ).complete = completeDeferred.add;
		jqXHR.success = jqXHR.done;
		jqXHR.error = jqXHR.fail;

		// Remove hash character (#7531: and string promotion)
		// Add protocol if not provided (#5866: IE7 issue with protocol-less urls)
		// Handle falsy url in the settings object (#10093: consistency with old signature)
		// We also use the url parameter if available
		s.url = ( ( url || s.url || window.__jSignage__global.ajaxLocation ) + "" ).replace( rhash, "" ).replace( rprotocol, window.__jSignage__global.ajaxLocParts[ 1 ] + "//" );

		// Alias method option to type as per ticket #12004
		s.type = options.method || options.type || s.method || s.type;

		// Extract dataTypes list
		s.dataTypes = jSignage.trim( s.dataType || "*" ).toLowerCase().match( rnotwhite ) || [ "" ];

		// A cross-domain request is in order when we have a protocol:host:port mismatch
		if ( jSignage.features.SpinetiX ) {
		    s.crossDomain = false;
		} else if ( s.crossDomain == null ) {
			parts = rurl.exec( s.url.toLowerCase() );
			s.crossDomain = !!( parts &&
				( parts[ 1 ] !== window.__jSignage__global.ajaxLocParts[ 1 ] || parts[ 2 ] !== window.__jSignage__global.ajaxLocParts[ 2 ] ||
					( parts[ 3 ] || ( parts[ 1 ] === "http:" ? "80" : "443" ) ) !==
						( window.__jSignage__global.ajaxLocParts[ 3 ] || ( window.__jSignage__global.ajaxLocParts[ 1 ] === "http:" ? "80" : "443" ) ) )
			);
		}

		// Convert data if not already a string
		if ( s.data && s.processData && typeof s.data !== "string" ) {
			s.data = jSignage.param( s.data, s.traditional );
		}

		// Apply prefilters
		inspectPrefiltersOrTransports( prefilters, s, options, jqXHR );

		// If request was aborted inside a prefilter, stop there
		if ( state === 2 ) {
			return jqXHR;
		}

		// We can fire global events as of now if asked to
		fireGlobals = s.global;

		// Watch for a new set of requests
		if ( fireGlobals && window.__jSignage__global.active++ === 0 ) {
			jSignage.event.trigger("ajaxStart");
		}

		// Uppercase the type
		s.type = s.type.toUpperCase();

		// Determine if request has content
		s.hasContent = !rnoContent.test( s.type );

		// Save the URL in case we're toying with the If-Modified-Since
		// and/or If-None-Match header later on
		cacheURL = s.url;

		// More options handling for requests with no content
		if ( !s.hasContent ) {

			// If data is available, append data to url
			if ( s.data ) {
				cacheURL = ( s.url += ( rquery.test( cacheURL ) ? "&" : "?" ) + s.data );
				// #9682: remove data so that it's not used in an eventual retry
				delete s.data;
			}

			// Add anti-cache in url if needed
			if ( s.cache === false ) {
				s.url = rts.test( cacheURL ) ?

					// If there is already a '_' parameter, set its value
					cacheURL.replace( rts, "$1_=" + nonce++ ) :

					// Otherwise add one to the end
					cacheURL + ( rquery.test( cacheURL ) ? "&" : "?" ) + "_=" + nonce++;
			}
		}

		// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
		if ( s.ifModified ) {
			if ( window.__jSignage__global.lastModified[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-Modified-Since", window.__jSignage__global.lastModified[ cacheURL ] );
			}
			if ( window.__jSignage__global.etag[ cacheURL ] ) {
				jqXHR.setRequestHeader( "If-None-Match", window.__jSignage__global.etag[ cacheURL ] );
			}
		}

		// Set the correct header, if data is being sent
		if ( s.data && s.hasContent && s.contentType !== false || options.contentType ) {
			jqXHR.setRequestHeader( "Content-Type", s.contentType );
		}

		// Set the Accepts header for the server, depending on the dataType
		jqXHR.setRequestHeader(
			"Accept",
			s.dataTypes[ 0 ] && s.accepts[ s.dataTypes[0] ] ?
				s.accepts[ s.dataTypes[0] ] + ( s.dataTypes[ 0 ] !== "*" ? ", " + "*/*" + "; q=0.01" : "" ) :
				s.accepts[ "*" ]
		);

		// Check for headers option
		for ( i in s.headers ) {
			jqXHR.setRequestHeader( i, s.headers[ i ] );
		}

		// Allow custom headers/mimetypes and early abort
		if ( s.beforeSend && ( s.beforeSend.call( callbackContext, jqXHR, s ) === false || state === 2 ) ) {
			// Abort if not done already and return
			return jqXHR.abort();
		}

		// aborting is no longer a cancellation
		strAbort = "abort";

		// Install callbacks on deferreds
		for ( i in { success: 1, error: 1, complete: 1 } ) {
			jqXHR[ i ]( s[ i ] );
		}

		// Get transport
		transport = inspectPrefiltersOrTransports( transports, s, options, jqXHR );

		// If no transport, we auto-abort
		if ( !transport ) {
			done( -1, "No Transport" );
		} else {
			jqXHR.readyState = 1;

			// Send global event
			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxSend", [ jqXHR, s ] );
			}
			// Timeout
			if ( s.async && s.timeout > 0 ) {
				timeoutTimer = setTimeout(function() {
					jqXHR.abort("timeout");
				}, s.timeout );
			}

			try {
				state = 1;
				transport.send( requestHeaders, done );
			} catch ( e ) {
				// Propagate exception as error if not done
				if ( state < 2 ) {
					done( -1, e );
				// Simply rethrow otherwise
				} else {
					throw e;
				}
			}
		}

		// Callback for when everything is done
		function done( status, nativeStatusText, responses, headers ) {
			var isSuccess, success, error, response, modified,
				statusText = nativeStatusText;

			// Called once
			if ( state === 2 ) {
				return;
			}

			// State is "done" now
			state = 2;

			// Clear timeout if it exists
			if ( timeoutTimer ) {
				clearTimeout( timeoutTimer );
			}

			// Dereference transport for early garbage collection
			// (no matter how long the jqXHR object will be used)
			transport = undefined;

			// Cache response headers
			responseHeadersString = headers || "";

			// Set readyState
			jqXHR.readyState = status > 0 ? 4 : 0;

			// Determine if successful
			isSuccess = status >= 200 && status < 300 || status === 304;

			// Get response data
			if ( responses ) {
				response = ajaxHandleResponses( s, jqXHR, responses );
			}

			// Convert no matter what (that way responseXXX fields are always set)
			response = ajaxConvert( s, response, jqXHR, isSuccess );

			// If successful, handle type chaining
			if ( isSuccess ) {

				// Set the If-Modified-Since and/or If-None-Match header, if in ifModified mode.
				if ( s.ifModified ) {
					modified = jqXHR.getResponseHeader("Last-Modified");
					if ( modified ) {
						window.__jSignage__global.lastModified[ cacheURL ] = modified;
					}
					modified = jqXHR.getResponseHeader("etag");
					if ( modified ) {
						window.__jSignage__global.etag[ cacheURL ] = modified;
					}
				}

				// if no content
				if ( status === 204 || s.type === "HEAD" ) {
					statusText = "nocontent";

				// if not modified
				} else if ( status === 304 ) {
					statusText = "notmodified";

				// If we have data, let's convert it
				} else {
					statusText = response.state;
					success = response.data;
					error = response.error;
					isSuccess = !error;
				}
			} else {
				// We extract error from statusText
				// then normalize statusText and status for non-aborts
				error = statusText;
				if ( !statusText )
					statusText = "error";
			    if ( status < 0 )
					status = 0;
			}

			// Set data for the fake xhr object
			jqXHR.status = status;
			jqXHR.statusText = ( nativeStatusText || statusText ) + "";

			// Success/Error
			if ( isSuccess ) {
				deferred.resolveWith( callbackContext, [ success, statusText, jqXHR ] );
			} else {
				deferred.rejectWith( callbackContext, [ jqXHR, statusText, error ] );
			}

			// Status-dependent callbacks
			jqXHR.statusCode( statusCode );
			statusCode = undefined;

			if ( fireGlobals ) {
				globalEventContext.trigger( isSuccess ? "ajaxSuccess" : "ajaxError",
					[ jqXHR, s, isSuccess ? success : error ] );
			}

			// Complete
			completeDeferred.fireWith( callbackContext, [ jqXHR, statusText ] );

			if ( fireGlobals ) {
				globalEventContext.trigger( "ajaxComplete", [ jqXHR, s ] );
				// Handle the global AJAX counter
				if ( !( --window.__jSignage__global.active ) ) {
					jSignage.event.trigger("ajaxStop");
				}
			}
		}

		return jqXHR;
	},

	getJSON: function( url, data, callback ) {
		return jSignage.get( url, data, callback, "json" );
	},

	getScript: function( url, callback ) {
		return jSignage.get( url, undefined, callback, "script" );
	}
});

jSignage.each( [ "get", "post" ], function( i, method ) {
	jSignage[ method ] = function( url, data, callback, type ) {
		// shift arguments if data argument was omitted
		if ( jSignage.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = undefined;
		}

		return jSignage.ajax({
			url: url,
			type: method,
			dataType: type,
			data: data,
			success: callback
		});
	};
});

// Attach a bunch of functions for handling common AJAX events
jSignage.each( [ "ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend" ], function( i, type ) {
	jSignage.fn[ type ] = function( fn ) {
		return this.on( type, fn );
	};
});

var r20 = /%20/g, rbracket = /\[\]$/;

function buildParams( prefix, obj, traditional, add ) {
	var name;

	if ( jSignage.isArray( obj ) ) {
		// Serialize array item.
		jSignage.each( obj, function( i, v ) {
			if ( traditional || rbracket.test( prefix ) ) {
				// Treat each array item as a scalar.
				add( prefix, v );

			} else {
				// Item is non-scalar (array or object), encode its numeric index.
				buildParams( prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add );
			}
		});

	} else if ( !traditional && jSignage.type( obj ) === "object" ) {
		// Serialize object item.
		for ( name in obj ) {
			buildParams( prefix + "[" + name + "]", obj[ name ], traditional, add );
		}

	} else {
		// Serialize scalar item.
		add( prefix, obj );
	}
}

// Serialize a set of key/values into a query string
jSignage.param = function( a, traditional ) {
	var prefix,
		s = [],
		add = function( key, value ) {
			// If value is a function, invoke it and return its value
			value = jSignage.isFunction( value ) ? value() : ( value == null ? "" : value );
			s[ s.length ] = encodeURIComponent( key ) + "=" + encodeURIComponent( value );
		};
	if ( traditional === undefined )
		traditional = window.__jSignage__global.ajaxSettings && window.__jSignage__global.ajaxSettings.traditional;
	for ( prefix in a )
		buildParams( prefix, a[ prefix ], traditional, add );
	return s.join( "&" ).replace( r20, "+" );
};

jSignage.ajaxTransport( function( options ) {

	var callback;

	return {
		send: function( headers, complete ) {
			var i, xhr = options.xhr();

			// Open the socket
			xhr.open( options.type, options.url, options.async, options.username, options.password );

			// Apply custom fields if provided
			if ( options.xhrFields ) {
				for ( i in options.xhrFields ) {
					xhr[ i ] = options.xhrFields[ i ];
				}
			}

			// Override mime type if needed
			if ( options.mimeType && xhr.overrideMimeType ) {
				xhr.overrideMimeType( options.mimeType );
			}

			// X-Requested-With header
			// For cross-domain requests, seeing as conditions for a preflight are
			// akin to a jigsaw puzzle, we simply never set it to be sure.
			// (it can always be set on a per-request basis or even using ajaxSetup)
			// For same-domain requests, won't change header if already provided.
			if ( !options.crossDomain && !headers["X-Requested-With"] ) {
				headers["X-Requested-With"] = "XMLHttpRequest";
			}

			// Set headers
			for ( i in headers ) {
				// Support: IE<9
				// IE's ActiveXObject throws a 'Type Mismatch' exception when setting
				// request header to a null-value.
				//
				// To keep consistent with other XHR implementations, cast the value
				// to string and ignore `undefined`.
				if ( headers[ i ] !== undefined ) {
					xhr.setRequestHeader( i, headers[ i ] + "" );
				}
			}

			// Do send the request
			// This may raise an exception which is actually
			// handled in jSignage.ajax (so no try/catch here)
			xhr.send( ( options.hasContent && options.data ) || null );

			// Listener
			callback = function( _, isAbort ) {
				var status, statusText, responses;

				// Was never called and is aborted or complete
				if ( callback && ( isAbort || xhr.readyState === 4 ) ) {
					// Clean up
					callback = undefined;
					xhr.onreadystatechange = jSignage.noop;

					// Abort manually if needed
					if ( isAbort ) {
						if ( xhr.readyState !== 4 ) {
							xhr.abort();
						}
					} else {
						responses = {};
						status = xhr.status;

						// Support: IE<10
						// Accessing binary-data responseText throws an exception
						// (#11426)
						if ( typeof xhr.responseText === "string" ) {
							responses.text = xhr.responseText;
						}

						// Firefox throws an exception when accessing
						// statusText for faulty cross-domain requests
						try {
							statusText = xhr.statusText;
						} catch( e ) {
							// We normalize with Webkit giving an empty statusText
							statusText = "";
						}

						// Filter status for non standard behaviors

						// If the request is local and we have data: assume a success
						// (success with no data won't get notified, that's the best we
						// can do given current implementations)
						if ( !status && options.isLocal && !options.crossDomain ) {
							status = responses.text ? 200 : 404;
						// IE - #1450: sometimes returns 1223 when it should be 204
						} else if ( status === 1223 ) {
							status = 204;
						}
					}
				}

				// Call complete if needed
				if ( responses ) {
					complete( status, statusText, responses, xhr.getAllResponseHeaders() );
				}
			};

			if ( !options.async ) {
				// if we're in sync mode we fire the callback
				callback();
			} else if ( xhr.readyState === 4 ) {
				// (IE6 & IE7) if it's in cache and has been
				// retrieved directly we need to fire the callback
				setTimeout( callback );
			} else {
				// Add to the list of active xhr callbacks
				xhr.onreadystatechange = callback;
			}
		},

		abort: function() {
			if ( callback ) {
				callback( undefined, true );
			}
		}
	};
});

// Install script dataType
jSignage.ajaxSetup({
	accepts: {
		script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
	},
	contents: {
		script: /(?:java|ecma)script/
	},
	converters: {
		"text script": function( text ) {
			jSignage.globalEval( text );
			return text;
		}
	}
});

// Handle cache's special case and global
jSignage.ajaxPrefilter( "script", function( s ) {
	if ( s.cache === undefined ) {
		s.cache = false;
	}
	if ( s.crossDomain ) {
		s.type = "GET";
		s.global = false;
	}
});

// Bind script tag hack transport
jSignage.ajaxTransport( "script", function(s) {

	// This transport only deals with cross domain requests
	if ( s.crossDomain ) {

		var script, head = document.documentElement;

		return {

			send: function( _, callback ) {

				script = document.createElement("script");

				script.async = true;

				if ( s.scriptCharset ) {
					script.charset = s.scriptCharset;
				}

				script.src = s.url;

				// Attach handlers for all browsers
				script.onload = script.onreadystatechange = function( _, isAbort ) {

					if ( isAbort || !script.readyState || /loaded|complete/.test( script.readyState ) ) {

						// Handle memory leak in IE
						script.onload = script.onreadystatechange = null;

						// Remove the script
						if ( script.parentNode ) {
							script.parentNode.removeChild( script );
						}

						// Dereference the script
						script = null;

						// Callback if not abort
						if ( !isAbort ) {
							callback( 200, "success" );
						}
					}
				};

				// Circumvent IE6 bugs with base elements (#2709 and #4378) by prepending
				// Use native DOM manipulation to avoid our domManip AJAX trickery
				head.insertBefore( script, head.firstChild );
			},

			abort: function() {
				if ( script ) {
					script.onload( undefined, true );
				}
			}
		};
	}
});




var oldCallbacks = [], rjsonp = /(=)\?(?=&|$)|\?\?/;

// Default jsonp settings
jSignage.ajaxSetup({
	jsonp: "callback",
	jsonpCallback: function() {
		var callback = oldCallbacks.pop() || ( jSignage.expando + "_" + ( nonce++ ) );
		this[ callback ] = true;
		return callback;
	}
});

// Detect, normalize options and install callbacks for jsonp requests
jSignage.ajaxPrefilter( "json jsonp", function( s, originalSettings, jqXHR ) {

	var callbackName, overwritten, responseContainer,
		jsonProp = s.jsonp !== false && ( rjsonp.test( s.url ) ?
			"url" :
			typeof s.data === "string" && !( s.contentType || "" ).indexOf("application/x-www-form-urlencoded") && rjsonp.test( s.data ) && "data"
		);

	// Handle iff the expected data type is "jsonp" or we have a parameter to set
	if ( jsonProp || s.dataTypes[ 0 ] === "jsonp" ) {

		// Get callback name, remembering preexisting value associated with it
		callbackName = s.jsonpCallback = jSignage.isFunction( s.jsonpCallback ) ?
			s.jsonpCallback() :
			s.jsonpCallback;

		// Insert callback into url or form data
		if ( jsonProp ) {
			s[ jsonProp ] = s[ jsonProp ].replace( rjsonp, "$1" + callbackName );
		} else if ( s.jsonp !== false ) {
			s.url += ( rquery.test( s.url ) ? "&" : "?" ) + s.jsonp + "=" + callbackName;
		}

		// Use data converter to retrieve json after script execution
		s.converters["script json"] = function() {
			if ( !responseContainer ) {
				jSignage.error( callbackName + " was not called" );
			}
			return responseContainer[ 0 ];
		};

		// force json dataType
		s.dataTypes[ 0 ] = "json";

		// Install callback
		overwritten = window[ callbackName ];
		window[ callbackName ] = function() {
			responseContainer = arguments;
		};

		// Clean-up function (fires after converters)
		jqXHR.always(function() {
			// Restore preexisting value
			window[ callbackName ] = overwritten;

			// Save back as free
			if ( s[ callbackName ] ) {
				// make sure that re-using the options doesn't screw things around
				s.jsonpCallback = originalSettings.jsonpCallback;

				// save the callback name for future use
				oldCallbacks.push( callbackName );
			}

			// Call if it was a function and we have a response
			if ( responseContainer && jSignage.isFunction( overwritten ) ) {
				overwritten( responseContainer[ 0 ] );
			}

			responseContainer = overwritten = undefined;
		});

		// Delegate to script
		return "script";
	}
});

})();

// Replacement operators

(function() {

var constructors = [
    'audio', 'video', 'image', 'animation', 'iframe', 'media', 'textArea', 'g', 'playlist', 'slideshow', 'textBar', 'crawler', 'textTicker',
    'mediaCrawler', 'headlineTextArea', 'fitTextArea', 'pingPongTextArea', 'scrollingTextArea', 'table', 'popup', 'pushButton',
    'progressBar', 'progressWheel', 'carousel'
];

var layoutAttributes = [ 'left', 'top', 'right', 'bottom', 'width', 'height' ];

jSignage.fn.replace = function( ctor, args ) {
    this.each( function() {
        if ( !args ) args = { };
        if ( this.id!=null )
            args.id = this.id;
        var layer = jSignage[ctor].call( null, args )[0];
        var width = this.getAttributeNS( null, 'width' );
        var height =  this.getAttributeNS( null, 'height' );
        var parent = this.parentNode, before = this.nextElementSibling;
        parent.removeChild( this );
        if ( width!=null && width!='' && height!=null && height!='' ) {
            var transform = this.getAttribute( 'transform' );
            var x = this.getAttribute( 'x' );
            var y = this.getAttribute( 'y' );
            if ( ( x!=null && x!='' ) || ( y!=null && y!='' ) ) {
                var t = 'translate(' + ( x || '0' ) + ' ' + ( y || '0' ) + ')';
                if ( transform )
                    transform += ' ';
                transform += t;
            }
            var g = jSignage._createElement( 'g', { transform: transform, width: width, height: height } );
            parent.insertBefore( g, before );
            jSignage.add( g, layer );
        } else {
            for ( var i=0; i<layoutAttributes.length; i++ ) {
                var a = layoutAttributes[i];
                var v = this.getAttributeNS( jSignage.spxNS, a );
                if ( v!=null && v!='' )
                    args[a] = v;
            }
            jSignage.add( parent, layer, null, before );
        }
    });
}

function defineReplace( ctor ) {
    jSignage.fn[ctor] = function( args ) {
        this.replace( ctor, args );
    };
}

for ( var i=0; i<constructors.length; i++ )
    defineReplace( constructors[i] );

// Canned layers constructor

function uncanEffect( layer, effect, args_modifier ) {
    if ( typeof(effect)=='string' ) {
        return layer[effect].call( layer );
    } else if ( effect && typeof(effect)=='object' && effect.effect ) {
        var method =  layer[effect.effect];
        if ( method && typeof(method)=='function' ) {
            if ( 'args' in effect ) {
                var args = uncanObject( effect.args, args_modifier );
                if ( jSignage.isArray(args) )
                    return method.apply( layer, args );
                else
                    return method.call( layer, args );
            } else {
                return method.call( layer );
            }
        }
    }
    return layer;
}

function uncanObject( json, args_modifier ) {
    var obj = json;
    if ( json && typeof(json)=='object' ) {
        if ( jSignage.isArray(json) ) {
            obj = [];
            for ( var i=0; i<json.length; i++ )
                obj.push( uncanObject( json[i], args_modifier ) );
        } else {
            var ctor = json.ctor;
            if ( ctor ) {
                var ctor = jSignage[ctor];
                if ( !ctor || typeof(ctor)!='function' )
                    return null;
                if ( 'args' in json ) {
                    var args = uncanObject( json.args, args_modifier );
                    if ( jSignage.isArray( args ) )
                        return ctor.apply( jSignage, args ) || null;
                    else
                        return ctor.call( jSignage, args ) || null;
                }
                return ctor.call( jSignage ) || null;
            } else if ( args_modifier ) {
                obj = {};
                for ( var key in json )
                    obj[key] = args_modifier( key, json[key] );
            }
        }
    }
    return obj;
}

function xmlParser( p, xml, srcColumnName ) {
    var table = [], rows;
    try {
        rows = jSignage.find( p.rows || '', xml );
    } catch( e ) {
        rows = [];
    }
    for ( var i=0; i<rows.length; i++ ) {
        var row = rows[i], line = { };
        if ( p.columns ) {
            for ( var j=0; j<p.columns.length; j++ ) {
                var column = p.columns[j], x;
                if ( column.sizzle ) {
                    try {
                        var found = jSignage.find( column.sizzle, row );
                        if ( found.length > 0 )
                            x = found[0];
                        else
                            x = null;
                    } catch( e ) {
                        x = null;
                    }
                } else {
                    x = row;
                }
                if ( x ) {
                    if ( column.attr ) {
                        x = x.getAttribute( column.attr );
                    } else {
                        if ( x.firstElementChild && ( column.type=='xml' || p.markup ) )
                            x = x.outerHTML;
                        else
                            x = x.textContent;
                        if ( !p.nswsp )
                            x = jSignage.trim( x );
                    }
                } else {
                    x = '';
                }
                line[column.name || srcColumnName || 'title'] = x;
            }
        } else {
            for ( var x = row.firstElementChild; x; x = x.nextElementSibling ) {
                var v = x.firstElementChild && p.markup ? x.outerHTML : x.textContent;
                if ( !p.nswp )
                    v = jSignage.trim( v );
                line[x.localName] = v;
            }
        }
        table.push( line );
    }
    return table;
}

function jsonPropertyByPath( json, path ) {
    if ( !path )
        return json;
    path = path.split( '.' );
    var x = json;
    for ( var i=0; i<path.length; i++ ) {
        var key = path[i];
        if ( !x || typeof(x)!='object' )
            return null;
        if ( key in x )
            x = x[key];
        else
            return null;
    }
    return x;
}

function jsonParser( p, json, srcColumnName ) {
    var table = [];
    var rows = jsonPropertyByPath( json, p.rows || '' );
    if ( rows && typeof(rows)=='object' ) {
        if ( !jSignage.isArray( rows ) )
            rows = [ rows ];
        for ( var i=0; i<rows.length; i++ ) {
            var row = rows[i], line = { };
            if ( p.columns ) {
                for ( var j=0; j<p.columns.length; j++ ) {
                    var column = p.columns[j];
                    var x = 'property' in column ? jsonPropertyByPath( row, column.property ) : row;
                    if ( x !== null )
                        x = typeof(x)=='object' ? JSON.stringify( x ) : x;
                    else
                        x = '';
                    line[column.name || srcColumnName || 'title'] = x;
                }
            } else {
                for ( var k in row ){
                    var x = row[k];
                    if ( x !== null )
                        x = typeof(x)=='object' ? JSON.stringify( x ) : x;
                    else
                        x = '';
                    line[k] = x; 
                }
            }
            table.push( line );
        }
    }
    return table;
}

var reNumberInside = /\d+\.?\d*/;

function parseDigits( ctx, maxDigits ) {
    for ( ; ctx.offset < ctx.text.length; ctx.offset++ ) {
        var c = ctx.text.charCodeAt( ctx.offset );
        if ( c >= 48 && c <= 57 )
            break;
    }
    if ( ctx.offset==ctx.text.length )
        return NaN;
    var n = 0;
    for ( var i = 0; i < maxDigits && ctx.offset < ctx.text.length; i++ ) {
        var c = ctx.text.charCodeAt( ctx.offset );
        if ( c < 48 || c > 57 )
            break;
        n = n * 10 + ( c - 48 );
        ctx.offset++;
    }
    return n;
}

function parseYear( ctx, numDigits ) {
    var n = parseDigits( ctx, numDigits );
    if ( isFinite( n ) && n > 0 ) {
        if ( numDigits == 1 ) {
            ctx.year = Math.floor( ctx.year / 10 ) * 10 + n;
        } else if ( numDigits == 2 ) {
            if ( n < 70 )
                ctx.year = 2000 + n;
            else
                ctx.year = 1900 + n;
        } else {
            ctx.year = n;
        }
    } else {
        ctx.year = NaN;
    }
}

function parseQuarter( ctx ) {
    var n = parseDigits( ctx, 1 );
    if ( isFinite( n ) && n >= 1 && n <= 4 ) {
        ctx.month = ( n - 1 ) * 3 + 1;
        ctx.day = 1;
    } else {
        ctx.month = NaN;
        ctx.day = NaN;
    }
}

var reMatchM4 = /January|February|March|April|May|June|July|August|September|October|November|December/;
var month4 = { January: 1, February: 2, March: 3, April: 4, May: 5, June: 6, July: 7, August: 8, September: 9, October: 10, November: 11, December: 12 };
var reMatchM3 = /Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/;
var month3 = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 };
var reMatchW4 = /Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday/;
var week4 = { Sunday: 1, Monday: 2, Tuesday: 3, Wednesday: 4, Thursday: 5, Friday: 6, Saturday: 7 };
var reMatchW3 = /Sun|Mon|Tue|Wed|Thu|Fri|Sat/;
var week3 = { Sun: 1, Mon: 2, Tue: 3, Wed: 4, Thu: 5, Fri: 6, Sat: 7 };

function parseMonth( ctx, len ) {
    if ( len <= 2 ) {
        var n = parseDigits( ctx, 2 );
        if ( isFinite( n ) && n >= 1 && n <= 12 )
            ctx.month = n;
        else
            ctx.month = NaN;
    } else if ( len == 3 ) {
        var r = reMatchM3.exec( ctx.text.substring( ctx.offset ) );
        if ( r ) {
            ctx.month = month3[r[0]] || NaN;
            ctx.offset += r.index + r[0].length;
        } else {
            ctx.month = NaN;
        }
    } else if ( len == 4 ) {
        var r = reMatchM4.exec( ctx.text.substring( ctx.offset ) );
        if ( r ) {
            ctx.month = month4[r[0]] || NaN;
            ctx.offset += r.index + r[0].length;
        } else {
            ctx.month = NaN;
        }
    } else {
        ctx.month = NaN;
    }
}

function parseWeekday( ctx, len ) {
    if ( len <= 2 ) {
        parseDigits( ctx, 2 );
    } else if ( len == 3 ) {
        var r = reMatchW3.exec( ctx.text.substring( ctx.offset ) );
        if ( r )
            ctx.offset += r.index + r[0].length;
    } else if ( len == 4 ) {
        var r = reMatchW4.exec( ctx.text.substring( ctx.offset ) );
        if ( r )
            ctx.offset += r.index + r[0].length;
    } else if ( len == 5 && ctx.offset < ctx.text.length ) {
        ctx.offset++;
    }
}

function parseDay( ctx ) {
    var n = parseDigits( ctx, 2 );
    if ( isFinite( n ) && n >= 1 && n <= 31 )
        ctx.day = n;
    else
        ctx.day = NaN;
}

var reEra = /((?:[aA]\.?[dD]\.?)|(?:[cC]\.?[eE]\.?))|([bB]\.?[cC]\.?[eE]?\.?)/;

function parseEra( ctx ) {
    var r = reEra.exec( ctx.text.substring( ctx.offset ) );
    if ( r ) {
        ctx.offset += r.index + r[0].length;
        if ( r[1] )
            ctx.era = 'AD';
        else
            ctx.era = 'BC';
    }
}

var rePeriod = /([aA]\.?[mM]?\.?)|([pP]\.?[mM]?\.?)/;

function parsePeriod( ctx ) {
    var r = rePeriod.exec( ctx.text.substring( ctx.offset ) );
    if ( r ) {
        ctx.offset += r.index + r[0].length;
        if ( r[1] )
            ctx.period = 'AM';
        else
            ctx.period = 'PM';
    } else {
        ctx.period = '';
    }
}

function parseHour1_12( ctx ) {
    var n = parseDigits( ctx, 2 );
    if ( isFinite( n ) && n >= 1 && n <= 12 )
        ctx.hour = n%12;
    else
        ctx.hour = NaN;
}

function parseHour0_11( ctx ) {
    var n = parseDigits( ctx, 2 );
    if ( isFinite( n ) && n >= 0 && n <= 11 )
        ctx.hour = n;
    else
        ctx.hour = NaN;
}

function parseHour0_23( ctx ) {
    var n = parseDigits( ctx, 2 );
    if ( isFinite( n ) && n >= 0 && n <= 23 )
        ctx.hour = n;
    else
        ctx.hour = NaN;
}

function parseHour1_24( ctx ) {
    var n = parseDigits( ctx, 2 );
    if ( isFinite( n ) && n >= 1 && n <= 24 )
        ctx.hour = n % 24;
    else
        ctx.hour = NaN;
}

function parseMinutes( ctx ) {
    var n = parseDigits( ctx, 2 );
    if ( isFinite( n ) && n >= 0 && n <= 59 )
        ctx.minutes = n;
    else
        ctx.minutes = NaN;
}

function parseSeconds( ctx ) {
    var n = parseDigits( ctx, 2 );
    if ( isFinite( n ) && n >= 0 && n <= 60 )
        ctx.seconds = n;
    else
        ctx.seconds = NaN;
}

function parseFractional( ctx, numDigits ) {
    var n = parseDigits( ctx, numDigits );
    var base = Math.pow( 10, numDigits );
    if ( isFinite( n ) && n >= 0 && n < base )
        ctx.ms = ( n / base ) * 1000;
    else
        ctx.ms = 0;
}

var reZone = /(EST|EDT|CST|CDT|MST|MDT|PST|PDT)|((?:GMT|UTC)?([+-]?\d\d?):?(\d\d)?)|(Z|GMT|UTC)/;

function parseZone( ctx ) {
    var r = reZone.exec( ctx.text.substring( ctx.offset ) );
    if ( r ) {
        ctx.offset += r.index + r[0].length;
        if ( r[1] ) {
            switch ( r[1] ) {
                case 'EST': ctx.tz_offset = -5 * 60; break;
                case 'EDT': ctx.tz_offset = -4 * 60; break;
                case 'CST': ctx.tz_offset = -6 * 60; break;
                case 'CDT': ctx.tz_offset = -5 * 60; break;
                case 'MST': ctx.tz_offset = -7 * 60; break;
                case 'MDT': ctx.tz_offset = -6 * 60; break;
                case 'PST': ctx.tz_offset = -8 * 60; break;
                case 'PDT': ctx.tz_offset = -7 * 60; break;
                default: ctx.tz_offset = NaN;
            }
        } else if ( r[2] ) {
            var h = parseInt( r[3], 10 );
            if ( isFinite( h ) && h >= -14 && h <= 14 ) {
                ctx.tz_offset = h * 60;
                if ( r[4] ) {
                    var m = parseInt( r[4], 10 );
                    if ( isFinite( m ) && m >= 0 && m <= 59 ) {
                        if ( ctx.tz_offset < 0 )
                            ctx.tz_offset -= m;
                        else
                            ctx.tz_offset += m;
                    } else {
                        ctx.tz_offset = NaN;
                    }
                }
            } else {
                ctx.tz_offset = NaN;
            }
        } else {
            ctx.tz_offset = 0;
        }
    } else {
        ctx.tz_offset = NaN;
    }
}

var parseDateSymbols = {
    'G': parseEra,
    'Y': parseYear,
    'y': parseYear,
    'Q': parseQuarter,
    'M': parseMonth,
    'd': parseDay,
    'E': parseWeekday,
    'e': parseWeekday,
    'a': parsePeriod,
    'h': parseHour1_12,
    'H': parseHour0_23,
    'k': parseHour1_24,
    'K': parseHour0_11,
    'm': parseMinutes,
    's': parseSeconds,
    'S': parseFractional,
    'z': parseZone,
    'Z': parseZone,
    'x': parseZone,
    'X': parseZone
};

var reRelAbsDate = /^((\d{4})-(\d{2})-(\d{2})|(this|[+-]?\d+) ([a-z]+?)s?(?:-(\d{1,2})(?:-(\d{1,2}))?)?)? *(?:(\d{1,2})(?::(\d{2})(?::(\d{2}))?)?)?$/;
var mdays = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
var wdays = { monday: 0, tuesday: 1, wednesday: 2, thursday: 3, friday: 4, saturday: 5, sunday: 6 };
var reDur = /^(\d+) *(second|minute|hour|day|week|month|year)s?$/;

function lastDayOfTheMonth( month, year ) {
    month = month % 12;
    if ( month < 0 )
        month += 12;
    var day = mdays[month];
    if ( month==1 && year%4==0 && ( year%100!=0 || year%400==0 ) )
        ++day;
    return day;
}

function dateParser( p, text ) {
    var format = 'format' in p ? p.format : 'javascript';
    if ( p.format == '' || p.format == 'javascript' ) {
        var r = reNumberInside.exec( text );
        if ( r )
            return new Date( parseFloat( r[0] ) );
    } else if ( p.format == 'unix' ) {
        var r = reNumberInside.exec( text );
        if ( r )
            return new Date( parseFloat( r[0] ) * 1000 );
    } else if ( p.format == 'rfc822' || p.format == 'iso8601' ) {
        return new Date( text );
    } else {
        var date = new Date();
        var ctx = {
            text: text,
            offset: 0,
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate(),
            hour: 0,
            minutes: 0,
            seconds: 0,
            ms: 0,
            period: '24H',
            tz_offset: null, // offset in minutes to UTC, including zero for UTC, or US legacy timezone such as 'PDT', or null for floating
            era: 'AD'        // 'BC' or 'AD'
        };
        for ( var i = 0; i < format.length; i++ ) {
            var c = format.charAt( i );
            if ( c in parseDateSymbols ) {
                for ( var j=i+1; j < format.length; j++ )
                    if ( format.charAt( j ) != c )
                        break;
                parseDateSymbols[c]( ctx, j - i );
                i = j - 1;
            } else if ( c == '\'' ) {
                var lit;
                if ( i + 1 == format.length || format.charAt( i + 1 ) == '\'' ) {
                    lit = '\'';
                    if ( i + 1 < format.length )
                        i = i + 1;
                } else {
                    for ( var j = i + 1; j < format.length; j++ ) {
                        if ( format.charAt( j ) == '\'' ) {
                            if ( j + 1 == format.length || format.charAt( j + 1 ) != '\'' )
                                break;
                            j = j + 1;
                        }
                    }
                    if ( j == format.length ) {
                        lit = '\'';
                    } else {
                        lit = format.substring( i + 1, j ).replace( '\'\'', '\'' );
                        i = j;
                    }
                }
                if ( ctx.offset + lit.length <= ctx.text.length && ctx.text.substring( ctx.offset, ctx.offset + lit.length ) == lit )
                    ctx.offset += lit.length;
            } else {
                if ( ctx.offset < ctx.text.length && ctx.text.charAt( ctx.offset ) == c )
                    ctx.text.offset++;
            }
        }
        if ( ctx.period=='PM' )
            ctx.hour += 12;
        else if ( ctx.period!='24H' && ctx.period!='AM' )
            ctx.hour = NaN;
        if ( ctx.era=='BC' )
            ctx.year = - ( ctx.year - 1 );
        else if ( ctx.era!='AD')
            ctx.year = NaN;
        if ( isFinite( ctx.year ) && isFinite( ctx.month ) && isFinite( ctx.day ) && isFinite( ctx.hour ) && isFinite( ctx.minutes ) && isFinite( ctx.seconds ) && isFinite( ctx.ms ) && ( ctx.tz_offset===null || isFinite( ctx.tz_offset ) ) && ctx.day <= lastDayOfTheMonth( ctx.month - 1, ctx.year ) ) {
            if ( ctx.tz_offset===null ) {
                return new Date( ctx.year, ctx.month-1, ctx.day, ctx.hour, ctx.minutes, ctx.seconds, ctx.ms );
            } else {
                var d = Date.UTC( ctx.year, ctx.month-1, ctx.day, ctx.hour, ctx.minutes, ctx.seconds, ctx.ms );
                return new Date ( d - ctx.tz_offset * 60000 );
            }
        }
    }
    return new Date( NaN );
}

function icalMakeDate( year, month, day, hour, minute, second ) {
    if ( second > 59 ) {
        minute += Math.floor( second/60 );
        second %= 60;
    } else if ( second < 0 ) {
        minute += Math.floor( second/60 );
        second = second % 60 + 60;
    }
    if ( minute > 59 ) {
        hour += Math.floor( minute/60 );
        minute %= 60;
    } else if ( minute < 0 ) {
        hour += Math.floor( minute/60 );
        minute = minute % 60 + 60;
    }
    if ( hour > 23 ) {
        day += Math.floor( hour/24 );
        hour %= 24;
    } else if ( hour < 0 ) {
        day += Math.floor( hour/24 );
        hour = hour % 24 + 24;
    }
    while ( day > lastDayOfTheMonth( month, year ) )
        day -= lastDayOfTheMonth( month++, year );
    while ( day <= 0 )
        day += lastDayOfTheMonth( --month, year );
    if ( month > 11 ) {
        year += Math.floor( month/12 );
        month %= 12;
    } else if ( month < 0 ) {
        year += Math.floor( month/12 );
        month = month % 12 + 12;
    }
    return new Date( year, month, day, hour, minute, second );
}

function icalDate( date, end ) {
    end = end ? 1 : 0;

    if ( date=='now' ) {
        if ( end )
            return new Date( Date.now()+1000 );
        else
            return new Date();
    } else if ( date=='indefinite' && !end ) {
        return new Date( Date.now()+316e9 );
    }

    var r = reRelAbsDate.exec( date );
    if ( r ) {
        var year, month, day, hour, minute, second, subday = false;
        var now = new Date();
        year = now.getFullYear();
        month = now.getMonth();
        day = now.getDate();
        hour = now.getHours();
        minute = now.getMinutes();
        second = now.getSeconds();
        if ( r[1] ) {
            if ( r[2] ) {
                year = parseFloat( r[2] );
                month = parseFloat( r[3] )-1;
                day = parseFloat( r[4] );
            } else {
                var x = r[5]=='this' ? 0 : parseFloat( r[5] );
                var y = r[6];
                if ( y=='second' ) {
                    subday = true;
                    second += x;
                } else if ( y=='minute' ) {
                    subday = true;
                    minute += x;
                    second = end ? 59 : 0;
                } else if ( y=='hour' ) {
                    subday = true;
                    hour += x;
                    minute = end ? 59 : 0;
                    second = end ? 59 : 0;
                } else if ( y=='day' ) {
                    day += x;
                } else if ( y=='month' ) {
                    month += x;
                    if ( r[7] ) {
                        day = parseFloat( r[7] );
                        if ( day<=0 )
                            day = 1;
                        else if ( day > lastDayOfTheMonth( month, year ) )
                            day = lastDayOfTheMonth( month, year );
                    } else {
                        day = end ? lastDayOfTheMonth( month, year ) : 1;
                    }
                } else if ( y=='year' ) {
                    year += x;
                    if ( r[7] ) {
                        month = parseFloat( r[7] ) - 1;
                        if ( month < 0 )
                            month = 0;
                        else if ( month > 11 )
                            month = 11;
                    } else {
                        month = end ? 11 : 0;
                    }
                    if ( r[8] ) {
                        day = parseFloat( r[8] );
                        if ( day<=0 )
                            day = 1;
                        else if ( day > lastDayOfTheMonth( month, year ) )
                            day = lastDayOfTheMonth( month, year );
                    } else {
                        day = end ? 31 : 1;
                    }
                } else if ( y in wdays ) {
                    var wday = wdays[y];
                    var tday = now.getDay() - 1;
                    if ( tday<0 ) tday = 6;
                    if ( x==0 ) {
                        if ( wday < tday )
                            x = -1;
                        else if ( wday > tday )
                            x = 1;
                    }
                    if ( x > 0 ) {
                        if ( wday > tday )
                            day += wday-tday + (x-1) * 7;
                        else
                            day += wday-tday + x * 7;
                    } else if ( x < 0 ) {
                        if ( wday > tday )
                            day += wday-tday + x * 7;
                        else
                            day += wday-tday + (x+1) * 7;
                    }
                }
            }
        }
        if ( !subday ) {
            if ( end ) {
                hour = 23;
                minute = 59;
                second = 59;
            } else {
                hour = 0;
                minute = 0;
                second = 0;
            }
            if ( r[9] )
                hour = parseFloat( r[9] );
            if ( r[10] )
                minute = parseFloat( r[10] );
            if ( r[11] )
                second = parseFloat( r[11] );
        }
        if ( end )
            ++second;
        return icalMakeDate( year, month, day, hour, minute, second );
    }

    if ( end )
        return new Date( Date.now()+316e9 );

    return new Date();
}

function icalDateRange( p ) {
    var start = p.startDate ? icalDate( p.startDate, false ) : new Date();
    var end = p.endDate && p.endDate!='indefinite' ? icalDate( p.endDate, true ) : null;
    var r = p.dur ? reDur.exec( p.dur ) : null;
    if ( r ) {
        var x = parseFloat( r[1] ), y = r[2];
        if ( x > 0 ) {
            var year=start.getFullYear(), month=start.getMonth(), day=start.getDate(), hour=start.getHours(), minute=start.getMinutes(), second=start.getSeconds();
            if ( y=='second' )
                second += x;
            else if ( y=='minute' )
                minute += x;
            else if ( y=='hour' )
                hour += x;
            else if ( y=='day' )
                day += x;
            else if ( y=='week' )
                day += 7 * x;
            else if ( y=='month' )
                month += x;
            else if ( y=='year' )
                year += x;
            else
                second += 1;
            var e2 = icalMakeDate( year, month, day, hour, minute, second );
            if ( !end || e2.getTime() < end.getTime() )
                end = e2;
        }
    }
    if ( !end )
        end = icalDate( 'indefinite', true );
    return [ start, end ];
}

function icalParser( p, text ) {
    var range = icalDateRange( p );
    return jSignage.parseICAL( text, range[0], range[1], p.maxItems );
}

function csvParser( p, text ) {
    var columns = null;
    if ( p.columns ) {
        columns = [];
        for ( var i=0; i<p.columns.length; i++ ) {
            var c = p.columns[i];
            if ( c.number && ( 'name' in c ) )
                columns[c.number-1] = c.name;
        }
    }
    return jSignage.parseCSV( text, p.separator, columns, p.nswsp, p.quotes );
}

function regexpParser( p, text, srcColumnName ) {
    var table;

    if ( p.split ) {
        var reSplit = new RegExp( p.split, "g" );
        table = text.split( reSplit );
    } else {
        table = [ text ];
    }

    if ( p.match ) {
        var rows = [];
        var global = 'global' in p ? p.global : true;
        var reMatch = new RegExp( p.match, global ? "g" : "" );
        for ( var i=0; i<table.length; i++ ) {
            do {
                var lastIndex = reMatch.lastIndex;
                var r = reMatch.exec( table[i] ), obj;
                if ( !r )
                    break;
                if ( global && reMatch.lastIndex==lastIndex ) {   // Empty string was matched in the source, most likely because of a (...)* regexp, move on to the next char
                    ++reMatch.lastIndex;
                } else if ( p.columns ) {
                    var obj = {};
                    for ( var j=0; j<p.columns.length; j++ ) {
                        var column = p.columns[j];
                        if ( column.name )
                            obj[column.name] = r[ column.number || 0 ];
                    }
                    rows.push( obj );
                } else {
                    var obj = {};
                    obj[ srcColumnName || 'title' ] = r[0];
                    rows.push( obj );
                }
            } while ( global );
        }
        table = rows;
    } else {
        var name = srcColumnName || 'title';
        if ( p.columns ) {
            for ( var j=0; j<p.columns.length; j++ ) {
                var column = p.columns[j];
                if ( column.name && !column.number )
                    name = column.name;
            }
        }
        for ( var i=0; i<table.length; i++ ) {
            var obj = { };
            obj[name] = table[i];
            table[i] = obj;
        }
    }

    return table;
}

function customParser( p, text, srcColumnName, rowData ) {
    if ( p.inline ) {
        if ( !jSignage.isFunction(p.inline) ) {
            try {
                p.inline = new Function( 'text', 'rowData', p.inline );
            } catch( e ) {
                p.inline = function(text) { return ''+e; }
            }
        }
        var table = [];
        try {
            table = p.inline( text, rowData );
            if ( table===undefined )
                table = [];
        } catch( e ) {
        }
    } else {
        var uri = p.uri || 'custom.js';
        var fun = p['function'] || 'parse';
        var script = null;
        if ( !jSignage.isFunction(window[fun]) ) {
            script = jSignage._createElement( 'script', { type: 'application/ecmascript' } );
            script.setAttributeNS( jSignage.xlinkNS, 'xlink:href', uri );
            document.documentElement.insertBefore( script, document.documentElement.firstElementChild );
        }
        var table = [];
        if ( jSignage.isFunction(window[fun]) ) {
            try {
                table = window[fun]( text, rowData );
                if ( table===undefined )
                    table = [];
            } catch( e ) {
            }
        }
    }
    if ( !jSignage.isArray( table ) )
        table = [ table ];
    for ( var i=0; i<table.length; i++ ) {
        if ( table[i]===null || table[i]===undefined ) {
            table[i] = {};
        } else if ( typeof(table[i])=='object' ) {
            if ( table[i] instanceof Date ) {
                var date = table[i];
                table[i] = {};
                table[i][ srcColumnName || 'title' ] = date;
            }
        } else {
            var tmp = table[i];
            table[i] = {};
            table[i][ srcColumnName || 'title' ] = tmp;
        }
    }
    if ( script )
        document.documentElement.removeChild( script );
    return table;
}

var reSplitWildcards = /\s*;\s*/;
var reSpecialChars = /[\\\^\$\+\.\(\)\|\{\}\[\]]/g;

function directoryParser( p, ls ) {
    var table = [];
    var filter = null;
    if ( p.filter ) {
        filter = p.filter.replace( reSpecialChars, '\\$&' );
        filter = filter.replace( /\*/g, '.*' );
        filter = filter.replace( /\?/g, '.' );
        filter = new RegExp( '^(?:' + filter.split( reSplitWildcards ).join( '|' ) + ')$', 'i' );
    }
    for ( var i=0; i<ls.length; i++ ) {
        var item = ls[i];
        if ( !p.hidden && item.filename.charAt(0)=='.' )
            continue;
        if ( item.filename=='.' || item.filename=='..' )
            continue;
        if ( p.resourcetype && ( ( p.resourcetype=='collection' && item.resourcetype!='collection' ) || ( p.resourcetype=='file' && item.resourcetype=='collection' ) ) )
            continue;
        if ( filter && !filter.test( item.filename ) )
            continue;
        table.push( item );
    }
    return table;
}

function queryStringParser( p, text ) {
    var map = jSignage.decodeURIQueryString( text, false );
    var table = [];
    if ( p.tabular ) {
        var row = {};
        for ( var k in map ) {
            var r = reIndexed.exec( k );
            if ( r ) {
                var idx = parseInt( r[2], 10 );
                var name = r[1];
                if ( !( idx in table) )
                    table[idx] = {};
                table[idx][name] = map[k];
            } else {
                row[k] = map[k];
            }
        }
        if ( table.length ) {
            for( var i=0; i < table.length; i++ ) {
                if ( !(i in table) )
                    table[i] = {}
                for ( var k in row )
                    if ( !(k in table[i]) )
                        table[i][k] = row[k];
            }
        } else {
            table[0] = row;
        }
    } else {
        table[0] = map;
    }
    return table;
}

function parseData( p, text, column, row ) {
    if ( p.type=='rss' ) {
        return jSignage.parseRSS( text );
    } else if ( p.type=='xml' ) {
        var xml;
        try {
            if ( text.nodeType===1 || text.nodeType===9 )
                xml = text;
            else
                xml = jSignage.parseXML( text );
        } catch ( e ) {
            xml = null;
        }
        if ( xml )
            return xmlParser( p, xml, column );
        else
            return [];
    } else if ( p.type=='json' ) {
//        if ( text && typeof(text)=='object' )
        //            return jsonParser( p, text, column );
        var json;
        try {
            json = jSignage.parseJSON( text );
        } catch ( e ) {
            json = null;
        }
        if ( json )
            return jsonParser( p, json, column );
        else
            return [];
    } else if ( p.type=='csv' ) {
        return csvParser( p, text );
    } else if ( p.type=='regexp' ) {
        return regexpParser( p, text, column );
    } else if ( p.type=='ical' ) {
        return icalParser( p, text );
    } else if ( p.type=='custom' ) {
        return customParser( p, text, column, row );
    } else if ( p.type=='dir' ) {
        if ( text && jSignage.isArray( text ) )
            return directoryParser( p, text );
        else
            return [];
    } else if ( p.type=='queryString' ) {
        return queryStringParser( p, text );
    } else if ( p.type == 'date' ) {
        var date = dateParser( p, text );
        var row = {};
        row[ column || 'title' ] = date;
        return [ row ];
    }

    return null;
}

function mergeIntoTable( table, idx, inner ) {
    var n = inner.length, cell=table[idx];
    for ( var i=0; i<n; i++ ) {
        var row = inner[i];
        for ( var k in cell )
            if ( !(k in row) )
                row[k] = cell[k];        
    }
    inner.unshift( idx, 1 );
    table.splice.apply( table, inner );
    return n;
}

function castDate( x ) {
    if ( typeof(x)=='number' && !isNaN(x) )
        return x;
    if ( !x )   // includes NaN
        return Number.NEGATIVE_INFINITY;
    if ( typeof(x)=='object' && x.getTime )
        x = x.getTime();
    else
        x = Date.parse( x );
    if ( !isFinite( x ) )
        x = Number.NEGATIVE_INFINITY;
    return x;
}

function castString( x ) {
    return x===null || x===undefined ? '' : x + '';
}

function castNumber( x ) {
    x = typeof(x)=='number' ? x : parseFloat(x);
    if ( isNaN(x) ) x = Number.NEGATIVE_INFINITY;
    return x;
}
    
function sortData( sort, table, parser ) {
    var column = sort.column;

    function compareString( a, b ) {
        var sa = castString( a[column] );
        var sb = castString( b[column] );
        return sa.localeCompare( sb );
    }

    function compareNumber( a, b ) {
        var na = castNumber( a[column] );
        var nb = castNumber( b[column] );
        return na < nb ? -1 : na > nb ? 1 : 0;
    }

    function compareDate( a, b ) {
        var na = castDate( a[column] );
        var nb = castDate( b[column] );
        return na < nb ? -1 : na > nb ? 1 : 0;
    }

    if ( !column )
        return;
    var type = sort.type || '';
    func = type=='number' ? compareNumber : type=='date' ? compareDate : compareString;
    if ( sort.reverse )
        table.sort( function( a, b ) { return -func( a, b ); } );
    else
        table.sort( func );
}

function filterData( filter, table, parser ) {
    var column, value, value2, test = filter.test;

    var filter_table = {
        eq_string: function ( a ) { return castString(a[column]) == value; },
        neq_string: function ( a ) { return castString(a[column]) != value; },
        lt_string: function ( a ) { return castString(a[column]).localeCompare(value) < 0; },
        lte_string: function ( a ) { return castString(a[column]).localeCompare(value) <= 0; },
        gt_string: function ( a ) { return castString(a[column]).localeCompare(value) > 0; },
        gte_string: function ( a ) { return castString(a[column]).localeCompare(value) >= 0; },

        eq_number: function( a ) { return castNumber(a[column]) == value; },
        neq_number: function( a ) { return castNumber(a[column]) != value; },
        lt_number: function( a ) { return castNumber(a[column]) < value; },
        lte_number: function( a ) { return castNumber(a[column]) <= value; },
        gt_number: function( a ) { return castNumber(a[column]) > value; },
        gte_number: function( a ) { return castNumber(a[column]) >= value; },
        gtAndLt_number: function( a ) { var x=castNumber(a[column]); return x > value && x < value2; },
        gtAndLte_number: function( a ) { var x=castNumber(a[column]); return x > value && x <= value2; },
        gteAndLt_number: function( a ) { var x=castNumber(a[column]); return x >= value && x < value2; },
        gteAndLte_number: function( a ) { var x=castNumber(a[column]); return x >= value && x <= value2; },

        eq_date: function( a ) { return castDate(a[column]) == value; },
        neq_date: function( a ) { return castDate(a[column]) != value; },
        lt_date: function( a ) { return castDate(a[column]) < value; },
        lte_date: function( a ) { return castDate(a[column]) <= value; },
        gt_date: function( a ) { return castDate(a[column]) > value; },
        gte_date: function( a ) { return castDate(a[column]) >= value; }
    };

    var func, r = [];
    if ( jSignage.isFunction( test ) ) {
        func = test;
    } else {
        column = filter.column || filter.src;
        value = filter.value;
        if ( !column || !test )
            return table;
        if ( test=='match' ) {
            var re = new RegExp( value );
            func = function( a ) {
                var x = castString( a[column] );
                return re.test( x );
            };
        } else if ( test=='range' ) {
            var range = icalDateRange( filter );
            func = function( a ) {
                var x = castDate( a[column] );
                return x >= range[0] && x < range[1];
            };
        } else {
            var type = filter.type=='filterNumber' || filter.type=='number' ? 'number' : filter.type=='filterString' || filter.type=='string' ? 'string' : filter.type=='filterDate' || filter.type=='date' ? 'date' : null;
            if( !type )
                type = test=='lt' || test=='lte' || test=='gt' || test=='gte' || test=='gtAndLt' || test=='gtAndLte' || test=='gteAndLt' || test=='gteAndLte' ? 'number' : 'string';
            if ( type=='number' ) {
                value = castNumber( value );
                if ( test=='gtAndLt' || test=='gtAndLte' || test=='gteAndLt' || test=='gteAndLte' )
                    value2 = castNumber( filter.value2 );
            } else if ( type=='date' ) {
                value = castDate( value );
            } else {
                value = castString( value );
            }
            func = filter_table[ test+'_'+type ];
        }
    }
    if ( !func )
        return table;
    for ( var i=0; i<table.length; i++ )
        if ( func( table[i] ) )
            r.push( table[i] );
    return r;
}

var reMatchFormatString = /\[\[(.*?)\]\]/g;
var replaceableAttribute = { href: true, fill: true, html: true };
var reMatchFormatDateNumber = /^(.*?)(?:\|(.*?))?>(.*)$/;
var reRFC822DateTime = /^(?:\s*(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun),)?\s*\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/;
var reISO8601DateTime = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}(?::\d{2})?)?$/;
var reIndexed = /^([^[]+)\[(\d+)\]$/;
var reRemote = /https?:\/\//;

jSignage.extend({
    canned: function( json ) {
        var trans = uncanObject( json );
        if ( !trans || ( !jSignage.isFunction(trans) && !trans.wrapIn ) )
            return null;
        return trans;
    },

    cannedText: function( canned, text_modifier, args_modifier ) {
        if ( text_modifier==='data' ) {
            var item = args_modifier;
            return jSignage.cannedText(
                canned, 
                function( text ) { return jSignage.formatStringWithData( text, item ); },
                function( key, value ) { return jSignage.formatAttributeWithData( key, value, item ); }
            );
        } else if ( text_modifier==='loremipsum' ) {
            var loremipsum = args_modifier;
            return jSignage.cannedText(
                canned, 
                function( text ) { return jSignage.formatStringWithLoremIpsum( text, loremipsum ); },
                function( key, value ) { return jSignage.formatAttributeWithLoremIpsum( key, value, loremipsum ); }
            );
        }
        var text = uncanObject( canned, args_modifier );
        if ( text_modifier ) {
            if ( !jSignage.isArray(text) )
                text = [ text ];
            for ( var i=0; i<text.length; i++ ) {
                var it = text[i], ot;
                if ( it && typeof(it)=='object' ) {
                    ot = {};
                    for ( var key in it ) {
                        if ( key=='text' )
                            ot.text = text_modifier( it.text );
                        else
                            ot[key] = it[key];
                    }
                } else {
                    ot = text_modifier( it );
                }
                text[i] = ot;
            }
            if ( text.length==1 )
                text = text[0];
        }
        return text;
    },

    uncanEffects: function( layer, effects, args_modifier ) {
        if ( jSignage.isArray( effects ) ) {
            for ( var i=0; i<effects.length; i++ )
                layer = uncanEffect( layer, effects[i], args_modifier );
        } else {
            layer = uncanEffect( layer, effects, args_modifier );
        }
        return layer;
    },

    uncan: function( json, text_modifier, args_modifier, jsonTransform ) {
        if ( text_modifier==='data' ) {
            var item = args_modifier;
            var formatText = function ( text ) { return jSignage.formatStringWithData( text, item ); };
            var formatAttribute = function ( key, value ) { return jSignage.formatAttributeWithData( key, value, item ); };
            var layers = jSignage.uncan( json, formatText, formatAttribute, jsonTransform );
            if ( !layers.sticky )
                layers.sticky = {};
            layers.sticky.text_modifier = formatText;
            layers.sticky.args_modifier = formatAttribute;
            return layers;
        } else if ( text_modifier === 'loremipsum' ) {
            var loremipsum = args_modifier;
            var formatText = function( text ) { return jSignage.formatStringWithLoremIpsum( text, loremipsum ); };
            var formatAttribute = function( key, value ) { return jSignage.formatAttributeWithLoremIpsum( key, value, loremipsum ); };
            var layers = jSignage.uncan( json, formatText, formatAttribute, jsonTransform );
            if ( !layers.sticky )
                layers.sticky = {};
            layers.sticky.text_modifier = formatText;
            layers.sticky.args_modifier = formatAttribute;
            return layers;
        }

        if ( json && typeof(json)=='object' ) {
            if ( jSignage.isArray(json) ) {
                if ( json.length == 0 && !jsonTransform )
                    return null;
                if ( json.length==1 )
                    return jSignage.uncan( json[0], text_modifier, args_modifier, jsonTransform );
                var elems = [];
                for ( var i=0; i<json.length; i++ ) {
                    if ( jsonTransform )
                        jsonTransform( json[i] );
                    var j = jSignage.uncan( json[i], text_modifier, args_modifier );
                    if ( j && j[0] )
                        elems.push( j[0] );
                }
                var layers = jSignage( elems );
                if ( jsonTransform )
                    layers.sticky = { jsonTransform: jsonTransform };
                return layers;
            } else {
                if ( !json.ctor )
                    return null;
                if ( jsonTransform )
                    jsonTransform( json );
                var layer = uncanObject( json, args_modifier );
                if ( !layer || !layer.jsignage )
                    return null;
                if ( jsonTransform )
                    layer.sticky = { jsonTransform: jsonTransform };
                if ( json.fillFreeze )
                    layer.setFillFreeze();
                if ( json.initialVisibility )
                    layer.setInitialVisibility();
                if ( json.changeNumber )
                    jSignage.getRealMediaTarget(layer[0]).setAttributeNS( jSignage.spxNS, 'changeNumber', json.changeNumber );
                if ( json.effectIn )
                    layer = jSignage.uncanEffects( layer, json.effectIn, args_modifier );
                if ( json.effectOut )
                    layer = jSignage.uncanEffects( layer, json.effectOut, args_modifier );
                if ( 'textContent' in json )
                    layer.text( jSignage.cannedText( json.textContent, json.liveTextEdit ? null : text_modifier, args_modifier ) );
                if ( json.children ) {
                    var children = jSignage.uncan( json.children, text_modifier, args_modifier );
                    if ( children )
                        layer.add( children );
                }
                return layer;
            }
        } else if ( jsonTransform ) {
            var layers = jSignage( [] );
            if ( jsonTransform )
                layers.sticky = { jsonTransform: jsonTransform };
            return layers;
        }
        return null;
    },

    getFeed: function( feed, callback, useGetURL ) {
        if ( !feed || ( feed.type!='documentURI' && !feed.src ) )
            return;
        if ( feed.type=='variable' ) {
            if ( window.createSharedVariable ) {
                var shared = createSharedVariable( feed.src );
                if ( shared ) {
                    shared.addUpdateListener( function() {
                        callback( shared.value, null, true );
                    }, 'sync' in feed ? feed.sync : true );
                }
            } else {
                jSignage.setTimeout( function() {
                    if ( window.sessionStorage ) {
                        var value = window.sessionStorage.getItem( feed.src );
                        if ( value!==null )
                            callback( value );
                        window.addEventListener( "storage", function( ev ) {
                            if ( ev.storageArea==window.sessionStorage && ev.key==feed.src ) {
                                callback( ev.newValue===null ? '' : ev.newValue );
                            }
                        }, false );
                    } else {
                        callback( null, 'WebStorage API Not Available' );
                    }
                }, 0 );
            }
        } else if ( feed.type=='inline' ) {
            jSignage.setTimeout( function() {
                var selected = jSignage.find( feed.src );
                if ( selected.length )
                    callback( selected[0] );
                else
                    callback( null, 'Not found' );
            }, 0 );
        } else if ( feed.type=='documentURI' ) {
            jSignage.setTimeout( function() {
                var q = document.documentURI.indexOf( '?' );
                if ( q >= 0 )
                    callback( document.documentURI.substring( q+1 ) );
                else
                    callback( null, 'No query string in document URI' );
            }, 0 );
        } else {
            var parser = feed.parser;
            if ( jSignage.isArray( parser ) )
                parser = parser[0];
            parser = parser && typeof(parser)=='object' ? parser.type : '';
            if ( parser=='dir' ) {
                propFindURL( feed.src, function( status ) {
                    if ( status.success )
                        callback( status.content ); 
                    else
                        callback( null, "error" );
                });
            } else if ( useGetURL || window.__jSignage__global.getURLFlags!==null ) {
		        var timeoutTimer = null, timedOut = false;
		        var getURLCallback = function( status ) {
		            var statusText, error, isSuccess = false, success;
		            if ( status===false ) {
		                timedOut = true;
		                callback( null, "timeout" );
		            } else if ( timedOut ) {
		                // We timed out already, discard response.
		                return;
		            } else {
		                if ( timeoutTimer )
		                    jSignage.clearTimeout( timeoutTimer );
		            }
		            if ( status.success )
		                callback( status.content );
		            else
		                callback( null, "error" );
		        };
                if ( feed.timeout && feed.timeout > 0 ) {
			        timeoutTimer = jSignage.setTimeout( function() {
			            getURLCallback( false );
			        }, feed.timeout );
			    }
			    if ( feed.requestType && feed.requestType=='POST' ) {
                    postURL( feed.src, feed.data, getURLCallback, feed.contentType || 'text/plain' );
			    } else {
                    if ( window.__jSignage__global.getURLFlags===null )
                        getURL( feed.src, getURLCallback );
                    else
                        getURL( feed.src, getURLCallback, window.__jSignage__global.getURLFlags );
                }
            } else {
                var options = {
                    async: true,
                    global: false,
                    type: feed.requestType || 'GET',
                    dataType: 'text',
                    success: function( data, textStatus, jqXHR ) {
                        callback( data );
                    },
                    error: function( jqXHR, textStatus, errorThrown ) {
                        callback( null, jqXHR.status > 0 ? jqXHR.status + ' ' + jqXHR.statusText : errorThrown );
                    }
                };
                if ( parser=='rss' )
                    options.mimeType = 'application/rss+xml';
                else if ( parser=='xml' )
                    options.mimeType = 'text/xml';
                else if ( parser=='html' )
                    options.mimeType = 'text/html';
                else if ( parser=='json' )
                    options.mimeType = 'application/json';
                else if ( parser=='csv' )
                    options.mimeType = 'text/csv';
                else if ( parser=='ical' )
                    options.mimeType = 'text/calendar';
                else if ( parser!='custom' )
                    options.mimeType = 'text/plain';
                jSignage.copyProps( feed, options, [ 'data', 'contentType', 'crossDomain', 'timeout', 'username', 'password', 'headers', 'mimeType' ] );
                jSignage.ajax( feed.src, options );
            }
        }
    },

    getAndParseFeedClassic: function ( feed, callback, useGetURL ) {
        var cacheData = jSignage.checkCacheData( feed );
        if ( cacheData === false ) {
            jSignage.getFeed( feed, function( data, error, rt ) {
                if ( data!==null ) {
                    jSignage.updateCacheData( feed, data );
                    callback( jSignage.parseFeed( feed, data ), rt );
                } else
                    callback( feed.debug ? [ String(error) ] : [], rt );
            }, useGetURL);
            if ( feed.refresh && feed.type != 'variable' ) {
                jSignage.setTimeout( function () {
                    jSignage.getAndParseFeedClassic( feed, callback, useGetURL );
                }, feed.refresh*1000 );            
            }
        } else {
            callback( jSignage.parseFeed( feed, cacheData.data ), false );
            jSignage.setTimeout( function () {
                jSignage.getAndParseFeedClassic( feed, callback, useGetURL );
            }, cacheData.remain ); 
        }
    },

    feedIsRemote: function( feed ) {
        return feed.type === 'uri' && feed.src && reRemote.test( feed.src );
    },

    getAndParseFeed: function ( feed, callback, useGetURL ) {
        if ( feed.debug || !jSignage.feedIsRemote( feed ) || !feed.syncVariable || !window.createSharedVariable ) {
            jSignage.getAndParseFeedClassic( feed, callback, useGetURL );
            return;
        }
        var syncVariable = feed.syncVariable, infoVariable;
        var at = syncVariable.lastIndexOf( '@' );
        if ( at < 0 )
            infoVariable = syncVariable + '.info';
        else
            infoVariable = syncVariable.substring( 0, at ) + '.info' + syncVariable.substring( at );
        var iv = createSharedVariable( infoVariable ), sv = createSharedVariable( syncVariable );
        var timeoutNext = null, booted = false, OL = null;
        var shared_feed = jSignage.extend( {}, feed, {
            type: 'variable',
            src: syncVariable
        } );
        var refresh = feed.refresh || 0;
        if ( refresh > 0 && refresh < 10 )
            refresh = 10;
        var current_data = null, data_callback = null;
        function readCurrentData() {
            sv.removeUpdateListener( readCurrentData );
            current_data = sv.value;
            if ( data_callback )
                data_callback();
        }
        sv.addUpdateListener( readCurrentData, false );

        function checkUpdateFeed() {
            var L, RL = iv.value, OOL = OL;
            var now = Date.now(), msid = window.MULTI_SCREEN_ID;
            logAtLevel( LOG_LEVEL_INFO, 't=' + now + ' v=' + RL );
            OL = null;
            if ( timeoutNext !== null ) {
                jSignage.clearTimeout( timeoutNext );
                timeoutNext = null;
            }
            try {
                L = JSON.parse( RL );
            } catch ( e ) {
                L = {
                    date: null,
                    checked: null,
                    owner: null,
                    expires: null
                };
            }
            if ( RL === OOL ) {
                // We just acquired the lock
                if ( !L.date || L.date + refresh * 1000 < now + 10000 ) {
                    // Fetch the data again because it won't be fresh enough to last at least 10s.
                    jSignage.getFeed( feed, function ( data, error ) {
                        if ( data === null )
                            data = '';
                        sv.set( data );
                        iv.testAndSet( OOL, JSON.stringify( {
                            date: now,
                            checked: now,
                            owner: null,
                            expires: null
                        } ) );
                        if ( !booted ) {
                            booted = true;
                            jSignage.getAndParseFeedClassic( shared_feed, callback, useGetURL );
                        }
                        if ( refresh > 0 )
                            timeoutNext = jSignage.setTimeout( checkUpdateFeed, refresh * 1000 );
                    }, useGetURL );
                } else {
                    // Just make the update timestamp of the feed variable match the opening time of the document
                    function resetDataTimestamp() {
                        sv.set( current_data );
                        iv.testAndSet( OOL, JSON.stringify( {
                            date: L.date,
                            checked: now,
                            owner: null,
                            expires: null
                        } ) );
                        if ( !booted ) {
                            booted = true;
                            jSignage.getAndParseFeedClassic( shared_feed, callback, useGetURL );
                        }
                        if ( refresh > 0 )
                            timeoutNext = jSignage.setTimeout( checkUpdateFeed, L.date + refresh * 1000 - now );
                    }
                    if ( current_data === null )
                        data_callback = resetDataTimestamp;
                    else
                        resetDataTimestamp();
                }
            } else {
                if ( ( !booted || ( refresh > 0 && ( !L.date || L.date + refresh * 1000 < now + 10000 ) ) ) && ( !L.checked || L.checked < now - 5000 ) ) {
                    // Need to set / reset the sync variable, somebody must volonteer
                    if ( L.expires && L.expires > now && L.owner != msid) {
                        // Somebody else is doing the refresh right now, wait until he's finished.
                        timeoutNext = jSignage.setTimeout( checkUpdateFeed, L.expires - now );
                    } else {
                        // Try to acquire the lock, or reacquire if we tried to take it but did not use it, e.g. document was closed / has looped in between
                        OL = JSON.stringify( {
                            date: L.date || null,
                            checked: L.checked || null,
                            owner: msid,
                            expires: now + 60000
                        } );
                        iv.testAndSet( RL, OL );
                        timeoutNext = jSignage.setTimeout( checkUpdateFeed, 60000 );
                    }
                } else {
                    if ( !booted ) {
                        booted = true;
                        jSignage.getAndParseFeedClassic( shared_feed, callback, useGetURL );
                    }
                    if ( refresh > 0 )
                        timeoutNext = jSignage.setTimeout( checkUpdateFeed, L.date + refresh * 1000 - now );
                }
            }
        }

        iv.addUpdateListener( checkUpdateFeed, false );

        iv.testAndSet( '', JSON.stringify( {
            date: null,
            checked: null,
            owner: null,
            expires: null
        } ) );
    },

    setGetURLFlags: function( flags ) {
	    window.__jSignage__global.getURLFlags = flags;
	},

    getData: function( feed, callback ) {
        jSignage.getAndParseFeed( feed, callback, true );
    },
    checkCacheData: function( feed ) {
        if ( !feed.refresh || feed.type !== 'uri' ){
            return false;
        }
        
        var key = "jSignage:data:" + feed.src;
        var stored = sessionStorage.getItem( key );
        
        if ( stored === null ) {
            return false;
        } 
        var info;
        try {
            info = jSignage.parseJSON( stored );
        } catch ( e ) {
            info = null;
        }
        if ( !info || !('date' in info) || !('data' in info) ) {
            return false;
        } 
        var now = new Date();
        var when = new Date( info.date );
        var remain =  when - now ;
        if ( remain <= 10*1000 ) { // if only 10s left, get new data now
            return false;
        }      
        info.remain = remain;
        
        return info;        
    },
    updateCacheData: function( feed, data ) {
        if ( !feed.refresh || feed.type !== 'uri' ){
            return ;
        }
        var key = "jSignage:data:" + feed.src, k;
        var now = new Date();
        var when = new Date( now.getTime() + feed.refresh*1000 );
        var info = {
            date: when.toString(),
            data: data
        };
        try {
            sessionStorage.setItem( key, JSON.stringify(info) );        
        } catch( e ) {
            var toClear = [];            
            for ( var i = 0; i < sessionStorage.length; i++ ){
                k = sessionStorage.key(i);
                if ( key.indexOf( "jSignage:data:" ) === 0 ) {
                    var inf;
                    try {
                        inf = jSignage.parseJSON( sessionStorage.getItem( k ) );
                    } catch ( e ) {
                        inf = null;
                    }
                    if ( inf && ('date' in inf) && ('data' in inf) ) { 
                        var when = new Date( inf.date );                        
                        if ( now > when ) {
                            toClear.push( k );  
                        }  
                    }
                }
            }
            for ( i = 0; i < toClear.length; i++ ){
                sessionStorage.removeItem( toClear[i] );
            }
            try {
                sessionStorage.setItem( key, JSON.stringify(info) );        
            } catch( e ) {
                // still do not work, we give up.
            }
        }
    },
    parseFeed: function( json, data ) {
        var parser = json.parser, table = null, log;

        if ( json.type=='inline' && data.nodeType === 1 ) {
            var p0 = parser;
            if ( jSignage.isArray( p0 ) )
                p0 = p0[0];
            if ( !p0 || typeof ( p0 ) != 'object' || p0.type != 'xml' )
                data = data.textContent;
        }

        if ( json.debug ) {
            if ( json.type == 'inline' && data.nodeType === 1 )
                log = [ data.outerHTML ];
            else
                log = [ String(data) ];
        }

        if  ( !parser )
            return json.debug ? log : table;

        if ( jSignage.isArray( parser ) ) {
            if ( parser[0] && typeof(parser[0])=='object' )
                table = parseData( parser[0], data );
            if ( table ) for ( var i=1; i<parser.length; i++ ) {
                var p = parser[i];
                if ( p && typeof(p)=='object' && p.src ) {
                    if ( p.type && p.type.substring( 0, 6 )=='filter' ) {
                        if ( json.debug )
                            log.push( table );
                        table = filterData( p, table, parser );
                    } else {
                        if ( json.debug )
                            log.push( table.slice( 0 ) );
                        for ( var j=0; j<table.length; ) {
                            var src = table[j][p.src];
                            if ( src!==undefined && src!==null ) {
                                var inner = parseData( p, src, p.src, table[j] ) || [];
                                j += mergeIntoTable( table, j, inner );
                            } else {
                                table.splice( j, 1 );
                            }
                        }
                    }
                }
            }
        } else {
            if ( parser && typeof(parser)=='object' )
                table = parseData( parser, data );
        }

        if ( json.fallbacks && table ) {
            var fallbacks = { }, has = false;
            for ( var column in json.fallbacks ) {
                var fallback = json.fallbacks[column];
                if ( jSignage.isArray(fallback) ) {
                    if ( fallback.length > 0 && ( fallback[0] || fallback[0]===0 ) ) {
                        fallbacks[column] = fallback[0];
                        has = true;
                    }
                } else if ( fallback || fallback===0 ) {
                    fallbacks[column] = fallback;
                    has = true;
                }
            }
            if ( has ) for ( var i=0; i<table.length; i++ ) {
                var row = table[i];
                for ( var column in fallbacks )
                    if ( !(column in row) || ( !row[column] && row[column]!==0 ) )
                        row[column] = fallbacks[column];
            }
        }

        if ( json.filter && table ) {
            if ( jSignage.isArray( json.filter ) ) {
                for ( var i=0; i<json.filter.length; i++ ) {
                    if ( json.debug )
                        log.push( table );
                    if ( json.filter[i] && typeof(json.filter[i])=='object' )
                        table = filterData( json.filter[i], table, parser );
                }
            } else {
                if ( json.debug )
                    log.push( table );
                if ( json.filter && typeof(json.filter)=='object' )
                    table = filterData( json.filter, table, parser );
            }
        }

        if ( json.sort && table ) {
            if ( jSignage.isArray( json.sort ) ) {
                for ( var i=0; i<json.sort.length; i++ ) {
                    if ( json.debug )
                        log.push( table.slice( 0 ) );
                    if ( json.sort[i] && typeof(json.sort[i])=='object' )
                        sortData( json.sort[i], table, parser );
                }
            } else {
                if ( json.debug )
                    log.push( table.slice( 0 ) );
                if ( json.sort && typeof(json.sort)=='object' )
                    sortData( json.sort, table, parser );
            }
        }

        if ( json.maxCount && typeof(json.maxCount)=='number' ) {
            var maxCount = Math.floor( json.maxCount );
            if ( maxCount > 0 && table && table.length > maxCount )
                table.splice( maxCount, table.length-maxCount );
        }

        if ( json.debug )
            log.push( table );

        return json.debug ? log : table;
    },

    applyTimeDifferenceFormat: function( from, to, pattern, unit ) {
        function fmt( n, len ) {
            var str = '';
            if ( len > 1 ) {
                for ( ; len > 0; --len ) {
                    str = (n%10) + str;
                    n = Math.floor( n / 10 );
                }
            } else {
                str += n;
            }
            return str;
        }

        var Y=0, M=0, D=0, h=0, m=0, s=0;
        if ( unit=='h' || unit=='m' || unit=='s' || unit =='D' ) {
            s = Math.floor( ( to.getTime() - from.getTime() ) / 1000 );
            if ( s < 0 ) s = 0;
            if ( unit=='h' || unit=='m' || unit=='D' ) {
                m = Math.floor( s / 60 );
                s -= m * 60;
            }
            if ( unit=='h' || unit=='D' ) {
                h = Math.floor( m / 60 );
                m -= h * 60;
            }
            if ( unit=='D' ) {
                D = Math.floor( h / 24 );
                h -= D * 24;
            }
            var re = /'([^']*)'|(D+)|([hH]+)|([mM]+)|([sS]+)/g;
            return pattern.replace( re, function( match, p1, p2, p3, p4, p5 ) {
                if ( match[0]=='\'' ) return p1;
                if ( p2 ) return fmt( D, p2.length );
                if ( p3 ) return fmt( h, p3.length );
                if ( p4 ) return fmt( m, p4.length );
                if ( p5 ) return fmt( s, p5.length );
            });
        } else if ( unit=='Y' || unit=='M' ) {
            var dm = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
            var shortYear = to.getMonth() < from.getMonth();
            var shortMonth = to.getDate() < from.getDate();
            var shortDay = to.getHours() < from.getHours();
            if ( to.getHours()==from.getHours() ) {
                if ( to.getMinutes() < from.getMinutes() )
                    shortDay = true;
                else if ( to.getMinutes()==from.getMinutes() && to.getSeconds() < from.getSeconds() )
                    shortDay = true;
            }
            if ( to.getDate()==from.getDate() && shortDay )
                shortMonth = true;
            if ( to.getMonth()==from.getMonth() && shortMonth )
                shortYear = true;            

            Y = to.getFullYear() - from.getFullYear();
            M = to.getMonth() - from.getMonth();
            D = to.getDate() - from.getDate();

            if ( shortYear ) {
                --Y;
                M += 12;
            }
            if ( shortMonth ) {
                --M;
                D += dm[(to.getMonth()+11)%12];
            }
            if ( shortDay ) --D;

            var f2 = new Date( to.getFullYear(), to.getMonth(), shortDay ? to.getDate() -1 : to.getDate(), from.getHours(), from.getMinutes(), from.getSeconds() );
            s = Math.floor( ( to.getTime() - f2.getTime() ) / 1000 );
            m = Math.floor( s / 60 );
            s -= m * 60;
            h = Math.floor( m / 60 );
            m -= h * 60;

            if ( unit=='M' ) {
                M += 12 * Y;
                Y = 0;
                // Add up to one leap day
                if ( shortMonth && to.getMonth()==2 && ( to.getFullYear()%400==0 || ( to.getFullYear()%4==0 && to.getFullYear()%100!=0 ) ) )
                    ++D;
            } 
            var re = /'([^']*)'|(Y+)|(M+)|(D+)|([hH]+)|([mM]+)|([sS]+)/g;
            return pattern.replace( re, function( match, p1, p2, p3, p4, p5, p6, p7 ) {
                if ( match[0]=='\'' ) return p1;
                if ( p2 ) return fmt( Y, p2.length );
                if ( p3 ) return fmt( M, p3.length );
                if ( p4 ) return fmt( D, p4.length );
                if ( p5 ) return fmt( h, p5.length );
                if ( p6 ) return fmt( m, p6.length );
                if ( p7 ) return fmt( s, p7.length );
            });
        }
        return 'invalid unit';
    },

    applyDateNumberFormat: function( src, locale, pattern ) {
        if ( src===undefined )
            return '';
        if ( src && typeof(src)=='string' && ( reRFC822DateTime.test( src ) || reISO8601DateTime.test( src ) ) )
            src = new Date( src );
        if ( src && typeof(src)=='object' && src.getDate ) {
            if ( pattern=='' )
                pattern = jSignage.DateTimeFormat.Format.LONG_DATETIME;
            else if ( pattern in jSignage.DateTimeFormat.Format )
                pattern = jSignage.DateTimeFormat.Format[pattern];
            var dtf = new jSignage.DateTimeFormat( pattern, locale );
            return dtf.format( src );
        } else if ( pattern in jSignage.DateTimeFormat.Format ){            
            return src;
        } else {
            if ( typeof(src) != 'number' )
                src = parseFloat( src );
            if ( pattern=='' )
                pattern = jSignage.NumberFormat.Format.DECIMAL;
            else if ( pattern=='E' )
                pattern = jSignage.NumberFormat.Format.SCIENTIFIC;
            else if ( pattern=='%' )
                pattern = jSignage.NumberFormat.Format.PERCENT;
            else if ( pattern=='$' )
                pattern = jSignage.NumberFormat.Format.CURRENCY;
            else if ( pattern in jSignage.NumberFormat.Format )
                pattern = jSignage.NumberFormat.Format[pattern];
            var nf = new jSignage.NumberFormat( pattern, locale );
            return nf.format( src );
        }
    },

    formatStringWithData: function( text, item ) {
        return text.replace( reMatchFormatString, function( str, member_name ) {
            var f = reMatchFormatDateNumber.exec( member_name );
            if ( f )
                return jSignage.applyDateNumberFormat( item[f[1]], f[2] || null, f[3] );
            return item && member_name in item ? item[member_name] : '';
        });
    },

    formatAttributeWithData: function( key, value, item ) {
        if ( replaceableAttribute[key] )
            value = jSignage.formatStringWithData( value, item );
        return value;
    },

    formatStringWithLoremIpsum: function( text, fallbacks ) {
        return text.replace( reMatchFormatString, function( str, member_name ) {
            var f = reMatchFormatDateNumber.exec( member_name );
            if ( f )
                member_name = f[1];
            if ( fallbacks && member_name in fallbacks ) {
                var fallback = fallbacks[member_name];
                var src = null;
                if ( jSignage.isArray(fallback) ) {
                    if ( fallback.length >= 2 && ( fallback[1] || fallback[1]===0 ) )
                        src = fallback[1];
                    else if ( fallback.length >= 1 && ( fallback[0] || fallback[0]===0 ) )
                        src = fallback[0];
                } else if ( fallback || fallback===0 ) {
                    src = fallback;
                }
                if ( src!==null )
                    return f ? jSignage.applyDateNumberFormat( src, f[2] || null, f[3] ) : src;
            }
            return str;
        });
    },

    formatAttributeWithLoremIpsum: function( key, value, fallbacks ) {
        if ( replaceableAttribute[key] )
            value = jSignage.formatStringWithLoremIpsum( value, fallbacks );
        return value;
    },

    formatNumberWithData: function( text, item ) {
        var n = text.replace( reMatchFormatString, function( str, member_name ) {
            return item && member_name in item ? item[member_name] : 0;
        });
        n = parseFloat( n );
        if ( !isFinite( n ) )
            n = 0;
        return n;
    },

    decodeURIQueryString: function( queryString, qs_only ) {
        if ( !qs_only ) {
            var q = queryString.indexOf( '?' );
            if ( q >= 0 )
                queryString = queryString.substring( q + 1 );
            var q = queryString.indexOf( '#' );
            if ( q >= 0 )
                queryString = queryString.substring( 0, q );
        }
        var pairs = queryString.split( '&' ), map = {};
        for ( var i = 0; i<pairs.length; i++ ) {
            var pair = pairs[i];
            var eq = pair.indexOf( '=' ), name, value;
            if ( eq < 0 ) {
                name = decodeURIComponent( pair );
                value = '';
            } else {
                name = decodeURIComponent( pair.substring( 0, eq ) );
                value = decodeURIComponent( pair.substring( eq+1 ) );
            }
            var multiNames = name.split(".");
            if ( multiNames.length === 1 ){
                map[name] = value;
            } else {                
                var obj = map;
                for ( var j=1; j<multiNames.length; j++ ){
                    if ( !(multiNames[j-1] in obj) ) {
                        if ( multiNames[j].match(/^\d+$/) ){
                            obj[multiNames[j-1]] = [];
                        } else {
                            obj[multiNames[j-1]] = {};
                        }
                    }
                    if ( j < multiNames.length-1 ){
                        obj = obj[multiNames[j-1]];
                    } else {
                        obj[multiNames[j-1]][multiNames[j]] = value;
                    }
                }                
            }
            
        }
        return map;
    }
});

/**
 * Datetime formatting functions following the pattern specification as defined
 * in JDK, ICU and CLDR, with minor modification for typical usage in JS.
 * Pattern specification: (Refer to JDK/ICU/CLDR)
 * <pre>
 * Symbol Meaning Presentation        Example
 * ------   -------                 ------------        -------
 * G        era designator          (Text)              AD
 * y#       year                    (Number)            1996
 * Y*       year (week of year)     (Number)            1997
 * u*       extended year           (Number)            4601
 * M        month in year           (Text & Number)     July & 07
 * d        day in month            (Number)            10
 * h        hour in am/pm (1~12)    (Number)            12
 * H        hour in day (0~23)      (Number)            0
 * m        minute in hour          (Number)            30
 * s        second in minute        (Number)            55
 * S        fractional second       (Number)            978
 * E        day of week             (Text)              Tuesday
 * e*       day of week (local 1~7) (Number)            2
 * D*       day in year             (Number)            189
 * F*       day of week in month    (Number)            2 (2nd Wed in July)
 * w*       week in year            (Number)            27
 * W*       week in month           (Number)            2
 * a        am/pm marker            (Text)              PM
 * k        hour in day (1~24)      (Number)            24
 * K        hour in am/pm (0~11)    (Number)            0
 * z        time zone               (Text)              Pacific Standard Time
 * Z        time zone (RFC 822)     (Number)            -0800
 * v        time zone (generic)     (Text)              Pacific Time
 * g*       Julian day              (Number)            2451334
 * A*       milliseconds in day     (Number)            69540000
 * '        escape for text         (Delimiter)         'Date='
 * ''       single quote            (Literal)           'o''clock'
 *
 * Item marked with '*' are not supported yet.
 * Item marked with '#' works different than java
 *
 * The count of pattern letters determine the format.
 * (Text): 4 or more, use full form, <4, use short or abbreviated form if it
 * exists. (e.g., "EEEE" produces "Monday", "EEE" produces "Mon")
 *
 * (Number): the minimum number of digits. Shorter numbers are zero-padded to
 * this amount (e.g. if "m" produces "6", "mm" produces "06"). Year is handled
 * specially; that is, if the count of 'y' is 2, the Year will be truncated to
 * 2 digits. (e.g., if "yyyy" produces "1997", "yy" produces "97".) Unlike other
 * fields, fractional seconds are padded on the right with zero.
 *
 * (Text & Number): 3 or over, use text, otherwise use number. (e.g., "M"
 * produces "1", "MM" produces "01", "MMM" produces "Jan", and "MMMM" produces
 * "January".)
 *
 * Any characters in the pattern that are not in the ranges of ['a'..'z'] and
 * ['A'..'Z'] will be treated as quoted text. For instance, characters like ':',
 * '.', ' ', '#' and '@' will appear in the resulting time text even they are
 * not embraced within single quotes.
 * </pre>
 */

var jSignageRootPath = 'http://download.spinetix.com/spxjslibs/';
if ( !jSignage.features.SpinetiX ) {
    ( function () {
        var currentScript = document.currentScript || ( function () {
            var scripts = document.getElementsByTagName( 'script' );
            return scripts[scripts.length - 1];
        } )();
        var path = currentScript.getAttributeNS( jSignage.xlinkNS, 'href' ).split( "/" );
        path.pop();
        jSignageRootPath = path.join( "/" ) + "/";
    } )();
}

jSignage.extend({
    _localeDB: {
        en_US: {
	        DateTimeSymbols: {
                ERAS: ['BC', 'AD'],
                ERANAMES: ['Before Christ', 'Anno Domini'],
                NARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
                STANDALONENARROWMONTHS: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
                MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                STANDALONEMONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                SHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                STANDALONESHORTMONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                WEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                STANDALONEWEEKDAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                SHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                STANDALONESHORTWEEKDAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                NARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
                STANDALONENARROWWEEKDAYS: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
                SHORTQUARTERS: ['Q1', 'Q2', 'Q3', 'Q4'],
                QUARTERS: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'],
                AMPMS: ['AM', 'PM'],
                DATEFORMATS: ['EEEE, MMMM d, y', 'MMMM d, y', 'MMM d, y', 'M/d/yy'],
                TIMEFORMATS: ['h:mm:ss a zzzz', 'h:mm:ss a z', 'h:mm:ss a', 'h:mm a'],
                FIRSTDAYOFWEEK: 6,
                WEEKENDRANGE: [5, 6],
                FIRSTWEEKCUTOFFDAY: 5
	        },
	        NumberFormatSymbols: {
                DECIMAL_SEP: '.',
                GROUP_SEP: ',',
                PERCENT: '%',
                ZERO_DIGIT: '0',
                PLUS_SIGN: '+',
                MINUS_SIGN: '-',
                EXP_SYMBOL: 'E',
                PERMILL: '\u2030',
                INFINITY: '\u221E',
                NAN: 'NaN',
                DECIMAL_PATTERN: '#,##0.###',
                SCIENTIFIC_PATTERN: '#E0',
                PERCENT_PATTERN: '#,##0%',
                CURRENCY_PATTERN: '\u00A4#,##0.00;(\u00A4#,##0.00)',
                DEF_CURRENCY_CODE: 'USD'
	        }
	    }
    },

    setLocale: function( locale ) {
        var old = window.__jSignage__global.LOCALE;
        window.__jSignage__global.LOCALE = locale;
        return old;
    },

    getLocale: function( locale ) {
        return window.__jSignage__global.LOCALE;
    },

    include: function ( filename, relativePath ) {
        if ( relativePath && filename.substr(0,4) !== "http" && filename.substr(0,1) !== "/")
            filename = jSignageRootPath + filename;
        var s = jSignage._createElement( 'script' );
        s.setAttributeNS( jSignage.xlinkNS, 'href', filename );
        document.documentElement.insertBefore( s, document.documentElement.firstElementChild );
        document.documentElement.removeChild( s );
    },

    getLocaleInfo: function( locale ) {
        locale = locale || jSignage.getLocale();
        var idx = locale.indexOf('.');
        if ( idx >= 0 ) {
            var file = locale;
            var p = file.lastIndexOf( '/' );
            locale = file.substring( p < 0 ? 0 : p+1, idx );
            if ( !(locale in window.__jSignage__global.localeDB) ) {
                var old = jSignage._localeDB[locale];
                jSignage.include( file );
                var ret = jSignage._localeDB[locale] || jSignage._localeDB['en_US'];
                if ( old )
                    jSignage._localeDB[locale] = old;
                else
                    delete jSignage._localeDB[locale];
                window.__jSignage__global.localeDB[locale] = ret;
            }
            return window.__jSignage__global.localeDB[locale];
        } else {
            if ( !(locale in jSignage._localeDB) ) {
                jSignage.include( 'locale/' + locale + '.js', true );
                if ( !(locale in jSignage._localeDB) )
                    jSignage._localeDB[locale] = jSignage._localeDB['en_US'];
            }
            return jSignage._localeDB[locale];
        }
    },

    getDateTimeSymbols: function( locale ) {
        var info = jSignage.getLocaleInfo( locale );
        return info && info.DateTimeSymbols || null;
    },

    getNumberFormatSymbols : function( locale ) {
        var info = jSignage.getLocaleInfo( locale );
        return info && info.NumberFormatSymbols || null;
    },

    padNumber: function(num, length, opt_precision) {
        var s = opt_precision!==undefined ? num.toFixed(opt_precision) : String(num);
        var index = s.indexOf('.');
        if (index == -1)
            index = s.length;
        return new Array(Math.max(0, length - index) + 1).join('0') + s;
    },

    DateTimeFormat: function( pattern, locale ) {
        this.patternParts_ = [];
        this.DateTimeSymbols = jSignage.getDateTimeSymbols( locale );
        if ( typeof pattern == 'number' ) {
            this.applyStandardPattern_( pattern );
        } else {
            this.applyPattern_( pattern );
        }
    },

    NumberFormat: function(pattern, locale, opt_currency, opt_currencyStyle) {
        this.NumberFormatSymbols = jSignage.getNumberFormatSymbols( locale );
        this.intlCurrencyCode_ = opt_currency || this.NumberFormatSymbols.DEF_CURRENCY_CODE;
        this.currencyStyle_ = opt_currencyStyle || jSignage.NumberFormat.CurrencyStyle.LOCAL;
        this.maximumIntegerDigits_ = 40;
        this.minimumIntegerDigits_ = 1;
        this.maximumFractionDigits_ = 3; // invariant, >= minFractionDigits
        this.minimumFractionDigits_ = 0;
        this.minExponentDigits_ = 0;
        this.useSignForPositiveExponent_ = false;
        this.positivePrefix_ = '';
        this.positiveSuffix_ = '';
        this.negativePrefix_ = '-';
        this.negativeSuffix_ = '';
        // The multiplier for use in percent, per mille, etc.
        this.multiplier_ = 1;
        this.groupingSize_ = 3;
        this.decimalSeparatorAlwaysShown_ = false;
        this.useExponentialNotation_ = false;
        if (typeof pattern == 'number') {
            this.applyStandardPattern_(pattern);
        } else {
            this.applyPattern_(pattern);
        }
    }

});

jSignage.extend( jSignage.DateTimeFormat, {
    Format: {
        FULL_DATE: 0,
        LONG_DATE: 1,
        MEDIUM_DATE: 2,
        SHORT_DATE: 3,
        FULL_TIME: 4,
        LONG_TIME: 5,
        MEDIUM_TIME: 6,
        SHORT_TIME: 7,
        FULL_DATETIME: 8,
        LONG_DATETIME: 9,
        MEDIUM_DATETIME: 10,
        SHORT_DATETIME: 11
    },

    TOKENS_: [
      //quote string
      /^\'(?:[^\']|\'\')*\'/,
      // pattern chars
      /^(?:G+|y+|M+|k+|S+|E+|a+|h+|K+|H+|c+|L+|Q+|d+|m+|s+|v+|z+|Z+)/,
      // and all the other chars
      /^[^\'GyMkSEahKHcLQdmsvzZ]+/  // and all the other chars
    ],

    PartTypes_: {
      QUOTED_STRING: 0,
      FIELD: 1,
      LITERAL: 2
    }
});

jSignage.extend( jSignage.NumberFormat, {
    Format: {
        DECIMAL: 1,
        SCIENTIFIC: 2,
        PERCENT: 3,
        CURRENCY: 4
    },

    CurrencyStyle: {
        LOCAL: 0,     // currency style as it is used in its circulating country.
        PORTABLE: 1,  // currency style that differentiate it from other popular ones.
        GLOBAL: 2     // currency style that is unique among all currencies.
    },
    
    setEnforceAsciiDigits: function(doEnforce) {
        window.__jSignage__global.enforceAsciiDigits_ = doEnforce;
    },

    isEnforceAsciiDigits: function() {
        return window.__jSignage__global.enforceAsciiDigits_;
    },

    PATTERN_ZERO_DIGIT_: '0',
    PATTERN_GROUPING_SEPARATOR_: ',',
    PATTERN_DECIMAL_SEPARATOR_: '.',
    PATTERN_PER_MILLE_: '\u2030',
    PATTERN_PERCENT_: '%',
    PATTERN_DIGIT_: '#',
    PATTERN_SEPARATOR_: ';',
    PATTERN_EXPONENT_: 'E',
    PATTERN_PLUS_: '+',
    PATTERN_MINUS_: '-',
    PATTERN_CURRENCY_SIGN_: '\u00A4',
    QUOTE_: '\''
});

jSignage.extend( jSignage.DateTimeFormat.prototype, {
    applyStandardPattern_: function( formatType ) {
        var pattern;
        if ( formatType < 4 ) {
            pattern = this.DateTimeSymbols.DATEFORMATS[formatType];
        } else if (formatType < 8) {
            pattern = this.DateTimeSymbols.TIMEFORMATS[formatType - 4];
        } else if (formatType < 12) {
            pattern = this.DateTimeSymbols.DATEFORMATS[formatType - 8] + ' ' + this.DateTimeSymbols.TIMEFORMATS[formatType - 8];
        } else {
            this.applyStandardPattern_(DateTimeFormat.Format.MEDIUM_DATETIME);
            return;
        }
        this.applyPattern_(pattern);
    },

    applyPattern_: function(pattern) {
        // lex the pattern, once for all uses
        while (pattern) {
            for (var i = 0; i < jSignage.DateTimeFormat.TOKENS_.length; ++i) {
                var m = pattern.match(jSignage.DateTimeFormat.TOKENS_[i]);
                if (m) {
                    var part = m[0];
                    pattern = pattern.substring(part.length);
                    if (i == jSignage.DateTimeFormat.PartTypes_.QUOTED_STRING) {
                        if (part == "''") {
                            part = "'";  // '' -> '
                        } else {
                            part = part.substring(1, part.length - 1); // strip quotes
                            part = part.replace(/\'\'/, "'");
                        }
                    }
                    this.patternParts_.push({ text: part, type: i });
                    break;
                }
            }
            if ( i == jSignage.DateTimeFormat.TOKENS_.length ) {
                this.patternParts_.push({ text: pattern, type: jSignage.DateTimeFormat.PartTypes_.QUOTED_STRING });
                break;
            }
        }
    },

    format: function(date, opt_timeZone) {
      var diff = opt_timeZone ?
          (date.getTimezoneOffset() - opt_timeZone.getOffset(date)) * 60000 : 0;
      var dateForDate = diff ? new Date(date.getTime() + diff) : date;
      var dateForTime = dateForDate;
      // in daylight time switch on/off hour, diff adjustment could alter time
      // because of timeZone offset change, move 1 day forward or backward.
      if (opt_timeZone &&
          dateForDate.getTimezoneOffset() != date.getTimezoneOffset()) {
        diff += diff > 0 ? -24 * 60 * 60000 : 24 * 60 * 60000;
        dateForTime = new Date(date.getTime() + diff);
      }

      var out = [];
      for (var i = 0; i < this.patternParts_.length; ++i) {
        var text = this.patternParts_[i].text;
        if (jSignage.DateTimeFormat.PartTypes_.FIELD ==
            this.patternParts_[i].type) {
          out.push(this.formatField_(text, date, dateForDate, dateForTime,opt_timeZone));
        } else {
          out.push(text);
        }
      }
      return out.join('');
    },

    localizeNumbers_: function(input) {
      if (this.DateTimeSymbols.ZERODIGIT === undefined) {
        return input;
      }

      var parts = [];
      for (var i = 0; i < input.length; i++) {
        var c = input.charCodeAt(i);
        parts.push((0x30 <= c && c <= 0x39) ? // '0' <= c <= '9'
            String.fromCharCode(this.DateTimeSymbols.ZERODIGIT + c - 0x30) :
            input.charAt(i));
      }
      return parts.join('');
    },

    formatEra_: function(count, date) {
      var value = date.getFullYear() > 0 ? 1 : 0;
      return count >= 4 ? this.DateTimeSymbols.ERANAMES[value] :
                          this.DateTimeSymbols.ERAS[value];
    },

    formatYear_: function(count, date) {
      var value = date.getFullYear();
      if (value < 0) {
        value = -value;
      }
      return this.localizeNumbers_(count == 2 ?
          jSignage.padNumber(value % 100, 2) :
          String(value));
    },

    formatMonth_: function(count, date) {
      var value = date.getMonth();
      switch (count) {
        case 5: return this.DateTimeSymbols.NARROWMONTHS[value];
        case 4: return this.DateTimeSymbols.MONTHS[value];
        case 3: return this.DateTimeSymbols.SHORTMONTHS[value];
        default:
          return this.localizeNumbers_(jSignage.padNumber(value + 1, count));
      }
    },

    format24Hours_: function(count, date) {
      return this.localizeNumbers_(
          jSignage.padNumber(date.getHours() || 24, count));
    },

    formatFractionalSeconds_: function(count, date) {
      // Fractional seconds left-justify, append 0 for precision beyond 3
      var value = date.getTime() % 1000 / 1000;
      return this.localizeNumbers_(
          value.toFixed(Math.min(3, count)).substr(2) +
          (count > 3 ? jSignage.padNumber(0, count - 3) : ''));
    },

    formatDayOfWeek_: function(count, date) {
      var value = date.getDay();
      return count >= 4 ? this.DateTimeSymbols.WEEKDAYS[value] :
                          this.DateTimeSymbols.SHORTWEEKDAYS[value];
    },

    formatAmPm_: function(count, date) {
      var hours = date.getHours();
      return this.DateTimeSymbols.AMPMS[hours >= 12 && hours < 24 ? 1 : 0];
    },

    format1To12Hours_: function(count, date) {
      return this.localizeNumbers_(
          jSignage.padNumber(date.getHours() % 12 || 12, count));
    },

    format0To11Hours_: function(count, date) {
      return this.localizeNumbers_(
          jSignage.padNumber(date.getHours() % 12, count));
    },

    format0To23Hours_: function(count, date) {
      return this.localizeNumbers_(jSignage.padNumber(date.getHours(), count));
    },

    formatStandaloneDay_: function(count, date) {
      var value = date.getDay();
      switch (count) {
        case 5:
          return this.DateTimeSymbols.STANDALONENARROWWEEKDAYS[value];
        case 4:
          return this.DateTimeSymbols.STANDALONEWEEKDAYS[value];
        case 3:
          return this.DateTimeSymbols.STANDALONESHORTWEEKDAYS[value];
        default:
          return this.localizeNumbers_(jSignage.padNumber(value, 1));
      }
    },

    formatStandaloneMonth_: function(count, date) {
      var value = date.getMonth();
      switch (count) {
        case 5:
          return this.DateTimeSymbols.STANDALONENARROWMONTHS[value];
        case 4:
          return this.DateTimeSymbols.STANDALONEMONTHS[value];
        case 3:
          return this.DateTimeSymbols.STANDALONESHORTMONTHS[value];
        default:
          return this.localizeNumbers_(jSignage.padNumber(value + 1, count));
      }
    },

    formatQuarter_: function(count, date) {
      var value = Math.floor(date.getMonth() / 3);
      return count < 4 ? this.DateTimeSymbols.SHORTQUARTERS[value] :
                         this.DateTimeSymbols.QUARTERS[value];
    },

    formatDate_: function(count, date) {
      return this.localizeNumbers_(jSignage.padNumber(date.getDate(), count));
    },

    formatMinutes_: function(count, date) {
        return this.localizeNumbers_(jSignage.padNumber(date.getMinutes(), count));
    },

    formatSeconds_: function(count, date) {
      return this.localizeNumbers_(jSignage.padNumber(date.getSeconds(), count));
    },
    
    getRFCTimeZoneString: function(date) {
        offset = date.getTimezoneOffset();
        var parts = [offset < 0 ? '-' : '+'];
        offset = Math.abs(offset);
        parts.push( jSignage.padNumber(Math.floor(offset / 60) % 100, 2), jSignage.padNumber(offset % 60, 2) );
        return parts.join('');
    },
    
    getGMTString: function(date) {
        var offset = date.getTimezoneOffset();
        var parts = ['GMT'];
        parts.push( offset <= 0 ? '+' : '-' );
        offset = Math.abs(offset);
        parts.push( jSignage.padNumber(Math.floor(offset / 60) % 100, 2), ':', jSignage.padNumber(offset % 60, 2) );
        return parts.join('');
    },

    formatTimeZoneRFC_: function(count, date, opt_timeZone) {
        // RFC 822 formats should be kept in ASCII, but localized GMT formats may need
        // to use native digits.
        return count < 4 ? this.getRFCTimeZoneString(date) : this.localizeNumbers_(this.getGMTString(date));
    },

    formatTimeZone_: function(count, date, opt_timeZone) {
      return this.localizeNumbers_(this.getGMTString(date));
    },

    formatTimeZoneId_: function(date, opt_timeZone) {
        return this.localizeNumbers_(this.getGMTString(date));
    },

    formatField_: function(patternStr, date, dateForDate, dateForTime, opt_timeZone) {
      var count = patternStr.length;
      switch (patternStr.charAt(0)) {
        case 'G': return this.formatEra_(count, dateForDate);
        case 'y': return this.formatYear_(count, dateForDate);
        case 'M': return this.formatMonth_(count, dateForDate);
        case 'k': return this.format24Hours_(count, dateForTime);
        case 'S': return this.formatFractionalSeconds_(count, dateForTime);
        case 'E': return this.formatDayOfWeek_(count, dateForDate);
        case 'a': return this.formatAmPm_(count, dateForTime);
        case 'h': return this.format1To12Hours_(count, dateForTime);
        case 'K': return this.format0To11Hours_(count, dateForTime);
        case 'H': return this.format0To23Hours_(count, dateForTime);
        case 'c': return this.formatStandaloneDay_(count, dateForDate);
        case 'L': return this.formatStandaloneMonth_(count, dateForDate);
        case 'Q': return this.formatQuarter_(count, dateForDate);
        case 'd': return this.formatDate_(count, dateForDate);
        case 'm': return this.formatMinutes_(count, dateForTime);
        case 's': return this.formatSeconds_(count, dateForTime);
        case 'v': return this.formatTimeZoneId_(date, opt_timeZone);
        case 'z': return this.formatTimeZone_(count, date, opt_timeZone);
        case 'Z': return this.formatTimeZoneRFC_(count, date, opt_timeZone);
        default: return '';
      }
    }
});

jSignage.extend( jSignage.NumberFormat.prototype, {

    setMinimumFractionDigits: function(min) {
      if (min > this.maximumFractionDigits_) {
        throw Error('Min value must be less than max value');
      }
      this.minimumFractionDigits_ = min;
    },

    setMaximumFractionDigits: function(max) {
      if (this.minimumFractionDigits_ > max) {
        throw Error('Min value must be less than max value');
      }
      this.maximumFractionDigits_ = max;
    },

    applyPattern_: function(pattern) {
      this.pattern_ = pattern.replace(/ /g, '\u00a0');
      var pos = [0];

      this.positivePrefix_ = this.parseAffix_(pattern, pos);
      var trunkStart = pos[0];
      this.parseTrunk_(pattern, pos);
      var trunkLen = pos[0] - trunkStart;
      this.positiveSuffix_ = this.parseAffix_(pattern, pos);
      if (pos[0] < pattern.length &&
          pattern.charAt(pos[0]) == jSignage.NumberFormat.PATTERN_SEPARATOR_) {
        pos[0]++;
        this.negativePrefix_ = this.parseAffix_(pattern, pos);
        // we assume this part is identical to positive part.
        // user must make sure the pattern is correctly constructed.
        pos[0] += trunkLen;
        this.negativeSuffix_ = this.parseAffix_(pattern, pos);
      } else {
        // if no negative affix specified, they share the same positive affix
        this.negativePrefix_ = this.positivePrefix_ + this.negativePrefix_;
        this.negativeSuffix_ += this.positiveSuffix_;
      }
    },

    applyStandardPattern_: function(patternType) {
      switch (patternType) {
        case jSignage.NumberFormat.Format.DECIMAL:
          this.applyPattern_(this.NumberFormatSymbols.DECIMAL_PATTERN);
          break;
        case jSignage.NumberFormat.Format.SCIENTIFIC:
          this.applyPattern_(this.NumberFormatSymbols.SCIENTIFIC_PATTERN);
          break;
        case jSignage.NumberFormat.Format.PERCENT:
          this.applyPattern_(this.NumberFormatSymbols.PERCENT_PATTERN);
          break;
        case jSignage.NumberFormat.Format.CURRENCY:
          this.applyPattern_(jSignage.currency.adjustPrecision( this.NumberFormatSymbols.CURRENCY_PATTERN, this.intlCurrencyCode_ ));
          break;
        default:
          throw Error('Unsupported pattern type.');
      }
    },

    parseAffix_: function(pattern, pos) {
      var affix = '';
      var inQuote = false;
      var len = pattern.length;

      for (; pos[0] < len; pos[0]++) {
        var ch = pattern.charAt(pos[0]);
        if (ch == jSignage.NumberFormat.QUOTE_) {
          if (pos[0] + 1 < len &&
              pattern.charAt(pos[0] + 1) == jSignage.NumberFormat.QUOTE_) {
            pos[0]++;
            affix += '\''; // 'don''t'
          } else {
            inQuote = !inQuote;
          }
          continue;
        }

        if (inQuote) {
          affix += ch;
        } else {
          switch (ch) {
            case jSignage.NumberFormat.PATTERN_DIGIT_:
            case jSignage.NumberFormat.PATTERN_ZERO_DIGIT_:
            case jSignage.NumberFormat.PATTERN_GROUPING_SEPARATOR_:
            case jSignage.NumberFormat.PATTERN_DECIMAL_SEPARATOR_:
            case jSignage.NumberFormat.PATTERN_SEPARATOR_:
              return affix;
            case jSignage.NumberFormat.PATTERN_CURRENCY_SIGN_:
              if ((pos[0] + 1) < len &&
                  pattern.charAt(pos[0] + 1) ==
                  jSignage.NumberFormat.PATTERN_CURRENCY_SIGN_) {
                pos[0]++;
                affix += this.intlCurrencyCode_;
              } else {
                switch (this.currencyStyle_) {
                  case jSignage.NumberFormat.CurrencyStyle.LOCAL:
                    affix += jSignage.currency.getLocalCurrencySign(
                        this.intlCurrencyCode_);
                    break;
                  case jSignage.NumberFormat.CurrencyStyle.GLOBAL:
                    affix += jSignage.currency.getGlobalCurrencySign(
                        this.intlCurrencyCode_);
                    break;
                  case jSignage.NumberFormat.CurrencyStyle.PORTABLE:
                    affix += jSignage.currency.getPortableCurrencySign(
                        this.intlCurrencyCode_);
                    break;
                  default:
                    break;
                }
              }
              break;
            case jSignage.NumberFormat.PATTERN_PERCENT_:
              if (this.multiplier_ != 1) {
                throw Error('Too many percent/permill');
              }
              this.multiplier_ = 100;
              affix += this.NumberFormatSymbols.PERCENT;
              break;
            case jSignage.NumberFormat.PATTERN_PER_MILLE_:
              if (this.multiplier_ != 1) {
                throw Error('Too many percent/permill');
              }
              this.multiplier_ = 1000;
              affix += this.NumberFormatSymbols.PERMILL;
              break;
            default:
              affix += ch;
          }
        }
      }

      return affix;
    },

    parseTrunk_: function(pattern, pos) {
      var decimalPos = -1;
      var digitLeftCount = 0;
      var zeroDigitCount = 0;
      var digitRightCount = 0;
      var groupingCount = -1;

      var len = pattern.length;
      for (var loop = true; pos[0] < len && loop; pos[0]++) {
        var ch = pattern.charAt(pos[0]);
        switch (ch) {
          case jSignage.NumberFormat.PATTERN_DIGIT_:
            if (zeroDigitCount > 0) {
              digitRightCount++;
            } else {
              digitLeftCount++;
            }
            if (groupingCount >= 0 && decimalPos < 0) {
              groupingCount++;
            }
            break;
          case jSignage.NumberFormat.PATTERN_ZERO_DIGIT_:
            if (digitRightCount > 0) {
              throw Error('Unexpected "0" in pattern "' + pattern + '"');
            }
            zeroDigitCount++;
            if (groupingCount >= 0 && decimalPos < 0) {
              groupingCount++;
            }
            break;
          case jSignage.NumberFormat.PATTERN_GROUPING_SEPARATOR_:
            groupingCount = 0;
            break;
          case jSignage.NumberFormat.PATTERN_DECIMAL_SEPARATOR_:
            if (decimalPos >= 0) {
              throw Error('Multiple decimal separators in pattern "' +
                          pattern + '"');
            }
            decimalPos = digitLeftCount + zeroDigitCount + digitRightCount;
            break;
          case jSignage.NumberFormat.PATTERN_EXPONENT_:
            if (this.useExponentialNotation_) {
              throw Error('Multiple exponential symbols in pattern "' +
                          pattern + '"');
            }
            this.useExponentialNotation_ = true;
            this.minExponentDigits_ = 0;

            // exponent pattern can have a optional '+'.
            if ((pos[0] + 1) < len && pattern.charAt(pos[0] + 1) ==
                jSignage.NumberFormat.PATTERN_PLUS_) {
              pos[0]++;
              this.useSignForPositiveExponent_ = true;
            }

            // Use lookahead to parse out the exponential part
            // of the pattern, then jump into phase 2.
            while ((pos[0] + 1) < len && pattern.charAt(pos[0] + 1) ==
                   jSignage.NumberFormat.PATTERN_ZERO_DIGIT_) {
              pos[0]++;
              this.minExponentDigits_++;
            }

            if ((digitLeftCount + zeroDigitCount) < 1 ||
                this.minExponentDigits_ < 1) {
              throw Error('Malformed exponential pattern "' + pattern + '"');
            }
            loop = false;
            break;
          default:
            pos[0]--;
            loop = false;
            break;
        }
      }

      if (zeroDigitCount == 0 && digitLeftCount > 0 && decimalPos >= 0) {
        // Handle '###.###' and '###.' and '.###'
        var n = decimalPos;
        if (n == 0) { // Handle '.###'
          n++;
        }
        digitRightCount = digitLeftCount - n;
        digitLeftCount = n - 1;
        zeroDigitCount = 1;
      }

      // Do syntax checking on the digits.
      if (decimalPos < 0 && digitRightCount > 0 ||
          decimalPos >= 0 && (decimalPos < digitLeftCount ||
                              decimalPos > digitLeftCount + zeroDigitCount) ||
          groupingCount == 0) {
        throw Error('Malformed pattern "' + pattern + '"');
      }
      var totalDigits = digitLeftCount + zeroDigitCount + digitRightCount;

      this.maximumFractionDigits_ = decimalPos >= 0 ? totalDigits - decimalPos : 0;
      if (decimalPos >= 0) {
        this.minimumFractionDigits_ = digitLeftCount + zeroDigitCount - decimalPos;
        if (this.minimumFractionDigits_ < 0) {
          this.minimumFractionDigits_ = 0;
        }
      }

      // The effectiveDecimalPos is the position the decimal is at or would be at
      // if there is no decimal. Note that if decimalPos<0, then digitTotalCount ==
      // digitLeftCount + zeroDigitCount.
      var effectiveDecimalPos = decimalPos >= 0 ? decimalPos : totalDigits;
      this.minimumIntegerDigits_ = effectiveDecimalPos - digitLeftCount;
      if (this.useExponentialNotation_) {
        this.maximumIntegerDigits_ = digitLeftCount + this.minimumIntegerDigits_;

        // in exponential display, we need to at least show something.
        if (this.maximumFractionDigits_ == 0 && this.minimumIntegerDigits_ == 0) {
          this.minimumIntegerDigits_ = 1;
        }
      }

      this.groupingSize_ = Math.max(0, groupingCount);
      this.decimalSeparatorAlwaysShown_ = decimalPos == 0 ||
                                          decimalPos == totalDigits;
    },

    format: function(number) {
      if (isNaN(number)) {
        return this.NumberFormatSymbols.NAN;
      }

      var parts = [];

      // in icu code, it is commented that certain computation need to keep the
      // negative sign for 0.
      var isNegative = number < 0.0 || number == 0.0 && 1 / number < 0.0;

      parts.push(isNegative ? this.negativePrefix_ : this.positivePrefix_);

      if (!isFinite(number)) {
        parts.push(this.NumberFormatSymbols.INFINITY);
      } else {
        // convert number to non-negative value
        number *= isNegative ? -1 : 1;

        number *= this.multiplier_;
        this.useExponentialNotation_ ?
            this.subformatExponential_(number, parts) :
            this.subformatFixed_(number, this.minimumIntegerDigits_, parts);
      }

      parts.push(isNegative ? this.negativeSuffix_ : this.positiveSuffix_);

      return parts.join('');
    },

    subformatFixed_: function(number, minIntDigits, parts) {
      // round the number
      var power = Math.pow(10, this.maximumFractionDigits_);
      var shiftedNumber = Math.round(number * power);
      var intValue, fracValue;
      if (isFinite(shiftedNumber)) {
        intValue = Math.floor(shiftedNumber / power);
        fracValue = Math.floor(shiftedNumber - intValue * power);
      } else {
        intValue = number;
        fracValue = 0;
      }

      var fractionPresent = this.minimumFractionDigits_ > 0 || fracValue > 0;

      var intPart = '';
      var translatableInt = intValue;
      while (translatableInt > 1E20) {
        // here it goes beyond double precision, add '0' make it look better
        intPart = '0' + intPart;
        translatableInt = Math.round(translatableInt / 10);
      }
      intPart = translatableInt + intPart;

      var decimal = this.NumberFormatSymbols.DECIMAL_SEP;
      var grouping = this.NumberFormatSymbols.GROUP_SEP;
      var zeroCode = window.__jSignage__global.enforceAsciiDigits_ ?
                     48  /* ascii '0' */ :
                     this.NumberFormatSymbols.ZERO_DIGIT.charCodeAt(0);
      var digitLen = intPart.length;

      if (intValue > 0 || minIntDigits > 0) {
        for (var i = digitLen; i < minIntDigits; i++) {
          parts.push(String.fromCharCode(zeroCode));
        }

        for (var i = 0; i < digitLen; i++) {
          parts.push(String.fromCharCode(zeroCode + intPart.charAt(i) * 1));

          if (digitLen - i > 1 && this.groupingSize_ > 0 &&
              ((digitLen - i) % this.groupingSize_ == 1)) {
            parts.push(grouping);
          }
        }
      } else if (!fractionPresent) {
        // If there is no fraction present, and we haven't printed any
        // integer digits, then print a zero.
        parts.push(String.fromCharCode(zeroCode));
      }

      // Output the decimal separator if we always do so.
      if (this.decimalSeparatorAlwaysShown_ || fractionPresent) {
        parts.push(decimal);
      }

      var fracPart = '' + (fracValue + power);
      var fracLen = fracPart.length;
      while (fracPart.charAt(fracLen - 1) == '0' &&
             fracLen > this.minimumFractionDigits_ + 1) {
        fracLen--;
      }

      for (var i = 1; i < fracLen; i++) {
        parts.push(String.fromCharCode(zeroCode + fracPart.charAt(i) * 1));
      }
    },

    addExponentPart_: function(exponent, parts) {
      parts.push(this.NumberFormatSymbols.EXP_SYMBOL);

      if (exponent < 0) {
        exponent = -exponent;
        parts.push(this.NumberFormatSymbols.MINUS_SIGN);
      } else if (this.useSignForPositiveExponent_) {
        parts.push(this.NumberFormatSymbols.PLUS_SIGN);
      }

      var exponentDigits = '' + exponent;
      var zeroChar = window.__jSignage__global.enforceAsciiDigits_ ? '0' :
                     this.NumberFormatSymbols.ZERO_DIGIT;
      for (var i = exponentDigits.length; i < this.minExponentDigits_; i++) {
        parts.push(zeroChar);
      }
      parts.push(exponentDigits);
    },

    subformatExponential_: function(number, parts) {
      if (number == 0.0) {
        this.subformatFixed_(number, this.minimumIntegerDigits_, parts);
        this.addExponentPart_(0, parts);
        return;
      }

      var exponent = Math.floor(Math.log(number) / Math.log(10));
      number /= Math.pow(10, exponent);

      var minIntDigits = this.minimumIntegerDigits_;
      if (this.maximumIntegerDigits_ > 1 &&
          this.maximumIntegerDigits_ > this.minimumIntegerDigits_) {
        // A repeating range is defined; adjust to it as follows.
        // If repeat == 3, we have 6,5,4=>3; 3,2,1=>0; 0,-1,-2=>-3;
        // -3,-4,-5=>-6, etc. This takes into account that the
        // exponent we have here is off by one from what we expect;
        // it is for the format 0.MMMMMx10^n.
        while ((exponent % this.maximumIntegerDigits_) != 0) {
          number *= 10;
          exponent--;
        }
        minIntDigits = 1;
      } else {
        // No repeating range is defined; use minimum integer digits.
        if (this.minimumIntegerDigits_ < 1) {
          exponent++;
          number /= 10;
        } else {
          exponent -= this.minimumIntegerDigits_ - 1;
          number *= Math.pow(10, this.minimumIntegerDigits_ - 1);
        }
      }
      this.subformatFixed_(number, minIntDigits, parts);
      this.addExponentPart_(exponent, parts);
    },

    getDigit_: function(ch) {
      var code = ch.charCodeAt(0);
      // between '0' to '9'
      if (48 <= code && code < 58) {
        return code - 48;
      } else {
        var zeroCode = this.NumberFormatSymbols.ZERO_DIGIT.charCodeAt(0);
        return zeroCode <= code && code < zeroCode + 10 ? code - zeroCode : -1;
      }
    }

});

jSignage.currency = {

    PRECISION_MASK_: 0x07,
    POSITION_FLAG_: 0x08,
    SPACE_FLAG_: 0x20,

    getGlobalCurrencyPattern: function(currencyCode) {
      var info = jSignage.currency.CurrencyInfo[currencyCode];
      var patternNum = info[0];
      if (currencyCode == info[1])
        return jSignage.currency.getCurrencyPattern_(patternNum, info[1]);
      return currencyCode + ' ' + jSignage.currency.getCurrencyPattern_(patternNum, info[1]);
    },

    getGlobalCurrencySign: function(currencyCode) {
      var info = jSignage.currency.CurrencyInfo[currencyCode];
      return (currencyCode == info[1]) ? currencyCode : currencyCode + ' ' + info[1];
    },

    getLocalCurrencyPattern: function(currencyCode) {
        var info = jSignage.currency.CurrencyInfo[currencyCode];
        return jSignage.currency.getCurrencyPattern_(info[0], info[1]);
    },

    getLocalCurrencySign: function(currencyCode) {
        return jSignage.currency.CurrencyInfo[currencyCode][1];
    },

    getPortableCurrencyPattern: function(currencyCode) {
        var info = jSignagecurrency.CurrencyInfo[currencyCode];
        return jSignage.currency.getCurrencyPattern_(info[0], info[2]);
    },

    getPortableCurrencySign: function(currencyCode) {
        return jSignage.currency.CurrencyInfo[currencyCode][2];
    },

    isPrefixSignPosition: function(currencyCode) {
        return (jSignage.currency.CurrencyInfo[currencyCode][0] & jSignage.currency.POSITION_FLAG_) == 0;
    },

    getCurrencyPattern_: function(patternNum, sign) {
      var strParts = ['#,##0'];
      var precision = patternNum & jSignage.currency.PRECISION_MASK_;
      if (precision > 0) {
        strParts.push('.');
        for (var i = 0; i < precision; i++) {
          strParts.push('0');
        }
      }
      if ((patternNum & jSignage.currency.POSITION_FLAG_) == 0) {
        strParts.unshift((patternNum & jSignage.currency.SPACE_FLAG_) ?
                         "' " : "'");
        strParts.unshift(sign);
        strParts.unshift("'");
      } else {
        strParts.push((patternNum & jSignage.currency.SPACE_FLAG_) ? " '" : "'",
                      sign, "'");
      }
      return strParts.join('');
    },

    adjustPrecision: function(pattern, currencyCode) {
      var strParts = ['0'];
      var info = jSignage.currency.CurrencyInfo[currencyCode];
      var precision = info[0] & jSignage.currency.PRECISION_MASK_;
      if (precision > 0) {
        strParts.push('.');
        for (var i = 0; i < precision; i++) {
          strParts.push('0');
        }
      }
      return pattern.replace(/0.00/g, strParts.join(''));
    },

    CurrencyInfo: {
        'AED': [2, 'dh', '\u062f.\u0625.', 'DH'], 'AUD': [2, '$', 'AU$'], 'BDT': [2, '\u09F3', 'Tk'], 'BRL': [2, 'R$', 'R$'], 'CAD': [2, '$', 'C$'],
        'CHF': [2, 'CHF', 'CHF'], 'CLP': [0, '$', 'CL$'], 'CNY': [2, '¥', 'RMB¥'], 'COP': [0, '$', 'COL$'], 'CRC': [0, '\u20a1', 'CR\u20a1'],
        'CZK': [2, 'K\u010d', 'K\u010d'], 'DKK': [18, 'kr', 'kr'], 'DOP': [2, '$', 'RD$'], 'EGP': [2, '£', 'LE'], 'EUR': [18, '€', '€'],
        'GBP': [2, '£', 'GB£'], 'HKD': [2, '$', 'HK$'], 'ILS': [2, '\u20AA', 'IL\u20AA'], 'INR': [2, '\u20B9', 'Rs'], 'ISK': [0, 'kr', 'kr'],
        'JMD': [2, '$', 'JA$'], 'JPY': [0, '¥', 'JP¥'], 'KRW': [0, '\u20A9', 'KR₩'], 'LKR': [2, 'Rs', 'SLRs'], 'MNT': [0, '\u20AE', 'MN₮'],
        'MXN': [2, '$', 'Mex$'], 'MYR': [2, 'RM', 'RM'], 'NOK': [18, 'kr', 'NOkr'], 'PAB': [2, 'B/.', 'B/.'], 'PEN': [2, 'S/.', 'S/.'],
        'PHP': [2, '\u20B1', 'Php'], 'PKR': [0, 'Rs', 'PKRs.'], 'RUB': [2, 'Rup', 'Rup'], 'SAR': [2, 'Rial', 'Rial'], 'SEK': [2, 'kr', 'kr'],
        'SGD': [2, '$', 'S$'], 'THB': [2, '\u0e3f', 'THB'], 'TRY': [2, 'TL', 'YTL'], 'TWD': [2, 'NT$', 'NT$'], 'USD': [2, '$', 'US$'],
        'UYU': [2, '$', 'UY$'], 'VND': [0, '\u20AB', 'VN\u20AB'], 'YER': [0, 'Rial', 'Rial'], 'ZAR': [2, 'R', 'ZAR'], 'AFN': [16, 'Af.', 'AFN'],
        'ALL': [0, 'Lek', 'Lek'], 'AMD': [0, 'Dram', 'dram'], 'AOA': [2, 'Kz', 'Kz'], 'ARS': [2, '$', 'AR$'], 'AWG': [2, 'Afl.', 'Afl.'],
        'AZN': [2, 'man.', 'man.'], 'BAM': [18, 'KM', 'KM'], 'BBD': [2, '$', 'Bds$'], 'BGN': [2, 'lev', 'lev'], 'BHD': [3, 'din', 'din'],
        'BIF': [0, 'FBu', 'FBu'], 'BMD': [2, '$', 'BD$'], 'BND': [2, '$', 'B$'], 'BOB': [2, 'Bs', 'Bs'], 'BSD': [2, '$', 'BS$'], 'BTN': [2, 'Nu.', 'Nu.'],
        'BWP': [2, 'P', 'pula'], 'BYR': [0, 'BYR', 'BYR'], 'BZD': [2, '$', 'BZ$'], 'CDF': [2, 'FrCD', 'CDF'], 'CUC': [1, '$', 'CUC$'],
        'CUP': [2, '$', 'CU$'], 'CVE': [2, 'CVE', 'Esc'], 'DJF': [0, 'Fdj', 'Fdj'], 'DZD': [2, 'din', 'din'], 'ERN': [2, 'Nfk', 'Nfk'],
        'ETB': [2, 'Birr', 'Birr'], 'FJD': [2, '$', 'FJ$'], 'FKP': [2, '£', 'FK£'], 'GEL': [2, 'GEL', 'GEL'], 'GHS': [2, 'GHS', 'GHS'],
        'GIP': [2, '£', 'GI£'], 'GMD': [2, 'GMD', 'GMD'], 'GNF': [0, 'FG', 'FG'], 'GTQ': [2, 'Q', 'GTQ'], 'GYD': [0, '$', 'GY$'],
        'HNL': [2, 'L', 'HNL'], 'HRK': [2, 'kn', 'kn'], 'HTG': [2, 'HTG', 'HTG'], 'HUF': [0, 'Ft', 'Ft'], 'IDR': [0, 'Rp', 'Rp'],
        'IQD': [0, 'din', 'IQD'], 'IRR': [0, 'Rial', 'IRR'], 'JOD': [3, 'din', 'JOD'], 'KES': [2, 'Ksh', 'Ksh'], 'KGS': [2, 'KGS', 'KGS'],
        'KHR': [2, 'Riel', 'KHR'], 'KMF': [0, 'CF', 'KMF'], 'KPW': [0, '\u20A9KP', 'KPW'], 'KWD': [3, 'din', 'KWD'], 'KYD': [2, '$', 'KY$'],
        'KZT': [2, '\u20B8', 'KZT'], 'LAK': [0, '\u20AD', '\u20AD'], 'LBP': [0, 'L£', 'LBP'], 'LRD': [2, '$', 'L$'], 'LSL': [2, 'LSL', 'LSL'],
        'LTL': [2, 'Lt', 'Lt'], 'LVL': [2, 'Ls', 'Ls'], 'LYD': [3, 'din', 'LD'], 'MAD': [2, 'dh', 'MAD'], 'MDL': [2, 'MDL', 'MDL'], 'MGA': [0, 'Ar', 'MGA'],
        'MKD': [2, 'din', 'MKD'], 'MMK': [0, 'K', 'MMK'], 'MOP': [2, 'MOP', 'MOP$'], 'MRO': [0, 'MRO', 'MRO'], 'MUR': [0, 'MURs', 'MURs'],
        'MWK': [2, 'MWK', 'MWK'], 'MZN': [2, 'MTn', 'MTn'], 'NAD': [2, '$', 'N$'], 'NGN': [2, '\u20A6', 'NG\u20A6'], 'NIO': [2, 'C$', 'C$'],
        'NPR': [2, 'Rs', 'NPRs'], 'NZD': [2, '$', 'NZ$'], 'OMR': [3, 'Rial', 'OMR'], 'PGK': [2, 'PGK', 'PGK'], 'PLN': [2, 'z\u0142', 'z\u0142'],
        'PYG': [0, 'Gs', 'PYG'], 'QAR': [2, 'Rial', 'QR'], 'RON': [2, 'RON', 'RON'], 'RSD': [0, 'din', 'RSD'], 'RWF': [0, 'RF', 'RF'],
        'SBD': [2, '$', 'SI$'], 'SCR': [2, 'SCR', 'SCR'], 'SDG': [2, 'SDG', 'SDG'], 'SHP': [2, '£', 'SH£'], 'SLL': [0, 'SLL', 'SLL'],
        'SOS': [0, 'SOS', 'SOS'], 'SRD': [2, '$', 'SR$'], 'STD': [0, 'Db', 'Db'], 'SYP': [16, '£', 'SY£'], 'SZL': [2, 'SZL', 'SZL'],
        'TJS': [2, 'Som', 'TJS'], 'TND': [3, 'din', 'DT'], 'TOP': [2, 'T$', 'T$'], 'TTD': [2, '$', 'TT$'], 'TZS': [0, 'TSh', 'TSh'],
        'UAH': [2, '\u20B4', 'UAH'], 'UGX': [0, 'UGX', 'UGX'], 'UZS': [0, 'so\u02bcm', 'UZS'], 'VEF': [2, 'Bs', 'Bs'],
        'VUV': [0, 'VUV', 'VUV'], 'WST': [2, 'WST', 'WST'], 'XAF': [0, 'FCFA', 'FCFA'], 'XCD': [2, '$', 'EC$'], 'XOF': [0, 'CFA', 'CFA'],
        'XPF': [0, 'FCFP', 'FCFP'], 'ZMK': [0, 'ZMK', 'ZMK']
    }
};

if ( !jSignage.features.SpinetiX ) {
   // jSignage.include( '/all.js', true );
  //  jSignage.include( '/moment.min.js', true );
   // jSignage.include( '/moment-timezone-with-data.min.js', true );
}

})();
