// utility functions
var Util = {
	GetFile : function( szFilename, onComplete ) {
		var bAsync = false;
		var XHR = new XMLHttpRequest();
		XHR.onreadystatechange = function() {
			if( XHR.readyState == 4 && XHR.status == 200 ) {
				onComplete( XHR.responseText );
			}
		};
		XHR.open( "GET", szFilename, bAsync );
		XHR.send();
	},
	Random : function( nStart, nEnd ) {
		return nStart + Math.floor( Math.random() * nEnd );
	},
	LoadShader : function( pContext, szShader, nShaderType, pShaderProgram ) {
		Util.GetFile( szShader, function onLoad( szShaderSource ) {
			// TODO: add error checking :)
			var pShader = pContext.createShader( nShaderType );
			pContext.shaderSource( pShader, szShaderSource );
			pContext.compileShader( pShader );

			pContext.attachShader( pShaderProgram, pShader );
		});
	},
	makeSphere : function( pContext, nRadius, nLats, nLongs ) {
		return makeSphere( pContext, nRadius, nLats, nLongs );
	},
	makeBox : function( pContext ) {
		return makeBox( pContext );
	}
	
};

// define Render3D object
var Render3D = {
	gl : null, // gl context
	pShaderProgram : null,
	nWidth : 0,
	nHeight : 0,
	pBox : null,
	Init : function( pCanvas ) {
		// NOTE: using WebGL Inspector replaces the Canvas.getContext method
		Render3D.gl = pCanvas.getContext( "experimental-webgl" );

		// 0. Create the shader program
		Render3D.pShaderProgram = Render3D.gl.createProgram();

		// 1. Load default vertex & fragment shaders
		//    ...attach to the shader program onLoad
		Util.LoadShader( Render3D.gl, "shaders/default.vs", Render3D.gl.VERTEX_SHADER, Render3D.pShaderProgram ); 
		Util.LoadShader( Render3D.gl, "shaders/default.fs", Render3D.gl.FRAGMENT_SHADER, Render3D.pShaderProgram );

		// 1.a. Link and set the shader program once shaders
		//      are loaded and attached
		Render3D.gl.linkProgram( Render3D.pShaderProgram );
		Render3D.gl.useProgram( Render3D.pShaderProgram );

		// 2. Bind vertex attributes
		Render3D.pShaderProgram.vPositionLoc = Render3D.gl.getAttribLocation( Render3D.pShaderProgram, "vPosition" );
		Render3D.pShaderProgram.vNormalLoc = Render3D.gl.getAttribLocation( Render3D.pShaderProgram, "vNormal" );

		// 3. Set clear color and depth
		Render3D.gl.clearColor( 0, 0, 1, 1 );
		Render3D.gl.clearDepth( 1000 );

		Render3D.gl.enable( Render3D.gl.DEPTH_TEST );
		Render3D.gl.enable( Render3D.gl.BLEND );
		Render3D.gl.blendFunc( Render3D.gl.SRC_ALPHA, Render3D.gl.ONE_MINUS_SRC_ALPHA );

		// 4. Bind uniforms
		Render3D.gl.uniform3f( Render3D.gl.getUniformLocation( Render3D.pShaderProgram, "vLightDir" ), 0, 1, -1 );

		// 5. Set up box
		Render3D.pBox = Util.makeBox( Render3D.gl );
		Render3D.pBox.mModelView = new J3DIMatrix4();
		Render3D.pBox.nWorldMatrixLoc = Render3D.gl.getUniformLocation( Render3D.pShaderProgram, "mWorld" );
		Render3D.pBox.mWorld = new J3DIMatrix4();
		Render3D.pBox.nModelViewProjMatrixLoc = Render3D.gl.getUniformLocation( Render3D.pShaderProgram, "mModelViewProj" );
		Render3D.pBox.mModelViewProj = new J3DIMatrix4();
	},
	SetViewportAndPerspective : function( nWidth, nHeight, nFOV, nAspect, nDepthNear, nDepthFar ) {
		if( !Render3D.gl )
			return;

		Render3D.gl.viewport( 0, 0, nWidth, nHeight );
		Render3D.gl.perspectiveMatrix = new J3DIMatrix4();
		Render3D.gl.perspectiveMatrix.lookat( 0, 3, 10, 0, 0, 0, 0, 1, 0 );
		Render3D.gl.perspectiveMatrix.perspective( nFOV, nAspect, nDepthNear, nDepthFar );

	},
	Clear : function( bColor, bDepth ) {
		// TODO: use bColor && bDepth
		Render3D.gl.clear( Render3D.gl.COLOR_BUFFER_BIT | Render3D.gl.DEPTH_BUFFER_BIT );
	},
	drawBox : function( x, y, z, nSize, szColor ) {
		
		// 1. Bind buffers
		Render3D.gl.enableVertexAttribArray( Render3D.pShaderProgram.vPositionLoc );
		Render3D.gl.enableVertexAttribArray( Render3D.pShaderProgram.vNormalLoc );

		Render3D.gl.bindBuffer( Render3D.gl.ARRAY_BUFFER, Render3D.pBox.normalObject );
		Render3D.gl.vertexAttribPointer( 1, 3, Render3D.gl.FLOAT, false, 0, 0 );
		Render3D.gl.bindBuffer( Render3D.gl.ARRAY_BUFFER, Render3D.pBox.vertexObject );
		Render3D.gl.vertexAttribPointer( 0, 3, Render3D.gl.FLOAT, false, 0, 0 );
		Render3D.gl.bindBuffer( Render3D.gl.ELEMENT_ARRAY_BUFFER, Render3D.pBox.indexObject );

		// 2. Bind uniforms
		Render3D.pBox.mModelView.makeIdentity();
		Render3D.pBox.mModelView.translate( x, y, z );
		Render3D.pBox.mModelView.rotate( 45, 1, 1, 1 );
		Render3D.pBox.mModelView.scale( nSize, nSize, nSize );

		Render3D.pBox.mWorld.load( Render3D.pBox.mModelView );
		Render3D.pBox.mWorld.invert();
		Render3D.pBox.mWorld.transpose();
		Render3D.pBox.mWorld.setUniform( Render3D.gl, Render3D.pBox.nWorldMatrixLoc, false );

		Render3D.pBox.mModelViewProj.load( Render3D.gl.perspectiveMatrix );
		Render3D.pBox.mModelViewProj.multiply( Render3D.pBox.mModelView );
		Render3D.pBox.mModelViewProj.setUniform( Render3D.gl, Render3D.pBox.nModelViewProjMatrixLoc, false );

		// 3. Draw!
		Render3D.gl.drawElements( Render3D.gl.TRIANGLES, Render3D.pBox.numIndices, Render3D.gl.UNSIGNED_BYTE, 0 );
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
	szLiveCode : "$Init = function() {};\n$Update = function() {};\n$Render = function() { Render3D.drawBox( 0, 0, 0, 0.5, '#f00' ); }",
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

		Render3D.SetViewportAndPerspective( nWidth, nHeight, 60, nWidth / nHeight, 0.1, 1000 );
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
		Render3D.Clear();
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

};

// start session
document.addEventListener( "DOMContentLoaded", function OnGameStart() {
	Sys.Init();
	Sys.MainLoop();
}, false );
