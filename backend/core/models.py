from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Client(models.Model):
    """Model for storing client information"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='clients')
    name = models.CharField(max_length=200, verbose_name='Client Name')
    email = models.EmailField(verbose_name='Email', blank=True, null=True)
    company = models.CharField(max_length=200, verbose_name='Company', blank=True, null=True)
    address = models.TextField(verbose_name='Address', blank=True, null=True)
    pib = models.CharField(max_length=50, verbose_name='Tax ID', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Client'
        verbose_name_plural = 'Clients'

    def __str__(self):
        return self.name


class TimeEntry(models.Model):
    """Model for storing time entries"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='time_entries')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='time_entries')
    month = models.IntegerField(verbose_name='Month (1-12)')
    year = models.IntegerField(verbose_name='Year')
    hours = models.DecimalField(max_digits=6, decimal_places=2, verbose_name='Hours')
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, verbose_name='Hourly Rate')
    description = models.TextField(verbose_name='Description', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-year', '-month']
        verbose_name = 'Time Entry'
        verbose_name_plural = 'Time Entries'
        unique_together = ['user', 'client', 'month', 'year']

    def __str__(self):
        return f"{self.client.name} - {self.month}/{self.year}"

    @property
    def total_amount(self):
        """Calculates total amount for this entry"""
        return self.hours * self.hourly_rate


class Invoice(models.Model):
    """Model for storing invoices"""
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('sent', 'Sent'),
        ('paid', 'Paid'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='invoices')
    client = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='invoices')
    time_entry = models.ForeignKey(TimeEntry, on_delete=models.CASCADE, related_name='invoices')
    invoice_number = models.CharField(max_length=50, verbose_name='Invoice Number', unique=True)
    issue_date = models.DateField(verbose_name='Issue Date', default=timezone.now)
    due_date = models.DateField(verbose_name='Due Date')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    notes = models.TextField(verbose_name='Notes', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Invoice'
        verbose_name_plural = 'Invoices'

    def __str__(self):
        return f"Invoice {self.invoice_number} - {self.client.name}"

    @property
    def total_amount(self):
        """Total invoice amount"""
        return self.time_entry.total_amount
