const statusDisplay = document.querySelector('.game--status');
//fix win checking on diagonals
//style ui better
//make board circles with colors?
//implement expirations on old games/players - instead tie gameid's to playerid, only let each player own 1 gameid - can signal quitting
//implement timer on player turns

var myturn = false;
var gameactive = false;
var playerid = "0";
var gameid = "0";
var board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
statusDisplay.innerHTML = `Create or join a game`;

//Handle player move
async function handleCellClick(clickedCellEvent) {
    //Don't do anything if either game hasn't started yet, or game just ended
    if (!gameactive)
        return;

    //If click happens when not my turn, nothing happens
    if (!myturn) {
        statusDisplay.innerHTML = `Waiting for other player`;
        return;
    }

    //Parse column from click
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));
    col = clickedCellIndex % 7;

    //Insert piece into col
    moveresponse = await call(playerid, gameid, col, "move");

    //Check if won
    if (moveresponse[0] == "Game won") {
        gameactive = false;
        statusDisplay.innerHTML = `Game won!`;
        updateboard(moveresponse[2]);
        return;
    }

    //Check if insert valid
    else if (moveresponse[0] == "Bad insert")
        return;

    //This shouldn't happen
    else if (moveresponse[0] == "Not your turn") {
        statusDisplay.innerHTML = `Error`;
        return;
    }
    myturn = false;
    updateboard(moveresponse[2]);
    waitloop();
}

//Handles drawing the board
function updateboard(response) {
    board = [].concat(...response);
    let pieces = document.querySelectorAll('.cell');
    for (let i = 0; i < pieces.length; i++) {
        if (board[i] != 0)
            pieces[i].innerHTML = board[i];
    }
}

async function waitloop() {
    //This will run when it is not your turn
    while (!myturn) {
        //Wait 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));

        //Check if my turn
        response = await call(playerid, gameid, 0, "checkturn");

        //No other player yet
        if (response[0] == -1)
            continue;

        statusDisplay.innerHTML = `Waiting for other player`;

        //If updated board is returned, it's my turn
        if (response[0] == 1) {
            myturn = true;
            statusDisplay.innerHTML = `Your move!`;
            updateboard(response[1]);
        }

        //If -2 is returned, I lost
        if (response[0] == -2) {
            statusDisplay.innerHTML = `Game lost`;
            gameactive = false
            updateboard(response[1]);
            return;
        }
        //Else not my turn, continue waiting
    }
}

//Resets the board
function wipeboard() {
    board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let pieces = document.querySelectorAll('.cell');
    for (let i = 0; i < pieces.length; i++)
        pieces[i].innerHTML = "";
}

//Handle game creation
async function createGame() {
    //Generate new game ID - and new player id IF playerid doesn't already exist
    if (playerid == "0")
    playerid = await call(0, 0, 0, "generateplayerid");
    console.log(playerid)
    gameid = await call(0, 0, 0, "generategameid");
    playerid = String(playerid);
    gameid = String(gameid);
    
    //Create board
    let boardresult = await call(playerid, gameid, 0, "createboard");
    
    //Check if creation failed
    if (boardresult == "new game created")
    statusDisplay.innerHTML = `Game ID is ` + gameid;
    else
        statusDisplay.innerHTML = `Creation failed`;

    //Reset board
    wipeboard();
    gameactive = true;
    waitloop();
}

//Handle joining game
async function joinGame() {
    //Take in gameid input - and generate player id IF playerid doesn't already exist
    gameid = document.getElementById("txtInput").value;
    if (isNaN(gameid) || gameid == "") {
        statusDisplay.innerHTML = `Enter a game id`;
        return;
    }
    if (playerid == "0")
        playerid = await call(0, 0, 0, "generateplayerid");
    console.log(playerid)
    playerid = String(playerid);
    gameid = String(gameid);

    //Check if board already exists
    let gameexists = await call(playerid, gameid, 0, "checkturn")
    if (gameexists[0] == -3) {
        statusDisplay.innerHTML = `Game doesn't exist`;
        return;
    }

    //Join board
    let boardresult = await call(playerid, gameid, 0, "createboard");

    //Handle if board join failed
    if (boardresult == "game joined")
        myturn = true;
    else if (boardresult == "game full") {
        statusDisplay.innerHTML = `Game full`;
        return;
    }
    else if (boardresult == "already in game") {
        return;
    }
    else {
        statusDisplay.innerHTML = `Join failed`;
        return;
    }

    //Reset board
    wipeboard();
    gameactive = true;
    statusDisplay.innerHTML = `Your move!`;
    waitloop();
}

//Handle API calls
const call = async (playerid, gameid, col, path) => {
    const body = {
        "playerid": playerid,
        "gameid": gameid,
        "col": col,
    }
    const res = await fetch('https://connect4-8fweza6ln-stephenmistele.vercel.app/' + path, { method: "post", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
    const json = await res.json();
    console.log(json[0].data)
    return json[0].data;
}

//Listeners
document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
document.querySelector('.creategame').addEventListener('click', createGame);
document.querySelector('.joingame').addEventListener('click', joinGame);