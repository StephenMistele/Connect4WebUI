const statusDisplay = document.querySelector('.game--status');
const red: string = "#d92739";
const yellow: string = "#F7EA14";
const defaultcolor: string = "#E1E0E0";
const turnlen: number = 31
var myturn: boolean = false;
var timerrunning: boolean = false;
var message: string = "";
var timer = turnlen
var gameactive: boolean = false;
var playerid: string = "0";
var gameid: string = "0";
var board: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
statusDisplay.innerHTML = message
// mainmenu, singleplayer, privatematch, gamelobby, waitinglobby, authenticate, preauthenticate, gameover
var gamestate: string = "preauthenticate";
var logginginscreen: boolean = true;
var loggedin = false;
var gameswon: number = 0;
var gamesplayed: number = 0;
var pinging: boolean = false;
var multiplayer: boolean = true;
var aiMovenumber: number = 0;
changebuttons();

//Handle game creation
async function createGame() {
    //Generate new game ID
    gameid = await call(playerid, 0, 0, "generategameid");
    gameid = String(gameid);

    //Create board
    let boardresult: string = await call(playerid, gameid, 0, "createboard");

    //Check if creation failed
    if (boardresult != "new game created")
        statusDisplay.innerHTML = `Creation failed`;

    //Reset board
    statusDisplay.innerHTML = `Your Game ID is: ` + gameid;
    timerrunning = false;
    gameactive = true;
    myturn = false;
    timer = turnlen;
    wipeboard();
    gamestate = "waitinglobby";
    changebuttons();
    waitloop();
}

//Handle joining game
async function joinGame() {
    //Take in gameid input - and generate player id IF playerid doesn't already exist
    let input: string = (<HTMLInputElement>document.getElementById("txtinput")).value;

    //Check if missclick
    if (input == gameid || input == "")
        return;

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
    gamestate = "gamelobby"
    changebuttons();
}

//Handle quiting game 
async function quitGame() {
    gamesplayed++;
    timerrunning = false;
    call(playerid, gameid, 1, "quit");
    gameid = "0"
    gamestate = "mainmenu"
    changebuttons();
    wipeboard()
    document.getElementById("timer").style.display = "none";
    gameactive = false;
}

//Handle player move
function handleCellClick(clickedCellEvent) {
    //Don't do anything if either game hasn't started yet, or game just ended, or if not my turn
    if (!gameactive || !myturn)
        return;

    //Parse column from click
    const clickedCell = clickedCellEvent.target;
    let col: number = parseInt(clickedCell.getAttribute('data-cell-index')) % 7;
    timerrunning = false;

    if (multiplayer)
        handleMultiplayerMove(col);
    else
        handleSingleplayerMove(col);
}

function getTopSlot(col: number) {
    if (board[col] != 0)
        return -1;
    for (let i: number = col; i < 43; i += 7)
        if (board[i + 7] != 0)
            return i;
    return 42 - 7 + col;
}

function getTopRow(col: number) {
    for (let i = 5; i >= 0; i--)
        if (board[i * 7 + col] == 0)
            return i;
    return -1;
}

function getTopEmptyRowInSplitBoard(board: number[][], col: number) {
    for (let i = 5; i >= 0; i--)
        if (board[i][col] == 0)
            return i;
    return -1;
}

function getSplitBoard(board: number[]) {
    let output = [];
    for (let i: number = 0; i < 6; i++) {
        let row = [];
        for (let j: number = 0; j < 7; j++) {
            row.push(board[i * 7 + j]);
        }
        output.push(row);
    }
    return output;
}

