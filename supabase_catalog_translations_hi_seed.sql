-- Purity Hindi catalog translations.
-- Run after supabase_multilingual_catalog.sql and supabase_catalog_seed.sql.
-- Safe to re-run: rows are upserted by the parent ID and language code.
-- Prices, images, IDs and booking data remain shared with the base catalog.

begin;

-- Categories
with seed(slug, name, description) as (
  values
    ('home-cleaning', 'घर की सफाई', 'घरों और अपार्टमेंट के लिए सफाई सेवाएं।'),
    ('furniture', 'फर्नीचर', 'गद्दों और सोफे की सफाई और देखभाल।'),
    ('flooring', 'फर्श', 'विभिन्न प्रकार के फर्श की पेशेवर सफाई।'),
    ('commercial', 'व्यावसायिक', 'कार्यालयों और व्यावसायिक स्थानों के लिए सफाई समाधान।'),
    ('care', 'देखभाल', 'बच्चों और पालतू जानवरों की विश्वसनीय देखभाल सेवाएं।'),
    ('laundry', 'लॉन्ड्री', 'धुलाई, दाग हटाना, इस्त्री और कपड़े मोड़ना।'),
    ('upholstery-cleaning', 'कपड़ा सफाई', 'परदों और घरेलू कपड़ों की विशेष सफाई।'),
    ('event-services', 'इवेंट सेवाएं', 'कार्यक्रमों से पहले और बाद की सफाई।')
)
insert into public.catalog_category_translations (category_id, language_code, name, description)
select c.id, 'hi', s.name, s.description
from seed s
join public.catalog_categories c on c.slug = s.slug
on conflict (category_id, language_code) do update set
  name = excluded.name,
  description = excluded.description,
  deleted_at = null,
  updated_at = timezone('utc'::text, now());

-- Services and packages
with seed(slug, name, description, offer_tag) as (
  values
    ('deep-cleaning', 'डीप क्लीनिंग', 'घरों, कार्यालयों और व्यावसायिक स्थानों के लिए ऊपर से नीचे तक गहन सफाई।', null),
    ('regular-cleaning', 'नियमित सफाई', 'घरों और कार्यालयों के लिए भरोसेमंद नियमित सफाई, दैनिक, साप्ताहिक या दो-सप्ताह के शेड्यूल के अनुसार।', null),
    ('floor-cleaning', 'फर्श की सफाई', 'टाइल, संगमरमर, ग्रेनाइट, विनाइल, लैमिनेट, लकड़ी और कंक्रीट के फर्श की पेशेवर सफाई।', null),
    ('carpet-cleaning', 'कालीन की सफाई', 'गहरी सैनिटाइजेशन से धूल के कण, एलर्जी, बैक्टीरिया, दुर्गंध और जमी हुई गंदगी हटती है।', null),
    ('mattress-cleaning', 'गद्दे की सफाई', 'गद्दों के लिए गहरी स्वच्छता, एलर्जी हटाना, दाग उपचार और दुर्गंध दूर करना।', null),
    ('sofa-cleaning', 'सोफे की सफाई', 'कपड़े, चमड़े, साबर और माइक्रोफाइबर के सोफे की सफाई, दाग और दुर्गंध हटाने के साथ।', null),
    ('curtain-cleaning', 'परदों की सफाई', 'कपड़े को सुरक्षित रखते हुए धूल, एलर्जी और दाग हटाने वाली पेशेवर परदा सफाई।', null),
    ('office-cleaning', 'कार्यालय की सफाई', 'कार्यस्थल की व्यवस्थित सफाई, सैनिटाइजेशन, फर्श की देखभाल, पैंट्री और शौचालय की सफाई।', null),
    ('housekeeping-part-time-maid', 'हाउसकीपिंग / पार्ट-टाइम मेड', 'सफाई, कपड़े धोने में सहायता, बर्तन धोने और व्यवस्थित करने सहित लचीली घरेलू सहायता।', null),
    ('babysitting-at-home', 'घर पर बेबीसिटिंग', 'निगरानी, गतिविधियों, खाना खिलाने और लचीले समय के साथ भरोसेमंद घरेलू बाल देखभाल।', null),
    ('move-in-out-cleaning', 'घर में आने या छोड़ने की सफाई', 'घर में आने से पहले या खाली करने के बाद खाली घरों की पूरी सफाई।', null),
    ('party-cleaning', 'पार्टी के बाद सफाई', 'कार्यक्रम से पहले और बाद की सफाई, जिससे आपका स्थान जल्दी और पेशेवर तरीके से व्यवस्थित हो जाए।', null),
    ('wash-and-iron', 'धुलाई और इस्त्री', 'पेशेवर लॉन्ड्री देखभाल, दाग उपचार, इस्त्री, कपड़े मोड़ना और वैकल्पिक डिलीवरी।', null),
    ('pet-sitting', 'पालतू जानवरों की देखभाल', 'खाना खिलाना, खेलना, साथ देना और लचीले समय सहित भरोसेमंद पालतू देखभाल।', null)
)
insert into public.catalog_item_translations (item_id, language_code, name, short_description, description, metadata)
select i.id, 'hi', s.name, s.description, s.description,
  case when s.offer_tag is null then '{}'::jsonb else jsonb_build_object('offer_tag', s.offer_tag) end
