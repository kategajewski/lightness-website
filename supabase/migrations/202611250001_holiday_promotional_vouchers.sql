-- Complimentary promotional credit is separate from purchased gift certificates.
-- Apply this migration before enabling holiday-light-2026. No campaign is enabled here.
begin;

create table public.holiday_vouchers (
  id uuid primary key default gen_random_uuid(),
  campaign_id text not null check (length(campaign_id) between 1 and 100),
  checkout_session_id text not null check (length(checkout_session_id) between 1 and 255),
  payment_intent_id text not null check (length(payment_intent_id) between 1 and 255),
  paid_certificate_code text not null check (length(paid_certificate_code) between 1 and 100),
  code text not null unique check (code ~ '^HOLIDAY-[A-F0-9]{24}$'),
  purchaser_email text not null check (length(purchaser_email) between 3 and 320),
  purchaser_name text check (length(purchaser_name) <= 200),
  purchased_amount_cents integer not null check (purchased_amount_cents > 0),
  face_value_cents integer not null check (face_value_cents > 0),
  entitlement_cents integer not null check (entitlement_cents >= 0 and entitlement_cents <= face_value_cents),
  balance_cents integer not null check (balance_cents >= 0 and balance_cents <= entitlement_cents),
  amount_refunded_cents integer not null default 0 check (amount_refunded_cents >= 0 and amount_refunded_cents <= purchased_amount_cents),
  refund_review_required boolean not null default false,
  currency text not null default 'usd' check (currency = 'usd'),
  stripe_livemode boolean not null,
  issued_at timestamptz not null default now(),
  valid_from timestamptz not null,
  expires_at timestamptz not null check (expires_at > valid_from),
  status text not null default 'issued' check (status in ('issued', 'refund_review', 'voided')),
  status_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (campaign_id, checkout_session_id),
  unique (campaign_id, payment_intent_id),
  unique (id, campaign_id)
);

create index holiday_vouchers_campaign_created_idx on public.holiday_vouchers (campaign_id, created_at desc, id desc);
create index holiday_vouchers_payment_intent_idx on public.holiday_vouchers (payment_intent_id);

create table public.holiday_voucher_redemptions (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  voucher_id uuid not null,
  campaign_id text not null,
  amount_cents integer not null check (amount_cents > 0),
  service_id text not null check (length(service_id) between 1 and 100),
  service_at timestamptz,
  booking_reference text not null check (length(booking_reference) between 1 and 160),
  redeemed_by text not null check (length(redeemed_by) between 3 and 320),
  recipient_name text check (length(recipient_name) <= 200),
  redeemed_at timestamptz not null default now(),
  foreign key (voucher_id, campaign_id) references public.holiday_vouchers (id, campaign_id)
);
create index holiday_voucher_redemptions_voucher_idx on public.holiday_voucher_redemptions (voucher_id, redeemed_at desc);
create index holiday_voucher_redemptions_booking_idx on public.holiday_voucher_redemptions (campaign_id, booking_reference);

create table public.holiday_voucher_redemption_reversals (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  redemption_id uuid not null unique references public.holiday_voucher_redemptions (id),
  voucher_id uuid not null references public.holiday_vouchers (id),
  reversed_amount_cents integer not null check (reversed_amount_cents > 0),
  restored_amount_cents integer not null check (restored_amount_cents >= 0 and restored_amount_cents <= reversed_amount_cents),
  policy_eligible boolean not null check (policy_eligible),
  policy_reference text not null check (length(policy_reference) between 1 and 500),
  restored_by text not null check (length(restored_by) between 3 and 320),
  created_at timestamptz not null default now()
);
create index holiday_voucher_reversals_voucher_idx on public.holiday_voucher_redemption_reversals (voucher_id, created_at desc);

create table public.holiday_voucher_refund_adjustments (
  event_id text primary key check (length(event_id) between 1 and 255),
  voucher_id uuid not null references public.holiday_vouchers (id),
  campaign_id text not null,
  payment_intent_id text not null,
  stripe_livemode boolean not null,
  original_charge_amount_cents integer not null check (original_charge_amount_cents > 0),
  cumulative_refunded_cents integer not null check (cumulative_refunded_cents >= 0 and cumulative_refunded_cents <= original_charge_amount_cents),
  entitlement_cents integer not null check (entitlement_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.holiday_voucher_email_outbox (
  voucher_id uuid primary key references public.holiday_vouchers (id),
  delivery_amount_cents integer not null check (delivery_amount_cents >= 0),
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'failed', 'review')),
  claim_token uuid,
  claimed_at timestamptz,
  initial_attempt_at timestamptz,
  attempts integer not null default 0 check (attempts >= 0),
  provider_message_id text,
  sent_at timestamptz,
  last_error text,
  updated_at timestamptz not null default now()
);