function getScore(board: number[][], player: number): number {
    const opponent = player === 1 ? 2 : 1;
    let score = 0;

    // Check horizontal
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[row].length - 3; col++) {
            const window = board[row].slice(col, col + 4);
            if (window.every((val) => val === player)) {
                score += 10000;
            } else if (window.every((val) => val === opponent)) {
                score -= 10000;
            } else if (window.filter((val) => val === player).length === 3 && window.includes(0)) {
                score += 100;
            } else if (window.filter((val) => val === opponent).length === 3 && window.includes(0)) {
                score -= 100;
            }
        }
    }

    // Check vertical
    for (let col = 0; col < board[0].length; col++) {
        for (let row = 0; row < board.length - 3; row++) {
            const window = [board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col]];
            if (window.every((val) => val === player)) {
                score += 10000;
            } else if (window.every((val) => val === opponent)) {
                score -= 10000;
            } else if (window.filter((val) => val === player).length === 3 && window.includes(0)) {
                score += 100;
            } else if (window.filter((val) => val === opponent).length === 3 && window.includes(0)) {
                score -= 100;
            }
        }
    }

    // Check diagonal (top-left to bottom-right)
    for (let row = 0; row < board.length - 3; row++) {
        for (let col = 0; col < board[row].length - 3; col++) {
            const window = [board[row][col], board[row + 1][col + 1], board[row + 2][col + 2], board[row + 3][col + 3]];
            if (window.every((val) => val === player)) {
                score += 10000;
            } else if (window.every((val) => val === opponent)) {
                score -= 10000;
            } else if (window.filter((val) => val === player).length === 3 && window.includes(0)) {
                score += 100;
            } else if (window.filter((val) => val === opponent).length === 3 && window.includes(0)) {
                score -= 100;
            }
        }
    }

    // Check diagonal (top-right to bottom-left)
    for (let row = 0; row < board.length - 3; row++) {
        for (let col = 3; col < board[row].length; col++) {
            const window = [board[row][col], board[row + 1][col - 1], board[row + 2][col - 2], board[row + 3][col - 3]];
            if (window.every((val) => val === player)) {
                score += 10000;
            } else if (window.every((val) => val === opponent)) {
                score -= 10000;
            } else if (window.filter((val) => val === player).length === 3 && window.includes(0)) {
                score += 100;
            } else if (window.filter((val) => val === opponent).length === 3 && window.includes(0)) {
                score -= 100;
            }
        }
    }

    return score;
}

function getAIMove(board: number[][]): number {
    const MAX_DEPTH = 4; // Maximum search depth for minimax algorithm
    const AI_PLAYER = 1; // Player ID for AI
    const HUMAN_PLAYER = 2; // Player ID for human
    let possibleMoves = getPossibleMoves(board);

    // Check if the AI can win in one move
    for (let i = 0; i < possibleMoves.length; i++) {
        let col = possibleMoves[i];
        let row = getTopEmptyRowInSplitBoard(board, col)
        if (board[row][col] === 0) {
            board[row][col] = 1; // Assume the AI player
            if (checkWin(1, col, row, board)) {
                board[row][col] = 0; // Reset the move
                return col; // Winning move
            }
            board[row][col] = 0; // Reset the move
        }
    }

    // Check if the human can win in one move and block it
    for (let i = 0; i < possibleMoves.length; i++) {
        let col = possibleMoves[i];
        let row = getTopEmptyRowInSplitBoard(board, col)
        if (board[row][col] === 0) {
            board[row][col] = 2; // Assume the human player
            if (checkWin(2, col, row, board)) {
                board[row][col] = 0; // Reset the move
                return col; // Block the winning move
            }
            board[row][col] = 0; // Reset the move
        }
    }

    // Returns a list of all possible moves for the current player on the board
    function getPossibleMoves(board: number[][]): number[] {
        const possibleMoves: number[] = [];
        for (let col = 0; col < board[0].length; col++) {
            if (board[0][col] == 0) {
                // Column is not full, so it's a valid move
                possibleMoves.push(col);
            }
        }
        return possibleMoves;
    }

    // Returns the best move for the given player using minimax algorithm with alpha-beta pruning
    function minimax(
        board: number[][],
        player: number,
        depth: number,
        alpha: number,
        beta: number
    ): number {
        let bestMove: number = possibleMoves[0];
        let bestScore: number = player === AI_PLAYER ? -Infinity : Infinity;

        if (depth === 0 || possibleMoves.length === 0) {
            return getScore(board, AI_PLAYER) - getScore(board, HUMAN_PLAYER);
        }

        for (let i = 0; i < possibleMoves.length; i++) {
            const col = possibleMoves[i];
            const row = getTopEmptyRowInSplitBoard(board, i);
            if (row == -1)
                continue;
            board[row][col] = player;
            const score = minimax(
                board,
                player === AI_PLAYER ? HUMAN_PLAYER : AI_PLAYER,
                depth - 1,
                alpha,
                beta
            );

            board[row][col] = 0;

            if (player === AI_PLAYER && score > bestScore) {
                bestMove = col;
                bestScore = score;
                alpha = Math.max(alpha, bestScore);
                if (beta <= alpha) {
                    break;
                }
            } else if (player === HUMAN_PLAYER && score < bestScore) {
                bestMove = col;
                bestScore = score;
                beta = Math.min(beta, bestScore);
                if (beta <= alpha) {
                    break;
                }
            }
        }

        if (depth === MAX_DEPTH) {
            return bestMove;
        } else {
            return bestScore;
        }
    }

    return minimax(board, AI_PLAYER, MAX_DEPTH, -Infinity, Infinity);
}

