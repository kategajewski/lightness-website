-- Additive payment-initiation evidence for the approved delayed-settlement rule.
-- The application records only verified, signed checkout.session.completed events.
-- Campaign eligibility is evaluated by the server, including negative proofs.
begin;

create table public.holiday_payment_initiations (
  campaign_id text not null check (length(campaign_id) between 1 and 100),
  checkout_session_id text not null check (length(checkout_session_id) between 1 and 255),
  payment_intent_id text not null check (length(payment_intent_id) between 1 and 255),
  stripe_livemode boolean not null,
  purchase_amount_cents integer not null check (purchase_amount_cents > 0),
  currency text not null check (currency = 'usd'),
  initiated_at timestamptz not null,
  completed_event_id text not null unique check (length(completed_event_id) between 1 and 255),
  event_type text not null check (event_type = 'checkout.session.completed'),
  holiday_launch_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (campaign_id, checkout_session_id),
  unique (campaign_id, payment_intent_id)
);

alter table public.holiday_payment_initiations enable row level security;
-- Supabase can apply broad default grants, including to the service role.
revoke all on public.holiday_payment_initiations from public, anon, authenticated, service_role;
grant select on public.holiday_payment_initiations to service_role;

create function public.holiday_payment_initiation_immutable() returns trigger
language plpgsql set search_path = '' as $$
begin
  raise exception 'Signed payment initiation evidence is immutable';
end;
$$;
create trigger holiday_payment_initiation_immutable
before update or delete on public.holiday_payment_initiations
for each row execute function public.holiday_payment_initiation_immutable();

create function public.record_holiday_payment_initiation(p_initiation jsonb)
returns public.holiday_payment_initiations
language plpgsql security definer set search_path = '' as $$
declare proof public.holiday_payment_initiations;
begin
  if p_initiation->>'event_type' is distinct from 'checkout.session.completed' then
    raise exception 'A signed checkout.session.completed event is required';
  end if;
  -- Serialize the two transaction keys before speculative inserts. A duplicate
  -- callback must not race the session, payment-intent and event unique indexes.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    (p_initiation->>'campaign_id') || ':' || (p_initiation->>'payment_intent_id'), 5));
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
      proof.currency, proof.initiated_at, proof.completed_event_id, proof.event_type, proof.holiday_launch_at)
    is distinct from
     (p_initiation->>'payment_intent_id', (p_initiation->>'stripe_livemode')::boolean,
      (p_initiation->>'purchase_amount_cents')::integer, p_initiation->>'currency',
      (p_initiation->>'initiated_at')::timestamptz, p_initiation->>'completed_event_id',
      p_initiation->>'event_type', (p_initiation->>'holiday_launch_at')::timestamptz) then
    raise exception 'Payment initiation retry does not match the original signed event';
  end if;
  return proof;
end;
$$;

revoke all on function public.holiday_payment_initiation_immutable() from public, anon, authenticated, service_role;
revoke all on function public.record_holiday_payment_initiation(jsonb) from public, anon, authenticated, service_role;
grant execute on function public.record_holiday_payment_initiation(jsonb) to service_role;

comment on table public.holiday_payment_initiations is
  'Immutable evidence from signed checkout.session.completed events, including ineligible timestamps. Merely opening checkout is never recorded as payment initiation.';
comment on column public.holiday_payment_initiations.initiated_at is
  'The signed checkout.session.completed event.created instant, never checkout session.created or webhook arrival time.';
commit;
