// define Canvas2D object
var Canvas2D = {
	ctx : null,
	drawBall : function( x, y, radius, bFill ) {
		Canvas2D.ctx.beginPath();
		Canvas2D.ctx.arc( x, y, radius, 0, 2 * Math.PI, false );
		if( bFill )
			Canvas2D.ctx.fill();
		else
			Canvas2D.ctx.stroke();
	}
};

// user.funcs
var $Init = function() {}
var $Update = function() {}
var $Render = function() {}

// sys.funcs
var Sys = {
	// vars
	szLiveCode : "$Init = function() {};\n$Update = function() {};\n$Render = function() {}",
	szOldLiveCode : "",
	txtLiveCode : "",
	bRunning : true,

	Init : function() {
		// get the canvas 2D context
		var canvasLiveCode = document.getElementById( "livecode_canvas" );
		canvasLiveCode.setAttribute( "width", window.innerWidth );
		canvasLiveCode.setAttribute( "height", window.innerHeight );
		Canvas2D.ctx = canvasLiveCode.getContext( "2d" );

		// get live code text area
		Sys.txtLiveCode = document.getElementById( "livecode" );
		// default live code
		Sys.txtLiveCode.focus();
		Sys.txtLiveCode.value = Sys.szLiveCode;
		Sys.UpdateLiveCode();

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
			$Init();
		} catch( e ) {
			console.log( e );
			Sys.szLiveCode = Sys.szOldLiveCode;

			$Init = function() {};
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
