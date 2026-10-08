export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <title>NATIVE — ошибка загрузки</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <style>
      body { font: 15px/1.5 "Inter", system-ui, -apple-system, sans-serif; background: #171716; color: #fff; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; background: #20201f; border: 1px solid #333330; border-radius: 0.75rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; color: #fff; }
      p { color: #a1a1aa; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.6rem 1.1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; transition: filter .15s; }
      .primary { background: #dcad76; color: #171716; font-weight: 600; }
      .primary:hover { filter: brightness(1.07); }
      .secondary { background: #262624; color: #fff; border-color: #333330; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Страница не загрузилась</h1>
      <p>Что-то пошло не так. Попробуйте обновить страницу или вернуться на главную.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Попробовать снова</button>
        <a class="secondary" href="/">На главную</a>
      </div>
    </div>
  </body>
</html>`;
}
