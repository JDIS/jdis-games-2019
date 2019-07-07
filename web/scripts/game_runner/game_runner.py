import os
import time
import sys
import logging
import helpers.database as database
import helpers.bots_handler as bots_handler
import helpers.pacman as game_backend
import asyncio

logging.basicConfig(stream=sys.stdout, level=logging.INFO, format='%(asctime)s %(name)-20s %(levelname)-8s %(message)s')
logger = logging.getLogger(__name__)
running = True

async def run_game(game):
    teams = [game.team0, game.team1]
    rank = [0]*len(teams)
    replay_id = -1
    for i in range(3):
        try:
            bots = bots_handler.prepare_bots(teams)
            logger.info("Playing game: {}".format(game.id))
            rank, replay_id = await game_backend.play_game(bots)
            break
        except Exception as e:
            logger.error("Failed to play game %s", e)
            logger.exception(e)
        finally:
            database.update_played_game(game, rank, replay_id)

def main():
    i = 59
    while running:
        i = i + 1
        if i == 60:
            logger.info("Polling new games")

        games_ready = False
        try:
            games_ready = database.get_all_ready_games()
        except Exception as e:
            logger.error("Failed to fetch games")
            logger.exception(e)

        try:
            if games_ready:
                loop = asyncio.get_event_loop()
                tasks = [asyncio.ensure_future(run_game(game)) for game in games_ready]
                loop.run_until_complete(asyncio.gather(*tasks))
                bots_handler.cleanup()
        except Exception as e:
            logger.error("Failed to spawn games")
            logger.exception(e)

        if i == 60:
            logger.info("Finished processing games")
            i = 0
        time.sleep(1)

if __name__ == "__main__":
    main()
