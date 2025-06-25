import React from 'react';

interface AboutModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModelModal: React.FC<AboutModelModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">About the CNN Subscription Model</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h3 className="text-lg font-semibold mb-2">Model Overview</h3>
            <p>
              The CNN Subscription Simulator is a sophisticated choice-based conjoint analysis tool 
              designed to predict consumer preferences and market share for CNN's subscription offerings. 
              The model analyzes how different product configurations, pricing strategies, and market 
              factors influence consumer choice behavior.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">How It Works</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Configure up to 8 different subscription products with various features</li>
              <li>Set pricing for each product using our dynamic pricing engine</li>
              <li>Adjust market factors like awareness, distribution, and competitive pressure</li>
              <li>Run simulations to see predicted market share and revenue projections</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">Reader Features</h4>
                <p className="text-sm">Digital content, newsletters, archives, and premium articles</p>
              </div>
              <div>
                <h4 className="font-medium">Streaming Features</h4>
                <p className="text-sm">Live TV, on-demand content, and exclusive programming</p>
              </div>
              <div>
                <h4 className="font-medium">Vertical Access</h4>
                <p className="text-sm">Specialized content areas like Business, Politics, Tech, and more</p>
              </div>
              <div>
                <h4 className="font-medium">Market Analysis</h4>
                <p className="text-sm">Price sensitivity, competitive analysis, and adoption forecasting</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Simulation Types</h3>
            <div className="space-y-2">
              <div>
                <strong>Tiered Analysis:</strong> Products compete directly against each other
              </div>
              <div>
                <strong>Independent Analysis:</strong> Each product is evaluated in isolation
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Technical Details</h3>
            <p className="text-sm">
              Built on choice-based conjoint methodology with hierarchical Bayes estimation. 
              The model incorporates real consumer research data to provide accurate market 
              predictions and strategic insights for CNN's subscription strategy.
            </p>
          </section>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModelModal;

// Check if this file exists and what content it has