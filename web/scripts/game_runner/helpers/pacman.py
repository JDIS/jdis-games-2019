import os
import logging
import helpers.directories as directories
import shutil
import numpy as np
from subprocess import check_output

logger = logging.getLogger(__name__)

def safe_move(src, dest):
    try:
        shutil.move(src, dest)
    except IOError as e:
        os.makedirs(os.path.dirname(dest))
        shutil.move(src, dest)

def play_game(bots):
    games_directory = directories.get_games_directory()
    tmp_directory = directories.get_base_directory() + 'tmp/'
    pacman_cwd = directories.get_base_directory() + 'pacman/'

    players = []
    command = ["python3", "-m", "pacman.capture", '-q', '--record', '-l', 'RANDOM0']

    teamColors = ["-r", "-b"]
    teamNames = ["--red-name", "--blue-name"]

    for i, (botId, data) in enumerate(bots.items()):
        bot_path = data['path'] + "/MyBot.py"
        if not os.path.exists(bot_path):
            logger.error('MyBot.py not found')
            raise Exception('MyBot.py not found')
        command.append(teamColors[i])
        command.append(bot_path)
        command.append(teamNames[i])
        command.append("Team #" + str(botId))
        players.append(botId)

    logger.info("Running command: {}".format(str(command)))
    output = check_output(command, cwd=pacman_cwd)
    rank, replay_id = parse_game_output(output, players)

    safe_move(f"{pacman_cwd}{replay_id}", f"{games_directory}{replay_id}")

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

    return ranks.tolist(), replay_id + '.klvr'
