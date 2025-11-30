import React from 'react';

const AppLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-bgPage dark:bg-gray-900 flex flex-col items-center justify-center z-[200] animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <img src="/icon.ico" alt="App Icon" className="w-12 h-12 rounded-full" />
        <h1 className="font-extrabold tracking-tight text-3xl text-textMain dark:text-white">Quick Notes</h1>
      </div>
      <div className="flex justify-center items-center space-x-2 mt-4 h-4">
        {/* We use an array to easily render the three dots */}
        {[0, 1, 2].map((index) => (
          <div key={index}
            className="w-3 h-3 bg-green-500 rounded-full animate-juggle"
            style={{ animationDelay: `${index * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
};

export default AppLoader;