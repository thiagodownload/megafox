# MegaFox Distribuição — Site institucional

Repositório oficial do projeto institucional da MegaFox Distribuição.

## Estrutura

- `megafox-site-v1/` — projeto completo, incluindo frontend e backend Node.js.
- `megafox-site-v1/public/` — frontend original da V1 aprovada.
- `docs/` — versão de demonstração preparada para GitHub Pages, preservando o mesmo CSS, imagens e vídeos da V1.

## Demonstração no GitHub Pages

Em **Settings → Pages** configure:

- Source: `Deploy from a branch`
- Branch: `main`
- Folder: `/docs`

O endereço esperado é:

`https://thiagodownload.github.io/megafox/`

> O formulário da versão GitHub Pages funciona apenas como demonstração visual. O envio real permanece no backend Node.js do projeto completo.

## Execução completa local

```bash
cd megafox-site-v1
npm start
```

Acesse `http://localhost:3000`.
