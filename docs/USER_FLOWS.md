# Palestra User Flows & Data Consistency

## Цель
Документировать все логические пути пользователей и обеспечить консистентность данных во всех ролях и функциях.

---

## 1. Филиал (Location) - Создание и распространение

### Путь: Admin создает новый филиал

**Действие:** Admin → Settings → Locations → Create New

**Данные, которые должны обновиться:**
1. ✅ `locations` в AdminContext
2. ✅ Отображение в dropdown у Members (branch selection)
3. ✅ Отображение в dropdown у Groups (location selection)
4. ✅ Отображение в Schedule (location filter)
5. ✅ Отображение в Shop (location filter)
6. ✅ Отображение в Events (location context)

**Роли, которые должны видеть:**
- Admin: ✅ Полный доступ
- Coach: ✅ Видят филиалы своего клуба
- Student: ✅ Видят свой филиал
- Parent: ✅ Видят филиал своего ребенка

**Проверка:** После создания филиала он должен появиться везде сразу

---

## 2. Группа (Group) - Создание и распространение

### Путь: Admin создает новую группу

**Действие:** Admin → Groups → Create New

**Данные, которые должны обновиться:**
1. ✅ `groups` в AdminContext
2. ✅ Отображение в Groups list
3. ✅ Отображение в Members (group assignment)
4. ✅ Отображение в Schedule (group selection)
5. ✅ Отображение в Events (group selection)
6. ✅ Отображение в Coach dashboard (my groups)

**Роли, которые должны видеть:**
- Admin: ✅ Все группы
- Coach: ✅ Только свои группы (по coachId)
- Student: ✅ Свою группу
- Parent: ✅ Группу своего ребенка

**Проверка:** После создания группа должна быть доступна для назначения членам

---

## 3. Член (Member) - Создание и распространение

### Путь: Admin создает нового члена

**Действие:** Admin → Members → Create New

**Данные, которые должны обновиться:**
1. ✅ `members` в AdminContext
2. ✅ Отображение в Members list
3. ✅ Возможность назначить в группу
4. ✅ Отображение в Schedule (attendance)
5. ✅ Отображение в Events (participants)
6. ✅ Отображение в Shop (orders)
7. ✅ Отображение в Finances (balance)

**Роли, которые должны видеть:**
- Admin: ✅ Все члены
- Coach: ✅ Члены своих групп
- Student: ✅ Себя и своих одноклассников
- Parent: ✅ Своего ребенка

**Проверка:** Новый член должен появиться в списке и быть доступным для всех операций

---

## 4. Расписание (Schedule) - Создание и распространение

### Путь: Coach/Admin создает класс

**Действие:** Schedule → Add Class

**Данные, которые должны обновиться:**
1. ✅ `schedule` в AdminContext
2. ✅ Отображение в Schedule calendar
3. ✅ Отображение в Student schedule
4. ✅ Отображение в Parent schedule (для их детей)
5. ✅ Отображение в Coach schedule (только свои)

**Роли, которые должны видеть:**
- Admin: ✅ Все классы
- Coach: ✅ Только свои классы
- Student: ✅ Классы своей группы
- Parent: ✅ Классы своего ребенка

**Проверка:** Класс должен появиться в расписании для всех релевантных ролей

---

## 5. Посещаемость (Attendance) - Отметить и распространить

### Путь: Coach отмечает посещаемость

**Действие:** Schedule → Select Class → Mark Attendance

**Данные, которые должны обновиться:**
1. ✅ `attendance` в AdminContext
2. ✅ Отображение в Student dashboard (my attendance)
3. ✅ Отображение в Parent dashboard (child attendance)
4. ✅ Отображение в Admin reports

**Роли, которые должны видеть:**
- Admin: ✅ Все посещаемости
- Coach: ✅ Посещаемость своих классов
- Student: ✅ Свою посещаемость
- Parent: ✅ Посещаемость своего ребенка

**Проверка:** После отметки посещаемость должна быть видна в dashboard

