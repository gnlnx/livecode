// vars
var nLoopCount = 0;
var szLiveCode = "console.log( ':D' );";
var szOldLiveCode = szLiveCode;
var txtLiveCode;
var bRunning = true;

var Canvas2D;

// funcs
var Init = function() {
	// get the canvas 2D context
	var canvasLiveCode = document.getElementById( "livecode_canvas" );
	Canvas2D = canvasLiveCode.getContext( "2d" );

	// get live code text area
	txtLiveCode = document.getElementById( "livecode" );
	// default live code
	txtLiveCode.value = szLiveCode;

	// set event listeners
	document.addEventListener( "keypress", function(e) {
		// evaluate new live code: CTRL + ENTER
		if( e.ctrlKey && e.keyCode == 13 )
		{
			UpdateLiveCode();
			return false;
		}
		return true;
	}, false );
}
var UpdateLiveCode = function() {
	// save old live code in case of error
	szOldLiveCode = szLiveCode;
	// set new live code to be evaulated by main loop
	szLiveCode = txtLiveCode.value;
}
var PausePlay = function() {
	bRunning = !bRunning;
}
var MainLoop = function() {
	if( bRunning ) {
		try {
			// eval live code
			eval( szLiveCode );
		} catch( e ) {
			// show the error but revert to previously live code
			console.log( e );
			szLiveCode = szOldLiveCode;
		}
		
		// call "safe" loop
		window.webkitRequestAnimationFrame( MainLoop, this );
	}
}

// set up
document.addEventListener( "DOMContentLoaded", function() {
	Init();
	MainLoop();
}, false );

