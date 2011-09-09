#ifdef GL_ES
precision highp float;
#endif

varying vec4 vWorldNormal;
varying vec3 vLightDirection;

void main()
{
	//float fDot = max( dot( vWorldNormal.xyz, vLightDirection ), 0.0 );
	vec4 vColor = vec4( 0.1, 0.1, 0.1, 1 );
	gl_FragColor = vec4( 1, 1, 0, 1 ); //vec4( vColor.xyz * fDot, vColor.a );
}

