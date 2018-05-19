from . import views
from django.conf.urls import url, include
from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.contrib.admin.views.decorators import staff_member_required

urlpatterns = [
    url(r'^players/',views.Players.as_view(), name='players'),

    ]
