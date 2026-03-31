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
      <div class="flex flex-col items-center justify-center w-full py-16 overflow-hidden">
        <div class="zamboni mb-4">
          <img src="assets/zamboni.png" alt="Zamboni" />
        </div>
        <p class="text-lg text-gray-600">{this.message}</p>
      </div>
    );
  }
}
