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
        while (_) try {
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
var message = "Create or join a game";
var timer = turnlen;
var gameactive = false;
var playerid = "0";
var gameid = "0";
var board = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
statusDisplay.innerHTML = message;
//Handle game creation
function createGame() {
    return __awaiter(this, void 0, void 0, function () {
        var boardresult;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    //If button pressed while in game, end it SHOULDn't happen
                    if (gameactive) {
                        call(playerid, gameid, 0, "quit");
                        timerrunning = false;
                        gameactive = false;
                    }
                    if (!(playerid == "0")) return [3 /*break*/, 2];
                    return [4 /*yield*/, call(0, 0, 0, "generateplayerid")];
                case 1:
                    playerid = _a.sent();
                    _a.label = 2;
                case 2:
                    playerid = String(playerid);
                    return [4 /*yield*/, call(playerid, 0, 0, "generategameid")];
                case 3:
                    gameid = _a.sent();
                    gameid = String(gameid);
                    return [4 /*yield*/, call(playerid, gameid, 0, "createboard")];
                case 4:
                    boardresult = _a.sent();
                    //Check if creation failed
                    if (boardresult != "new game created")
                        statusDisplay.innerHTML = "Creation failed";
                    //Reset board
                    statusDisplay.innerHTML = "Joined game " + gameid;
                    timerrunning = false;
                    gameactive = true;
                    myturn = false;
                    timer = turnlen;
                    wipeboard();
                    changebuttons(true);
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
                    if (!(playerid == "0")) return [3 /*break*/, 2];
                    return [4 /*yield*/, call(0, 0, 0, "generateplayerid")];
                case 1:
                    playerid = _a.sent();
                    _a.label = 2;
                case 2:
                    playerid = String(playerid);
                    input = String(input);
                    return [4 /*yield*/, call(playerid, input, 0, "checkturn")];
                case 3:
                    gameexists = _a.sent();
                    if (gameexists[0] == -3) {
                        statusDisplay.innerHTML = "Game doesn't exist";
                        return [2 /*return*/];
                    }
                    //Join board
                    gameid = input;
                    return [4 /*yield*/, call(playerid, gameid, 0, "createboard")];
                case 4:
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
                    changebuttons(true);
                    waitloop();
                    return [2 /*return*/];
            }
        });
    });
}
//Handle quiting game 
function quitGame() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            timerrunning = false;
            call(playerid, gameid, 0, "quit");
            gameid = "0";
            changebuttons(false);
            wipeboard();
            document.getElementById("timer").style.display = "none";
            gameactive = false;
            return [2 /*return*/];
        });
    });
}
//Handle player move
function handleCellClick(clickedCellEvent) {
    return __awaiter(this, void 0, void 0, function () {
        var clickedCell, col, existresponse, moveresponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    //Don't do anything if either game hasn't started yet, or game just ended, or if not my turn
                    if (!gameactive || !myturn)
                        return [2 /*return*/];
                    clickedCell = clickedCellEvent.target;
                    col = parseInt(clickedCell.getAttribute('data-cell-index')) % 7;
                    timerrunning = false;
                    return [4 /*yield*/, call(playerid, gameid, 0, "checkturn")];
                case 1:
                    existresponse = _a.sent();
                    if (existresponse[0] == -3) {
                        gameactive = false;
                        statusDisplay.innerHTML = "Other player resigned";
                    }
                    return [4 /*yield*/, call(playerid, gameid, col, "move")];
                case 2:
                    moveresponse = _a.sent();
                    //Check if won
                    if (moveresponse[0] == "Game won") {
                        gameactive = false;
                        statusDisplay.innerHTML = "Game won!";
                        updateboard(moveresponse[2]);
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
                        //other player joined but hasn't moved yet (check is needed to prevent overflow from last game)
                        if (response[0] != -3) {
                            message = "Waiting for other player";
                            timerrunning = true;
                            document.getElementById("timer").style.display = "initial";
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
                                if (response[2] == playerid)
                                    statusDisplay.innerHTML = "Other player resigned";
                                else
                                    statusDisplay.innerHTML = "Game lost";
                            }
                        }
                        if (response[0] == -3) {
                            if (gameactive) {
                                gameactive = false;
                                statusDisplay.innerHTML = "Other player resigned";
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
var x = setInterval(function () {
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
            call(playerid, gameid, 0, "quit");
            statusDisplay.innerHTML = "Game lost";
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
function changebuttons(startinggame) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
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
                statusDisplay.innerHTML = "Create or join a game";
                message = "Create or join a game";
                document.getElementById("txtinput").value = "";
            }
            return [2 /*return*/];
        });
    });
}
//Greys out joingame button when nothing in input field
function enableButton() {
    document.getElementById('joingame').style.opacity = "1";
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
                return [4 /*yield*/, fetch('https://connect4api.stephenmistele.com/' + path, { method: "post", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } })];
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
document.querySelector('.txtinput').addEventListener('click', enableButton);
//# sourceMappingURL=script.js.map