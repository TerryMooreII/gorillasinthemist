import { Component, Prop, h } from '@stencil/core';

@Component({
  tag: 'app-spinner',
  styleUrl: 'app-spinner.css',
  shadow: true,
})
export class AppSpinner {
  @Prop() message: string = 'Loading...';

  render() {
    return (
      <div class="flex flex-col items-center justify-center w-full py-16">
        <svg class="animate-spin h-10 w-10 text-gray-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-lg text-gray-600">{this.message}</p>
      </div>
    );
  }
}
