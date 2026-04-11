
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Check, X, RotateCcw, Sparkles, Trophy } from 'lucide-react';

interface FlashCard {
  id: number;
  question: string;
  answer: string;
}

const questionBank: FlashCard[] = [
  // Maths
  { id: 1, question: 'What is 5 + 3?', answer: '8' },
  { id: 2, question: 'What is 9 - 4?', answer: '5' },
  { id: 3, question: 'What is 6 × 2?', answer: '12' },
  { id: 4, question: 'What is 15 ÷ 3?', answer: '5' },
  { id: 5, question: 'What is 7 + 8?', answer: '15' },
  // Geography
  { id: 6, question: 'Capital of France?', answer: 'Paris' },
  { id: 7, question: 'Capital of Spain?', answer: 'Madrid' },
  { id: 8, question: 'Capital of Italy?', answer: 'Rome' },
  { id: 9, question: 'Capital of Germany?', answer: 'Berlin' },
  { id: 10, question: 'Which ocean is the largest?', answer: 'Pacific' },
  // Science
  { id: 11, question: 'H₂O is the formula for?', answer: 'Water' },
  { id: 12, question: 'What planet is closest to the Sun?', answer: 'Mercury' },
  { id: 13, question: 'How many legs does a spider have?', answer: '8' },
  { id: 14, question: 'What gas do plants breathe in?', answer: 'CO₂' },
  { id: 15, question: 'What is the centre of an atom called?', answer: 'Nucleus' },
  // English
  { id: 16, question: "What is the plural of 'child'?", answer: 'Children' },
  { id: 17, question: 'What punctuation ends a question?', answer: '?' },
  { id: 18, question: "Is 'quickly' a noun or adverb?", answer: 'Adverb' },
  // History
  { id: 19, question: 'Who was the first man on the Moon?', answer: 'Neil Armstrong' },
  { id: 20, question: 'In which year did WW2 end?', answer: '1945' },
];

function getRandomQuestions(count: number): FlashCard[] {
  const shuffled = [...questionBank].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function InteractiveDemo() {
  const [demoCards, setDemoCards] = useState<FlashCard[]>(() => getRandomQuestions(3));
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<number[]>([]);
  const [answerResults, setAnswerResults] = useState<Record<number, boolean>>({});
  const [showCelebration, setShowCelebration] = useState(false);

  const card = demoCards[currentCard];
  const isComplete = answered.length === demoCards.length;

  const handleAnswer = (correct: boolean) => {
    if (answered.includes(currentCard)) return;

    setAnswered([...answered, currentCard]);
    setAnswerResults((prev) => ({ ...prev, [currentCard]: correct }));
    if (correct) {
      setScore(score + 1);
    }

    if (answered.length + 1 === demoCards.length) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 2000);
    } else {
      setTimeout(() => {
        setIsFlipped(false);
        setTimeout(() => {
          setCurrentCard((currentCard + 1) % demoCards.length);
        }, 400);
      }, 600);
    }
  };

  const reset = () => {
    setDemoCards(getRandomQuestions(3));
    setCurrentCard(0);
    setIsFlipped(false);
    setScore(0);
    setAnswered([]);
    setAnswerResults({});
  };

  return (
    <section className="py-16 md:py-20 bg-background relative overflow-hidden">
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Decorative shapes */}
      <div className="absolute top-10 left-[10%] w-24 h-24 rounded-full bg-accent/10 blur-2xl" />
      <div className="absolute bottom-10 right-[15%] w-32 h-32 rounded-full bg-secondary/10 blur-2xl" />

      <div className="container relative">
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-coral text-coral-foreground text-sm font-medium mb-4"
          >
            <Sparkles className="w-4 h-4" />
            Try it yourself
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Experience Studybug in Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Flip the cards and test your knowledge. This is just a taste of our interactive
            learning!
          </p>
        </div>

        <div className="max-w-md mx-auto">
          {/* Progress */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-1">
              {demoCards.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-8 h-2 rounded-full transition-colors ${
                    answered.includes(idx)
                      ? answerResults[idx]
                        ? 'bg-success'
                        : 'bg-coral'
                      : idx === currentCard
                        ? 'bg-secondary'
                        : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Trophy className="w-4 h-4 text-coral" />
              {score}/{demoCards.length}
            </div>
          </div>

          {/* Card */}
          <div style={{ perspective: '1000px' }} className="mb-6">
            <motion.div
              className="relative w-full aspect-[4/3] cursor-pointer"
              onClick={() => !answered.includes(currentCard) && setIsFlipped(!isFlipped)}
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front */}
              <div
                className="absolute inset-0 w-full h-full rounded-3xl bg-secondary p-8 flex flex-col items-center justify-center shadow-xl"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className="text-xs uppercase tracking-wider text-white/60 mb-4">
                  Question {currentCard + 1}
                </span>
                <h3 className="text-2xl md:text-3xl font-bold text-white text-center">
                  {card.question}
                </h3>
                <span className="text-sm text-white/60 mt-6">Tap to reveal answer</span>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 w-full h-full rounded-3xl bg-card border-2 border-secondary p-8 flex flex-col items-center justify-center shadow-xl"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <span className="text-xs uppercase tracking-wider text-muted-foreground mb-4">
                  Answer
                </span>
                <h3 className="text-3xl md:text-4xl font-bold text-foreground text-center">
                  {card.answer}
                </h3>
              </div>
            </motion.div>
          </div>

          {/* Actions */}
          <AnimatePresence mode="wait">
            {isComplete ? (
              <motion.div
                key="complete"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Trophy className="w-6 h-6 text-coral" />
                  <span className="text-xl font-bold text-foreground">
                    {score === demoCards.length ? 'Perfect Score!' : 'Great job!'}
                  </span>
                </div>
                <Button onClick={reset} variant="outline" className="mr-2">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </motion.div>
            ) : isFlipped && !answered.includes(currentCard) ? (
              <motion.div
                key="answer-buttons"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex gap-4 justify-center"
              >
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => handleAnswer(false)}
                  className="flex-1 border-coral text-coral hover:bg-coral hover:text-white"
                >
                  <X className="w-5 h-5 mr-2" />
                  Got it wrong
                </Button>
                <Button
                  size="lg"
                  onClick={() => handleAnswer(true)}
                  className="flex-1 bg-success text-white hover:bg-success/90"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Got it right
                </Button>
              </motion.div>
            ) : (
              <motion.p
                key="instruction"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-muted-foreground"
              >
                Tap the card to reveal the answer
              </motion.p>
            )}
          </AnimatePresence>

          {/* Celebration overlay */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
              >
                <div className="text-6xl">🎉</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
