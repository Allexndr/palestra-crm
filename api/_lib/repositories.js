import { createSeedState } from './seedState.js';
import { getServiceClient, hasSupabaseServiceEnv } from './supabase.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (value) => typeof value === 'string' && UUID_RE.test(value);
const asArray = (value) => (Array.isArray(value) ? value : []);
const asNumber = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};
const asDate = (value) => (value ? new Date(value).toISOString() : new Date().toISOString());
const maybeUuid = (value) => (isUuid(value) ? value : null);

function tableRows(state, key) {
  if (key === 'products' || key === 'orders') return asArray(state.shop?.[key]);
  if (key === 'transactions') return asArray(state.finances?.transactions);
  return asArray(state[key]);
}

function withValidIds(rows) {
  return rows.filter((row) => isUuid(row?.id));
}

function uniqueById(rows) {
  return [...new Map(rows.map((row) => [row.id, row])).values()];
}

async function replaceRows(supabase, table, clubId, rows) {
  try {
    await supabase.from(table).delete().eq('club_id', clubId);
    if (!rows.length) return;
    const { error } = await supabase.from(table).insert(rows);
    if (error) {
      // Silently skip tables missing from schema cache (e.g. if migration not yet applied)
      if (/relation .* does not exist|schema cache/i.test(error.message)) return;
      throw error;
    }
  } catch (err) {
    if (/relation .* does not exist|schema cache/i.test(err.message)) return;
    throw err;
  }
}

function mapLocation(row, clubId) {
  return {
    id: row.id,
    club_id: clubId,
    name: row.name || 'Филиал',
    address: row.address || null,
    phone: row.phone || null,
    is_active: row.isActive !== false,
  };
}

function mapGroup(row, clubId) {
  return {
    id: row.id,
    club_id: clubId,
    location_id: maybeUuid(row.locationId),
    coach_id: maybeUuid(row.coachId),
    name: row.name || row.groupName || 'Группа',
    sport: row.sport || row.type || null,
  };
}

function mapCoach(row, clubId) {
  return {
    id: row.id,
    club_id: clubId,
    name: [row.firstName, row.lastName].filter(Boolean).join(' ') || row.name || 'Тренер',
    first_name: row.firstName || null,
    last_name: row.lastName || null,
    phone: row.phone || null,
    email: row.email || null,
    specialization: row.specialization || null,
    bio: row.bio || row.experience || null,
    avatar_blob_url: row.avatar || row.avatarUrl || null,
    tg_chat_id: row.tg_chat_id || null,
    tg_lang: row.tg_lang || 'ru',
    tg_link_code: row.tg_link_code || null,
    tg_user_info: row.tg_user_info || null,
  };
}

function mapMember(row, clubId) {
  const metrics = row.metrics || {};
  return {
    id: row.id,
    club_id: clubId,
    parent_id: maybeUuid(row.parentId),
    group_id: maybeUuid(row.groupId),
    first_name: row.firstName || row.name || 'Ученик',
    last_name: row.lastName || null,
    phone: row.phone || null,
    email: row.email || null,
    sport: row.sport || null,
    plan: row.plan || null,
    points: asNumber(metrics.points || row.points),
    level: row.level || 'Новичок',
    strength: asNumber(metrics.strength || row.strength),
    speed: asNumber(metrics.speed || row.speed),
    technique: asNumber(metrics.technique || row.technique),
    endurance: asNumber(metrics.endurance || row.endurance),
    avatar_blob_url: row.avatar || null,
    tg_chat_id: row.tg_chat_id || null,
    tg_lang: row.tg_lang || 'ru',
    tg_link_code: row.tg_link_code || null,
    tg_user_info: row.tg_user_info || null,
    created_at: asDate(row.createdAt),
  };
}

function mapParent(row, clubId) {
  return {
    id: row.parentId,
    club_id: clubId,
    name: row.parentName || 'Родитель',
    phone: row.parentPhone || null,
    email: row.parentEmail || null,
  };
}

