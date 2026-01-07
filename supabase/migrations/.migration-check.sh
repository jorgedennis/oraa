#!/bin/bash
# Migration Safety Check Script
# Run this before applying migrations to catch dangerous operations

echo "🔍 Checking migrations for dangerous operations..."

DANGEROUS_PATTERNS=(
  "drop table"
  "delete from"
  "truncate"
  "drop.*cascade"
)

FOUND_DANGER=false

for migration in supabase/migrations/*.sql; do
  if [ -f "$migration" ]; then
    echo ""
    echo "Checking: $(basename $migration)"
    
    for pattern in "${DANGEROUS_PATTERNS[@]}"; do
      if grep -qi "$pattern" "$migration"; then
        echo "  ⚠️  WARNING: Found '$pattern' in $migration"
        echo "     Line: $(grep -ni "$pattern" "$migration" | head -1)"
        FOUND_DANGER=true
      fi
    done
  fi
done

echo ""
if [ "$FOUND_DANGER" = true ]; then
  echo "❌ DANGEROUS OPERATIONS FOUND!"
  echo "   Review migrations carefully before applying."
  echo "   See MIGRATION_GUIDELINES.md for safe practices."
  exit 1
else
  echo "✅ No dangerous operations detected."
  exit 0
fi

