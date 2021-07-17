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

  

  //gameData.game = object describing the game being played
  //gameData.turn = integer for current turn number
  //gameData.board = object describing the initial state of the gameboard
  //gameData.you = object describing your battlesnake

  console.log('START')
  console.log(`live updated`)
  response.status(200).send('ok')
}

function handleMove(request, response) {
  let gameData = request.body;
  let move;
  console.log(`gameData Object`)
  console.log(gameData);

  let me = gameData.you;

  console.log(`my info`);
  console.log(me);
  console.log(`my head`);
  console.log(me.head);
  //gameData.game = object describing the game being played
  //gameData.turn = integer for current turn number
  //gameData.board = object describing the initial state of the gameboard
  //gameData.you = object describing your battlesnake

  console.log(`board object`);
  console.log(gameData.board);

  //pick a direction, move that direction until you find a wall, then turn any direction EXCEPT the opposite direction


  //function to calculate range of available moves around current position

  function calculateAvailableMoves() {
    let rangeUp = gameData.board.height - me.head.y -1;
    let rangeDown = me.head.y;
    let rangeRight = gameData.board.width - me.head.x -1;
    let rangeLeft = me.head.x;

    console.log(`range up: ${rangeUp}, range down: ${rangeDown}, range Right: ${rangeRight}, range Left: ${rangeLeft}`);

    let ranges = {"up": rangeUp, "down": rangeDown, "right": rangeRight, "left": rangeLeft};
    return ranges;
  };

  function makeMove() {
    let ranges = calculateAvailableMoves();
    console.log(ranges);

    if(ranges.up > 0){
      move = 'up';
    };
    if(ranges.right > 0){
      move = 'right';
    };
    if(ranges.down > 0){
      move = 'down';
    };
    if(ranges.left > 0){
      move = 'left';
    };
    console.log(`move inside makeMove`);
    console.log(move);
    return move;
  };

  //makeMove();

  console.log('MOVE: ' + move)
  response.status(200).send({
    move: makeMove()
  })
}

function handleEnd(request, response) {
  let gameData = request.body

  console.log('END')
  response.status(200).send('ok')
}
