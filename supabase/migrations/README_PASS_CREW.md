# PASS Crew migrations

The four 20260611 PASS Crew drafts were removed because they were never present in the linked production migration history and modeled customer identity as `customer_id = auth.uid()`.

The canonical, forward-only PASS Crew migration is maintained with the ERP in:

`clothingStore/project/supabase/migrations/202609180001_pass_crew_memberships_benefits.sql`

Apply that migration only after its linked-project dry run and review. The ecommerce consumes the resulting public plans/benefits and authenticated customer RPCs; it does not own a second copy of the database schema.