function waitForAIMove(slot: number) {
    let move;
    if (aiMovenumber == 0) {
        move = getTopSlot(3)
        let newboard = board;
        newboard[move] = 1;
        updateboard(newboard);
    }
    else if (aiMovenumber == 1) {
        if (slot == 39)
            move = getTopSlot(2);
        else
            move = getTopSlot(4);
        let newboard = board;
        newboard[move] = 1;
        updateboard(newboard);
    }
    else {
        let AIPlayedCol = getAIMove(getSplitBoard(board));
        move = getTopSlot(AIPlayedCol)
        let newboard = board;
        newboard[move] = 1;
        updateboard(newboard);

        //Check if won
        // console.log("checking for AI win", "col = ", AIPlayedCol, "row = ", getTopEmptyRowInSplitBoard(getSplitBoard(board), AIPlayedCol) + 1, board);
        if (checkWin(1, AIPlayedCol, getTopEmptyRowInSplitBoard(getSplitBoard(board), AIPlayedCol) + 1, getSplitBoard(board))) {
            gameactive = false;
            statusDisplay.innerHTML = `Game lost`;
            gamestate = "gameover"
            changebuttons();
            return;
        }
    }

    aiMovenumber++;
    //Wait for player move
    myturn = true;
    message = `Your move!`;
}

function handleSingleplayerMove(col: number) {
    let slot: number = getTopSlot(col);
    if (slot == -1)
        return;
    let newboard = board;
    newboard[slot] = 2;
    updateboard(newboard);

    //Check if won
    // console.log("checking for human win", "col = ", slot % 7, "row = ", getTopEmptyRowInSplitBoard(getSplitBoard(board), slot % 7) + 1, board);
    if (checkWin(2, slot % 7, getTopEmptyRowInSplitBoard(getSplitBoard(board), slot % 7) + 1, getSplitBoard(board))) {
        gameactive = false;
        statusDisplay.innerHTML = `Game won!`;
        gamestate = "gameover"
        changebuttons();
        return;
    }

    //Wait for AI
    myturn = false;
    waitForAIMove(slot);
}

async function handleMultiplayerMove(col: number) {
    //Check if other player already resigned
    let existresponse: any[] = await call(playerid, gameid, 0, "checkturn");
    if (existresponse[0] == -3) {
        gameactive = false;
        gamesplayed++;
        gameswon++;
        statusDisplay.innerHTML = `Other player resigned`;
        gamestate = "gameover"
        changebuttons();
    }

    //Post move request to server
    let moveresponse: any[] = await call(playerid, gameid, col, "move");

    //Check if won
    if (moveresponse[0] == "Game won") {
        gamesplayed++;
        gameswon++;
        gameactive = false;
        statusDisplay.innerHTML = `Game won!`;
        updateboard(moveresponse[2]);
        gamestate = "gameover"
        changebuttons();
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
            //other player hasn't moved yet
            if (response[0] != -3) {
                message = `Waiting for other player`;
                timerrunning = true;
                document.getElementById("timer").style.display = "initial";
                gamestate = "gamelobby";
                changebuttons();
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
                    gamestate = "gameover"
                    changebuttons();
                    if (response[2] == playerid) {
                        gamesplayed++;
                        gameswon++;
                        statusDisplay.innerHTML = `Other player resigned`;
                    }
                    else {
                        gamesplayed++;
                        statusDisplay.innerHTML = `Game lost`;
                        call(playerid, gameid, 0, "quit");
                    }
                }
            }

            if (response[0] == -3) {
                if (gameactive) {
                    gamesplayed++;
                    gameswon++;
                    gameactive = false;
                    statusDisplay.innerHTML = `Other player resigned`;
                    gamestate = "gameover"
                    changebuttons();
                }
            }
            //Else not my turn, continue waiting
        }
    }
}

