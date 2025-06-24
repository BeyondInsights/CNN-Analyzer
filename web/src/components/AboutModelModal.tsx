'use client';

import React, { useState } from 'react';
import modalStyles from './AboutModelModal.module.css';

interface AboutModelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModelModal: React.FC<AboutModelModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'methodology' | 'diagnostics' | 'industry'
  >('overview');

  if (!isOpen) return null;

  return (
    <div className={modalStyles.modalOverlay}>
      <div className={modalStyles.modalContent}>
        <button onClick={onClose} className={modalStyles.closeButton}>x</button>

        <h2 className={modalStyles.modalTitle}>CNN Subscription Bundle Simulator</h2>
        <p className={modalStyles.subtitle}>
          Powered by Hierarchical-Bayesian Choice-Modeling
        </p>

        {/* Tabs */}
        <div className={modalStyles.tabs}>
          {['overview','methodology','diagnostics','industry'].map(t => (
            <button
              key={t}
              className={`${modalStyles.tab} ${
                activeTab === t ? modalStyles.activeTab : ''
              }`}
              onClick={() => setActiveTab(t as typeof activeTab)}
            >
              {{
                overview: 'Model Overview',
                methodology: 'Advanced Methodology',
                diagnostics: 'Diagnostics',
                industry: 'Industry Benchmarks',
              }[t]}
            </button>
          ))}
        </div>

        <div className={modalStyles.contentArea}>
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className={modalStyles.tabContent}>
              <h3>Key Strengths at a Glance</h3>
              <div className={modalStyles.overviewGrid}>
                <div className={modalStyles.overviewCard}>
                  <div className={modalStyles.overviewIcon}></div>
                  <h4>Individual - Level Precision</h4>
                  <p>
                    Full posterior utility estimates for&nbsp;2,158 respondents
                    capture heterogeneity in price and feature preferences—
                    ideal for segmentation and scenario testing.
                  </p>
                </div>
                <div className={modalStyles.overviewCard}>
                  <div className={modalStyles.overviewIcon}></div>
                  <h4>Robust Convergence</h4>
                  <p>
                    Max&nbsp;R̂&nbsp;=1.008&nbsp;(target&nbsp;&lt;&nbsp;1.01)
                    with zero divergent transitions across 46 parameters,
                    confirming reliable estimation.
                  </p>
                </div>
                <div className={modalStyles.overviewCard}>
                  <div className={modalStyles.overviewIcon}></div>
                  <h4>Bridged Coverage</h4>
                  <p>
                    A two - vertical “bridge” design imputes the 40% unseen
                    data, yielding complete 10 vertical utility profiles while
                    flagging wider credible intervals for imputed cells.
                  </p>
                </div>
                <div className={modalStyles.overviewCard}>
                  <div className={modalStyles.overviewIcon}></div>
                  <h4>Expanded Feature Set</h4>
                  <p>
                    Calibrated Kano ratings extend the conjoint scale from
                    5&nbsp;tested attributes to 31, with &lt;5% loss in
                    hold - out fit.
                  </p>
                </div>
              </div>

              <dl className={modalStyles.keyStats}>
                <div className={modalStyles.stat}>
                  <dt className={modalStyles.statValue}>120,848</dt>
                  <dd className={modalStyles.statLabel}>Total Observations</dd>
                </div>
                <div className={modalStyles.stat}>
                  <dt className={modalStyles.statValue}>46</dt>
                  <dd className={modalStyles.statLabel}>Parameters</dd>
                </div>
                <div className={modalStyles.stat}>
                  <dt className={modalStyles.statValue}>15-25%</dt>
                  <dd className={modalStyles.statLabel}>
                    Lower Hold - out Error<sup>*</sup>
                  </dd>
                </div>
                <div className={modalStyles.stat}>
                  <dt className={modalStyles.statValue}>100%</dt>
                  <dd className={modalStyles.statLabel}>Utility Coverage</dd>
                </div>
              </dl>
              <p className={modalStyles.footnote}>
                <sup>*</sup>Vs. a pooled logit baseline on an 80/20 hold - out.
              </p>
            </div>
          )}

          {/* Methodology */}
          {activeTab === 'methodology' && (
            <div className={modalStyles.tabContent}>
              <h3>Hierarchical-Bayesian Choice (HBC) Model</h3>
              <p>
                Unlike aggregate conjoint, HBC estimates respondent - level
                coefficients while “borrowing strength” from the population
                hierarchy. This captures both common patterns and individual
                nuance.
              </p>
              <pre className={modalStyles.formula}>
{`Utility = β₀ + β₁ x ln(price) + β₂ x ln(price)² + Σ (βᵥ x verticals) + Σ (βf x features)` }
              </pre>

              <h3>Decision Response Normalization (DRN)</h3>
              <p>
                We estimate a personal conversion propensity&nbsp;(0.10-0.99)
                for each respondent, recognising “browsers” vs. “buyers” and
                reducing calibration error by up to 25%.
              </p>
              <p>
                <strong>Example:</strong> A 40% raw subscribe probability
                becomes 30% when DRN = .75.
              </p>

              <h3>Vertical Bridging</h3>
              <p>
                <em>Design&nbsp;challenge:</em> each respondent evaluated only
                6 of 10 verticals.<br/>
                <em>Solution:</em> two shared “bridge” verticals plus
                hierarchical shrinkage supply informed utilities for the
                remaining four.<br/>
                Result: complete 10 vertical vectors with explicit uncertainty
                bands.
              </p>

              <h3>Feature Calibration Extension</h3>
              <p>
                We map Kano style importance ratings onto the conjoint scale to
                extend coverage from 5 to 31 attributes, validated by a
                &lt;5% increase in RMSE on the hold - out sample.
              </p>
            </div>
          )}

          {/* Diagnostics */}
          {activeTab === 'diagnostics' && (
            <div className={modalStyles.tabContent}>
              <h3>Model Convergence Diagnostics</h3>
              <div className={modalStyles.diagnosticsGrid}>
                <div className={modalStyles.diagnosticItem}>
                  <div className={modalStyles.diagnosticLabel}>Max R̂</div>
                  <div className={modalStyles.diagnosticValue}>1.008</div>
                  <div className={modalStyles.diagnosticStatus}>
                    ✓ Within target&nbsp;&lt;&nbsp;1.01
                  </div>
                </div>
                <div className={modalStyles.diagnosticItem}>
                  <div className={modalStyles.diagnosticLabel}>Min Bulk ESS</div>
                  <div className={modalStyles.diagnosticValue}>1,001</div>
                  <div className={modalStyles.diagnosticStatus}>
                    ✓ Meets&nbsp;&gt;&nbsp;1,000
                  </div>
                </div>
                <div className={modalStyles.diagnosticItem}>
                  <div className={modalStyles.diagnosticLabel}>MinTail ESS</div>
                  <div className={modalStyles.diagnosticValue}>1,744</div>
                  <div className={modalStyles.diagnosticStatus}>
                    ✓ Meets&nbsp;&gt;&nbsp;1,000
                  </div>
                </div>
                <div className={modalStyles.diagnosticItem}>
                  <div className={modalStyles.diagnosticLabel}>
                    Divergent Transitions
                  </div>
                  <div className={modalStyles.diagnosticValue}>0</div>
                  <div className={modalStyles.diagnosticStatus}>
                    ✓ Ideal
                  </div>
                </div>
              </div>
              <p className={modalStyles.footnote}>
                Chains=4 • Draws per chain=4,000
              </p>
            </div>
          )}

          {/* Industry Benchmarks */}
          {activeTab === 'industry' && (
            <div className={modalStyles.tabContent}>
              <h3>How We Compare to Typical Baselines</h3>
              <table className={modalStyles.comparisonTable}>
                <thead>
                  <tr>
                    <th>Aspect</th>
                    <th>Typical Baseline*</th>
                    <th>Our Approach</th>
                    <th>Observed Gain</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Model granularity</td>
                    <td>Aggregate / 3 - Seg</td>
                    <td>2,158 Individuals</td>
                    <td className={modalStyles.advantage}> MAE15 - 25%</td>
                  </tr>
                  <tr>
                    <td>Estimation engine</td>
                    <td>Simple Logit</td>
                    <td>Hierarchical Bayes</td>
                    <td className={modalStyles.advantage}>
                      Captures heterogeneity
                    </td>
                  </tr>
                  <tr>
                    <td>Conversion scaling</td>
                    <td>One rate</td>
                    <td>Individual DRN</td>
                    <td className={modalStyles.advantage}>
                      Better calibration
                    </td>
                  </tr>
                  <tr>
                    <td>Handling missing&nbsp;data</td>
                    <td>Drop / Average</td>
                    <td>Bridging algorithm</td>
                    <td className={modalStyles.advantage}>100% coverage</td>
                  </tr>
                  <tr>
                    <td>Attributes in scope</td>
                    <td>5 - 10 features</td>
                    <td>31 features</td>
                    <td className={modalStyles.advantage}>6x span</td>
                  </tr>
                  <tr>
                    <td>Market factors</td>
                    <td>Black box</td>
                    <td>Transparent, adjustable</td>
                    <td className={modalStyles.advantage}>Client control</td>
                  </tr>
                </tbody>
              </table>
              <p className={modalStyles.footnote}>
                *Based on published conjoint case studies and vendor
                documentation, 2023 - 2025.
              </p>

              <div className={modalStyles.bottomLine}>
                <h4>The Bottom Line</h4>
                <p>
                  This platform goes beyond survey analysis. It combines robust
                  HB estimation, missing - data bridging, DRN scaling, and
                  feature - calibrated utilities to deliver one of the most
                  accurate and flexible subscription simulators we have
                  benchmarked.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutModelModal;