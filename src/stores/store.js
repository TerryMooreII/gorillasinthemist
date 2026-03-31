import { createStore } from "@stencil/store";

const { state, onChange } = createStore({
  schedule: null,
  standings: null,
  loading: false,
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  access_token: localStorage.getItem('access_token') ?? null,
  isLoggedIn: localStorage.getItem('access_token') ? true : false,
  refresh_token: localStorage.getItem('refresh_token') ?? null
});


onChange('access_token', () => {
  state.schedule = null;
});

onChange('user', () => {
  state.isLoggedIn = state.user ? true : false;
});

export { onChange };
export default state;