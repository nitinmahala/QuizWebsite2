"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { quizData } from "@/lib/quiz-data"
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  HelpCircle,
  ArrowLeft,
  Clock,
  Flag,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti"

export default function QuizPage({ params }: { params: { topic: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const decodedTopic = decodeURIComponent(params.topic)

  const [studentName, setStudentName] = useState("")
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([])
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<number[]>([])
  const [showHint, setShowHint] = useState(false)
  const [difficulty, setDifficulty] = useState("medium")
  const [previousAttempts, setPreviousAttempts] = useState<number>(0)
  const [bestScore, setBestScore] = useState<number>(0)
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null)
  const [isAnswerChecked, setIsAnswerChecked] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  // Initialize quiz data
  useEffect(() => {
    const topicData = quizData.find((quiz) => quiz.topic === decodedTopic)

    if (!topicData) {
      toast({
        title: "Topic not found",
        description: "The selected quiz topic doesn't exist",
        variant: "destructive",
      })
      router.push("/")
      return
    }

    // Add hints to questions if they don't exist
    const questionsWithHints = topicData.questions.map((q) => ({
      ...q,
      hint: q.hint || `Think about the core concepts of ${decodedTopic} related to this question.`,
    }))

    setQuestions(questionsWithHints)

    // Initialize selected answers array with empty strings
    setSelectedAnswers(new Array(questionsWithHints.length).fill(""))

    // Get student name from localStorage
    const name = localStorage.getItem("studentName")
    if (name) {
      setStudentName(name)
    } else {
      router.push("/")
    }

    // Load bookmarked questions from localStorage
    const bookmarked = JSON.parse(localStorage.getItem(`bookmarked_${decodedTopic}`) || "[]")
    setBookmarkedQuestions(bookmarked)

    // Load previous attempts data
    const results = JSON.parse(localStorage.getItem("quizResults") || "[]")
    const topicResults = results.filter((r: any) => r.topic === decodedTopic && r.studentName === name)

    if (topicResults.length > 0) {
      setPreviousAttempts(topicResults.length)

      // Find best score
      const scores = topicResults.map((r: any) => r.score)
      setBestScore(Math.max(...scores))
    }

    // Set quiz timer based on difficulty or custom settings
    const savedDifficulty = localStorage.getItem("selectedDifficulty") || "medium"
    setDifficulty(savedDifficulty)

    const useCustomTime = localStorage.getItem("useCustomTime") === "true"
    const customTimeLimit = localStorage.getItem("customTimeLimit")

    let timePerQuestion = 0

    if (useCustomTime && customTimeLimit) {
      timePerQuestion = Number.parseInt(customTimeLimit)
    } else {
      // Use difficulty-based timers, checking if custom timers are set
      switch (savedDifficulty) {
        case "easy":
          timePerQuestion = Number.parseInt(localStorage.getItem("timerEasy") || "60")
          break
        case "medium":
          timePerQuestion = Number.parseInt(localStorage.getItem("timerMedium") || "45")
          break
        case "hard":
          timePerQuestion = Number.parseInt(localStorage.getItem("timerHard") || "30")
          break
        default:
          timePerQuestion = 45
      }
    }

    setTimeRemaining(questionsWithHints.length * timePerQuestion)
    setQuizStartTime(new Date())
  }, [decodedTopic, router, toast])

  // Timer effect
  useEffect(() => {
    if (timeRemaining <= 0 || quizCompleted) return

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          completeQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining, quizCompleted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const handleAnswerSelect = (answer: string) => {
    if (isAnswerChecked) return

    const newAnswers = [...selectedAnswers]
    newAnswers[currentQuestionIndex] = answer
    setSelectedAnswers(newAnswers)
  }

  const checkAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex]
    const selectedAnswer = selectedAnswers[currentQuestionIndex]

    if (!selectedAnswer) return

    const correct = selectedAnswer === currentQuestion.correctAnswer
    setIsCorrect(correct)
    setIsAnswerChecked(true)

    if (correct) {
      toast({
        title: "Correct!",
        description: "Great job! That's the right answer.",
        variant: "default",
      })

      // Small confetti burst for correct answers
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      })
    } else {
      toast({
        title: "Incorrect",
        description: `The correct answer is: ${currentQuestion.correctAnswer}`,
        variant: "destructive",
      })
    }
  }

  const nextQuestion = () => {
    setIsAnswerChecked(false)
    setIsCorrect(false)

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setShowHint(false)
    } else {
      completeQuiz()
    }
  }

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
      setShowHint(false)
      setIsAnswerChecked(false)
      setIsCorrect(false)
    }
  }

  const toggleBookmark = () => {
    const newBookmarked = [...bookmarkedQuestions]
    const index = newBookmarked.indexOf(currentQuestionIndex)

    if (index === -1) {
      // Add to bookmarks
      newBookmarked.push(currentQuestionIndex)
      toast({
        title: "Question bookmarked",
        description: "You can review this question later",
      })
    } else {
      // Remove from bookmarks
      newBookmarked.splice(index, 1)
      toast({
        title: "Bookmark removed",
        description: "Question removed from bookmarks",
      })
    }

    setBookmarkedQuestions(newBookmarked)
    localStorage.setItem(`bookmarked_${decodedTopic}`, JSON.stringify(newBookmarked))
  }

  const completeQuiz = () => {
    if (quizCompleted) return // Prevent multiple completions

    setQuizCompleted(true)

    // Calculate score
    let score = 0
    questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        score++
      }
    })

    // Calculate time taken
    const endTime = new Date()
    const timeTaken = quizStartTime ? Math.floor((endTime.getTime() - quizStartTime.getTime()) / 1000) : 0

    // Save result to local storage
    const result = {
      id: `${studentName}-${decodedTopic}-${new Date().toISOString()}`.replace(/\s+/g, "-"),
      studentName,
      topic: decodedTopic,
      score,
      totalQuestions: questions.length,
      date: new Date().toISOString(),
      answers: selectedAnswers,
      difficulty,
      bookmarkedQuestions,
      timeTaken,
    }

    const existingResults = JSON.parse(localStorage.getItem("quizResults") || "[]")
    localStorage.setItem("quizResults", JSON.stringify([...existingResults, result]))

    // Big confetti celebration for quiz completion
    confetti({
      particleCount: 100,
      spread: 160,
      origin: { y: 0.6 },
    })

    // Navigate to results page
    router.push(`/quiz/${params.topic}/results?score=${score}&total=${questions.length}`)
  }

  const handleQuit = () => {
    router.push("/")
  }

  if (questions.length === 0) {
    return (
      <div className="container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading quiz...</p>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isBookmarked = bookmarkedQuestions.includes(currentQuestionIndex)
  const hasSelectedAnswer = !!selectedAnswers[currentQuestionIndex]

  return (
    <div className="min-h-screen">
      <div className="container flex flex-col items-center px-4 py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold gradient-heading mb-2 glow-effect">{decodedTopic} Quiz</h1>
          <p className="text-muted-foreground">Good luck, {studentName}!</p>
        </motion.div>

        {previousAttempts > 0 && (
          <div className="mb-6 flex gap-2">
            <Badge variant="outline" className="px-3 py-1 bg-background/30">
              Previous attempts: {previousAttempts}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 bg-background/30">
              Best score: {bestScore}/{questions.length}
            </Badge>
          </div>
        )}

        <div className="w-full max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="px-3 py-1 bg-background/30">
                <Flag className="w-3 h-3 mr-1" />
                Question {currentQuestionIndex + 1} of {questions.length}
              </Badge>
              <Badge
                variant={timeRemaining < 30 ? "destructive" : "outline"}
                className={`px-3 py-1 ${timeRemaining < 30 ? "timer-warning" : "bg-background/30"}`}
              >
                <Clock className="w-3 h-3 mr-1" />
                {formatTime(timeRemaining)}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={toggleBookmark}>
                      {isBookmarked ? (
                        <BookmarkCheck className="h-5 w-5 text-primary" />
                      ) : (
                        <Bookmark className="h-5 w-5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isBookmarked ? "Remove bookmark" : "Bookmark this question"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Quit Quiz
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>Your progress will be lost if you quit now.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleQuit}>Quit</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="mb-6">
            <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2 progress-bar-glow" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="quiz-card animated-bg">
                <CardHeader className="bg-card/50 rounded-t-lg">
                  <CardTitle className="text-xl flex items-start justify-between">
                    <span>{currentQuestion.question}</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" onClick={() => setShowHint(!showHint)}>
                            <HelpCircle className="h-5 w-5" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{showHint ? "Hide hint" : "Show hint"}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </CardTitle>
                  {showHint && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 p-3 bg-secondary/50 rounded-md text-sm"
                    >
                      <span className="font-medium">Hint:</span> {currentQuestion.hint}
                    </motion.div>
                  )}
                </CardHeader>
                <CardContent className="pt-6">
                  <RadioGroup
                    value={selectedAnswers[currentQuestionIndex]}
                    onValueChange={handleAnswerSelect}
                    className="space-y-3"
                  >
                    {currentQuestion.options.map((option: string, index: number) => {
                      const optionId = `option-${index}`
                      const isSelected = selectedAnswers[currentQuestionIndex] === option
                      const isCorrectAnswer = option === currentQuestion.correctAnswer

                      let className = "option-card p-4 rounded-lg transition-all duration-200"

                      if (isAnswerChecked) {
                        if (isCorrectAnswer) {
                          className += " option-correct"
                        } else if (isSelected && !isCorrectAnswer) {
                          className += " option-incorrect"
                        }
                      } else if (isSelected) {
                        className += " option-selected"
                      }

                      return (
                        <div key={optionId} className={className}>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={optionId} disabled={isAnswerChecked} />
                            <Label htmlFor={optionId} className="flex-grow cursor-pointer">
                              {option}
                            </Label>
                            {isAnswerChecked && isCorrectAnswer && <CheckCircle className="w-5 h-5 text-green-500" />}
                            {isAnswerChecked && isSelected && !isCorrectAnswer && (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </RadioGroup>
                </CardContent>
                <CardFooter className="bg-card/30 rounded-b-lg pt-4 flex justify-between">
                  <Button variant="outline" onClick={prevQuestion} disabled={currentQuestionIndex === 0}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                  </Button>

                  {!isAnswerChecked ? (
                    <Button onClick={checkAnswer} disabled={!hasSelectedAnswer} className="bg-primary">
                      Check Answer
                    </Button>
                  ) : (
                    <Button
                      onClick={nextQuestion}
                      className={isCorrect ? "bg-green-600 hover:bg-green-700" : "bg-primary"}
                    >
                      {currentQuestionIndex < questions.length - 1 ? (
                        <>
                          Next <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        "Finish Quiz"
                      )}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </motion.div>
          </AnimatePresence>

          {bookmarkedQuestions.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-2">Bookmarked Questions:</h3>
              <div className="flex flex-wrap gap-2">
                {bookmarkedQuestions.map((index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCurrentQuestionIndex(index)
                      setIsAnswerChecked(false)
                      setIsCorrect(false)
                    }}
                    className={currentQuestionIndex === index ? "bg-primary text-primary-foreground" : ""}
                  >
                    Question {index + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

