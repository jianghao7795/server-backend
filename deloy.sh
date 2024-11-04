#!/bin/bash

ip=`ifconfig -a|grep inet|grep -v 127.0.0.1|grep -v inet6|grep -v 172.\*.\*.\*|awk '{print $2}'|tr -d "addr:"`
echo $ip

# sed -i `s/192.168.56.103/$ip/g` './conf.d/my.conf'

cp conf.d/my.conf conf.d/config.conf
sed -i -e "s/192.168.56.103/$ip/g" conf.d/config.conf
docker stop backend
docker rm backend
docker rmi backend

docker build --progress=plain -t backend .
docker run --name backend -d -p 9000:9000 backend
