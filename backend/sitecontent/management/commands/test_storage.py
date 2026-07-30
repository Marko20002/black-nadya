import urllib.error
import urllib.request

from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = (
        'Writes a small test file through the configured default file storage, reads it back '
        'via the storage API, AND fetches the generated URL over plain HTTP with no credentials '
        '(exactly what a browser <img> tag does) to verify the file is actually publicly '
        'reachable — not just writable. Run against production with '
        '`railway run python manage.py test_storage`.'
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
        url = default_storage.url(saved_name)
        self.stdout.write(f'URL: {url}')

        exists = default_storage.exists(saved_name)
        self.stdout.write(f'exists() -> {exists}')
        if not exists:
            default_storage.delete(saved_name)
            raise CommandError('File reported as saved but exists() returned False — check bucket/credentials.')

        # exists()/save() use authenticated S3 API calls with our credentials, which
        # says nothing about whether an anonymous browser request (what <img src=...>
        # actually does) can reach the file. Cloudflare R2 buckets are private by
        # default — a file can be written successfully via the API yet still be
        # unreachable over HTTP unless AWS_S3_CUSTOM_DOMAIN is connected to the
        # bucket for public access (or the bucket has a public dev URL enabled) in
        # the Cloudflare dashboard.
        if not url.startswith('http'):
            self.stdout.write(
                'URL is relative (local filesystem storage) — skipping the public-reachability check.'
            )
        else:
            self.stdout.write('Fetching URL anonymously (no auth), as a browser <img> tag would...')
            try:
                with urllib.request.urlopen(url, timeout=10) as resp:
                    self.stdout.write(self.style.SUCCESS(f'Public fetch OK: HTTP {resp.status}'))
            except urllib.error.HTTPError as exc:
                self.stdout.write(self.style.ERROR(
                    f'Public fetch FAILED: HTTP {exc.code} {exc.reason}. The file was written '
                    f'successfully but is not publicly readable at this URL — check that '
                    f'AWS_S3_CUSTOM_DOMAIN is actually connected to the bucket for public access '
                    f'in the R2/Cloudflare dashboard.'
                ))
            except urllib.error.URLError as exc:
                self.stdout.write(self.style.ERROR(
                    f'Public fetch FAILED: could not connect ({exc.reason}). The domain in the '
                    f'URL above may not exist or may not be pointed at this bucket yet.'
                ))

        default_storage.delete(saved_name)
        self.stdout.write(self.style.SUCCESS('Cleaned up test file.'))
