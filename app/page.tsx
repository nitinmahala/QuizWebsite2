"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { quizData } from "@/lib/quiz-data"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { BookOpen, BarChart3, Brain, Sparkles, History, Award, Rocket, Settings, User, Lock } from "lucide-react"
import { motion } from "framer-motion"
import { Switch } from "@/components/ui/switch"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Home() {
  const router = useRouter()
  const { toast } = useToast()
  const [studentName, setStudentName] = useState("")
  const [selectedTopic, setSelectedTopic] = useState("")
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium")
  const [nameError, setNameError] = useState("")
  const [topicError, setTopicError] = useState("")
  const [recentResults, setRecentResults] = useState<any[]>([])
  const [topicStats, setTopicStats] = useState<{ [key: string]: { attempts: number; avgScore: number } }>({})
  const [activeTab, setActiveTab] = useState("start")
  const [customTimeLimit, setCustomTimeLimit] = useState<number | null>(null)
  const [useCustomTime, setUseCustomTime] = useState(false)

  // Check if we're in the browser before accessing localStorage
  useEffect(() => {
    const savedName = localStorage.getItem("studentName")
    if (savedName) {
      setStudentName(savedName)

      // Load recent results for this student
      const allResults = JSON.parse(localStorage.getItem("quizResults") || "[]")
      const studentResults = allResults.filter((r: any) => r.studentName === savedName)

      // Get the 3 most recent results
      const recent = studentResults
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)

      setRecentResults(recent)

      // Calculate topic statistics
      const stats: { [key: string]: { attempts: number; totalScore: number; avgScore: number } } = {}

      studentResults.forEach((result: any) => {
        if (!stats[result.topic]) {
          stats[result.topic] = {
            attempts: 0,
            totalScore: 0,
            avgScore: 0,
          }
        }

        stats[result.topic].attempts += 1
        stats[result.topic].totalScore += (result.score / result.totalQuestions) * 100
      })

      // Calculate average scores
      Object.keys(stats).forEach((topic) => {
        stats[topic].avgScore = Math.round(stats[topic].totalScore / stats[topic].attempts)
      })

      setTopicStats(stats)
    }

    // Load custom time settings
    const savedCustomTime = localStorage.getItem("customTimeLimit")
    if (savedCustomTime) {
      setCustomTimeLimit(Number.parseInt(savedCustomTime))
      setUseCustomTime(localStorage.getItem("useCustomTime") === "true")
    }
  }, [])

  const handleStartQuiz = () => {
    // Validate inputs
    let isValid = true

    if (!studentName.trim()) {
      setNameError("Please enter your name")
      isValid = false
    } else {
      setNameError("")
    }

    if (!selectedTopic) {
      setTopicError("Please select a quiz topic")
      isValid = false
    } else {
      setTopicError("")
    }

    if (isValid) {
      // Save student name to localStorage
      localStorage.setItem("studentName", studentName)
      localStorage.setItem("selectedDifficulty", selectedDifficulty)

      // Save custom time settings
      if (useCustomTime && customTimeLimit) {
        localStorage.setItem("useCustomTime", "true")
        localStorage.setItem("customTimeLimit", customTimeLimit.toString())
      } else {
        localStorage.setItem("useCustomTime", "false")
      }

      // Navigate to the quiz page with the selected topic
      router.push(`/quiz/${selectedTopic}`)

      toast({
        title: "Quiz Started",
        description: `Good luck on your ${selectedTopic} quiz, ${studentName}!`,
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  const getScoreColor = (score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return "bg-emerald-500"
    if (percentage >= 60) return "bg-blue-500"
    if (percentage >= 40) return "bg-amber-500"
    return "bg-red-500"
  }

  const handleCustomTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setCustomTimeLimit(value)
    }
  }

  const handleAdminLogin = () => {
    router.push("/results/admin/login")
  }

  return (
    <div className="min-h-screen">
      <div className="container flex flex-col items-center px-4 py-12">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold gradient-heading mb-4 glow-effect">Brain Boost Quiz</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Test your knowledge, track your progress, and challenge yourself with our interactive quizzes
          </p>
        </motion.div>

        <Tabs defaultValue="start" value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl">
          <TabsList className="grid w-full grid-cols-4 mb-8 p-1 bg-secondary/50 backdrop-blur-sm">
            <TabsTrigger
              value="start"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Start Quiz
            </TabsTrigger>
            <TabsTrigger
              value="progress"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <History className="w-4 h-4 mr-2" />
              Progress
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Statistics
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="start">
              <Card className="quiz-card">
                <CardHeader className="bg-card/50 rounded-t-lg">
                  <CardTitle className="flex items-center text-2xl">
                    <Brain className="h-6 w-6 mr-2 text-primary" />
                    Start Quiz
                  </CardTitle>
                  <CardDescription>Enter your name and select a topic to begin</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="h-12 bg-background/50 backdrop-blur-sm"
                    />
                    {nameError && <p className="text-sm text-red-500 mt-1">{nameError}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic" className="text-base">
                      Quiz Topic
                    </Label>
                    <Select onValueChange={setSelectedTopic}>
                      <SelectTrigger id="topic" className="h-12 bg-background/50 backdrop-blur-sm">
                        <SelectValue placeholder="Select a topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {quizData.map((quiz) => (
                          <SelectItem key={quiz.topic} value={quiz.topic}>
                            {quiz.topic}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {topicError && <p className="text-sm text-red-500 mt-1">{topicError}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty" className="text-base">
                      Difficulty Level
                    </Label>
                    <Select defaultValue={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger id="difficulty" className="h-12 bg-background/50 backdrop-blur-sm">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="bg-card/30 rounded-b-lg pt-4">
                  <Button onClick={handleStartQuiz} className="w-full h-12 text-base">
                    <Sparkles className="mr-2 h-5 w-5" />
                    Start Quiz
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="progress">
              <Card className="quiz-card">
                <CardHeader className="bg-card/50 rounded-t-lg">
                  <CardTitle className="flex items-center text-2xl">
                    <BookOpen className="h-6 w-6 mr-2 text-primary" />
                    My Recent Quizzes
                  </CardTitle>
                  <CardDescription>View your recent quiz attempts and results</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {recentResults.length === 0 ? (
                    <div className="text-center py-12 bg-background/20 rounded-lg">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-lg mb-2">You haven't taken any quizzes yet</p>
                      <Button variant="outline" onClick={() => setActiveTab("start")} className="mt-2">
                        Start your first quiz
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentResults.map((result, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center p-4 border border-border/50 rounded-lg hover:bg-card/50 transition-colors"
                        >
                          <div>
                            <h3 className="font-medium text-lg">{result.topic}</h3>
                            <p className="text-sm text-muted-foreground">{formatDate(result.date)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${getScoreColor(result.score, result.totalQuestions)}`}
                                style={
                                  { "--percentage": Math.round((result.score / result.totalQuestions) * 100) } as any
                                }
                              >
                                {Math.round((result.score / result.totalQuestions) * 100)}%
                              </div>
                              <p className="text-xs mt-1 text-muted-foreground">
                                {result.score}/{result.totalQuestions}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/quiz/${result.topic}/results`)}
                            >
                              Review
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-card/30 rounded-b-lg pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setActiveTab("start")}>
                    Take New Quiz
                  </Button>
                  <Button variant="outline" onClick={handleAdminLogin}>
                    <Lock className="h-4 w-4 mr-2" />
                    Admin Login
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="stats">
              <Card className="quiz-card">
                <CardHeader className="bg-card/50 rounded-t-lg">
                  <CardTitle className="flex items-center text-2xl">
                    <BarChart3 className="h-6 w-6 mr-2 text-primary" />
                    Performance Statistics
                  </CardTitle>
                  <CardDescription>Track your progress across different topics</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {Object.keys(topicStats).length === 0 ? (
                    <div className="text-center py-12 bg-background/20 rounded-lg">
                      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-lg mb-2">No statistics available yet</p>
                      <Button variant="outline" onClick={() => setActiveTab("start")} className="mt-2">
                        Take a quiz to see statistics
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {Object.entries(topicStats).map(([topic, stats]) => (
                        <div key={topic} className="space-y-3">
                          <div className="flex justify-between items-center">
                            <h3 className="font-medium text-lg">{topic}</h3>
                            <Badge variant="outline" className="px-3 py-1 bg-background/30">
                              {stats.attempts} {stats.attempts === 1 ? "attempt" : "attempts"}
                            </Badge>
                          </div>
                          <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500 ease-out progress-bar-glow"
                              style={{
                                width: `${stats.avgScore}%`,
                                background: `linear-gradient(90deg, 
                                  ${
                                    stats.avgScore >= 80
                                      ? "hsl(142, 76%, 36%)"
                                      : stats.avgScore >= 60
                                        ? "hsl(217, 91%, 60%)"
                                        : stats.avgScore >= 40
                                          ? "hsl(45, 93%, 47%)"
                                          : "hsl(0, 84%, 60%)"
                                  } 0%, 
                                  ${
                                    stats.avgScore >= 80
                                      ? "hsl(142, 71%, 45%)"
                                      : stats.avgScore >= 60
                                        ? "hsl(217, 91%, 65%)"
                                        : stats.avgScore >= 40
                                          ? "hsl(45, 93%, 55%)"
                                          : "hsl(0, 84%, 65%)"
                                  } 100%)`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Average Score</span>
                            <span className="font-medium">{stats.avgScore}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-card/30 rounded-b-lg pt-4">
                  <div className="w-full flex justify-between items-center">
                    {Object.keys(topicStats).length > 0 && (
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-yellow-500" />
                        <span className="font-medium">
                          Best Topic: {Object.entries(topicStats).sort((a, b) => b[1].avgScore - a[1].avgScore)[0][0]}
                        </span>
                      </div>
                    )}
                    <Button variant="outline" onClick={() => setActiveTab("start")}>
                      Take New Quiz
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="quiz-card">
                <CardHeader className="bg-card/50 rounded-t-lg">
                  <CardTitle className="flex items-center text-2xl">
                    <Settings className="h-6 w-6 mr-2 text-primary" />
                    Quiz Settings
                  </CardTitle>
                  <CardDescription>Customize your quiz experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Custom Time Limit</h3>
                        <p className="text-sm text-muted-foreground">Override the default time limits</p>
                      </div>
                      <Switch checked={useCustomTime} onCheckedChange={setUseCustomTime} />
                    </div>

                    {useCustomTime && (
                      <div className="space-y-2 pl-0 sm:pl-6 border-l-0 sm:border-l border-border/50 mt-4 pt-0 sm:pt-2">
                        <Label htmlFor="timeLimit">Time per question (seconds)</Label>
                        <Input
                          id="timeLimit"
                          type="number"
                          min="5"
                          placeholder="Enter seconds per question"
                          value={customTimeLimit || ""}
                          onChange={handleCustomTimeChange}
                          className="max-w-[200px] bg-background/50"
                        />
                        <p className="text-xs text-muted-foreground">
                          Default: Easy (60s), Medium (45s), Hard (30s) per question
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div>
                      <h3 className="text-lg font-medium">User Profile</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <User className="h-10 w-10 p-2 bg-primary/20 rounded-full text-primary" />
                        <div>
                          <p className="font-medium">{studentName || "Guest User"}</p>
                          <p className="text-sm text-muted-foreground">
                            {Object.keys(topicStats).length} topics attempted
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/50">
                    <div>
                      <h3 className="text-lg font-medium">Admin Access</h3>
                      <p className="text-sm text-muted-foreground">Access the admin panel to view all quiz results</p>
                      <Button variant="outline" className="mt-2" onClick={handleAdminLogin}>
                        <Lock className="h-4 w-4 mr-2" />
                        Go to Admin Panel
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-card/30 rounded-b-lg pt-4 flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Save settings
                      if (useCustomTime && customTimeLimit) {
                        localStorage.setItem("useCustomTime", "true")
                        localStorage.setItem("customTimeLimit", customTimeLimit.toString())
                      } else {
                        localStorage.setItem("useCustomTime", "false")
                      }

                      toast({
                        title: "Settings Saved",
                        description: "Your quiz settings have been updated",
                      })
                    }}
                  >
                    Save Settings
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("start")}>
                    Back to Quiz
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </div>
  )
}

