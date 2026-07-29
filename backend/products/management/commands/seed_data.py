import io

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from PIL import Image, ImageDraw

from inquiries.models import OrderRequest
from locations.models import Pharmacy
from products.models import Category, Product
from sitecontent.models import SiteSettings

BLACK = (13, 13, 13)
GOLD = (201, 162, 75)
OFFWHITE = (248, 246, 242)


def make_image(width, height, bg, label, fg=GOLD):
    img = Image.new('RGB', (width, height), bg)
    draw = ImageDraw.Draw(img)
    bbox = draw.textbbox((0, 0), label)
    text_w, text_h = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.rectangle(
        [8, 8, width - 8, height - 8], outline=fg, width=3,
    )
    draw.text(((width - text_w) / 2, (height - text_h) / 2), label, fill=fg)
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    return ContentFile(buf.getvalue(), name=f'{label.lower().replace(" ", "-")}.png')


PRODUCTS = [
    {
        'name': 'Radiance Vitamin C Serum',
        'category': 'Serums',
        'short_description': 'Brightening serum with stabilized Vitamin C for an even, luminous complexion.',
        'full_description': (
            'A lightweight, fast-absorbing serum formulated with stabilized Vitamin C to visibly '
            'brighten skin tone, fade dark spots, and defend against environmental stressors. '
            'Suitable for daily morning use under moisturizer and SPF.'
        ),
        'ingredients': 'Vitamin C (Ascorbic Acid), Hyaluronic Acid, Vitamin E, Aloe Vera Extract',
        'size': '30ml',
        'featured': True,
    },
    {
        'name': 'Renew Retinol Night Serum',
        'category': 'Serums',
        'short_description': 'Overnight renewal serum with encapsulated Retinol to smooth fine lines.',
        'full_description': (
            'A gentle yet effective night serum with encapsulated Retinol that supports cell '
            'turnover and softens the appearance of fine lines and uneven texture while you sleep.'
        ),
        'ingredients': 'Retinol, Squalane, Niacinamide, Shea Butter',
        'size': '30ml',
        'featured': True,
    },
    {
        'name': 'Argireline Peptide Firming Serum',
        'category': 'Serums',
        'short_description': 'Peptide-powered serum that helps visibly firm and smooth expression lines.',
        'full_description': (
            'Formulated with Argireline Peptide, this serum works to relax the look of expression '
            'lines while firming and toning the skin for a smoother, more youthful appearance.'
        ),
        'ingredients': 'Argireline Peptide, Hyaluronic Acid, Green Tea Extract',
        'size': '30ml',
        'featured': False,
    },
    {
        'name': 'Nourish Argan Face Cream',
        'category': 'Creams',
        'short_description': 'Rich daily moisturizer with cold-pressed argan oil for lasting hydration.',
        'full_description': (
            'A deeply nourishing face cream built around cold-pressed argan oil, delivering '
            'long-lasting hydration and a soft, healthy glow for all skin types.'
        ),
        'ingredients': 'Argan Oil, Shea Butter, Vitamin E, Chamomile Extract',
        'size': '50ml',
        'featured': True,
    },
    {
        'name': 'Gold Radiance Night Cream',
        'category': 'Creams',
        'short_description': 'Luxurious overnight cream infused with 24k gold flake and botanical oils.',
        'full_description': (
            'This decadent night cream combines 24k gold flake with nourishing botanical oils to '
            'restore, replenish, and revive tired skin overnight.'
        ),
        'ingredients': '24k Gold Flake, Jojoba Oil, Rosehip Oil, Vitamin E',
        'size': '50ml',
        'featured': False,
    },
    {
        'name': 'Pure Rosehip Face Oil',
        'category': 'Oils',
        'short_description': 'Cold-pressed rosehip oil to restore elasticity and even skin tone.',
        'full_description': (
            'A pure, cold-pressed rosehip oil rich in essential fatty acids and antioxidants that '
            'helps restore skin elasticity, fade scarring, and even out skin tone over time.'
        ),
        'ingredients': 'Cold-Pressed Rosehip Seed Oil',
        'size': '30ml',
        'featured': True,
    },
    {
        'name': 'Calming Lavender Body Oil',
        'category': 'Oils',
        'short_description': 'Soothing lavender-infused body oil for silky, calm skin after every shower.',
        'full_description': (
            'A soothing blend of lavender essential oil and lightweight carrier oils that absorbs '
            'quickly, leaving skin soft, calm, and delicately scented.'
        ),
        'ingredients': 'Lavender Essential Oil, Sweet Almond Oil, Vitamin E',
        'size': '100ml',
        'featured': False,
    },
]

