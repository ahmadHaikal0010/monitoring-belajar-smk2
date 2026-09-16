# Agent Directives & Constraints

## Core Rules & Execution Boundary
- **Environment**: Docker + Laravel Sail
- **Utility Binary**: `/home/haikal/.local/bin/rtk`
- **Command Prefix**: Mandatory `rtk ./vendor/bin/sail` for all VCS, shell, PHP, NPM, Artisan execution
  - Sistem memiliki utilitas RTK yang terpasang di `/home/haikal/.local/bin/rtk`.
  - Anda WAJIB menyisipkan prefix path lengkap `/home/haikal/.local/bin/rtk` di depan setiap perintah shell/VCS (contoh: `/home/haikal/.local/bin/rtk git status`, `/home/haikal/.local/bin/rtk php artisan migrate`). JANGAN PERNAH menggunakan kata 'rtk' saja tanpa path lengkapnya.
  - Artisan: `rtk ./vendor/bin/sail artisan migrate`
  - Testing: `rtk ./vendor/bin/sail test --compact`
  - NPM: `rtk ./vendor/bin/sail npm run dev`
  - VCS: `rtk git status`
  - Pint: `rtk ./vendor/bin/sail bin pint --dirty --format agent`
- **Forbidden Actions**:
  - NEVER execute bare PHP, NPM, or Artisan commands without `rtk ./vendor/bin/sail`
  - NEVER output planning mode drafts, artifacts, or execution steps
  - Directly modify target files using file tools (`write_file` / `edit_file`)
- **Response Style Constraint**:
  - Maximum token efficiency: direct code/answers only, zero conversational filler, zero theoretical explanations, zero summaries

## Stack Versions
PHP 8.4 | Laravel 13 | React 19 | Inertia v3 | Tailwind v4 | Fortify v1 | Sanctum v4 | Wayfinder v0 | Boost v2 | Pint v1 | PHPUnit v11

## Skill Activation Triggers
- `fortify-development`: Auth, 2FA, login, register, profile updates, `app/Actions/Fortify/`
- `laravel-best-practices`: Backend PHP, controllers, models, migrations, policies, queries
- `wayfinder-development`: Frontend-to-backend routing, `@/actions`, `@/routes`, TS route fixes
- `inertia-react-development`: Inertia React pages (`resources/js/pages/`), `useForm`, `useHttp`, `useLayoutProps`
- `tailwindcss-development`: UI styling, layouts, responsiveness, dark mode

## Strict Code Standards

### PHP & Laravel
- Mandatory `{}` for all control structures
- Mandatory PHP 8 constructor property promotion
- Strict return types & parameter type hints
- TitleCase Enum keys
- Use PHPDocs over inline comments; define array shapes in PHPDoc
- Auto-format PHP after edits: `rtk ./vendor/bin/sail bin pint --dirty --format agent`
- Always pair model generation with factories & seeders
- Pass `--no-interaction` to all Artisan commands

### Inertia v3 & React
- Standard path: `resources/js/pages/`
- Use `Inertia::render()`, never Blade
- Use `useHttp` (Axios removed by default)
- Use `Inertia::optional()` (not deprecated `lazy()`)
- Apply dot notation for nested prop modifiers (`Inertia::defer()`, `Inertia::merge()`, `Inertia::optional()`)
- Renamed events: `httpException` (invalid), `networkError` (exception)
- Pair deferred props with skeleton UI

### Testing Rules
- PHPUnit strictly required (`rtk ./vendor/bin/sail artisan make:test --phpunit {name}`)
- Run minimal tests after changes (`rtk ./vendor/bin/sail test --compact --filter=TestName`)
- Cover happy paths, failure paths, and edge cases; never delete existing tests