// Update the turn timer every 1 second
setInterval(function () {
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
            gamesplayed++;
            call(playerid, gameid, 1, "quit");
            statusDisplay.innerHTML = `Game lost`;
            gamestate = "gameover";
            changebuttons();
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
async function changebuttons() {
    if (loggedin == true) {
        let winratio: number;
        if (gamesplayed != 0) {
            winratio = Math.floor(gameswon / gamesplayed * 100);
            (document.getElementById("winpercent")).innerHTML = "Win Rate: " + winratio + "%";
        }
        (document.getElementById("scores")).innerHTML = "Online Games Played: " + gamesplayed;
    }
    if (gamestate == "gameover") {
        document.getElementById("joingame").style.display = "none";
        document.getElementById("creategame").style.display = "none";
        document.getElementById("txtinput").style.display = "none";
        document.getElementById("quitgame").style.display = "none";
        document.getElementById("timer").style.display = "none";
        document.getElementById("singleplayer").style.display = "none";
        document.getElementById("matchmake").style.display = "none";
        document.getElementById("privatematch").style.display = "none";
        document.getElementById("mainmenu").style.display = "initial";
        document.getElementById("board").style.display = "flex";
        document.getElementById("login").style.display = "none";
        document.getElementById("createaccount").style.display = "none";
        document.getElementById("continueguest").style.display = "none";
        document.getElementById("usernameinput").style.display = "none";
        document.getElementById("passwordinput").style.display = "none";
        document.getElementById("authsubmit").style.display = "none";
        document.getElementById("back").style.display = "none";
    }
    if (gamestate == "preauthenticate") {
        document.getElementById("joingame").style.display = "none";
        document.getElementById("creategame").style.display = "none";
        document.getElementById("txtinput").style.display = "none";
        document.getElementById("quitgame").style.display = "none";
        document.getElementById("timer").style.display = "none";
        document.getElementById("singleplayer").style.display = "none";
        document.getElementById("matchmake").style.display = "none";
        document.getElementById("privatematch").style.display = "none";
        document.getElementById("mainmenu").style.display = "none";
        document.getElementById("board").style.display = "flex";
        document.getElementById("login").style.display = "initial";
        document.getElementById("createaccount").style.display = "initial";
        document.getElementById("continueguest").style.display = "initial";
        document.getElementById("usernameinput").style.display = "none";
        document.getElementById("passwordinput").style.display = "none";
        document.getElementById("authsubmit").style.display = "none";
        document.getElementById("back").style.display = "none";
        statusDisplay.innerHTML = `Login, Sign up, or Don't`;
        (<HTMLInputElement>document.getElementById("usernameinput")).value = "";
        (<HTMLInputElement>document.getElementById("passwordinput")).value = "";
    }
    else if (gamestate == "authenticate") {
        document.getElementById("joingame").style.display = "none";
        document.getElementById("creategame").style.display = "none";
        document.getElementById("txtinput").style.display = "none";
        document.getElementById("quitgame").style.display = "none";
        document.getElementById("timer").style.display = "none";
        document.getElementById("singleplayer").style.display = "none";
        document.getElementById("matchmake").style.display = "none";
        document.getElementById("privatematch").style.display = "none";
        document.getElementById("mainmenu").style.display = "none";
        document.getElementById("board").style.display = "flex";
        document.getElementById("login").style.display = "none";
        document.getElementById("createaccount").style.display = "none";
        document.getElementById("continueguest").style.display = "none";
        document.getElementById("usernameinput").style.display = "initial";
        document.getElementById("passwordinput").style.display = "initial";
        document.getElementById("authsubmit").style.display = "initial";
        document.getElementById("back").style.display = "initial";
        statusDisplay.innerHTML = `Enter a Username & Password`;
        (<HTMLInputElement>document.getElementById("usernameinput")).value = "";
        (<HTMLInputElement>document.getElementById("passwordinput")).value = "";
    }
    else if (gamestate == "waitinglobby") {
        document.getElementById("joingame").style.display = "none";
        document.getElementById("creategame").style.display = "none";
        document.getElementById("txtinput").style.display = "none";
        document.getElementById("quitgame").style.display = "none";
        document.getElementById("timer").style.display = "none";
        document.getElementById("singleplayer").style.display = "none";
        document.getElementById("matchmake").style.display = "none";
        document.getElementById("privatematch").style.display = "none";
        document.getElementById("mainmenu").style.display = "initial";
        document.getElementById("board").style.display = "flex";
        document.getElementById("login").style.display = "none";
        document.getElementById("createaccount").style.display = "none";
        document.getElementById("continueguest").style.display = "none";
        document.getElementById("usernameinput").style.display = "none";
        document.getElementById("passwordinput").style.display = "none";
        document.getElementById("authsubmit").style.display = "none";
        document.getElementById("back").style.display = "none";
    }
    else if (gamestate == "gamelobby") {
        document.getElementById("joingame").style.display = "none";
        document.getElementById("creategame").style.display = "none";
        document.getElementById("txtinput").style.display = "none";
        document.getElementById("quitgame").style.display = "initial";
        document.getElementById("timer").style.display = "initial";
        document.getElementById("singleplayer").style.display = "none";
        document.getElementById("matchmake").style.display = "none";
        document.getElementById("privatematch").style.display = "none";
        document.getElementById("mainmenu").style.display = "none";
        document.getElementById("board").style.display = "flex";
        document.getElementById("login").style.display = "none";
        document.getElementById("createaccount").style.display = "none";
        document.getElementById("continueguest").style.display = "none";
        document.getElementById("usernameinput").style.display = "none";
        document.getElementById("passwordinput").style.display = "none";
        document.getElementById("authsubmit").style.display = "none";
        document.getElementById("back").style.display = "none";
    }
    else if (gamestate == "mainmenu") {
        document.getElementById("joingame").style.display = "none";
        document.getElementById("creategame").style.display = "none";
        document.getElementById("txtinput").style.display = "none";
        document.getElementById("quitgame").style.display = "none";
        document.getElementById("timer").style.display = "none";
        document.getElementById("singleplayer").style.display = "initial";
        document.getElementById("matchmake").style.display = "initial";
        document.getElementById("privatematch").style.display = "initial";
        document.getElementById("mainmenu").style.display = "none";
        document.getElementById("board").style.display = "flex";
        document.getElementById("login").style.display = "none";
        document.getElementById("createaccount").style.display = "none";
        document.getElementById("continueguest").style.display = "none";
        document.getElementById("usernameinput").style.display = "none";
        document.getElementById("passwordinput").style.display = "none";
        document.getElementById("authsubmit").style.display = "none";
        document.getElementById("back").style.display = "none";
        statusDisplay.innerHTML = `Pick a Gamemode`;
    }
    else if (gamestate == "singleplayer") {
        document.getElementById("joingame").style.display = "none";
        document.getElementById("creategame").style.display = "none";
        document.getElementById("txtinput").style.display = "none";
        document.getElementById("quitgame").style.display = "none";
        document.getElementById("timer").style.display = "none";
        document.getElementById("singleplayer").style.display = "none";
        document.getElementById("matchmake").style.display = "none";
        document.getElementById("privatematch").style.display = "none";
        document.getElementById("mainmenu").style.display = "initial";
        document.getElementById("board").style.display = "flex";
        document.getElementById("login").style.display = "none";
        document.getElementById("createaccount").style.display = "none";
        document.getElementById("continueguest").style.display = "none";
        document.getElementById("usernameinput").style.display = "none";
        document.getElementById("passwordinput").style.display = "none";
        document.getElementById("authsubmit").style.display = "none";
        document.getElementById("back").style.display = "none";
        statusDisplay.innerHTML = `Your turn`;
    }
    else if (gamestate == "privatematch") {
        document.getElementById("joingame").style.display = "initial";
        document.getElementById("joingame").style.opacity = ".5";
        document.getElementById("creategame").style.display = "initial";
        document.getElementById("txtinput").style.display = "initial";
        document.getElementById("quitgame").style.display = "none";
        document.getElementById("timer").style.display = "none";
        document.getElementById("singleplayer").style.display = "none";
        document.getElementById("matchmake").style.display = "none";
        document.getElementById("privatematch").style.display = "none";
        document.getElementById("mainmenu").style.display = "initial";
        document.getElementById("board").style.display = "flex";
        document.getElementById("login").style.display = "none";
        document.getElementById("createaccount").style.display = "none";
        document.getElementById("continueguest").style.display = "none";
        document.getElementById("usernameinput").style.display = "none";
        document.getElementById("passwordinput").style.display = "none";
        document.getElementById("authsubmit").style.display = "none";
        document.getElementById("back").style.display = "none";
        statusDisplay.innerHTML = `Create or join a game`;
        message = `Create or join a game`;
        (<HTMLInputElement>document.getElementById("txtinput")).value = "";
    }
}

async function handleMatchmake() {
    gamestate = "waitinglobby";
    changebuttons();
    multiplayer = true;

    //Query server for matchmake
    let result: string[] = await call(playerid, 0, 0, "matchmake");
    let startgame: string = result[0];
    let successmessage: string = result[1];
    gameid = String(result[2]);

    if (!(successmessage == "game joined" || successmessage == "new game created")) {
        statusDisplay.innerHTML = `Matchmaking failed, try again`;
        return;
    }

    if (startgame == "0") {
        let concurrentPlayerCount = result[3]
        if (concurrentPlayerCount == "1")
            statusDisplay.innerHTML = `Searching for Players. No other players online`;
        else
            statusDisplay.innerHTML = `Searching for Players. ${concurrentPlayerCount} concurrent players`;
        timerrunning = false;
        gameactive = true;
        myturn = false;
        timer = turnlen;
        wipeboard();
        waitloop();
    }
    else {
        myturn = true;
        gameactive = true;
        timerrunning = true;
        timer = turnlen;
        document.getElementById("timer").style.display = "initial";
        wipeboard();
        gamestate = "gamelobby"
        changebuttons();
        statusDisplay.innerHTML = `Game Found! Your move!`;
        message = `Game Found. Your move!`;
    }
}

function handleSinglePlayer() {
    let testarr = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 2, 2, 2]
    ]
    gamestate = "singleplayer";
    changebuttons();
    multiplayer = false;
    gameactive = true;
    myturn = true;
    aiMovenumber = 0;
}

