
import Image from 'next/image';

// Assuming MainHeaderProps is defined elsewhere, e.g. in page.tsx or a types file
interface MainHeaderProps {
  reportType: string; // Kept for now, not used in this version
  outputType: string; // Kept for now, not used in this version
  isConfigSet: boolean; // Kept for now, not used in this version
}

export default function MainHeader({ reportType, outputType, isConfigSet }: MainHeaderProps) {
  return (
    <header className="p-3 md:p-4 mb-4 md:mb-6 rounded-lg shadow-lg bg-card">
      <div className="flex justify-between items-center">
        {/* CNN Logo - Left */}
        <div className="flex-shrink-0">
          <Image 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/CNN_International_logo.svg/1200px-CNN_International_logo.svg.png" 
            alt="CNN Logo" 
            width={70} 
            height={35} 
            className="object-contain"
            data-ai-hint="news logo" 
          />
        </div>

        {/* Centered Welcome Text & Beyond Insights Logo */}
        <div className="flex flex-col items-center text-center flex-grow px-2 md:px-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary">
            Welcome to the CNN News Subscription Simulator
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1">
            Configure up to 8 subscription products and run detailed market simulations
          </p>
          <div className="flex items-center mt-1 md:mt-2">
            <p className="text-xs text-muted-foreground mr-1">Powered by</p>
            <Image 
              src="https://i.imgur.com/B4zCjNq.png" 
              alt="BEYOND Insights Logo" 
              width={80} 
              height={30} 
              className="object-contain"
              data-ai-hint="company logo" 
            />
          </div>
        </div>

        {/* Optional: Placeholder for right-aligned content if ever needed, keep parent flex-shrink-0 */}
        <div className="flex-shrink-0 w-[70px]"> 
          {/* This div helps balance the flex layout when the center content grows. */}
          {/* It reserves space equal to the CNN logo on the left to ensure true centering of the middle block. */}
          {/* Can be left empty or used for very small, non-critical icons/elements if absolutely necessary. */}
        </div>
      </div>
    </header>
  );
}
