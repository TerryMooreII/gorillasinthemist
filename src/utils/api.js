import state from '../stores/store.js'
import { Env } from '@stencil/core';

// Moose
// export const teamid = "4112" 
// export const leagueid = "2525"

// Gorilla
// export const teamid = "5059";
// export const leagueid ="2502"

export const teamid = Env.teamId;
export const leagueid = Env.leagueId

const SCHEDULE_API = `https://apps.daysmartrecreation.com/dash/jsonapi/api/v1/teams/${teamid}?cache[save]=false&include=events.eventType,events.homeTeam,events.visitingTeam,events.resource.facility,events.resourceArea,events.comments,league.playoffEvents.eventType,league.playoffEvents.homeTeam,league.playoffEvents.visitingTeam,league.playoffEvents.resource.facility,league.playoffEvents.resourceArea,league.playoffEvents.comments,league.programType,product.locations,programType,season,skillLevel,ageRange,sport&company=polarice`;
const sheetsUrl =
"https://docs.google.com/spreadsheets/d/10yet2waUUOQmNdMW7mH1nBQC4Ue6_piqAdMQh5HjDys/gviz/tq?tqx=out:html&tq&gid=0";

const STANDINGS_API =
    `https://apps.daysmartrecreation.com/dash/jsonapi/api/v1/leagues/${leagueid}?cache[save]=false&include=sport%2Cteams.homeEvents.statEvents.stat%2Cteams.visitingEvents.statEvents.stat&company=polarice`

export const getSchedule = async () => {
  state.loading = true
  try {
    const response = await fetch(SCHEDULE_API);
    return await response.json();  
  } catch(e) {
    console.error(e)
  } finally {
    state.loading = false
  }
};

export const getStandings = async () => {
  state.loading = true
  try {
    const response = await fetch(STANDINGS_API);
    return await response.json();  
  } catch(e) {
    console.error(e)
  } finally {
    state.loading = false
  }
};