function handlePrivateMatch() {
    gamestate = "privatematch";
    changebuttons();
    multiplayer = true;
}

function mainMenu() {
    gamestate = "mainmenu";
    changebuttons();
    timerrunning = false;
    call(playerid, gameid, 0, "quit");
    call(playerid, gameid, 0, "dequeue");
    gameid = "0"
    wipeboard()
    document.getElementById("timer").style.display = "none";
    gameactive = false;
    myturn = false;
}

function handleLogin() {
    logginginscreen = true;
    gamestate = "authenticate";
    changebuttons();
}

function createAccount() {
    logginginscreen = false;
    gamestate = "authenticate";
    changebuttons();
}

async function continueGuest() {
    playerid = await call(0, 0, 0, "generateplayerid");
    playerid = String(playerid);
    pingServer();
    pinging = true;
    mainMenu();
}

async function back() {
    gamestate = "preauthenticate";
    changebuttons();
}

async function authSubmit() {
    let username: string = (<HTMLInputElement>document.getElementById("usernameinput")).value;
    let password: string = (<HTMLInputElement>document.getElementById("passwordinput")).value;
    if (username == "" || password == "")
        return;
    if (logginginscreen) {
        statusDisplay.innerHTML = `Logging in...`;
        let result = await call(username, password, 0, "login");
        if (result[0] != "1") {
            if (result[0] == "-3")
                statusDisplay.innerHTML = `Incorrect username/password`;
            else
                statusDisplay.innerHTML = `Something went wrong. Try again later`;
        }
        else {
            loggedin = true;
            playerid = result[1].playerid;
            gamesplayed = result[1].gamesplayed;
            gameswon = result[1].gameswon;
            gamestate = "mainmenu";
            changebuttons();
            pingServer();
            pinging = true;
            // console.log(playerid)
        }
    }
    else {
        statusDisplay.innerHTML = `Signing up...`;
        let result = await call(username, password, 0, "signup");
        if (result[0] != "1") {
            statusDisplay.innerHTML = `Username taken`;
        }
        else {
            loggedin = true;
            playerid = result[1]
            gamestate = "mainmenu";
            changebuttons();
            pingServer();
            pinging = true;
            // console.log(playerid)
        }
    }
}