function mapLead(row, clubId) {
  return {
    id: row.id,
    club_id: clubId,
    name: row.name || 'Лид',
    phone: row.phone || null,
    sport: row.sport || null,
    status: row.status || 'new',
    created_at: asDate(row.createdAt),
  };
}

function mapSchedule(row, clubId) {
  return {
    id: row.id,
    club_id: clubId,
    group_id: maybeUuid(row.groupId),
    location_id: maybeUuid(row.locationId),
    group_name: row.groupName || row.name || null,
    coach_name: row.coachName || row.coach || null,
    sport: row.type || row.sport || null,
    day: row.day || asArray(row.days)[0] || null,
    days: asArray(row.days),
    time: row.time || null,
    color: row.color || '#3146A6',
  };
}

function mapPlan(row, clubId) {
  return {
    id: row.id,
    club_id: clubId,
    name: row.name || 'Абонемент',
    visits: row.visits == null ? null : asNumber(row.visits),
    price: row.price == null ? null : asNumber(row.price),
    description: row.description || null,
  };
}

function mapTransaction(row, clubId) {
  return {
    id: row.id,
    club_id: clubId,
    amount: asNumber(row.amount),
    type: row.type === 'expense' ? 'expense' : 'income',
    description: row.description || '',
    date: asDate(row.date),
  };
}

function mapAchievement(row, clubId) {
  return {
    id: row.id,
    club_id: clubId,
    title: row.title || 'Достижение',
    description: row.desc || row.description || null,
    icon: row.icon || null,
    color: row.color || null,
    icon_color: row.iconColor || null,
  };
}

function mapLeague(row, clubId) {
  return {
    id: row.id,
    club_id: clubId,
    name: row.name || 'Лига',
    status: row.status || 'active',
    participant_ids: asArray(row.participantIds).filter(isUuid),
    group_ids: asArray(row.groupIds).filter(isUuid),
    data: row,
  };
}

function mapPost(row, clubId) {
  return {
    id: row.id,
    club_id: clubId,
    text: row.text || row.title || '',
    image_blob_url: row.image || null,
    likes: asNumber(row.likes),
    liked_by: asArray(row.likedBy).filter(isUuid),
    comments: asArray(row.comments),
    created_at: asDate(row.date || row.createdAt),
  };
}

function mapProduct(row, clubId) {
  return {
    id: row.id,
    club_id: clubId,
    name: row.name || 'Товар',
    price: row.price == null ? null : asNumber(row.price),
    category: row.category || null,
    description: row.description || null,
    image_blob_url: row.image || null,
    stock: asNumber(row.stock),
  };
}

function mapOrder(row, clubId) {
  return {
    id: row.id,
    club_id: clubId,
    product_id: maybeUuid(row.productId),
    member_id: maybeUuid(row.memberId),
    status: row.status || 'pending',
    data: row,
    created_at: asDate(row.createdAt),
  };
}

function mapActivity(row, clubId) {
  return {
    id: row.id,
    club_id: clubId,
    text: row.text || '',
    type: row.type || 'info',
    created_at: asDate(row.date || row.createdAt),
  };
}

function mapEvent(row, clubId) {
  return {
    id: row.id,
    club_id: clubId,
    name: row.name || row.title || 'Событие',
    type: row.type || 'event',
    date: row.date || null,
    description: row.description || null,
    participant_ids: asArray(row.participantIds).filter(isUuid),
    image_blob_url: row.image || null,
    data: row,
  };
}

