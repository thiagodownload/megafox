# MegaFox Distribuição — Site institucional V1

Primeiro protótipo navegável criado a partir do material institucional e social fornecido.

## Rodar localmente

Requisito: Node.js 20+.

```bash
npm start
```

Abra `http://localhost:3000`.

Não há dependências externas. O servidor usa apenas módulos nativos do Node.js.

## O que já funciona

- layout responsivo desktop/tablet/mobile;
- navegação por seções;
- vídeos otimizados e silenciosos para autoplay;
- animações leves com `IntersectionObserver`;
- formulário real chamando `POST /api/contact`;
- validação de dados, honeypot e rate limit básico;
- leads gravados localmente em `data/leads.jsonl` com permissão restrita;
- endpoint `GET /api/health`;
- headers básicos de segurança, CSP, SEO, sitemap e manifest.

## Importante antes de produção

O armazenamento em JSONL é propositalmente simples para prototipação. Para produção, o formulário deve enviar para CRM/e-mail e/ou banco de dados, com política de privacidade/LGPD, consentimento adequado, logs, backup e monitoramento.

Também é recomendado substituir a arte 150x150 da logo por arquivo vetorial oficial (SVG/PDF/AI/EPS) e usar fotos/vídeos originais em alta resolução da estrutura, frota e operação.
