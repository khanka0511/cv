type RouteParameters = { [key: string]: string };

var $routes: { [key: string]: string } = { default: '' };
var $routeParameters: RouteParameters;

interface RouteDecoratorOptions {
  selector: string;
  route?: string;
  defaultRoute?: boolean;
}
function Route(options: RouteDecoratorOptions) {
  if (options.route) $routes[options.route] = options.selector;
  if (options.defaultRoute) $routes['default'] = options.selector;
  return (target: any) => {};
}
@Component('kach-router')
class KachRoutes extends KachComponent {
  private routeURL?: string;
  private routeParameters?: string;
  constructor() {
    super('kach-router', true);

    this.parseURL();
    if (!$routes['default'])
      listen($routes, 'default', () => {
        if (!$routes[this.routeURL!]) this.innerHTML = $routes['default'];
      });
    let routerComponent = $routes[this.routeURL!] || $routes['default'];
    this.innerHTML = `<${routerComponent}></${routerComponent}>`;
    window.addEventListener('hashchange', () => {
      this.parseURL();
      let routerComponent = $routes[this.routeURL!] || $routes['default'];
      this.innerHTML = `<${routerComponent}></${routerComponent}>`;
    });
  }
  private parseURL() {
    this.routeURL = location.hash.slice(1);
    let sepIndex = this.routeURL.indexOf('?');
    if (sepIndex !== -1) {
      this.routeParameters = this.routeURL.slice(sepIndex + 1);
      this.routeURL = this.routeURL.slice(0, sepIndex);
    }
    let queryData: RouteParameters = {};
    if (this.routeParameters) {
      let vars = this.routeParameters.split('&');
      for (let v of vars) {
        let p = v.split('=');
        queryData[p[0]] = decodeURIComponent(p[1]);
      }
    }
    $routeParameters = queryData;
    this.routeURL = this.routeURL.toLowerCase();
  }
}
