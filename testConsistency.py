# -*- coding: utf-8 -*-

class fg:
    black = '\033[30m'
    red = '\033[31m'
    green = '\033[32m'
    orange = '\033[33m'
    blue = '\033[34m'
    purple = '\033[35m'
    cyan = '\033[36m'
    lightgrey = '\033[37m'
    darkgrey = '\033[90m'
    lightred = '\033[91m'
    lightgreen = '\033[92m'
    yellow = '\033[93m'
    lightblue = '\033[94m'
    pink = '\033[95m'
    lightcyan = '\033[96m'

reset='\033[0m'

class bg:
    black = '\033[40m'
    red = '\033[41m'
    green = '\033[42m'
    orange = '\033[43m'
    blue = '\033[44m'
    purple = '\033[45m'
    cyan = '\033[46m'
    lightgrey = '\033[47m'

listaTextoFicheros = []
for i in range(1, 10000):
    try:
        texto = open(f'LOGS/logworker{i}.txt').read()
        listaTextoFicheros.append(texto)
    except Exception as e:
        print(e)
        break

nFicheros = len(listaTextoFicheros)
print(f'Nº de ficheros de log: {nFicheros}')

for a in listaTextoFicheros:
    print(len(a))

print()

ordenados = sorted(listaTextoFicheros, key=len, reverse=True)
for a in ordenados:
    print(len(a))

lineas = []
for i in range(nFicheros):
    lineas.append(ordenados[i].split())

col_width = max(len(word) for row in lineas for word in row) + 2  # padding

for i in range(len(lineas[-1])):
    print(f'{i}: ', end='')
    for j in range(nFicheros):
        if j==0:
            print(f'{lineas[j][i].ljust(col_width)}\t', end='')
        elif lineas[j][i] == lineas[0][i]:
            # print(f'{bg.green}{lineas[j][i]}\t{reset}', end='')
            print(f'{bg.green}{lineas[j][i].ljust(col_width)}{reset}\t', end='')
        else:
            # print(f'{bg.red}{lineas[j][i]}\t{reset}', end='')
            print(f'{bg.red}{lineas[j][i].ljust(col_width)}{reset}\t', end='')
            raise AssertionError('Hay una inconsistencia en los ficheros')
    print()
print(fg.green + 'Se cumple la consistencia' + reset)