-- Only server code using the service role can read or mutate purchaser information.
alter table public.holiday_vouchers enable row level security;
alter table public.holiday_voucher_redemptions enable row level security;
alter table public.holiday_voucher_email_outbox enable row level security;
alter table public.holiday_voucher_redemption_reversals enable row level security;
alter table public.holiday_voucher_refund_adjustments enable row level security;
revoke all on public.holiday_vouchers, public.holiday_voucher_redemptions, public.holiday_voucher_email_outbox,
  public.holiday_voucher_redemption_reversals, public.holiday_voucher_refund_adjustments from public, anon, authenticated, service_role;
grant select on public.holiday_vouchers, public.holiday_voucher_email_outbox, public.holiday_voucher_redemptions,
  public.holiday_voucher_redemption_reversals, public.holiday_voucher_refund_adjustments to service_role;

create function public.holiday_voucher_immutable_fields() returns trigger
language plpgsql set search_path = '' as $$
declare used_cents integer;
begin
  if (new.id, new.campaign_id, new.checkout_session_id, new.payment_intent_id,
      new.paid_certificate_code, new.code, new.purchaser_email, new.purchaser_name,
      new.purchased_amount_cents, new.face_value_cents, new.currency,
      new.stripe_livemode, new.issued_at, new.valid_from, new.expires_at, new.created_at)
     is distinct from
     (old.id, old.campaign_id, old.checkout_session_id, old.payment_intent_id,
      old.paid_certificate_code, old.code, old.purchaser_email, old.purchaser_name,
      old.purchased_amount_cents, old.face_value_cents, old.currency,
      old.stripe_livemode, old.issued_at, old.valid_from, old.expires_at, old.created_at) then
    raise exception 'Issued voucher details are immutable';
  end if;
  if new.entitlement_cents > old.entitlement_cents or new.amount_refunded_cents < old.amount_refunded_cents then
    raise exception 'Refund adjustments cannot increase promotional entitlement';
  end if;
  select coalesce((select sum(amount_cents) from public.holiday_voucher_redemptions where voucher_id = old.id), 0)
       - coalesce((select sum(reversed_amount_cents) from public.holiday_voucher_redemption_reversals where voucher_id = old.id), 0)
    into used_cents;
  if new.balance_cents <> greatest(new.entitlement_cents - used_cents, 0) then
    raise exception 'Voucher balances cannot be changed without matching ledger entries';
  end if;
  new.updated_at := now();
  return new;
end;
$$;
create trigger holiday_voucher_immutable before update on public.holiday_vouchers
for each row execute function public.holiday_voucher_immutable_fields();

-- Concurrent webhook and success-page requests converge on one voucher and one outbox row.
create function public.issue_holiday_voucher(p_voucher jsonb) returns public.holiday_vouchers
language plpgsql security definer set search_path = '' as $$
declare v public.holiday_vouchers;
begin
  -- Serialize both unique transaction keys before speculative inserts. Without
  -- this lock a concurrent insert can hit the payment-intent unique index before
  -- ON CONFLICT resolves the matching checkout-session key.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    (p_voucher->>'campaign_id') || ':' || (p_voucher->>'payment_intent_id'), 4));
  insert into public.holiday_vouchers (
    campaign_id, checkout_session_id, payment_intent_id, paid_certificate_code, code,
    purchaser_email, purchaser_name, purchased_amount_cents, face_value_cents, entitlement_cents, balance_cents,
    stripe_livemode, issued_at, valid_from, expires_at
  ) values (
    p_voucher->>'campaign_id', p_voucher->>'checkout_session_id', p_voucher->>'payment_intent_id',
    p_voucher->>'paid_certificate_code', p_voucher->>'code', p_voucher->>'purchaser_email',
    p_voucher->>'purchaser_name', (p_voucher->>'purchased_amount_cents')::integer,
    (p_voucher->>'face_value_cents')::integer, (p_voucher->>'face_value_cents')::integer, (p_voucher->>'face_value_cents')::integer,
    (p_voucher->>'stripe_livemode')::boolean, (p_voucher->>'issued_at')::timestamptz,
    (p_voucher->>'valid_from')::timestamptz, (p_voucher->>'expires_at')::timestamptz
  ) on conflict (campaign_id, checkout_session_id) do nothing;

  select * into strict v from public.holiday_vouchers
    where campaign_id = p_voucher->>'campaign_id' and checkout_session_id = p_voucher->>'checkout_session_id'
    for update;
  -- A retry may use a new random code but must never change its financial payload.
  if v.payment_intent_id is distinct from p_voucher->>'payment_intent_id'
     or v.paid_certificate_code is distinct from p_voucher->>'paid_certificate_code'
     or v.purchased_amount_cents is distinct from (p_voucher->>'purchased_amount_cents')::integer
     or v.face_value_cents is distinct from (p_voucher->>'face_value_cents')::integer
     or v.stripe_livemode is distinct from (p_voucher->>'stripe_livemode')::boolean
     or v.purchaser_email is distinct from p_voucher->>'purchaser_email'
     or v.valid_from is distinct from (p_voucher->>'valid_from')::timestamptz
     or v.expires_at is distinct from (p_voucher->>'expires_at')::timestamptz then
    raise exception 'Voucher issuance retry does not match the original transaction';
  end if;
  insert into public.holiday_voucher_email_outbox (voucher_id, delivery_amount_cents) values (v.id, v.entitlement_cents)
    on conflict (voucher_id) do nothing;
  return v;
