const fetch = require("node-fetch");
const prompt = require('prompt-sync')();

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

function print(board){
  console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n");
  for (let i = 0; i < 6; i++){
    let s = "";
    s += board[i];
    console.log(s, "\n");
  }
}

async function main() {
  let board = [[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0],[0,0,0,0,0,0,0]];
  let myturn = false;
  let input = 0;
  let gameid = 10;
  let playerid = await call(0, 0, 0, "generateplayerid")
  // gameid = await call(0, 0, 0, "generategameid")
  // console.log(gameid)
  let boardresult = await call(playerid, gameid, 0, "createboard");
  if (boardresult == "game joined")
  myturn = true;
  else if (boardresult == "game full") {
    console.log("bad join");
    return;
  }
  
  print(board)
  while (input != -1){
    if (myturn == true){
      input = prompt('Choose a col between 1 and 7 to move \n');
      chosenCol = Number(input) - 1;
      temp = await call(playerid, gameid, chosenCol, "move");
      board = temp[2];
      print(board);
      if (temp == "Game won"){
        console.log("Game won!")
        return;
      }
      myturn = false;
    }
    else {
      await new Promise(resolve => setTimeout(resolve, 1000));
      temp = await call(playerid, gameid, 0, "checkturn");
      if (Array.isArray(temp)){
        board = temp
        myturn = true;
      }
      print(board)
      if (temp == -1){
        console.log("Game lost")
        return;
      }
    }
  }
}
main();