---

## 6. План (Plan) - Назначение и распространение

### Путь: Admin назначает план члену

**Действие:** Members → Edit → Select Plan

**Данные, которые должны обновиться:**
1. ✅ `members[].plan` в AdminContext
2. ✅ Отображение в Member card
3. ✅ Отображение в Finances tab
4. ✅ Отображение в Student dashboard (my plan)
5. ✅ Отображение в Parent dashboard (child plan)

**Роли, которые должны видеть:**
- Admin: ✅ Все планы членов
- Coach: ✅ Планы членов своих групп
- Student: ✅ Свой план
- Parent: ✅ План своего ребенка

**Проверка:** План должен отобразиться везде после назначения

---

## 7. Баланс счета (Balance) - Обновление и распространение

### Путь: Admin обновляет баланс

**Действие:** Members → Edit → Finances → Update Balance

**Данные, которые должны обновиться:**
1. ✅ `members[].balance` в AdminContext
2. ✅ Отображение в Member card
3. ✅ Отображение в Finances tab
4. ✅ Отображение в Student dashboard (my balance)
5. ✅ Отображение в Parent dashboard (child balance)
6. ✅ Отображение в Shop (available balance for purchase)

**Роли, которые должны видеть:**
- Admin: ✅ Все балансы
- Coach: ✅ Балансы членов своих групп
- Student: ✅ Свой баланс
- Parent: ✅ Баланс своего ребенка

**Проверка:** Баланс должен обновиться везде после изменения

---

## 8. Событие (Event) - Создание и распространение

### Путь: Admin создает событие

**Действие:** Events → Create New

**Данные, которые должны обновиться:**
1. ✅ `events` в AdminContext
2. ✅ Отображение в Events list
3. ✅ Отображение в Student dashboard (upcoming events)
4. ✅ Отображение в Parent dashboard (child events)
5. ✅ Отображение в Coach dashboard (my events)

**Роли, которые должны видеть:**
- Admin: ✅ Все события
- Coach: ✅ События своих групп
- Student: ✅ События своей группы
- Parent: ✅ События своего ребенка

**Проверка:** Событие должно появиться для всех релевантных ролей

---

## 9. Товар (Product) - Создание и распространение

### Путь: Admin создает товар

**Действие:** Shop → Products → Create New

**Данные, которые должны обновиться:**
1. ✅ `products` в AdminContext
2. ✅ Отображение в Shop browse
3. ✅ Отображение в Student shop
4. ✅ Отображение в Parent shop (для покупки для ребенка)

**Роли, которые должны видеть:**
- Admin: ✅ Все товары (edit/delete)
- Coach: ✅ Все товары (browse)
- Student: ✅ Все товары (browse/buy)
- Parent: ✅ Все товары (browse/buy for child)

**Проверка:** Товар должен появиться в shop для всех

---

## 10. Заказ (Order) - Создание и распространение

### Путь: Student/Parent заказывает товар

**Действие:** Shop → Browse → Select Product → Place Order

**Данные, которые должны обновиться:**
1. ✅ `orders` в AdminContext
2. ✅ `members[].balance` уменьшается на сумму
3. ✅ Отображение в Orders list (Admin)
4. ✅ Отображение в Student dashboard (my orders)
5. ✅ Отображение в Parent dashboard (child orders)

**Роли, которые должны видеть:**
- Admin: ✅ Все заказы
- Coach: ✅ Заказы членов своих групп
- Student: ✅ Свои заказы
- Parent: ✅ Заказы своего ребенка

**Проверка:** Заказ должен появиться везде и баланс должен обновиться

---

## 11. Достижение (Achievement) - Выдача и распространение

### Путь: Coach выдает достижение

**Действие:** Member Card → Award Achievement

**Данные, которые должны обновиться:**
1. ✅ `achievements` в AdminContext
2. ✅ Отображение в Member card
3. ✅ Отображение в Student dashboard (my achievements)
4. ✅ Отображение в Parent dashboard (child achievements)
5. ✅ Отображение в Leaderboard

