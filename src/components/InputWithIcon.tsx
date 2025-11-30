import React from 'react';

interface InputWithIconProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
  onIconClick?: () => void;
}

const InputWithIcon = React.forwardRef<HTMLInputElement, InputWithIconProps>(
  ({ icon, onIconClick, ...props }, ref) => {
    return (
      <div className="flex items-center border border-borderLight dark:border-gray-600 rounded-xl focus-within:ring-1 focus-within:ring-primary dark:focus-within:border-primary transition-all bg-bgPage dark:bg-gray-700">
        <input
          ref={ref}
          {...props}
          className="w-full p-3 border-none bg-transparent focus:ring-0 focus:outline-none text-sm text-textMain dark:text-white placeholder-gray-400"
        />
        <button
          type="button"
          onClick={onIconClick}
          className="p-3 text-gray-400 hover:text-textMain dark:hover:text-white transition-colors"
          aria-label="Toggle password visibility"
        >
          {icon}
        </button>
      </div>
    );
  }
);

export default InputWithIcon;