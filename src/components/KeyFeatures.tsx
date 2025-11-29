import React from 'react';

const features = [
  { icon: '📂', title: 'Organize Notes Instantly', description: 'Categorize your thoughts with custom tags for quick retrieval.' },
  { icon: '🔄', title: 'Real-Time Syncing', description: 'Your notes are always up-to-date on all your devices, automatically.' },
  { icon: '☁️', title: 'Secure Cloud Backup', description: 'Rest easy knowing your ideas are safely stored and always accessible.' },
];

const KeyFeatures: React.FC = () => {
  return (
    <div className="w-full py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Everything You Need, Nothing You Don't
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-700 dark:text-gray-300">
          A focused, clutter-free environment to capture what matters.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="text-center p-6 bg-green-50 rounded-2xl shadow-md border border-green-100 hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            <div className="text-5xl mb-4">{feature.icon}</div>
            <h3 className="text-lg font-bold text-green-800">{feature.title}</h3>
            <p className="mt-2 text-sm text-green-700">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyFeatures;
