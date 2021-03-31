/*
 * Font-Face Onload Script
 */

;(function( win, doc ) {
	var DELAY = 100,
		TEST_STRING = 'AxmTYklsjo190QW',
		TOLERANCE = 2, // px

		SANS_SERIF_FONTS = 'sans-serif',
		SERIF_FONTS = 'serif',

		parent,
		html = '<div style="font-family:%s;position:absolute;top:0;left:-9999px;font-size:48px">' + TEST_STRING + '</div>',
		sansSerif,
		serif,
		dimensions,
		appended = false;

	function load( fontFamily, options ) {
		var startTime = new Date();

		if( !parent ) {
			parent = doc.createElement( 'div' );
		}

		parent.innerHTML = html.replace(/\%s/, SANS_SERIF_FONTS ) + html.replace(/\%s/, SERIF_FONTS );
		sansSerif = parent.firstChild;
		serif = sansSerif.nextSibling;

		if( options.glyphs ) {
			sansSerif.innerHTML += options.glyphs;
			serif.innerHTML += options.glyphs;
		}

		if( !appended && doc.body ) {
			appended = true;
			doc.body.appendChild( parent );
		}

		dimensions = {
			sansSerif: {
				width: sansSerif.offsetWidth,
				height: sansSerif.offsetHeight
			},
			serif: {
				width: serif.offsetWidth,
				height: serif.offsetHeight
			}
		};

		// Make sure we set the new font-family after we take our initial dimensions:
		// handles the case where FontFaceOnload is called after the font has already
		// loaded.
		sansSerif.style.fontFamily = fontFamily + ', ' + SANS_SERIF_FONTS;
		serif.style.fontFamily = fontFamily + ', ' + SERIF_FONTS;

		(function checkDimensions() {
			if( Math.abs( dimensions.sansSerif.width - sansSerif.offsetWidth ) > TOLERANCE ||
				Math.abs( dimensions.sansSerif.height - sansSerif.offsetHeight ) > TOLERANCE ||
				Math.abs( dimensions.serif.width - serif.offsetWidth ) > TOLERANCE ||
				Math.abs( dimensions.serif.height - serif.offsetHeight ) > TOLERANCE ) {

				options.success();
			} else if( ( new Date() ).getTime() - startTime.getTime() > options.timeout ) {
				options.error();
			} else {
				setTimeout(function() {
					checkDimensions();
				}, DELAY);
			}
		})();
	} // end load()

	var FontFaceOnload = function( fontFamily, options ) {
		var defaultOptions = {
				glyphs: '',
				success: function() {},
				error: function() {},
				timeout: 10000
			},
			timeout;

		if( !options ) {
			options = {};
		}

		for( var j in defaultOptions ) {
			if( !options.hasOwnProperty( j ) ) {
				options[ j ] = defaultOptions[ j ];
			}
		}

		if( "fonts" in doc ) {
			doc.fonts.load( "1em " + fontFamily ).then(function() {
				options.success();

				win.clearTimeout( timeout );
			});

			if( options.timeout ) {
				timeout = win.setTimeout(function() {
					options.error();
				}, options.timeout );
			}
		} else {
			load( fontFamily, options );
		}
	};

	// intentional global
	win.FontFaceOnload = FontFaceOnload;

})( this, this.document );