**Роли, которые должны видеть:**
- Admin: ✅ Все достижения
- Coach: ✅ Достижения членов своих групп
- Student: ✅ Свои достижения
- Parent: ✅ Достижения своего ребенка

**Проверка:** Достижение должно появиться везде после выдачи

---

## 12. Пост (Post) - Создание и распространение

### Путь: User создает пост в социальной сети

**Действие:** Social Feed → Create Post

**Данные, которые должны обновиться:**
1. ✅ `posts` в AdminContext/SocialContext
2. ✅ Отображение в Social Feed
3. ✅ Отображение в User profile
4. ✅ Отображение в Followers feed

**Роли, которые должны видеть:**
- Admin: ✅ Все посты (moderation)
- Coach: ✅ Посты своего клуба
- Student: ✅ Посты своего клуба
- Parent: ✅ Посты своего клуба

**Проверка:** Пост должен появиться в ленте для всех членов клуба

---

## Критические проверки

### ✅ Все операции должны быть синхронизированы

```javascript
// ДО (неправильно):
const filteredMembers = members.filter(...) // может быть undefined!

// ПОСЛЕ (правильно):
const filteredMembers = (Array.isArray(members) ? members : []).filter(...)
```

### ✅ Все dropdown/select должны быть защищены

```javascript
// ДО (неправильно):
{locations.map(l => <option>{l.name}</option>)} // crash if undefined

// ПОСЛЕ (правильно):
{(Array.isArray(locations) ? locations : []).map(l => <option>{l.name}</option>)}
```

### ✅ Все условные отображения должны быть безопасными

```javascript
// ДО (неправильно):
{groups && groups.map(...)} // still crashes if groups is not array

// ПОСЛЕ (правильно):
{(Array.isArray(groups) ? groups : []).map(...)}
```

---

## Тестовые сценарии

### Сценарий 1: Создание филиала
1. Admin создает филиал "Филиал 2"
2. Проверить, что филиал появляется в dropdown у Members
3. Проверить, что филиал появляется в dropdown у Groups
4. Проверить, что филиал появляется в Schedule filter
5. ✅ PASS

### Сценарий 2: Создание группы
1. Admin создает группу "Боксеры" в "Филиал 1"
2. Проверить, что группа появляется в Groups list
3. Проверить, что группа доступна при создании Member
4. Проверить, что Coach видит группу в своем dashboard
5. ✅ PASS

### Сценарий 3: Назначение Member в группу
1. Admin создает Member "Иван"
2. Admin назначает Member в группу "Боксеры"
3. Проверить, что Member появляется в Groups card (studentCount)
4. Проверить, что Member видит свою группу в dashboard
5. Проверить, что Coach видит Member в своей группе
6. ✅ PASS

### Сценарий 4: Отметить посещаемость
1. Coach отмечает посещаемость для класса
2. Проверить, что посещаемость появляется в Student dashboard
3. Проверить, что посещаемость появляется в Parent dashboard
4. Проверить, что Admin видит посещаемость в reports
5. ✅ PASS

### Сценарий 5: Обновить баланс
1. Admin обновляет баланс Member на 10000 ₸
2. Проверить, что баланс появляется в Member card
3. Проверить, что баланс появляется в Student dashboard
4. Проверить, что баланс появляется в Parent dashboard
5. Проверить, что Student может купить товар с этим балансом
6. ✅ PASS

---

## Статус исправлений

- ✅ Все `.map()` вызовы защищены с `Array.isArray()`
- ✅ Валидация даты рождения (мин 1900, нет 30 февраля)
- ✅ FilePicker с большой карточкой и кнопкой удаления
- ✅ CopyToast уведомление при копировании
- ✅ Schedule, GroupForm, MemberForm, Members, Events, Shop, Groups исправлены
- ⏳ Требуется полное тестирование всех путей
- ⏳ Требуется проверка консистентности данных между ролями

