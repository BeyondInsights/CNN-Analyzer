
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Play,
  Users,
  Settings2, // For Market Factors
  Info,
  Brain, // For AI Configurator
  Newspaper, // For Review Core Products
  ListChecks, // For Review Features
  LayoutGrid, // For Review Verticals
  Trash2,
  Loader2
} from "lucide-react";
import type { ProductSetupConfig } from '@/lib/types'; // Assuming ProductSetupConfig might be used for productKeys if needed

interface ControlsSectionProps {
  productKeys: string[]; // e.g., from Object.keys(cardDataState)
  activeProducts: Set<number>; // e.g., activeProductsState
  onToggleProductActive: (id: number) => void;
  onRunSimulation: () => void;
  onShowProfiles: () => void;
  onMarketFactors: () => void;
  onAboutModel: () => void;
  onReviewCoreProducts: () => void;
  onReviewFeatures: () => void;
  onReviewVerticals: () => void;
  onClearAll: () => void;
  isSimulating: boolean;
  isAnalyzingSensitivity: boolean;
}

export default function ControlsSection({
  productKeys,
  activeProducts,
  onToggleProductActive,
  onRunSimulation,
  onShowProfiles,
  onMarketFactors,
  onAboutModel,
  onReviewCoreProducts,
  onReviewFeatures,
  onReviewVerticals,
  onClearAll,
  isSimulating,
  isAnalyzingSensitivity,
}: ControlsSectionProps) {
  const commonDisabled = isSimulating || isAnalyzingSensitivity;

  return (
    <div className="p-3 md:p-4 bg-card rounded-lg shadow-md mb-4">
      {/* Master flex container for all button groups, becomes a column on small screens */}
      <div className="flex flex-col lg:flex-row lg:flex-wrap justify-between items-center gap-3 md:gap-4">

        {/* Group 1: Core Actions (Left Aligned on Larger Screens) */}
        <div className="flex flex-wrap justify-center lg:justify-start gap-2">
          <Button onClick={onRunSimulation} className="bg-green-600 hover:bg-green-700 text-white" disabled={commonDisabled} size="sm">
            {isSimulating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isSimulating ? "Simulating..." : "Run Simulation"}
          </Button>
          <Button onClick={onShowProfiles} variant="outline" disabled={commonDisabled} size="sm">
            <Users className="mr-2 h-4 w-4" /> Show Profiles
          </Button>
          <Button onClick={onMarketFactors} variant="outline" disabled={commonDisabled} size="sm">
            <Settings2 className="mr-2 h-4 w-4" /> Market Factors
          </Button>
          <Button onClick={onAboutModel} variant="outline" disabled={commonDisabled} size="sm">
            <Info className="mr-2 h-4 w-4" /> About Model
          </Button>
        </div>

        {/* Group 2: Product Selection (Centered on Larger Screens) */}
        <div className="flex flex-col items-center gap-2 w-full lg:w-auto lg:flex-grow lg:mx-4">
          <h2 className="text-sm font-semibold text-foreground mb-1 md:mb-0">
            Select Products to Include in Simulation
          </h2>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {productKeys.map((idStr) => {
              const id = parseInt(idStr);
              return (
                <Button
                  key={id}
                  variant={activeProducts.has(id) ? "default" : "outline"}
                  onClick={() => onToggleProductActive(id)}
                  className={`transition-all text-xs px-3 py-1.5 h-auto`}
                  disabled={commonDisabled}
                  size="sm"
                >
                  Product {id}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Group 3: Tools & Clear (Right Aligned on Larger Screens) */}
        <div className="flex flex-wrap justify-center lg:justify-end gap-2">
          <Button asChild variant="outline" size="sm" disabled={commonDisabled}>
            <Link href="/ai-configurator">
              <Brain className="mr-2 h-4 w-4" /> AI Config
            </Link>
          </Button>
          <Button onClick={onReviewCoreProducts} variant="outline" size="sm" disabled={commonDisabled}>
            <Newspaper className="mr-2 h-4 w-4" /> Core Products
          </Button>
          <Button onClick={onReviewFeatures} variant="outline" size="sm" disabled={commonDisabled}>
            <ListChecks className="mr-2 h-4 w-4" /> Features
          </Button>
          <Button onClick={onReviewVerticals} variant="outline" size="sm" disabled={commonDisabled}>
            <LayoutGrid className="mr-2 h-4 w-4" /> Verticals
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onClearAll}
            disabled={commonDisabled}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Clear All
          </Button>
        </div>
      </div>
    </div>
  );
}
