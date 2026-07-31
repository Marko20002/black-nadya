from rest_framework import serializers

from .models import Category, Product, ProductImage

TRANSLATED_FIELDS = [
    'name_en', 'name_mk', 'name_sq',
    'short_description_en', 'short_description_mk', 'short_description_sq',
    'full_description_en', 'full_description_mk', 'full_description_sq',
    'ingredients_en', 'ingredients_mk', 'ingredients_sq',
]


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='products.count', read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'name_en', 'name_mk', 'name_sq', 'slug', 'product_count']
        read_only_fields = ['name']

    def validate_name_en(self, value):
        if not value.strip():
            raise serializers.ValidationError('English name is required (used as the fallback and for the URL slug).')
        return value


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'image', 'order']


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'slug', 'category', 'size', 'image', 'is_featured',
            *TRANSLATED_FIELDS,
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    gallery_images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'slug', 'category', 'size', 'image',
            'gallery_images', 'is_featured', 'created_at',
            *TRANSLATED_FIELDS,
        ]


class ProductAdminSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    gallery_images = ProductImageSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'slug', 'category', 'category_name', 'size',
            'image', 'gallery_images', 'is_featured', 'is_active',
            'created_at', 'updated_at',
            *TRANSLATED_FIELDS,
        ]
        read_only_fields = ['slug', 'created_at', 'updated_at']

    def validate_name_en(self, value):
        if not value.strip():
            raise serializers.ValidationError('English name is required (used as the fallback and for the URL slug).')
        return value
