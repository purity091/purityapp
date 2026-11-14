-- Purity French catalog translations.
-- Run after supabase_multilingual_catalog.sql and supabase_catalog_seed.sql.
-- Safe to re-run: rows are upserted by the parent ID and language code.
-- Prices, images, IDs and booking data remain shared with the base catalog.

begin;

-- Categories
with seed(slug, name, description) as (
  values
    ('home-cleaning', 'Nettoyage résidentiel', 'Services de nettoyage pour maisons et appartements.'),
    ('furniture', 'Mobilier', 'Nettoyage et entretien des matelas et des canapés.'),
    ('flooring', 'Sols', 'Nettoyage professionnel des différents types de sols.'),
    ('commercial', 'Professionnel', 'Solutions de nettoyage pour bureaux et espaces commerciaux.'),
    ('care', 'Garde et assistance', 'Services fiables de garde d’enfants et d’animaux.'),
    ('laundry', 'Blanchisserie', 'Lavage, traitement des taches, repassage et pliage.'),
    ('upholstery-cleaning', 'Nettoyage des tissus', 'Nettoyage spécialisé des rideaux et des textiles d’intérieur.'),
    ('event-services', 'Services événementiels', 'Nettoyage avant et après les événements.')
)
insert into public.catalog_category_translations (category_id, language_code, name, description)
select c.id, 'fr', s.name, s.description
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
    ('deep-cleaning', 'Nettoyage en profondeur', 'Nettoyage intensif de fond en comble pour les maisons, bureaux et espaces commerciaux.', null),
    ('regular-cleaning', 'Nettoyage régulier', 'Nettoyage courant fiable pour les maisons et bureaux, programmé quotidiennement, chaque semaine ou toutes les deux semaines.', null),
    ('floor-cleaning', 'Nettoyage des sols', 'Nettoyage professionnel des sols en carrelage, marbre, granit, vinyle, stratifié, bois et béton.', null),
    ('carpet-cleaning', 'Nettoyage des tapis', 'Désinfection en profondeur qui élimine acariens, allergènes, bactéries, odeurs et taches incrustées.', null),
    ('mattress-cleaning', 'Nettoyage des matelas', 'Hygiène en profondeur, élimination des allergènes, traitement des taches et désodorisation des matelas.', null),
    ('sofa-cleaning', 'Nettoyage des canapés', 'Nettoyage des canapés en tissu, cuir, daim ou microfibre, avec élimination des taches et des odeurs.', null),
    ('curtain-cleaning', 'Nettoyage des rideaux', 'Nettoyage professionnel des rideaux qui protège les fibres tout en éliminant poussière, allergènes et taches.', null),
    ('office-cleaning', 'Nettoyage de bureaux', 'Nettoyage structuré des espaces de travail, désinfection, entretien des sols, de la cuisine et des sanitaires.', null),
    ('housekeeping-part-time-maid', 'Ménage / aide ménagère à temps partiel', 'Assistance flexible à domicile : nettoyage, aide à la lessive, vaisselle et rangement.', null),
    ('babysitting-at-home', 'Garde d’enfants à domicile', 'Garde d’enfants fiable à domicile avec surveillance, activités, repas et horaires flexibles.', null),
    ('move-in-out-cleaning', 'Nettoyage avant ou après déménagement', 'Nettoyage complet des logements vides avant l’emménagement ou après le départ.', null),
    ('party-cleaning', 'Nettoyage après fête', 'Nettoyage avant et après événement pour remettre rapidement votre lieu en parfait état.', null),
    ('wash-and-iron', 'Lavage et repassage', 'Entretien professionnel du linge, traitement des taches, repassage, pliage et livraison en option.', null),
    ('pet-sitting', 'Garde d’animaux', 'Garde fiable des animaux : repas, jeux, compagnie et horaires flexibles.', null)
)
insert into public.catalog_item_translations (item_id, language_code, name, short_description, description, metadata)
select i.id, 'fr', s.name, s.description, s.description,
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
    ('offer-welcome', 'Offre de bienvenue pour nouveaux clients', 'Essayez-nous sans risque. Un nettoyage en profondeur professionnel pour votre appartement ou studio.', 'Nettoyage en profondeur', 'Cadeau populaire'),
    ('offer-timesaving', 'Offre ultime pour gagner du temps', 'Une valeur exceptionnelle pour les foyers actifs. Retrouvez une maison plus propre et plus sereine sans engagement à long terme.', 'Pack avantage', 'Meilleure vente'),
    ('offer-freshness', 'Boost fraîcheur totale de la maison', 'Hygiène de niveau supérieur. Éliminez bactéries et germes tout en retrouvant le confort de votre maison.', 'Désinfection', 'Mieux notée'),
    ('pkg-essential', 'Pack essentiel de rafraîchissement du logement', 'Idéal pour les appartements d’une chambre. Confort et contrôle complets, avec une désinfection aux standards hôteliers.', 'Pack', 'Exclusif'),
    ('pkg-family', 'Pack confort familial deluxe', 'Le confort familial associé à une hygiène irréprochable. Spécialement conçu pour les maisons avec enfants et animaux.', 'Pack', 'Populaire'),
    ('pkg-villa', 'Restauration en profondeur Villa Sérénité', 'Restauration complète de la villa. Chaque recoin et chaque surface sont traités avec précision.', 'Pack villa', 'Spécial villa'),
    ('offer-villa-complete', 'Nettoyage complet intérieur et extérieur de villa', 'Votre villa entièrement renouvelée par deux équipes spécialisées travaillant simultanément.', 'Pack villa premium', 'Offre VIP')
)
insert into public.deal_translations (deal_id, language_code, title, description, metadata)
select d.id, 'fr', s.title, s.description,
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
