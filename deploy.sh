#! /bin/bash

SITE_PATH='/var/www/up1and'

cd $SITE_PATH
git reset --hard origin/master
git clean -f
git pull
git checkout master

supervisorctl restart up1and
service nginx restart