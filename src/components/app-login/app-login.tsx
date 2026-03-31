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
      <div class="flex flex-col items-center justify-center w-full mt-8">
        <div class="flex flex-col items-center justify-center mt-8 border border-solid border-gray-300 rounded px-18 py-8 sm:w-full md:w-1/2"> 
          <h3 class="text-2xl mb-6">Login</h3>
          {this.error && <p class="text-red-500 mb-4">{this.error}</p>}
          <form onSubmit={(e) => this.handleSubmit(e)} class="flex flex-col gap-4 w-full max-w-sm ">
            <input
              type="text"
              placeholder="Username"
              value={this.username}
              onInput={(e) => this.handleUsernameInput(e)}
              class="border border-gray-400 rounded px-3 py-2 text-lg"
            />
            <input
              type="password"
              placeholder="Password"
              value={this.password}
              onInput={(e) => this.handlePasswordInput(e)}
              class="border border-gray-400 rounded px-3 py-2 text-lg"
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
              <p class="text-yellow-600 text-xs bg-yellow-50 border border-yellow-300 rounded px-2 py-1">
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
