# Dreamteam Telegram Mini App

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Platform documentation](https://docs.telegram-mini-apps.com/)
- [@telegram-apps SDK](https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk/2-x)
- [Telegram UI](https://github.com/Telegram-Mini-Apps/TelegramUI)
- [Vite](https://vitejs.dev/)

## Install Dependencies

If you have just cloned this template, you should install the project
dependencies using the command:

```Bash
npm install
```

## Self Sign Certificates and Hosts Config

Install [mkcert](https://github.com/FiloSottile/mkcert) for making locally-trusted development certificates.
After install one should to create certificates for dt-mini-app.local domain
```
mkdir -p .cert && mkcert -key-file ./.cert/localhost-key.pem -cert-file ./.cert/localhost.pem 'dt-mini-app.local'
```

Now in /etc/hosts

```
sudo nano /etc/hosts
```

Add line in the end of the file
```
127.0.0.1 dt-mini-app.local
```

## Scripts

This project contains the following scripts:

- `dev`. Runs the application in development mode.
- `dev:https`. Runs the application in development mode using locally created valid SSL-certificates.
- `build`. Builds the application for production.
- `lint`. Runs [eslint](https://eslint.org/) to ensure the code quality meets
  the required standards.
- `deploy`. Deploys the application to GitHub Pages.

To run a script, use the `npm run` command:

```Bash
npm run {script}
# Example: npm run build
```

## Run


To run the application in the development mode, use the `dev` script:

```bash
npm run dev:https
```

> В настройках телеграм бота необходимо передать ссылку https://[ip сервера]:8090

> Для работы приложения на сторонних устройствах (iOS, Android) необходимо установить корневой сертификат выпущенный
> vite-plugin-mkcert (C:\Users\user\.vite-plugin-mkcert\rootCA.pem)

> [!NOTE]
> As long as we use [vite-plugin-mkcert](https://www.npmjs.com/package/vite-plugin-mkcert),
> launching the dev mode for the first time, you may see sudo password request.
> The plugin requires it to properly configure SSL-certificates. To disable the plugin, use the `npm run dev` command.


## Deploy

#### Конфиг

В `src/api/base.ts` необходимо изменить адрес прод и дев сервера бэкэнда

#### Сборка

Before deploying the application, make sure that you've built it and going to
deploy the fresh static files:

```bash
npm run build
```

#### Nginx config (sample)

```nginx
server {
        listen 443 ssl;

        server_name tgapp.dreamteam.fm;
        ssl_certificate /etc/letsencrypt/live/tgapp.dreamteam.fm/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/tgapp.dreamteam.fm/privkey.pem;

        root /var/www/dist;

        index index.html ;

        location / {
                try_files $uri $uri/ /index.html =404;
        }
}
```
