var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var statusDisplay = document.querySelector('.game--status');
var red = "#d92739";
var yellow = "#F7EA14";
var defaultcolor = "#E1E0E0";
var turnlen = 31;
var myturn = false;
var timerrunning = false;
var message = "";
var timer = turnlen;
var gameactive = false;
var playerid = "0";
var gameid = "0";
var board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
statusDisplay.innerHTML = message;
// mainmenu, singleplayer, privatematch, gamelobby, waitinglobby, authenticate, preauthenticate, gameover
var gamestate = "preauthenticate";
var logginginscreen = true;
var loggedin = false;
var gameswon = 0;
var gamesplayed = 0;
var pinging = false;
var multiplayer = true;
var aiMovenumber = 0;
changebuttons();
//Handle game creation
function createGame() {
    return __awaiter(this, void 0, void 0, function () {
        var boardresult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, call(playerid, 0, 0, "generategameid")];
                case 1:
                    //Generate new game ID
                    gameid = _a.sent();
                    gameid = String(gameid);
                    return [4 /*yield*/, call(playerid, gameid, 0, "createboard")];
                case 2:
                    boardresult = _a.sent();
                    //Check if creation failed
                    if (boardresult != "new game created")
                        statusDisplay.innerHTML = "Creation failed";
                    //Reset board
                    statusDisplay.innerHTML = "Your Game ID is: " + gameid;
                    timerrunning = false;
                    gameactive = true;
                    myturn = false;
                    timer = turnlen;
                    wipeboard();
                    gamestate = "waitinglobby";
                    changebuttons();
                    waitloop();
                    return [2 /*return*/];
            }
        });
    });
}
//Handle joining game
function joinGame() {
    return __awaiter(this, void 0, void 0, function () {
        var input, gameexists, boardresult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    input = document.getElementById("txtinput").value;
                    //Check if missclick
                    if (input == gameid || input == "")
                        return [2 /*return*/];
                    playerid = String(playerid);
                    input = String(input);
                    return [4 /*yield*/, call(playerid, input, 0, "checkturn")];
                case 1:
                    gameexists = _a.sent();
                    if (gameexists[0] == -3) {
                        statusDisplay.innerHTML = "Game doesn't exist";
                        return [2 /*return*/];
                    }
                    //Join board
                    gameid = input;
                    return [4 /*yield*/, call(playerid, gameid, 0, "createboard")];
                case 2:
                    boardresult = _a.sent();
                    //Handle if board join failed
                    if (boardresult == "game joined")
                        myturn = true;
                    else if (boardresult == "game full") {
                        statusDisplay.innerHTML = "Game full";
                        return [2 /*return*/];
                    }
                    else if (boardresult == "already in game") {
                        return [2 /*return*/];
                    }
                    else {
                        statusDisplay.innerHTML = "Join failed";
                        return [2 /*return*/];
                    }
                    //Reset board
                    message = "Your move!";
                    gameactive = true;
                    timerrunning = true;
                    timer = turnlen;
                    document.getElementById("timer").style.display = "initial";
                    wipeboard();
                    gamestate = "gamelobby";
                    changebuttons();
                    return [2 /*return*/];
            }
        });
    });
}
//Handle quiting game 
function quitGame() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            gamesplayed++;
            timerrunning = false;
            call(playerid, gameid, 1, "quit");
            gameid = "0";
            gamestate = "mainmenu";
            changebuttons();
            wipeboard();
            document.getElementById("timer").style.display = "none";
            gameactive = false;
            return [2 /*return*/];
        });
    });
}
//Handle player move
function handleCellClick(clickedCellEvent) {
    //Don't do anything if either game hasn't started yet, or game just ended, or if not my turn
    if (!gameactive || !myturn)
        return;
    //Parse column from click
    var clickedCell = clickedCellEvent.target;
    var col = parseInt(clickedCell.getAttribute('data-cell-index')) % 7;
    timerrunning = false;
    if (multiplayer)
        handleMultiplayerMove(col);
    else
        handleSingleplayerMove(col);
}
function getTopSlot(col) {
    if (board[col] != 0)
        return -1;
    for (var i = col; i < 43; i += 7)
        if (board[i + 7] != 0)
            return i;
    return 42 - 7 + col;
}
function getTopRow(col) {
    for (var i = 5; i >= 0; i--)
        if (board[i * 7 + col] == 0)
            return i;
    return -1;
}
function getTopEmptyRowInSplitBoard(board, col) {
    for (var i = 5; i >= 0; i--)
        if (board[i][col] == 0)
            return i;
    return -1;
}
function getSplitBoard(board) {
    var output = [];
    for (var i = 0; i < 6; i++) {
        var row = [];
        for (var j = 0; j < 7; j++) {
            row.push(board[i * 7 + j]);
        }
        output.push(row);
    }
    return output;
}
function getScore(board, player) {
    var opponent = player === 1 ? 2 : 1;
    var score = 0;
    // Check horizontal
    for (var row = 0; row < board.length; row++) {
        for (var col = 0; col < board[row].length - 3; col++) {
            var window_1 = board[row].slice(col, col + 4);
            if (window_1.every(function (val) { return val === player; })) {
                score += 10000;
            }
            else if (window_1.every(function (val) { return val === opponent; })) {
                score -= 10000;
            }
            else if (window_1.filter(function (val) { return val === player; }).length === 3 && window_1.includes(0)) {
                score += 100;
            }
            else if (window_1.filter(function (val) { return val === opponent; }).length === 3 && window_1.includes(0)) {
                score -= 100;
            }
        }
    }
    // Check vertical
    for (var col = 0; col < board[0].length; col++) {
        for (var row = 0; row < board.length - 3; row++) {
            var window_2 = [board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col]];
            if (window_2.every(function (val) { return val === player; })) {
                score += 10000;
            }
            else if (window_2.every(function (val) { return val === opponent; })) {
                score -= 10000;
            }
            else if (window_2.filter(function (val) { return val === player; }).length === 3 && window_2.includes(0)) {
                score += 100;
            }
            else if (window_2.filter(function (val) { return val === opponent; }).length === 3 && window_2.includes(0)) {
                score -= 100;
            }
        }
    }
    // Check diagonal (top-left to bottom-right)
    for (var row = 0; row < board.length - 3; row++) {
        for (var col = 0; col < board[row].length - 3; col++) {
            var window_3 = [board[row][col], board[row + 1][col + 1], board[row + 2][col + 2], board[row + 3][col + 3]];
            if (window_3.every(function (val) { return val === player; })) {
                score += 10000;
            }
            else if (window_3.every(function (val) { return val === opponent; })) {
                score -= 10000;
            }
            else if (window_3.filter(function (val) { return val === player; }).length === 3 && window_3.includes(0)) {
                score += 100;
            }
            else if (window_3.filter(function (val) { return val === opponent; }).length === 3 && window_3.includes(0)) {
                score -= 100;
            }
        }
    }
    // Check diagonal (top-right to bottom-left)
    for (var row = 0; row < board.length - 3; row++) {
        for (var col = 3; col < board[row].length; col++) {
            var window_4 = [board[row][col], board[row + 1][col - 1], board[row + 2][col - 2], board[row + 3][col - 3]];
            if (window_4.every(function (val) { return val === player; })) {
                score += 10000;
            }
            else if (window_4.every(function (val) { return val === opponent; })) {
                score -= 10000;
            }
            else if (window_4.filter(function (val) { return val === player; }).length === 3 && window_4.includes(0)) {
                score += 100;
            }
            else if (window_4.filter(function (val) { return val === opponent; }).length === 3 && window_4.includes(0)) {
                score -= 100;
            }
        }
    }
    return score;
}
function getAIMove(board) {
    var MAX_DEPTH = 4; // Maximum search depth for minimax algorithm
    var AI_PLAYER = 1; // Player ID for AI
    var HUMAN_PLAYER = 2; // Player ID for human
    var possibleMoves = getPossibleMoves(board);
    // Check if the AI can win in one move
    for (var i = 0; i < possibleMoves.length; i++) {
        var col = possibleMoves[i];
        var row = getTopEmptyRowInSplitBoard(board, col);
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
    for (var i = 0; i < possibleMoves.length; i++) {
        var col = possibleMoves[i];
        var row = getTopEmptyRowInSplitBoard(board, col);
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
    function getPossibleMoves(board) {
        var possibleMoves = [];
        for (var col = 0; col < board[0].length; col++) {
            if (board[0][col] == 0) {
                // Column is not full, so it's a valid move
                possibleMoves.push(col);
            }
        }
        return possibleMoves;
    }
    // Returns the best move for the given player using minimax algorithm with alpha-beta pruning
    function minimax(board, player, depth, alpha, beta) {
        var bestMove = possibleMoves[0];
        var bestScore = player === AI_PLAYER ? -Infinity : Infinity;
        if (depth === 0 || possibleMoves.length === 0) {
            return getScore(board, AI_PLAYER) - getScore(board, HUMAN_PLAYER);
        }
        for (var i = 0; i < possibleMoves.length; i++) {
            var col = possibleMoves[i];
            var row = getTopEmptyRowInSplitBoard(board, i);
            if (row == -1)
                continue;
            board[row][col] = player;
            var score = minimax(board, player === AI_PLAYER ? HUMAN_PLAYER : AI_PLAYER, depth - 1, alpha, beta);
            board[row][col] = 0;
            if (player === AI_PLAYER && score > bestScore) {
                bestMove = col;
                bestScore = score;
                alpha = Math.max(alpha, bestScore);
                if (beta <= alpha) {
                    break;
                }
            }
            else if (player === HUMAN_PLAYER && score < bestScore) {
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
        }
        else {
            return bestScore;
        }
    }
    return minimax(board, AI_PLAYER, MAX_DEPTH, -Infinity, Infinity);
}
function waitForAIMove(slot) {
    var move;
    if (aiMovenumber == 0) {
        move = getTopSlot(3);
        var newboard = board;
        newboard[move] = 1;
        updateboard(newboard);
    }
    else if (aiMovenumber == 1) {
        if (slot == 39)
            move = getTopSlot(2);
        else
            move = getTopSlot(4);
        var newboard = board;
        newboard[move] = 1;
        updateboard(newboard);
    }
    else {
        var AIPlayedCol = getAIMove(getSplitBoard(board));
        move = getTopSlot(AIPlayedCol);
        var newboard = board;
        newboard[move] = 1;
        updateboard(newboard);
        //Check if won
        // console.log("checking for AI win", "col = ", AIPlayedCol, "row = ", getTopEmptyRowInSplitBoard(getSplitBoard(board), AIPlayedCol) + 1, board);
        if (checkWin(1, AIPlayedCol, getTopEmptyRowInSplitBoard(getSplitBoard(board), AIPlayedCol) + 1, getSplitBoard(board))) {
            gameactive = false;
            statusDisplay.innerHTML = "Game lost";
            gamestate = "gameover";
            changebuttons();
            return;
        }
    }
    aiMovenumber++;
    //Wait for player move
    myturn = true;
    message = "Your move!";
}
function handleSingleplayerMove(col) {
    var slot = getTopSlot(col);
    if (slot == -1)
        return;
    var newboard = board;
    newboard[slot] = 2;
    updateboard(newboard);
    //Check if won
    // console.log("checking for human win", "col = ", slot % 7, "row = ", getTopEmptyRowInSplitBoard(getSplitBoard(board), slot % 7) + 1, board);
    if (checkWin(2, slot % 7, getTopEmptyRowInSplitBoard(getSplitBoard(board), slot % 7) + 1, getSplitBoard(board))) {
        gameactive = false;
        statusDisplay.innerHTML = "Game won!";
        gamestate = "gameover";
        changebuttons();
        return;
    }
    //Wait for AI
    myturn = false;
    waitForAIMove(slot);
}
function handleMultiplayerMove(col) {
    return __awaiter(this, void 0, void 0, function () {
        var existresponse, moveresponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, call(playerid, gameid, 0, "checkturn")];
                case 1:
                    existresponse = _a.sent();
                    if (existresponse[0] == -3) {
                        gameactive = false;
                        gamesplayed++;
                        gameswon++;
                        statusDisplay.innerHTML = "Other player resigned";
                        gamestate = "gameover";
                        changebuttons();
                    }
                    return [4 /*yield*/, call(playerid, gameid, col, "move")];
                case 2:
                    moveresponse = _a.sent();
                    //Check if won
                    if (moveresponse[0] == "Game won") {
                        gamesplayed++;
                        gameswon++;
                        gameactive = false;
                        statusDisplay.innerHTML = "Game won!";
                        updateboard(moveresponse[2]);
                        gamestate = "gameover";
                        changebuttons();
                        return [2 /*return*/];
                    }
                    //Check if insert valid
                    else if (moveresponse[0] == "Bad insert") {
                        timerrunning = true;
                        return [2 /*return*/];
                    }
                    //This shouldn't happen
                    else if (moveresponse[0] == "Not your turn") {
                        timerrunning = true;
                        message = "Error";
                        return [2 /*return*/];
                    }
                    //Valid move, clean up and wait
                    myturn = false;
                    updateboard(moveresponse[2]);
                    timer = turnlen;
                    timerrunning = true;
                    waitloop();
                    return [2 /*return*/];
            }
        });
    });
}
//This will run when it is not your turn
function waitloop() {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(!myturn && gameactive)) return [3 /*break*/, 3];
                    //Wait half a second
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500); })];
                case 1:
                    //Wait half a second
                    _a.sent();
                    return [4 /*yield*/, call(playerid, gameid, 0, "checkturn")];
                case 2:
                    response = _a.sent();
                    //Other player in game, display waiting for their move -- else keep displaying gameid
                    if (response[0] != -1) {
                        //other player hasn't moved yet
                        if (response[0] != -3) {
                            message = "Waiting for other player";
                            timerrunning = true;
                            document.getElementById("timer").style.display = "initial";
                            gamestate = "gamelobby";
                            changebuttons();
                        }
                        //If updated board is returned, it's my turn
                        if (response[0] == 1) {
                            myturn = true;
                            message = "Your move!";
                            timer = turnlen;
                            updateboard(response[1]);
                        }
                        //If -2 is returned, game over
                        if (response[0] == -2) {
                            if (gameactive) {
                                gameactive = false;
                                updateboard(response[1]);
                                gamestate = "gameover";
                                changebuttons();
                                if (response[2] == playerid) {
                                    gamesplayed++;
                                    gameswon++;
                                    statusDisplay.innerHTML = "Other player resigned";
                                }
                                else {
                                    gamesplayed++;
                                    statusDisplay.innerHTML = "Game lost";
                                    call(playerid, gameid, 0, "quit");
                                }
                            }
                        }
                        if (response[0] == -3) {
                            if (gameactive) {
                                gamesplayed++;
                                gameswon++;
                                gameactive = false;
                                statusDisplay.innerHTML = "Other player resigned";
                                gamestate = "gameover";
                                changebuttons();
                            }
                        }
                        //Else not my turn, continue waiting
                    }
                    return [3 /*break*/, 0];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Update the turn timer every 1 second
