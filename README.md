# Grand Ontama

Grand Ontama residential property website featuring house types, facilities, a gallery, and property articles.

**Status:** Live · [Visit website](https://grandontama.com/)

## Features

- Property detail pages and residential facilities
- Responsive image processing during builds
- Contact form with SMTP and reCAPTCHA

## Technology

Eleventy 3, Nunjucks, Tailwind CSS 4, Sharp, PHP.

## Running Locally

Install Node.js and npm versions that meet the dependency requirements in `package-lock.json`.

```sh
npm ci
npm run dev
```

Open the server address shown in the terminal. To build the site:

```sh
npm run build
```

Build output is written to `_site/`. The build output directory is not the repository's primary source.

## Structure

- `src/` — pages, templates, data, and assets.
- `.eleventy.js` — site generator configuration.
- `package.json` — dependencies and development commands.

## Deployment

Email configuration is provided through `server/config.example.php`; follow the configuration path used by `server/mailer/send-contact.php`. Run `composer install --working-dir=server` to install PHPMailer before deployment. Property unit certificates and land inspection documents are not included in the repository.

The initial version is available as a separate project: [Grand Ontama V1](https://github.com/bagus-mahmudie/grand-ontama-v1).

## Private Configuration

Copy the following templates to their corresponding local filenames, then enter the values for your environment:

| Template | Local File |
| --- | --- |
| `grand-ontama-config.example.php` | `grand-ontama-config.php` |

Local configuration files are ignored by Git. Do not include passwords, API keys, or account data in the source code.

## Repository Notes

Installed dependencies, caches, `.env` files, databases, and user uploads are not included. Brand names and third-party assets remain subject to their respective owners' rights. This repository does not grant a license for reuse.
