#!/usr/bin/env bash

if ! dpkg -s git; then
# Conditional for now so when vagrant provision is run again we skip
# unecessary steps and save time
# TODO make this unecessary
  sudo apt-get update
  sudo apt-get install -y git
 
  # add vagrant user to rvm group
  # sudo usermod -a -G rvm vagrant

  exit
fi
