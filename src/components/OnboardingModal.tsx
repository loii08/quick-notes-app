import React, { useEffect, useState, useRef } from 'react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = {
  id: string;
  title: string;
  message: string;
  selector?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  device?: 'desktop' | 'mobile' | 'both'; // Control which viewports show this step
};

const ONBOARDING_STEPS: Step[] = [
  {
    id: 'welcome',
    title: 'Welcome to Quick Notes!',
    message: "Let's take a quick interactive tour to get you started. You can skip anytime.",
    placement: 'center',
    device: 'both',
  },
  // Desktop view: 1. Navbar
  {
    id: 'navbar',
    title: 'Navigation Bar',
    message: 'Access settings, user profile, and app controls from here.',
    selector: 'nav.fixed.top-0',
    placement: 'bottom',
    device: 'desktop',
  },
  // Desktop view: 2. Category
  {
    id: 'categories',
    title: 'Categories Bar',
    message: 'Filter your notes by category or create new categories via the manager.',
    selector: '.z-30.flex.items-center.mb-8',
    placement: 'bottom',
    device: 'desktop',
  },
  // Desktop view: 3. Add Note / Mobile view: 8. Add Note FAB & 9. New Note Modal
  {
    id: 'add-note',
    title: 'Create a Note',
    message: 'Tap this plus icon to open a modal and input your new note instantly.',
    selector: 'input[placeholder^="Add a note"]', // Will be overridden by responsive logic
    placement: 'top',
    device: 'both',
  },
  // Mobile only: Show New Note Modal opening instruction
  {
    id: 'new-note-modal',
    title: 'New Note Modal',
    message: 'Type your note here. You can also use Quick Actions below to add templates.',
    placement: 'right',
    device: 'mobile',
  },
  // Mobile only: Highlight Manage button inside New Note Modal
  {
    id: 'manage-button',
    title: 'Manage Quick Actions',
    message: 'Tap this button to open the Quick Actions manager and create or edit templates.',
    selector: '#manage-qa-btn',
    placement: 'left',
    device: 'mobile',
  },
  // Desktop view: 4. Add quick Notes / Mobile view: 10. Add or Manage quick notes
  {
    id: 'quick-actions',
    title: 'Quick Actions',
    message: 'Use quick actions to insert frequent note templates in one tap.',
    selector: 'button[title="Manage Quick Actions"]', // Will be overridden by responsive logic
    placement: 'left',
    device: 'both',
  },
  // Desktop view: 5. The Notes / Mobile view: 11. The Notes
  {
    id: 'notes-list',
    title: 'Your Notes',
    message: 'Your notes appear here. Tap a note to open, edit or delete it.',
    // Target the first note card container
    selector: '#notes-list-container',
    placement: 'left',
    device: 'both',
  },
  {
    id: 'sync',
    title: 'Cloud Sync',
    message: "If you're signed in, your notes are synced across devices.",
    placement: 'center',
    device: 'both',
  },
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const totalSteps = ONBOARDING_STEPS.length;
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const isUserNavigatingRef = useRef(false); // Prevent auto-skip on user navigation

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const step = ONBOARDING_STEPS[stepIndex];
    if (step.selector) {
      // Check if mobile view (md breakpoint is 768px in Tailwind)
      const isMobile = window.innerWidth < 768;
      let selector = step.selector;
      
      // For add-note step: use FAB on mobile, input on desktop
      if (step.id === 'add-note') {
        selector = isMobile ? 'button.md\\:hidden.fixed.bottom-6' : 'input[placeholder^="Add a note"]';
      }
      
      // For quick-actions step: use Manage button in modal on mobile, categories bar button on desktop
      if (step.id === 'quick-actions') {
        selector = isMobile ? 'button.text-xs.font-semibold.px-3.py-1\\.5.mb-1' : 'button[title="Manage Quick Actions"]';
      }
      
      const el = document.querySelector(selector) as HTMLElement | null;
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
        // smoothly scroll element into view if needed
        try { el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }); } catch {}
        return;
      }
    }
    setTargetRect(null);
  }, [isOpen, stepIndex]);

  useEffect(() => {
    if (!isOpen) return;
    let raf = 0;
    const update = () => {
      const step = ONBOARDING_STEPS[stepIndex];
      if (step.selector) {
        // Check if mobile view (md breakpoint is 768px in Tailwind)
        const isMobile = window.innerWidth < 768;
        let selector = step.selector;
        
        // For add-note step: use FAB on mobile, input on desktop
        if (step.id === 'add-note') {
          selector = isMobile ? 'button.md\\:hidden.fixed.bottom-6' : 'input[placeholder^="Add a note"]';
        }
        
        // For quick-actions step: use Manage button in modal on mobile, categories bar button on desktop
        if (step.id === 'quick-actions') {
          selector = isMobile ? 'button.text-xs.font-semibold.px-3.py-1\\.5.mb-1' : 'button[title="Manage Quick Actions"]';
        }
        
        const el = document.querySelector(selector) as HTMLElement | null;
        if (el) {
          const rect = el.getBoundingClientRect();
          setTargetRect(rect);
          return;
        }
      }
      setTargetRect(null);
    };

    const onChange = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };

    window.addEventListener('resize', onChange);
    window.addEventListener('scroll', onChange, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onChange);
      window.removeEventListener('scroll', onChange, true);
    };
  }, [isOpen, stepIndex]);

  // Auto-open modal flow for demo steps: when entering certain steps trigger UI actions
  useEffect(() => {
    if (!isOpen) return;
    const step = ONBOARDING_STEPS[stepIndex];
    const isMobile = window.innerWidth < 768;

    // helper to safely click an element
    const clickIfExists = (sel: string) => {
      const el = document.querySelector(sel) as HTMLElement | null;
      if (el) {
        try { el.click(); } catch {}
        return true;
      }
      return false;
    };

    // When we reach the 'new-note-modal' step, open the New Note modal by clicking FAB
    if (step.id === 'new-note-modal') {
      // click FAB (prefer stable id)
      const clicked = clickIfExists('#fab-add-note') || clickIfExists('button.md\\:hidden.fixed.bottom-6');
      if (clicked) {
        // allow modal to animate open and then update target rect to highlight entire modal
        setTimeout(() => {
          // Find modal by stable titleId and highlight the entire outer modal container
          const modalTitle = document.getElementById('new-note-modal-title') as HTMLElement | null;
          if (modalTitle) {
            const modalOuter = modalTitle.closest('div.relative.bg-surface.dark\\:bg-gray-800, div[role="dialog"] > div.relative.bg-surface') as HTMLElement | null;
            if (modalOuter) {
              setTargetRect(modalOuter.getBoundingClientRect());
            } else {
              // Fallback: try to find the modal dialog wrapper
              const dialogWrapper = modalTitle.closest('div[role="dialog"]') as HTMLElement | null;
              if (dialogWrapper) setTargetRect(dialogWrapper.getBoundingClientRect());
            }
          }
        }, 350);
      }
    }

    // When we reach the 'manage-button' step on mobile, just highlight the Manage button (modal already open)
    if (step.id === 'manage-button') {
      // Just highlight the Manage button; don't click it yet
      setTimeout(() => {
        const manageBtn = document.getElementById('manage-qa-btn') as HTMLElement | null;
        if (manageBtn) {
          setTargetRect(manageBtn.getBoundingClientRect());
        }
      }, 100);
    }

    // When we reach the 'quick-actions' step on mobile, click the Manage button inside the New Note modal to open QA modal
    if (step.id === 'quick-actions' && isMobile) {
      // Attempt to find the Manage button inside the open New Note modal (prefer stable id)
      const manageSel = '#manage-qa-btn';
      const clicked = clickIfExists(manageSel) || clickIfExists('button.text-xs.font-semibold.px-3.py-1\\.5.mb-1');
      if (clicked) {
        // after opening QA modal, set a small delay then focus inside the QA modal
        setTimeout(() => {
          // attempt to find the QA modal container by stable title id
          let qaModalContainer: HTMLElement | null = null;
          const qaHeading = document.getElementById('qa-modal-title');
          if (qaHeading) {
            const dialog = qaHeading.closest('div[role="dialog"]') as HTMLElement | null;
            if (dialog) qaModalContainer = dialog.querySelector('div.relative.bg-surface, div.relative.rounded-2xl') as HTMLElement | null;
          }
          if (qaModalContainer) setTargetRect(qaModalContainer.getBoundingClientRect());
          else {
            const el = document.getElementById('new-qa-input') as HTMLElement | null;
            if (el) setTargetRect(el.getBoundingClientRect());
          }
        }, 350);
      }
    }

    // If we get to the notes list step, close any open modals so the list is visible
    if (step.id === 'notes-list') {
      setTimeout(() => {
        const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]')) as HTMLElement[];
        dialogs.forEach(d => {
          const content = d.querySelector('div.relative.bg-surface, div.relative.rounded-2xl') as HTMLElement | null;
          if (content) {
            // try to find header close button
            const headerClose = content.querySelector('div > button') as HTMLElement | null;
            if (headerClose) {
              try { headerClose.click(); } catch {}
            }
          }
        });
        // clear highlight after closing
        setTargetRect(null);
      }, 250);
    }
  }, [isOpen, stepIndex]);

  useEffect(() => {
    if (!isOpen) setStepIndex(0);
  }, [isOpen]);

  // Mark body when tour is active so other components can behave differently (e.g., prevent backdrop close)
  useEffect(() => {
    if (isOpen) document.body.setAttribute('data-tour-open', 'true');
    else document.body.removeAttribute('data-tour-open');
    return () => document.body.removeAttribute('data-tour-open');
  }, [isOpen]);

  // Helper: check if step is visible on current device
  const isStepVisibleOnDevice = (step: Step): boolean => {
    const isMobileNow = window.innerWidth < 768;
    if (!step.device || step.device === 'both') return true;
    if (step.device === 'mobile') return isMobileNow;
    if (step.device === 'desktop') return !isMobileNow;
    return true;
  };

  // Helper: skip steps that are desktop-only/shouldn't render on current viewport
  const skipForwardIndex = (fromIndex: number) => {
    let n = fromIndex + 1;
    while (n < totalSteps && !isStepVisibleOnDevice(ONBOARDING_STEPS[n])) n++;
    return n;
  };

  const skipBackwardIndex = (fromIndex: number) => {
    let p = fromIndex - 1;
    while (p >= 0 && !isStepVisibleOnDevice(ONBOARDING_STEPS[p])) p--;
    return p;
  };

  // Ensure we never render steps hidden on current device: auto-advance on initial open only
  useEffect(() => {
    if (!isOpen || stepIndex === 0 || isUserNavigatingRef.current) {
      return; // Skip if user just navigated
    }
    isUserNavigatingRef.current = false; // Reset for next iteration
    const cur = ONBOARDING_STEPS[stepIndex];
    // Auto-skip if current step is not visible on this device
    if (!isStepVisibleOnDevice(cur)) {
      const next = skipForwardIndex(stepIndex);
      setStepIndex(next);
    }
  }, [isOpen, stepIndex]);

  if (!isOpen || !isMounted) return null;

  const isMobile = window.innerWidth < 768;
  const current = ONBOARDING_STEPS[stepIndex];

  // Confetti effect function
  const triggerConfetti = () => {
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.pointerEvents = 'none';
    confettiContainer.style.zIndex = '20000';
    document.body.appendChild(confettiContainer);

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
    const confettiPieces = 50;

    for (let i = 0; i < confettiPieces; i++) {
      const confetti = document.createElement('div');
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.random() * 8 + 4; // 4-12px
      const delay = Math.random() * 0.3;
      const duration = Math.random() * 1.5 + 2.5; // 2.5-4s

      confetti.style.position = 'fixed';
      confetti.style.width = size + 'px';
      confetti.style.height = size + 'px';
      confetti.style.backgroundColor = color;
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-10px';
      confetti.style.opacity = '1';
      confetti.style.pointerEvents = 'none';
      confetti.style.animation = `confettiFall ${duration}s linear ${delay}s forwards`;

      confettiContainer.appendChild(confetti);
    }

    // Clean up after animation
    setTimeout(() => {
      confettiContainer.remove();
    }, 5000);
  };

  const handleNext = () => {
    const next = skipForwardIndex(stepIndex);
    if (next < totalSteps) {
      isUserNavigatingRef.current = true; // Prevent auto-skip
      setStepIndex(next);
    } else {
      // Trigger confetti effect before closing
      triggerConfetti();
      setTimeout(() => onClose(), 1000);
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      // Close any open modals before going back
      const dialogs = Array.from(document.querySelectorAll('div[role="dialog"]')) as HTMLElement[];
      dialogs.forEach(d => {
        const content = d.querySelector('div.relative.bg-surface, div.relative.rounded-2xl') as HTMLElement | null;
        if (content) {
          const headerClose = content.querySelector('div > button') as HTMLElement | null;
          if (headerClose) {
            try { headerClose.click(); } catch {}
          }
        }
      });
      const prev = skipBackwardIndex(stepIndex);
      if (prev >= 0 && prev !== stepIndex) {
        isUserNavigatingRef.current = true; // Prevent auto-skip
        setStepIndex(prev);
      }
    }
  };

  const handleSkip = () => onClose();

  // Tooltip positioning
  const computeTooltipStyle = (): React.CSSProperties => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const tooltipMaxW = Math.min(360, vw - 32);
    const padding = 12;

    // Mobile: special handling for FAB button (bottom-6) - position tooltip at top
    if (vw < 640 && current.id === 'add-note') {
      return {
        left: 16,
        right: 16,
        width: `${tooltipMaxW}px`,
        top: 80, // Position below navbar/categories
        transform: 'none'
      } as React.CSSProperties;
    }

    // Mobile: use a bottom full-width style for small screens
    if (vw < 640) {
      return {
        left: 16,
        right: 16,
        width: `${tooltipMaxW}px`,
        bottom: 28,
        transform: 'none'
      } as React.CSSProperties;
    }

    if (!targetRect) {
      return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)', maxWidth: tooltipMaxW };
    }

    let left = targetRect.left + targetRect.width / 2;
    let top: number | string = 0;
    let transform = 'translate(-50%, -50%)';

    switch (current.placement) {
      case 'top':
        top = targetRect.top - padding;
        transform = 'translate(-50%, -100%)';
        break;
      case 'bottom':
        top = targetRect.bottom + padding;
        transform = 'translate(-50%, 0)';
        break;
      case 'left':
        left = targetRect.left - padding;
        top = targetRect.top + targetRect.height / 2;
        transform = 'translate(-100%, -50%)';
        break;
      case 'right':
        left = targetRect.right + padding;
        top = targetRect.top + targetRect.height / 2;
        transform = 'translate(0, -50%)';
        break;
      default:
        top = targetRect.top + targetRect.height / 2;
        transform = 'translate(-50%, -50%)';
    }

    // Clamp horizontal position so tooltip stays inside viewport
    const minLeft = 16 + tooltipMaxW / 2;
    const maxLeft = vw - 16 - tooltipMaxW / 2;
    if (typeof left === 'number') left = Math.max(minLeft, Math.min(maxLeft, left));

    // Clamp vertical position (avoid going off top/bottom)
    if (typeof top === 'number') {
      const minTop = 16;
      const maxTop = vh - 16;
      top = Math.max(minTop, Math.min(maxTop, top));
    }

    return { left, top, transform, maxWidth: tooltipMaxW } as React.CSSProperties;
  };

  // compute clamped highlight style if targetRect exists
  let highlightStyle: React.CSSProperties | null = null;
  if (targetRect) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 8;
    const pad = 8;

    let left = targetRect.left - pad;
    let top = targetRect.top - pad;
    let width = targetRect.width + pad * 2;
    let height = targetRect.height + pad * 2;

    // Clamp horizontal
    if (left < margin) {
      const overflow = margin - left;
      left = margin;
      width = Math.max(32, width - overflow);
    }
    if (left + width > vw - margin) {
      const overflow = left + width - (vw - margin);
      width = Math.max(32, width - overflow);
    }

    // Clamp vertical
    if (top < margin) {
      const overflow = margin - top;
      top = margin;
      height = Math.max(24, height - overflow);
    }
    if (top + height > vh - margin) {
      const overflow = top + height - (vh - margin);
      height = Math.max(24, height - overflow);
    }

    highlightStyle = {
      position: 'fixed',
      left,
      top,
      width,
      height,
      borderRadius: 12,
      boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
      border: '2px solid rgba(255,255,255,0.9)',
      zIndex: 9999,
      pointerEvents: 'none',
      transition: 'all 300ms ease',
    };
  }

  return (
    <>
      <style>{`
        @keyframes confettiFall {
          to {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
          }
        }
      `}</style>
      <div ref={overlayRef} className="fixed inset-0 z-[9998] pointer-events-auto">
      {/* Backdrop with cutout for highlight */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'auto' }}>
        <defs>
          <mask id="tour-mask">
            {/* Default: whole screen is visible (white) */}
            <rect width="100%" height="100%" fill="white" />
            {/* Carve out the highlight area (black = transparent) */}
            {highlightStyle && (
              <rect
                x={highlightStyle.left as number}
                y={highlightStyle.top as number}
                width={highlightStyle.width as number}
                height={highlightStyle.height as number}
                rx={12}
                fill="black"
              />
            )}
          </mask>
        </defs>
        {/* Overlay that darkens everything except the highlighted region */}
        <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.6)" mask="url(#tour-mask)" />
      </svg>

      {/* Highlight box around target */}
      {highlightStyle && (
        <div
          style={{
            ...highlightStyle,
            zIndex: 9999,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute z-[10000] max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-xl p-4 text-sm text-textMain dark:text-gray-100"
        style={{ position: 'fixed', ...computeTooltipStyle(), zIndex: 10000 }}
        role="dialog"
        aria-modal="true"
      >
        <div className="font-semibold text-base mb-1">{current.title}</div>
        <div className="text-xs mb-3 text-gray-600 dark:text-gray-300">{current.message}</div>
        <div className="flex justify-between items-center gap-3">
          <div className="flex gap-2">
            <button onClick={handlePrev} disabled={stepIndex === 0} className={`px-3 py-1 rounded ${stepIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'bg-gray-100 dark:bg-gray-700'}`}>
              Back
            </button>
            <button onClick={handleNext} className="px-3 py-1 bg-primary text-textOnPrimary rounded">
              {stepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
          <div>
            <button onClick={handleSkip} className="text-xs text-gray-400 hover:underline">Skip Tour</button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default OnboardingModal;
