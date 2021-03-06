const statusDisplay = document.querySelector('.game--status');
const red: string = "#d92739";
const yellow: string = "#F7EA14";
const defaultcolor: string = "#E1E0E0";
const turnlen: number = 31
var myturn: boolean = false;
var timerrunning: boolean = false;
var message: string = "Create or join a game";
var timer = turnlen
var gameactive: boolean = false;
var playerid: string = "0";
var gameid: string = "0";
var board: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
statusDisplay.innerHTML = message

//Handle game creation
async function createGame() {
    //If button pressed while in game, end it SHOULDn't happen
    if (gameactive) {
        call(playerid, gameid, 0, "quit");
        timerrunning = false;
        gameactive = false;
    }
    //Generate new game ID - and new player id IF playerid doesn't already exist
    if (playerid == "0")
        playerid = await call(0, 0, 0, "generateplayerid");
    playerid = String(playerid);
    gameid = await call(playerid, 0, 0, "generategameid");
    gameid = String(gameid);

    //Create board
    let boardresult: string = await call(playerid, gameid, 0, "createboard");

    //Check if creation failed
    if (boardresult != "new game created")
        statusDisplay.innerHTML = `Creation failed`;

    //Reset board
    statusDisplay.innerHTML = `Joined game ` + gameid;
    timerrunning = false;
    gameactive = true;
    myturn = false;
    timer = turnlen;
    wipeboard();
    changebuttons(true);
    waitloop();
}

//Handle joining game
async function joinGame() {
    //Take in gameid input - and generate player id IF playerid doesn't already exist
    let input: string = (<HTMLInputElement>document.getElementById("txtinput")).value;

    //Check if missclick
    if (input == gameid || input == "")
        return;

    //if no playerid yet, make new one
    if (playerid == "0") {
        playerid = await call(0, 0, 0, "generateplayerid");
    }

    playerid = String(playerid);
    input = String(input);

    //Check if board already exists
    let gameexists: any[] = await call(playerid, input, 0, "checkturn")
    if (gameexists[0] == -3) {
        statusDisplay.innerHTML = `Game doesn't exist`;
        return;
    }

    //Join board
    gameid = input;
    let boardresult: string = await call(playerid, gameid, 0, "createboard");

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
    message = `Your move!`;
    gameactive = true;
    timerrunning = true;
    timer = turnlen;
    document.getElementById("timer").style.display = "initial";
    wipeboard();
    changebuttons(true);
    waitloop();
}

//Handle quiting game 
async function quitGame() {
    timerrunning = false;
    call(playerid, gameid, 0, "quit");
    gameid = "0"
    changebuttons(false);
    wipeboard()
    document.getElementById("timer").style.display = "none";
    gameactive = false;
}

//Handle player move
async function handleCellClick(clickedCellEvent) {
    //Don't do anything if either game hasn't started yet, or game just ended, or if not my turn
    if (!gameactive || !myturn)
        return;

    //Parse column from click
    const clickedCell = clickedCellEvent.target;
    let col: number = parseInt(clickedCell.getAttribute('data-cell-index')) % 7;
    timerrunning = false;

    //Check if other player already resigned
    let existresponse: any[] = await call(playerid, gameid, 0, "checkturn");
    if (existresponse[0] == -3) {
        gameactive = false;
        statusDisplay.innerHTML = `Other player resigned`;
    }

    //Post move request to server
    let moveresponse: any[] = await call(playerid, gameid, col, "move");

    //Check if won
    if (moveresponse[0] == "Game won") {
        gameactive = false;
        statusDisplay.innerHTML = `Game won!`;
        updateboard(moveresponse[2]);
        return;
    }

    //Check if insert valid
    else if (moveresponse[0] == "Bad insert") {
        timerrunning = true;
        return;
    }

    //This shouldn't happen
    else if (moveresponse[0] == "Not your turn") {
        timerrunning = true;
        message = `Error`;
        return;
    }
    //Valid move, clean up and wait
    myturn = false;
    updateboard(moveresponse[2]);
    timer = turnlen;
    timerrunning = true;
    waitloop();
}

