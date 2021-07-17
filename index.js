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


function handleIndex(request, response) {
  let battlesnakeInfo = {
    apiversion: '1',
    author: 'uncleBlobby',
    color: '#123456',
    head: 'default',
    tail: 'default'
  }
  response.status(200).json(battlesnakeInfo)
}

function handleStart(request, response) {
  let gameData = request.body

  console.log('START')
  console.log(`live updated`)
  response.status(200).send('ok')
}

function handleMove(request, response) {
  let gameData = request.body

  let possibleMoves = ['up', 'down', 'left', 'right']
  let move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)]

  console.log('MOVE: ' + move)
  response.status(200).send({
    move: move
  })
}

function handleEnd(request, response) {
  let gameData = request.body

  console.log('END')
  response.status(200).send('ok')
}
