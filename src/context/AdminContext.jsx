import React, { createContext, useContext, useState, useEffect } from 'react';
import { readJson, isObject } from '../utils/safeJson';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

const defaultMembers = [
  { id: 'm1', firstName: 'Артем', lastName: 'Иванов', login: 'student', parentId: 'p1', groupId: 'g1', points: 450, level: 'Опытный', sport: 'Бокс', plan: 'Стандарт', strength: 75, speed: 80, technique: 65, endurance: 90, avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: 'm2', firstName: 'Кирилл', lastName: 'Петров', login: 'kirill', parentId: 'p1', groupId: 'g1', points: 120, level: 'Новичок', sport: 'Бокс', plan: 'Стандарт', strength: 40, speed: 55, technique: 30, endurance: 45, avatar: 'https://i.pravatar.cc/150?img=15' }
];
const defaultLeads = [
  { id: 'l1', name: 'Марина Соколова', phone: '+7 707 123 4567', sport: 'MMA', status: 'new', createdAt: new Date().toISOString() }
];
const defaultSchedule = [
  {
    id: 's1',
    groupName: 'Младшая группа (Бокс)',
    time: '15:00',
    day: 'Пн',
    days: ['Пн', 'Ср', 'Пт'],
    coach: 'Тренер',
    coachName: 'Тренер',
    type: 'Бокс',
    color: '#4338ca',
    locationId: '1',
  }
];

const defaultAttendance = [
  { id: 'att1', sessionId: 's1', memberIds: ['m1', 'm2'], date: new Date().toISOString() },
  { id: 'att2', sessionId: 's1', memberIds: ['m1'], date: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 'att3', sessionId: 's1', memberIds: ['m2'], date: new Date(Date.now() - 86400000 * 5).toISOString() },
];

const defaultAchievements = [
  {
    id: 'ach1',
    title: 'Железный кулак',
    desc: '10 тренировок подряд',
    color: '#EEF2FF',
    iconColor: '#4338CA',
    memberIds: ['m1'],
  },
  {
    id: 'ach2',
    title: 'Вечный двигатель',
    desc: 'Лучшая выносливость месяца',
    color: '#ECFDF5',
    iconColor: '#10B981',
    memberIds: ['m1', 'm2'],
  },
];

function normalizeFinances(v) {
  if (!isObject(v)) return { revenue: 0, transactions: [] };
  return {
    revenue: typeof v.revenue === 'number' ? v.revenue : 0,
    transactions: Array.isArray(v.transactions) ? v.transactions : [],
  };
}

function normalizeClubInfo(v) {
  if (!isObject(v)) {
    return { name: 'Palestra Fight Club', logo: '/palestra-logo-nav-full.png', primaryColor: '#4338ca' };
  }
  const logo =
    typeof v.logo === 'string' && v.logo.trim() ? v.logo.trim() : '/palestra-logo-nav-full.png';
  const normalizedLogo =
    logo === '/favicon.svg' || logo === '/logo.png' || logo === '/palestra-logo-nav.png'
      ? '/palestra-logo-nav-full.png'
      : logo;
  return {
    name: typeof v.name === 'string' && v.name.trim() ? v.name.trim() : 'Palestra Fight Club',
    logo: normalizedLogo,
    primaryColor: typeof v.primaryColor === 'string' ? v.primaryColor : '#4338ca',
  };
}

function normalizeMonthlyAward(v) {
  if (!isObject(v)) return { title: '', description: '', daysLeft: 0 };
  return {
    title: v.title != null ? String(v.title) : '',
    description: v.description != null ? String(v.description) : '',
    daysLeft: typeof v.daysLeft === 'number' ? v.daysLeft : 0,
  };
}

/** Совместимость: сетка использует `day`, старые данные — только `days`. */
function normalizeScheduleList(arr) {
  if (!Array.isArray(arr)) return arr;
  return arr.map((row) => {
    if (!isObject(row)) return row;
    if (!row.day && Array.isArray(row.days) && row.days[0]) {
      return { ...row, day: row.days[0] };
    }
    return row;
  });
}

