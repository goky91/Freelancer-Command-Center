#!/bin/bash

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create Django project
django-admin startproject config .

# Create core app
python manage.py startapp core

# Run migrations
python manage.py migrate

# Create superuser (you'll be prompted)
python manage.py createsuperuser
