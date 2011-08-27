/*
// define Physics2D object
var Physics2D = {
	pObjects : [],
	bGravity : true,
	addObject : function( x, y, mass ) {
		Physics2D.pObjects.push( {x, y, mass} );
	}
	update : function() {
	}
};
*/

// utility functions
var Util = {
	Random : function( nStart, nEnd ) {
		return nStart + Math.floor( Math.random() * nEnd );
	}
};

// define Render2D object
var Render2D = {
	pContext : null,
	nWidth : 0,
	nHeight : 0,
	drawBall : function( x, y, nRadius, szColor, bFill ) {
		Render2D.pContext.beginPath();
		Render2D.pContext.arc( x, y, nRadius, 0, 2 * Math.PI, false );
		if( bFill ) {
			Render2D.pContext.fillStyle = szColor;
			Render2D.pContext.fill();
		} else {
			Render2D.pContext.strokeStyle = szColor;
			Render2D.pContext.stroke();
		}
	}
};

// user.funcs
var $Init = function() {}
var $Update = function() {}
var $Render = function() {}

// sys.funcs
var Sys = {
	// vars
	pCanvas : null,
	szLiveCode : "$Init = function() {};\n$Update = function() {};\n$Render = function() {}",
	szOldLiveCode : "",
	txtLiveCode : "",
	bRunning : true,

	Init : function() {
		// get the canvas 2D context
		Sys.pCanvas = document.getElementById( "livecode_canvas" );
		Sys.Resize( Sys.pCanvas, window.innerWidth, window.innerHeight );
		Render2D.pContext = Sys.pCanvas.getContext( "2d" );
		Render2D.nWidth = window.innerWidth;
		Render2D.nHeight = window.innerHeight;

		// get live code text area
		Sys.txtLiveCode = document.getElementById( "livecode" );
		// default live code
		Sys.txtLiveCode.focus();
		Sys.txtLiveCode.value = Sys.szLiveCode;
		Sys.UpdateLiveCode();

		// set event listeners:
		//
		// 1. update live code key combo
		document.addEventListener( "keypress", function(e) {
			// evaluate new live code: CTRL + SPACE
			if( e.ctrlKey && e.keyCode == 0 )
			{
				Sys.UpdateLiveCode();
			}
		}, false );

		// 2. window resize
		window.addEventListener( "resize", function( e ) {
			Sys.Resize( Sys.pCanvas, window.innerWidth, window.innerHeight );
		}, false );
	},
	Resize : function( pCanvas, nWidth, nHeight ) {
		pCanvas.setAttribute( "width", nWidth );
		pCanvas.setAttribute( "height", nHeight );
		Render2D.nWdith = nWidth;
		Render2D.nHeight = nHeight;
	},
	UpdateLiveCode : function() {
		// save old live code in case of error
		Sys.szOldLiveCode = Sys.szLiveCode;
		// set new live code to be evaulated by main loop
		Sys.szLiveCode = Sys.txtLiveCode.value;
		// evaluate new code
		try {
			eval( Sys.szLiveCode );
			$Init();
		} catch( e ) {
			console.log( e );
			Sys.szLiveCode = Sys.szOldLiveCode;

			/*
			$Init = function() {};
			$Update = function() {};
			$Render = function() {};
			*/
		}
	},
	PausePlay : function() {
		Sys.bRunning = !Sys.bRunning;
	},
	///////////////////////////////////////////////////////////////
	// overwritten by user
	Update : function() { $Update(); },
	Render : function() { 
		// clear canvas before user.render
		Sys.pCanvas.width = Sys.pCanvas.width;
		$Render();
	},
	///////////////////////////////////////////////////////////////
	MainLoop : function() {
		if( Sys.bRunning ) {
			Sys.Update();
			Sys.Render();
			
			// call "safe" loop...only happens when the tab is active
			window.webkitRequestAnimationFrame( Sys.MainLoop, this );
		}
	}

}

// start session
document.addEventListener( "DOMContentLoaded", function() {
	Sys.Init();
	Sys.MainLoop();
}, false );
