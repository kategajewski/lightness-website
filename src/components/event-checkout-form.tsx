type EventCheckoutFormProps = {
  eventSlug: string;
  buttonLabel: string;
  buttonClassName?: string;
  marketingConsentAtCheckout?: boolean;
};

export function EventCheckoutForm({
  eventSlug,
  buttonLabel,
  buttonClassName = "button-pill",
  marketingConsentAtCheckout = false,
}: EventCheckoutFormProps) {
  return (
    <form
      action="/api/checkout/event"
      method="post"
      className="flex max-w-[30rem] flex-col items-start gap-3"
    >
      <input type="hidden" name="eventSlug" value={eventSlug} />
      <button type="submit" className={buttonClassName}>
        {buttonLabel}
      </button>
      {marketingConsentAtCheckout ? (
        <p className="text-left text-[0.82rem] leading-5 text-[var(--color-muted)]">
          You can choose whether to receive event updates at checkout.
        </p>
      ) : (
        <label className="flex cursor-pointer items-start gap-2.5 text-left text-[0.82rem] leading-5 text-[var(--color-muted)]">
          <input
            type="checkbox"
            name="marketingConsent"
            value="yes"
            className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-text)]"
          />
          <span>
            Yes, keep me in the loop about future events and offerings. I can
            unsubscribe at any time.
          </span>
        </label>
      )}
    </form>
  );
}
