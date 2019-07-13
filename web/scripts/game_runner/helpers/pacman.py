import os
import logging
import helpers.directories as directories
import shutil
import numpy as np
import asyncio
import json

logger = logging.getLogger(__name__)

def safe_move(src, dest):
    try:
        shutil.move(src, dest)
    except IOError as e:
        os.makedirs(os.path.dirname(dest))
        shutil.move(src, dest)

async def play_game(bots):
    games_directory = directories.get_games_directory()
    tmp_directory = directories.get_base_directory() + 'tmp/'
    pacman_cwd = directories.get_base_directory() + 'pacman/'

    players = []
    command = ["python3", "-m", "pacman.capture", '-Q', '-c', '--record', '-l', 'RANDOM']

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
        command.append(str(botId))
        players.append(botId)

    logger.info("Running command: {}".format(str(command)))

    proc = await asyncio.create_subprocess_exec(
        *command,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
        cwd=pacman_cwd)
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise Exception("Subprocess ran with errors: " + stderr.decode())
    else:
        rank, replay_id = parse_game_output(stdout, players)

    safe_move(f"{pacman_cwd}{replay_id}", f"{games_directory}{replay_id}")

    return rank, replay_id


def parse_game_output(output, players):
    lines = output.decode("utf-8").split('\n')
    replay_id = None
    for l in lines:
        if "replay" in l:
            replay_id = l
    if replay_id is None:
        raise "Game output does not contain a replay id"
    pacman_cwd = directories.get_base_directory() + 'pacman/'
    replay_file = f"{pacman_cwd}{replay_id}.klvr"
    with open(replay_file) as json_file:  
        data = json.load(json_file)
        if 'score' in data:
            score = int(float(data['score'])*100)/100
            ranks = players if score > 0 else players[::-1]
            return ranks, replay_id + '.klvr'
    raise "Replay file couldn't be loaded"