export async function syncNormalizedState(user, state) {
  try {
    if (!hasSupabaseServiceEnv() || user?.isDemo) return;

    const clubId = user.profile.club_id;
    const supabase = getServiceClient();

    const clubInfo = state.clubInfo || {};
    const clubNameUpdate = {};
    // Only update the name if it's a real custom name (not the default placeholder)
    if (clubInfo.name && clubInfo.name !== 'Palestra Fight Club') {
      clubNameUpdate.name = clubInfo.name;
    }
    await supabase
      .from('clubs')
      .update({
        ...clubNameUpdate,
        logo_blob_url: clubInfo.logo || '/palestra-logo-nav-full.png',
        primary_color: clubInfo.primaryColor || '#3146A6',
        updated_at: new Date().toISOString(),
      })
      .eq('id', clubId);

    await replaceRows(supabase, 'locations', clubId, withValidIds(tableRows(state, 'locations')).map((row) => mapLocation(row, clubId)));
    await replaceRows(supabase, 'coaches', clubId, withValidIds(tableRows(state, 'coaches')).map((row) => mapCoach(row, clubId)));
    await replaceRows(supabase, 'groups', clubId, withValidIds(tableRows(state, 'groups')).map((row) => mapGroup(row, clubId)));
    await replaceRows(
      supabase,
      'parents',
      clubId,
      uniqueById(tableRows(state, 'members')
        .filter((row) => isUuid(row?.parentId) && (row.parentName || row.parentPhone))
        .map((row) => mapParent(row, clubId)))
    );
    await replaceRows(supabase, 'members', clubId, withValidIds(tableRows(state, 'members')).map((row) => mapMember(row, clubId)));
    await replaceRows(supabase, 'leads', clubId, withValidIds(tableRows(state, 'leads')).map((row) => mapLead(row, clubId)));
    await replaceRows(supabase, 'schedule_sessions', clubId, withValidIds(tableRows(state, 'schedule')).map((row) => mapSchedule(row, clubId)));
    await replaceRows(supabase, 'plans', clubId, withValidIds(tableRows(state, 'plans')).map((row) => mapPlan(row, clubId)));
    await replaceRows(supabase, 'financial_transactions', clubId, withValidIds(tableRows(state, 'transactions')).map((row) => mapTransaction(row, clubId)));
    await replaceRows(supabase, 'achievements', clubId, withValidIds(tableRows(state, 'achievements')).map((row) => mapAchievement(row, clubId)));
    await replaceRows(supabase, 'leagues', clubId, withValidIds(tableRows(state, 'leagues')).map((row) => mapLeague(row, clubId)));
    await replaceRows(supabase, 'posts', clubId, withValidIds(tableRows(state, 'posts')).map((row) => mapPost(row, clubId)));
    await replaceRows(supabase, 'products', clubId, withValidIds(tableRows(state, 'products')).map((row) => mapProduct(row, clubId)));
    await replaceRows(supabase, 'orders', clubId, withValidIds(tableRows(state, 'orders')).map((row) => mapOrder(row, clubId)));
    await replaceRows(supabase, 'activities', clubId, withValidIds(tableRows(state, 'activities')).map((row) => mapActivity(row, clubId)));
    await replaceRows(supabase, 'events', clubId, withValidIds(tableRows(state, 'events')).map((row) => mapEvent(row, clubId)));

    const award = state.monthlyAward || {};
    await supabase.from('monthly_awards').upsert({
      club_id: clubId,
      title: award.title || '',
      description: award.description || '',
      days_left: asNumber(award.daysLeft),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'club_id' });
  } catch (err) {
    console.error('[syncNormalizedState] Critical sync failure:', err.message);
  }
}

async function selectByClub(supabase, table, clubId, columns = '*') {
  const { data, error } = await supabase.from(table).select(columns).eq('club_id', clubId);
  if (error) {
    if (/relation .* does not exist|schema cache/i.test(error.message)) return [];
    throw error;
  }
  return data || [];
}

