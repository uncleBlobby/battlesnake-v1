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

  function checkDirectionForSelf(){
    let head = me.head;
    let body = me.body;
    let radius = 1;
    if(head.x + radius == body[1].x){
      me.unsafeMoves.push('right');
    };
    if(head.x - radius == body[1].x){
      me.unsafeMoves.push('left');
    };
    if(head.y + radius == body[1].y){
      me.unsafeMoves.push('up');
    };
    if(head.y - radius == body[1].y){
      me.unsafeMoves.push('down');
    };
  };

  function checkDirectionForSelf3(){
    let head = me.head;
    let body = me.body;
    if(body.length > 3){
      let radius = 1;
      if((head.x + radius == body[3].x) && (head.y == body[3].y)){
        me.unsafeMoves.push('right');
      };
      if((head.x - radius == body[3].x) && (head.y == body[3].y)){
        me.unsafeMoves.push('left');
      };
      if((head.x == body[3].x) && (head.y + radius == body[3].y)){
        me.unsafeMoves.push('up');
      };
      if((head.x == body[3].x) && (head.y - radius == body[3].y)){
        me.unsafeMoves.push('down');
      };
    };
  };

  function checkDirectionForSelf5(){
    let head = me.head;
    let body = me.body;
    if(body.length > 5){
      let radius = 1;
      if((head.x + radius == body[5].x) && (head.y == body[5].y)){
        me.unsafeMoves.push('right');
      };
      if((head.x - radius == body[5].x) && (head.y == body[5].y)){
        me.unsafeMoves.push('left');
      };
      if((head.x == body[5].x) && (head.y + radius == body[5].y)){
        me.unsafeMoves.push('up');
      };
      if((head.x == body[5].x) && (head.y - radius == body[5].y)){
        me.unsafeMoves.push('down');
      };
    };
  };
