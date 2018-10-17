import os
import subprocess
import sys

# os.chdir('replicacion_activa')


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
    else:
        terminal = 'xfce4-terminal'
else:
    terminal = 'gnome-terminal'



proc1 = subprocess.Popen([terminal, '-x', 'node', 'client.js', '1'])
proc2 = subprocess.Popen([terminal, '-x', 'node', 'rr.js', '1'])
proc3 = subprocess.Popen([terminal, '-x', 'node', 'router.js', '1'])
proc4 = subprocess.Popen([terminal, '-x', 'node', 'handler.js', '1'])

proc1.wait()
proc2.wait()
proc3.wait()
proc4.wait()

