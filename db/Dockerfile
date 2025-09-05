FROM postgres:14-alpine

ARG POSTGRES_USER
ARG POSTGRES_DB

# Copy initialization script
COPY init.sql /docker-entrypoint-initdb.d/

# Copy PostgreSQL configuration
COPY postgresql.conf /etc/postgresql/postgresql.conf

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB || exit 1