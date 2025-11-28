import React, { useState } from 'react';
import Modal from './Modal';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ONBOARDING_STEPS = [
  {
    icon: '👋',
    title: 'Welcome to Quick Notes!',
    message: "Let's take a quick tour to get you started. This app helps you capture ideas instantly and keep them organized.",
  },
  {
    icon: '✍️',
    title: 'Adding a Note',
    message: 'Use the main input box at the top to type your note. You can also use the "Quick Actions" below it for frequent notes.',
  },
  {
    icon: '📂',
    title: 'Organize with Categories',
    message: 'Use the category bar to filter your notes. Click the gear icon on the right to create and manage your own categories.',
  },
  {
    icon: '☁️',
    title: 'Cloud Sync is Active',
    message: "You're all set! Your notes, categories, and settings will now be automatically synced across your devices.",
  },
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);
  const totalSteps = ONBOARDING_STEPS.length;
  const currentStep = ONBOARDING_STEPS[step];

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  // When the modal closes, reset the step and remove highlights
  const handleClose = () => {
    setStep(0);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={currentStep.title}>
      <div className="text-center py-4">
        <div className="text-6xl mb-6">{currentStep.icon}</div>
        <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">{currentStep.message}</p>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 my-6">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === step ? 'bg-primary dark:bg-indigo-400' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          />
        ))}
      </div>

      {/* Footer with Buttons */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={handlePrev}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-opacity ${
            step > 0 ? 'opacity-100 text-gray-500 hover:text-textMain' : 'opacity-0 pointer-events-none'
          }`}
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="px-5 py-2 bg-primary text-textOnPrimary dark:bg-indigo-600 dark:hover:bg-indigo-700 rounded-lg font-semibold shadow-sm transition-all active:scale-95 text-sm"
        >
          {step === totalSteps - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>
    </Modal>
  );
};

export default OnboardingModal;