#!/bin/sh

yum-builddep -y recodex-web.spec
spectool -g recodex-web.spec
cp web-app-*.tar.gz ~/rpmbuild/SOURCES/
rpmbuild -ba recodex-web.spec

