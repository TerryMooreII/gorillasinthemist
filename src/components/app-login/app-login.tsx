import { Component, State, h } from '@stencil/core';
import state from '../../stores/store.js';
import { login } from '../../utils/api.js';

@Component({
  tag: 'app-login',
  styleUrl: 'app-login.css',
  shadow: true,
})
export class AppLogin {
  @State() username: string = '';
  @State() password: string = '';
  @State() error: string = '';
  @State() rememberMe: boolean = false;

  connectedCallback() {
    const saved = localStorage.getItem('saved_credentials');
    if (saved) {
      try {
        const { username, password } = JSON.parse(atob(saved));
        this.username = username;
        this.password = password;
        this.rememberMe = true;
      } catch (e) {
        localStorage.removeItem('saved_credentials');
      }
    }
  }

  handleUsernameInput(event) {
    this.username = event.target.value;
  }

  handlePasswordInput(event) {
    this.password = event.target.value;
  }


  async handleSubmit(event) {
    event.preventDefault();
    this.error = '';

    if (!this.username || !this.password) {
      this.error = 'Please enter a username and password.';
      return;
    }

    try {
      const {user, access_token} = await login(this.username, this.password);

      state.user = user;
      state.access_token = access_token;
    
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      if (this.rememberMe) {
        const encodedCreds = btoa(JSON.stringify({ username: this.username, password: this.password }));
        localStorage.setItem('saved_credentials', encodedCreds);
      } else {
        localStorage.removeItem('saved_credentials');
      }

      window.location.hash = '/schedule';
    } catch(e) {
      console.error(e)
    } 
  }

  render() {
    if (state.user) {
      return (
        <div class="flex flex-col items-center justify-center w-full mt-8">
          <p class="text-lg">Welcome back <strong>{state.user.full_name}</strong>.</p>
          <p>
            Please wait while we load the schedule...
          </p>
        </div>
      );
    }

    return (
      <div class="flex flex-col items-center justify-center w-full">
        <div class="flex flex-col items-center justify-center"> 
          <div class="flex items-center gap-2 text-sm text-blue-700 bg-blue-50 border border-blue-200 border-solid rounded px-3 py-2 mb-4 w-full max-w-sm">
            <svg class="h-5 w-5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
            <p>Login with your Daysmart Polar Ice House account.</p>
          </div>
          {this.error && <p class="text-red-500 mb-4">{this.error}</p>}
          <form onSubmit={(e) => this.handleSubmit(e)} class="flex flex-col gap-4 w-full max-w-sm ">
            <input
              type="text"
              placeholder="Username"
              value={this.username}
              onInput={(e) => this.handleUsernameInput(e)}
              class="border border-gray-400 rounded px-3 py-2 text-lg bg-white"
            />
            <input
              type="password"
              placeholder="Password"
              value={this.password}
              onInput={(e) => this.handlePasswordInput(e)}
              class="border border-gray-400 rounded px-3 py-2 text-lg bg-white"
            />
            <label class="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={this.rememberMe}
                onChange={() => this.rememberMe = !this.rememberMe}
                class="w-4 h-4"
              />
              Remember me on this device
            </label>
            {this.rememberMe && (
              <p class="text-yellow-600 text-xs bg-yellow-50 border border-yellow-300 border-solid rounded px-2 py-1">
                Warning: Your username and password will be stored in plain text on this device. Only use this on a trusted personal device.
              </p>
            )}
            <button
              type="submit"
              class="bg-gray-800 text-white rounded px-4 py-2 text-lg hover:bg-gray-700"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }
}
