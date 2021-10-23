const bodyParser = require('body-parser')
const express = require('express')

const PORT = process.env.PORT || 3000

const HOST = process.env.HOST || "127.0.0.1" 

const app = express()
app.use(bodyParser.json())

app.get('/', handleIndex)
app.post('/start', handleStart)
app.post('/move', handleMove)
app.post('/end', handleEnd)

app.listen(PORT, HOST, () => console.log(`Battlesnake Server listening at http://${HOST}:${PORT}`))

// GET BATTLESNAKE INFO
function handleIndex(request, response) {
    let battlesnakeInfo = {
        apiversion: '1',
        author: 'uncleBlobby',
        color: '#FF5733',
        head: 'shades',
        tail: 'bolt',
        version: '0.0.2-beta'
    };
    response.status(200).json(battlesnakeInfo);
    console.log(`index handled`);
};

// HANDLE GAME START EVENT
function handleStart(request, response) {
    //let gameData = request.body;
    response.status(200).send('ok');
    console.log(`start handled`);
};

function handleMove(request, response) {
    let gameData = request.body;
    let me = gameData.you;

    let gameH = gameData.board.height;
    let gameW = gameData.board.width;

    me.deathMoves = [];
    me.unsafeMoves = [];
    me.safeMoves = ['left', 'down', 'right', 'up'];
    me.riskyMoves = [];
    me.preferredMoves = [];
    me.currentlyInHazard = false;
    me.movesOutOfHazard = [];
    me.fastestRouteOutOfHazard = null;
    // if(me.health <= 50) me.starving = true;
    me.sauceMoves = [];
    me.chosenMove;

    function removeDeathMovesFromSafe() {
        for(let i = 0; i < me.deathMoves.length; i++){
            for(let j = 0; j < me.safeMoves.length; j++){
                if(me.safeMoves[j] == me.deathMoves[i]){
                    me.safeMoves.splice(j, 1);
                }
            }
        }
        return me.safeMoves;
    }

    function removeRiskyMoves() {
        if(me.riskyMoves.length > 0) {
            let safeMoves = me.safeMoves;
            let risky = me.riskyMoves;
            for(let i = 0; i < risky.length; i++) {
                if(safeMoves.includes(risky[i])){
                    let pos = safeMoves.indexOf(risky[i]);
                    safeMoves.splice(pos, 1);
                }
            }
            return safeMoves;
        }
      return me.safeMoves;
    }

    function removeSauceMovesIfPossible() {
        if(me.safeMoves.length > me.sauceMoves.length){
            for(let i = 0; i < me.sauceMoves.length; i++){
              if(me.safeMoves.includes(me.sauceMoves[i])){
                let position = me.safeMoves.indexOf(me.sauceMoves[i]);
                me.safeMoves.splice(position, 1);
              };
            };
        };
        return me.safeMoves;
    }
    
    function checkForNeck() {
        let head = me.head;
        let myNeck = me.body[1];
        if(head.x + 1 == myNeck.x && head.y == myNeck.y){
            me.deathMoves.push('right');
        };
        if(head.x - 1 == myNeck.x && head.y == myNeck.y){
            me.deathMoves.push('left');
        };
        if(head.x == myNeck.x && head.y + 1 == myNeck.y){
            me.deathMoves.push('up');
        };
        if(head.x == myNeck.x && head.y - 1 == myNeck.y){
            me.deathMoves.push('down');
        };

        return me.deathMoves;
    };

    function checkForWalls() {
        let head = me.head;
        if(head.x + 1 > gameW - 1){
            me.deathMoves.push('right');
        };
        if(head.x - 1 < 0){
            me.deathMoves.push('left');
        };
        if(head.y + 1 > gameH - 1){
            me.deathMoves.push('up');
        };
        if(head.y - 1 < 0){
            me.deathMoves.push('down');
        };

        return me.deathMoves;
    };

    function checkForSelf() {
        let head = me.head;
        let body = me.body;
        let radius = 1;
        for(let i = 1; i < body.length; i++){
            if((head.x + radius == body[i].x) && (head.y == body[i].y)){
              me.deathMoves.push('right');
            };
            if((head.x - radius == body[i].x) && (head.y == body[i].y)){
              me.deathMoves.push('left');
            };
            if((head.x == body[i].x) && (head.y + radius == body[i].y)){
              me.deathMoves.push('up');
            };
            if((head.x == body[i].x) && (head.y - radius == body[i].y)){
              me.deathMoves.push('down');
            };
          };
        return me.deathMoves;
    };

    function checkForSnakes() {
        let head = me.head;
        let board = gameData.board;
        let snakes = board.snakes;
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
              me.deathMoves.push('right');
            };
            // ditto for left
            if((iMoveLeft == snakes[i].body[j].x) && (head.y == snakes[i].body[j].y)){
              console.log(`snake found, can't move left`);
              me.deathMoves.push('left');
            };
            // up
            if((iMoveUp == snakes[i].body[j].y) && (head.x == snakes[i].body[j].x)){
              console.log(`snake found, can't move up`);
              me.deathMoves.push('up');
            };
            // down
            if((iMoveDown == snakes[i].body[j].y) && (head.x == snakes[i].body[j].x)){
              console.log(`snake found, can't move down`);
              me.deathMoves.push('down');
            };
          };
        };
        return me.deathMoves;
    };

    function preferFoodIfClose(){
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

        return me.safeMoves;
    };

    function addRiskyMoves(){
        // head == current position of my head
        let head = me.head;
        // board == latest update for the board object
        let board = gameData.board;
        // snakes == latest update on snake information
        let snakes = board.snakes;
        // loop through all snakes except the one in array position zero (self)
        for(let i = 0; i < snakes.length; i++){
            // loop through each of those snakes' body for the length of their body
            for(let j = 0; j < snakes[i].body.length; j++){
                // if I move my head one square right and it equals the x position of any snakes body, 
                // and they're also on the same y position as me, add right to unsafe moves..
                if((head.x + 2 == snakes[i].body[0].x) && (head.y == snakes[i].body[0].y)){
                    console.log(`snake over there, right is risky`);
                    me.riskyMoves.push('right');
                };
                // ditto for left
                if((head.x - 2 == snakes[i].body[0].x) && (head.y == snakes[i].body[0].y)){
                    console.log(`snake over there, left is risky`);
                    me.riskyMoves.push('left');
                };
                // up
                if((head.y + 2 == snakes[i].body[0].y) && (head.x == snakes[i].body[0].x)){
                    console.log(`snake over there, up is risky`);
                    me.riskyMoves.push('up');
                };
                // down
                if((head.y - 2 == snakes[i].body[0].y) && (head.x == snakes[i].body[0].x)){
                    console.log(`snake over there, down is risky`);
                    me.riskyMoves.push('down');
                };
            };
        };
        return me.riskyMoves;
    };

    function checkForSauce() {
        let head = me.head;
        let sauce = gameData.board.hazards;
        let sauceDirections = [];
        for(let i = 0; i < sauce.length; i++){
            if((head.x + 1 == sauce[i].x) && (head.y == sauce[i].y)){
              sauceDirections.push('right');
            };
            if((head.x - 1 == sauce[i].x) && (head.y == sauce[i].y)){
              sauceDirections.push('left');
            };
            if((head.y + 1 == sauce[i].y) && (head.x == sauce[i].x)){
              sauceDirections.push('up');
            };
            if((head.y - 1 == sauce[i].y) && (head.x == sauce[i].x)){
              sauceDirections.push('down');
            };
        };
        
        return sauceDirections;
    };

    function moveSelector(scoredMoves){
      let weightedMoves = [];
        if((scoredMoves[3].score > scoredMoves[2].score) ||
           (scoredMoves[3].score > scoredMoves[1].score) ||
           (scoredMoves[3].score > scoredMoves[0].score)){
             if(me.safeMoves.includes(scoredMoves[3].direction)){
               weightedMoves.push(scoredMoves[3].direction);
             }
           }
        if((scoredMoves[2].score > scoredMoves[1].score) ||
           (scoredMoves[2].score > scoredMoves[0].score)){
             if(me.safeMoves.includes(scoredMoves[2].direction)){
               weightedMoves.push(scoredMoves[2].direction);
             }
           }
        if((scoredMoves[1].score > scoredMoves[0].score)){
             if(me.safeMoves.includes(scoredMoves[1].direction)){
               weightedMoves.push(scoredMoves[1].direction);
             }
           }
        if((scoredMoves[3].score == scoredMoves[0].score)){
          weightedMoves = [];
        }
           //(me.safeMoves.includes(scoredMoves[3].direction))){
          //return scoredMoves[3].direction;
        if(weightedMoves.length > 0){
          me.safeMoves = weightedMoves;
        }
        let randomSafeMove;
        if(me.safeMoves.length > 1){
          randomSafeMove = me.safeMoves[Math.floor(Math.random()*me.safeMoves.length)];
        } else {
          randomSafeMove = me.safeMoves[0];
        };
        if(me.safeMoves.length == 0){
          randomSafeMove = 'right';
        };
        return randomSafeMove;
    };

    me.deathMoves = checkForNeck();
    me.safeMoves = removeDeathMovesFromSafe();
    me.deathMoves = checkForWalls();
    me.safeMoves = removeDeathMovesFromSafe();
    me.deathMoves = checkForSelf();
    me.safeMoves = removeDeathMovesFromSafe();
    me.deathMoves = checkForSnakes();
    me.safeMoves = removeDeathMovesFromSafe();
    me.safeMoves = preferFoodIfClose();
    me.riskyMoves = addRiskyMoves();
    me.safeMoves = removeRiskyMoves();
    me.sauceMoves = checkForSauce();
    me.safeMoves = removeSauceMovesIfPossible();

    //check among safemoves for consequential safe moves
    //ie if left leads to 3 open moves and up or right only leads to one
    //choose left

    function lookAhead() {
      //console.log(`snakes: ${JSON.stringify(gameData.board.snakes)}`)
      let head = me.head;
      let leftPosition = {};
      let downPosition = {};
      let rightPosition = {};
      let upPosition = {};
      //let directions = [leftPosition, downPosition, rightPosition, upPosition];

      // left
      leftPosition.x = head.x - 1; 
      leftPosition.y = head.y;
      leftPosition.score = 0;

      // down
      downPosition.x = head.x;
      downPosition.y = head.y - 1;
      downPosition.score = 0;

      // right
      rightPosition.x = head.x + 1;
      rightPosition.y = head.y;
      rightPosition.score = 0;

      // up 
      upPosition.x = head.x;
      upPosition.y = head.y + 1;
      upPosition.score = 0;

      // look each direction from each available direction
      // check if destination square is free or occupied (snake)

      // from left



      function loopThroughAllSnakesCheckIfAtPosition(positionX, positionY){
        //console.log(`${positionX}, ${positionY}`)
        let snakes = gameData.board.snakes;
        //console.log(`${JSON.stringify(snakes)}`)
        for(let i = 0; i < snakes.length; i++){
          for(let j = 0; j < snakes[i].body.length; j++){
            //console.log(`body: ${snakes[i].body[j].x}, ${snakes[i].body[j].y}`)
            if((positionX == snakes[i].body[j].x) && (positionY == snakes[i].body[j].y)){
              //console.log(`snake found at ${positionX} ${positionY}`)
              return -100;
            }            
          }
        }
        return 1;
      };

      function checkIfPositionOutOfBounds(positionX, positionY) {
        if((positionX > 0) || (positionY > 0) || (positionX > gameW) || (positionY > gameH)){
          return -10;
        }
        return 1;
      }

      function checkIfPositionIsHazard(positionX, positionY) {
        let hazards = gameData.board.hazards;
        for(let i = 0; i < hazards.length; i++){
          if((positionX == hazards[i].x) && (positionY == hazards[i].y)){
            return -5;
          }
        }
        return 1;
      }

      leftPosition.score = lookAtNextPositionReturnScore(leftPosition);
      downPosition.score = lookAtNextPositionReturnScore(downPosition);
      rightPosition.score = lookAtNextPositionReturnScore(rightPosition);
      upPosition.score = lookAtNextPositionReturnScore(upPosition);

      function lookAtNextPositionReturnScore(nextPosition){
        //console.log(`head position: ${JSON.stringify(me.head)}`)
        //console.log(`looking at ${JSON.stringify(nextPosition)}`)
        //nextPosition.score = 0;
        nextPosition.lookLeft = {};
        nextPosition.lookDown = {};
        nextPosition.lookRight = {};
        nextPosition.lookUp = {};
        if(nextPosition != rightPosition){
          nextPosition.lookLeft.x = nextPosition.x - 1;
          nextPosition.lookLeft.y = nextPosition.y;
          nextPosition.score += checkIfPositionOutOfBounds(nextPosition.lookLeft.x, nextPosition.lookLeft.y)
          nextPosition.score += loopThroughAllSnakesCheckIfAtPosition(nextPosition.lookLeft.x, nextPosition.lookLeft.y);
          nextPosition.score += checkIfPositionIsHazard(nextPosition.lookLeft.x, nextPosition.lookLeft.y);
        }
        if(nextPosition != upPosition){
          nextPosition.lookDown.x = nextPosition.x;
          nextPosition.lookDown.y = nextPosition.y - 1;
          nextPosition.score += checkIfPositionOutOfBounds(nextPosition.lookDown.x, nextPosition.lookDown.y)
          nextPosition.score += loopThroughAllSnakesCheckIfAtPosition(nextPosition.lookDown.x, nextPosition.lookDown.y);
          nextPosition.score += checkIfPositionIsHazard(nextPosition.lookDown.x, nextPosition.lookDown.y);
        }
        if(nextPosition != leftPosition){
          nextPosition.lookRight.x = nextPosition.x + 1;
          nextPosition.lookRight.y = nextPosition.y;
          nextPosition.score += checkIfPositionOutOfBounds(nextPosition.lookRight.x, nextPosition.lookRight.y);
          nextPosition.score += loopThroughAllSnakesCheckIfAtPosition(nextPosition.lookRight.x, nextPosition.lookRight.y);
          nextPosition.score += checkIfPositionIsHazard(nextPosition.lookRight.x, nextPosition.lookRight.y);
        }
        if(nextPosition != downPosition){
          nextPosition.lookUp.x = nextPosition.x;
          nextPosition.lookUp.y = nextPosition.y + 1;
          nextPosition.score += checkIfPositionOutOfBounds(nextPosition.lookUp.x, nextPosition.lookUp.y);
          nextPosition.score += loopThroughAllSnakesCheckIfAtPosition(nextPosition.lookUp.x, nextPosition.lookUp.y);
          nextPosition.score += checkIfPositionIsHazard(nextPosition.lookUp.x, nextPosition.lookUp.y);
        }
        return nextPosition.score;
      };

      let unsortedScores = [{direction: 'left',   score: leftPosition.score}, 
                            {direction: 'down',   score: downPosition.score}, 
                            {direction: 'right',  score: rightPosition.score}, 
                            {direction: 'up',     score: upPosition.score}];
      
      function returnSortedScoresLowToHigh(unsortedArray){
        unsortedArray.sort(function (a, b) {
          return a.score - b.score;
        })
        return unsortedArray;
      }
    
      let sortedScores = returnSortedScoresLowToHigh(unsortedScores);
      return sortedScores;
    }

    me.lookAheadMoves = lookAhead();

    console.log(`current turn: ${gameData.turn}`);
    console.log(`looking ahead: ${JSON.stringify(me.lookAheadMoves)}`);
    console.log(`safe moves: ${JSON.stringify(me.safeMoves)}`);

    me.chosenMove = moveSelector(me.lookAheadMoves);

    console.log(`moving: ${me.chosenMove}`);
    response.status(200).send({

        move: me.chosenMove
    });
}

function handleEnd(request, response) {
    //let gameData = request.body;
    console.log(`END`);
    response.status(200).send('ok');
}
