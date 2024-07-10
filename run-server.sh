#!/bin/sh
apache2 -X -d. -f.htaccess -C"PidFile `mktemp`"  -C"Listen 1025" 
-C"ErrorLog /dev/stdout" -C"DocumentRoot `pwd`/src"