function ensureDemoMembers(arr) {
  if (!Array.isArray(arr)) return defaultMembers;
  const existingIds = new Set(arr.map((m) => m?.id).filter(Boolean));
  const hasParentChild = arr.some((m) => m?.parentId === 'p1');
  const next = [...arr];

  defaultMembers.forEach((member) => {
    if (!existingIds.has(member.id)) {
      next.push(member);
    }
  });

  if (!hasParentChild) {
    return next.map((m) => (m.id === 'm1' || m.id === 'm2' ? { ...m, parentId: 'p1' } : m));
  }

  return next;
}

function ensureAttendanceFixtures(arr) {
  if (!Array.isArray(arr)) return defaultAttendance;
  const hasDemoAttendance = arr.some((a) => Array.isArray(a?.memberIds) && (a.memberIds.includes('m1') || a.memberIds.includes('m2')));
  return hasDemoAttendance ? arr : defaultAttendance;
}

function ensureAchievementFixtures(arr) {
  if (!Array.isArray(arr)) return defaultAchievements;
  return arr.length > 0 ? arr : defaultAchievements;
}

export const AdminProvider = ({ children }) => {
  const [members, setMembers] = useState(() => ensureDemoMembers(readJson('palestra_members', defaultMembers, (v) => Array.isArray(v))));
  const [leads, setLeads] = useState(() => readJson('palestra_leads', defaultLeads, (v) => Array.isArray(v)));
  const [schedule, setSchedule] = useState(() => {
    const raw = readJson('palestra_schedule', defaultSchedule, (v) => Array.isArray(v));
    return normalizeScheduleList(raw);
  });
  const [locations, setLocations] = useState(() => readJson('palestra_locations', [
    { id: '1', name: 'Центральный зал', address: 'ул. Абая, 10', isActive: true }
  ], (v) => Array.isArray(v)));
  const [groups, setGroups] = useState(() => readJson('palestra_groups', [
    { id: 'g1', name: 'Младшая группа (Бокс)', coachId: 'c1', sport: 'Бокс', locationId: '1' }
  ], (v) => Array.isArray(v)));
  const [activities, setActivities] = useState(() => readJson('palestra_activities', [
    { id: 'a1', text: 'Артем Иванов получил ачивку "Первая кровь"', type: 'success', date: new Date().toISOString() },
    { id: 'a2', text: 'Новая оплата от Марина С.', type: 'info', date: new Date().toISOString() }
  ], (v) => Array.isArray(v)));
  const [sports] = useState([
    'Бокс', 'ММА', 'Бразильское джиу-джитсу', 'Каратэ', 'Дзюдо', 'Кикбоксинг', 'Грэпплинг', 'Тайский бокс'
  ]);
  const [leagues, setLeagues] = useState(() => readJson('palestra_leagues', [], (v) => Array.isArray(v)));
  const [plans, setPlans] = useState(() => readJson('palestra_plans', [], (v) => Array.isArray(v)));
  const [posts, setPosts] = useState(() => readJson('palestra_posts', [], (v) => Array.isArray(v)));
  const [coaches, setCoaches] = useState(() => readJson('palestra_coaches', [], (v) => Array.isArray(v)));
  const [events, setEvents] = useState(() => readJson('palestra_events', [], (v) => Array.isArray(v)));
  const [attendance, setAttendance] = useState(() => ensureAttendanceFixtures(readJson('palestra_attendance', defaultAttendance, (v) => Array.isArray(v))));
  const [finances, setFinances] = useState(() => normalizeFinances(readJson('palestra_finances', { revenue: 0, transactions: [] }, (v) => isObject(v))));

  const [achievements, setAchievements] = useState(() => ensureAchievementFixtures(readJson('palestra_achievements', defaultAchievements, (v) => Array.isArray(v))));

  const [monthlyAward, setMonthlyAward] = useState(() => normalizeMonthlyAward(readJson('palestra_monthly_award', { title: '', description: '', daysLeft: 0 }, (v) => isObject(v))));

  const [selectedLocationId, setSelectedLocationId] = useState(() => localStorage.getItem('palestra_selected_location') || 'all');
  const [clubInfo, setClubInfo] = useState(() => normalizeClubInfo(readJson('palestra_club_info', { name: 'Palestra Fight Club', logo: '/palestra-logo-nav-full.png', primaryColor: '#4338ca' }, (v) => isObject(v))));
  const [user, setUser] = useState(() => readJson('palestra_user', null, (v) => v === null || isObject(v)));

  useEffect(() => {
    localStorage.setItem('palestra_members', JSON.stringify(members));
    localStorage.setItem('palestra_leads', JSON.stringify(leads));
    localStorage.setItem('palestra_schedule', JSON.stringify(schedule));
    localStorage.setItem('palestra_locations', JSON.stringify(locations));
    localStorage.setItem('palestra_groups', JSON.stringify(groups));
    localStorage.setItem('palestra_leagues', JSON.stringify(leagues));
    localStorage.setItem('palestra_plans', JSON.stringify(plans));
    localStorage.setItem('palestra_posts', JSON.stringify(posts));
    localStorage.setItem('palestra_coaches', JSON.stringify(coaches));
    localStorage.setItem('palestra_events', JSON.stringify(events));
    localStorage.setItem('palestra_attendance', JSON.stringify(attendance));
    localStorage.setItem('palestra_finances', JSON.stringify(finances));
    localStorage.setItem('palestra_achievements', JSON.stringify(achievements));
    localStorage.setItem('palestra_monthly_award', JSON.stringify(monthlyAward));
    localStorage.setItem('palestra_activities', JSON.stringify(activities));
    localStorage.setItem('palestra_selected_location', selectedLocationId);
    localStorage.setItem('palestra_club_info', JSON.stringify(clubInfo));
    if (user) localStorage.setItem('palestra_user', JSON.stringify(user));
    else localStorage.removeItem('palestra_user');
  }, [members, leads, schedule, locations, groups, leagues, plans, posts, events, attendance, finances, achievements, monthlyAward, user, selectedLocationId, clubInfo, activities]);

  // --- ACTIONS ---

  const logActivity = (text, type = 'info') => {
    const newActivity = {
      id: Date.now().toString(),
      text,
      type,
      date: new Date().toISOString()
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 50));
  };

  const addGroup = (group) => {
    const newGroup = { ...group, id: Date.now().toString() };
    setGroups([...groups, newGroup]);
    logActivity(`Создана новая группа: ${group.name}`, 'info');
  };

  const updateGroup = (id, updatedData) => {
    setGroups(groups.map(g => g.id === id ? { ...g, ...updatedData } : g));
  };

  const removeGroup = (id) => {
    const group = groups.find(g => g.id === id);
    setGroups(groups.filter(g => g.id !== id));
    setMembers(members.map(m => m.groupId === id ? { ...m, groupId: '' } : m));
    if (group) logActivity(`Удалена группа: ${group.name}`, 'warning');
  };

  const addLeague = (leagueData) => {
    const newLeague = { 
      ...leagueData, 
      id: Date.now().toString(), 
      status: 'active',
      participantIds: leagueData.participantIds || [],
      groupIds: leagueData.groupIds || []
    };
    setLeagues(prev => [...prev, newLeague]);
    logActivity(`Запущен новый сезон лиги: ${leagueData.name}`, 'success');
  };

  const updateLeagueParticipants = (id, { participantIds, groupIds }) => {
    setLeagues(prev => prev.map(l => l.id === id ? { ...l, participantIds, groupIds } : l));
  };

  const removeLeague = (id) => {
    const league = leagues.find(l => l.id === id);
    setLeagues(prev => prev.filter(l => l.id !== id));
    if (league) logActivity(`Удалена лига: ${league.name}`, 'warning');
  };

  const updateLeague = (id, updatedData) => {
    setLeagues(prev => prev.map(l => l.id === id ? { ...l, ...updatedData } : l));
  };

  const login = (role) => {
    const userData = {
      role,
      id: role === 'parent' ? 'p1' : role === 'student' ? 'm1' : role === 'coach' ? 'c1' : 'admin1',
      login: role,
      name: role === 'admin' ? 'Администратор' : role === 'coach' ? 'Тренер' : role === 'parent' ? 'Александр Иванов' : 'Артем Иванов',
      email: `${role}@palestra.fit`
    };
    setUser(userData);
    logActivity(`Вход в систему: ${userData.name}`, 'info');
    return userData;
  };

  const logout = () => {
    if (user) logActivity(`Выход из системы: ${user.name}`, 'info');
    setUser(null);
  };

  const addMember = (memberData) => {
    const newMember = { 
      id: Date.now().toString(), 
      createdAt: new Date().toISOString(), 
      points: 0, 
      level: 'Новичок',
      avatar: `https://i.pravatar.cc/150?u=${Date.now()}`,
      ...memberData 
    };
    setMembers(prev => [...prev, newMember]);
    logActivity(`Новый ученик: ${memberData.firstName} ${memberData.lastName}`, 'success');
    if (memberData.paidAmount) {
      addTransaction({ amount: parseFloat(memberData.paidAmount), type: 'income', description: `Оплата: ${memberData.firstName} ${memberData.lastName}` });
    }
  };

  const removeMember = (id) => {
    const member = members.find(m => m.id === id);
    setMembers(prev => prev.filter(m => m.id !== id));
    if (member) logActivity(`Исключен ученик: ${member.firstName} ${member.lastName}`, 'warning');
  };
  
  const updateMember = (id, updatedData) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updatedData } : m));
  };

  const addLead = (leadData) => {
    const newLead = { id: Date.now().toString(), status: 'new', createdAt: new Date().toISOString(), ...leadData };
    setLeads(prev => [...prev, newLead]);
    logActivity(`Новый лид с сайта: ${leadData.name}`, 'info');
  };

  const updateLeadStatus = (id, newStatus) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  const removeLead = (id) => setLeads(prev => prev.filter(l => l.id !== id));

  const addScheduleItem = (itemData) => {
    const newItem = { id: Date.now().toString(), color: '#4338ca', ...itemData };
    setSchedule(prev => [...prev, newItem]);
    logActivity(`Добавлена тренировка в расписание: ${itemData.groupName}`, 'info');
  };

  const updateScheduleItem = (id, updatedData) => {
    setSchedule(prev => prev.map(item => item.id === id ? { ...item, ...updatedData } : item));
  };

  const removeScheduleItem = (id) => {
    setSchedule(prev => prev.filter(item => item.id !== id));
  };

  const addLocation = (locData) => {
    const newLoc = { id: Date.now().toString(), isActive: true, ...locData };
    setLocations(prev => [...prev, newLoc]);
    logActivity(`Добавлен новый филиал: ${locData.name}`, 'info');
  };

  const addPlan = (planData) => {
    const newPlan = { id: Date.now().toString(), ...planData };
    setPlans(prev => [...prev, newPlan]);
  };

  const removePlan = (id) => {
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  const addPost = (postData) => {
    const newPost = { 
      id: Date.now().toString(), 
      date: new Date().toISOString(), 
      likes: 0, 
      likedBy: [],
      comments: [],
      author: user?.name || 'Админ', 
      authorRole: user?.role || 'admin', 
      ...postData 
    };
    setPosts(prev => [newPost, ...prev]);
    logActivity(`Новая публикация в ленте: ${postData.title || 'Новость'}`, 'info');
  };

  const likePost = (id) => {
    if (!user) return;
    setPosts(prev => prev.map(post => {
      if (post.id === id) {
        const likedBy = post.likedBy || [];
        const isLiked = likedBy.includes(user.id || user.email);
        return {
          ...post,
          likedBy: isLiked ? likedBy.filter(u => u !== (user.id || user.email)) : [...likedBy, (user.id || user.email)],
          likes: isLiked ? (post.likes || 0) - 1 : (post.likes || 0) + 1
        };
      }
      return post;
    }));
  };

  const addComment = (postId, text) => {
    if (!user) return;
    const comment = {
      id: Date.now().toString(),
      author: user.name,
      text,
      date: new Date().toISOString()
    };
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [...(post.comments || []), comment] };
      }
      return post;
    }));
  };

  const addCoach = (coachData) => {
    const newCoach = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...coachData };
    setCoaches(prev => [...prev, newCoach]);
    logActivity(`Зарегистрирован тренер: ${coachData.name}`, 'success');
  };

  const removeCoach = (id) => setCoaches(prev => prev.filter(c => c.id !== id));

  const updateCoach = (id, updatedData) => {
    setCoaches(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
  };

  const addEvent = (eventData) => {
    const newEvent = { id: Date.now().toString(), participantIds: [], status: 'open', ...eventData };
    setEvents(prev => [...prev, newEvent]);
    logActivity(`Создано событие: ${eventData.title}`, 'info');
  };

  const updateEvent = (id, updatedData) => {
    setEvents(prev => prev.map(event => event.id === id ? { ...event, ...updatedData } : event));
  };

  const removeEvent = (id) => {
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const markAttendance = (classId, memberIds) => {
    const record = {
      id: Date.now().toString(),
      classId,
      date: new Date().toISOString(),
      memberIds
    };
    setAttendance(prev => [...prev, record]);
    
    // Reward points to members
    setMembers(prev => prev.map(m => {
      if (memberIds.includes(m.id)) {
        return { ...m, points: (m.points || 0) + 10 };
      }
      return m;
    }));
    logActivity(`Отмечено посещение: ${memberIds.length} учеников`, 'success');
  };

  const addTransaction = (transactionData) => {
    setFinances((prev) => {
      const safe = normalizeFinances(prev);
      const newTransaction = { id: Date.now().toString(), date: new Date().toISOString(), ...transactionData };
      const newRevenue = transactionData.type === 'income' ? safe.revenue + transactionData.amount : safe.revenue - transactionData.amount;
      return { revenue: newRevenue, transactions: [newTransaction, ...safe.transactions] };
    });
    logActivity(`${transactionData.type === 'income' ? 'Доход' : 'Расход'}: ${transactionData.amount} ₸ (${transactionData.description})`, transactionData.type === 'income' ? 'success' : 'warning');
  };

  const convertLeadToMember = (leadId) => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    // Add as member
    addMember({
      firstName: lead.name.split(' ')[0],
      lastName: lead.name.split(' ')[1] || '',
      phone: lead.phone,
      plan: 'Базовый',
      sport: lead.sport,
      locationId: lead.locationId || '1'
    });

    // Remove from leads
    removeLead(leadId);
    logActivity(`Лид сконвертирован в ученика: ${lead.name}`, 'success');
  };

  const updateMonthlyAward = (data) => {
    setMonthlyAward(prev => ({ ...prev, ...data }));
  };

  const addAchievement = (achData) => {
    const newAch = { 
      id: Date.now().toString(), 
      title: '', 
      desc: '', 
      icon: 'Trophy', 
      color: '#EEF2FF', 
      iconColor: '#4338ca',
      ...achData 
    };
    setAchievements(prev => [...prev, newAch]);
    logActivity(`Новое достижение клуба: ${achData.title}`, 'success');
  };

  const removeAchievement = (id) => {
    setAchievements(prev => prev.filter(a => a.id !== id));
  };

  const resetData = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('palestra_')) localStorage.removeItem(key);
    });
    window.location.reload();
  };

  const value = {
    members, addMember, removeMember, updateMember,
    leads, addLead, updateLeadStatus, removeLead, convertLeadToMember,
    schedule, addScheduleItem, updateScheduleItem, removeScheduleItem,
    locations, addLocation,
    groups, addGroup, updateGroup, removeGroup,
    sports,
    leagues, addLeague, removeLeague, updateLeague, updateLeagueParticipants,
    selectedLocationId, setSelectedLocationId,
    clubInfo, setClubInfo,
    plans, addPlan, removePlan,
    posts, addPost, likePost, addComment,
    coaches, addCoach, removeCoach, updateCoach,
    events, addEvent, updateEvent, removeEvent,
    attendance, markAttendance,
    finances, addTransaction,
    achievements, setAchievements, addAchievement, removeAchievement,
    monthlyAward, updateMonthlyAward,
    activities, logActivity,
    user, login, logout,
    resetData
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

