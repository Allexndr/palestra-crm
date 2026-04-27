insert into public.clubs (id, name, logo_blob_url, primary_color, city, address)
values (
  '00000000-0000-0000-0000-000000000001',
  'Palestra Fight Club',
  '/palestra-logo-nav-full.png',
  '#3146A6',
  'Алматы',
  'ул. Абая, 10'
)
on conflict (id) do update set
  name = excluded.name,
  logo_blob_url = excluded.logo_blob_url,
  primary_color = excluded.primary_color,
  updated_at = now();

insert into public.app_state (club_id, state)
values (
  '00000000-0000-0000-0000-000000000001',
  '{
    "members": [
      { "id": "m1", "firstName": "Артем", "lastName": "Иванов", "login": "student", "parentId": "p1", "groupId": "g1", "points": 450, "level": "Опытный", "sport": "Бокс", "plan": "Стандарт", "strength": 75, "speed": 80, "technique": 65, "endurance": 90, "avatar": "" },
      { "id": "m2", "firstName": "Кирилл", "lastName": "Петров", "login": "kirill", "parentId": "p1", "groupId": "g1", "points": 120, "level": "Новичок", "sport": "Бокс", "plan": "Стандарт", "strength": 40, "speed": 55, "technique": 30, "endurance": 45, "avatar": "" }
    ],
    "leads": [{ "id": "l1", "name": "Марина Соколова", "phone": "+7 707 123 4567", "sport": "MMA", "status": "new" }],
    "schedule": [{ "id": "s1", "groupName": "Младшая группа (Бокс)", "time": "15:00", "day": "Пн", "days": ["Пн", "Ср", "Пт"], "coach": "Тренер", "coachName": "Тренер", "type": "Бокс", "color": "#3146A6", "locationId": "1" }],
    "locations": [{ "id": "1", "name": "Центральный зал", "address": "ул. Абая, 10", "isActive": true }],
    "groups": [{ "id": "g1", "name": "Младшая группа (Бокс)", "coachId": "c1", "sport": "Бокс", "locationId": "1" }],
    "activities": [],
    "leagues": [],
    "plans": [],
    "posts": [],
    "coaches": [],
    "events": [],
    "attendance": [],
    "finances": { "revenue": 0, "transactions": [] },
    "achievements": [],
    "monthlyAward": { "title": "", "description": "", "daysLeft": 0 },
    "selectedLocationId": "all",
    "clubInfo": { "name": "Palestra Fight Club", "logo": "/palestra-logo-nav-full.png", "primaryColor": "#3146A6" },
    "shop": { "products": [], "orders": [] }
  }'::jsonb
)
on conflict (club_id) do nothing;
