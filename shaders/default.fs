varying float vDot;

void main()
{
	vec4 vColor = vec4( 0.1, 0.1, 0.1, 1 );
	gl_FragColor = vec4( color.xyz * vDot, color.a );
}
