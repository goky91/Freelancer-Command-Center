from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Client, TimeEntry, Invoice


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class ClientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Client
        fields = ['id', 'name', 'email', 'company', 'address', 'pib', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class TimeEntrySerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = TimeEntry
        fields = ['id', 'client', 'client_name', 'month', 'year', 'hours', 'hourly_rate',
                  'description', 'total_amount', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_amount']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def validate_month(self, value):
        if value < 1 or value > 12:
            raise serializers.ValidationError("Month must be between 1 and 12.")
        return value

    def validate_year(self, value):
        if value < 2000 or value > 2100:
            raise serializers.ValidationError("Year must be between 2000 and 2100.")
        return value


class InvoiceSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    total_amount = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    time_entry_details = TimeEntrySerializer(source='time_entry', read_only=True)

    class Meta:
        model = Invoice
        fields = ['id', 'client', 'client_name', 'time_entry', 'time_entry_details',
                  'invoice_number', 'issue_date', 'due_date', 'status', 'notes',
                  'total_amount', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_amount']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password2 = serializers.CharField(write_only=True, required=True, label='Confirm Password', style={'input_type': 'password'})

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'first_name', 'last_name']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user
