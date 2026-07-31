from django.db import migrations


def backfill_translations(apps, schema_editor):
    Category = apps.get_model('products', 'Category')
    for category in Category.objects.all():
        category.name_en = category.name_en or category.name
        category.name_mk = category.name_mk or category.name
        category.name_sq = category.name_sq or category.name
        category.save(update_fields=['name_en', 'name_mk', 'name_sq'])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0003_category_name_en_category_name_mk_category_name_sq'),
    ]

    operations = [
        migrations.RunPython(backfill_translations, noop_reverse),
    ]
