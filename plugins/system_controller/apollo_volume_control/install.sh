#!/bin/bash

echo "Installing apollo volume control Dependencies"

echo "Installing SCREEN"
apt-get update
apt-get -y install screen

echo "Applying SCREEN starting policy"
#systemctl enable lirc.service
#systemctl start lirc.service

echo "Copying config  files"
#sudo cp /data/plugins/miscellanea/allo_relay_volume_attenuator/lircd.conf  /etc/lirc/
#sudo cp /data/plugins/miscellanea/allo_relay_volume_attenuator/hardware.conf  /etc/lirc/
#sudo cp /data/plugins/miscellanea/allo_relay_volume_attenuator/lircrc  /etc/lirc/

echo "Adding r attenu service"
#sudo cp /data/plugins/miscellanea/allo_relay_volume_attenuator/rattenu.service /lib/systemd/system/rattenu.service

#requred to end the plugin install
echo "plugininstallend"