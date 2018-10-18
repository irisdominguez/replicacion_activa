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
        result = subprocess.check_output("lxterminal -e echo ok", stderr=subprocess.STDOUT, shell=True)
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
nClients = 2
nHandlers = 2
nWorkers = 2

listaClients = []
listaRrs = []
listaHandlers = []
listaWorkers = []

t = 0.25 #Número de segundos que espera entre lanzamientos

listaProcesos = []
listaPids = []






# * * *
#Lanzar los procesos
# * * *
for i in range(nClients): #Lanza los rr de los clientes desde 1 hasta nClients (ambos incluidos)
	listaProcesos.append(subprocess.Popen([terminal, ejecutable, 'node', 'rr.js', str(i+1)]))
	time.sleep(t)

listaProcesos.append(subprocess.Popen([terminal, ejecutable, 'node', 'router.js']))
time.sleep(t)

listaProcesos.append(subprocess.Popen([terminal, ejecutable, 'node', 'router2.js']))
time.sleep(t)

for i in range(nHandlers): #Lanza los handlers desde 1 hasta nHandlers (ambos incluidos)
	listaProcesos.append(subprocess.Popen([terminal, ejecutable, 'node', 'handler.js', str(i+1)]))
	time.sleep(t)
	
for i in range(nWorkers): #Lanza los workers desde 1 hasta nWorkers (ambos incluidos)
	listaProcesos.append(subprocess.Popen([terminal, ejecutable, 'node', 'worker.js', str(i+1)]))
	time.sleep(t)

listaProcesos.append(subprocess.Popen([terminal, ejecutable, 'node', 'totalorder.js']))
time.sleep(t)

for i in range(nClients): #Lanza los clientes desde 1 hasta nClients (ambos incluidos)
	listaProcesos.append(subprocess.Popen([terminal, ejecutable, 'node', 'client.js', str(i+1)]))
	time.sleep(t)
	
	
	
	
	
# * * *
#Guardar los pids de los procesos
# * * *
for proc in listaProcesos: #Saco los pids de los procesos lanzados
	listaPids.append(proc.pid)
'''
archivoPids = open('pids.lanzados', 'w')
for pid in listaPids:
	print(str(pid))
	archivoPids.write(str(pid) + '\n')
archivoPids.close()
'''




	
# * * *
#Esperar a los procesos
# * * *
for proc in listaProcesos: #Mantiene los procesos esperando
	proc.wait()
	
	
	
	
	

	
	
	
	
	
	
	
