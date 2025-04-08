#!/bin/bash

psql -U $POSTGRES_USER -c "CREATE DATABASE $POSTGRES_DB;"

psql -U $POSTGRES_USER -d $POSTGRES_DB < /tmp/init.sql
