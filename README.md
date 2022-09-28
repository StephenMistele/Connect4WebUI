# Connect4WebUI

This repo contains the code for a static webpage. There aren't any frameworks used, so you should be able to run this site locally by simply opening the index.html file in your browser, WITHOUT using any commands like NPM install. 

By default, this program points to an API hosted at connect4api.stephenmistele.com, so you wouldn't need to spin up the API yourself unless you wanted to run everything locally. If you do want to host everything yourself, go into script.ts, scroll to the bottom to the function 'call', and then swap the line performing the 'fetch' for the commented line next to it. Then clone the API repo at https://github.com/StephenMistele/Connect4Web, follow the instructions to run it, and you should be good to go.

Gameplay should be pretty self-explanitory. Game codes similar to kahoot, move by clicking a piece/column