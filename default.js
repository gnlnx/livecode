var Colors = [ "#f00", "#ff0", "#fff", "#0f0", "#0ff", "#00f" ];
var Balls = [];
var MAX_BALLS = 100;
$Init = function() {
  for( var b = 0; b < MAX_BALLS; ++b ) {
    Balls[b] = { x: Util.Random( 10, Render2D.nWidth-10 ),
                 y: Util.Random( 10, Render2D.nHeight-10 ),
                 r: Util.Random( 10, 50 ),
                 color: "#0ff",
                 fill: ( (b % 2) == 0 ) ? true : false,
                 v: { x: Util.Random( 2, 5 ), y: 0 }
               };
    //Physics2D.addObject( Balls[b].x, Balls[b].y, Balls[b].r, Balls[b].v.x, Balls[b].v.y );
  }
}

$Update = function() {
  for( var b = 0; b < MAX_BALLS; ++b ) {
    Balls[b].x += Balls[b].v.x;
    Balls[b].y += Balls[b].v.y;
    if( Balls[b].x-Balls[b].r > Render2D.nWidth ) {
      Balls[b].x = -Balls[b].r;
      Balls[b].color = Colors[Util.Random( 0, Colors.length )];
      Balls[b].fill = !Balls[b].fill;
    }
  }
}

$Render = function() {
  for( var b = 0; b < MAX_BALLS; ++b ) {
    Render2D.drawBall( Balls[b].x, Balls[b].y, Balls[b].r, Balls[b].color, Balls[b].fill );
  }
}

