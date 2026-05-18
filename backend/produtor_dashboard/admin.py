from django.contrib import admin

from .models import Animal


@admin.register(Animal)
class AnimalAdmin(admin.ModelAdmin):
    list_display = (
        'brinco',
        'nome',
        'raca',
        'status',
        'sexo',
        'proprietario',
    )
    list_filter = ('status', 'raca', 'sexo')
    search_fields = ('brinco', 'nome')

    proprietario = 'proprietario'



