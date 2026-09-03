-- Replaceable proof-of-concept content. Deterministic IDs make repeat runs safe.

begin;

insert into public.settings (
  id,
  restaurant_name_en,
  restaurant_name_ar,
  logo_path,
  currency,
  primary_color,
  default_language
)
values (
  '00000000-0000-4000-8000-000000000001',
  'CricCrac Restaurant',
  'مطعم كريك كراك',
  null,
  'QAR',
  '#8B1E2D',
  'en'
)
on conflict ((true)) do update
set
  id = excluded.id,
  restaurant_name_en = excluded.restaurant_name_en,
  restaurant_name_ar = excluded.restaurant_name_ar,
  logo_path = excluded.logo_path,
  currency = excluded.currency,
  primary_color = excluded.primary_color,
  default_language = excluded.default_language;

insert into public.categories (id, name_en, name_ar, sort_order, enabled)
values
  ('10000000-0000-4000-8000-000000000001', 'Starters', 'المقبلات', 0, true),
  ('10000000-0000-4000-8000-000000000002', 'Main Courses', 'الأطباق الرئيسية', 1, true),
  ('10000000-0000-4000-8000-000000000003', 'Desserts', 'الحلويات', 2, true),
  ('10000000-0000-4000-8000-000000000004', 'Seasonal', 'الأطباق الموسمية', 3, false)
on conflict (id) do update
set
  name_en = excluded.name_en,
  name_ar = excluded.name_ar,
  sort_order = excluded.sort_order,
  enabled = excluded.enabled;

insert into public.menu_items (
  id,
  category_id,
  name_en,
  name_ar,
  description_en,
  description_ar,
  price,
  image_path,
  available,
  sort_order
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    'Hummus',
    'حمص',
    'Creamy chickpeas with tahini, lemon, and olive oil.',
    'حمص ناعم مع الطحينة والليمون وزيت الزيتون.',
    22.00,
    null,
    true,
    0
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    'Crispy Halloumi',
    'حلوم مقرمش',
    'Golden halloumi served with a light pomegranate glaze.',
    'جبنة حلوم ذهبية تقدم مع صلصة الرمان الخفيفة.',
    31.00,
    null,
    false,
    1
  ),
  (
    '20000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000002',
    'Grilled Chicken',
    'دجاج مشوي',
    'Herb-marinated chicken with roasted vegetables and rice.',
    'دجاج متبل بالأعشاب مع الخضروات المشوية والأرز.',
    58.00,
    null,
    true,
    0
  ),
  (
    '20000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000002',
    'Beef Burger',
    'برغر لحم',
    'Chargrilled beef, cheddar, lettuce, tomato, and house sauce.',
    'لحم بقري مشوي مع جبن الشيدر والخس والطماطم وصلصة المطعم.',
    52.00,
    null,
    true,
    1
  ),
  (
    '20000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000003',
    'Date Cake',
    'كعكة التمر',
    'Warm date cake with caramel sauce and vanilla ice cream.',
    'كعكة تمر دافئة مع صلصة الكراميل وآيس كريم الفانيليا.',
    34.00,
    null,
    true,
    0
  ),
  (
    '20000000-0000-4000-8000-000000000006',
    '10000000-0000-4000-8000-000000000004',
    'Winter Soup',
    'شوربة الشتاء',
    'A rotating seasonal soup prepared with market vegetables.',
    'شوربة موسمية متغيرة تحضر بخضروات السوق.',
    28.00,
    null,
    true,
    0
  )
on conflict (id) do update
set
  category_id = excluded.category_id,
  name_en = excluded.name_en,
  name_ar = excluded.name_ar,
  description_en = excluded.description_en,
  description_ar = excluded.description_ar,
  price = excluded.price,
  image_path = excluded.image_path,
  available = excluded.available,
  sort_order = excluded.sort_order;

commit;
