import csv
from django.contrib.auth.models import User
import operator
import sqlite3
from rest_framework import status
from rest_framework.response import Response


def response(data, code=status.HTTP_200_OK, error=""):
    """Overrides rest_framework response

        :param data: data to be send in response
        :param code: response status code(default has been set to 200)
        :param error: error message(if any, not compulsory)
    """
    res = {"error": error, "response": data}
    return Response(data=res, status=code)
