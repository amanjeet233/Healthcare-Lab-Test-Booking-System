# HealthcareLab Backend

Spring Boot backend for lab test booking, payments, reports, notifications, and role-based workflows.

## Run (Dev)

1. Ensure MySQL is running and update `spring.datasource.*` in `src/main/resources/application.properties` or use env vars.
2. From `backend/`:

```bash
mvn spring-boot:run
```

## Profiles

- `default`: local development
- `prod`: production-style settings in `src/main/resources/application-prod.yml`

Run with profile:

```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

## Environment Variables

Use root `.env.example` as baseline. Key groups:

- Database: `SPRING_DATASOURCE_*`
- JWT: `JWT_*`
- Payment: `APP_PAYMENT_*`
- Security: `APP_ADMIN_IP_WHITELIST_*`
- Feature flags: `APP_FEATURE_*`

## API Versioning

`/api/v1/*` is supported through request rewrite compatibility filter and maps to existing `/api/*` routes without breaking old clients.

## Security Hardening

- Role-based authorization via `@PreAuthorize`
- Optional admin IP allowlist (`APP_ADMIN_IP_WHITELIST_*`)
- H2 console disabled by default
- Request correlation ID via `X-Correlation-Id`

## Reliability Foundations

- Circuit breaker foundation added for payment gateway client (`resilience4j`)
- In-process domain events for payment success (`ApplicationEventPublisher`)

## Tests

```bash
mvn test
```

Current suite includes controller, service, repository, and API flow integration tests.

