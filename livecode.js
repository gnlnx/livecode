// utility functions
var Util = {
	Random : function( nStart, nEnd ) {
		return nStart + Math.floor( Math.random() * nEnd );
	}
};

// define Render3D object
var Render3D = {
	pContext : null, // gl context
	nWidth : 0,
	nHeight : 0,
	Init : function( pCanvas ) {
		Render3D.pContext = pCanvas.getContext( "experimental-webgl" );

		// TODO: 
		// 1. Load default vertex & fragment shaders
		// 2. Bind vertex attributes and uniforms
		// 3. Set clear color and depth
	},
	SetViewportAndPerspective : function( nWidth, nHeight, nFrustum, nAspect, nDepthNear, nDepthFar ) {
		if( !Render3D.pContext )
			return;

		Render3D.pContext.viewport( 0, 0, nWidth, nHeight );
		Render3D.pContext.perspectiveMatrix = new CanvasMatrix4();
		Render3D.pContext.perspectiveMatrix.lookat( 0, 0, 7, 0, 0, 0, 0, 1, 0 );
		Render3D.pContext.perspectiveMatrix.perspective( nFrustum, nAspect, nDepthNear, nDepthFar );

	},
	drawBall : function( x, y, z, nRadius, szColor ) {
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
		Render3D.Init( Sys.pCanvas );

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

		Render3D.SetViewportAndPerspective( nWidth, nHeight, 30, nWidth / nHeight, 1, 5000 );
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
		Render3D.pContext.clear( Render3D.pContext.COLOR_BUFFER_BIT | Render3D.pContext.DEPTH_BUFFER_BIT );
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
