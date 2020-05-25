import SearchRouterView from './components/view';
import History from './history';

// new SearchVueRouter
export default class SearchVueRouter {
  constructor(options = {}) {
    // options.routes
    // options.searchKey
    this.init();
    this.options = options;
    this.searchKey = options.searchKey || 'searchPath';
    this.history = new History(this);
    this.apps = [];

    /*
    * {
    * "/": { path: '/', component: Home },
    * "/page1": { path: '/page1', component: Page1 },
    * "/page2": { path: '/page2', component: Page2 },
    * "__route__name__page1": { name: 'page1', component: Page1 },
    * "__route__name__page2": { name: 'page2', component: Page2 },
    * }
    * */
    function format(routes) {
      const r = {};
      routes.forEach(item => {
        if (item.path !== undefined) r[item.path] = item;
        if (item.name !== undefined) r['__route__name__' + item.name] = item;
      });
      return r;
    }

    if (this.options.routes) {
      this.formatRoutes = format(this.options.routes);
    }
  }

  init(app) {
    if (app) {
      this.apps.push(app);
    }
  }

  update() {
    const cur = this.getMatchedComponent();
    console.log('cur', cur);
    this.apps.forEach(app => {
      app._searchRoute = cur;
    });
  }

  getCurrentLocation() {
    let r = window.location.search.match(new RegExp('(\\?|&)' + this.searchKey + '=([^&]*)(&|$)'));
    let path = '/';
    if (r !== null) {
      path = r[2];
    }
    var location = {
      path
    };
    this.current = location;
    return location;
  }

  getMatchedComponent() {
    if (!this.formatRoutes) return;
    const location = this.getCurrentLocation();
    let matched = this.formatRoutes && this.formatRoutes[location.path];
    if (!matched) {
      matched = this.formatRoutes['__route__name__' + location.path];
    }
    return matched;
  }

  push(path, onComplete, onAbort) {
    const location = { path };
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise((resolve, reject) => {
        this.history.push(location, resolve, reject);
      });
    } else {
      this.history.push(location, onComplete, onAbort);
    }
  }

  replace(path, onComplete, onAbort) {
    const location = { path };
    if (!onComplete && !onAbort && typeof Promise !== 'undefined') {
      return new Promise((resolve, reject) => {
        this.history.replace(location, resolve, reject);
      });
    } else {
      this.history.replace(location, onComplete, onAbort);
    }
  }

  go(n) {
    this.history.go(n);
  }

  back() {
    this.go(-1);
  }

  forward() {
    this.go(1);
  }
}

// Vue.use(SearchVueRouter)
SearchVueRouter.install = function(Vue) {
  // 注册组件 SearchRouterView
  Vue.component('SearchRouterView', SearchRouterView);

  Vue.mixin({
    beforeCreate() {
      if (this.$options.searchRouter) {
        this._searchRouterRoot = this;
        this._searchRouter = this.$options.searchRouter;
        this._searchRouter.init(this._searchRouterRoot);
        const cur = this._searchRouter.getMatchedComponent();
        Vue.util.defineReactive(this, '_searchRoute', cur);
      } else {
        this._searchRouterRoot = (this.$parent && this.$parent._searchRouterRoot) || this;
      }
    }
  });

  Object.defineProperty(Vue.prototype, '$searchRouter', {
    get() {
      return this._searchRouterRoot._searchRouter;
    }
  });

  Object.defineProperty(Vue.prototype, '$searchRoute', {
    get() {
      return this._searchRouterRoot._searchRoute;
    }
  });
};
