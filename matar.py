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
    
    
    
    
    
os.system('killall -s KILL node')	
'''
archivoPids = open('pids.lanzados', 'r')
listaPids = archivoPids.read().splitlines()
for pid in listaPids:
	#print('Matando el pid: ' + str(pid))
	#os.system('kill -9 ' + str(pid))
archivoPids.close()
'''    
    
    
    
    
    
    
    
    
    
    
    
    
    
