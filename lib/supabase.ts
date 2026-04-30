import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://aygzdvykdehmozyxyccn.supabase.co"
const supabaseAnonKey = "sb_publishable_Zu0CqtcKpnQ2v1V1dGerwQ_9lW8BkDW"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)