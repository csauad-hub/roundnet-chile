import type { Tournament, Player, Post, Encuentro, NewsItem } from '@/types'
export const MOCK_PLAYERS: Player[] = [
  { id:'1', full_name:'Felipe Díaz', username:'felipediaz', city:'Santiago', region:'Metropolitana', level:'avanzado', ranking_points:2840, ranking_position:1, looking_for_partner:false, tournaments_played:18, created_at:'2023-01-01' },
  { id:'2', full_name:'Andrea Muñoz', username:'andrea.m', city:'Valparaíso', region:'Valparaíso', level:'avanzado', ranking_points:2610, ranking_position:2, looking_for_partner:true, tournaments_played:15, created_at:'2023-02-01' },
  { id:'3', full_name:'Camila Rojas', username:'camirojas', city:'Concepción', region:'Biobío', level:'avanzado', ranking_points:2390, ranking_position:3, looking_for_partner:false, tournaments_played:12, created_at:'2023-03-01' },
  { id:'4', full_name:'Bastián González', username:'bastiang', city:'Santiago', region:'Metropolitana', level:'intermedio', ranking_points:2190, ranking_position:4, looking_for_partner:true, tournaments_played:10, created_at:'2023-04-01' },
  { id:'5', full_name:'Valentina Silva', username:'valesiilva', city:'Temuco', region:'Araucanía', level:'intermedio', ranking_points:1980, ranking_position:5, looking_for_partner:false, tournaments_played:8, created_at:'2023-05-01' },
  { id:'6', full_name:'Javier Morales', username:'javierr', city:'Antofagasta', region:'Antofagasta', level:'avanzado', ranking_points:1840, ranking_position:6, looking_for_partner:false, tournaments_played:14, created_at:'2023-06-01' },
  { id:'7', full_name:'Paula Contreras', username:'paulac', city:'Santiago', region:'Metropolitana', level:'intermedio', ranking_points:1760, ranking_position:7, looking_for_partner:true, tournaments_played:7, created_at:'2023-07-01' },
  { id:'8', full_name:'Rodrigo Leiva', username:'rleiva', city:'La Serena', region:'Coquimbo', level:'principiante', ranking_points:980, ranking_position:8, looking_for_partner:true, tournaments_played:3, created_at:'2023-08-01' },
]
export const MOCK_TOURNAMENTS: Tournament[] = [
  { id:'1', name:'Open Santiago 2025', location:'Parque Araucano', city:'Las Condes', date:'2025-04-12', status:'open', category:'Open & Mixto', max_teams:64, registered_teams:32, price_per_team:15000, created_at:'2025-01-01' },
  { id:'2', name:'Challenge Viña del Mar', location:'Playa de Viña del Mar', city:'Viña del Mar', date:'2025-05-03', status:'soon', category:'Open', max_teams:48, registered_teams:0, price_per_team:12000, created_at:'2025-01-10' },
  { id:'3', name:'Open Valparaíso 2025', location:'Parque Italia', city:'Valparaíso', date:'2025-03-15', status:'finished', category:'Open & Mixto', max_teams:48, registered_teams:48, price_per_team:13000, winner:'Díaz / Muñoz', created_at:'2024-12-01' },
  { id:'4', name:'Open Concepción 2025', location:'Parque Ecuador', city:'Concepción', date:'2025-06-20', status:'soon', category:'Open', max_teams:32, registered_teams:0, price_per_team:10000, created_at:'2025-02-01' },
]
export const MOCK_POSTS: Post[] = [
  { id:'1', author_id:'2', author:MOCK_PLAYERS[1], category:'tecnica', content:'¿Alguien más está trabajando en el drop shot? Llevo 2 semanas practicando y creo que ya lo tengo bastante sólido. Les comparto el grip que usé 🎯', likes_count:28, comments_count:12, user_has_liked:true, created_at:new Date(Date.now()-3600000).toISOString() },
  { id:'2', author_id:'3', author:MOCK_PLAYERS[2], category:'general', content:'¡Qué torneo más increíble el de Valpo! Fue mi primera vez en Open y la organización estuvo impecable. Felicidades a los campeones 🏆🎉', likes_count:41, comments_count:7, user_has_liked:false, created_at:new Date(Date.now()-10800000).toISOString() },
  { id:'3', author_id:'4', author:MOCK_PLAYERS[3], category:'ayuda', content:'¿Alguien sabe dónde comprar redes en Santiago? La mía está destrozada después de 2 años de uso 😂 presupuesto ~$50k', likes_count:5, comments_count:18, user_has_liked:false, created_at:new Date(Date.now()-18000000).toISOString() },
  { id:'4', author_id:'5', author:MOCK_PLAYERS[4], category:'humor', content:'Cuando explains roundnet por décima vez en el día y la persona sigue pensando que es "como voleibol pero raro" 💀😭', likes_count:67, comments_count:23, user_has_liked:false, created_at:new Date(Date.now()-86400000).toISOString() },
]
export const MOCK_NEWS: NewsItem[] = [
  { id:'1', title:'Convocatoria para el Campeonato Sudamericano 2025', category:'Selección Chile', summary:'La Federación ha abierto el proceso de selección.', published_at:'2025-03-20', is_official:true },
  { id:'2', title:'Resultados completos Open Valparaíso 2025', category:'Resultados', summary:'Felipe Díaz y Andrea Muñoz campeones.', published_at:'2025-03-16', is_official:false },
  { id:'3', title:'Actualización reglas de juego 2025', category:'Reglamento', summary:'La WSRS publicó cambios en las reglas.', published_at:'2025-03-05', is_official:true },
]
export const MOCK_ENCUENTROS: Encuentro[] = [
  { id:'1', title:'Entreno Libre – Providencia', location:'Plaza Baquedano', city:'Santiago', date:new Date().toISOString(), time:'18:00', organizer_id:'2', organizer:MOCK_PLAYERS[1], participants:[MOCK_PLAYERS[1],MOCK_PLAYERS[2],MOCK_PLAYERS[3]], max_participants:8, created_at:new Date().toISOString() },
  { id:'2', title:'Sesión Técnica – La Floresta', location:'Parque La Floresta', city:'Santiago', date:new Date(Date.now()+86400000).toISOString(), time:'10:00', organizer_id:'6', organizer:MOCK_PLAYERS[5], participants:[MOCK_PLAYERS[5],MOCK_PLAYERS[4]], max_participants:6, created_at:new Date().toISOString() },
  { id:'3', title:'Pickup Weekend – Ñuñoa', location:'Estadio Ñuñoa', city:'Santiago', date:new Date(Date.now()+3*86400000).toISOString(), time:'09:30', organizer_id:'7', organizer:MOCK_PLAYERS[6], participants:[MOCK_PLAYERS[6],MOCK_PLAYERS[7],MOCK_PLAYERS[0],MOCK_PLAYERS[1]], max_participants:12, created_at:new Date().toISOString() },
]
export const STATS = { players:847, tournaments_2024:24, regions:12, active_tournaments:3 }