end;
$$;

-- Policy values must come from approved server configuration, never request fields.
create function public.redeem_holiday_voucher(
  p_request_id uuid, p_voucher_id uuid, p_amount_cents integer,
  p_service_id text, p_service_at timestamptz, p_booking_reference text,
  p_redeemed_by text, p_recipient_name text, p_has_other_promotion boolean,
  p_allowed_services text[], p_allow_partial boolean,
  p_max_vouchers_per_booking integer, p_service_must_occur_during_validity boolean
) returns public.holiday_vouchers
language plpgsql security definer set search_path = '' as $$
declare
  v public.holiday_vouchers;
  r public.holiday_voucher_redemptions;
  voucher_count integer;
begin
  if p_has_other_promotion is distinct from false then
    raise exception 'Promotional vouchers cannot be combined with other promotions';
  end if;
  if p_allowed_services is null or cardinality(p_allowed_services) = 0
     or p_allow_partial is null or p_service_must_occur_during_validity is null
     or (p_max_vouchers_per_booking is not null and p_max_vouchers_per_booking < 1) then
    raise exception 'Approved voucher redemption policy is required';
  end if;
  if p_service_id is null or not coalesce(p_service_id = any(p_allowed_services), false) then
    raise exception 'This service is not eligible for promotional credit';
  end if;
  if p_amount_cents is null or p_amount_cents <= 0
     or p_booking_reference is null or length(trim(p_booking_reference)) not between 1 and 160
     or p_redeemed_by is null or length(p_redeemed_by) not between 3 and 320 then
    raise exception 'A positive amount, booking reference and administrator are required';
  end if;

  -- Serializes duplicate request IDs even if accidentally sent against different vouchers.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_request_id::text, 0));
  select * into r from public.holiday_voucher_redemptions where request_id = p_request_id;
  if found then
    if (r.voucher_id, r.amount_cents, r.service_id, r.service_at, r.booking_reference, r.redeemed_by, r.recipient_name)
      is distinct from
      (p_voucher_id, p_amount_cents, p_service_id, p_service_at, p_booking_reference, p_redeemed_by, p_recipient_name) then
      raise exception 'Redemption retry does not match the original request';
    end if;
    select * into strict v from public.holiday_vouchers where id = p_voucher_id;
    return v;
  end if;

  select * into strict v from public.holiday_vouchers where id = p_voucher_id for update;
  if v.status <> 'issued' then raise exception 'This voucher is on hold or voided'; end if;
  if now() < v.valid_from then raise exception 'This voucher is not valid yet'; end if;
  if now() >= v.expires_at then raise exception 'This voucher has expired'; end if;
  if p_service_must_occur_during_validity and
     (p_service_at is null or p_service_at < v.valid_from or p_service_at >= v.expires_at) then
    raise exception 'The private healing session must take place during the voucher validity period';
  end if;
  if p_amount_cents > v.balance_cents then raise exception 'The voucher does not have enough available credit'; end if;
  if not p_allow_partial and p_amount_cents <> v.balance_cents then
    raise exception 'This voucher must be redeemed in full';
  end if;

  -- Distinct voucher locks alone cannot prevent two vouchers being used on one booking.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(
    v.campaign_id || ':' || v.stripe_livemode::text || ':' || p_booking_reference, 1));
  if p_max_vouchers_per_booking is not null then
    select count(distinct other.voucher_id) into voucher_count
      from public.holiday_voucher_redemptions other
      join public.holiday_vouchers ov on ov.id = other.voucher_id
      where other.campaign_id = v.campaign_id and other.booking_reference = p_booking_reference
        and ov.stripe_livemode = v.stripe_livemode and other.voucher_id <> v.id
        and not exists (select 1 from public.holiday_voucher_redemption_reversals rr where rr.redemption_id = other.id);
    if voucher_count >= p_max_vouchers_per_booking then
      raise exception 'The maximum number of holiday vouchers has already been used for this booking';
    end if;
  end if;

  insert into public.holiday_voucher_redemptions
    (request_id, voucher_id, campaign_id, amount_cents, service_id, service_at, booking_reference, redeemed_by, recipient_name)
    values (p_request_id, v.id, v.campaign_id, p_amount_cents, p_service_id, p_service_at, p_booking_reference, p_redeemed_by, p_recipient_name);
  update public.holiday_vouchers set balance_cents = balance_cents - p_amount_cents where id = v.id returning * into v;
  return v;
