-- Stripe can generate distinct Event objects for the same object and event type.
-- Preserve every signed receipt and derive the earliest matching completion proof.
-- This migration is additive to the already-installed initiation evidence model.
begin;

create table public.holiday_payment_initiation_events (
  completed_event_id text primary key check (length(completed_event_id) between 1 and 255),
  campaign_id text not null,
  checkout_session_id text not null,
  payment_intent_id text not null check (length(payment_intent_id) between 1 and 255),
  stripe_livemode boolean not null,
  purchase_amount_cents integer not null check (purchase_amount_cents > 0),
  currency text not null check (currency = 'usd'),
  initiated_at timestamptz not null,
  event_type text not null check (event_type = 'checkout.session.completed'),
  holiday_launch_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (campaign_id, checkout_session_id)
    references public.holiday_payment_initiations (campaign_id, checkout_session_id)
);
create index holiday_payment_initiation_events_checkout_idx
  on public.holiday_payment_initiation_events (campaign_id, checkout_session_id, initiated_at);

-- Preserve the original signed evidence and recording time before summaries can change.
insert into public.holiday_payment_initiation_events (
  completed_event_id, campaign_id, checkout_session_id, payment_intent_id, stripe_livemode,
  purchase_amount_cents, currency, initiated_at, event_type, holiday_launch_at, created_at
)
select completed_event_id, campaign_id, checkout_session_id, payment_intent_id, stripe_livemode,
  purchase_amount_cents, currency, initiated_at, event_type, holiday_launch_at, created_at
from public.holiday_payment_initiations;

alter table public.holiday_payment_initiation_events enable row level security;
revoke all on public.holiday_payment_initiation_events from public, anon, authenticated, service_role;
grant select on public.holiday_payment_initiation_events to service_role;

create function public.holiday_payment_initiation_event_immutable() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'Signed payment initiation receipts are append-only';
end;
$$;
create trigger holiday_payment_initiation_event_immutable
before update or delete on public.holiday_payment_initiation_events
for each row execute function public.holiday_payment_initiation_event_immutable();

-- All financial bindings remain immutable. Only the derived pointer may move,
-- and only to an earlier signed receipt already preserved in the audit table.
create or replace function public.holiday_payment_initiation_immutable() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'Signed payment initiation evidence cannot be deleted';
  end if;
  if (new.campaign_id, new.checkout_session_id, new.payment_intent_id, new.stripe_livemode,
      new.purchase_amount_cents, new.currency, new.event_type, new.holiday_launch_at, new.created_at)
    is distinct from
     (old.campaign_id, old.checkout_session_id, old.payment_intent_id, old.stripe_livemode,
      old.purchase_amount_cents, old.currency, old.event_type, old.holiday_launch_at, old.created_at) then
    raise exception 'Payment initiation financial bindings are immutable';
  end if;
  if new.initiated_at >= old.initiated_at then
    raise exception 'Payment initiation summary can move only to earlier signed evidence';
  end if;
  if not exists (
    select 1 from public.holiday_payment_initiation_events receipt
    where receipt.completed_event_id = new.completed_event_id
      and receipt.campaign_id = new.campaign_id and receipt.checkout_session_id = new.checkout_session_id
      and receipt.payment_intent_id = new.payment_intent_id and receipt.stripe_livemode = new.stripe_livemode
      and receipt.purchase_amount_cents = new.purchase_amount_cents and receipt.currency = new.currency
      and receipt.initiated_at = new.initiated_at and receipt.event_type = new.event_type
      and receipt.holiday_launch_at is not distinct from new.holiday_launch_at
  ) or new.initiated_at is distinct from (
    select min(receipt.initiated_at) from public.holiday_payment_initiation_events receipt
    where receipt.campaign_id = new.campaign_id and receipt.checkout_session_id = new.checkout_session_id
  ) then
    raise exception 'Earlier payment initiation requires its matching preserved signed receipt';
  end if;
  return new;
end;
$$;

create or replace function public.record_holiday_payment_initiation(p_initiation jsonb)
returns public.holiday_payment_initiations
language plpgsql security definer set search_path = '' as $$
declare
  proof public.holiday_payment_initiations;
  receipt public.holiday_payment_initiation_events;
  earliest public.holiday_payment_initiation_events;
