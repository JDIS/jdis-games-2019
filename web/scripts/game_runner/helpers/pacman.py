import os
import logging
import helpers.directories as directories
import shutil
from subprocess import check_output

logger = logging.getLogger(__name__)


def play_game(bots):
    games_directory = directories.get_games_directory()
    tmp_directory = directories.get_base_directory() + 'tmp/'
    pacman_executable = directories.get_base_directory() + 'pacman/capture.py'

    players = []
    command = ["python3", pacman_executable, '-q', '--record', '-l', 'RANDOM0']
    ## TODO: record games to games_directory

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

    return rank, replay_id


def parse_game_output(output, players):
    lines = output.decode("utf-8").split('\n')
    rank = [None]*len(players)
    replay_id = ''

    for i in range(len(lines)):
        if i == len(players)+1:
            game_path = lines[i].split(' ')[0]
            replay_id = os.path.basename(game_path)

        elif len(players)+1 < i < 2*len(players)+2:
            player_id, position, last_round = lines[i].split(' ')
            rank[int(position)-1] = players[int(player_id)-1]

        elif i == 2*len(players)+3:
            error_files = lines[i].rstrip(' ').split()
            if error_files:
                errors_directory = directories.get_errors_directory(replay_id.split('.')[0])
                for file_path in error_files:
                    error_file_id = os.path.basename(file_path)
                    shutil.move(file_path, errors_directory + error_file_id)

    return rank, replay_id
