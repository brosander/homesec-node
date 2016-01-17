#!/bin/bash

curl -d '{"name":"'"$1"'", "url": "http://'"$2"':8080/video"}' -H "Content-Type: application/json" 'http://localhost:8080/register'
