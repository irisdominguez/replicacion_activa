# -*- coding: utf-8 -*-
# * * *
#Imports
# * * *
import os
import subprocess
import sys
import time 



# * * *
#Selección de terminal
# * * *
try:
    result = subprocess.check_output("gnome-terminal -x echo ok", stderr=subprocess.STDOUT, shell=True)
except:
    try:
        result = subprocess.check_output("xfce4-terminal -x echo ok", stderr=subprocess.STDOUT, shell=True)
    except:
        result = subprocess.check_output("lxterminal -x echo ok", stderr=subprocess.STDOUT, shell=True)
        try:
            pass
        except:
            print('Imposible abrir ninguna terminal')
        else:
            terminal = 'lxterminal'
            ejecutable = '-e'
    else:
        terminal = 'xfce4-terminal'
        ejecutable = '-x'
        
else:
    terminal = 'gnome-terminal'
    ejecutable = '-x'



# * * *
#Variables del programa
# * * *
nClients = 3
nHandlers = 3
nWorkers = 3

listaClients = []
listaRrs = []
listaHandlers = []
listaWorkers = []

t = 0.5 #Número de segundos que espera entre lanzamientos








# * * *
#Lanzar los procesos
# * * *
for i in range(nClients): #Lanza los rr de los clientes desde 1 hasta nClients (ambos incluidos)
	listaRrs.append(subprocess.Popen([terminal, ejecutable, 'node', 'rr.js', str(i+1)]))
	time.sleep(t)

procRouter = subprocess.Popen([terminal, ejecutable, 'node', 'router.js'])
time.sleep(t)

procRouter2 = subprocess.Popen([terminal, ejecutable, 'node', 'router2.js'])
time.sleep(t)

for i in range(nHandlers): #Lanza los handlers desde 1 hasta nHandlers (ambos incluidos)
	listaHandlers.append(subprocess.Popen([terminal, ejecutable, 'node', 'handler.js', str(i+1)]))
	time.sleep(t)
	
for i in range(nWorkers): #Lanza los workers desde 1 hasta nWorkers (ambos incluidos)
	listaWorkers.append(subprocess.Popen([terminal, ejecutable, 'node', 'worker.js', str(i+1)]))
	time.sleep(t)

procTotalorder = subprocess.Popen([terminal, ejecutable, 'node', 'totalorder.js'])
time.sleep(t)

for i in range(nClients): #Lanza los clientes desde 1 hasta nClients (ambos incluidos)
	listaClients.append(subprocess.Popen([terminal, ejecutable, 'node', 'client.js', str(i+1)]))
	time.sleep(t)
	
	
	
	
	

	
# * * *
#Esperar a los procesos
# * * *
for proc in listaRrs: #Mantiene los rr esperando
	proc.wait()
	
procRouter.wait()

procRouter2.wait()

for proc in listaHandlers: #Mantiene los handlers esperando
	proc.wait()
	
for proc in listaWorkers: #Mantiene los workers esperando
	proc.wait()
	
procTotalorder.wait()
	
for proc in listaClients: #Mantiene los clientes esperando
	proc.wait()
	
	
	
	
	
	
	
	
	
	
