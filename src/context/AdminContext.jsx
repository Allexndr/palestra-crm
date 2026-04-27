import React, { createContext, useContext, useState, useEffect } from 'react';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

const daysAgo = (days) => new Date(Date.parse(new Date().toISOString()) - 86400000 * days).toISOString();

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
    (Number(c) ^ (Math.random() * 16 >> (Number(c) / 4))).toString(16)
  );
}

const defaultMembers = [];
const defaultLeads = [];
const defaultSchedule = [];
const defaultAttendance = [];
const defaultAchievements = [];

function normalizeFinances(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return { revenue: 0, transactions: [] };
  return {
    revenue: typeof v.revenue === 'number' ? v.revenue : 0,
    transactions: Array.isArray(v.transactions) ? v.transactions : [],
  };
}

function normalizeClubInfo(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) {
    return { name: 'Palestra Fight Club', logo: '/palestra-logo-nav-full.png', primaryColor: '#3146A6' };
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
    primaryColor: typeof v.primaryColor === 'string' ? v.primaryColor : '#3146A6',
  };
}

function normalizeMonthlyAward(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return { title: '', description: '', daysLeft: 0 };
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
    if (!row || typeof row !== 'object' || Array.isArray(row)) return row;
    if (!row.day && Array.isArray(row.days) && row.days[0]) {
      return { ...row, day: row.days[0] };
    }
    return row;
  });
}


