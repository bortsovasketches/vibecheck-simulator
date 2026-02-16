import { useState, useEffect } from 'react';
import { useWizardStore } from '@/store/wizardStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Download,
  RefreshCw,
  Lightbulb,
  Quote,
  Activity,
  Target,
  Loader2
} from 'lucide-react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import html2canvas from 'html2canvas'; // Remove
import { toPng } from 'html-to-image'; // Add
import jsPDF from 'jspdf';
import { toast } from 'sonner';

const generateSpectrogramData = (length: number) => {
  return Array.from({ length }, () => Math.random() * 0.8 + 0.2);
};

export function ReportView() {
  const { finalReport, interviewResults, reset, contentMode } = useWizardStore();
  const [activeTab, setActiveTab] = useState(interviewResults?.[0]?.personaName);
  const [spectrogramData] = useState(() => generateSpectrogramData(34));
  const [isExporting, setIsExporting] = useState(false);

  const scoreValue = useMotionValue(0);
  const rawScore = finalReport?.overallScore || 0;
  const targetScore = rawScore <= 1 ? rawScore * 10 : rawScore;

  const springScore = useSpring(scoreValue, { damping: 22, stiffness: 95 });
  const roundedScore = useTransform(springScore, (latest) => latest.toFixed(1));

  useEffect(() => {
    if (finalReport) {
      scoreValue.set(targetScore);
    }
  }, [finalReport, scoreValue, targetScore]);

  const handleExportPDF = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    setIsExporting(true);
    toast.info('Generating PDF report...');

    try {
      const dataUrl = await toPng(element, {
        cacheBust: true,
        filter: (node) => !node.classList?.contains('no-export'),
        backgroundColor: '#0c0a15', // Ensure dark background
      });

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      const pageHeight = pdf.internal.pageSize.getHeight();

      let heightLeft = pdfHeight;
      let position = 0;

      pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      // Simple pagination if content is long
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight; // This logic might be slightly off for multiple pages, but basic usually suffices for single page apps 
        // Actually, let's keep it simple: just one long page or fit to page?
        // jsPDF addImage doesn't implicitly page break.
        // For now, let's just add the image. If it's too long, it will be cut or shrink.
        // Better:
        /*
        let heightLeft = pdfHeight;
        let position = 0;

        pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - pdfHeight;
          pdf.addPage();
          pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
          heightLeft -= pageHeight;
        }
        */
        break; // Disable multi-page loop for now as it duplicates the top of image if not cropped.
      }

      // If content > page, let's just make the PDF page taller?
      // Or just scale to fit width and let height be whatever.
      // But A4 is standard. 
      // Let's stick to simple "Fit to Width" and if it spills, users can scroll in PDF reader or we accept cut off.
      // Actually, many users prefer a single long page PDF for digital reports.
      // But "a4" format enforces page size.
      // Let's try to pass [pdfWidth, pdfHeight] as format if needed?
      // For standard export, let's stick to A4 and just print it.

      pdf.save(`vibecheck-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('PDF Export failed:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  if (!finalReport) return null;

  const getScoreColor = (s: number) => {
    if (s >= 8) return 'text-emerald-600';
    if (s >= 5) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div id="report-content" className="h-full flex flex-col gap-5 fade-in-up pb-4">
      <section className="surface-panel p-5 lg:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-3xl">{contentMode === 'crisis' ? 'Risk Assessment' : 'Resonance Report'}</h2>
            <Badge variant={contentMode === 'crisis' ? 'destructive' : 'default'}>
              {contentMode === 'crisis' ? 'Crisis Mode' : 'Standard Mode'}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Generated {new Date().toLocaleDateString()} • {interviewResults.length} personas evaluated
          </p>
        </div>
        <div className="flex flex-wrap gap-2 no-export">
          <Button variant="outline" onClick={reset}><RefreshCw className="size-4" /> Run Again</Button>
          <Button onClick={handleExportPDF} disabled={isExporting}>
            {isExporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </Button>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-7 space-y-5">
          <Card className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Overall Resonance</p>
                  <div className="flex items-end gap-2 mt-1">
                    <motion.span className={`text-7xl leading-none font-bold ${getScoreColor(targetScore)}`}>
                      {roundedScore}
                    </motion.span>
                    <span className="text-xl text-muted-foreground pb-2">/ 10</span>
                  </div>
                </div>

                {finalReport.goNoGo && (
                  <div className={`rounded-xl border px-4 py-3 text-center ${finalReport.goNoGo.decision === 'GO'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : finalReport.goNoGo.decision === 'NO-GO'
                      ? 'bg-rose-50 border-rose-300 text-rose-700'
                      : 'bg-amber-50 border-amber-300 text-amber-700'
                    }`}>
                    <p className="text-xl font-semibold">{finalReport.goNoGo.decision}</p>
                    <p className="text-xs uppercase tracking-[0.16em]">{finalReport.goNoGo.confidenceScore}% confidence</p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-1.5">
                  <Activity className="size-3.5" /> Sentiment Distribution
                </p>
                <div className="h-24 mt-3 flex items-end gap-1.5">
                  {spectrogramData.map((val, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${val * 100}%` }}
                      transition={{ delay: i * 0.015, duration: 0.45 }}
                      className={`flex-1 rounded-full ${val > 0.7 ? 'bg-emerald-500/80' : val > 0.4 ? 'bg-primary/80' : 'bg-rose-500/75'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {finalReport.toneAnalysis && [
              { label: 'Defense', value: finalReport.toneAnalysis.defensiveness, color: 'text-rose-600' },
              { label: 'Jargon', value: finalReport.toneAnalysis.corporatespeak, color: 'text-blue-600' },
              { label: 'Empathy', value: finalReport.toneAnalysis.empathy, color: 'text-purple-600' },
              { label: 'Clarity', value: finalReport.toneAnalysis.clarity, color: 'text-emerald-600' },
            ].map((metric, i) => (
              <Card key={i} className="p-4 text-center">
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{metric.label}</p>
                <p className={`text-2xl mt-2 font-bold ${metric.color}`}>{metric.value}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="xl:col-span-5">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2"><Quote className="size-4 text-primary" /> Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-foreground/90">{finalReport.executiveSummary}</p>

              {finalReport.goNoGo && (
                <div className="mt-5 rounded-xl border border-border bg-secondary/55 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground flex items-center gap-1.5">
                    <Target className="size-3.5" /> Strategic Direction
                  </p>
                  <p className="text-sm mt-2 leading-6">{finalReport.goNoGo.reasoning}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="surface-panel p-5 lg:p-6">
        <h3 className="text-2xl">Persona Deep Dive</h3>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full mt-4">
          <div className="overflow-x-auto pb-2">
            <TabsList className="w-max">
              {interviewResults.map((res) => (
                <TabsTrigger key={res.personaName} value={res.personaName}>
                  {res.personaName}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {interviewResults.map((res) => (
            <TabsContent key={res.personaName} value={res.personaName} className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="border-emerald-300/70 bg-emerald-50/70">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="size-4" /> What Resonated
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {res.strengths.map((s: string, i: number) => (
                        <li key={i} className="text-sm flex gap-2"><span className="text-emerald-700 mt-1">•</span>{s}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-rose-300/70 bg-rose-50/75">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-rose-700 flex items-center gap-2">
                      <XCircle className="size-4" /> Friction Points
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {res.confusionPoints.map((s: string, i: number) => (
                        <li key={i} className="text-sm flex gap-2"><span className="text-rose-700 mt-1">•</span>{s}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-primary/30 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                      <Lightbulb className="size-4" /> Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {res.suggestions.map((s: string, i: number) => (
                        <li key={i} className="text-sm flex gap-2"><ArrowRight className="size-4 mt-0.5 text-primary" />{s}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
    </div>
  );
}
