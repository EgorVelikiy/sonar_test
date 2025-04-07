#!/bin/bash

psql -U postgres -c "CREATE DATABASE $POSTGRES_DB;"

psql -U postgres -d $POSTGRES_DB < /tmp/init.sql
