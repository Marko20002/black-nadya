from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = (
        'Writes a small test file through the configured default file storage '
        'and reads it back, to verify S3/R2 wiring end-to-end. Run this against '
        'production with `railway run python manage.py test_storage` to confirm '
        'uploads actually reach the bucket.'
    )

    def handle(self, *args, **options):
        self.stdout.write(f'USE_S3 = {settings.USE_S3}')
        self.stdout.write(
            f'default_storage backend = '
            f'{default_storage.__class__.__module__}.{default_storage.__class__.__name__}'
        )
        if settings.USE_S3:
            self.stdout.write(f'bucket = {default_storage.bucket_name}')
            self.stdout.write(f'endpoint_url = {default_storage.endpoint_url}')
            self.stdout.write(f'addressing_style = {default_storage.addressing_style}')
            self.stdout.write(f'region_name = {default_storage.region_name}')
            self.stdout.write(f'signature_version = {default_storage.signature_version}')
            self.stdout.write(f'custom_domain = {default_storage.custom_domain}')

        name = 'storage-test/black-nadya-storage-check.txt'
        try:
            saved_name = default_storage.save(name, ContentFile(b'black nadya storage test'))
        except Exception as exc:
            raise CommandError(f'Upload failed: {exc.__class__.__name__}: {exc}') from exc

        self.stdout.write(self.style.SUCCESS(f'Saved: {saved_name}'))
        self.stdout.write(f'URL: {default_storage.url(saved_name)}')

        exists = default_storage.exists(saved_name)
        self.stdout.write(f'exists() -> {exists}')
        if not exists:
            raise CommandError('File reported as saved but exists() returned False — check bucket/credentials.')

        default_storage.delete(saved_name)
        self.stdout.write(self.style.SUCCESS('Cleaned up test file. Storage is working end-to-end.'))
