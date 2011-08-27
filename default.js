var Colors = [ "#f00", "#ff0", "#fff", "#0f0", "#0ff", "#00f" ];
var Balls = [];
var MAX_BALLS = 100;
$Init = function() {
  for( var b = 0; b < MAX_BALLS; ++b ) {
    Balls[b] = { x: 10 + Math.floor( Math.random() * Render2D.nWidth-10 ),
                 y: 10 + Math.floor( Math.random() * Render2D.nHeight-10 ),
                 r: 10 + Math.floor( Math.random() * 50 ),
                 color: "#0ff",
                 fill: ( (b % 2) == 0 ) ? true : false,
                 v: { x: 2+Math.floor(Math.random()*5), y: 0 }
               };
  }
}

$Update = function() {
  for( var b = 0; b < MAX_BALLS; ++b ) {
    Balls[b].x += Balls[b].v.x;
    Balls[b].y += Balls[b].v.y;
    if( Balls[b].x-Balls[b].r > Render2D.nWidth ) {
      Balls[b].x = -Balls[b].r;
      Balls[b].color = Colors[Math.floor(Math.random()*Colors.length)];
      Balls[b].fill = !Balls[b].fill;
    }
  }
}

$Render = function() {
  for( var b = 0; b < MAX_BALLS; ++b ) {
    Render2D.drawBall( Balls[b].x, Balls[b].y, Balls[b].r, Balls[b].color, Balls[b].fill );
  }
}

