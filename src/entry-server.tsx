// @refresh reload
import { createHandler, StartServer } from "@solidjs/start/server";

export default createHandler(() => (
  <StartServer
    document={({ assets, children, scripts }) => (
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          {assets}
          <script innerHTML={`
              (function() {
                try {
                  var stored = localStorage.getItem('dec_visitor_config_v1');
                  if (stored) {
                    var config = JSON.parse(stored);
                    var theme = config.theme;
                    if (theme === 'system') {
                      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'white';
                    }
                    document.documentElement.classList.add('theme-' + theme);
                  }
                } catch (e) {}
              })();
            `
          } />
        </head>
        <body>
          <div id="app">{children}</div>
          {scripts}
        </body>
      </html>
    )}
  />
));