end;
$$;

-- A refund affects only complimentary entitlement. The paid purchase itself is never modified here.
create function public.adjust_holiday_vouchers_for_refund(
  p_event_id text, p_payment_intent_id text, p_stripe_livemode boolean,
  p_cumulative_refunded_cents integer, p_original_charge_amount_cents integer, p_campaign_id text
) returns setof public.holiday_vouchers
language plpgsql security definer set search_path = '' as $$
declare
  v public.holiday_vouchers;
  prior public.holiday_voucher_refund_adjustments;
  refunded_cents integer;
  kept_cents integer;
  entitlement integer;
  used_cents integer;
  needs_review boolean;
begin
  if p_event_id is null or length(p_event_id) not between 1 and 255
     or p_payment_intent_id is null or p_stripe_livemode is null or p_campaign_id is null
     or p_original_charge_amount_cents is null or p_original_charge_amount_cents <= 0
     or p_cumulative_refunded_cents is null or p_cumulative_refunded_cents < 0
     or p_cumulative_refunded_cents > p_original_charge_amount_cents then
    raise exception 'A verified Stripe charge and cumulative refund amount are required';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('refund:' || p_event_id, 2));
  select * into prior from public.holiday_voucher_refund_adjustments where event_id = p_event_id;
  if found then
    if (prior.payment_intent_id, prior.stripe_livemode, prior.original_charge_amount_cents, prior.campaign_id)
      is distinct from (p_payment_intent_id, p_stripe_livemode, p_original_charge_amount_cents, p_campaign_id) then
      raise exception 'Refund retry does not match the original event';
    end if;
    -- A Stripe event retry retrieves the charge's latest cumulative refund total.
    -- Higher current totals must be reconciled even when the delivery event ID is reused.
    if p_cumulative_refunded_cents <= prior.cumulative_refunded_cents then
      return query select * from public.holiday_vouchers where id = prior.voucher_id;
      return;
    end if;
  end if;
  select * into v from public.holiday_vouchers
    where campaign_id = p_campaign_id and payment_intent_id = p_payment_intent_id
      and stripe_livemode = p_stripe_livemode for update;
  if not found then return; end if;
  if v.purchased_amount_cents <> p_original_charge_amount_cents then
    raise exception 'The refund charge does not match the qualifying purchase amount';
  end if;

  -- Cumulative Stripe refunds are monotonic even when webhook delivery is out of order.
  refunded_cents := greatest(v.amount_refunded_cents, p_cumulative_refunded_cents);
  kept_cents := v.purchased_amount_cents - refunded_cents;
  entitlement := least(v.face_value_cents, case
    when kept_cents >= 50000 then 10000 when kept_cents >= 25000 then 5000
    when kept_cents >= 15000 then 2500 when kept_cents >= 10000 then 1500
    when kept_cents >= 5000 then 500 else 0 end);
  select coalesce((select sum(amount_cents) from public.holiday_voucher_redemptions where voucher_id = v.id), 0)
       - coalesce((select sum(reversed_amount_cents) from public.holiday_voucher_redemption_reversals where voucher_id = v.id), 0)
    into used_cents;
  needs_review := used_cents > entitlement;
  update public.holiday_vouchers
    set entitlement_cents = entitlement, amount_refunded_cents = refunded_cents,
        balance_cents = greatest(entitlement - used_cents, 0), refund_review_required = needs_review,
        status = case when kept_cents = 0 then 'voided' when needs_review then 'refund_review' else 'issued' end,
        status_reason = case when needs_review then 'Promotional credit already used exceeds the remaining qualifying bonus'
          when kept_cents = 0 then 'The original gift certificate purchase was fully refunded'
          when entitlement = 0 then 'The amount kept no longer qualifies for a promotional bonus' else null end
    where id = v.id returning * into v;
  insert into public.holiday_voucher_refund_adjustments (
    event_id, voucher_id, campaign_id, payment_intent_id, stripe_livemode,
    original_charge_amount_cents, cumulative_refunded_cents, entitlement_cents
  ) values (p_event_id, v.id, p_campaign_id, p_payment_intent_id, p_stripe_livemode,
    p_original_charge_amount_cents, p_cumulative_refunded_cents, entitlement)
    on conflict (event_id) do update set cumulative_refunded_cents = excluded.cumulative_refunded_cents,
      entitlement_cents = excluded.entitlement_cents, updated_at = now();
  -- Before the first delivery attempt use current entitlement. Once claimed, the
  -- amount is frozen so retrying the provider idempotency key sends identical content.
  update public.holiday_voucher_email_outbox set delivery_amount_cents = entitlement, updated_at = now()
    where voucher_id = v.id and attempts = 0;
  return next v;
