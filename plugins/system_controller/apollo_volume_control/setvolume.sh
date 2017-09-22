#!/bin/bash
#set the volume of the apollo playback over ttyAM0
VOL=$1
echo volumio | /usr/bin/sudo -S /bin/bash -c 'echo -e "volume '$VOL' \r\n" > /dev/ttyAMA0'
echo $1 > /tmp/apollo_vol
