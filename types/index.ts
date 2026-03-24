export type TournamentStatus = 'open' | 'soon' | 'finished'
export type PostCategory = 'tecnica' | 'general' | 'ayuda' | 'humor'
export type PlayerLevel = 'principiante' | 'intermedio' | 'avanzado'
export interface Tournament { id:string; name:string; location:string; city:string; date:string; status:TournamentStatus; category:string; max_teams:number; registered_teams:number; price_per_team:number; winner?:string; description?:string; created_at:string }
export interface Player { id:string; full_name:string; username:string; city:string; region:string; level:PlayerLevel; ranking_points:number; ranking_position?:number; looking_for_partner:boolean; bio?:string; avatar_url?:string; tournaments_played:number; created_at:string }
export interface Post { id:string; author_id:string; author:Player; category:PostCategory; content:string; likes_count:number; comments_count:number; user_has_liked?:boolean; created_at:string }
export interface Comment { id:string; post_id:string; author_id:string; author:Player; content:string; created_at:string }
export interface Encuentro { id:string; title:string; location:string; city:string; date:string; time:string; organizer_id:string; organizer:Player; participants:Player[]; max_participants:number; description?:string; created_at:string }
export interface NewsItem { id:string; title:string; category:string; summary:string; published_at:string; is_official:boolean }