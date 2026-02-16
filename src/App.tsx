import { AppLayout } from '@/components/layout/AppLayout';
import { ApiKeyStep } from '@/components/wizard/ApiKeyStep';
import { useWizardStore } from '@/store/wizardStore';
import { ContentInputStep } from '@/components/wizard/ContentInputStep';
import { PersonaSelectionStep } from '@/components/wizard/PersonaSelectionStep';
import { AnalysisView } from '@/components/wizard/AnalysisView';
import { ReportView } from '@/components/wizard/ReportView';
import { Toaster } from '@/components/ui/sonner';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const { currentStep } = useWizardStore();

  const renderStep = () => {
    switch (currentStep) {
      case 'api-key':
        return <ApiKeyStep />;
      case 'content-input':
        return <ContentInputStep />;
      case 'persona-selection':
        return <PersonaSelectionStep />;
      case 'analysis':
        return <AnalysisView />;
      case 'report':
        return <ReportView />;
      default:
        return <ApiKeyStep />;
    }
  };

  return (
    <>
      <AppLayout>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </AppLayout>
      <Toaster />
    </>
  );
}

export default App;
