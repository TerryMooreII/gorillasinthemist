import { Component, Event, EventEmitter, Prop, State, h } from '@stencil/core';
import { createRsvp, updateRsvp } from '../../utils/api.js';

@Component({
  tag: 'app-rsvp',
  styleUrl: 'app-rsvp.css',
  shadow: true,
})
export class AppRsvp {
  @Prop() eventId: string;
  @Prop() currentStatus: string;
  @Prop({ mutable: true }) rsvpId: string;
  @Prop() customerId: string;
  @Prop() teamId: string;

  @Event() rsvpChanged: EventEmitter;

  @State() status: string;

  componentWillLoad() {
    this.status = this.currentStatus || '';
  }

  async handleRsvp(newStatus: string) {
    const previous = this.status;
    this.status = newStatus;

    try {
      if (this.rsvpId) {
        await updateRsvp({ rsvpId: this.rsvpId, status: newStatus });
      } else {
        const result = await createRsvp({
          eventId: this.eventId,
          customerId: this.customerId,
          teamId: this.teamId,
          status: newStatus,
        });
        if (result?.data?.id) {
          this.rsvpId = result.data.id;
        }
      }
      this.rsvpChanged.emit({ eventId: this.eventId, oldStatus: previous, newStatus });
    } catch (e) {
      console.error('RSVP failed:', e);
      this.status = previous;
    }
  }

  render() {
    return (
      <div class="flex items-center gap-0 w-full">
        <span class="text-sm font-semibold text-gray-900 mr-2">Attending:</span>
        <button
          class={`px-2 py-1 text-sm font-semibold border border-gray-300 rounded-l w-1/2
            ${this.status === 'y' ? 'bg-green-200 text-green-700' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          onClick={() => this.handleRsvp('y')}
        >
          Yes
        </button>
        <button
          class={`px-2 py-1 text-sm font-semibold border border-gray-300 border-l-0 rounded-r w-1/2
            ${this.status === 'n' ? 'bg-red-200 text-red-700' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          onClick={() => this.handleRsvp('n')}
        >
          No
        </button>
      </div>
    );
  }
}