export const AdminProvider = ({ children }) => {
  const [isStateReady, setIsStateReady] = useState(false);
  const [members, setMembers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [locations, setLocations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activities, setActivities] = useState([]);
  const [sports] = useState([
    'Бокс', 'ММА', 'Бразильское джиу-джитсу', 'Каратэ', 'Дзюдо', 'Кикбоксинг', 'Грэпплинг', 'Тайский бокс'
  ]);
  const [leagues, setLeagues] = useState([]);
  const [plans, setPlans] = useState([]);
  const [posts, setPosts] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [events, setEvents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [finances, setFinances] = useState(() => normalizeFinances({ revenue: 0, transactions: [] }));

  const [achievements, setAchievements] = useState([]);

  const [monthlyAward, setMonthlyAward] = useState(() => normalizeMonthlyAward({ title: '', description: '', daysLeft: 0 }));

  const [selectedLocationId, setSelectedLocationId] = useState('all');
  const [clubInfo, setClubInfo] = useState(() => normalizeClubInfo({ name: 'Palestra Fight Club', logo: '/palestra-logo-nav-full.png', primaryColor: '#4338ca' }));
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const [meResponse, stateResponse] = await Promise.all([
          fetch('/api/auth/me', { credentials: 'include' }),
          fetch('/api/app/state', { credentials: 'include' }),
        ]);
        const meData = meResponse.ok ? await meResponse.json() : {};
        const stateData = stateResponse.ok ? await stateResponse.json() : {};
        const remote = stateData.state || {};

        if (cancelled) return;

        setMembers(Array.isArray(remote.members) ? remote.members : []);
        setLeads(Array.isArray(remote.leads) ? remote.leads : []);
        setSchedule(normalizeScheduleList(Array.isArray(remote.schedule) ? remote.schedule : []));
        setLocations(Array.isArray(remote.locations) ? remote.locations : []);
        setGroups(Array.isArray(remote.groups) ? remote.groups : []);
        setActivities(Array.isArray(remote.activities) ? remote.activities : []);
        setLeagues(Array.isArray(remote.leagues) ? remote.leagues : []);
        setPlans(Array.isArray(remote.plans) ? remote.plans : []);
        setPosts(Array.isArray(remote.posts) ? remote.posts : []);
        setCoaches(Array.isArray(remote.coaches) ? remote.coaches : []);
        setEvents(Array.isArray(remote.events) ? remote.events : []);
        setAttendance(Array.isArray(remote.attendance) ? remote.attendance : []);
        setFinances(normalizeFinances(remote.finances));
        setAchievements(Array.isArray(remote.achievements) ? remote.achievements : []);
        setMonthlyAward(normalizeMonthlyAward(remote.monthlyAward));
        setSelectedLocationId(typeof remote.selectedLocationId === 'string' ? remote.selectedLocationId : 'all');
        setClubInfo(normalizeClubInfo(remote.clubInfo));
        setUser(meData.user || null);
      } catch (error) {
        console.error('Failed to hydrate Palestra state', error);
      } finally {
        if (!cancelled) setIsStateReady(true);
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isStateReady) return;

    const controller = new AbortController();
    const state = {
      members, leads, schedule, locations, groups, activities, leagues, plans, posts,
      coaches, events, attendance, finances, achievements, monthlyAward,
      selectedLocationId, clubInfo,
    };

    fetch('/api/app/state', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ state }),
      signal: controller.signal,
    }).catch((error) => {
      if (error.name !== 'AbortError') console.error('Failed to persist Palestra state', error);
    });

    return () => controller.abort();
  }, [isStateReady, members, leads, schedule, locations, groups, leagues, plans, posts, events, attendance, finances, achievements, monthlyAward, selectedLocationId, clubInfo, activities, coaches]);

  // --- ACTIONS ---

  const logActivity = (text, type = 'info') => {
    const newActivity = {
      id: createId(),
      text,
      type,
      date: new Date().toISOString()
    };
    setActivities(prev => [newActivity, ...prev].slice(0, 50));
  };

  const addGroup = (group) => {
    const newGroup = { ...group, id: createId() };
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
      id: createId(), 
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

  const login = async (credentialsOrRole) => {
    const payload = credentialsOrRole;

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Не удалось войти');
    }

    setUser(data.user);
    logActivity(`Вход в систему: ${data.user.name}`, 'info');
    return data.user;
  };

  const logout = async () => {
    if (user) logActivity(`Выход из системы: ${user.name}`, 'info');
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setUser(null);
  };

  const addMember = (memberData) => {
    const newMember = { 
      id: createId(), 
      createdAt: new Date().toISOString(), 
      points: 0, 
      level: 'Новичок',
      parentId: memberData.hasParent ? createId() : memberData.parentId,
      avatar: '',
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
    const newLead = { id: createId(), status: 'new', createdAt: new Date().toISOString(), ...leadData };
    setLeads(prev => [...prev, newLead]);
    logActivity(`Новый лид с сайта: ${leadData.name}`, 'info');
  };

  const updateLeadStatus = (id, newStatus) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  const removeLead = (id) => setLeads(prev => prev.filter(l => l.id !== id));

  const addScheduleItem = (itemData) => {
    const newItem = { id: createId(), color: '#4338ca', ...itemData };
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
    const newLoc = { id: createId(), isActive: true, ...locData };
    setLocations(prev => [...prev, newLoc]);
    logActivity(`Добавлен новый филиал: ${locData.name}`, 'info');
  };

  const addPlan = (planData) => {
    const newPlan = { id: createId(), ...planData };
    setPlans(prev => [...prev, newPlan]);
  };

  const removePlan = (id) => {
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  const addPost = (postData) => {
    const newPost = { 
      id: createId(), 
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
      id: createId(),
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
    const newCoach = { id: createId(), createdAt: new Date().toISOString(), ...coachData };
    setCoaches(prev => [...prev, newCoach]);
    logActivity(`Зарегистрирован тренер: ${coachData.name}`, 'success');
  };

  const removeCoach = (id) => setCoaches(prev => prev.filter(c => c.id !== id));

  const updateCoach = (id, updatedData) => {
    setCoaches(prev => prev.map(c => c.id === id ? { ...c, ...updatedData } : c));
  };

  const addEvent = (eventData) => {
    const newEvent = { id: createId(), participantIds: [], status: 'open', ...eventData };
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
      id: createId(),
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
      const newTransaction = { id: createId(), date: new Date().toISOString(), ...transactionData };
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
      id: createId(), 
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

  const resetData = async () => {
    setMembers([]);
    setLeads([]);
    setSchedule([]);
    setLocations([]);
    setGroups([]);
    setActivities([]);
    setLeagues([]);
    setPlans([]);
    setPosts([]);
    setCoaches([]);
    setEvents([]);
    setAttendance([]);
    setFinances({ revenue: 0, transactions: [] });
    setAchievements([]);
    setMonthlyAward({ title: '', description: '', daysLeft: 0 });
    setSelectedLocationId('all');
    setClubInfo(normalizeClubInfo({ name: 'Palestra Fight Club', logo: '/palestra-logo-nav-full.png', primaryColor: '#3146A6' }));
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

