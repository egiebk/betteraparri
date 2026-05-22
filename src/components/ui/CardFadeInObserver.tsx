import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const CARD_SELECTOR = '.card-fade-in';
const VISIBLE_CLASS = 'card-fade-in-visible';

export default function CardFadeInObserver() {
  const location = useLocation();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    const getCards = () =>
      Array.from(document.querySelectorAll<HTMLElement>(CARD_SELECTOR)).filter(
        card => !card.classList.contains(VISIBLE_CLASS)
      );

    const reveal = (card: Element) => {
      card.classList.add(VISIBLE_CLASS);
    };

    if (
      prefersReducedMotion.matches ||
      typeof IntersectionObserver === 'undefined'
    ) {
      getCards().forEach(reveal);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) {
            return;
          }

          reveal(entry.target);
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.12,
      }
    );

    const observeCards = () => {
      getCards().forEach(card => observer.observe(card));
    };

    observeCards();

    const mutationObserver = new MutationObserver(observeCards);
    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const handleMotionPreferenceChange = () => {
      if (prefersReducedMotion.matches) {
        getCards().forEach(reveal);
        observer.disconnect();
        mutationObserver.disconnect();
      }
    };

    prefersReducedMotion.addEventListener(
      'change',
      handleMotionPreferenceChange
    );

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
      prefersReducedMotion.removeEventListener(
        'change',
        handleMotionPreferenceChange
      );
    };
  }, [location.pathname, location.search]);

  return null;
}
