import { Component, h } from '@stencil/core';
import { Env } from '@stencil/core';
import state from '../../stores/store.js';
import { refreshToken } from '../../utils/api.js';

@Component({
  tag: 'app-root',
  styleUrl: 'app-root.css',
  shadow: true,
})
export class AppRoot {

  async componentWillLoad() {
    console.log('componentWillLoad');
    document.title = Env.teamName
    await this.doRefreshToken();
  }

  async doRefreshToken() {
    console.log('doRefreshToken');
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
              <div class="flex items-center justify-center">
                <stencil-route-link url="/schedule" class="w-32 py-2 text-lg text-center" activeClass="underline">
                  Schedule
                </stencil-route-link>
                <stencil-route-link url="/standings" class="w-32 py-2 text-lg text-center" activeClass="underline">
                  Standings              
                </stencil-route-link>      
                {
                Env.teamName && <stencil-route-link url="/rules" class="w-32 py-2 text-lg text-center" activeClass="underline">
                  Beer Rules
                </stencil-route-link>
                }
                {state.user
                  ? <button onClick={() => this.logout()} class="w-32 py-2 text-lg text-center">Logout</button>
                  : <stencil-route-link url="/login" class="w-32 py-2 text-lg text-center" activeClass="underline">Login</stencil-route-link>
                }
              </div>
            </div>

            <stencil-router historyType={'hash'}>
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
            </div>
          </div>
        </div>
    );
  }
}
