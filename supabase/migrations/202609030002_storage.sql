-- Storage bucket and policies for public menu/branding images.

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'menu-images',
  'menu-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read menu images" on storage.objects;
create policy "Public can read menu images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'menu-images');

drop policy if exists "Authenticated admins can upload menu images" on storage.objects;
create policy "Authenticated admins can upload menu images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'menu-images');

drop policy if exists "Authenticated admins can update menu images" on storage.objects;
create policy "Authenticated admins can update menu images"
on storage.objects
for update
to authenticated
using (bucket_id = 'menu-images')
with check (bucket_id = 'menu-images');

drop policy if exists "Authenticated admins can delete menu images" on storage.objects;
create policy "Authenticated admins can delete menu images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'menu-images');