end;
$$;

-- Cancellation credit is restored only after an administrator attests the existing policy permits it.
create function public.restore_holiday_voucher_redemption(
  p_request_id uuid, p_redemption_id uuid, p_policy_eligible boolean,
  p_policy_reference text, p_restored_by text
) returns public.holiday_vouchers
language plpgsql security definer set search_path = '' as $$
declare
  r public.holiday_voucher_redemptions;
  v public.holiday_vouchers;
  prior public.holiday_voucher_redemption_reversals;
  used_cents integer;
  new_balance integer;
  needs_review boolean;
begin
  if p_policy_eligible is distinct from true or p_policy_reference is null
     or length(trim(p_policy_reference)) not between 1 and 500
     or p_restored_by is null or length(p_restored_by) not between 3 and 320 then
    raise exception 'An administrator must confirm the existing cancellation policy permits restoration';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(p_request_id::text, 3));
  select * into prior from public.holiday_voucher_redemption_reversals where request_id = p_request_id;
  if found then
    if (prior.redemption_id, prior.policy_reference, prior.restored_by)
      is distinct from (p_redemption_id, p_policy_reference, p_restored_by) then
      raise exception 'Cancellation retry does not match the original request';
    end if;
    select * into strict v from public.holiday_vouchers where id = prior.voucher_id;
    return v;
  end if;
  select * into strict r from public.holiday_voucher_redemptions where id = p_redemption_id;
  select * into strict v from public.holiday_vouchers where id = r.voucher_id for update;
  -- A second request for the same canceled redemption must never restore it twice.
  if exists (select 1 from public.holiday_voucher_redemption_reversals where redemption_id = r.id) then return v; end if;
  select coalesce((select sum(amount_cents) from public.holiday_voucher_redemptions where voucher_id = v.id), 0)
       - coalesce((select sum(reversed_amount_cents) from public.holiday_voucher_redemption_reversals where voucher_id = v.id), 0)
       - r.amount_cents into used_cents;
  new_balance := greatest(v.entitlement_cents - used_cents, 0);
  needs_review := used_cents > v.entitlement_cents;
  insert into public.holiday_voucher_redemption_reversals (
    request_id, redemption_id, voucher_id, reversed_amount_cents, restored_amount_cents,
    policy_eligible, policy_reference, restored_by
  ) values (p_request_id, r.id, v.id, r.amount_cents, greatest(new_balance - v.balance_cents, 0),
    p_policy_eligible, p_policy_reference, p_restored_by);
  update public.holiday_vouchers
    set balance_cents = new_balance, refund_review_required = needs_review,
        status = case when amount_refunded_cents = purchased_amount_cents then 'voided'
          when needs_review then 'refund_review' else 'issued' end,
        status_reason = case when needs_review then status_reason
          when amount_refunded_cents = purchased_amount_cents then 'The original gift certificate purchase was fully refunded'
          when entitlement_cents = 0 then 'The amount kept no longer qualifies for a promotional bonus' else null end
    where id = v.id returning * into v;
  -- valid_from and expires_at are immutable and are never extended by a cancellation.
  return v;
end;
$$;

