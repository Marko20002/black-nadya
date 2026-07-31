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
        'category': 'Serums',
        'size': '30ml',
        'featured': True,
        'name': {
            'en': 'Radiance Vitamin C Serum',
            'mk': 'Серум за сјај со витамин Ц',
            'sq': 'Serum shkëlqimi me Vitaminë C',
        },
        'short_description': {
            'en': 'Brightening serum with stabilized Vitamin C for an even, luminous complexion.',
            'mk': 'Серум за разубавување со стабилизиран витамин Ц за рамномерен, сјаен тен.',
            'sq': 'Serum ndriçues me Vitaminë C të stabilizuar për një ten të njëtrajtshëm dhe të ndritshëm.',
        },
        'full_description': {
            'en': (
                'A lightweight, fast-absorbing serum formulated with stabilized Vitamin C to visibly '
                'brighten skin tone, fade dark spots, and defend against environmental stressors. '
                'Suitable for daily morning use under moisturizer and SPF.'
            ),
            'mk': (
                'Лесен серум со брзо впивање, формулиран со стабилизиран витамин Ц за видливо '
                'осветлување на тенот, намалување на темните дамки и заштита од надворешни фактори. '
                'Погоден за секојдневна утринска употреба под хидратантен крем и заштита од сонце.'
            ),
            'sq': (
                'Një serum i lehtë që thithet shpejt, i formuluar me Vitaminë C të stabilizuar për të '
                'ndriçuar dukshëm tenin, zbehur njollat e errëta dhe mbrojtur nga faktorët mjedisorë. '
                'I përshtatshëm për përdorim të përditshëm në mëngjes nën hidratues dhe SPF.'
            ),
        },
        'ingredients': {
            'en': 'Vitamin C (Ascorbic Acid), Hyaluronic Acid, Vitamin E, Aloe Vera Extract',
            'mk': 'Витамин Ц (Аскорбинска киселина), Хијалуронска киселина, Витамин Е, Екстракт од алое вера',
            'sq': 'Vitaminë C (Acid Askorbik), Acid Hialuronik, Vitaminë E, Ekstrakt Aloe Vera',
        },
    },
    {
        'category': 'Serums',
        'size': '30ml',
        'featured': True,
        'name': {
            'en': 'Renew Retinol Night Serum',
            'mk': 'Ноќен серум за обнова со ретинол',
            'sq': 'Serum nate rinovues me Retinol',
        },
        'short_description': {
            'en': 'Overnight renewal serum with encapsulated Retinol to smooth fine lines.',
            'mk': 'Ноќен серум со инкапсулиран ретинол кој ги омекнува фините линии додека спиете.',
            'sq': 'Një serum nate me Retinol të enkapsuluar që zbut shfaqjen e rrudhave të imëta.',
        },
        'full_description': {
            'en': (
                'A gentle yet effective night serum with encapsulated Retinol that supports cell '
                'turnover and softens the appearance of fine lines and uneven texture while you sleep.'
            ),
            'mk': (
                'Нежен, но ефикасен ноќен серум со инкапсулиран ретинол кој ја поддржува обновата на '
                'клетките и ја омекнува појавата на фините линии и нерамномерната текстура додека спиете.'
            ),
            'sq': (
                'Një serum nate i butë por efektiv me Retinol të enkapsuluar që mbështet rigjenerimin '
                'qelizor dhe zbut shfaqjen e rrudhave të imëta dhe teksturës së parregullt gjatë gjumit.'
            ),
        },
        'ingredients': {
            'en': 'Retinol, Squalane, Niacinamide, Shea Butter',
            'mk': 'Ретинол, Скволан, Ниацинамид, Шеа путер',
            'sq': 'Retinol, Skualan, Niacinamidë, Gjalpë Shea',
        },
    },
    {
        'category': 'Serums',
        'size': '30ml',
        'featured': False,
        'name': {
            'en': 'Argireline Peptide Firming Serum',
            'mk': 'Серум за стегање со пептид Аргирелин',
            'sq': 'Serum forcues me Peptid Argireline',
        },
        'short_description': {
            'en': 'Peptide-powered serum that helps visibly firm and smooth expression lines.',
            'mk': 'Серум со моќ на пептиди кој помага видливо да ги стегне и измазни линиите на изразот.',
            'sq': 'Një serum i fuqizuar me peptide që ndihmon në shtrëngimin e dukshëm të vijave të shprehjes.',
        },
        'full_description': {
            'en': (
                'Formulated with Argireline Peptide, this serum works to relax the look of expression '
                'lines while firming and toning the skin for a smoother, more youthful appearance.'
            ),
            'mk': (
                'Формулиран со пептид Аргирелин, овој серум делува за да ги релаксира линиите на '
                'изразот, стегнувајќи ја и тонизирајќи ја кожата за помладешки изглед.'
            ),
            'sq': (
                'I formuluar me Peptid Argireline, ky serum vepron për të relaksuar shfaqjen e vijave '
                'të shprehjes, ndërkohë që forcon dhe tonifikon lëkurën për një pamje më të re.'
            ),
        },
        'ingredients': {
            'en': 'Argireline Peptide, Hyaluronic Acid, Green Tea Extract',
            'mk': 'Пептид Аргирелин, Хијалуронска киселина, Екстракт од зелен чај',
            'sq': 'Peptid Argireline, Acid Hialuronik, Ekstrakt Çaji të Gjelbër',
        },
    },
    {
        'category': 'Creams',
        'size': '50ml',
        'featured': True,
        'name': {
            'en': 'Nourish Argan Face Cream',
            'mk': 'Хранлив крем за лице со арган',
            'sq': 'Krem fytyre ushqyes me vaj argani',
        },
        'short_description': {
            'en': 'Rich daily moisturizer with cold-pressed argan oil for lasting hydration.',
            'mk': 'Богат дневен хидратантен крем со ладно цедено арган-масло за долготрајна хидратација.',
            'sq': 'Një krem hidratues i pasur ditor me vaj argani të shtypur ftohtë për hidratim afatgjatë.',
        },
        'full_description': {
            'en': (
                'A deeply nourishing face cream built around cold-pressed argan oil, delivering '
                'long-lasting hydration and a soft, healthy glow for all skin types.'
            ),
            'mk': (
                'Длабоко хранлив крем за лице изграден околу ладно цедено арган-масло, обезбедувајќи '
                'долготрајна хидратација и мек, здрав сјај за сите типови кожа.'
            ),
            'sq': (
                'Një krem fytyre thellësisht ushqyes i ndërtuar rreth vajit të arganit të shtypur '
                'ftohtë, që ofron hidratim afatgjatë dhe një shkëlqim të butë e të shëndetshëm.'
            ),
        },
        'ingredients': {
            'en': 'Argan Oil, Shea Butter, Vitamin E, Chamomile Extract',
            'mk': 'Арган масло, Шеа путер, Витамин Е, Екстракт од камилица',
            'sq': 'Vaj Argani, Gjalpë Shea, Vitaminë E, Ekstrakt Kamomili',
        },
    },
    {
        'category': 'Creams',
        'size': '50ml',
        'featured': False,
        'name': {
            'en': 'Gold Radiance Night Cream',
            'mk': 'Ноќен крем со златен сјај',
            'sq': 'Krem nate me shkëlqim ari',
        },
        'short_description': {
            'en': 'Luxurious overnight cream infused with 24k gold flake and botanical oils.',
            'mk': 'Луксузен ноќен крем збогатен со 24-каратно златно ливче и растителни масла.',
            'sq': 'Një krem nate luksoz i pasuruar me flok ari 24 karat dhe vajra botanikë.',
        },
        'full_description': {
            'en': (
                'This decadent night cream combines 24k gold flake with nourishing botanical oils to '
                'restore, replenish, and revive tired skin overnight.'
            ),
            'mk': (
                'Овој раскошен ноќен крем ги комбинира 24-каратните златни ливчиња со хранливи '
                'растителни масла за да ја обнови, надополни и оживее уморната кожа преку ноќта.'
            ),
            'sq': (
                'Ky krem nate i pasur kombinon flokë ari 24 karat me vajra botanikë ushqyes për të '
                'restauruar dhe rigjallëruar lëkurën e lodhur gjatë natës.'
            ),
        },
        'ingredients': {
            'en': '24k Gold Flake, Jojoba Oil, Rosehip Oil, Vitamin E',
            'mk': '24-каратно златно ливче, Жожоба масло, Масло од шипинка, Витамин Е',
            'sq': 'Flok Ari 24k, Vaj Jojoba, Vaj Trëndafili të Egër, Vitaminë E',
        },
    },
    {
        'category': 'Oils',
        'size': '30ml',
        'featured': True,
        'name': {
            'en': 'Pure Rosehip Face Oil',
            'mk': 'Чисто масло од шипинка за лице',
            'sq': 'Vaj i pastër trëndafili të egër për fytyrë',
        },
        'short_description': {
            'en': 'Cold-pressed rosehip oil to restore elasticity and even skin tone.',
            'mk': 'Ладно цедено масло од шипинка за обновување на еластичноста и изедначување на тенот.',
            'sq': 'Vaj trëndafili të egër i shtypur ftohtë për të rikthyer elasticitetin e lëkurës.',
        },
        'full_description': {
            'en': (
                'A pure, cold-pressed rosehip oil rich in essential fatty acids and antioxidants that '
                'helps restore skin elasticity, fade scarring, and even out skin tone over time.'
            ),
            'mk': (
                'Чисто, ладно цедено масло од шипинка богато со есенцијални масни киселини и '
                'антиоксиданси кое помага да се обнови еластичноста на кожата и да се изедначи тенот.'
            ),
            'sq': (
                'Një vaj i pastër trëndafili të egër i shtypur ftohtë, i pasur me acide yndyrore '
                'esenciale dhe antioksidantë, që ndihmon rikthimin e elasticitetit të lëkurës.'
            ),
        },
        'ingredients': {
            'en': 'Cold-Pressed Rosehip Seed Oil',
            'mk': 'Ладно цедено масло од семки од шипинка',
            'sq': 'Vaj Fara Trëndafili të Egër i Shtypur Ftohtë',
        },
    },
    {
        'category': 'Oils',
        'size': '100ml',
        'featured': False,
        'name': {
            'en': 'Calming Lavender Body Oil',
            'mk': 'Смирувачко масло за тело со лаванда',
            'sq': 'Vaj qetësues trupi me livando',
        },
        'short_description': {
            'en': 'Soothing lavender-infused body oil for silky, calm skin after every shower.',
            'mk': 'Смирувачко масло за тело со лаванда кое остава свилена, смирена кожа по секое туширање.',
            'sq': 'Një vaj trupi qetësues me livando që lë lëkurën mëndafshi dhe të qetë pas çdo dushi.',
        },
        'full_description': {
            'en': (
                'A soothing blend of lavender essential oil and lightweight carrier oils that absorbs '
                'quickly, leaving skin soft, calm, and delicately scented.'
            ),
            'mk': (
                'Смирувачка мешавина од есенцијално масло од лаванда и лесни масла-носители кое брзо '
                'се впива, оставајќи ја кожата мека, смирена и нежно испарфимирана.'
            ),
            'sq': (
                'Një përzierje qetësuese e vajit esencial të livandos dhe vajrave të lehtë bartës që '
                'thithet shpejt, duke lënë lëkurën të butë, të qetë dhe lehtësisht të parfumuar.'
            ),
        },
        'ingredients': {
            'en': 'Lavender Essential Oil, Sweet Almond Oil, Vitamin E',
            'mk': 'Есенцијално масло од лаванда, Масло од слатки бадеми, Витамин Е',
            'sq': 'Vaj Esencial Livando, Vaj Bajame të Ëmbla, Vitaminë E',
        },
    },
]

