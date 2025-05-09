/// <reference path="../../../scriptlibrary" />

const { request, response } = B.net;

// --- Simple Router Implementation ---
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
interface RouteParams { [key: string]: string; }
type RouteHandler = (params: RouteParams) => any;

interface RegisteredRoute {
  method: HttpMethod;
  pathPatternRegex: RegExp;
  paramNames: string[];
  handler: RouteHandler;
}

class Router {
  private routes: RegisteredRoute[] = [];
  private responseHasBeenSent = false;

  private markResponseSent() {
    this.responseHasBeenSent = true;
  }

  public hasSentResponse(): boolean {
    return this.responseHasBeenSent;
  }

  private doRespond(responder: () => void) {
    if (this.responseHasBeenSent) {
      console.error("Attempted to send response multiple times.");
      return;
    }
    responder();
    this.markResponseSent();
  }
  
  public todo() {
    this.doRespond(() => {
      response.status(501);
      response.out("This needs to be implemented");
    });
  }

  public throwUnsupportedPath(reqMethod: string, reqPath: string) {
    this.doRespond(() => {
      console.error(`Unsupported Path: ${reqMethod} ${reqPath}`);
      response.status(404);
      response.out("Unsupported Path");
    });
  }
  
  public throwException(e: any) {
     this.doRespond(() => {
      console.error(`Exception during request processing: ${e.message || String(e)}`);
      response.status(500);
      // Attempt to stringify, fallback for circular or complex objects
      let output = "";
      try {
        output = JSON.stringify({ error: e.message || String(e), stack: e.stack });
      } catch (stringifyError) {
        output = JSON.stringify({ error: "Failed to stringify exception details."});
      }
      response.out(output);
    });
  }

  private addRoute(method: HttpMethod, pathPattern: string, handler: RouteHandler) {
    const paramNames: string[] = [];
    const regexPath = pathPattern.replace(/:(\w+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return "([^/]+)"; // Matches any character except '/'
    });
    // Ensure the regex matches the whole path segment, not just a part of it.
    // Path pattern should not start with a slash if effectivePath doesn't.
    const pathPatternRegex = new RegExp(`^${regexPath}$`);
    this.routes.push({ method, pathPatternRegex, paramNames, handler });
  }

  public GET(pathPattern: string, handler: RouteHandler) { this.addRoute("GET", pathPattern, handler); }
  public POST(pathPattern: string, handler: RouteHandler) { this.addRoute("POST", pathPattern, handler); }
  public PUT(pathPattern: string, handler: RouteHandler) { this.addRoute("PUT", pathPattern, handler); }
  public DELETE(pathPattern: string, handler: RouteHandler) { this.addRoute("DELETE", pathPattern, handler); }

  public handleRequest(reqMethod: HttpMethod, reqPath: string): any {
    for (const route of this.routes) {
      if (route.method === reqMethod) {
        const match = reqPath.match(route.pathPatternRegex);
        if (match) {
          const params: RouteParams = {};
          route.paramNames.forEach((name, index) => {
            params[name] = match[index + 1];
          });
          try {
            return route.handler(params);
          } catch (e) {
            this.throwException(e);
            return undefined; 
          }
        }
      }
    }
    // If no route matched and response hasn't been sent by a handler's error
    if (!this.hasSentResponse()) {
        this.throwUnsupportedPath(reqMethod, request.path()); // Use full original path for error message
    }
    return undefined;
  }
}

export {Router, HttpMethod}