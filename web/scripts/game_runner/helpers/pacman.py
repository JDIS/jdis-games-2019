import os
import logging
import helpers.directories as directories
import shutil
import numpy as np
from subprocess import check_output

logger = logging.getLogger(__name__)


def play_game(bots):
    games_directory = directories.get_games_directory()
    tmp_directory = directories.get_base_directory() + 'tmp/'
    pacman_executable = directories.get_base_directory() + 'pacman/capture.py'

    players = []
    command = ["python3", pacman_executable, '-q', '--record', '-l', 'RANDOM0']

    teamColors = ["-r", "-b"]
    teamNames = ["--red-name", "--blue-name"]

    for i, (botId, data) in enumerate(bots.items()):
        command.append(teamColors[i])
        command.append(data['path'] + "/MyBot.py")
        command.append(teamNames[i])
        command.append("Team #" + str(botId))
        players.append(botId)

    logger.info("Running command: {}".format(str(command)))
    output = check_output(command)
    rank, replay_id = parse_game_output(output, players)

    shutil.move(f"{directories.get_base_directory()}{replay_id}.klvr", f"{games_directory}{replay_id}.klvr")

    return rank, replay_id


def parse_game_output(output, players):
    lines = output.decode("utf-8").split('\n')
    scores = [0]*len(players)
    replay_id = ''
    # TODO: Eventually we'd like to keep track of who started
    starting_team = lines[0]
    score = int(lines[1])
    replay_id = lines[2]
    if score < 0:
        scores[1] = abs(score)
    elif score > 0:
        scores[0] = abs(score)
    indices = np.argsort(scores).tolist()
    players = np.array(players)
    ranks = players[indices]

    return ranks.tolist(), replay_id
