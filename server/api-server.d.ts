import type { Plugin } from 'vite';

export declare function sqliteApiPlugin(customAppDataRoot?: string): Plugin;
export declare function registerApiRoutes(middlewares: any, customAppDataRoot?: string): void;
export declare function startLocalServer(port?: number, options?: any): Promise<{
  server: any;
  port: number;
  app: any;
}>;
