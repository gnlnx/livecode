#ifdef GL_ES
precision highp float;
#endif

varying vec4 vWorldNormal;
varying vec4 vDiffuse;
varying vec3 vLightDirection;

void main()
{
	float fDot = max( dot( vWorldNormal.xyz, vLightDirection ), 0.0 );
	gl_FragColor = vec4( vDiffuse.xyz * fDot, vDiffuse.a );
}

