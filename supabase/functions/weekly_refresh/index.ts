import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Types for Sleeper API responses
interface SleeperDraft {
  draft_id: string
  created: number
  type: 'redraft' | 'dynasty'
  season: number
  season_type: string
}

interface SleeperPick {
  player_id: string
  pick_no: number
}

interface SleeperPlayer {
  player_id: string
  full_name: string
  position?: string
  team?: string
  bye_week?: number
}

interface SleeperStats {
  player_id: string
  pts_ppr?: number
  rec_yd?: number
  rec_td?: number
  rush_yd?: number
  pass_yd?: number
  pass_td?: number
}

interface SleeperState {
  week: number
  season: number
  season_type: string
}

// ETL metadata tracking
interface ETLRun {
  run_type: 'adp' | 'stats' | 'players'
  records_processed: number
  status: 'success' | 'error' | 'partial'
  error_message?: string
  last_created_timestamp?: number
  last_season?: number
  last_week?: number
}

// Rate limiting helper
class RateLimiter {
  private lastRequest = 0
  private minInterval = 500 // 0.5 seconds

  async throttle(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequest
    
    if (timeSinceLastRequest < this.minInterval) {
      const delay = this.minInterval - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    this.lastRequest = Date.now()
  }
}

// Sleeper API client with rate limiting
class SleeperAPI {
  private rateLimiter = new RateLimiter()
  private baseUrl = 'https://api.sleeper.app/v1'