//This will run when it is not your turn
async function waitloop() {
    while (!myturn && gameactive) {
        //Wait half a second
        await new Promise(resolve => setTimeout(resolve, 500));

        //Check if my turn
        let response: any[] = await call(playerid, gameid, 0, "checkturn");

        //Other player in game, display waiting for their move -- else keep displaying gameid
        if (response[0] != -1) {
            //other player joined but hasn't moved yet (check is needed to prevent overflow from last game)
            if (response[0] != -3) {
                message = `Waiting for other player`;
                timerrunning = true;
                document.getElementById("timer").style.display = "initial";
            }

            //If updated board is returned, it's my turn
            if (response[0] == 1) {
                myturn = true;
                message = `Your move!`;
                timer = turnlen;
                updateboard(response[1]);
            }

            //If -2 is returned, game over
            if (response[0] == -2) {
                if (gameactive) {
                    gameactive = false;
                    updateboard(response[1]);
                    if (response[2] == playerid)
                        statusDisplay.innerHTML = `Other player resigned`;
                    else
                        statusDisplay.innerHTML = `Game lost`;
                }
            }

            if (response[0] == -3) {
                if (gameactive) {
                    gameactive = false;
                    statusDisplay.innerHTML = `Other player resigned`;
                }
            }
            //Else not my turn, continue waiting
        }
    }
}

// Update the turn timer every 1 second
let x: number = setInterval(function () {
    if (!gameactive) {
        document.getElementById("timer").style.display = "none"
        timerrunning = false;
    }
    if (timerrunning) {
        if (timer <= 0)
            timer++;
        timer--;
        document.getElementById("timer").innerHTML = "Time Left: " + timer
        statusDisplay.innerHTML = message
        if (timer <= 0 && myturn) {
            call(playerid, gameid, 0, "quit");
            statusDisplay.innerHTML = `Game lost`;
            gameactive = false;
        }
    }
}, 1000);

//Handles drawing the board
function updateboard(response) {
    let newboard: number[] = [].concat(...response);
    for (let i: number = 0; i < 42; i++) {
        let item: HTMLElement = document.getElementById(i.toString())
            if (newboard[i] != board[i])
                item.innerHTML = "X"
            else
                item.innerHTML = ""
        if (newboard[i] != 0) {
            if (newboard[i] == 1)
                item.style.backgroundColor = red;
            else
                item.style.backgroundColor = yellow;
        }
    }
    board = newboard
}

//Resets the board
function wipeboard() {
    board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    updateboard(board)
    for (let i: number = 0; i < 42; i++) {
        let item = document.getElementById(i.toString())
        item.style.backgroundColor = defaultcolor
    }
}

//When game joined/left, handle the changes to html elements
async function changebuttons(startinggame: boolean) {
    //Joining game, hide join/create buttons and input field, and show quit game button
    if (startinggame) {
        document.getElementById("joingame").style.display = "none";
        document.getElementById("creategame").style.display = "none";
        document.getElementById("txtinput").style.display = "none";
        document.getElementById("quitgame").style.display = "initial";
    }
    //Ending game, reverse earlier changes ^ and reset game status text
    else {
        document.getElementById("joingame").style.display = "initial";
        document.getElementById("joingame").style.opacity = ".5";
        document.getElementById("creategame").style.display = "initial";
        document.getElementById("txtinput").style.display = "initial";
        document.getElementById("quitgame").style.display = "none";
        document.getElementById("timer").style.display = "none";
        statusDisplay.innerHTML = `Create or join a game`;
        message = `Create or join a game`;
        (<HTMLInputElement>document.getElementById("txtinput")).value = "";
    }
}

//Greys out joingame button when nothing in input field
function enableButton() {
    document.getElementById('joingame').style.opacity = "1";
}

//Handle API calls
const call = async (playerid, gameid, col, path) => {
    const body = {
        "playerid": playerid,
        "gameid": gameid,
        "col": col,
    }
    // const res: Response = await fetch('http://localhost:3000/' + path, { method: "post", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
    const res: Response = await fetch('https://connect4api.stephenmistele.com/' + path, { method: "post", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
    const json = await res.json();
    return json[0].data;
}

//Listeners
document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
document.querySelector('.creategame').addEventListener('click', createGame);
document.querySelector('.joingame').addEventListener('click', joinGame);
document.querySelector('.quitgame').addEventListener('click', quitGame);
document.querySelector('.txtinput').addEventListener('click', enableButton);