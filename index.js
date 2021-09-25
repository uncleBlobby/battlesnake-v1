const bodyParser = require('body-parser')
const express = require('express')
const fs = require('fs')

const PORT = process.env.PORT || 3000

const HOST = process.env.HOST || "127.0.0.1" 

const app = express()
app.use(bodyParser.json())

app.get('/', handleIndex)
app.post('/start', handleStart)
app.post('/move', handleMove)
app.post('/end', handleEnd)

app.listen(PORT, HOST, () => console.log(`Battlesnake Server listening at http://${HOST}:${PORT}`))


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
  // init gameData variable on each turn to accept board and game state
  let gameData = request.body;
  // init me variable to isolate self object
  let me = gameData.you;

  // init variables to store height and width of gameboard
  let height = gameData.board.height;
  let width = gameData.board.width;

  // init array to hold unsafe moves ( moves that will lead directly to death )
  // init array to hold potential safe moves
  me.unsafeMoves = [];
  me.safeMoves = ['left', 'down', 'right', 'up'];

  // function compares safeMoves array against unsafeMoves array and returns only those moves that do not == unsafemoves
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

  // loop through my own body to determine if any directions lead to self collision...
  // if so, add that direction to unsafe move list

  function checkDirectionForAnyLengthSELF(){
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

  // loop through all snakes on the board (snakes.length) 
  // and loop through their bodies (snakes[].body[])
  // to determine if any directions lead to snake collision...
  // if so add that direction to unsafe move list

  function checkDirectionForAnySnake(){
    // head == current position of my head
    let head = me.head;
    // board == latest update for the board object
    let board = gameData.board;
    // snakes == latest update on snake information
    let snakes = board.snakes;
    // rename movements for readability
    let iMoveRight = head.x + 1;
    let iMoveLeft = head.x - 1;
    let iMoveUp = head.y + 1;
    let iMoveDown = head.y - 1;
    // loop through all snakes except the one in array position zero (self)
    for(let i = 1; i < snakes.length; i++){
      // loop through each of those snakes' body for the length of their body
      for(let j = 0; j < snakes[i].body.length; j++){
        // if I move my head one square right and it equals the x position of any snakes body, 
        // and they're also on the same y position as me, add right to unsafe moves..
        if((iMoveRight == snakes[i].body[j].x) && (head.y == snakes[i].body[j].y)){
          console.log(`snake found, can't move right`);
          me.unsafeMoves.push('right');
        };
        // ditto for left
        if((iMoveLeft == snakes[i].body[j].x) && (head.y == snakes[i].body[j].y)){
          console.log(`snake found, can't move left`);
          me.unsafeMoves.push('left');
        };
        // up
        if((iMoveUp == snakes[i].body[j].y) && (head.x == snakes[i].body[j].x)){
          console.log(`snake found, can't move up`);
          me.unsafeMoves.push('up');
        };
        // down
        if((iMoveDown == snakes[i].body[j].y) && (head.x == snakes[i].body[j].x)){
          console.log(`snake found, can't move down`);
          me.unsafeMoves.push('down');
        };
      };
    };
  };

  checkDirectionForWalls();
  checkDirectionForAnyLengthSELF();
  checkDirectionForAnySnake();
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
  
  let fileInput = JSON.stringify(gameData, null, 2);

  fs.writeFile('log.txt', fileInput, function (err) {
    if (err) return console.log(err);
    console.log(`logging game data: fileInput > log.txt`);
  });

  console.log('END')
  response.status(200).send('ok')
}
