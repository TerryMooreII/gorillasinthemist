import { Component, State, h } from '@stencil/core';
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

  async componentWillLoad() {
    if (state.schedule) {
      this.events = state.schedule
      return 
    }
    const json = await getSchedule()
    this.events = await this.getData(json)
    this.beerList = await getBeerData()
    state.schedule = this.events
  }

  async getData(json) {
    const facilities = json.included
    .filter((item) => item.type === "resource")
    .reduce((acc, item) => {
      acc[item.id] = item.attributes.name;
      return acc;
    }, {});

  const teams = json.included
    .filter((item) => item.type === "team")
    .reduce((acc, item) => {
      acc[item.id] = item.attributes.name;
      return acc;
    }, {
      // Add moose knucks
      [json.data.id]: json.data.attributes.name
    });

  return json.included
    .filter(
      (item) => item.type === "event" && item.attributes.event_type !== "L"
    )
    .map((item) => {
      const e = item.attributes;
      return {
        location: facilities[e.resource_id],
        hscore: e.hscore ?? 0,
        vscore: e.vscore ?? 0,
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
        day_of_week: getDayOfWeek(e.start_date)
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

  makeEventDom (event, i) {
    return (<div class="flex-column border-b border-gray-400 lg:w-1/2 w-full" key={i}>
    <div class={`flex w-full py-5`}>
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
          (this.beerList && this.beerList[event.date_formatted]) 
            && <div class="meta flex items-center justify-start mt-2 text-md text-zinc-900 font-light">
              <span class="text-2xl">🍻</span> &nbsp; { ` provided by ${this.beerList[event.date_formatted]}` } 
          </div>
        }
      </div>
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
    if (state.loading) {
      return (
        <div class="text-center">
                Loading....
              </div>
      )
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
