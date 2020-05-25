import { genStateKey, getStateKey, setStateKey } from './state-key';

export default class History {
  constructor(searchVueRouter) {
    this.searchVueRouter = searchVueRouter;
    Object.defineProperty(this, 'searchKey', {
      get() {
        return searchVueRouter.searchKey;
      }
    });

    window.addEventListener('popstate', e => {
      this.searchVueRouter.update();
    });
  }

  go(n) {
    window.history.go(n);
  }

  getNewPath(location) {
    // location.path
    let search = window.location.search;
    const searchKeyRegExp = new RegExp('(\\?|&)(' + this.searchKey + '=[^&]*)(&|$)');
    const searchPathPair = `${this.searchKey}=${location.path}`;
    if (!search || !searchKeyRegExp.test(search)) {
      if (search.indexOf('?') === -1) {
        search = '?' + searchPathPair;
      } else {
        search = search + '&' + searchPathPair;
      }
    } else {
      search = window.location.search.replace(searchKeyRegExp, '$1' + searchPathPair + '$3');
    }
    return search + window.location.hash;
  }

  push(location) {
    pushState(this.getNewPath(location));
    this.searchVueRouter.update();
  }

  replace(location) {
    pushState(this.getNewPath(location), true);
    this.searchVueRouter.update();
  }
}

export function getSearchPath() {
  let path = decodeURI(window.location.pathname);
  return (path || '/') + window.location.search + window.location.hash;
}

function pushState(url, replace) {
  const history = window.history;
  try {
    if (replace) {
      // preserve existing history state as it could be overriden by the user
      const stateCopy = Object.assign({}, history.state);
      stateCopy.key = getStateKey();
      history.replaceState(stateCopy, '', url);
    } else {
      history.pushState({ key: setStateKey(genStateKey()) }, '', url);
    }
  } catch (e) {
    window.location[replace ? 'replace' : 'assign'](url);
  }
}
