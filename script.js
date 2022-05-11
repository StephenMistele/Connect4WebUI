const statusDisplay = document.querySelector('.game--status');
//fix win checking on diagonals
//style ui better
//make board circles with colors?
//make buttons hover mouse change
//implement expirations on old games/players
//implement timer on player turns

var myturn = false;
var playerid = "0";
var gameid = "0";
var board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
statusDisplay.innerHTML = `Create or join a game`;

//Handle player move
async function handleCellClick(clickedCellEvent) {
    //If click happens when not my turn, nothing happens
    if (!myturn) {
        statusDisplay.innerHTML = `Waiting for move`;
        return;
    }

    //Parse column from click
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));
    col = clickedCellIndex % 7;

    //Insert piece into col
    moveresponse = await call(playerid, gameid, col, "move");

    //Check if won
    if (moveresponse == "Game won") {
        statusDisplay.innerHTML = `Game won!`;
        updateboard(moveresponse[2]);
        return;
    }

    //Check if insert valid
    else if (moveresponse == "Bad insert")
        return;

    //This shouldn't happen
    else if (moveresponse == "Not your turn") {
        statusDisplay.innerHTML = `Error`;
        return;
    }
    myturn = false;
    updateboard(moveresponse[2]);
    waitloop();
}

//Handle game creation
async function createGame() {
    //Generate new player and game ID's
    playerid = await call(0, 0, 0, "generateplayerid");
    gameid = await call(0, 0, 0, "generategameid");
    playerid = String(playerid);
    gameid = String(gameid);

    //Create board
    let boardresult = await call(playerid, gameid, 0, "createboard");

    //Check if creation failed
    if (boardresult == "new game created")
        statusDisplay.innerHTML = `Game id is ` + gameid;
    else
        statusDisplay.innerHTML = `Creation failed`;

    //Reset board
    board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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
        if (response == -1)
            continue;
        statusDisplay.innerHTML = `Waiting for move`;

        //If updated board is returned, it's my turn
        if (Array.isArray(response)) {
            myturn = true;
            statusDisplay.innerHTML = `Your move!`;
            updateboard(response);
        }

        //If -2 is returned, I lost
        if (response == -2) {
            statusDisplay.innerHTML = `Game lost`;
            return;
        }
        //Else not my turn, continue waiting
    }
}

//Handle joining game
async function joinGame() {
    //Take in gameid input and generate player id
    gameid = document.getElementById("txtInput").value;
    if (isNaN(gameid)) {
        statusDisplay.innerHTML = `Enter a game id`;
        return;
    }
    playerid = await call(0, 0, 0, "generateplayerid");
    playerid = String(playerid);
    gameid = String(gameid);

    //Check if board already exists
    let gameexists = await call(playerid, gameid, 0, "checkturn")
    if (gameexists == -2) {
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
    else {
        statusDisplay.innerHTML = `Join failed`;
        return;
    }

    //Reset board
    board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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
    const res = await fetch('http://localhost:3000/' + path, { method: "post", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
    const json = await res.json();
    return json[0].data;
}

//Listeners
document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
document.querySelector('.creategame').addEventListener('click', createGame);
document.querySelector('.joingame').addEventListener('click', joinGame);