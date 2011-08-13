// vars
var nLoopCount = 0;
var szLiveCode = "console.log( ':D' );";
var txtLiveCode;
var bRunning = true;

// funcs
var Init = function() {
	// get live code text area
	txtLiveCode = document.getElementById( "livecode" );
	// default live code
	txtLiveCode.value = szLiveCode;

	// set event listeners
	document.addEventListener( "keypress", function(e) {
		// evaluate new live code: CTRL + ENTER
		if( e.ctrlKey && e.keyCode == 13 )
			UpdateLiveCode();
	}, false );
}
var UpdateLiveCode = function() {
	// set new live code to be evaulated by main loop
	szLiveCode = txtLiveCode.value;
}
var PausePlay = function() {
	bRunning = !bRunning;
}
var MainLoop = function() {
	if( bRunning ) {
		// eval live code
		eval( szLiveCode );
		
		// call "safe" loop
		window.webkitRequestAnimationFrame( MainLoop, this );
	}
}

// set up
document.addEventListener( "DOMContentLoaded", function() {
	Init();
	MainLoop();
}, false );