-- The provider's 24-hour idempotency window must never silently become an automatic resend.
create function public.claim_holiday_voucher_email(p_voucher_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare o public.holiday_voucher_email_outbox; token uuid;
begin
  select * into strict o from public.holiday_voucher_email_outbox where voucher_id = p_voucher_id for update;
  if o.status = 'sent' then return jsonb_build_object('claimed', false, 'reason', 'sent'); end if;
  if o.status = 'review' then return jsonb_build_object('claimed', false, 'reason', 'review'); end if;
  if o.initial_attempt_at is not null and now() >= o.initial_attempt_at + interval '23 hours' then
    update public.holiday_voucher_email_outbox set status = 'review', last_error = 'Delivery requires manual review after provider idempotency window', updated_at = now() where voucher_id = p_voucher_id;
    return jsonb_build_object('claimed', false, 'reason', 'review');
  end if;
  if o.status = 'sending' and o.claimed_at > now() - interval '5 minutes' then
    return jsonb_build_object('claimed', false, 'reason', 'busy');
  end if;
  if not exists (select 1 from public.holiday_vouchers where id = p_voucher_id and status = 'issued' and entitlement_cents > 0) then
    return jsonb_build_object('claimed', false, 'reason', 'held');
  end if;
  token := gen_random_uuid();
  update public.holiday_voucher_email_outbox
    set status = 'sending', claim_token = token, claimed_at = now(),
        initial_attempt_at = coalesce(initial_attempt_at, now()), attempts = attempts + 1, updated_at = now()
    where voucher_id = p_voucher_id;
  return jsonb_build_object('claimed', true, 'claimToken', token, 'amountCents', o.delivery_amount_cents);
end;
$$;

create function public.complete_holiday_voucher_email(p_voucher_id uuid, p_claim_token uuid, p_provider_message_id text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  update public.holiday_voucher_email_outbox
    set status = 'sent', provider_message_id = p_provider_message_id, sent_at = now(),
        claim_token = null, last_error = null, updated_at = now()
    where voucher_id = p_voucher_id and claim_token = p_claim_token and status = 'sending';
  return found;
end;
$$;

create function public.fail_holiday_voucher_email(p_voucher_id uuid, p_claim_token uuid, p_error text, p_requires_review boolean)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  update public.holiday_voucher_email_outbox
    set status = case when p_requires_review then 'review' else 'failed' end,
        last_error = left(p_error, 1000), claim_token = null, updated_at = now()
    where voucher_id = p_voucher_id and claim_token = p_claim_token and status = 'sending';
  return found;
end;
$$;

revoke all on function public.holiday_voucher_immutable_fields() from public, anon, authenticated, service_role;
revoke all on function public.issue_holiday_voucher(jsonb) from public, anon, authenticated;
revoke all on function public.redeem_holiday_voucher(uuid, uuid, integer, text, timestamptz, text, text, text, boolean, text[], boolean, integer, boolean) from public, anon, authenticated;
revoke all on function public.adjust_holiday_vouchers_for_refund(text, text, boolean, integer, integer, text) from public, anon, authenticated;
revoke all on function public.restore_holiday_voucher_redemption(uuid, uuid, boolean, text, text) from public, anon, authenticated;
revoke all on function public.claim_holiday_voucher_email(uuid) from public, anon, authenticated;
revoke all on function public.complete_holiday_voucher_email(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.fail_holiday_voucher_email(uuid, uuid, text, boolean) from public, anon, authenticated;
grant execute on function public.issue_holiday_voucher(jsonb) to service_role;
grant execute on function public.redeem_holiday_voucher(uuid, uuid, integer, text, timestamptz, text, text, text, boolean, text[], boolean, integer, boolean) to service_role;
grant execute on function public.adjust_holiday_vouchers_for_refund(text, text, boolean, integer, integer, text) to service_role;
grant execute on function public.restore_holiday_voucher_redemption(uuid, uuid, boolean, text, text) to service_role;
grant execute on function public.claim_holiday_voucher_email(uuid) to service_role;
grant execute on function public.complete_holiday_voucher_email(uuid, uuid, text) to service_role;
grant execute on function public.fail_holiday_voucher_email(uuid, uuid, text, boolean) to service_role;

comment on table public.holiday_vouchers is 'Complimentary promotional credit only. Paid gift certificate value and terms are not stored or modified here.';
comment on column public.holiday_vouchers.expires_at is 'Exclusive expiry boundary: March 31, 2027 11:59:59 PM Eastern is followed by 2027-04-01T04:00:00Z.';
commit;
