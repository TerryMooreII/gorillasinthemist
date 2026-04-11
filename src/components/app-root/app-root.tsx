import { Component, State, h } from '@stencil/core';
import { Env } from '@stencil/core';
import state from '../../stores/store.js';
import { login, refreshToken } from '../../utils/api.js';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: true,
})
export class AppRoot {
  @State() autoLoggingIn: boolean = !!localStorage.getItem('saved_credentials');

  private handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      this.checkTokenExpiration();
    }
  };

  connectedCallback() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  disconnectedCallback() {
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
  }

  async componentDidLoad() {
    document.title = Env.teamName
    await this.autoLogin();
  }

  private async checkTokenExpiration() {
    if (!state.isLoggedIn || !state.access_token) return;

    try {
      const payload = JSON.parse(atob(state.access_token.split('.')[1]));
      const remainingMs = payload.exp * 1000 - Date.now();

      if (remainingMs < 3_600_000) {
        const saved = localStorage.getItem('saved_credentials');
        if (saved) {
          await this.autoLogin();
        } else {
          this.logout();
        }
      }
    } catch (e) {
      console.error('Failed to check token expiration:', e);
    }
  }

  async autoLogin() {
    const saved = localStorage.getItem('saved_credentials');
    if (!saved) {
      this.autoLoggingIn = false;
      return;
    }

    this.autoLoggingIn = true;

    try {
      const { username, password } = JSON.parse(atob(saved));
      if (!username || !password) return;

      const { user, access_token } = await login(username, password);
      state.user = user;
      state.access_token = access_token;
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
    } catch (e) {
      console.error('Auto-login failed:', e);
      localStorage.removeItem('saved_credentials');
    } finally {
      this.autoLoggingIn = false;
    }
  }

  async doRefreshToken() {
    const token  = await refreshToken();
    state.access_token = token;
    localStorage.setItem('access_token', token);
  }

  logout() {
    state.user = null;
    state.access_token = null;
    state.refresh_token = null;
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('saved_credentials');
    window.location.hash = '/schedule';
  }

  render() {
    return (
      <div class="flex-col justify-center container p-2 mx-auto mt-8">
        <div class="flex flex-col justify-center items-center w-full">
          <img class="w-32 block mb-3" src={Env.logo} alt={Env.teamName} />
          <div class="mt-4 lg:mt-0">
            <h1 class="lg:text-6xl text-2xl text-center">{Env.teamName}</h1>
            <h2 class="lg:text-2xl text-xl mt-2 lg:tracking-widest text-center">{Env.teamDescription}</h2>
          </div>
        </div>
        <div class="mt-8">
          <div class="px-0 lg:px-36">
            <div class="flex justify-center items-center w-full  border-t border-b  border-solid border-solid border-gray-400 mb-12">
              <div class="flex items-center justify-around w-full lg:w-1/2">
                <stencil-route-link url="/schedule" class=" py-2 text-lg text-center" activeClass="underline">
                  Schedule
                </stencil-route-link>
                <stencil-route-link url="/standings" class=" py-2 text-lg text-center" activeClass="underline">
                  Standings
                </stencil-route-link>
                {
                Env.teamName && <stencil-route-link url="/rules" class=" py-2 text-lg text-center" activeClass="underline">
                  Beer Rules
                </stencil-route-link>
                }
                {state.user
                  ? <button onClick={() => this.logout()} class="px-4 py-1 text-sm text-white bg-gray-800 hover:bg-gray-700 rounded">Logout</button>
                  : <stencil-route-link url="/login" anchorClass="px-4 py-1 text-sm text-white bg-gray-800 hover:bg-gray-700 rounded inline-block no-underline">Login</stencil-route-link>
                }
              </div>
            </div>

            {this.autoLoggingIn
              ? <app-spinner message="Please wait while refreshing login..."></app-spinner>
              : <stencil-router historyType={'hash'}>
                  <stencil-route-switch scrollTopOffset={0}>
                    <stencil-route url="/" component="app-schedule" exact={true} />
                    <stencil-route url="/schedule" component="app-schedule"  exact={true} />
                    <stencil-route url="/standings" component="app-standings"  exact={true} />
                    <stencil-route url="/rules" component="app-rules"  exact={true} />
                    <stencil-route url="/login" component="app-login" exact={true} />
                    {
                      Env.roster && <stencil-route url="/roster" component="app-roster"  exact={true} />
                    }
                  </stencil-route-switch>
                </stencil-router>
            }
            </div>
          </div>
        </div>
    );
  }
}
