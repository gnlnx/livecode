uniform mat4 mModelViewProj;
uniform mat4 mWorld;
uniform vec3 vLightDir;

attribute vec4 vPosition;
attribute vec3 vNormal;

varying float vDot;

void main()
{	
	gl_Position = mModelViewProj * vPosition;
	
	vec4 vWorldNormal = mWorld * vec4( vNormal, 1 );
	vDot = max( dot( vWorldNormal.xyz, vLightDir ), 0.0 );
}
