FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive
RUN \
  apt-get update \
    && apt-get -y install postgresql-client \
    && apt-get -y install ruby-activerecord \
    && apt-get -y install ruby-pg \
    && apt-get -y install nodejs \
    && apt-get -y install npm
