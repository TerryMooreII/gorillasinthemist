import { Component, State, h } from '@stencil/core';
import { getStandings, teamid } from '../../utils/api.js'
import state from '../../stores/store.js'


@Component({
  tag: 'app-standings',
  styleUrl: 'app-standings.css'
})
export class AppStandings {

  @State() standings

  async componentWillLoad() {
    if (state.standings) {
      this.standings = state.standings
      return
    }

    const json = await getStandings()
    const winLosses = this.getData(json)
    const stats = this.getStats(json)

    this.standings = winLosses.map((t) => {
      return {
        //@ts-ignore
        ...t,
        //@ts-ignore
        ...stats[t.teamId]
      }
    })
    state.standings = this.standings
  }

  getTeams(json) {
    return json.included
      .filter((item) => item.type === "team")
      .reduce(
        (acc, item) => {
          acc[item.id] = item.attributes.name;
          return acc;
        },
        {
          // Add moose knucks
          [json.data.id]: json.data.attributes.name
        }
      );
  }

  getStatsTypes(json) {
    return json.included
    .filter((s) => s.type === "stat")
    .reduce((acc, s) => {
      acc[s.id] = s.attributes.short_desc;
      return acc;
    }, {});
  }

  getStats(json) {
    const statTypes = this.getStatsTypes(json)

    return json.included
    .filter((s) => {
      return s.type === "stat-event";
    })
    .reduce((acc, se) => {
      const { value, team_id, stat_id } = se.attributes;
      if (!acc[team_id]) {
        acc[team_id] = {};
      }
      if (acc[team_id][statTypes[stat_id]] == null) {
        acc[team_id] = { ...acc[team_id], [statTypes[stat_id]]: value };
      } else {
        acc[team_id] = {
          ...acc[team_id],
          [statTypes[stat_id]]: acc[team_id][statTypes[stat_id]] + value
        };
      }
      return acc;
    }, {});
  }

  getData(json) {
    const teams = this.getTeams(json)
    return Object.values(json.included
      .filter((data) => data.type === "event")
      .reduce((acc, e) => {
        const { hscore, vscore, vteam_id, hteam_id } = e.attributes;
        if (vscore == null || hscore == null) return acc;
        if (!acc[hteam_id]) {
          acc[hteam_id] = {
            teamId: hteam_id,
            teamName: teams[hteam_id],
            w: 0,
            l: 0,
            t: 0,
            gf: 0,
            ga: 0
          };
        }
        if (!acc[vteam_id]) {
          acc[vteam_id] = {
            teamId: vteam_id,
            teamName: teams[vteam_id],
            w: 0,
            l: 0,
            t: 0,
            gf: 0,
            ga: 0
          };
        }

        if (hscore === vscore) {
          acc[hteam_id].t = acc[hteam_id].t + 1;
          acc[vteam_id].t = acc[vteam_id].t + 1;
        } else if (hscore > vscore) {
          acc[hteam_id].w = acc[hteam_id].w + 1;
          acc[vteam_id].l = acc[vteam_id].l + 1;
        } else {
          acc[hteam_id].l = acc[hteam_id].l + 1;
          acc[vteam_id].w = acc[vteam_id].w + 1;
        }

        acc[hteam_id].gf = acc[hteam_id].gf + hscore
        acc[hteam_id].ga = acc[hteam_id].ga + vscore
        acc[vteam_id].gf = acc[vteam_id].gf + vscore
        acc[vteam_id].ga = acc[vteam_id].ga + hscore
        return acc;
      }, {})).map(d => {
        return {
          // @ts-ignore
          ...d,
          // @ts-ignore
          pd: Math.round(d.gf- d.ga),
          // @ts-ignore
          pct: (2 * d.w + d.t) / ((d.w + d.l + d.t) *2) * 100
        }
      })
      // @ts-ignore
      .sort((a, b) => b.pct - a.pct || b.pd - a.pd);
      //.sort((a, b) => a.pct > b.pct ? -1 : a.pct < b.pct ? 1 : 0);
  }

  render() {
    if (state.loading) {
      return (
        <div class="text-center">
                Loading....
              </div>
      )
    }
    return (
      <div class="flex-col w-full flex items-center justify-center">
        <div class="flex items-center justify-center w-full lg:w-1/2">
          <table class="w-full">
            <thead>
              <tr>
                <th class="w-1/3">Team</th>
                <th class="w-20">Win</th>
                <th class="w-20">Loss</th>
                <th class="w-20">Tie</th>
                <th class="w-20">GF</th>
                <th class="w-20">GA</th>
                <th class="w-20">PD</th>
                <th class="w-20">PCT</th>
              </tr>
            </thead>
            <tbody>
              {this.standings.map((t, i) => {
                return (
                  <tr>
                    <td class={`py-1 border-gray-300 border-b ${t.teamId === +teamid ? 'font-bold' : ''}`}>{i + 1}. {t.teamName}</td>
                    <td class="text-center py-1 border-gray-300 border-b">{t.w}</td>
                    <td class="text-center py-1 border-gray-300 border-b">{t.l}</td>
                    <td class="text-center py-1 border-gray-300 border-b">{t.t}</td>
                    <td class="text-center py-1 border-gray-300 border-b">{t.gf}</td>
                    <td class="text-center py-1 border-gray-300 border-b">{t.ga}</td>
                    <td class="text-center py-1 border-gray-300 border-b">{t.pd}</td>
                    <td class="text-center py-1 border-gray-300 border-b">{t.pct.toFixed(2)}%</td>
                  </tr>
                  )
              })}
            </tbody>
            <tfoot>
            <tr>
              <td colSpan={8} class="text-sm"> * Ranked by: Percentage, Points Diff</td>
            </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  }
}
