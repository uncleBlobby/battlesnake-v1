function checkHeadAgainstWalls(){
    if(me.head.x == 0){
      me.unsafeMoves.push('left');
    };
    if(me.head.x == 10){
      me.unsafeMoves.push('right');
    };
    if(me.head.y == 0){
      me.unsafeMoves.push('down');
    };
    if(me.head.y == 10){
      me.unsafeMoves.push('up');
    };
  };
  
  function checkHeadAgainstBody(){

    for (let i =0; i < me.body.length; i++){
      if((me.body[i].x == me.head.x + 1)){
        me.unsafeMoves.push('right');
      };
      if((me.body[i].x == me.head.x - 1)){
        me.unsafeMoves.push('left');
      };
      if(me.body[i].y == me.head.y + 1){
        me.unsafeMoves.push('up');
      };
      if(me.body[i].y == me.head.y - 1){
        me.unsafeMoves.push('down');
      };
    };
  };

  function checkTurnBackIntoSelf(){

    for (let i =0; i < me.body.length; i++){
      if((me.body[i].x == me.head.x + 1)){
        me.unsafeMoves.push('right');
      };
      if((me.body[i].x == me.head.x - 1)){
        me.unsafeMoves.push('left');
      };
      if(me.body[i].y == me.head.y + 1){
        me.unsafeMoves.push('up');
      };
      if(me.body[i].y == me.head.y - 1){
        me.unsafeMoves.push('down');
      };
    };
  };