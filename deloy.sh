#!/bin/bash

ip=`ifconfig -a|grep inet|grep -v 127.0.0.1|grep -v inet6|grep -v 172.\*.\*.\*|awk '{print $2}'|tr -d "addr:"`
echo $ip
hostip="192.168.56.103"

# sed -i `s/192.168.56.103/$ip/g` './conf.d/my.conf'

cp conf.d/my.conf conf.d/config.conf
sed -i -e "s/192.168.56.103/$ip/g" conf.d/config.conf
docker stop backend
docker rm backend
docker rmi backend

if [ $ip == $hostip ]
then
  docker build --progress=plain -f Dockerfile -t backend .
else
  docker build --progress=plain -f DockerfileHome -t backend .
fi

docker run --name backend -d -p 9000:9000 backend

# a=10
# b=20
# if [ $a == $b ]
# then
#    echo "a 等于 b"
# elif [ $a -gt $b ]
# then
#    echo "a 大于 b"
# elif [ $a -lt $b ]
# then
#    echo "a 小于 b"
# else
#    echo "没有符合的条件"
# fi
