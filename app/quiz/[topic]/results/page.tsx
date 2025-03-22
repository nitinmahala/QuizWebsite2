"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { quizData } from "@/lib/quiz-data"
import { CheckCircle, XCircle, Bookmark, Share2, Download, Printer, Trophy, BarChart3, Sparkles } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import confetti from "canvas-confetti"

type QuizResult = {
  studentName: string
  topic: string
  score: number
  totalQuestions: number
  date: string
  answers: string[]
  bookmarkedQuestions?: number[]
  timeTaken?: number
  difficulty?: string
}

export default function QuizResults({ params }: { params: { topic: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const decodedTopic = decodeURIComponent(params.topic)
  const { toast } = useToast()

  const [studentName, setStudentName] = useState("")
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [questions, setQuestions] = useState<any[]>([])
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [initialized, setInitialized] = useState(false)
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<number[]>([])
  const [previousAttempts, setPreviousAttempts] = useState<number>(0)
  const [improvementPercent, setImprovementPercent] = useState<number | null>(null)
  const [timeTaken, setTimeTaken] = useState<number>(0)
  const [difficulty, setDifficulty] = useState<string>("medium")
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    // Trigger confetti on first render if score is good
    if (score / totalQuestions >= 0.7 && !showConfetti) {
      setShowConfetti(true)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      })
    }
  }, [score, totalQuestions, showConfetti])

  useEffect(() => {
    // Prevent multiple initializations
    if (initialized) return

    // This function will run only once when the component mounts
    const initializeResults = () => {
      // Get score and total from URL params
      const scoreParam = searchParams.get("score")
      const totalParam = searchParams.get("total")

      // Get all results from localStorage once
      const allResults = JSON.parse(localStorage.getItem("quizResults") || "[]") as QuizResult[]
      const topicResults = allResults.filter((r) => r.topic === decodedTopic)
      const latestResult = topicResults.length > 0 ? topicResults[topicResults.length - 1] : null

      // Set score and total questions
      if (scoreParam && totalParam) {
        setScore(Number.parseInt(scoreParam))
        setTotalQuestions(Number.parseInt(totalParam))
      } else if (latestResult) {
        setScore(latestResult.score)
        setTotalQuestions(latestResult.totalQuestions)
      } else {
        router.push("/")
        return
      }

      // Set user answers if available
      if (latestResult) {
        setUserAnswers(latestResult.answers)
        if (latestResult.bookmarkedQuestions) {
          setBookmarkedQuestions(latestResult.bookmarkedQuestions)
        }
        if (latestResult.timeTaken) {
          setTimeTaken(latestResult.timeTaken)
        }
        if (latestResult.difficulty) {
          setDifficulty(latestResult.difficulty)
        }
      }

      // Get student name from localStorage
      const name = localStorage.getItem("studentName")
      if (name) {
        setStudentName(name)

        // Calculate previous attempts and improvement
        const studentTopicResults = topicResults.filter((r) => r.studentName === name)
        setPreviousAttempts(studentTopicResults.length)

        if (studentTopicResults.length > 1) {
          // Sort by date
          const sortedResults = studentTopicResults.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
          )

          // Get previous score percentage
          const previousScore = sortedResults[sortedResults.length - 2].score
          const previousTotal = sortedResults[sortedResults.length - 2].totalQuestions
          const previousPercent = (previousScore / previousTotal) * 100

          // Get current score percentage
          const currentPercent = (score / totalQuestions) * 100

          // Calculate improvement
          const improvement = currentPercent - previousPercent
          setImprovementPercent(improvement)
        }
      }

      // Get questions for this topic
      const topicData = quizData.find((quiz) => quiz.topic === decodedTopic)
      if (topicData) {
        setQuestions(topicData.questions)
      }
    }

    initializeResults()
    setInitialized(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array to run only once on mount

  const handleRetry = () => {
    router.push(`/quiz/${params.topic}`)
  }

  const handleHome = () => {
    router.push("/")
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // Create a text summary of the quiz results
    const resultSummary = `
Quiz Results for ${studentName}
Topic: ${decodedTopic}
Date: ${new Date().toLocaleDateString()}
Score: ${score}/${totalQuestions} (${percentage}%)
Difficulty: ${difficulty}
Time Taken: ${formatTime(timeTaken)}

Question Summary:
${questions
  .map(
    (q, i) => `
${i + 1}. ${q.question}
Your answer: ${userAnswers[i] || "Not answered"}
Correct answer: ${q.correctAnswer}
${userAnswers[i] === q.correctAnswer ? "✓ Correct" : "✗ Incorrect"}
`,
  )
  .join("\n")}
`.trim()

    // Create a blob and download it
    const blob = new Blob([resultSummary], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${decodedTopic.replace(/\s+/g, "-").toLowerCase()}-results.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Results downloaded",
      description: "Your quiz results have been saved as a text file",
    })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${decodedTopic} Quiz Results`,
          text: `I scored ${score}/${totalQuestions} (${percentage}%) on the ${decodedTopic} quiz!`,
        })
        .catch(() => {
          toast({
            title: "Sharing failed",
            description: "Could not share the results",
            variant: "destructive",
          })
        })
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(`I scored ${score}/${totalQuestions} (${percentage}%) on the ${decodedTopic} quiz!`)
      toast({
        title: "Copied to clipboard",
        description: "Share link copied to clipboard",
      })
    }
  }

  const formatTime = (seconds = 0) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const getScoreColor = () => {
    if (percentage >= 80) return "from-green-500 to-emerald-500"
    if (percentage >= 60) return "from-emerald-500 to-teal-500"
    if (percentage >= 40) return "from-amber-500 to-orange-500"
    return "from-red-500 to-rose-500"
  }

  const getScoreMessage = () => {
    if (percentage >= 80) return "Excellent! You've mastered this topic."
    if (percentage >= 60) return "Great job! You have a good understanding."
    if (percentage >= 40) return "Good effort! Keep practicing to improve."
    return "Keep studying and try again. You'll get better!"
  }

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container flex flex-col items-center px-4 py-8">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold gradient-heading mb-2 glow-effect">Quiz Results</h1>
          <p className="text-muted-foreground">{decodedTopic} Quiz</p>
        </motion.div>

        <div className="w-full max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="quiz-card mb-8 border-2 border-primary/10 shadow-lg overflow-hidden animated-bg">
              <CardHeader className="bg-muted/50 pb-2">
                <CardTitle className="flex items-center justify-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  Your Score
                </CardTitle>
                <CardDescription>{studentName ? `Results for ${studentName}` : "Your quiz results"}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="relative mb-6">
                    <div
                      className={`w-32 h-32 rounded-full flex items-center justify-center text-white text-3xl font-bold bg-gradient-to-br ${getScoreColor()}`}
                    >
                      {percentage}%
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-background px-3 py-1 rounded-full border border-muted text-sm font-medium">
                      {score} / {totalQuestions}
                    </div>
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-lg font-medium mb-1">{getScoreMessage()}</p>
                    <p className="text-muted-foreground text-sm">
                      {difficulty === "easy" ? "Easy" : difficulty === "medium" ? "Medium" : "Hard"} difficulty •
                      Completed in {formatTime(timeTaken)}
                    </p>
                  </div>

                  {previousAttempts > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                      <Badge variant="outline" className="px-3 py-1">
                        Attempt #{previousAttempts}
                      </Badge>
                      {improvementPercent !== null && (
                        <Badge variant={improvementPercent >= 0 ? "default" : "destructive"} className="px-3 py-1">
                          {improvementPercent >= 0 ? "+" : ""}
                          {improvementPercent.toFixed(1)}% from last attempt
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="w-full mt-4 grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrint}
                      className="flex items-center justify-center"
                    >
                      <Printer className="w-4 h-4 mr-2" /> Print
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDownload}
                      className="flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-2" /> Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="flex items-center justify-center"
                    >
                      <Share2 className="w-4 h-4 mr-2" /> Share
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/30 pt-4 flex flex-col gap-2 sm:flex-row">
                <Button onClick={handleRetry} className="w-full sm:w-auto">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button onClick={handleHome} variant="outline" className="w-full sm:w-auto">
                  Back to Home
                </Button>
              </CardFooter>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-primary" />
              Review Answers
            </h2>

            <Accordion type="single" collapsible className="w-full mb-8">
              {questions.map((question, index) => {
                const userAnswer = userAnswers[index] || "Not answered"
                const isCorrect = userAnswer === question.correctAnswer
                const isBookmarked = bookmarkedQuestions.includes(index)

                return (
                  <AccordionItem key={index} value={`question-${index}`} className="border-b border-muted">
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-2 text-left">
                        <div
                          className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isCorrect ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}
                        >
                          {isCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        </div>
                        <span className="font-medium">Question {index + 1}</span>
                        {isBookmarked && <Bookmark className="w-4 h-4 text-primary ml-2" />}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      <div className="space-y-3 pl-8">
                        <p className="font-medium">{question.question}</p>
                        <div className="space-y-2 mt-3">
                          <div className="flex items-center">
                            <div className="w-24 font-medium">Your answer:</div>
                            <div
                              className={
                                isCorrect
                                  ? "text-green-600 dark:text-green-400 font-medium"
                                  : "text-red-600 dark:text-red-400 font-medium"
                              }
                            >
                              {userAnswer}
                            </div>
                          </div>
                          {!isCorrect && (
                            <div className="flex items-center">
                              <div className="w-24 font-medium">Correct:</div>
                              <div className="text-green-600 dark:text-green-400 font-medium">
                                {question.correctAnswer}
                              </div>
                            </div>
                          )}
                        </div>
                        {question.hint && (
                          <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                            <span className="font-medium">Hint:</span> {question.hint}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