from seed s
join public.catalog_items i on i.slug = s.slug
on conflict (item_id, language_code) do update set
  name = excluded.name,
  short_description = excluded.short_description,
  description = excluded.description,
  metadata = excluded.metadata,
  deleted_at = null,
  updated_at = timezone('utc'::text, now());

-- Offers
with seed(slug, title, description, category, offer_tag) as (
  values
    ('offer-welcome', 'नए ग्राहकों के लिए स्वागत ऑफर', 'बिना जोखिम हमें एक बार आज़माएं। आपके अपार्टमेंट या स्टूडियो के लिए पेशेवर डीप क्लीनिंग।', 'डीप क्लीनिंग', 'लोकप्रिय उपहार'),
    ('offer-timesaving', 'समय बचाने वाला शानदार ऑफर', 'व्यस्त घरों के लिए बेहतरीन मूल्य। बिना लंबे समय की प्रतिबद्धता के स्वच्छ और शांत घर में प्रवेश करें।', 'वैल्यू पैक', 'सबसे अधिक बिकने वाला'),
    ('offer-freshness', 'पूरे घर की ताज़गी बढ़ाएं', 'उच्च स्तर की स्वच्छता। बैक्टीरिया और कीटाणुओं को हटाएं और अपने घर का आराम फिर से पाएं।', 'सैनिटाइजेशन', 'सर्वाधिक रेटेड'),
    ('pkg-essential', 'एसेंशियल होम रिफ्रेश पैकेज', 'एक बेडरूम वाले अपार्टमेंट के लिए आदर्श। होटल मानकों के अनुसार सैनिटाइजेशन के साथ पूरा आराम और नियंत्रण।', 'पैकेज', 'विशेष'),
    ('pkg-family', 'फैमिली कम्फर्ट डीलक्स पैकेज', 'पारिवारिक आराम और बेहतरीन स्वच्छता का मेल। बच्चों और पालतू जानवरों वाले घरों के लिए विशेष रूप से तैयार।', 'पैकेज', 'लोकप्रिय'),
    ('pkg-villa', 'विला सेरेनिटी डीप रिस्टोरेशन', 'विला की पूरी बहाली। हर कोने और हर सतह को सटीकता से साफ किया जाता है।', 'विला पैकेज', 'विला स्पेशल'),
    ('offer-villa-complete', 'विला की पूरी अंदरूनी और बाहरी सफाई', 'एक साथ काम करने वाली दो विशेष टीमों के साथ आपकी विला को पूरी तरह नया रूप दें।', 'प्रीमियम विला पैकेज', 'वीआईपी ऑफर')
)
insert into public.deal_translations (deal_id, language_code, title, description, metadata)
select d.id, 'hi', s.title, s.description,
  jsonb_build_object('category', s.category, 'offer_tag', s.offer_tag)
from seed s
join public.deals d on d.slug = s.slug
on conflict (deal_id, language_code) do update set
  title = excluded.title,
  description = excluded.description,
  metadata = excluded.metadata,
  deleted_at = null,
  updated_at = timezone('utc'::text, now());

notify pgrst, 'reload schema';
commit;
