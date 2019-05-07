#!/usr/bin/env python3
from pacman.capture import *
import pacman.captureGraphicsDisplay as captureGraphicsDisplay
from bots import baselineTeam
import pacman.layout as layout
import MyBot

if __name__ == '__main__':
    display = captureGraphicsDisplay.PacmanGraphics("Red", "Blue", 1, 0, capture=True)
    agents = sum([list(el) for el in zip(MyBot.createTeam(0, 2, True), baselineTeam.createTeam(1, 3, False))],[])

    options = {
        'layouts': [layout.Layout(randomLayout().split('\n'))], # for fixed layout: layout.getLayout("defaultCapture")
        'agents': agents,
        'display': display,
        'length': 1000,
        'numGames': 1,
        'record': True,
        'numTraining': 0,
        'redTeamName': 'My team',
        'blueTeamName': 'Bot #1',
        'muteAgents': False,
        'catchExceptions': False 
    }
    games = runGames(**options)
    print('Score: %d' % games[0].state.data.score)

     