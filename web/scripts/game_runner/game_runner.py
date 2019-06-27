import os
import time
import sys
import logging
import helpers.database as database
import helpers.bots_handler as bots_handler
import helpers.halite as halite
import helpers.pacman as pacman

logging.basicConfig(stream=sys.stdout, level=logging.INFO, format='%(asctime)s %(name)-20s %(levelname)-8s %(message)s')
logger = logging.getLogger(__name__)
running = True

game_backend = halite if os.getenv('HALITE') else pacman

def main():
    i = 59
    while running:
        i = i + 1
        if i == 60:
            logger.info("Polling new games")
        try:
            games_ready = database.get_all_ready_games()
            for game in games_ready:
                teams = [game.team0, game.team1]
                teams = teams[0:game.max_players]
                rank = [0]*len(teams)
                replay_id = -1
                for i in range(3):
                    try:
                        bots = bots_handler.prepare_bots(teams)
                        logger.info("Playing game: {}".format(game.id))
                        rank, replay_id = game_backend.play_game(bots)
                        break
                    except Exception as e:
                        logger.error("Failed to play game %s", e)
                        logger.exception(e)
                
                database.update_played_game(game, rank, replay_id)
        except Exception as e:
            logger.error("Failed to fetch games %s", e)
            logger.exception(e)

        if i == 60:
            logger.info("Finished processing games")
            i = 0
        time.sleep(1)

if __name__ == "__main__":
    main()