setInterval(function () {
    if (!gameactive) {
        document.getElementById("timer").style.display = "none";
        timerrunning = false;
    }
    if (timerrunning) {
        if (timer <= 0)
            timer++;
        timer--;
        document.getElementById("timer").innerHTML = "Time Left: " + timer;
        statusDisplay.innerHTML = message;
        if (timer <= 0 && myturn) {
            gamesplayed++;
            call(playerid, gameid, 1, "quit");
            statusDisplay.innerHTML = "Game lost";
            gamestate = "gameover";
            changebuttons();
            gameactive = false;
        }
    }
}, 1000);
//Handles drawing the board
function updateboard(response) {
    var newboard = [].concat.apply([], response);
    for (var i = 0; i < 42; i++) {
        var item = document.getElementById(i.toString());
        if (newboard[i] != board[i])
            item.innerHTML = "X";
        else
            item.innerHTML = "";
        if (newboard[i] != 0) {
            if (newboard[i] == 1)
                item.style.backgroundColor = red;
            else
                item.style.backgroundColor = yellow;
        }
    }
    board = newboard;
}
//Resets the board
function wipeboard() {
    board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    updateboard(board);
    for (var i = 0; i < 42; i++) {
        var item = document.getElementById(i.toString());
        item.style.backgroundColor = defaultcolor;
    }
}
//When game joined/left, handle the changes to html elements
function changebuttons() {
    return __awaiter(this, void 0, void 0, function () {
        var winratio;
        return __generator(this, function (_a) {
            if (loggedin == true) {
                winratio = void 0;
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
                statusDisplay.innerHTML = "Login, Sign up, or Don't";
                document.getElementById("usernameinput").value = "";
                document.getElementById("passwordinput").value = "";
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
                statusDisplay.innerHTML = "Enter a Username & Password";
                document.getElementById("usernameinput").value = "";
                document.getElementById("passwordinput").value = "";
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
                statusDisplay.innerHTML = "Pick a Gamemode";
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
                statusDisplay.innerHTML = "Your turn";
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
                statusDisplay.innerHTML = "Create or join a game";
                message = "Create or join a game";
                document.getElementById("txtinput").value = "";
            }
            return [2 /*return*/];
        });
    });
}
function handleMatchmake() {
    return __awaiter(this, void 0, void 0, function () {
        var result, startgame, successmessage, concurrentPlayerCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    gamestate = "waitinglobby";
                    changebuttons();
                    multiplayer = true;
                    return [4 /*yield*/, call(playerid, 0, 0, "matchmake")];
                case 1:
                    result = _a.sent();
                    startgame = result[0];
                    successmessage = result[1];
                    gameid = String(result[2]);
                    if (!(successmessage == "game joined" || successmessage == "new game created")) {
                        statusDisplay.innerHTML = "Matchmaking failed, try again";
                        return [2 /*return*/];
                    }
                    if (startgame == "0") {
                        concurrentPlayerCount = result[3];
                        if (concurrentPlayerCount == "1")
                            statusDisplay.innerHTML = "Searching for Players. No other players online";
                        else
                            statusDisplay.innerHTML = "Searching for Players. ".concat(concurrentPlayerCount, " concurrent players");
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
                        gamestate = "gamelobby";
                        changebuttons();
                        statusDisplay.innerHTML = "Game Found! Your move!";
                        message = "Game Found. Your move!";
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function handleSinglePlayer() {
    var testarr = [
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 0, 0, 0],
        [1, 0, 0, 0, 2, 2, 2]
    ];
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
    gameid = "0";
    wipeboard();
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
function continueGuest() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, call(0, 0, 0, "generateplayerid")];
                case 1:
                    playerid = _a.sent();
                    playerid = String(playerid);
                    pingServer();
                    pinging = true;
                    mainMenu();
                    return [2 /*return*/];
            }
        });
    });
}
function back() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            gamestate = "preauthenticate";
            changebuttons();
            return [2 /*return*/];
        });
    });
}
function authSubmit() {
    return __awaiter(this, void 0, void 0, function () {
        var username, password, result, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    username = document.getElementById("usernameinput").value;
                    password = document.getElementById("passwordinput").value;
                    if (username == "" || password == "")
                        return [2 /*return*/];
                    if (!logginginscreen) return [3 /*break*/, 2];
                    statusDisplay.innerHTML = "Logging in...";
                    return [4 /*yield*/, call(username, password, 0, "login")];
                case 1:
                    result = _a.sent();
                    if (result[0] != "1") {
                        if (result[0] == "-3")
                            statusDisplay.innerHTML = "Incorrect username/password";
                        else
                            statusDisplay.innerHTML = "Something went wrong. Try again later";
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
                    return [3 /*break*/, 4];
                case 2:
                    statusDisplay.innerHTML = "Signing up...";
                    return [4 /*yield*/, call(username, password, 0, "signup")];
                case 3:
                    result = _a.sent();
                    if (result[0] != "1") {
                        statusDisplay.innerHTML = "Username taken";
                    }
                    else {
                        loggedin = true;
                        playerid = result[1];
                        gamestate = "mainmenu";
                        changebuttons();
                        pingServer();
                        pinging = true;
                        // console.log(playerid)
                    }
                    _a.label = 4;
                case 4: return [2 /*return*/];
            }
        });
    });
}
//Pinging the server every 5 seconds prevents connection from timing out
function pingServer() {
    return __awaiter(this, void 0, void 0, function () {
        var connected;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!pinging) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 4];
                    //every 5s...
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                case 2:
                    //every 5s...
                    _a.sent();
                    return [4 /*yield*/, call(playerid, 0, 0, "ping")];
                case 3:
                    connected = _a.sent();
                    if (connected == "disconnected") {
                        statusDisplay.innerHTML = "Disconnected";
                        message = "Disconnected";
                    }
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    });
}
//Handle API calls
var call = function (playerid, gameid, col, path) { return __awaiter(_this, void 0, void 0, function () {
    var body, res, json;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                body = {
                    "playerid": playerid,
                    "gameid": gameid,
                    "col": col,
                };
                return [4 /*yield*/, fetch('159.89.145.75/' + path, { method: "post", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } })];
            case 1:
                res = _a.sent();
                return [4 /*yield*/, res.json()];
            case 2:
                json = _a.sent();
                return [2 /*return*/, json[0].data];
        }
    });
}); };
//Listeners
document.querySelectorAll('.cell').forEach(function (cell) { return cell.addEventListener('click', handleCellClick); });
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
var txtInput = document.getElementById("txtinput");
txtInput.addEventListener("input", function () {
    var gameID = txtInput.value.trim();
    if (gameID.length >= 4) {
        document.getElementById('joingame').style.opacity = "1";
    }
    else {
        document.getElementById('joingame').style.opacity = ".5";
    }
});
//Given a board and the most recent piece played, checks if a win exists around that piece.
function checkWin(player, col, row, splitboard) {
    if (row == -1)
        row = 0;
    //check if horizontal win on row of most recent piece played
    var count = 0;
    for (var i = 0; i < 7; i++) {
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
    for (var i = 0; i < 6; i++) {
        if (splitboard[i][col] == player) {
            count += 1;
            if (count == 4)
                return true;
        }
        else
            count = 0;
    }
    //check if diagonal decreasing win on row/col of most recent piece played
    count = 0;
    var tempcol = col;
    var temprow = row;
    //start by moving cursor to top left most value on relevent diagonal
    while (temprow > 0 && tempcol > 0) {
        temprow -= 1;
        tempcol -= 1;
    }
    //move cursor down/right checking for win
    while (temprow < 6 && tempcol < 7) {
        if (splitboard[temprow][tempcol] == player) {
            count += 1;
            if (count == 4)
                return true;
        }
        else
            count = 0;
        temprow += 1;
        tempcol += 1;
    }
    //check if diagonal increasing win on row/col of most recent piece played
    count = 0;
    tempcol = col;
    temprow = row;
    //start by moving cursor to top right most value on relevent diagonal
    while (temprow > 0 && tempcol < 6) {
        temprow -= 1;
        tempcol += 1;
    }
    //move cursor down/left checking for win
    while (temprow < 6 && tempcol >= 0) {
        if (splitboard[temprow][tempcol] == player) {
            count += 1;
            if (count == 4)
                return true;
        }
        else
            count = 0;
        temprow += 1;
        tempcol -= 1;
    }
    return false;
}
//# sourceMappingURL=script.js.map