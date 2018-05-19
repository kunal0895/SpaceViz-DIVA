# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json
from django.shortcuts import render
from django.views.generic import View
from django.db import transaction
from django.http import HttpResponse, HttpResponseNotFound
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django import forms
from django.db.models import Prefetch, Q, Max
import uuid
import copy
import datetime

from requests import Response
from rest_framework.views import APIView
from rest_framework import permissions, status
from rest_framework.exceptions import APIException
from django.contrib.auth import authenticate, login
from rest_framework.views import APIView
from myapp2 import models as player_model
from myapp2 import serializer as player_serializers
from myapp2 import utils as player_utils

# Create your views here.


class Players(APIView):
	template_name = "admin/books.html"

	def get(self, request, *args, **kwargs):
		player_objects = player_model.Player.objects.filter(is_deleted=False)
		player_serializer_data = player_serializers.BucketlistSerializer(player_objects, many=True).data
		return player_utils.response({'response':player_serializer_data})
