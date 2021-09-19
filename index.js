const bodyParser = require('body-parser')
const express = require('express')

const PORT = process.env.PORT || 3000

const app = express()
app.use(bodyParser.json())

app.get('/', handleIndex)
app.post('/start', handleStart)
app.post('/move', handleMove)
app.post('/end', handleEnd)

app.listen(PORT, () => console.log(`Battlesnake Server listening at http://127.0.0.1:${PORT}`))


//GET BATTLESNAKE
function handleIndex(request, response) {
  let battlesnakeInfo = {
    apiversion: '1',
    author: 'uncleBlobby',
    color: '#123456',
    head: 'default',
    tail: 'default',
    version: '0.0.1-beta'
  }
  //response sends battlesnakeinfo as JSON 
  response.status(200).json(battlesnakeInfo)
}


//start game event
function handleStart(request, response) {
  //stores request in gamedata object
  let gameData = request.body

  console.log(`START GAME data`);
  console.log(gameData);

  response.status(200).send('ok')
}

function handleMove(request, response) {
  let gameData = request.body;
  let me = gameData.you;

  let height = gameData.board.height;
  let width = gameData.board.width;

  let boardPositions = height * width;

  let boardArray = [];

  let meArray = [];

  me.safeMoves = [];
  me.unsafeMoves = [];

  for (let i = 0; i < height; i++){
    for (let j = 0; j < width; j++){
      boardArray.push({"x": i, "y": j});
    };
  };



  /*
  for (let i = 0; i < boardArray.length; i++){
    if(boardArray[i].x == 0){
      boardArray[i].safeMoves = ['down', 'up', 'right'];
    };
    if(boardArray[i].x == 10){
      boardArray[i].safeMoves = ['down', 'up', 'left'];
    };
    if(boardArray[i].y == 0){
      boardArray[i].safeMoves = ['left', 'up', 'right'];
    };
    if(boardArray[i].y == 10){
      boardArray[i].safeMoves = ['left', 'down', 'right'];
    };
    if((boardArray[i].x != 0) && (boardArray[i].x != 10) && (boardArray[i].y != 0) && (boardArray[i].y != 10)){
      boardArray[i].safeMoves = ['left', 'down', 'right', 'up'];
    };
  };

  // find my head on gameboard
  // check for walls and add safemoves to my safemoves
  for (let i = 0; i < boardArray.length; i++){
    if((boardArray[i].x == me.head.x) && (boardArray[i].y == me.head.y)){
      me.safeMoves = boardArray[i].safeMoves;
    };
  };
  */
  // compare head position to body position
  // remove body positions from save moves

  me.unsafeMoves = [];

  function checkHeadAgainstBody(){

    for (let i =0; i < me.body.length; i++){
      if(me.body[i].x == me.head.x + 1){
        me.unsafeMoves.push('right');
      };
      if(me.body[i].x == me.head.x - 1){
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

  let superSafeMoves = [];

  function removeSafeMovesThatAreUnsafe(){

    for(let i = 0; i < me.safeMoves.length; i++){
      for(let j = 0; j < me.unsafeMoves.length; j++){
        if(me.safeMoves[i] == me.unsafeMoves[j]){
          me.safeMoves.splice(i, 1);
        };
      };
    };
  };

  //removeSafeMovesThatAreUnsafe();
  //check head against walls

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

  me.safeMoves = ['left', 'down', 'right', 'up'];

  
  checkHeadAgainstBody();
  removeSafeMovesThatAreUnsafe();
  checkHeadAgainstWalls();
  removeSafeMovesThatAreUnsafe();



  console.log(boardArray);
  console.log(boardArray.length);

  console.log(`board positions: ${boardPositions}`);
  console.log(me);  
  console.log(me.safeMoves);
  console.log(me.unsafeMoves);

  let randomSafeMove = me.safeMoves[Math.floor(Math.random()*me.safeMoves.length)];
  response.status(200).send({
    move: randomSafeMove
  })
}

function handleEnd(request, response) {
  let gameData = request.body

  console.log('END')
  response.status(200).send('ok')
}
