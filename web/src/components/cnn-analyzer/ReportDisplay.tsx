"use client";

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import type { ReportData, ReportType, OutputType } from '@/lib/types';

interface ReportDisplayProps {
  reportData: ReportData | null;
  reportType: ReportType;
  outputType: OutputType;
}

export default function ReportDisplay({ reportData, reportType, outputType }: ReportDisplayProps) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (reportData) {
      setShowModal(true);
    }
  }, [reportData]);

  if (!reportData) {
    return null;
  }

  const TAM = 105624640;
  const { 
    products = [], 
    segmentShares = [], 
    overallShare = [], 
    anyProductShare = 0,
    monthlyPercentages = [],
    annualPercentages = []
  } = reportData;
  
  const productNames = products.map((p: any) => p.product || p.name) || ['CNN Reader', 'CNN All-Access'];
  const isTiered = reportType === 'tiered';
  
  // Calculate Any Product from individual products
  const calculatedAnyProduct = isTiered && overallShare.length >= 2 
    ? Math.min(overallShare[0] + overallShare[1], 100) 
    : anyProductShare;
  
  const formatValue = (value: number | undefined): string => {
    return value !== undefined ? `${value.toFixed(1)}%` : '--';
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  const formatRevenue = (num: number): string => {
    return `$${num.toLocaleString()}`;
  };

  const getReportTitle = () => {
    const typeLabel = reportType === 'tiered' ? 'Tiered Bundles' : 'Independent Products';
    return `Simulation Report - Take Rates (%) (${typeLabel})`;
  };

  // Calculate populations and revenue
  const anyProductPop = Math.round(TAM * calculatedAnyProduct / 100);
  const productPops = overallShare.map(share => Math.round(TAM * share / 100));
  
  const avgRevPerSub = 54;
  const anyProductRev = anyProductPop * avgRevPerSub;
  const productRevs = productPops.map(pop => pop * avgRevPerSub);

  // If monthly/annual data not provided, estimate (70/30 split is typical)
  const monthlyPcts = monthlyPercentages.length ? monthlyPercentages : overallShare.map(share => share * 0.7);
  const annualPcts = annualPercentages.length ? annualPercentages : overallShare.map(share => share * 0.3);

  const downloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    const headers = ["Segment"];
    if (isTiered) headers.push("Any Product");
    headers.push(...productNames);
    csvContent += headers.join(",") + "\n";

    const rateRow = ["Take rate within TAM"];
    if (isTiered) rateRow.push(formatValue(calculatedAnyProduct));
    rateRow.push(...overallShare.map(formatValue));
    csvContent += rateRow.join(",") + "\n";

    const popRow = ["Population Size"];
    if (isTiered) popRow.push(formatNumber(anyProductPop));
    popRow.push(...productPops.map(formatNumber));
    csvContent += popRow.join(",") + "\n";

    const revRow = ["Estimated Yr 1 Revenue"];
    if (isTiered) revRow.push(formatRevenue(anyProductRev));
    revRow.push(...productRevs.map(formatRevenue));
    csvContent += revRow.join(",") + "\n";

    const monthlyRow = ["Chose Monthly"];
    if (isTiered) monthlyRow.push("--");
    monthlyRow.push(...monthlyPcts.map(formatValue));
    csvContent += monthlyRow.join(",") + "\n";

    const annualRow = ["Chose Annual (50% off)"];
    if (isTiered) annualRow.push("--");
    annualRow.push(...annualPcts.map(formatValue));
    csvContent += annualRow.join(",") + "\n";

    segmentShares.forEach(segment => {
      const row = [segment.segmentName];
      if (isTiered) {
        const segmentAnyProduct = segment.shares.length >= 2 
          ? Math.min(segment.shares[0] + segment.shares[1], 100)
          : 0;
        row.push(formatValue(segmentAnyProduct));
      }
      row.push(...segment.shares.map(formatValue));
      csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cnn_simulation_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ReportTable = () => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 border-b-4 border-gray-400">
            <TableHead className="min-w-[350px] font-bold text-gray-900 text-base uppercase tracking-wider sticky left-0 bg-gray-100 z-10 py-6 px-8">
              Segment
            </TableHead>
            {isTiered && (
              <TableHead className="min-w-[200px] text-center font-bold bg-blue-100 text-gray-900 text-base uppercase tracking-wider py-6">
                Any Product
              </TableHead>
            )}
            {productNames.map((name: string, i: number) => (
              <TableHead key={i} className="min-w-[200px] text-center font-bold text-gray-900 text-base uppercase tracking-wider py-6">
                {name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* ESTIMATED TAKE RATES SECTION */}
          <TableRow className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
            <TableCell colSpan={productNames.length + (isTiered ? 2 : 1)} className="font-bold text-center text-xl py-6">
              ESTIMATED TAKE RATES
            </TableCell>
          </TableRow>
          
          <TableRow className="bg-blue-50 border-b-2">
            <TableCell className="font-bold text-lg sticky left-0 bg-blue-50 z-10 py-5 px-8">Take rate within TAM</TableCell>
            {isTiered && <TableCell className="text-center font-bold text-xl text-blue-700 py-5">{formatValue(calculatedAnyProduct)}</TableCell>}
            {overallShare.map((share, i) => (
              <TableCell key={i} className="text-center font-bold text-xl py-5">{formatValue(share)}</TableCell>
            ))}
          </TableRow>
          
          <TableRow className="bg-gray-50">
            <TableCell className="font-semibold sticky left-0 bg-gray-50 z-10 py-5 px-8">Population Size</TableCell>
            {isTiered && <TableCell className="text-center text-blue-700 font-medium py-5">{formatNumber(anyProductPop)}</TableCell>}
            {productPops.map((pop, i) => (
              <TableCell key={i} className="text-center py-5">{formatNumber(pop)}</TableCell>
            ))}
          </TableRow>
          
          <TableRow className="bg-gray-50">
            <TableCell className="font-semibold sticky left-0 bg-gray-50 z-10 py-5 px-8">Estimated Yr 1 Revenue</TableCell>
            {isTiered && <TableCell className="text-center text-blue-700 font-medium py-5">{formatRevenue(anyProductRev)}</TableCell>}
            {productRevs.map((rev, i) => (
              <TableCell key={i} className="text-center py-5">{formatRevenue(rev)}</TableCell>
            ))}
          </TableRow>

          {/* NEW: Monthly vs Annual Split */}
          <TableRow className="bg-gray-50">
            <TableCell className="font-semibold sticky left-0 bg-gray-50 z-10 py-5 px-8">Chose Monthly</TableCell>
            {isTiered && <TableCell className="text-center py-5">--</TableCell>}
            {monthlyPcts.map((pct: number, i: number) => (
              <TableCell key={i} className="text-center py-5">{formatValue(pct)}</TableCell>
            ))}
          </TableRow>

          <TableRow className="bg-gray-50 border-b-4 border-gray-300">
            <TableCell className="font-semibold sticky left-0 bg-gray-50 z-10 py-5 px-8">Chose Annual (50% off)</TableCell>
            {isTiered && <TableCell className="text-center py-5">--</TableCell>}
            {annualPcts.map((pct: number, i: number) => (
              <TableCell key={i} className="text-center py-5">{formatValue(pct)}</TableCell>
            ))}
          </TableRow>

          {/* BIG SPACER */}
          <TableRow>
            <TableCell colSpan={productNames.length + (isTiered ? 2 : 1)} className="py-8 bg-white"></TableCell>
          </TableRow>

          {/* KEY SUB GROUPS SECTION */}
          <TableRow className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
            <TableCell colSpan={productNames.length + (isTiered ? 2 : 1)} className="font-bold text-center text-xl py-6">
              TAKE RATES AMONG KEY SUB GROUPS
            </TableCell>
          </TableRow>

          {/* Gender Section */}
          {['Male', 'Female'].map((segmentName, idx) => {
            const segment = segmentShares?.find(s => s.segmentName === segmentName);
            if (!segment) return null;
            
            const segmentAnyProduct = isTiered && segment.shares.length >= 2 
              ? Math.min(segment.shares[0] + segment.shares[1], 100)
              : 0;

            return (
              <TableRow key={segmentName} className="hover:bg-gray-50 transition-colors border-b">
                <TableCell className="font-medium sticky left-0 bg-white z-10 py-5 px-8 text-base">
                  {segmentName}
                </TableCell>
                {isTiered && (
                  <TableCell className="text-center bg-blue-50/50 py-5 text-base font-medium">
                    {formatValue(segmentAnyProduct)}
                  </TableCell>
                )}
                {segment.shares.map((share, i) => (
                  <TableCell key={i} className="text-center py-5 text-base">{formatValue(share)}</TableCell>
                ))}
              </TableRow>
            );
          })}

          {/* BIG SPACER BEFORE AGE */}
          <TableRow>
            <TableCell colSpan={productNames.length + (isTiered ? 2 : 1)} className="py-6 bg-gray-100"></TableCell>
          </TableRow>

          {/* AGE Section Header */}
          <TableRow className="bg-gray-300">
            <TableCell colSpan={productNames.length + (isTiered ? 2 : 1)} className="font-bold text-center py-4 text-lg">
              AGE
            </TableCell>
          </TableRow>
          
          {['18-34', '35-54', '55-74'].map(segmentName => {
            const segment = segmentShares?.find(s => s.segmentName === segmentName);
            if (!segment) return null;
            
            const segmentAnyProduct = isTiered && segment.shares.length >= 2 
              ? Math.min(segment.shares[0] + segment.shares[1], 100)
              : 0;

            return (
              <TableRow key={segmentName} className="hover:bg-gray-50 transition-colors border-b">
                <TableCell className="font-medium pl-12 sticky left-0 bg-white z-10 py-5 text-base">
                  {segmentName}
                </TableCell>
                {isTiered && (
                  <TableCell className="text-center bg-blue-50/50 py-5 text-base font-medium">
                    {formatValue(segmentAnyProduct)}
                  </TableCell>
                )}
                {segment.shares.map((share, i) => (
                  <TableCell key={i} className="text-center py-5 text-base">{formatValue(share)}</TableCell>
                ))}
              </TableRow>
            );
          })}

          {/* BIG SPACER */}
          <TableRow>
            <TableCell colSpan={productNames.length + (isTiered ? 2 : 1)} className="py-6 bg-gray-100"></TableCell>
          </TableRow>

          {/* Linear TV Section */}
          {['Have Linear TV', 'No Linear TV'].map(segmentName => {
            const segment = segmentShares?.find(s => s.segmentName === segmentName);
            if (!segment) return null;
            
            const segmentAnyProduct = isTiered && segment.shares.length >= 2 
              ? Math.min(segment.shares[0] + segment.shares[1], 100)
              : 0;

            return (
              <TableRow key={segmentName} className="hover:bg-gray-50 transition-colors border-b">
                <TableCell className="font-medium sticky left-0 bg-white z-10 py-5 px-8 text-base">
                  {segmentName}
                </TableCell>
                {isTiered && (
                  <TableCell className="text-center bg-blue-50/50 py-5 text-base font-medium">
                    {formatValue(segmentAnyProduct)}
                  </TableCell>
                )}
                {segment.shares.map((share, i) => (
                  <TableCell key={i} className="text-center py-5 text-base">{formatValue(share)}</TableCell>
                ))}
              </TableRow>
            );
          })}

          {/* BIG SPACER */}
          <TableRow>
            <TableCell colSpan={productNames.length + (isTiered ? 2 : 1)} className="py-6 bg-gray-100"></TableCell>
          </TableRow>

          {/* Digital News Section */}
          {['Digital News Subscriber', 'Not Digital News Subscriber'].map(segmentName => {
            const segment = segmentShares?.find(s => s.segmentName === segmentName);
            if (!segment) return null;
            
            const segmentAnyProduct = isTiered && segment.shares.length >= 2 
              ? Math.min(segment.shares[0] + segment.shares[1], 100)
              : 0;

            return (
              <TableRow key={segmentName} className="hover:bg-gray-50 transition-colors border-b">
                <TableCell className="font-medium sticky left-0 bg-white z-10 py-5 px-8 text-base">
                  {segmentName}
                </TableCell>
                {isTiered && (
                  <TableCell className="text-center bg-blue-50/50 py-5 text-base font-medium">
                    {formatValue(segmentAnyProduct)}
                  </TableCell>
                )}
                {segment.shares.map((share, i) => (
                  <TableCell key={i} className="text-center py-5 text-base">{formatValue(share)}</TableCell>
                ))}
              </TableRow>
            );
          })}

          {/* BIG SPACER BEFORE CNN ENGAGEMENT */}
          <TableRow>
            <TableCell colSpan={productNames.length + (isTiered ? 2 : 1)} className="py-6 bg-gray-100"></TableCell>
          </TableRow>

          {/* CNN ENGAGEMENT Section Header */}
          <TableRow className="bg-gray-300">
            <TableCell colSpan={productNames.length + (isTiered ? 2 : 1)} className="font-bold text-center py-4 text-lg">
              CNN ENGAGEMENT
            </TableCell>
          </TableRow>
          
          {['Watched Linear TV Network P30D', 'Accessed CNN.com P30D', 'Regularly Access CNN', 'Occasionally Access CNN', 'Rarely Access CNN'].map(segmentName => {
            const segment = segmentShares?.find(s => s.segmentName === segmentName);
            if (!segment) return null;
            
            const segmentAnyProduct = isTiered && segment.shares.length >= 2 
              ? Math.min(segment.shares[0] + segment.shares[1], 100)
              : 0;

            return (
              <TableRow key={segmentName} className="hover:bg-gray-50 transition-colors border-b">
                <TableCell className="font-medium pl-12 sticky left-0 bg-white z-10 py-5 text-base">
                  {segmentName}
                </TableCell>
                {isTiered && (
                  <TableCell className="text-center bg-blue-50/50 py-5 text-base font-medium">
                    {formatValue(segmentAnyProduct)}
                  </TableCell>
                )}
                {segment.shares.map((share, i) => (
                  <TableCell key={i} className="text-center py-5 text-base">{formatValue(share)}</TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

  // Modal view when report is generated
  if (showModal) {
    return (
      <>
        {/* Dark overlay */}
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40" onClick={() => setShowModal(false)} />
        
        {/* Modal centered on screen */}
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-7xl max-h-[90vh] bg-white rounded-lg shadow-2xl flex flex-col">
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white px-8 py-6 rounded-t-lg flex justify-between items-center">
            <h2 className="text-3xl font-bold">{getReportTitle()}</h2>
            <div className="flex gap-4">
              <Button 
                variant="secondary" 
                size="default" 
                onClick={downloadCSV}
                className="bg-white hover:bg-gray-100 text-gray-800 px-6 py-2"
              >
                <Download className="mr-2 h-5 w-5" />
                Download CSV
              </Button>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-300 transition-colors p-2"
              >
                <X className="h-8 w-8" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <ReportTable />
          </div>
        </div>
      </>
    );
  }

  // Bottom card view (only when modal is closed)
  return (
    <Card className="mt-6 shadow-xl border-0">
      <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl font-bold">{getReportTitle()}</CardTitle>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setShowModal(true)}
          >
            View Report
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 max-h-96 overflow-auto">
        <ReportTable />
      </CardContent>
    </Card>
  );
}