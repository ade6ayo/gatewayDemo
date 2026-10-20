-- Rebrand GeoHunt -> GeoQuest in data that is already live.
--
-- Migration 002 seeded post_template with the old branding and has already run,
-- so editing that file only affects fresh databases. This updates the live row.

update app_settings
set value = 'Just solved a #GeoQuestNG quest! Find yours at geoquest.app 🏆'
where key = 'post_template'
  and value like '%GeoHunt%';
