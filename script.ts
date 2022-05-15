const statusDisplay = document.querySelector('.game--status');
//style ui better
//conditional rendering on join/create buttons, and add leave game button - ensure no glitchyness when spamming

const turnlen = 31
var myturn: boolean = false;
var timerrunning: boolean = false;
var message: string = "Create or join a game";
var timer = turnlen
var gameactive: boolean = false;
var playerid: string = "0";
var gameid: string = "0";
var red:string = "#e94040";
var yellow:string = "#e3c934";
var defaultcolor:string = "#a4b9b9";
var renderinput:boolean = false;
var board: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
statusDisplay.innerHTML = message

// Update the turn timer every 1 second
let x: number = setInterval(function () {
    if (!gameactive)
        timerrunning = false;
    if (timerrunning) {
        if (timer <= 0)
            timer++;
        timer--;
        statusDisplay.innerHTML = message + " " + timer

        if (timer <= 0 && myturn) {
            call(playerid, gameid, 0, "quit");
            statusDisplay.innerHTML = `Game lost`;
            gameactive = false;
        }
    }
}, 1000);

//Handle player move
async function handleCellClick(clickedCellEvent) {
    //Don't do anything if either game hasn't started yet, or game just ended, or if not my turn
    if (!gameactive || !myturn)
        return;

    //Parse column from click
    const clickedCell = clickedCellEvent.target;
    const clickedCellIndex = parseInt(clickedCell.getAttribute('data-cell-index'));
    let col: number = clickedCellIndex % 7;
    timerrunning = false;

    //Post move request to server
    let moveresponse = await call(playerid, gameid, col, "move");

    //Check if won
    if (moveresponse[0] == "Game won") {
        gameactive = false;
        statusDisplay.innerHTML = `Game won!`;
        updateboard(moveresponse[2]);
        return;
    }

    //Check if insert valid
    else if (moveresponse[0] == "Bad insert") {
        console.log("BABABAB")
        timerrunning = true;
        return;
    }

    //This shouldn't happen
    else if (moveresponse[0] == "Not your turn") {
        timerrunning = true;
        message = `Error`;
        return;
    }
    console.log("this is very bad");
    myturn = false;
    updateboard(moveresponse[2]);
    timer = turnlen;
    timerrunning = true;
    waitloop();
}

//Handles drawing the board
function updateboard(response) {
    board = [].concat(...response);
    console.log(typeof (board[1]))
    for (let i: number = 0; i < 42; i++) {
        if (board[i] != 0) {
            let item = document.getElementById(i.toString())
            console.log(board, playerid)
            if (board[i] == 1)
                item.style.backgroundColor = red;
            else
                item.style.backgroundColor = yellow;
        }
    }
}

async function waitloop() {
    //This will run when it is not your turn
    while (!myturn && gameactive) {
        //Wait 1 second
        await new Promise(resolve => setTimeout(resolve, 500));

        //Check if my turn
        let response = await call(playerid, gameid, 0, "checkturn");

        //No other player yet
        if (response[0] == -1)
            continue;

        message = `Waiting for other player`;
        timerrunning = true;

        //If updated board is returned, it's my turn
        if (response[0] == 1) {
            myturn = true;
            message = `Your move!`;
            timer = turnlen;
            updateboard(response[1]);
        }

        //If -2 is returned, game over
        if (response[0] == -2) {
            gameactive = false;
            updateboard(response[1]);
            if (response[2] == playerid)
                statusDisplay.innerHTML = `Game won!`;
            else
                statusDisplay.innerHTML = `Game lost`;
        }
        //Else not my turn, continue waiting
    }

}

//Resets the board
function wipeboard() {
    board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    let pieces: NodeListOf<Element> = document.querySelectorAll('.cell');
    for (let i: number = 0; i < 42; i++) {
        let item = document.getElementById(i.toString())
        item.style.backgroundColor = defaultcolor
    }
}

//Handle game creation
async function createGame() {
    //temp
    //document.getElementById("creategame").style.visibility = "hidden"
    //If button pressed while in game, end it
    if (gameactive) {
        call(playerid, gameid, 0, "quit");
        timerrunning = false;
        gameactive = false;
        myturn = false;
    }
    //Generate new game ID - and new player id IF playerid doesn't already exist
    if (playerid == "0")
        playerid = await call(0, 0, 0, "generateplayerid");
    playerid = String(playerid);
    gameid = await call(playerid, 0, 0, "generategameid");
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
    timer = turnlen;
    waitloop();
}

//Handle joining game
async function joinGame() {
    //Take in gameid input - and generate player id IF playerid doesn't already exist
    console.log("boutta do it")
    let input: string = (<HTMLInputElement>document.getElementById("txtInput")).value;
    console.log(input, "did it")

    //Check if missclick
    if (input == gameid || input == "")
        return;

    //if no playerid yet, make new one
    if (playerid == "0"){
        playerid = await call(0, 0, 0, "generateplayerid");
    }

    playerid = String(playerid);
    input = String(input);

    //Check if board already exists
    let gameexists = await call(playerid, input, 0, "checkturn")
    if (gameexists[0] == -3) {
        statusDisplay.innerHTML = `Game doesn't exist`;
        return;
    }

    //Join board
    gameid = input;
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
    timerrunning = true;
    message = `Your move!`;
    timer = turnlen;
    waitloop();
}

//Handle API calls
const call = async (playerid, gameid, col, path) => {
    const body = {
        "playerid": playerid,
        "gameid": gameid,
        "col": col,
    }
    //const res = await fetch('https://connect4-8fweza6ln-stephenmistele.vercel.app/' + path, { method: "post", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
    const res = await fetch('http://localhost:3000/' + path, { method: "post", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
    const json = await res.json();
    console.log(json[0].data)
    return json[0].data;
}

//Listeners
document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
document.querySelector('.creategame').addEventListener('click', createGame);
document.querySelector('.joingame').addEventListener('click', joinGame);