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
    color: '#FF5733',
    head: 'shades',
    tail: 'bolt',
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
  let startTime = Date.now();
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
  me.preferredMoves = [];

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

  me.riskyMoves = [];

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
    for(let i = 0; i < snakes.length; i++){
      // loop through each of those snakes' body for the length of their body
      for(let j = 0; j < snakes[i].body.length; j++){
        // if I move my head one square right and it equals the x position of any snakes body, 
        // and they're also on the same y position as me, add right to unsafe moves..
        if((iMoveRight == snakes[i].body[j].x) && (head.y == snakes[i].body[j].y)){
          console.log(`snake found, can't move right`);
          me.unsafeMoves.push('right');
        };
        if((head.x + 2 == snakes[i].body[0].x) && (head.y == snakes[i].body[0].y)){
          console.log(`snake over there, right is risky`);
          me.riskyMoves.push('right');
        };
        // ditto for left
        if((iMoveLeft == snakes[i].body[j].x) && (head.y == snakes[i].body[j].y)){
          console.log(`snake found, can't move left`);
          me.unsafeMoves.push('left');
        };
        if((head.x - 2 == snakes[i].body[0].x) && (head.y == snakes[i].body[0].y)){
          console.log(`snake over there, left is risky`);
          me.riskyMoves.push('left');
        };
        // up
        if((iMoveUp == snakes[i].body[j].y) && (head.x == snakes[i].body[j].x)){
          console.log(`snake found, can't move up`);
          me.unsafeMoves.push('up');
        };
        if((head.y + 2 == snakes[i].body[0].y) && (head.x == snakes[i].body[0].x)){
          console.log(`snake over there, up is risky`);
          me.riskyMoves.push('up');
        };
        // down
        if((iMoveDown == snakes[i].body[j].y) && (head.x == snakes[i].body[j].x)){
          console.log(`snake found, can't move down`);
          me.unsafeMoves.push('down');
        };
        if((head.y - 2 == snakes[i].body[0].y) && (head.x == snakes[i].body[0].x)){
          console.log(`snake over there, down is risky`);
          me.riskyMoves.push('down');
        };
      };
    };
  };

  // check safe directions for food -- if food exists in one direction, prefer that direction, else just choose random.

  function checkSafeDirectionsForFood(){
    if (me.safeMoves.length > 1){
    let food = gameData.board.food;
    // loop through all food on board
    for(let i = 0; i < food.length; i++){
      // loop through each potential safe move and compare it
      // to each food position x / y
      for(let j = 0; j < me.safeMoves.length; j++){
        switch (me.safeMoves[j]) {
          case 'right':
            if ((me.head.x + 1 == food[i].x) && (me.head.y == food[i].y)) {
              if(!(me.preferredMoves.includes('right'))){
                me.preferredMoves.push('right');
                console.log(`found food to the right`);
              };
            };
          case 'left':
            if ((me.head.x - 1 == food[i].x) && (me.head.y == food[i].y)) {
              if(!(me.preferredMoves.includes('left'))){  
                me.preferredMoves.push('left');
                console.log(`found food to the left`);
              };
            };
          case 'up':
            if ((me.head.x == food[i].x) && (me.head.y + 1 == food[i].y)) {
              if(!(me.preferredMoves.includes('up'))){
                me.preferredMoves.push('up');
                console.log(`found food to the north`);
              };
            };
          case 'down':
            if ((me.head.x == food[i].x) && (me.head.y - 1 == food[i].y)) {
              if(!(me.preferredMoves.includes('down'))){
                me.preferredMoves.push('down');
                console.log(`found food to the south`);
              };
            };
          };
        };
      };
      if (me.preferredMoves.length > 0) {
        me.safeMoves = me.preferredMoves;
        console.log(`overwriting safemoves with preferred moves for food`);
      };
    };
  };

  me.currentlyInHazard = false;
  me.movesOutOfHazard = [];
  me.fastestRouteOut = null;

  function checkIfHeadInHazard(){
    if(gameData.board.hazards.length > 0){
      let hazards = gameData.board.hazards
      for(let i = 0; i < hazards.length; i++){
        if((me.head.x == hazards[i].x) && (me.head.y == hazards[i].y)){
          me.currentlyInHazard = true;
          console.log(`looks like I'm in the rhubarb`);
          shoutOut = "Looks like I'm in the rhubarb."
          if(me.head.x < 5){
            me.movesOutOfHazard.push('right', 'up', 'down');
            me.fastestRouteOut = 'right';
            return;
          };
          if(me.head.x > 5){
            me.movesOutOfHazard.push('left', 'up', 'down');
            me.fastestRouteOut = 'left';
            return;
          };
          if(me.head.y < 5){
            me.movesOutOfHazard.push('up', 'left', 'right');
            me.fastestRouteOut = 'up';
            return;
          };
          if(me.head.y > 5){
            me.movesOutOfHazard.push('down', 'left', 'right');
            me.fastestRouteOut = 'down';
            return;
          };
        };
      };
    };
  };
  me.safeMovesOutOfHazard = [];
  function checkIfMovesOutOfHazardSafe(){
    for(let i = 0; i < me.movesOutOfHazard.length; i++){
      if(me.safeMoves.includes(me.movesOutOfHazard[i])){
        me.safeMovesOutOfHazard.push(me.movesOutOfHazard[i]);
        if(me.safeMovesOutOfHazard.length > 0){
          me.safeMoves = me.safeMovesOutOfHazard;
        };
        if((me.fastestRouteOut != null) && (me.safeMoves.includes(me.fastestRouteOut))){
          me.safeMoves = [];
          me.safeMoves.push(me.fastestRouteOut);
        };
      };
    };
  };

  function checkIfAnySafeMovesAreNotRiskyMoves(){
    if(me.riskyMoves.length > 0){
      let safe = me.safeMoves;
      let risky = me.riskyMoves;
        for (let i = 0; i < risky.length; i++){
          if(safe.includes(risky[i])){
            let position = safe.indexOf(risky[i]);
            safe.splice(position, 1);
          };
        };
        me.safeMoves = safe;
    };
  };

  me.avoidThisToAvoidCorner = [];
  function makeSureYouDontCornerYourself(){
    if(me.head.x == 0 && me.head.y == 1){
      me.avoidThisToAvoidCorner.push('down');
    }
    if(me.head.x == 1 && me.head.y == 0){
      me.avoidThisToAvoidCorner.push('left');
    }
    if(me.head.x == width - 2 && me.head.y == 0){
      me.avoidThisToAvoidCorner.push('right');
    };
    if(me.head.x == width - 1 && me.head.y == 1){
      me.avoidThisToAvoidCorner.push('down');
    };
    if(me.head.x == 0 && me.head.y == height - 2){
      me.avoidThisToAvoidCorner.push('up');
    };
    if(me.head.x == 1 && me.head.y == height - 1){
      me.avoidThisToAvoidCorner.push('left');
    };
    if(me.head.x == width - 2 && me.head.y == height - 1){
      me.avoidThisToAvoidCorner.push('right');
    };
    if(me.head.x == width - 1 && me.head.y == height - 2){
      me.avoidThisToAvoidCorner.push('up');
    };

  };

  function tryToAvoidCorners(){
    if(me.safeMoves.length > 1 && me.avoidThisToAvoidCorner.length > 0){
      for(let i = 0; i < me.avoidThisToAvoidCorner.length; i++){
        if(me.safeMoves.includes(me.avoidThisToAvoidCorner[i])){
          let position = me.safeMoves.indexOf(me.avoidThisToAvoidCorner[i]);
          me.safeMoves.splice(position, 1);
        };
      };
    };
  };

  // prefer not sauce

  me.avoidSauceIfPossible = [];

  function preferNotSauce(){
    let head = me.head;
    let sauce = gameData.board.hazards;
    for(let i = 0; i < sauce.length; i++){
      if((head.x + 1 == sauce[i].x) && (head.y == sauce[i].y)){
        me.avoidSauceIfPossible.push('right');
      };
      if((head.x - 1 == sauce[i].x) && (head.y == sauce[i].y)){
        me.avoidSauceIfPossible.push('left');
      };
      if((head.y + 1 == sauce[i].y) && (head.x == sauce[i].x)){
        me.avoidSauceIfPossible.push('up');
      };
      if((head.y - 1 == sauce[i].y) && (head.x == sauce[i].x)){
        me.avoidSauceIfPossible.push('down');
      };
    };
    removeSauceMovesIfPossible();
  };

  function removeSauceMovesIfPossible(){
    if(me.safeMoves.length > 1){
      for(let i = 0; i < me.avoidSauceIfPossible.length; i++){
        if(me.safeMoves.includes(me.avoidSauceIfPossible[i])){
          let position = me.safeMoves.indexOf(me.avoidSauceIfPossible[i]);
          me.safe.splice(position, 1);
        };
      };
    };
  };
    

  function moveSelector(){
    if(me.safeMoves.length > 1){
      randomSafeMove = me.safeMoves[Math.floor(Math.random()*me.safeMoves.length)];
    } else {
      randomSafeMove = me.safeMoves[0];
      shoutOut = "whew!"
      console.log(`I'M SHOUTING`);
    };
    if(me.safeMoves.length == 0){
      console.log(`no safe moves`);
      console.log(`moving right`);
      randomSafeMove = 'right';
    };
  };

  checkDirectionForWalls();
  checkDirectionForAnyLengthSELF();
  checkDirectionForAnySnake();
  removeSafeMovesThatAreUnsafe();
  checkSafeDirectionsForFood();

  /*
  checkIfHeadInHazard();
  if(me.currentlyInHazard == true){
    checkIfMovesOutOfHazardSafe();
  };
  */

  checkIfAnySafeMovesAreNotRiskyMoves();
  makeSureYouDontCornerYourself();
  tryToAvoidCorners();
  preferNotSauce();
  
  console.log(me);  
  console.log(me.safeMoves);
  console.log(me.unsafeMoves);

  let randomSafeMove;
  let shoutOut = '';

  moveSelector();

  let endTime = Date.now();
  let timeElapsed = endTime - startTime;
  let turnTimes = [];
  turnTimes.push(timeElapsed);
  
  console.log(`turn took: ${timeElapsed}ms`);
  console.log(`last move: ${randomSafeMove}`);
  response.status(200).send({
    move: randomSafeMove
  })
  /*
  let fileInput = "\n" + JSON.stringify(gameData, null, 2);
  fs.appendFileSync('log.txt', fileInput, 'utf-8');
  console.log(`gameData dumped to log`);
  */
}

function handleEnd(request, response) {
  let gameData = request.body
  
  let fileInput = "\n" + JSON.stringify(gameData, null, 2);
  /*
  fs.writeFile('log.txt', fileInput, function (err) {
    if (err) return console.log(err);
    console.log(`logging game data: fileInput > log.txt`);
  });
  */
  
  fs.appendFileSync('log.txt', fileInput, 'utf-8');
  console.log(`gameData dumped to log`);
  console.log('END')
  response.status(200).send('ok')
}
