# Connect4WebUI

This repo contains the code for a static webpage. There aren't any frameworks used, so you should be able to run this site locally by simply opening the index.html file in your browser. Note that the typescript aspect of this project requires a typescript compiler if you want to make changes. Try 'npm install', and then set up a tsc watch. 

By default, this program points to an API hosted at connect4api.stephenmistele.com, so you wouldn't need to spin up the API yourself unless you wanted to run everything locally. If you do want to host everything yourself, go into script.ts, scroll to the bottom to the function 'call', and then swap the line performing the 'fetch' for the commented line next to it. Then clone the API repo at https://github.com/StephenMistele/Connect4Web, follow the instructions to run it, and you should be good to go.

Gameplay should be pretty self-explanitory. Game codes similar to kahoot, move by clicking a piece/column


Deployment notes for myself:
log in to godaddy: https://host.godaddy.com/plesk/account/
enter the plesk admin
scroll to connect4.stephenmistele.com, then use the file manager tool to delete and replace the relevant files. Changes should be reflected immediately.