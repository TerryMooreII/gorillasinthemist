import { Component, Listen, State, h } from '@stencil/core';
import { getDayOfWeek, formatDate, formatTime } from '../../utils/date-helpers.js'
import { getSchedule, getBeerData, teamid } from '../../utils/api.js'
import state from '../../stores/store.js'

@Component({
  tag: 'app-schedule',
  styleUrl: 'app-schedule.css',
  shadow: true,
})
export class AppSchedule {
  @State() events = []
  @State() beerList = null
  @State() loading = true

  @Listen('rsvpChanged')
  handleRsvpChanged(event: CustomEvent) {
    const { eventId, oldStatus, newStatus } = event.detail;
    this.events = this.events.map((e: any) => {
      if (e.id !== eventId) return e;
      let count = e.rsvp_count;
      if (newStatus === 'y' && oldStatus !== 'y') count++;
      if (oldStatus === 'y' && newStatus !== 'y') count--;
      return { ...e, rsvp_count: count };
    });
  }

  async componentDidLoad() {
    if (state.schedule) {
      this.events = state.schedule;
      this.loading = false;
      return;
    }
    await this.loadSchedule();
  }

  async loadSchedule() {
    this.loading = true;
    const json = await getSchedule()
    this.events = this.getData(json)
    this.beerList = await getBeerData()
    state.schedule = this.events
    this.loading = false;
  }

  getRsvpData(json) {
    /// Get the roster
    const roster = json.included
      .filter((item) => item.type === "customers")
      .reduce((acc, item) => {
        acc[item.id] = {
          customerId: item.id,
          firstName: item.attributes.first_name,
          lastName: item.attributes.last_name,
          email: item.attributes.email,
          fullName: item.attributes.full_name,
        }
        return acc;
      }, {});

    const games = json.included
      .filter((item) => item.type === "events" && item.attributes.event_type_id !== "L")
      .reduce((acc, i) => {
        acc[i.id] = { ...roster }
        return acc;
      }, {});
    
    const rsvpStates =  json.included
      .filter((item) => item.type === "rsvp-states")

    rsvpStates.forEach((item) => {
      const gameId = item.attributes.event_id
      const playerId = item.attributes.customer_id
      games[gameId][playerId] = {
        ...games[gameId][playerId],
        status: item.attributes.status,
        rsvpId: item.id,
      }
    })
    return games
  }

  getData(json) {
    const rsvpList = state.access_token ? this.getRsvpData(json) : {};
    const facilities = json.included
      .filter((item) => item.type === "resources")
      .reduce((acc, item) => {
        acc[item.id] = item.attributes.name;
        return acc;
      }, {});

  const teams = json.included
    .filter((item) => item.type === "teams")
    .reduce((acc, item) => {
      acc[item.id] = item.attributes.name;
      return acc;
    }, {
      // Add moose knucks
      [json.data.id]: json.data.attributes.name
    });

  return json.included
    .filter(
      (item) => item.type === "events" && item.attributes.event_type_id !== "L"
    )
    .map((item) => {
      const e = item.attributes;
      const rsvps = rsvpList[item.id] ? Object.values(rsvpList[item.id]) : []

      return {
        id: item.id,
        location: facilities[e.resource_id],
        hscore: e.home_score ?? 0,
        vscore: e.visiting_score ?? 0,
        sub_type: e.sub_type,
        hteam_id: e.hteam_id,
        vteam_id: e.vteam_id,
        hteam: teams[e.hteam_id] ?? "Home Team",
        vteam: teams[e.vteam_id] ?? "Away Team",
        desc: e.desc,
        start_date: e.start_date,
        start_time: e.event_start_time,
        date_formatted: formatDate(e.start_date),
        time_fomatted: formatTime(e.event_start_time),
        day_of_week: getDayOfWeek(e.start_date),
        rsvp_count: rsvps.filter((rsvp: any) => rsvp.status === 'y').length,
        myRsvpStatus: this.getRsvpStatus(rsvps),
        rsvps: rsvps.sort((a: any, b: any) => {
          const score = (status: string) => {
            if (status === 'y') return 0;
            if (status === 'n') return 1;
            return 2;
          };
          return score(a.status) - score(b.status);
        })
      };
    })
    .sort((a, b) =>
      a.start_date > b.start_date ? 1 : a.start_date < b.start_date ? -1 : 0
    );
  }


  getNextEvent(events) {
    const now = Date.now();
    let diff = 0;
    let nextEvent = null;
    events.forEach((item) => {
      if (![item.vteam_id, item.hteam_id].includes(+teamid)) return
      const dt = [item.start_date.split('T')[0], item.start_time].join('T')
      const eventDate = new Date(dt).getTime();
      if (eventDate > now) {
        const distance = eventDate - now;
        if (diff === 0) {
          diff = distance;
          nextEvent = item;
        } else if (distance < diff) {
          diff = distance;
          nextEvent = item;
        }
      }
    });
    
    return nextEvent
  }

