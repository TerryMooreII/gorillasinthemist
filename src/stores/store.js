import { createStore } from "@stencil/store";

const { state, onChange } = createStore({
  schedule: null,
  standings: null,
  loading: false
});


export default state;