PHARMACIES = [
    {
        'name': 'Vita Pharmacy Centar',
        'address': {
            'en': 'Ul. Makedonija 15',
            'mk': 'Ул. Македонија бр. 15',
            'sq': 'Rr. Maqedonia nr. 15',
        },
        'city': 'Skopje',
        'phone': '+389 2 123 4567',
        'map_link': 'https://maps.google.com/?q=Vita+Pharmacy+Centar+Skopje',
    },
    {
        'name': 'Zdravje Apoteka',
        'address': {
            'en': 'Bul. Partizanski Odredi 42',
            'mk': 'Бул. Партизански одреди бр. 42',
            'sq': 'Bul. Partizanski Odredi nr. 42',
        },
        'city': 'Skopje',
        'phone': '+389 2 234 5678',
        'map_link': 'https://maps.google.com/?q=Zdravje+Apoteka+Skopje',
    },
    {
        'name': 'Nova Farmacija',
        'address': {
            'en': 'Ul. Boris Trajkovski 8',
            'mk': 'Ул. Борис Трајковски бр. 8',
            'sq': 'Rr. Boris Trajkovski nr. 8',
        },
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
        category_translations = {
            'Serums': {'en': 'Serums', 'mk': 'Серуми', 'sq': 'Serume'},
            'Creams': {'en': 'Creams', 'mk': 'Кремови', 'sq': 'Kremra'},
            'Oils': {'en': 'Oils', 'mk': 'Масла', 'sq': 'Vajra'},
        }
        categories = {}
        for name, translations in category_translations.items():
            category, _ = Category.objects.get_or_create(
                name_en=translations['en'],
                defaults={'name_mk': translations['mk'], 'name_sq': translations['sq']},
            )
            categories[name] = category

        for data in PRODUCTS:
            if Product.objects.filter(name_en=data['name']['en']).exists():
                continue
            product = Product.objects.create(
                category=categories[data['category']],
                size=data['size'],
                is_featured=data['featured'],
                is_active=True,
                name_en=data['name']['en'],
                name_mk=data['name']['mk'],
                name_sq=data['name']['sq'],
                short_description_en=data['short_description']['en'],
                short_description_mk=data['short_description']['mk'],
                short_description_sq=data['short_description']['sq'],
                full_description_en=data['full_description']['en'],
                full_description_mk=data['full_description']['mk'],
                full_description_sq=data['full_description']['sq'],
                ingredients_en=data['ingredients']['en'],
                ingredients_mk=data['ingredients']['mk'],
                ingredients_sq=data['ingredients']['sq'],
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
                name_en=data['name'],
                defaults={
                    'name_mk': data['name'],
                    'name_sq': data['name'],
                    'address_en': data['address']['en'],
                    'address_mk': data['address']['mk'],
                    'address_sq': data['address']['sq'],
                    'city': data['city'],
                    'phone': data['phone'],
                    'map_link': data['map_link'],
                    'is_active': True,
                },
            )
        self.stdout.write(f'Pharmacies in DB: {Pharmacy.objects.count()}')

    def seed_site_settings(self):
        settings_obj = SiteSettings.load()
        if not settings_obj.hero_tagline_en:
            settings_obj.hero_tagline_en = 'Pure. Natural. Radiant. Discover the Black Nadya collection.'
            settings_obj.hero_tagline_mk = 'Чисто. Природно. Сјајно. Откријте ја колекцијата Black Nadya.'
            settings_obj.hero_tagline_sq = 'E pastër. Natyrale. Rrezatuese. Zbuloni koleksionin Black Nadya.'
        if not settings_obj.about_us_text_en:
            settings_obj.about_us_text_en = (
                '<p>Black Nadya was founded on a simple belief: skincare should be both effective '
                'and honest. Every formula we create blends natural, thoughtfully sourced '
                'ingredients with modern science to deliver visible results without compromise.</p>'
                '<p>From our first dropper bottle to the collection you see today, our mission has '
                'never changed &mdash; to help you feel confident and radiant in your own skin.</p>'
            )
            settings_obj.about_us_text_mk = (
                '<p>Black Nadya е основана на едноставно верување: негата на кожата треба да биде и '
                'ефикасна и искрена. Секоја формула што ја создаваме комбинира природни, внимателно '
                'избрани состојки со современа наука за да обезбеди видливи резултати без компромис.</p>'
                '<p>Од нашето прво шише со капалка до колекцијата што ја гледате денес, нашата мисија '
                'никогаш не се промени &mdash; да ви помогнеме да се чувствувате самоуверено и сјајно '
                'во сопствената кожа.</p>'
            )
            settings_obj.about_us_text_sq = (
                '<p>Black Nadya u themelua mbi një besim të thjeshtë: kujdesi për lëkurën duhet të '
                'jetë njëkohësisht efektiv dhe i ndershëm. Çdo formulë që krijojmë kombinon përbërës '
                'natyralë të zgjedhur me kujdes me shkencën moderne për të ofruar rezultate të '
                'dukshme pa kompromis.</p><p>Nga shishja jonë e parë me pikatore deri te koleksioni '
                'që shihni sot, misioni ynë nuk ka ndryshuar kurrë &mdash; t’ju ndihmojmë të '
                'ndiheni të sigurt dhe rrezatues në lëkurën tuaj.</p>'
            )
        if not settings_obj.contact_phone:
            settings_obj.contact_phone = '+389 2 000 0000'
        if not settings_obj.contact_email:
            settings_obj.contact_email = 'hello@blacknadya.com'
        if not settings_obj.contact_address_en:
            settings_obj.contact_address_en = 'Ul. Makedonija 1, Skopje, North Macedonia'
            settings_obj.contact_address_mk = 'Ул. Македонија бр. 1, Скопје, Северна Македонија'
            settings_obj.contact_address_sq = 'Rr. Maqedonia nr. 1, Shkup, Maqedonia e Veriut'
        if not settings_obj.social_links:
            settings_obj.social_links = {
                'instagram': 'https://instagram.com/blacknadya',
                'facebook': 'https://facebook.com/blacknadya',
            }
        if not settings_obj.footer_text_en:
            settings_obj.footer_text_en = '© Black Nadya Natural Cosmetics. All rights reserved.'
            settings_obj.footer_text_mk = '© Black Nadya Natural Cosmetics. Сите права се задржани.'
            settings_obj.footer_text_sq = '© Black Nadya Natural Cosmetics. Të gjitha të drejtat e rezervuara.'
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