//Pinging the server every 5 seconds prevents connection from timing out
async function pingServer() {
    if (!pinging) {
        while (true) {
            //every 5s...
            await new Promise(resolve => setTimeout(resolve, 5000));
            let connected: string = await call(playerid, 0, 0, "ping");
            if (connected == "disconnected") {
                statusDisplay.innerHTML = `Disconnected`;
                message = `Disconnected`
            }
        }
    }
}

//Handle API calls
const call = async (playerid, gameid, col, path) => {
    const body = {
        "playerid": playerid,
        "gameid": gameid,
        "col": col,
    }
    // console.log('http://localhost:3000/' + path)
    // const res: Response = await fetch('http://localhost:3000/' + path, { method: "post", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
    const res: Response = await fetch('159.89.145.75/' + path, { method: "post", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
    const json = await res.json();
    return json[0].data;
}

//Listeners
document.querySelectorAll('.cell').forEach(cell => cell.addEventListener('click', handleCellClick));
document.querySelector('.creategame').addEventListener('click', createGame);
document.querySelector('.joingame').addEventListener('click', joinGame);
document.querySelector('.quitgame').addEventListener('click', quitGame);
document.querySelector('.singleplayer').addEventListener('click', handleSinglePlayer);
document.querySelector('.matchmake').addEventListener('click', handleMatchmake);
document.querySelector('.privatematch').addEventListener('click', handlePrivateMatch);
document.querySelector('.mainmenu').addEventListener('click', mainMenu);
document.querySelector('.login').addEventListener('click', handleLogin);
document.querySelector('.createaccount').addEventListener('click', createAccount);
document.querySelector('.continueguest').addEventListener('click', continueGuest);
document.querySelector('.authsubmit').addEventListener('click', authSubmit);
document.querySelector('.back').addEventListener('click', back);

//un-greys out joingame button when input field selected
const txtInput = document.getElementById("txtinput") as HTMLInputElement;
txtInput.addEventListener("input", function () {
    const gameID = txtInput.value.trim();
    if (gameID.length >= 4) {
        document.getElementById('joingame').style.opacity = "1";
    } else {
        document.getElementById('joingame').style.opacity = ".5";
    }
});

//Given a board and the most recent piece played, checks if a win exists around that piece.
function checkWin(player: number, col: number, row: number, splitboard: number[][]) {
    if (row == -1)
        row = 0;
    //check if horizontal win on row of most recent piece played
    let count: number = 0;
    for (let i: number = 0; i < 7; i++) {
        if (splitboard[row][i] == player) {
            count += 1;
            if (count == 4)
                return true;
        }
        else
            count = 0;
    }
    //check if vertical win on col of most recent piece played
    count = 0;
    for (let i: number = 0; i < 6; i++) {
        if (splitboard[i][col] == player) {
            count += 1;
            if (count == 4)
                return true;
        }
        else
            count = 0;
    }

    //check if diagonal decreasing win on row/col of most recent piece played
    count = 0
    let tempcol: number = col;
    let temprow: number = row
    //start by moving cursor to top left most value on relevent diagonal
    while (temprow > 0 && tempcol > 0) {
        temprow -= 1;
        tempcol -= 1;
    }
    //move cursor down/right checking for win
    while (temprow < 6 && tempcol < 7) {
        if (splitboard[temprow][tempcol] == player) {
            count += 1
            if (count == 4)
                return true;
        }
        else
            count = 0;
        temprow += 1;
        tempcol += 1;
    }

    //check if diagonal increasing win on row/col of most recent piece played
    count = 0
    tempcol = col;
    temprow = row
    //start by moving cursor to top right most value on relevent diagonal
    while (temprow > 0 && tempcol < 6) {
        temprow -= 1;
        tempcol += 1;
    }
    //move cursor down/left checking for win
    while (temprow < 6 && tempcol >= 0) {
        if (splitboard[temprow][tempcol] == player) {
            count += 1
            if (count == 4)
                return true;
        }
        else
            count = 0;
        temprow += 1;
        tempcol -= 1;
    }
    return false
}
