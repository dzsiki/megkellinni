import random

torpedosize = 10


def generateships():
    ships = []
    shots = []

    for x in range(torpedosize):
        ships.append([])
        shots.append([])
        for y in range(torpedosize):
            ships[x].append(0)
            shots[x].append(0)

    ship_list = [5, 4, 3, 2, 1]

    k = 0
    while k < len(ship_list):
        ship = ship_list[k]
        if random.randint(0, 1):
            x = random.randint(0, 9 - ship)
            y = random.randint(0, 9)

            for i in range(ship):
                if ships[x + i][y] > 0:
                    k -= 1
                    break
                if i == ship - 1:
                    for j in range(ship):
                        ships[x + j][y] = ship
        else:
            x = random.randint(0, 9)
            y = random.randint(0, 9 - ship)

            for i in range(ship):
                if ships[x][y + i] > 0:
                    k -= 1
                    break
                if i == ship - 1:
                    for j in range(ship):
                        ships[x][y + j] = ship
        k += 1
    return ships, shots

