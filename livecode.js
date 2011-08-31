// utility functions
var Util = {
	Random : function( nStart, nEnd ) {
		return nStart + Math.floor( Math.random() * nEnd );
	},
	LoadShader : function( pContext, szShader, nShaderType, pShaderProgram ) {
		var bAsync = false;
		var XHR = new XMLHttpRequest();
		XHR.onreadystatechange = function() {
			if( XHR.readyState == 4  && XHR.status == 200 ) {
				// TODO: add error checking :)
				var szShaderSource = XHR.responseText;
				var pShader = pContext.createShader( nShaderType );
				pContext.shaderSource( pShader, szShaderSource );
				pContext.compileShader( pShader );

				pContext.attachShader( pShaderProgram, pShader );
			}
		};
		XHR.open( "GET", szShader, bAsync );
		XHR.send();
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

	    retval.normalObject = ctx.createBuffer();
	    ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.normalObject);
	    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(normalData), ctx.STATIC_DRAW);

	    retval.texCoordObject = ctx.createBuffer();
	    ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.texCoordObject);
	    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(texCoordData), ctx.STATIC_DRAW);

	    retval.vertexObject = ctx.createBuffer();
	    ctx.bindBuffer(ctx.ARRAY_BUFFER, retval.vertexObject);
	    ctx.bufferData(ctx.ARRAY_BUFFER, new Float32Array(geometryData), ctx.STATIC_DRAW);

	    retval.numIndices = indexData.length;
	    retval.indexObject = ctx.createBuffer();
	    ctx.bindBuffer(ctx.ELEMENT_ARRAY_BUFFER, retval.indexObject);
	    ctx.bufferData(ctx.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), ctx.STREAM_DRAW);

	    return retval;
	}
	
};

// define Render3D object
var Render3D = {
	pContext : null, // gl context
	pShaderProgram : null,
	nWidth : 0,
	nHeight : 0,
	pSphere : null,
	Init : function( pCanvas ) {
		var szWebGLImpl = [ "webgl", "experimental-webgl", "webkit-3d", "moz-webgl" ];
		for( var i = 0; i < szWebGLImpl.length; ++i ) {
			try { Render3D.pContext = pCanvas.getContext( szWebGLImpl[i] ); } catch( e ) {}
			
			if( Render3D.pContext ) { break; }
		}

		Render3D.pShaderProgram = Render3D.pContext.createProgram();

		// TODO: 
		// 1. Load default vertex & fragment shaders
		Util.LoadShader( Render3D.pContext, "default.vs", Render3D.pContext.VERTEX_SHADER, Render3D.pShaderProgram ); 
		Util.LoadShader( render3D.pContext, "default.fs", Render3D.pContext.FRAGMENT_SHADER, Render3D.pShaderProgram );

		// 2. Bind vertex attributes
		Render3D.pContext.bindAttribLocation( Render3D.pShaderProgram, 0, "vPosition" );
		Render3D.pContext.bindAttribLocation( Render3D.pShaderProgram, 1, "vNormal" );

		Render3D.pContext.linkProgram( Render3D.pShaderProgram );
		Render3D.pContext.useProgram( Render3D.pShaderProgram );

		// 3. Set clear color and depth
		Render3D.pContext.clearColor( 0, 0, 0.5, 1 );
		Render3D.pContext.clearDepth( 5000 );

		Render3D.pContext.enable( Render3D.pContext.DEPTH_TEST );
		Render3D.pContext.enable( Render3D.pContext.BLEND );
		Render3D.pContext.blendFunc( Render3D.pContext.SRC_ALPHA, Render3D.pContext.ONE_MINUS_SRC_ALPHA );

		// 4. Bind uniforms
		Render3D.pContext.uniform3f( Render3D.pContext.getUniformLocation( Render3D.pShaderProgram, "vLightDir" ), 0, 0, 1 );

		// 5. Set up sphere
		Render3D.pSphere = Util.makeSphere( Render3D.pContext, 20, 10, 10 );
		Render3D.pSphere.mModelView = new J3DIMatrix4();
		Render3D.pSphere.nWorldMatrixLoc = Render3D.pContext.getUniformLocation( Render3D.pShaderProgram, "mWorld" );
		Render3D.pSphere.mWorld = new J3DIMatrix4();
		Render3D.pSphere.nModelViewProjMatrixLoc = Render3D.pContext.getUniformLocation( Render3D.pShaderProgram, "mModelViewProj" );
		Render3D.pSphere.mModelViewProj = new J3DIMatrix4();

		Render3D.pContext.enableVertexAttribArray( 0 );
		Render3D.pContext.enableVertexAttribArray( 1 );

		Render3D.pContext.bindBuffer( Render3D.pContext.ARRAY_BUFFER, Render3D.pSphere.vertexObject );
		Render3D.pContext.vertexAttribPointer( 0, 3, Render3D.pContext.FLOAT, false, 0, 0 );
		Render3D.pContext.bindBuffer( Render3D.pContext.ARRAY_BUFFER, Render3D.pSphere.normalObject );
		Render3D.pContext.vertexAttribPointer( 1, 3, Render3D.pContext.FLOAT, false, 0, 0 );
		Render3D.pContext.bindBuffer( Render3D.pContext.ELEMENT_ARRAY_BUFFER, Render3D.pSphere.indexObject );
	},
	SetViewportAndPerspective : function( nWidth, nHeight, nFrustum, nAspect, nDepthNear, nDepthFar ) {
		if( !Render3D.pContext )
			return;

		Render3D.pContext.viewport( 0, 0, nWidth, nHeight );
		Render3D.pContext.perspectiveMatrix = new J3DIMatrix4();
		Render3D.pContext.perspectiveMatrix.lookat( 0, 0, 7, 0, 0, 0, 0, 1, 0 );
		Render3D.pContext.perspectiveMatrix.perspective( nFrustum, nAspect, nDepthNear, nDepthFar );

	},
	Clear : function( bColor, bDepth ) {
		// TODO: use bColor && bDepth
		Render3d.pContext.clear( Render3D.pContext.COLOR_BUFFER_BIT | Render3d.pContext.DEPTH_BUFFER_BIT );
	},
	drawBall : function( x, y, z, nRadius, szColor ) {
		Render3D.pSphere.mModelView.makeIdentity();
		Render3D.pSphere.mModelView.translate( x, y, z );

		Render3D.pSphere.mWorld.load( Render3D.pSphere.mModelView );
		Render3D.pSphere.mWorld.invert();
		Render3D.pSphere.mWorld.transpose();
		Render3D.pSphere.mWorld.setUniform( Render3D.pContext, Render3D.pSphere.nWorldMatrixLoc, false );

		Render3D.pSphere.mModelViewProj.load( Render3D.pContext.perspectiveMatrix );
		Render3D.pSphere.mModelViewProj.multiply( Render3D.pSphere.mModelView );
		Render3D.pSphere.mModelViewProj.setUniform( Render3D.pContext, Render3D.pSphere.nModelViewProjMatrxiLoc, false );

		Render3D.pContext.drawElements( Render3D.pContext.TRIANGLES, Render3D.pSphere.numIndices, Render3D.pContext.UNSIGNED_BYTE, 0 );
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

}

// start session
document.addEventListener( "DOMContentLoaded", function() {
	Sys.Init();
	Sys.MainLoop();
}, false );
