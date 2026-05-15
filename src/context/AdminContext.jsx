import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { DEFAULT_SUBSCRIPTION, normalizeSubscription } from '../lib/tariff';
import { useTranslation } from './LanguageContext';

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
    return { name: 'Palestra Fight Club', logo: '/palestra-logo-nav-full.png', primaryColor: '#3146A6', activeLeagueTemplate: 'martial_arts' };
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
    activeLeagueTemplate: typeof v.activeLeagueTemplate === 'string' ? v.activeLeagueTemplate : 'martial_arts',
    estimatedStudents: typeof v.estimatedStudents === 'number' ? v.estimatedStudents : (Number(v.estimatedStudents) || 0)
  };
}

function normalizeMonthlyAward(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const remaining = lastDay - now.getDate();
    return { title: '', description: '', daysLeft: remaining };
  }
  
  let daysLeft = typeof v.daysLeft === 'number' ? v.daysLeft : 0;
  if (daysLeft === 0) {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    daysLeft = lastDay - now.getDate();
  }

  return {
    title: v.title != null ? String(v.title) : '',
    description: v.description != null ? String(v.description) : '',
    daysLeft: daysLeft,
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

const DEFAULT_DASHBOARD_LAYOUT = [
  { id: 'stats', label: 'Статистика (KPI)', visible: true },
  { id: 'schedule', label: 'Расписание', visible: true },
  { id: 'events', label: 'События (Карусель)', visible: true },
  { id: 'autopilot', label: 'Автопилот TG', visible: true },
  { id: 'quickActions', label: 'Быстрые действия', visible: true },
  { id: 'activity', label: 'Живая лента', visible: true },
  { id: 'achievements', label: 'Достижения', visible: true },
  { id: 'monthlyAward', label: 'Награда месяца', visible: true },
];

export const STUDENT_WIDGET_CATALOG = [
  { id: 'rpg_rank', label: 'Ранг и прогресс', desc: 'Уровень XP и шкала до следующего ранга' },
  { id: 'physical_stats', label: 'Физические показатели', desc: 'Параметры силы, скорости и техники' },
  { id: 'rewards', label: 'Коллекция наград', desc: 'Все медали и достижения ученика' },
  { id: 'quick_actions', label: 'Кнопки действий', desc: 'Запись на занятия и оплата' },
  { id: 'club_events', label: 'События клуба', desc: 'Карусель ближайших мероприятий' },
  { id: 'last_activity', label: 'Последняя активность', desc: 'История посещений и начислений XP' },
  { id: 'attendance_chart', label: 'График посещаемости', desc: 'Визуальная статистика занятий' },
  { id: 'leaderboard_mini', label: 'Мини-рейтинг', desc: 'Топ-3 ученика вашей группы' },
];

const DEFAULT_STUDENT_POOL = ['rpg_rank', 'physical_stats', 'rewards', 'quick_actions', 'club_events'];
const DEFAULT_STUDENT_LAYOUT = [
  { id: 'rpg_rank', visible: true },
  { id: 'physical_stats', visible: true },
  { id: 'rewards', visible: true },
  { id: 'quick_actions', visible: true },
  { id: 'club_events', visible: true },
];

export const AdminProvider = ({ children }) => {
  const [isStateReady, setIsStateReady] = useState(false);
  const [hydrateTick, setHydrateTick] = useState(0);
  const isHydratedRef = useRef(false); // true only after server state is loaded
  const [members, setMembers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [locations, setLocations] = useState([]);
  const [groups, setGroups] = useState([]);
  const [activities, setActivities] = useState([]);
  const { t } = useTranslation();
  const sportsRaw = t('common.sports', { returnObjects: true });
  const sports = Array.isArray(sportsRaw) ? sportsRaw : ['Бокс', 'ММА', 'Бразильское джиу-джитсу', 'Каратэ', 'Дзюдо', 'Кикбоксинг', 'Грэпплинг', 'Тайский бокс'];
  const [leagues, setLeagues] = useState([]);
  const [plans, setPlans] = useState([]);
  const [posts, setPosts] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [events, setEvents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [finances, setFinances] = useState(() => normalizeFinances({ revenue: 0, transactions: [] }));

  const [achievements, setAchievements] = useState([]);
  const [quests, setQuests] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [automations, setAutomations] = useState({ fired: [] });
  const [messages, setMessages] = useState([]);
  const [partners, setPartners] = useState([]);

  const [monthlyAward, setMonthlyAward] = useState(() => normalizeMonthlyAward({ title: '', description: '', daysLeft: 0 }));

  const [selectedLocationId, setSelectedLocationId] = useState('all');
  const [clubInfo, setClubInfo] = useState(() => normalizeClubInfo({ name: 'Palestra Fight Club', logo: '/palestra-logo-nav-full.png', primaryColor: '#4338ca' }));
  const [subscription, setSubscription] = useState(() => normalizeSubscription(DEFAULT_SUBSCRIPTION));
  const [user, setUser] = useState(null);
  const [activeChildId, setActiveChildId] = useState(null);
  const [dashboardLayout, setDashboardLayout] = useState(DEFAULT_DASHBOARD_LAYOUT);
  const [studentDashboardPool, setStudentDashboardPool] = useState(DEFAULT_STUDENT_POOL);
  const [studentDashboardLayout, setStudentDashboardLayout] = useState(DEFAULT_STUDENT_LAYOUT);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      try {
        const impersonatedClubId = sessionStorage.getItem('palestra-impersonate-club-id');
        const headers = impersonatedClubId ? { 'x-palestra-club-id': impersonatedClubId } : {};

        const [meResponse, stateResponse] = await Promise.all([
          fetch('/api/auth/me', { credentials: 'include', headers }),
          fetch('/api/app/state', { credentials: 'include', headers }),
        ]);

        if (cancelled) return;

        let meData = null;
        if (meResponse.ok) {
          meData = await meResponse.json();
          setUser(meData.user || null);
          
          // Auto-select first child for parents on load
          if (meData.user?.role === 'parent') {
            // We'll handle this after members are set below
          }
        } else {
          console.error(`Failed to fetch user info: ${meResponse.status} ${meResponse.statusText}`);
        }

        if (stateResponse.ok) {
          const stateData = await stateResponse.json();
          const remote = stateData.state || {};

          setMembers(Array.isArray(remote.members) ? remote.members : []);
          setLeads(Array.isArray(remote.leads) ? remote.leads : []);
          setSchedule(normalizeScheduleList(Array.isArray(remote.schedule) ? remote.schedule : []));
          setLocations(Array.isArray(remote.locations) ? remote.locations : []);
          setGroups(Array.isArray(remote.groups) ? remote.groups : []);
          setActivities(Array.isArray(remote.activities) ? remote.activities : []);
          setLeagues(Array.isArray(remote.leagues) ? remote.leagues : []);
          setPlans(Array.isArray(remote.plans) ? remote.plans : []);
          setPosts(Array.isArray(remote.posts) ? remote.posts : (JSON.parse(localStorage.getItem('palestra_posts') || '[]')));
          setCoaches(Array.isArray(remote.coaches) ? remote.coaches : []);
          setEvents(Array.isArray(remote.events) ? remote.events : []);
          setAttendance(Array.isArray(remote.attendance) ? remote.attendance : []);
          setFinances(normalizeFinances(remote.finances));
          setAchievements(Array.isArray(remote.achievements) ? remote.achievements : []);
          setQuests(Array.isArray(remote.quests) ? remote.quests : []);
          setFeedbacks(Array.isArray(remote.feedbacks) ? remote.feedbacks : []);
          setAutomations(remote.automations || { fired: [] });
          setMessages(Array.isArray(remote.messages) ? remote.messages : []);
          setPartners(Array.isArray(remote.partners) ? remote.partners : []);
          setMonthlyAward(normalizeMonthlyAward(remote.monthlyAward));
          setSelectedLocationId(typeof remote.selectedLocationId === 'string' ? remote.selectedLocationId : 'all');
          setClubInfo(normalizeClubInfo(remote.clubInfo));
          
          let loadedSubscription = normalizeSubscription(remote.subscription);
          if (loadedSubscription.plan === 'starter') {
            try {
              const localSub = localStorage.getItem('palestra_demo_subscription');
              if (localSub) {
                loadedSubscription = normalizeSubscription(JSON.parse(localSub));
              }
            } catch (e) {}
          }
          setSubscription(loadedSubscription);
          setDashboardLayout(Array.isArray(remote.dashboardLayout) ? remote.dashboardLayout : DEFAULT_DASHBOARD_LAYOUT);
          setStudentDashboardPool(Array.isArray(remote.studentDashboardPool) ? remote.studentDashboardPool : DEFAULT_STUDENT_POOL);
          setStudentDashboardLayout(Array.isArray(remote.studentDashboardLayout) ? remote.studentDashboardLayout : DEFAULT_STUDENT_LAYOUT);

          // Parent child auto-selection
          if (meData?.user?.role === 'parent' && Array.isArray(remote.members)) {
            const children = remote.members.filter(m => m.parentId === meData.user.id);
            if (children.length > 0) {
              setActiveChildId(children[0].id);
            }
          }
        } else {
          console.error(`Failed to fetch state: ${stateResponse.status} ${stateResponse.statusText}`);
          if (stateResponse.status === 401) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Critical failure in hydrate Palestra state', error);
      } finally {
        if (!cancelled) {
          isHydratedRef.current = true;
          setIsStateReady(true);
        }
      }
    }

    hydrate();
    return () => {
      cancelled = true;
    };
  }, [hydrateTick]);

  const waitForHydration = () => new Promise(resolve => {
    if (isHydratedRef.current) return resolve();
    const check = setInterval(() => {
      if (isHydratedRef.current) { clearInterval(check); resolve(); }
    }, 100);
    setTimeout(() => { clearInterval(check); resolve(); }, 5000);
  });

  const persistState = async (updates = {}) => {
    if (!isStateReady || !isHydratedRef.current) return false;
    
    try {
      const state = {
        members, leads, schedule, locations, groups, activities, leagues, plans, posts,
        coaches, events, attendance, finances, achievements, monthlyAward,
        quests, feedbacks,
        automations, messages,
        selectedLocationId, clubInfo, subscription,
        dashboardLayout,
        studentDashboardPool,
        studentDashboardLayout,
        partners,
        ...updates
      };

      const impersonatedClubId = sessionStorage.getItem('palestra-impersonate-club-id');
      const headers = { 'Content-Type': 'application/json' };
      if (impersonatedClubId) {
        headers['x-palestra-club-id'] = impersonatedClubId;
      }

      const response = await fetch('/api/app/state', {
        method: 'PUT',
        credentials: 'include',
        headers,
        body: JSON.stringify({ state }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      console.log('State persisted successfully');
      return true;
    } catch (error) {
      console.error('Failed to persist Palestra state', error);
      return false;
    }
  };

  useEffect(() => {
    if (!isStateReady || !isHydratedRef.current) return;
    const timeout = setTimeout(() => persistState(), 800); // Debounced auto-save
    localStorage.setItem('palestra_posts', JSON.stringify(posts));
    return () => clearTimeout(timeout);
  }, [isStateReady, members, leads, schedule, locations, groups, leagues, plans, posts, events, attendance, finances, achievements, monthlyAward, quests, feedbacks, automations, selectedLocationId, clubInfo, subscription, activities, coaches, dashboardLayout, studentDashboardPool, studentDashboardLayout, messages, partners]);

  // --- AUTOMATIONS ---
  const sendTelegramMessage = (userId, text) => {
    const userObj = members.find(m => m.id === userId) || coaches.find(c => c.id === userId);
    const userName = userObj ? `${userObj.firstName} ${userObj.lastName}` : 'Пользователь';
    
    logActivity(`[TG] ${userName}: ${text}`, 'info');
    
    // In a real app, this would be an API call to a Telegram Bot
    // fetch('https://api.telegram.org/bot.../sendMessage', ...)
  };

  useEffect(() => {
    if (!isStateReady || members.length === 0) return;

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const monthDay = todayStr.slice(5); // MM-DD

    let updatedFired = [...(automations.fired || [])];
    let xpUpdates = [];
    let hasChanges = false;

    members.forEach(member => {
      // 1. Birthday Trigger
      if (member.birthDate && member.birthDate.slice(5) === monthDay) {
        const fireId = `birthday-${member.id}-${today.getFullYear()}`;
        if (!updatedFired.includes(fireId)) {
          xpUpdates.push({ id: member.id, xp: 50 });
          sendTelegramMessage(member.id, "С днем рождения! 🎉 В честь праздника мы начислили вам 50 XP. Ждем на тренировке!");
          updatedFired.push(fireId);
          hasChanges = true;
        }
      }

      // 2. Subscription Expiry Trigger
      if (member.subscriptionEndDate) {
        const expiryDate = new Date(member.subscriptionEndDate);
        const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 3 && diffDays > 0) {
          const fireId = `expiry-warning-${member.id}-${member.subscriptionEndDate}`;
          if (!updatedFired.includes(fireId)) {
            sendTelegramMessage(member.id, `Внимание! Ваш абонемент заканчивается через ${diffDays} дня. Не забудьте продлить, чтобы сохранить серию тренировок! 🥊`);
            updatedFired.push(fireId);
            hasChanges = true;
          }
        } else if (diffDays <= 0) {
          const fireId = `expiry-expired-${member.id}-${member.subscriptionEndDate}`;
          if (!updatedFired.includes(fireId)) {
            sendTelegramMessage(member.id, "Ваш абонемент истек. Ждем вас для продления! Без тренировок герой слабеет. 🥋");
            updatedFired.push(fireId);
            hasChanges = true;
          }
        }
      }
    });

    if (hasChanges) {
      if (xpUpdates.length > 0) {
        setMembers(prev => prev.map(m => {
          const update = xpUpdates.find(u => u.id === m.id);
          return update ? { ...m, xp: (m.xp || 0) + update.xp } : m;
        }));
      }
      setAutomations({ fired: updatedFired });
    }
  }, [isStateReady, members, automations.fired]);

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

  const removeActivity = (id) => {
    setActivities(prev => prev.filter(act => act.id !== id));
  };

  const usage = {
    members: members.length,
    coaches: coaches.length,
    locations: locations.length,
    groups: groups.length,
  };

  const getLimitStatus = (resource) => {
    const limit = Number(subscription.limits?.[resource] ?? 0);
    const used = Number(usage[resource] ?? 0);
    return {
      resource,
      used,
      limit,
      remaining: Math.max(0, limit - used),
      isReached: limit > 0 && used >= limit,
      isWarning: limit > 0 && used / limit >= 0.8 && used < limit,
      percent: limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0,
    };
  };

  const canUseFeature = (feature) => Boolean(subscription.features?.[feature]);

  const getUpgradeMessage = (kind, label) => {
    if (kind === 'feature') {
      return `${label} подключается в Growth. Starter остаётся бесплатным, а платите вы только за рост и нужные модули. Настройте тариф от 9 000 ₸ в разделе “Тариф Palestra”.`;
    }
    const status = getLimitStatus(kind);
    return `Бесплатный Starter рассчитан на ${status.limit}. Сейчас используется ${status.used}. Чтобы продолжить рост, увеличьте ${label} в Growth от 9 000 ₸ в разделе “Тариф Palestra”.`;
  };

  const ensureCanCreate = (resource, label) => {
    const status = getLimitStatus(resource);
    if (!status.isReached) return true;
    alert(getUpgradeMessage(resource, label));
    return false;
  };

  const updateSubscription = (nextSubscription) => {
    const normalized = normalizeSubscription(nextSubscription);
    setSubscription(normalized);
    try {
      localStorage.setItem('palestra_demo_subscription', JSON.stringify(normalized));
    } catch (e) {
      console.error('Failed to save subscription to localStorage', e);
    }
    logActivity('Обновлена конфигурация тарифа Palestra', 'success');
  };

  const addGroup = async (group) => {
    if (!ensureCanCreate('groups', 'количество групп')) return false;
    const newGroup = { ...group, id: createId() };
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    logActivity(`Создана новая группа: ${group.name}`, 'info');
    return await persistState({ groups: updatedGroups });
  };

  const updateGroup = async (id, updatedData) => {
    const updatedGroups = groups.map(g => g.id === id ? { ...g, ...updatedData } : g);
    setGroups(updatedGroups);
    return await persistState({ groups: updatedGroups });
  };

  const removeGroup = async (id) => {
    const group = groups.find(g => g.id === id);
    const updatedGroups = groups.filter(g => g.id !== id);
    setGroups(updatedGroups);
    
    const updatedMembers = members.map(m => m.groupId === id ? { ...m, groupId: '' } : m);
    setMembers(updatedMembers);
    
    let updatedSchedule = schedule;
    if (group) {
      updatedSchedule = schedule.filter(s => s.groupName !== group.name);
      setSchedule(updatedSchedule);
      logActivity(`Удалена группа: ${group.name}`, 'warning');
    }
    
    return await persistState({ 
      groups: updatedGroups,
      members: updatedMembers,
      schedule: updatedSchedule
    });
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
    setHydrateTick(t => t + 1); // Re-run hydrate to load fresh state after login
    return data.user;
  };

  const logout = async () => {
    isHydratedRef.current = false;
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
    setUser(null);
    setIsStateReady(false);
  };

  const addMember = async (memberData) => {
    if (!ensureCanCreate('members', 'количество учеников')) return false;
    
    // Generate Telegram link code for students to connect their Telegram
    const tgLinkCode = 'STU-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newMember = { 
      id: createId(), 
      createdAt: new Date().toISOString(), 
      points: 0, 
      level: 'Новичок',
      parentId: memberData.hasParent ? createId() : memberData.parentId,
      avatar: '',
      tg_link_code: tgLinkCode,
      ...memberData 
    };
    
    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    logActivity(`Новый ученик: ${memberData.firstName} ${memberData.lastName}`, 'success');
    
    let updatedFinances = finances;
    if (memberData.paidAmount && canUseFeature('finance')) {
      const safe = normalizeFinances(finances);
      const newTransaction = { id: createId(), date: new Date().toISOString(), amount: parseFloat(memberData.paidAmount), type: 'income', description: `Оплата: ${memberData.firstName} ${memberData.lastName}` };
      updatedFinances = { revenue: safe.revenue + parseFloat(memberData.paidAmount), transactions: [newTransaction, ...safe.transactions] };
      setFinances(updatedFinances);
    }
    
    await waitForHydration();
    await persistState({ members: updatedMembers, finances: updatedFinances });
    return true;
  };

  const removeMember = (id) => {
    const member = members.find(m => m.id === id);
    setMembers(prev => prev.filter(m => m.id !== id));
    if (member) logActivity(`Исключен ученик: ${member.firstName} ${member.lastName}`, 'warning');
  };
  
  const updateMember = async (id, updatedData) => {
    const updatedMembers = members.map(m => m.id === id ? { ...m, ...updatedData } : m);
    setMembers(updatedMembers);
    await waitForHydration();
    await persistState({ members: updatedMembers });
    return true;
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
    if (!ensureCanCreate('locations', 'количество филиалов / клубов')) return false;
    const newLoc = { id: createId(), isActive: true, ...locData };
    setLocations(prev => [...prev, newLoc]);
    logActivity(`Добавлен новый филиал: ${locData.name}`, 'info');
    return true;
  };

  const updateLocation = (id, updatedData) => {
    setLocations(prev => prev.map(loc => loc.id === id ? { ...loc, ...updatedData } : loc));
    logActivity(`Обновлен филиал: ${updatedData.name}`, 'info');
  };

  const removeLocation = (id) => {
    const loc = locations.find(l => l.id === id);
    setLocations(prev => prev.filter(l => l.id !== id));
    // Cascade: clear locationId from groups, members, and schedule
    setGroups(prev => prev.map(g => g.locationId === id ? { ...g, locationId: '' } : g));
    setMembers(prev => prev.map(m => m.locationId === id ? { ...m, locationId: '' } : m));
    setSchedule(prev => prev.map(s => s.locationId === id ? { ...s, locationId: '' } : s));
    if (loc) logActivity(`Удален филиал: ${loc.name}`, 'warning');
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
      clubName: clubInfo?.name || 'Palestra Fight Club',
      ...postData 
    };
    setPosts(prev => [newPost, ...prev]);
    logActivity(`Новая публикация в ленте: ${postData.title || postData.text?.substring(0, 30) || 'Новость'}`, 'info');
  };

  const removePost = (postId) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
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

  const addComment = (postId, text, parentCommentId = null) => {
    if (!user) return;
    const comment = {
      id: createId(),
      author: user.name,
      authorRole: user.role,
      authorId: user.id || user.email,
      text,
      date: new Date().toISOString(),
      parentCommentId, // For nested threads
      likes: 0,
      likedBy: []
    };
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, comments: [...(p.comments || []), comment] };
      }
      return p;
    }));
  };

  const likeComment = (postId, commentId) => {
    if (!user) return;
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: (p.comments || []).map(c => {
            if (c.id === commentId) {
              const likedBy = c.likedBy || [];
              const isLiked = likedBy.includes(user.id || user.email);
              return {
                ...c,
                likedBy: isLiked ? likedBy.filter(u => u !== (user.id || user.email)) : [...likedBy, (user.id || user.email)],
                likes: isLiked ? (c.likes || 0) - 1 : (c.likes || 0) + 1
              };
            }
            return c;
          })
        };
      }
      return p;
    }));
  };

  const addQuest = (quest) => {
    const newQuest = { id: createId(), createdAt: new Date().toISOString(), completions: [], ...quest };
    setQuests(prev => [newQuest, ...prev]);
    logActivity(`Добавлен новый квест: ${quest.title}`, 'info');
  };

  const removeQuest = (id) => {
    setQuests(prev => prev.filter(q => q.id !== id));
  };

  const completeQuest = (questId, studentId) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        return { ...q, completions: [...(q.completions || []), { studentId, date: new Date().toISOString(), status: 'pending' }] };
      }
      return q;
    }));
  };

  const approveQuest = (questId, studentId) => {
    setQuests(prev => prev.map(q => {
      if (q.id === questId) {
        const reward = q.rewardPoints || 0;
        updateMemberXP(studentId, reward);
        logActivity(`Квест "${q.title}" подтвержден! Ученику начислено ${reward} XP`, 'success');
        return { 
          ...q, 
          completions: (q.completions || []).map(c => c.studentId === studentId ? { ...c, status: 'approved' } : c) 
        };
      }
      return q;
    }));
  };

  const addPartner = (partner) => {
    const newPartner = { id: createId(), ...partner };
    setPartners(prev => [...prev, newPartner]);
  };

  const updatePartner = (id, data) => {
    setPartners(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const removePartner = (id) => {
    setPartners(prev => prev.filter(p => p.id !== id));
  };

  const updateMemberXP = (memberId, xpToAdd) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const newXp = (m.xp || 0) + xpToAdd;
        return { ...m, xp: newXp };
      }
      return m;
    }));
  };

  const sendFeedback = (studentId, type, message) => {
    const member = members.find(m => m.id === studentId);
    if (!member) return;

    const newFeedback = {
      id: createId(),
      studentId,
      type,
      message,
      date: new Date().toISOString()
    };
    setFeedbacks(prev => [newFeedback, ...prev]);
    
    // Auto-post to feed
    addPost({
      title: `Похвала от тренера: ${type === 'fire' ? 'Огонь на тренировке 🔥' : type === 'discipline' ? 'Образцовая дисциплина 🥋' : 'Отличная техника 🎯'}`,
      content: `${member.firstName} ${member.lastName} получает награду от тренера: "${message}"`,
      author: user?.name || 'Тренер',
      authorRole: 'coach',
    });
    
    updateMemberXP(studentId, 20); // Small bonus for feedback
  };


  const addCoach = async (coachData) => {
    if (!ensureCanCreate('coaches', 'количество тренеров')) return false;
    
    // Generate Telegram link code for coaches
    const tgLinkCode = 'STU-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newCoach = { id: createId(), createdAt: new Date().toISOString(), tg_link_code: tgLinkCode, ...coachData };
    const updatedCoaches = [...coaches, newCoach];
    setCoaches(updatedCoaches);
    logActivity(`Зарегистрирован тренер: ${coachData.firstName} ${coachData.lastName}`, 'success');
    return await persistState({ coaches: updatedCoaches });
  };

  const removeCoach = async (id) => {
    const coach = coaches.find(c => c.id === id);
    const updatedCoaches = coaches.filter(c => c.id !== id);
    setCoaches(updatedCoaches);
    // Cascade: unassign coach from groups
    const updatedGroups = groups.map(g => g.coachId === id ? { ...g, coachId: '' } : g);
    setGroups(updatedGroups);
    if (coach) logActivity(`Удалён тренер: ${coach.firstName} ${coach.lastName}`, 'warning');
    return await persistState({ coaches: updatedCoaches, groups: updatedGroups });
  };

  const updateCoach = async (id, updatedData) => {
    const updatedCoaches = coaches.map(c => c.id === id ? { ...c, ...updatedData } : c);
    setCoaches(updatedCoaches);
    return await persistState({ coaches: updatedCoaches });
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
    setSubscription(normalizeSubscription(DEFAULT_SUBSCRIPTION));
    setDashboardLayout(DEFAULT_DASHBOARD_LAYOUT);
    
    await persistState({
      members: [],
      leads: [],
      schedule: [],
      locations: [],
      groups: [],
      activities: [],
      leagues: [],
      plans: [],
      posts: [],
      coaches: [],
      events: [],
      attendance: [],
      finances: { revenue: 0, transactions: [] },
      achievements: [],
      monthlyAward: { title: '', description: '', daysLeft: 0 },
      clubInfo: { name: 'Palestra Fight Club', logo: '/palestra-logo-nav-full.png', primaryColor: '#3146A6' },
      subscription: DEFAULT_SUBSCRIPTION,
      dashboardLayout: DEFAULT_DASHBOARD_LAYOUT
    });
    
    logActivity('Данные клуба сброшены до заводских настроек', 'warning');
  };

  const toggleWidget = (id) => {
    setDashboardLayout(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const moveWidget = (id, direction) => {
    setDashboardLayout(prev => {
      const idx = prev.findIndex(w => w.id === id);
      if (idx === -1) return prev;
      const newLayout = [...prev];
      let targetIdx = idx;
      
      if (direction === 'up') targetIdx = idx - 2;
      else if (direction === 'down') targetIdx = idx + 2;
      else if (direction === 'left' && idx % 2 !== 0) targetIdx = idx - 1;
      else if (direction === 'right' && idx % 2 === 0) targetIdx = idx + 1;
      
      if (targetIdx < 0 || targetIdx >= newLayout.length || targetIdx === idx) return prev;
      
      [newLayout[idx], newLayout[targetIdx]] = [newLayout[targetIdx], newLayout[idx]];
      return newLayout;
    });
  };

  const toggleStudentPoolWidget = (id) => {
    setStudentDashboardPool(prev => {
      if (prev.includes(id)) {
        return prev.filter(wId => wId !== id);
      }
      if (prev.length >= 7) {
        return prev;
      }
      return [...prev, id];
    });
    
    // Ensure layout also contains the new widget if it was added
    setStudentDashboardLayout(prev => {
      const exists = prev.find(w => w.id === id);
      if (!exists) return [...prev, { id, visible: true }];
      return prev;
    });
  };

  const moveStudentWidget = (id, direction) => {
    setStudentDashboardLayout(prev => {
      const idx = prev.findIndex(w => w.id === id);
      if (idx === -1) return prev;
      const newLayout = [...prev];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= newLayout.length) return prev;
      [newLayout[idx], newLayout[targetIdx]] = [newLayout[targetIdx], newLayout[idx]];
      return newLayout;
    });
  };

  const toggleStudentWidget = (id) => {
    setStudentDashboardLayout(prev => prev.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
  };

  const updateMemberProfile = (id, data) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...data } : m));
  };

  const fixBlobUrl = (url) => {
    if (!url) return '';
    // If it's a private vercel blob URL, route it through our proxy
    if (url.includes('private.blob.vercel-storage.com')) {
      try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.replace(/^\/+/, '');
        return `/api/blob/read?pathname=${encodeURIComponent(pathname)}`;
      } catch (e) {
        return url;
      }
    }
    return url;
  };

  const value = {
    members, addMember, removeMember, updateMember, updateMemberXP, updateMemberProfile,
    fixBlobUrl,
    leads, addLead, updateLeadStatus, removeLead, convertLeadToMember,
    schedule, addScheduleItem, updateScheduleItem, removeScheduleItem,
    locations, addLocation, updateLocation, removeLocation,
    groups, addGroup, updateGroup, removeGroup,
    sports,
    leagues, addLeague, removeLeague, updateLeague, updateLeagueParticipants,
    selectedLocationId, setSelectedLocationId,
    clubInfo, setClubInfo, updateClubInfo: (updates) => {
      setClubInfo(prev => ({ ...prev, ...updates }));
      logActivity('Обновлены настройки клуба', 'success');
    },
    plans, addPlan, removePlan,
    posts, addPost, removePost, likePost, addComment,
    quests, addQuest, removeQuest, completeQuest, approveQuest,
    feedbacks, sendFeedback,
    coaches, addCoach, removeCoach, updateCoach,
    events, addEvent, updateEvent, removeEvent,
    attendance, markAttendance,
    messages, sendMessage: (chatId, text, attachments = []) => {
      const msg = {
        id: createId(),
        chatId,
        senderId: user?.id,
        senderName: user?.name,
        senderRole: user?.role,
        text,
        attachments,
        date: new Date().toISOString()
      };
      setMessages(prev => [...prev, msg]);
      return msg;
    },
    finances, addTransaction,
    achievements, setAchievements, addAchievement, removeAchievement,
    monthlyAward, updateMonthlyAward,
    activities, logActivity, removeActivity,
    partners, addPartner, updatePartner, removePartner,
    subscription, updateSubscription, usage, getLimitStatus, canUseFeature, getUpgradeMessage, ensureCanCreate,
    user, login, logout,
    deleteAccount: async () => {
      try {
        const response = await fetch('/api/auth/me', { method: 'DELETE', credentials: 'include' });
        if (response.ok) {
          localStorage.clear();
          setUser(null);
          window.location.href = '/';
          return true;
        }
        return false;
      } catch (error) {
        console.error('Failed to delete account', error);
        return false;
      }
    },
    activeChildId, setActiveChildId,
    dashboardLayout, setDashboardLayout, toggleWidget, moveWidget,
    studentDashboardPool, studentDashboardLayout, toggleStudentPoolWidget, moveStudentWidget, toggleStudentWidget,
    automations,
    updateAutomationConfig: (key, value) => {
      setAutomations(prev => ({
        ...prev,
        config: { ...(prev.config || { n1: true, n2: true, n3: false, n4: true }), [key]: value }
      }));
    },
    isStateReady,
    resetData, fetchClubState: async () => {
      try {
        const stateResponse = await fetch('/api/app/state', { credentials: 'include' });
        const stateData = stateResponse.ok ? await stateResponse.json() : {};
        if (stateData.state && stateData.state.subscription) {
          setSubscription(normalizeSubscription(stateData.state.subscription));
        }
      } catch(e) { console.error('Failed to fetch club state', e); }
    }
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

