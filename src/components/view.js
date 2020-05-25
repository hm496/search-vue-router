export default {
  name: 'SearchRouterView',
  functional: true,
  props: {
    name: {
      type: String,
      default: 'default'
    }
  },
  render (_, { props, children, parent, data }) {
    // used by devtools to display a router-view badge
    data.routerView = true;

    // directly use parent context's createElement() function
    // so that components rendered by router-view can resolve named slots
    const h = parent.$createElement;
    const name = props.name;
    const route = parent.$searchRoute;
    const cache = parent._routerViewCache || (parent._routerViewCache = {});

    const component = route && route.component;

    // render empty node if no matched route or no config component
    if (!component) {
      cache[name] = null;
      return h();
    }

    // cache component
    cache[name] = { component };

    return h(component, data, children);
  }
};
