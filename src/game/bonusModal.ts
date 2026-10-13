import { el, formatCredits } from '../util/dom';
import { openModal } from '../components/modal';
import { BONUS_CREDITS, CREDIT_LABEL, ROUNDS_FOR_BONUS } from './config';

interface BonusOptions {
  rounds: number;
  onClaim: () => void;
}

/**
 * "You've won a bonus" pop-up shown after two completed demo rounds.
 *
 * The bonus is explicitly simulated: it credits play-money demo credits inside
 * this page only. No real money, prize or entitlement is created or implied.
 */
export function openBonusModal({ rounds, onClaim }: BonusOptions): void {
  const body = el('div', { class: 'bonus__body' });

  const amount = el('div', { class: 'bonus__amount' }, [
    el('b', { text: `${formatCredits(BONUS_CREDITS)} ${CREDIT_LABEL}` }),
    el('span', { text: 'Simulated demo credits - usable only inside this demo game' }),
  ]);

  const disclaimer = el('p', { class: 'bonus__disclaimer' }, [
    el('strong', { text: 'Simulated bonus. ' }),
    document.createTextNode(
      'This is a test-environment reward with no monetary value. It is not a deposit bonus, ' +
        'not withdrawable, not redeemable and carries no real-world entitlement. ' +
        'No account, payment method or personal data is involved.',
    ),
  ]);

  const claim = el('button', {
    class: 'btn btn--primary btn--block',
    type: 'button',
    text: 'Claim Bonus',
  });

  const dismiss = el('button', {
    class: 'bonus__dismiss',
    type: 'button',
    text: 'Maybe later',
  });

  const actions = el('div', { class: 'bonus__actions' }, [claim, dismiss]);

  body.append(amount, disclaimer, actions);

  const content = el('div', { class: 'bonus' }, [
    el('div', { class: 'bonus__hero' }, [
      el('div', { class: 'bonus__rays' }),
      el('div', { class: 'bonus__coin', text: '\u{1F389}', 'aria-hidden': 'true' }),
      el('h2', { class: 'bonus__title', id: 'bonus-title', text: "You've won a bonus" }),
      el('p', {
        class: 'bonus__sub',
        text: `${rounds} of ${ROUNDS_FOR_BONUS} demo rounds completed - here is your simulated reward.`,
      }),
      el('span', { class: 'bonus__tag', text: 'Simulated · Test environment' }),
    ]),
    body,
  ]);

  const modal = openModal(content, {
    label: "You've won a bonus",
    labelledBy: 'bonus-title',
    role: 'alertdialog',
    panelClass: 'bonus-panel',
    dismissOnBackdrop: false,
  });

  dismiss.addEventListener('click', () => modal.close());

  claim.addEventListener('click', () => {
    onClaim();
    actions.remove();
    disclaimer.remove();
    body.append(
      el('div', { class: 'bonus__claimed' }, [
        el('strong', { text: 'Simulated bonus added to your demo balance.' }),
        el('span', {
          text:
            `${formatCredits(BONUS_CREDITS)} ${CREDIT_LABEL} of play money is now available in this demo. ` +
            'It has no cash value and cannot be withdrawn.',
        }),
      ]),
      el('button', { class: 'btn btn--purple btn--block', type: 'button', text: 'Keep playing the demo' }, []),
    );
    body.querySelector<HTMLButtonElement>('button.btn--purple')?.addEventListener('click', () => modal.close());
    body.querySelector<HTMLButtonElement>('button.btn--purple')?.focus();
  });

  claim.focus();
}
