import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import pandas as pd
import numpy as np
import random

dataframe = pd.read_csv('LOGS/measures/responseTime.csv', header=None)
# print(dataframe)

# tabla = [[1, 10], [2, 20], [3, 50], [4, 100], [5, 200]]
tabla = dataframe.as_matrix()
#
# lista = []
# for i in range(100):
#     for j in range(100):
#         lista.append([i, i*np.random.normal(i)])
#
# tabla = np.array(lista)





#dicc = {1: {nVeces: 2, suma: 19}, 2: {nVeces: 5, suma: 112},...}
dicc = {}
for fila in tabla[:]:
    if fila[0] not in dicc.keys():
        dicc[fila[0]] = {'nVeces': 1, 'suma': fila[1]}
    else:
        dicc[fila[0]]['nVeces'] += 1
        dicc[fila[0]]['suma'] += fila[1]

lista = []
for key in dicc.keys():
    lista.append([key, dicc[key]['suma'] / dicc[key]['nVeces'] ])
    print(f'nClients={key}, suma={dicc[key]["suma"]}, nVeces={dicc[key]["nVeces"]}')

print(lista)
tabla = np.matrix(lista)







fig = plt.figure()
ax = fig.add_subplot(111)

ax.plot(tabla[:, 0], tabla[:, 1], 'o-')



ax.set_xlabel('nClientes')
ax.set_ylabel('tRespuesta')
ax.set_title('RENDIMIENTO')

plt.show()
