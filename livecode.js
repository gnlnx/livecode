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
	/*
	 * Copyright (C) 2009 Apple Inc. All Rights Reserved.
	 *
	 * Redistribution and use in source and binary forms, with or without
	 * modification, are permitted provided that the following conditions
	 * are met:
	 * 1. Redistributions of source code must retain the above copyright
	 *    notice, this list of conditions and the following disclaimer.
	 * 2. Redistributions in binary form must reproduce the above copyright
	 *    notice, this list of conditions and the following disclaimer in the
	 *    documentation and/or other materials provided with the distribution.
	 *
	 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
	 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
	 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
	 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
	 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
	 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
	 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
	 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
	 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
	 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
	 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
	 */
	makeSphere : function(ctx, radius, lats, longs)
	{
	    var geometryData = [ ];
	    var normalData = [ ];
	    var texCoordData = [ ];
	    var indexData = [ ];

	    for (var latNumber = 0; latNumber <= lats; ++latNumber) {
		for (var longNumber = 0; longNumber <= longs; ++longNumber) {
		    var theta = latNumber * Math.PI / lats;
		    var phi = longNumber * 2 * Math.PI / longs;
		    var sinTheta = Math.sin(theta);
		    var sinPhi = Math.sin(phi);
		    var cosTheta = Math.cos(theta);
		    var cosPhi = Math.cos(phi);

		    var x = cosPhi * sinTheta;
		    var y = cosTheta;
		    var z = sinPhi * sinTheta;
		    var u = 1-(longNumber/longs);
		    var v = latNumber/lats;

		    normalData.push(x);
		    normalData.push(y);
		    normalData.push(z);
		    texCoordData.push(u);
		    texCoordData.push(v);
		    geometryData.push(radius * x);
		    geometryData.push(radius * y);
		    geometryData.push(radius * z);
		}
	    }

	    for (var latNumber = 0; latNumber < lats; ++latNumber) {
		for (var longNumber = 0; longNumber < longs; ++longNumber) {
		    var first = (latNumber * (longs+1)) + longNumber;
		    var second = first + longs + 1;
		    indexData.push(first);
		    indexData.push(second);
		    indexData.push(first+1);

		    indexData.push(second);
		    indexData.push(second+1);
		    indexData.push(first+1);
		}
	    }

	    var retval = { };

	    retval.vertexObject = ctx.createBuffer();
	    ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.vertexObject);
	    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(geometryData), ctx.STATIC_DRAW);

	    retval.normalObject = ctx.createBuffer();
	    ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.normalObject);
	    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(normalData), ctx.STATIC_DRAW);

	    retval.texCoordObject = ctx.createBuffer();
	    ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.texCoordObject);
	    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(texCoordData), ctx.STATIC_DRAW);

	    retval.numIndices = indexData.length;
	    retval.indexObject = ctx.createBuffer();
	    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, retval.indexObject);
	    ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), ctx.STREAM_DRAW);

	    return retval;
	}
	
};

// define Render3D object
var Render3D = {
	gl : null, // gl context
	pShaderProgram : null,
	nWidth : 0,
	nHeight : 0,
	pSphere : null,
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
		Render3D.gl.clearColor( 0, 0, 0.5, 1 );
		Render3D.gl.clearDepth( 5000 );

		Render3D.gl.enable( Render3D.gl.DEPTH_TEST );
		Render3D.gl.enable( Render3D.gl.BLEND );
		Render3D.gl.blendFunc( Render3D.gl.SRC_ALPHA, Render3D.gl.ONE_MINUS_SRC_ALPHA );

		// 4. Bind uniforms
		Render3D.gl.uniform3f( Render3D.gl.getUniformLocation( Render3D.pShaderProgram, "vLightDir" ), 0, 0, 1 );

		// 5. Set up sphere
		Render3D.pSphere = Util.makeSphere( Render3D.gl, 1, 10, 10 );
		Render3D.pSphere.mModelView = new J3DIMatrix4();
		Render3D.pSphere.nWorldMatrixLoc = Render3D.gl.getUniformLocation( Render3D.pShaderProgram, "mWorld" );
		Render3D.pSphere.mWorld = new J3DIMatrix4();
		Render3D.pSphere.nModelViewProjMatrixLoc = Render3D.gl.getUniformLocation( Render3D.pShaderProgram, "mModelViewProj" );
		Render3D.pSphere.mModelViewProj = new J3DIMatrix4();
	},
	SetViewportAndPerspective : function( nWidth, nHeight, nFOV, nAspect, nDepthNear, nDepthFar ) {
		if( !Render3D.gl )
			return;

		Render3D.gl.viewport( 0, 0, nWidth, nHeight );
		Render3D.gl.perspectiveMatrix = new J3DIMatrix4();
		Render3D.gl.perspectiveMatrix.lookat( 0, 0, 10, 0, 0, 0, 0, 1, 0 );
		Render3D.gl.perspectiveMatrix.perspective( nFOV, nAspect, nDepthNear, nDepthFar );

	},
	Clear : function( bColor, bDepth ) {
		// TODO: use bColor && bDepth
		Render3D.gl.clear( Render3D.gl.COLOR_BUFFER_BIT | Render3D.gl.DEPTH_BUFFER_BIT );
	},
	drawBall : function( x, y, z, nRadius, szColor ) {
		
		// 1. Bind buffers
		Render3D.gl.enableVertexAttribArray( Render3D.pShaderProgram.vPositionLoc );
		Render3D.gl.enableVertexAttribArray( Render3D.pShaderProgram.vNormalLoc );

		Render3D.gl.bindBuffer( Render3D.gl.ARRAY_BUFFER, Render3D.pSphere.vertexObject );
		Render3D.gl.vertexAttribPointer( 0, 3, Render3D.gl.FLOAT, false, 0, 0 );
		Render3D.gl.bindBuffer( Render3D.gl.ARRAY_BUFFER, Render3D.pSphere.normalObject );
		Render3D.gl.vertexAttribPointer( 1, 3, Render3D.gl.FLOAT, false, 0, 0 );
		Render3D.gl.bindBuffer( Render3D.gl.ELEMENT_ARRAY_BUFFER, Render3D.pSphere.indexObject );

		// 2. Bind uniforms
		Render3D.pSphere.mModelView.makeIdentity();
		Render3D.pSphere.mModelView.translate( x, y, z );
		Render3D.pSphere.mModelView.scale( nRadius, nRadius, nRadius );

		Render3D.pSphere.mWorld.load( Render3D.pSphere.mModelView );
		Render3D.pSphere.mWorld.invert();
		Render3D.pSphere.mWorld.transpose();
		Render3D.pSphere.mWorld.setUniform( Render3D.gl, Render3D.pSphere.nWorldMatrixLoc, false );

		Render3D.pSphere.mModelViewProj.load( Render3D.gl.perspectiveMatrix );
		Render3D.pSphere.mModelViewProj.multiply( Render3D.pSphere.mModelView );
		Render3D.pSphere.mModelViewProj.setUniform( Render3D.gl, Render3D.pSphere.nModelViewProjMatrixLoc, false );

		// 3. Draw!
		Render3D.gl.drawElements( Render3D.gl.TRIANGLES, Render3D.pSphere.numIndices, Render3D.gl.UNSIGNED_BYTE, 0 );
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
	szLiveCode : "$Init = function() {};\n$Update = function() {};\n$Render = function() { Render3D.drawBall( 0, 0, 0, 3, '#f00' ); }",
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
