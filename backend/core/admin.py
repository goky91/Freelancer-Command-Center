from django.contrib import admin
from .models import Client, TimeEntry, Invoice


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    list_display = ['name', 'company', 'email', 'user', 'created_at']
    list_filter = ['user', 'created_at']
    search_fields = ['name', 'company', 'email']


@admin.register(TimeEntry)
class TimeEntryAdmin(admin.ModelAdmin):
    list_display = ['client', 'month', 'year', 'hours', 'hourly_rate', 'total_amount', 'user']
    list_filter = ['user', 'client', 'year', 'month']
    search_fields = ['client__name', 'description']


@admin.register(Invoice)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ['invoice_number', 'client', 'issue_date', 'due_date', 'status', 'total_amount', 'user']
    list_filter = ['status', 'user', 'issue_date']
    search_fields = ['invoice_number', 'client__name']