  async request<T>(endpoint: string): Promise<T> {
    await this.rateLimiter.throttle()
    
    const response = await fetch(`${this.baseUrl}${endpoint}`)
    
    if (!response.ok) {
      throw new Error(`Sleeper API error: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }

  async getMockDrafts(type: 'redraft' | 'dynasty', limit = 50, offset = 0): Promise<SleeperDraft[]> {
    const currentYear = new Date().getFullYear()
    return this.request<SleeperDraft[]>(
      `/drafts/nfl/mock-drafts?season=${currentYear}&season_type=regular&type=${type}&limit=${limit}&offset=${offset}`
    )
  }

  async getDraftPicks(draftId: string): Promise<SleeperPick[]> {
    return this.request<SleeperPick[]>(`/draft/${draftId}/picks`)
  }

  async getWeeklyStats(season: number, week: number): Promise<Record<string, SleeperStats>> {
    return this.request<Record<string, SleeperStats>>(
      `/stats/nfl/${season}/${week}?season_type=regular`
    )
  }

  async getPlayers(): Promise<Record<string, SleeperPlayer>> {
    return this.request<Record<string, SleeperPlayer>>('/players/nfl')
  }

  async getNFLState(): Promise<SleeperState> {
    return this.request<SleeperState>('/state/nfl')
  }
}

// Database operations
class DatabaseOps {
  private supabase: any

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseServiceKey)
  }

  async getLastRefresh(runType: string): Promise<number> {
    const { data, error } = await this.supabase
      .rpc('get_last_refresh', { run_type_param: runType })
    
    if (error) throw error
    return data || 0
  }

  async getLastStatsRefresh(): Promise<{ last_season: number; last_week: number }> {
    const { data, error } = await this.supabase
      .rpc('get_last_stats_refresh')
    
    if (error) throw error
    return data[0] || { last_season: 2024, last_week: 0 }
  }

  async insertDraft(draft: SleeperDraft): Promise<void> {
    const { error } = await this.supabase
      .from('sleeper_drafts')
      .upsert(draft, { onConflict: 'draft_id' })
    
    if (error) throw error
  }

  async insertPicks(draftId: string, picks: SleeperPick[]): Promise<void> {
    if (picks.length === 0) return

    const picksData = picks.map(pick => ({
      draft_id: draftId,
      player_id: pick.player_id,
      pick_no: pick.pick_no
    }))

    const { error } = await this.supabase
      .from('sleeper_picks')
      .upsert(picksData, { onConflict: 'draft_id,player_id' })
    
    if (error) throw error
  }

  async insertStats(season: number, week: number, stats: Record<string, SleeperStats>): Promise<void> {
    const statsData = Object.entries(stats).map(([playerId, stat]) => ({
      season,
      week,
      player_id: playerId,
      pts_ppr: stat.pts_ppr,
      rec_yd: stat.rec_yd || 0,
      rec_td: stat.rec_td || 0,
      rush_yd: stat.rush_yd || 0,
      pass_yd: stat.pass_yd || 0,
      pass_td: stat.pass_td || 0
    }))

    if (statsData.length === 0) return

    const { error } = await this.supabase
      .from('sleeper_stats')
      .upsert(statsData, { onConflict: 'season,week,player_id' })
    
    if (error) throw error
  }

  async upsertPlayers(players: Record<string, SleeperPlayer>): Promise<void> {
    const playersData = Object.entries(players).map(([playerId, player]) => ({
      player_id: playerId,
      full_name: player.full_name,
      position: player.position,
      team: player.team,
      bye_week: player.bye_week
    }))

    if (playersData.length === 0) return

    const { error } = await this.supabase
      .from('sleeper_players_cache')
      .upsert(playersData, { onConflict: 'player_id' })
    
    if (error) throw error
  }

  async shouldUpdatePlayers(): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('sleeper_players_cache')
      .select('last_updated')
      .order('last_updated', { ascending: false })
      .limit(1)
    
    if (error) throw error
    
    if (!data || data.length === 0) return true
    
    const lastUpdate = new Date(data[0].last_updated)
    const hoursSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60)
    
    return hoursSinceUpdate >= 24
  }

  async recordETLRun(run: ETLRun): Promise<void> {
    const { error } = await this.supabase
      .from('etl_metadata')
      .insert({
        run_type: run.run_type,
        last_created_timestamp: run.last_created_timestamp,
        last_season: run.last_season,
        last_week: run.last_week,
        records_processed: run.records_processed,
        status: run.status,
        error_message: run.error_message
      })
    
    if (error) throw error
  }

  async refreshViews(): Promise<void> {
    const { error } = await this.supabase
      .rpc('refresh_views')
    
    if (error) throw error
  }

  async cleanOldMetadata(): Promise<void> {
    const { error } = await this.supabase
      .rpc('clean_old_etl_metadata')
    
    if (error) throw error
  }
}

// Main ETL processor
class ETLProcessor {
  private api: SleeperAPI
  private db: DatabaseOps

  constructor(supabaseUrl: string, supabaseServiceKey: string) {
    this.api = new SleeperAPI()
    this.db = new DatabaseOps(supabaseUrl, supabaseServiceKey)
  }

  async processADP(): Promise<ETLRun> {
    const run: ETLRun = {
      run_type: 'adp',
      records_processed: 0,
      status: 'success'
    }

    try {
      const lastRefresh = await this.db.getLastRefresh('adp')
      let totalDrafts = 0
      let totalPicks = 0

      // Process both redraft and dynasty drafts
      for (const type of ['redraft', 'dynasty'] as const) {
        let offset = 0
        const limit = 50

        while (true) {
          const drafts = await this.api.getMockDrafts(type, limit, offset)
          
          if (drafts.length === 0) break

          // Filter drafts created after last refresh
          const newDrafts = drafts.filter(draft => draft.created > lastRefresh)
          
          if (newDrafts.length === 0) break

          for (const draft of newDrafts) {
            try {
              // Insert draft metadata
              await this.db.insertDraft(draft)
              totalDrafts++

              // Fetch and insert picks
              const picks = await this.api.getDraftPicks(draft.draft_id)
              await this.db.insertPicks(draft.draft_id, picks)
              totalPicks += picks.length

              // Update last created timestamp
              if (draft.created > (run.last_created_timestamp || 0)) {
                run.last_created_timestamp = draft.created
              }
            } catch (error) {
              console.error(`Error processing draft ${draft.draft_id}:`, error)
              // Continue with other drafts
            }
          }

          offset += limit
          
          // Stop if we got fewer results than requested (end of data)
          if (drafts.length < limit) break
        }
      }

      run.records_processed = totalDrafts + totalPicks
      return run

    } catch (error) {
      run.status = 'error'
      run.error_message = error.message
      throw error
    }
  }

  async processStats(): Promise<ETLRun> {
    const run: ETLRun = {
      run_type: 'stats',
      records_processed: 0,
      status: 'success'
    }

    try {
      const { last_season, last_week } = await this.db.getLastStatsRefresh()
      const state = await this.api.getNFLState()
      
      // Only process if we have a new week
      if (state.season > last_season || (state.season === last_season && state.week > last_week)) {
        const stats = await this.api.getWeeklyStats(state.season, state.week)
        await this.db.insertStats(state.season, state.week, stats)
        
        run.records_processed = Object.keys(stats).length
        run.last_season = state.season
        run.last_week = state.week
      }

      return run

    } catch (error) {
      run.status = 'error'
      run.error_message = error.message
      throw error
    }
  }

  async processPlayers(): Promise<ETLRun> {
    const run: ETLRun = {
      run_type: 'players',
      records_processed: 0,
      status: 'success'
    }

    try {
      const shouldUpdate = await this.db.shouldUpdatePlayers()
      
      if (shouldUpdate) {
        const players = await this.api.getPlayers()
        await this.db.upsertPlayers(players)
        run.records_processed = Object.keys(players).length
      }

      return run

    } catch (error) {
      run.status = 'error'
      run.error_message = error.message
      throw error
    }
  }

  async runFullETL(): Promise<void> {
    console.log('Starting weekly ETL process...')

    try {
      // Process ADP data
      console.log('Processing ADP data...')
      const adpRun = await this.processADP()
      await this.db.recordETLRun(adpRun)
      console.log(`ADP processing complete: ${adpRun.records_processed} records`)

      // Process weekly stats
      console.log('Processing weekly stats...')
      const statsRun = await this.processStats()
      await this.db.recordETLRun(statsRun)
      console.log(`Stats processing complete: ${statsRun.records_processed} records`)

      // Process player data (if needed)
      console.log('Processing player data...')
      const playersRun = await this.processPlayers()
      await this.db.recordETLRun(playersRun)
      console.log(`Players processing complete: ${playersRun.records_processed} records`)

      // Refresh materialized views
      console.log('Refreshing materialized views...')
      await this.db.refreshViews()
      console.log('Materialized views refreshed')

      // Clean old metadata
      console.log('Cleaning old metadata...')
      await this.db.cleanOldMetadata()
      console.log('Old metadata cleaned')

      console.log('Weekly ETL process completed successfully')

    } catch (error) {
      console.error('ETL process failed:', error)
      throw error
    }
  }
}

// Main handler
serve(async (req) => {
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing required environment variables')
    }

    // Initialize and run ETL
    const processor = new ETLProcessor(supabaseUrl, supabaseServiceKey)
    await processor.runFullETL()

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Weekly ETL process completed successfully',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
}) 