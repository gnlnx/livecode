// define Canvas2D object
var Canvas2D = {
	ctx : null,
	drawBall : function( x, y, radius ) {
		Canvas2D.ctx.arc( x, y, radius, 0, 2 * Math.PI, false );
	}
};

// user.funcs
var $Update = function() {}
var $Render = function() {}

// sys.funcs
var Sys = {
	// vars
	szLiveCode : "var _main = function() { \n console.log( ':D' );\n}",
	szOldLiveCode : "",
	txtLiveCode : "",
	bRunning : true,

	Init : function() {
		// get the canvas 2D context
		var canvasLiveCode = document.getElementById( "livecode_canvas" );
		Canvas2D.ctx = canvasLiveCode.getContext( "2d" );

		// get live code text area
		Sys.txtLiveCode = document.getElementById( "livecode" );
		// default live code
		Sys.txtLiveCode.focus();
		Sys.txtLiveCode.value = Sys.szLiveCode;

		// set event listeners
		document.addEventListener( "keypress", function(e) {
			// evaluate new live code: CTRL + SPACE
			if( e.ctrlKey && e.keyCode == 0 )
			{
				Sys.UpdateLiveCode();
			}
		}, false );
	},
	UpdateLiveCode : function() {
		// save old live code in case of error
		Sys.szOldLiveCode = Sys.szLiveCode;
		// set new live code to be evaulated by main loop
		Sys.szLiveCode = Sys.txtLiveCode.value;
		// evaluate new code
		try {
			eval( Sys.szLiveCode );
		} catch( e ) {
			console.log( e );
			Sys.szLiveCode = Sys.szOldLiveCode;

			$Update = function() {};
			$Render = function() {};
		}
	},
	PausePlay : function() {
		Sys.bRunning = !Sys.bRunning;
	},
	///////////////////////////////////////////////////////////////
	// overwritten by user
	Update : function() { $Update(); },
	Render : function() { $Render(); },
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
