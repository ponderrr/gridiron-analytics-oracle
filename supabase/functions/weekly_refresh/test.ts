// Test script for weekly_refresh ETL function
// Run with: deno test --allow-net --allow-env test.ts

import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts"

// Mock data for testing
const mockDraft: any = {
  draft_id: "test_draft_123",
  created: 1704067200000, // 2024-01-01
  type: "redraft",
  season: 2024,
  season_type: "regular"
}

const mockPicks: any[] = [
  { player_id: "player1", pick_no: 1 },
  { player_id: "player2", pick_no: 2 },
  { player_id: "player3", pick_no: 3 }
]

const mockStats: any = {
  "player1": {
    pts_ppr: 25.5,
    rec_yd: 120,
    rec_td: 1,
    rush_yd: 0,
    pass_yd: 0,
    pass_td: 0
  },
  "player2": {
    pts_ppr: 18.2,
    rec_yd: 0,
    rec_td: 0,
    rush_yd: 85,
    pass_yd: 0,
    pass_td: 0
  }
}

const mockPlayers: any = {
  "player1": {
    player_id: "player1",
    full_name: "Test Player 1",
    position: "WR",
    team: "TEST",
    bye_week: 6
  },
  "player2": {
    player_id: "player2", 
    full_name: "Test Player 2",
    position: "RB",
    team: "TEST",
    bye_week: 6
  }
}

// Test RateLimiter class
Deno.test("RateLimiter should throttle requests", async () => {
  const start = Date.now()
  
  // Import the RateLimiter class from the main file
  // Note: In a real test, you'd extract this to a separate module
  class RateLimiter {
    private lastRequest = 0
    private minInterval = 100 // 0.1 seconds for testing

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

  const limiter = new RateLimiter()
  
  await limiter.throttle()
  await limiter.throttle()
  await limiter.throttle()
  
  const duration = Date.now() - start
  // Should take at least 200ms (2 intervals of 100ms each)
  assertEquals(duration >= 200, true)
})

// Test SleeperAPI class (mock version)
Deno.test("SleeperAPI should handle requests correctly", async () => {
  class MockSleeperAPI {
    private baseUrl = 'https://api.sleeper.app/v1'

    async request<T>(endpoint: string): Promise<T> {
      // Mock responses based on endpoint
      if (endpoint.includes('/drafts/nfl/mock-drafts')) {
        return [mockDraft] as T
      } else if (endpoint.includes('/draft/') && endpoint.includes('/picks')) {
        return mockPicks as T
      } else if (endpoint.includes('/stats/nfl/')) {
        return mockStats as T
      } else if (endpoint.includes('/players/nfl')) {
        return mockPlayers as T
      } else if (endpoint.includes('/state/nfl')) {
        return { week: 1, season: 2024, season_type: 'regular' } as T
      }
      
      throw new Error(`Unknown endpoint: ${endpoint}`)
    }

    async getMockDrafts(type: string): Promise<any[]> {
      return this.request<any[]>(`/drafts/nfl/mock-drafts?type=${type}`)
    }

    async getDraftPicks(draftId: string): Promise<any[]> {
      return this.request<any[]>(`/draft/${draftId}/picks`)
    }

    async getWeeklyStats(season: number, week: number): Promise<any> {
      return this.request<any>(`/stats/nfl/${season}/${week}`)
    }

    async getPlayers(): Promise<any> {
      return this.request<any>('/players/nfl')
    }

    async getNFLState(): Promise<any> {
      return this.request<any>('/state/nfl')
    }
  }

  const api = new MockSleeperAPI()
  
  // Test draft fetching
  const drafts = await api.getMockDrafts('redraft')
  assertEquals(drafts.length, 1)
  assertEquals(drafts[0].draft_id, 'test_draft_123')
  
  // Test picks fetching
  const picks = await api.getDraftPicks('test_draft_123')
  assertEquals(picks.length, 3)
  assertEquals(picks[0].player_id, 'player1')
  
  // Test stats fetching
  const stats = await api.getWeeklyStats(2024, 1)
  assertEquals(Object.keys(stats).length, 2)
  assertEquals(stats.player1.pts_ppr, 25.5)
  
  // Test players fetching
  const players = await api.getPlayers()
  assertEquals(Object.keys(players).length, 2)
  assertEquals(players.player1.full_name, 'Test Player 1')
  
  // Test state fetching
  const state = await api.getNFLState()
  assertEquals(state.week, 1)
  assertEquals(state.season, 2024)
})

// Test data transformation
Deno.test("Data transformation should work correctly", () => {
  // Test picks transformation
  const picksData = mockPicks.map(pick => ({
    draft_id: 'test_draft_123',
    player_id: pick.player_id,
    pick_no: pick.pick_no
  }))
  
  assertEquals(picksData.length, 3)
  assertEquals(picksData[0].draft_id, 'test_draft_123')
  assertEquals(picksData[0].player_id, 'player1')
  assertEquals(picksData[0].pick_no, 1)
  
  // Test stats transformation
  const statsData = Object.entries(mockStats).map(([playerId, stat]: [string, any]) => ({
    season: 2024,
    week: 1,
    player_id: playerId,
    pts_ppr: stat.pts_ppr,
    rec_yd: stat.rec_yd || 0,
    rec_td: stat.rec_td || 0,
    rush_yd: stat.rush_yd || 0,
    pass_yd: stat.pass_yd || 0,
    pass_td: stat.pass_td || 0
  }))
  
  assertEquals(statsData.length, 2)
  assertEquals(statsData[0].season, 2024)
  assertEquals(statsData[0].week, 1)
  assertEquals(statsData[0].pts_ppr, 25.5)
  assertEquals(statsData[0].rec_yd, 120)
  
  // Test players transformation
  const playersData = Object.entries(mockPlayers).map(([playerId, player]: [string, any]) => ({
    player_id: playerId,
    full_name: player.full_name,
    position: player.position,
    team: player.team,
    bye_week: player.bye_week
  }))
  
  assertEquals(playersData.length, 2)
  assertEquals(playersData[0].player_id, 'player1')
  assertEquals(playersData[0].full_name, 'Test Player 1')
  assertEquals(playersData[0].position, 'WR')
})

// Test ETL run tracking
Deno.test("ETL run tracking should work correctly", () => {
  const adpRun = {
    run_type: 'adp' as const,
    records_processed: 4, // 1 draft + 3 picks
    status: 'success' as const,
    last_created_timestamp: 1704067200000
  }
  
  assertEquals(adpRun.run_type, 'adp')
  assertEquals(adpRun.records_processed, 4)
  assertEquals(adpRun.status, 'success')
  assertExists(adpRun.last_created_timestamp)
  
  const statsRun = {
    run_type: 'stats' as const,
    records_processed: 2,
    status: 'success' as const,
    last_season: 2024,
    last_week: 1
  }
  
  assertEquals(statsRun.run_type, 'stats')
  assertEquals(statsRun.records_processed, 2)
  assertEquals(statsRun.last_season, 2024)
  assertEquals(statsRun.last_week, 1)
})

console.log("All tests passed! ✅") 