  getRsvpStatus(rsvps) {
    const myRsvp = rsvps?.find((rsvp) => rsvp.customerId === state.user.id);
    return myRsvp ? { status: myRsvp.status, rsvpId: myRsvp.rsvpId } : null;
  }

  makeEventDom (event, i) {
    return (<div class="flex-column border-b border-solid border-gray-400 lg:w-1/2 w-full" key={i}>
    <div class={`flex w-full flex-col py-5`}>
      <div class="event flex flex-col w-full p-4">
        <div class={`away flex items-center justify-between ${event.vscore > event.hscore ? 'font-bold' : ''}`}>
          <div class="team text-lg">{event.vteam}</div>
          <div class="score text-lg">{event.vscore}</div>
        </div>
        <div class={`home flex items-center justify-between ${event.hscore > event.vscore ? 'font-bold' : ''}`}>
          <div class="team text-lg">{event.hteam}</div>
          <div class="score text-lg">{event.hscore}</div>
        </div>
        <div class="meta flex items-center justify-between mt-2 text-md text-zinc-800 font-light">
          <div class="location">{event.location}</div>
          <div class="timedate">
            {event.day_of_week} {event.date_formatted} {event.time_fomatted}
          </div>
        </div>
        { 
          (this.beerList && this.beerList.get(event.date_formatted)) 
            && <div class="meta flex items-center justify-start mt-2 text-md text-zinc-900 font-light">
              <span class="text-2xl">🍻</span> &nbsp; { ` provided by ${this.beerList.get(event.date_formatted)}` } 
          </div>
        }
      </div>
      { state.isLoggedIn && event.rsvps.length > 0 && (
        <details class="rsvps px-4">
          <summary class="cursor-pointer py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 flex items-center justify-between list-none">
            <div class="select-none flex items-center">
              <span class="disclosure-arrow mr-1 inline-block transition-transform">&#9654;</span>
              RSVPs
              <small class="ml-2 px-2 py-1 rounded text-xs font-semibold bg-green-200 text-green-700">
                {event.rsvp_count} attending
              </small>
            </div>
            <div class="w-1/2">
              <app-rsvp eventId={event.id} rsvpId={event.myRsvpStatus?.rsvpId} currentStatus={event.myRsvpStatus?.status} customerId={state.user?.id} teamId={teamid}></app-rsvp>
            </div>
          </summary>
          <table class="w-full border-collapse border border-gray-400 text-sm dark:border-gray-500 dark:bg-gray-800">
            <thead class="dark:bg-gray-700">
              <tr>
                <th class="w-1/2 border border-gray-300 p-2 text-left font-semibold text-gray-900 dark:border-gray-600 dark:text-gray-200 bg-gray-100">Name</th>
                <th class="w-1/2 border border-gray-300 p-2 text-left font-semibold text-gray-900 dark:border-gray-600 dark:text-gray-200 bg-gray-100">Status</th>
              </tr>
            </thead>
            <tbody>
              {event.rsvps.map((rsvp) => (
                <tr>
                  <td class="border border-gray-300 p-2 text-gray-500 dark:border-gray-700 dark:text-gray-400">{rsvp.fullName}</td>
                  <td class="border border-gray-300 p-2 text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    <span class={`px-2 py-1 rounded text-xs font-semibold ${rsvp.status === 'y' ? 'bg-green-200 text-green-700' : ''} ${rsvp.status === 'n' ? 'bg-red-200 text-red-700' : ''}`}>
                      {rsvp.status === 'y' ? 'Yes' : rsvp.status === 'n' ? 'No' : ''}
                      </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}
    </div>
  </div>)
  }

  getNextEventDom(events) {
    const nextEvent = this.getNextEvent(events)
    if (!nextEvent) return <div class="text-center">n/a</div>
    return this.makeEventDom(nextEvent, 0)
  }

  getScheduleDom(events) {
    return events.map((event, i) => (
      this.makeEventDom(event, i)
    ))
  }

  render() {
    if (this.loading) {
      return <app-spinner message="Loading schedule..."></app-spinner>;
    }
    return (
      <div class="flex-col w-full flex items-center justify-center">
        <h4 class="text-2xl text-center w-full"> Next Game </h4>
        {this.getNextEventDom(this.events) || 'n/a'}
        <h4 class="text-2xl text-center w-full my-3 mt-8"> Schedule </h4>
        {this.getScheduleDom(this.events)}
      </div>
    );
  }
}
