'use client';

import { useEffect } from 'react';
import * as d3 from 'd3';

interface SEMVisualizationProps {
  // If you ever want to drive “facebook” vs “allapps” from props, you can add those here.
}

export default function SEMVisualization(_: SEMVisualizationProps) {
  useEffect(() => {
    createSEMVisualization();
  }, []);

  return (
    <div id="semVisualization" className="w-full h-[600px]">
      {/* D3 will append child <div> blocks inside here */}
    </div>
  );
}

/**
 * This function uses D3 to draw two separate SEM charts (Facebook and All Apps).
 * It finds the <div id="semVisualization">, clears it, and then appends two child <div> containers (one for Facebook, one for All Apps).
 * In each child, it calls createSingleSEM(…) with either "facebook" or "allapps" as the argument.
 */
function createSEMVisualization() {
  const container = document.getElementById('semVisualization');
  if (!container) return;

  // Clear out anything that might already be there
  container.innerHTML = '';

  // Use D3 to select that container
  const mainDiv = d3.select('#semVisualization');

  // ——— Facebook SEM block ———
  const fbDiv = mainDiv.append('div')
    .style('margin-bottom', '50px');

  fbDiv.append('h3')
    .style('text-align', 'center')
    .style('color', '#7434ac')
    .style('font-size', '24px')
    .style('margin-bottom', '20px')
    .text('Facebook SEM Paths');

  createSingleSEM(fbDiv, 'facebook');

  // ——— ALL APPS SEM block ———
  const allAppsDiv = mainDiv.append('div');

  allAppsDiv.append('h3')
    .style('text-align', 'center')
    .style('color', '#7434ac')
    .style('font-size', '24px')
    .style('margin-bottom', '20px')
    .text('ALL APPS (Industry Average) SEM Paths');

  createSingleSEM(allAppsDiv, 'allapps');
}

/**
 * Builds the SEM paths for a given `type` under the container `parentDiv`.
 *
 * @param parentDiv A d3.Selection representing a <div> into which you append SVGs or other elements.
 * @param type      A string ("facebook" or "allapps") that your code will use to pick the correct data set.
 */
function createSingleSEM(
  parentDiv: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>,
  type: 'facebook' | 'allapps'
) {
  const width = 600;
  const height = 300;

  // Clear any existing SVG in this div (just in case)
  parentDiv.selectAll('svg').remove();

  const svg = parentDiv
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .style('border', '1px solid #ddd');

  // Suppose you have data files at /public/data/sem_facebook.json and /public/data/sem_allapps.json
  d3.json(`/data/sem_${type}.json`).then((data: any) => {
    // Example schema: data = { nodes: [{ id, label, x, y }], links: [{ source, target }] }
    if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.links)) {
      if (DEBUG_MODE) console.warn(`Malformed SEM data for ${type}`, data);
      svg.append('text') // Add a message to the SVG if data is bad or not found
         .attr('x', width / 2)
         .attr('y', height / 2)
         .attr('text-anchor', 'middle')
         .text(`Error: Could not load or parse data for ${type}`);
      return;
    }

    // Draw links first
    svg
      .append('g')
      .selectAll('line')
      .data(data.links)
      .join('line')
      .attr('x1', (d: any) => data.nodes.find((n: any) => n.id === d.source)?.x || 0) // Added fallback for safety
      .attr('y1', (d: any) => data.nodes.find((n: any) => n.id === d.source)?.y || 0) // Added fallback for safety
      .attr('x2', (d: any) => data.nodes.find((n: any) => n.id === d.target)?.x || 0) // Added fallback for safety
      .attr('y2', (d: any) => data.nodes.find((n: any) => n.id === d.target)?.y || 0) // Added fallback for safety
      .attr('stroke', '#bbb')
      .attr('stroke-width', 1.5);

    // Draw nodes on top
    svg
      .append('g')
      .selectAll('circle')
      .data(data.nodes)
      .join('circle')
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y)
      .attr('r', 8)
      .attr('fill', type === 'facebook' ? '#3b5998' : '#ff9900');

    // Add labels
    svg
      .append('g')
      .selectAll('text')
      .data(data.nodes)
      .join('text')
      .attr('x', (d: any) => d.x + 12)
      .attr('y', (d: any) => d.y + 4)
      .text((d: any) => d.label)
      .attr('font-size', '12px')
      .attr('fill', '#333');
  }).catch(error => {
    if (DEBUG_MODE) console.error(`Error loading SEM data for ${type}:`, error);
    svg.append('text') // Add a message to the SVG if data loading fails
       .attr('x', width / 2)
       .attr('y', height / 2)
       .attr('text-anchor', 'middle')
       .text(`Error: Failed to load data for ${type}`);
  });
}
