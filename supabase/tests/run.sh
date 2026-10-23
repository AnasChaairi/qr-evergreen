#!/bin/sh
# Applies the migrations to a scratch database and runs the RLS tests.
# Needs a Postgres superuser connection in DATABASE_URL (e.g. postgres://postgres@localhost:5432/postgres).
set -eu
: "${DATABASE_URL:?Set DATABASE_URL to a Postgres superuser connection}"
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -c "drop database if exists qr_evergreen_test" -c "create database qr_evergreen_test"
TEST_URL=$(printf '%s' "$DATABASE_URL" | sed -E 's#/[^/?]*(\?|$)#/qr_evergreen_test\1#')
psql "$TEST_URL" -v ON_ERROR_STOP=1 -q -f supabase/tests/stub_supabase.sql
for file in supabase/migrations/*.sql; do
  psql "$TEST_URL" -v ON_ERROR_STOP=1 -q -f "$file"
done
psql "$TEST_URL" -v ON_ERROR_STOP=1 -q -f supabase/tests/rls_test.sql
