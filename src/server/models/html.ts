export class Html {
  static get appDev() {
    const html = `
      <!DOCTYPE html>
      <html lang="en">

      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script type="module" src="http://localhost:5173/@vite/client"></script>
        <script type="module" src="http://localhost:5173/main.ts"></script>
        <title>Dependency Notifier</title>
      </head>

      <body>
        <div id="root"></div>
      </body>

      </html>
    `;
  
    return html
  }
}
