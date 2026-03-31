import { Component, State, h } from '@stencil/core';
import state from '../../stores/store.js';
import { login } from '../../utils/api.js';

@Component({
  tag: 'app-login',
  styleUrl: 'app-login.css',
  shadow: true,
})
export class AppLogin {
  @State() username: string = 'terry@mooreii.com';
  @State() password: string = 'bmp*cdh@mez2wav-ZJU';
  @State() error: string = '';

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
        <div class="flex flex-col items-center justify-center mt-8 border border-solid border-gray-300 rounded px-18 py-8"> 
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
