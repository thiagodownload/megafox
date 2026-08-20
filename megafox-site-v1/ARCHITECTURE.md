# Arquitetura proposta para produção

## Frontend
- HTML semântico, responsivo e acessível.
- Evolução sugerida: Next.js + TypeScript quando houver CMS, notícias, campanhas, páginas de marca e integrações.
- Imagens em AVIF/WebP, vídeos H.264/WebM, lazy loading e CDN.
- SEO técnico, Schema.org Organization/LocalBusiness, Open Graph e métricas Core Web Vitals.

## Backend
- API de contato isolada do frontend.
- Integração futura com CRM/ERP, automação comercial e captura de leads.
- PostgreSQL somente se houver necessidade de persistência própria.
- Rate limiting persistente, WAF/reverse proxy, logs estruturados e observabilidade.
- LGPD: minimização de dados, retenção definida, política de privacidade e base legal.

## Conteúdo
- CMS headless opcional para notícias, campanhas, marcas e vagas.
- Perfis de acesso separados para Marketing e RH.
- Fluxo de publicação com rascunho/aprovação.

## Infraestrutura
- Produção atrás de CDN/WAF.
- HTTPS obrigatório.
- CI/CD com ambiente de homologação antes de produção.
- Backup e monitoramento de disponibilidade.
- Verificação/limpeza do domínio e hospedagem existentes antes da publicação do novo site.
