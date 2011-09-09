uniform mat4 mModelViewProj;
uniform mat4 mWorld;
uniform vec3 vLightDir;

attribute vec4 vPosition;
attribute vec3 vNormal;

varying vec4 vWorldNormal;
varying vec3 vLightDirection;

void main()
{	
	gl_Position = mModelViewProj * vPosition;
	
	vWorldNormal = mWorld * vec4( vNormal, 1 );
	vLightDirection = vLightDir;
}

