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

  let board = gameData.board;

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
  me.safeMoves = ['left', 'down', 'right', 'up'];


  let superSafeMoves = [];

  function removeSafeMovesThatAreUnsafe(){

    for(let i = 0; i < me.unsafeMoves.length; i++){
      for(let j = 0; j < me.safeMoves.length; j++){
        if(me.safeMoves[j] == me.unsafeMoves[i]){
          me.safeMoves.splice(j, 1);
        };
      };
    };
  };

  // check if +1 in any direction will hit a wall,
  // if so, add that direction to unsafemoves

  function checkDirectionForWalls(){
    let head = me.head;
    if(head.x + 1 > width - 1 ){
      me.unsafeMoves.push('right');
    };
    if(head.x - 1 < 0){
      me.unsafeMoves.push('left');
    };
    if(head.y + 1 > height - 1){
      me.unsafeMoves.push('up');
    };
    if(head.y - 1 < 0){
      me.unsafeMoves.push('down');
    };
  };


  function checkDirectionForAnyLength(){
    let head = me.head;
    let body = me.body;
    let radius = 1;
    for(let i = 1; i < body.length; i++){
      if((head.x + radius == body[i].x) && (head.y == body[i].y)){
        me.unsafeMoves.push('right');
      };
      if((head.x - radius == body[i].x) && (head.y == body[i].y)){
        me.unsafeMoves.push('left');
      };
      if((head.x == body[i].x) && (head.y + radius == body[i].y)){
        me.unsafeMoves.push('up');
      };
      if((head.x == body[i].x) && (head.y - radius == body[i].y)){
        me.unsafeMoves.push('down');
      };
    };
  };

  function checkDirectionForAnySnake(){
    let head = me.head;
    //let snakes = [];
    for(let i = 1; i < board.snakes.length; i++){
      for(let j = 0; j < board.snakes[i].body.length; j++){
        if((head.x + 1 == board.snakes[i].body[j].x) && (head.y == board.snakes[i].body[j].y)){
          me.unsafeMoves.push('right');
        };
        if((head.x - 1 == board.snakes[i].body[j].x) && (head.y == board.snakes[i].body[j].y)){
          me.unsafeMoves.push('left');
        };
        if((head.y + 1 == board.snakes[i].body[j].y) && (head.x == board.snakes[i].body[j].x)){
          me.unsafeMoves.push('up');
        };
        if((head.y - 1 == board.snakes[i].body[j].y) && (head.x == board.snakes[i].body[j].x)){
          me.unsafeMoves.push('down');
        };
      };
    };
  };
  checkDirectionForAnySnake();
  //checkHeadAgainstBody();
  //checkTurnBackIntoSelf();
  //removeSafeMovesThatAreUnsafe();
  //checkHeadAgainstWalls();
  checkDirectionForWalls();
  //checkDirectionForSelf();
  //checkDirectionForSelf3();
  //checkDirectionForSelf5();
  checkDirectionForAnyLength();

  removeSafeMovesThatAreUnsafe();
  
  console.log(me);  
  console.log(me.safeMoves);
  console.log(me.unsafeMoves);

  let randomSafeMove = me.safeMoves[Math.floor(Math.random()*me.safeMoves.length)];

  console.log(`last move: ${randomSafeMove}`);
  response.status(200).send({
    move: randomSafeMove
  })
}

function handleEnd(request, response) {
  let gameData = request.body

  console.log('END')
  response.status(200).send('ok')
}
