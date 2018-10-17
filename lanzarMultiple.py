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



proc11 = subprocess.Popen([terminal, '-x', 'node', 'rr.js', '1'])
proc12 = subprocess.Popen([terminal, '-x', 'node', 'rr.js', '2'])
proc13 = subprocess.Popen([terminal, '-x', 'node', 'rr.js', '3'])

proc2 = subprocess.Popen([terminal, '-x', 'node', 'router.js', '1'])

proc3 = subprocess.Popen([terminal, '-x', 'node', 'router2.js', '1'])

proc41 = subprocess.Popen([terminal, '-x', 'node', 'handler.js', '1'])
proc42 = subprocess.Popen([terminal, '-x', 'node', 'handler.js', '2'])
proc43 = subprocess.Popen([terminal, '-x', 'node', 'handler.js', '3'])

proc51 = subprocess.Popen([terminal, '-x', 'node', 'worker.js', '1'])
proc52 = subprocess.Popen([terminal, '-x', 'node', 'worker.js', '2'])
proc53 = subprocess.Popen([terminal, '-x', 'node', 'worker.js', '3'])

proc6 = subprocess.Popen([terminal, '-x', 'node', 'totalorder.js', '1'])

proc71 = subprocess.Popen([terminal, '-x', 'node', 'client.js', '1'])
proc72 = subprocess.Popen([terminal, '-x', 'node', 'client.js', '2'])
proc73 = subprocess.Popen([terminal, '-x', 'node', 'client.js', '3'])

proc11.wait()
proc12.wait()
proc13.wait()

proc2.wait()

proc3.wait()

proc41.wait()
proc42.wait()
proc43.wait()

proc51.wait()
proc52.wait()
proc53.wait()

proc6.wait()

proc71.wait()
proc72.wait()
proc73.wait()