begin
  if p_initiation->>'event_type' is distinct from 'checkout.session.completed' then
    raise exception 'A signed checkout.session.completed event is required';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    p_initiation->>'completed_event_id', 6));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    (p_initiation->>'campaign_id') || ':' || (p_initiation->>'payment_intent_id'), 5));

  select * into receipt from public.holiday_payment_initiation_events
    where completed_event_id = p_initiation->>'completed_event_id';
  if found and
     (receipt.campaign_id, receipt.checkout_session_id, receipt.payment_intent_id, receipt.stripe_livemode,
      receipt.purchase_amount_cents, receipt.currency, receipt.initiated_at, receipt.event_type, receipt.holiday_launch_at)
    is distinct from
     (p_initiation->>'campaign_id', p_initiation->>'checkout_session_id', p_initiation->>'payment_intent_id',
      (p_initiation->>'stripe_livemode')::boolean, (p_initiation->>'purchase_amount_cents')::integer,
      p_initiation->>'currency', (p_initiation->>'initiated_at')::timestamptz,
      p_initiation->>'event_type', (p_initiation->>'holiday_launch_at')::timestamptz) then
    raise exception 'Payment initiation receipt retry does not match the original signed event';
  end if;

  insert into public.holiday_payment_initiations (
    campaign_id, checkout_session_id, payment_intent_id, stripe_livemode,
    purchase_amount_cents, currency, initiated_at, completed_event_id, event_type, holiday_launch_at
  ) values (
    p_initiation->>'campaign_id', p_initiation->>'checkout_session_id',
    p_initiation->>'payment_intent_id', (p_initiation->>'stripe_livemode')::boolean,
    (p_initiation->>'purchase_amount_cents')::integer, p_initiation->>'currency',
    (p_initiation->>'initiated_at')::timestamptz, p_initiation->>'completed_event_id',
    p_initiation->>'event_type', (p_initiation->>'holiday_launch_at')::timestamptz
  ) on conflict (campaign_id, checkout_session_id) do nothing;
  select * into strict proof from public.holiday_payment_initiations
    where campaign_id = p_initiation->>'campaign_id'
      and checkout_session_id = p_initiation->>'checkout_session_id' for update;
  if (proof.payment_intent_id, proof.stripe_livemode, proof.purchase_amount_cents,
      proof.currency, proof.event_type, proof.holiday_launch_at)
    is distinct from
     (p_initiation->>'payment_intent_id', (p_initiation->>'stripe_livemode')::boolean,
      (p_initiation->>'purchase_amount_cents')::integer, p_initiation->>'currency',
      p_initiation->>'event_type', (p_initiation->>'holiday_launch_at')::timestamptz) then
    raise exception 'Payment initiation does not match the original financial binding';
  end if;

  insert into public.holiday_payment_initiation_events (
    completed_event_id, campaign_id, checkout_session_id, payment_intent_id, stripe_livemode,
    purchase_amount_cents, currency, initiated_at, event_type, holiday_launch_at
  ) values (
    p_initiation->>'completed_event_id', p_initiation->>'campaign_id',
    p_initiation->>'checkout_session_id', p_initiation->>'payment_intent_id',
    (p_initiation->>'stripe_livemode')::boolean, (p_initiation->>'purchase_amount_cents')::integer,
    p_initiation->>'currency', (p_initiation->>'initiated_at')::timestamptz,
    p_initiation->>'event_type', (p_initiation->>'holiday_launch_at')::timestamptz
  ) on conflict (completed_event_id) do nothing;
  select * into strict earliest from public.holiday_payment_initiation_events
    where campaign_id = proof.campaign_id and checkout_session_id = proof.checkout_session_id
    order by initiated_at, created_at, completed_event_id limit 1;
  if earliest.initiated_at < proof.initiated_at then
    update public.holiday_payment_initiations
      set initiated_at = earliest.initiated_at, completed_event_id = earliest.completed_event_id
      where campaign_id = proof.campaign_id and checkout_session_id = proof.checkout_session_id
      returning * into proof;
  end if;
  return proof;
end;
$$;

revoke all on function public.holiday_payment_initiation_event_immutable() from public, anon, authenticated, service_role;
revoke all on function public.holiday_payment_initiation_immutable() from public, anon, authenticated, service_role;
revoke all on function public.record_holiday_payment_initiation(jsonb) from public, anon, authenticated, service_role;
grant execute on function public.record_holiday_payment_initiation(jsonb) to service_role;

comment on table public.holiday_payment_initiation_events is
  'Append-only signed checkout.session.completed receipts. Distinct Stripe event IDs retain their individual timestamps and financial bindings.';
comment on table public.holiday_payment_initiations is
  'Audited earliest signed completion summary. Financial bindings are immutable; the timestamp and event pointer can move only to earlier preserved matching evidence.';
commit;
