#!/usr/bin/env python3
import argparse
from pacman.capture import *
import pacman.captureGraphicsDisplay as captureGraphicsDisplay
import pacman.layout as layout

def parse_args():
    parser = argparse.ArgumentParser(description="Helper file to run a bot")
    parser.add_argument("--redBot", type=str, help='Module name of the red bot', default="MyBot")
    parser.add_argument("--blueBot", type=str, help='Module name of the blue bot', default="MyBot")
    parser.add_argument("--layout", type=str, help='Name of the layout (in the layouts directory or "random"', default="random")
    parser.add_argument("--numGames", type=int, help='Number of games to be played', default=1)
    return parser.parse_args()

if __name__ == '__main__':
    args = parse_args()
    lay = layout.Layout(randomLayout().split('\n')) if args.layout == "random" else layout.getLayout(args.layout)
    redBot = __import__(args.redBot).createTeam
    blueBot = __import__(args.blueBot).createTeam

    display = captureGraphicsDisplay.PacmanGraphics("Red", "Blue", 1, 0, capture=True)
    agents = sum([list(el) for el in zip(redBot(0, 2, True), blueBot(1, 3, False))],[])

    options = {
        'layouts': [lay] * args.numGames,
        'agents': agents,
        'display': display,
        'length': 1000,
        'numGames': args.numGames,
        'record': True,
        'numTraining': 0,
        'redTeamName': 'My team',
        'blueTeamName': 'Bot #1',
        'muteAgents': False,
        'catchExceptions': False 
    }
    games = runGames(**options)
    print('Score: %d' % games[0].state.data.score)

     