export async function getNormalizedState(user, fallbackState = createSeedState()) {
  if (!hasSupabaseServiceEnv() || user?.isDemo) return fallbackState;

  const clubId = user.profile.club_id;
  const supabase = getServiceClient();

  const [
    clubResult,
    locations,
    coaches,
    groups,
    parents,
    members,
    leads,
    schedule,
    plans,
    transactions,
    achievements,
    leagues,
    posts,
    products,
    orders,
    activities,
    events,
    awards,
  ] = await Promise.all([
    supabase.from('clubs').select('*').eq('id', clubId).maybeSingle(),
    selectByClub(supabase, 'locations', clubId),
    selectByClub(supabase, 'coaches', clubId),
    selectByClub(supabase, 'groups', clubId),
    selectByClub(supabase, 'parents', clubId),
    selectByClub(supabase, 'members', clubId),
    selectByClub(supabase, 'leads', clubId),
    selectByClub(supabase, 'schedule_sessions', clubId),
    selectByClub(supabase, 'plans', clubId),
    selectByClub(supabase, 'financial_transactions', clubId),
    selectByClub(supabase, 'achievements', clubId),
    selectByClub(supabase, 'leagues', clubId),
    selectByClub(supabase, 'posts', clubId),
    selectByClub(supabase, 'products', clubId),
    selectByClub(supabase, 'orders', clubId),
    selectByClub(supabase, 'activities', clubId),
    selectByClub(supabase, 'events', clubId),
    selectByClub(supabase, 'monthly_awards', clubId),
  ]);

  if (clubResult.error) throw clubResult.error;
  const club = clubResult.data;
  const monthlyAward = awards[0];
  const hasNormalizedRows = [
    locations, coaches, groups, parents, members, leads, schedule, plans,
    transactions, achievements, leagues, posts, products, orders, activities, events, awards,
  ].some((rows) => rows.length > 0);

  if (!hasNormalizedRows) {
    return {
      ...fallbackState,
      // Always use empty arrays for real data — never leak mock/seed data to real clubs
      members: [],
      coaches: [],
      groups: [],
      locations: [],
      leads: [],
      schedule: [],
      plans: [],
      activities: [],
      achievements: [],
      attendance: [],
      clubInfo: {
        name: club?.name || fallbackState.clubInfo?.name || 'Palestra Fight Club',
        logo: club?.logo_blob_url || fallbackState.clubInfo?.logo || '/palestra-logo-nav-full.png',
        primaryColor: club?.primary_color || fallbackState.clubInfo?.primaryColor || '#3146A6',
      },
    };
  }

  return {
    ...fallbackState,
    locations: locations.map((row) => ({ id: row.id, name: row.name, address: row.address || '', phone: row.phone || '', isActive: row.is_active })),
    coaches: coaches.map((row) => ({ id: row.id, firstName: row.name?.split(' ')[0] || row.name, lastName: row.name?.split(' ').slice(1).join(' ') || '', phone: row.phone || '', specialization: row.specialization || '', bio: row.bio || '', avatar: row.avatar_blob_url || '' })),
    groups: groups.map((row) => ({ id: row.id, name: row.name, coachId: row.coach_id || '', sport: row.sport || '', locationId: row.location_id || '' })),
    members: members.map((row) => {
      const parent = parents.find((item) => item.id === row.parent_id);
      const fallbackMember = (fallbackState.members || []).find(m => m.id === row.id) || {};
      
      // Reconstruct metrics from relational columns for backward compatibility
      const relationalMetrics = {
        strength: row.strength || 0,
        speed: row.speed || 0,
        technique: row.technique || 0,
        endurance: row.endurance || 0,
        points: row.points || 0,
      };

      return { 
        ...fallbackMember, // Preserve any extra fields from the JSON state (like dynamic metrics)
        id: row.id, 
        firstName: row.first_name, 
        lastName: row.last_name || '', 
        phone: row.phone || '', 
        parentId: row.parent_id || '', 
        parentName: parent?.name || '', 
        parentPhone: parent?.phone || '', 
        hasParent: Boolean(parent), 
        groupId: row.group_id || '', 
        points: row.points || 0, 
        level: row.level || 'Новичок', 
        sport: row.sport || '', 
        plan: row.plan || '', 
        // We keep individual fields for compatibility, but also provide the metrics object
        strength: row.strength || 0, 
        speed: row.speed || 0, 
        technique: row.technique || 0, 
        endurance: row.endurance || 0, 
        metrics: {
          ...relationalMetrics,
          ...(fallbackMember.metrics || {})
        },
        avatar: row.avatar_blob_url || '', 
        createdAt: row.created_at 
      };
    }),
    leads: leads.map((row) => ({ id: row.id, name: row.name, phone: row.phone || '', sport: row.sport || '', status: row.status || 'new', createdAt: row.created_at })),
    schedule: schedule.map((row) => ({ id: row.id, groupId: row.group_id || '', locationId: row.location_id || '', groupName: row.group_name || '', coachName: row.coach_name || '', coach: row.coach_name || '', type: row.sport || '', day: row.day || '', days: row.days || [], time: row.time || '', color: row.color || '#3146A6' })),
    plans: plans.map((row) => ({ id: row.id, name: row.name, visits: row.visits || '', price: row.price || '', description: row.description || '' })),
    finances: {
      revenue: transactions.reduce((sum, row) => sum + (row.type === 'income' ? Number(row.amount || 0) : -Number(row.amount || 0)), 0),
      transactions: transactions.map((row) => ({ id: row.id, amount: Number(row.amount || 0), type: row.type, description: row.description || '', date: row.date })),
    },
    achievements: achievements.map((row) => ({ id: row.id, title: row.title, desc: row.description || '', icon: row.icon || 'Trophy', color: row.color || '#EEF2FF', iconColor: row.icon_color || '#4338ca', memberIds: [] })),
    leagues: leagues.map((row) => ({ ...(row.data || {}), id: row.id, name: row.name, status: row.status || 'active', participantIds: row.participant_ids || [], groupIds: row.group_ids || [] })),
    posts: posts.map((row) => ({ id: row.id, text: row.text || '', image: row.image_blob_url || '', likes: row.likes || 0, likedBy: row.liked_by || [], comments: row.comments || [], date: row.created_at })),
    activities: activities.map((row) => ({ id: row.id, text: row.text, type: row.type || 'info', date: row.created_at })),
    events: events.map((row) => ({ ...(row.data || {}), id: row.id, name: row.name, type: row.type || 'event', date: row.date || '', description: row.description || '', participantIds: row.participant_ids || [], image: row.image_blob_url || '' })),
    monthlyAward: monthlyAward ? { title: monthlyAward.title || '', description: monthlyAward.description || '', daysLeft: monthlyAward.days_left || 0 } : fallbackState.monthlyAward,
    subscription: fallbackState.subscription,
    clubInfo: {
      name: club?.name || fallbackState.clubInfo?.name || 'Palestra Fight Club',
      logo: club?.logo_blob_url || fallbackState.clubInfo?.logo || '/palestra-logo-nav-full.png',
      primaryColor: club?.primary_color || fallbackState.clubInfo?.primaryColor || '#3146A6',
    },
    shop: {
      products: products.map((row) => ({ id: row.id, name: row.name, price: row.price || '', category: row.category || '', description: row.description || '', image: row.image_blob_url || '', stock: row.stock || 0 })),
      orders: orders.map((row) => ({ ...(row.data || {}), id: row.id, productId: row.product_id || row.data?.productId, memberId: row.member_id || row.data?.memberId, status: row.status || 'pending', createdAt: row.created_at })),
    },
  };
}
export async function deleteClubCompletely(clubId) {
  if (!hasSupabaseServiceEnv() || !isUuid(clubId)) return;
  const supabase = getServiceClient();

  const tables = [
    'app_state',
    'locations',
    'coaches',
    'groups',
    'members',
    'parents',
    'leads',
    'schedule_sessions',
    'plans',
    'financial_transactions',
    'achievements',
    'leagues',
    'posts',
    'products',
    'orders',
    'activities',
    'events',
    'monthly_awards'
  ];

  for (const table of tables) {
    try {
      await supabase.from(table).delete().eq('club_id', clubId);
    } catch (err) {
      console.warn(`Failed to clean up table ${table}:`, err.message);
    }
  }

  // Delete profiles and finally the club
  await supabase.from('profiles').delete().eq('club_id', clubId);
  await supabase.from('clubs').delete().eq('id', clubId);
}
