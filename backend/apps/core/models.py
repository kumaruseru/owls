from django.db import models

class SiteConfiguration(models.Model):
    site_name = models.CharField(max_length=255, default='OWLS Store')
    site_description = models.TextField(default='Welcome to our store', blank=True)
    maintenance_mode = models.BooleanField(default=False)
    
    # Contact Info
    support_email = models.EmailField(default='support@owls.asia')
    support_phone = models.CharField(max_length=20, default='+84 123 456 789')
    
    def save(self, *args, **kwargs):
        self.pk = 1
        super(SiteConfiguration, self).save(*args, **kwargs)

    @classmethod
    def get_solo(cls):
        obj, created = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Site Configuration"
    
    class Meta:
        verbose_name = "Site Configuration"
        verbose_name_plural = "Site Configuration"