PHARMACIES = [
    {
        'name': 'Vita Pharmacy Centar',
        'address': 'Ul. Makedonija 15',
        'city': 'Skopje',
        'phone': '+389 2 123 4567',
        'map_link': 'https://maps.google.com/?q=Vita+Pharmacy+Centar+Skopje',
    },
    {
        'name': 'Zdravje Apoteka',
        'address': 'Bul. Partizanski Odredi 42',
        'city': 'Skopje',
        'phone': '+389 2 234 5678',
        'map_link': 'https://maps.google.com/?q=Zdravje+Apoteka+Skopje',
    },
    {
        'name': 'Nova Farmacija',
        'address': 'Ul. Boris Trajkovski 8',
        'city': 'Bitola',
        'phone': '+389 47 345 678',
        'map_link': 'https://maps.google.com/?q=Nova+Farmacija+Bitola',
    },
]


class Command(BaseCommand):
    help = 'Seed the database with demo categories, products, pharmacies, and site settings.'

    def handle(self, *args, **options):
        self.seed_categories_and_products()
        self.seed_pharmacies()
        self.seed_site_settings()
        self.seed_sample_order_request()
        self.stdout.write(self.style.SUCCESS('Seed data created successfully.'))

    def seed_categories_and_products(self):
        categories = {}
        for name in ['Serums', 'Creams', 'Oils']:
            category, _ = Category.objects.get_or_create(name=name)
            categories[name] = category

        for data in PRODUCTS:
            if Product.objects.filter(name=data['name']).exists():
                continue
            product = Product.objects.create(
                name=data['name'],
                category=categories[data['category']],
                short_description=data['short_description'],
                full_description=data['full_description'],
                ingredients=data['ingredients'],
                size=data['size'],
                is_featured=data['featured'],
                is_active=True,
            )
            product.image.save(
                f'{product.slug}.png',
                make_image(600, 800, BLACK, data['category']),
                save=True,
            )
        self.stdout.write(f'Products in DB: {Product.objects.count()}')

    def seed_pharmacies(self):
        for data in PHARMACIES:
            Pharmacy.objects.get_or_create(
                name=data['name'],
                defaults={
                    'address': data['address'],
                    'city': data['city'],
                    'phone': data['phone'],
                    'map_link': data['map_link'],
                    'is_active': True,
                },
            )
        self.stdout.write(f'Pharmacies in DB: {Pharmacy.objects.count()}')

    def seed_site_settings(self):
        settings_obj = SiteSettings.load()
        if not settings_obj.hero_tagline:
            settings_obj.hero_tagline = 'Pure. Natural. Radiant. Discover the Black Nadya collection.'
        if not settings_obj.about_us_text:
            settings_obj.about_us_text = (
                '<p>Black Nadya was founded on a simple belief: skincare should be both effective '
                'and honest. Every formula we create blends natural, thoughtfully sourced '
                'ingredients with modern science to deliver visible results without compromise.</p>'
                '<p>From our first dropper bottle to the collection you see today, our mission has '
                'never changed &mdash; to help you feel confident and radiant in your own skin.</p>'
            )
        if not settings_obj.contact_phone:
            settings_obj.contact_phone = '+389 2 000 0000'
        if not settings_obj.contact_email:
            settings_obj.contact_email = 'hello@blacknadya.com'
        if not settings_obj.contact_address:
            settings_obj.contact_address = 'Ul. Makedonija 1, Skopje, North Macedonia'
        if not settings_obj.social_links:
            settings_obj.social_links = {
                'instagram': 'https://instagram.com/blacknadya',
                'facebook': 'https://facebook.com/blacknadya',
            }
        if not settings_obj.footer_text:
            settings_obj.footer_text = '© Black Nadya Natural Cosmetics. All rights reserved.'
        if not settings_obj.logo_image:
            settings_obj.logo_image.save(
                'black-nadya-logo.png',
                make_image(400, 400, BLACK, 'BLACK NADYA'),
                save=False,
            )
        if not settings_obj.hero_background_image:
            settings_obj.hero_background_image.save(
                'hero-background.png',
                make_image(1600, 900, BLACK, 'NATURAL COSMETICS'),
                save=False,
            )
        settings_obj.save()
        self.stdout.write('Site settings seeded.')

    def seed_sample_order_request(self):
        if not OrderRequest.objects.exists():
            OrderRequest.objects.create(
                name='Sample Customer',
                phone='+389 70 000 000',
                email='sample@example.com',
                city='Skopje',
                address='Ul. Primer 1',
                products_wanted='Radiance Vitamin C Serum',
                notes='This is a sample order request shown for demo purposes.',
            )
