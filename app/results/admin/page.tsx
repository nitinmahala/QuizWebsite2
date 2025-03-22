"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  BarChart3,
  Download,
  Search,
  Settings,
  Trash2,
  Users,
  ArrowLeft,
  PieChart,
  Calendar,
  Timer,
  Sliders,
  LogOut,
  User,
} from "lucide-react"
import { motion } from "framer-motion"
import { quizData } from "@/lib/quiz-data"
import { ThemeToggle } from "@/components/theme-toggle"
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
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type QuizResult = {
  id: string
  studentName: string
  topic: string
  score: number
  totalQuestions: number
  date: string
  difficulty: string
  timeTaken?: number
}

type TimerSettings = {
  easy: number
  medium: number
  hard: number
  custom: number | null
}

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [results, setResults] = useState<QuizResult[]>([])
  const [filteredResults, setFilteredResults] = useState<QuizResult[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterTopic, setFilterTopic] = useState("all")
  const [filterDifficulty, setFilterDifficulty] = useState("all")
  const [selectedResults, setSelectedResults] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("results")
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    easy: 60,
    medium: 45,
    hard: 30,
    custom: null,
  })
  const [useCustomTimerByDefault, setUseCustomTimerByDefault] = useState(false)
  const [studentStats, setStudentStats] = useState<{ [key: string]: { count: number; avgScore: number } }>({})
  const [topicStats, setTopicStats] = useState<{ [key: string]: { count: number; avgScore: number } }>({})
  const [adminUsername, setAdminUsername] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check authentication
  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true"
      if (!isLoggedIn) {
        router.push("/results/admin/login")
        return false
      }

      const username = localStorage.getItem("adminUsername") || "Admin"
      setAdminUsername(username)
      setIsAuthenticated(true)
      return true
    }

    const isAuth = checkAuth()
    if (!isAuth) return

    // Load results from localStorage
    try {
      const storedResults = JSON.parse(localStorage.getItem("quizResults") || "[]")

      // Add unique IDs if they don't exist
      const resultsWithIds = storedResults.map((result: any) => ({
        ...result,
        id: result.id || `${result.studentName}-${result.topic}-${result.date}`.replace(/\s+/g, "-"),
      }))

      setResults(resultsWithIds)
      setFilteredResults(resultsWithIds)

      // Load timer settings
      const savedEasyTime = localStorage.getItem("timerEasy")
      const savedMediumTime = localStorage.getItem("timerMedium")
      const savedHardTime = localStorage.getItem("timerHard")
      const savedCustomTime = localStorage.getItem("customTimeLimit")
      const savedUseCustom = localStorage.getItem("useCustomTime")

      setTimerSettings({
        easy: savedEasyTime ? Number.parseInt(savedEasyTime) : 60,
        medium: savedMediumTime ? Number.parseInt(savedMediumTime) : 45,
        hard: savedHardTime ? Number.parseInt(savedHardTime) : 30,
        custom: savedCustomTime ? Number.parseInt(savedCustomTime) : null,
      })

      setUseCustomTimerByDefault(savedUseCustom === "true")

      // Calculate statistics
      calculateStats(resultsWithIds)
    } catch (error) {
      console.error("Error loading quiz results:", error)
      toast({
        title: "Error loading data",
        description: "There was a problem loading your quiz results",
        variant: "destructive",
      })
    }
  }, [router, toast])

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn")
    localStorage.removeItem("adminUsername")
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully",
    })
    router.push("/results/admin/login")
  }

  const calculateStats = (resultsData: QuizResult[]) => {
    // Student statistics
    const studentData: { [key: string]: { count: number; totalScore: number; avgScore: number } } = {}

    // Topic statistics
    const topicData: { [key: string]: { count: number; totalScore: number; avgScore: number } } = {}

    resultsData.forEach((result) => {
      // Student stats
      if (!studentData[result.studentName]) {
        studentData[result.studentName] = {
          count: 0,
          totalScore: 0,
          avgScore: 0,
        }
      }
      studentData[result.studentName].count += 1
      studentData[result.studentName].totalScore += (result.score / result.totalQuestions) * 100

      // Topic stats
      if (!topicData[result.topic]) {
        topicData[result.topic] = {
          count: 0,
          totalScore: 0,
          avgScore: 0,
        }
      }
      topicData[result.topic].count += 1
      topicData[result.topic].totalScore += (result.score / result.totalQuestions) * 100
    })

    // Calculate averages
    Object.keys(studentData).forEach((student) => {
      studentData[student].avgScore = Math.round(studentData[student].totalScore / studentData[student].count)
    })

    Object.keys(topicData).forEach((topic) => {
      topicData[topic].avgScore = Math.round(topicData[topic].totalScore / topicData[topic].count)
    })

    setStudentStats(studentData)
    setTopicStats(topicData)
  }

  // Filter results based on search term and filters
  useEffect(() => {
    let filtered = [...results]

    if (searchTerm) {
      filtered = filtered.filter(
        (result) =>
          result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          result.topic.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterTopic && filterTopic !== "all") {
      filtered = filtered.filter((result) => result.topic === filterTopic)
    }

    if (filterDifficulty && filterDifficulty !== "all") {
      filtered = filtered.filter((result) => result.difficulty === filterDifficulty)
    }

    setFilteredResults(filtered)
  }, [searchTerm, filterTopic, filterDifficulty, results])

  const handleSelectResult = (id: string) => {
    setSelectedResults((prev) => {
      if (prev.includes(id)) {
        return prev.filter((resultId) => resultId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedResults(filteredResults.map((result) => result.id))
    } else {
      setSelectedResults([])
    }
  }

  const handleDeleteSelected = () => {
    try {
      const updatedResults = results.filter((result) => !selectedResults.includes(result.id))
      setResults(updatedResults)
      localStorage.setItem("quizResults", JSON.stringify(updatedResults))
      setSelectedResults([])
      calculateStats(updatedResults)

      toast({
        title: "Results Deleted",
        description: `${selectedResults.length} result(s) have been deleted`,
      })
    } catch (error) {
      console.error("Error deleting results:", error)
      toast({
        title: "Error",
        description: "There was a problem deleting the selected results",
        variant: "destructive",
      })
    }
  }

  const handleExportResults = () => {
    try {
      const dataToExport =
        selectedResults.length > 0 ? results.filter((result) => selectedResults.includes(result.id)) : results

      const csvContent = [
        [
          "Student Name",
          "Topic",
          "Score",
          "Total Questions",
          "Percentage",
          "Date",
          "Difficulty",
          "Time Taken (s)",
        ].join(","),
        ...dataToExport.map((result) =>
          [
            result.studentName,
            result.topic,
            result.score,
            result.totalQuestions,
            `${Math.round((result.score / result.totalQuestions) * 100)}%`,
            new Date(result.date).toLocaleDateString(),
            result.difficulty,
            result.timeTaken || "N/A",
          ].join(","),
        ),
      ].join("\n")

      const blob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "quiz-results.csv"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export Complete",
        description: `${dataToExport.length} result(s) exported to CSV`,
      })
    } catch (error) {
      console.error("Error exporting results:", error)
      toast({
        title: "Export Failed",
        description: "There was a problem exporting the results",
        variant: "destructive",
      })
    }
  }

  const saveTimerSettings = () => {
    try {
      localStorage.setItem("timerEasy", timerSettings.easy.toString())
      localStorage.setItem("timerMedium", timerSettings.medium.toString())
      localStorage.setItem("timerHard", timerSettings.hard.toString())

      if (timerSettings.custom) {
        localStorage.setItem("customTimeLimit", timerSettings.custom.toString())
      }

      localStorage.setItem("useCustomTime", useCustomTimerByDefault.toString())

      toast({
        title: "Settings Saved",
        description: "Timer settings have been updated",
      })
    } catch (error) {
      console.error("Error saving timer settings:", error)
      toast({
        title: "Error",
        description: "There was a problem saving your settings",
        variant: "destructive",
      })
    }
  }

  const formatTime = (seconds?: number) => {
    if (!seconds) return "N/A"
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString()
    } catch (error) {
      return "Invalid date"
    }
  }

  if (!isAuthenticated) {
    return null // Don't render anything while checking authentication
  }

  return (
    <div className="min-h-screen">
      <div className="container px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/")} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold gradient-heading glow-effect">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-3 py-1 bg-background/30">
              <User className="h-3.5 w-3.5 mr-1" />
              {adminUsername}
            </Badge>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Logout</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <ThemeToggle />
          </div>
        </div>

        <Tabs defaultValue="results" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 p-1 bg-secondary/50 backdrop-blur-sm">
            <TabsTrigger
              value="results"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="w-4 h-4 mr-2" />
              Quiz Results
            </TabsTrigger>
            <TabsTrigger
              value="statistics"
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="results">
              <Card className="quiz-card mb-8 animated-bg">
                <CardHeader className="bg-card/50 rounded-t-lg">
                  <CardTitle className="flex items-center text-2xl">
                    <Users className="h-6 w-6 mr-2 text-primary" />
                    Quiz Results
                  </CardTitle>
                  <CardDescription>View and manage all quiz results</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by student or topic..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-background/50"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Select value={filterTopic} onValueChange={setFilterTopic}>
                        <SelectTrigger className="w-[180px] bg-background/50">
                          <SelectValue placeholder="Filter by topic" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Topics</SelectItem>
                          {quizData.map((quiz) => (
                            <SelectItem key={quiz.topic} value={quiz.topic}>
                              {quiz.topic}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                        <SelectTrigger className="w-[180px] bg-background/50">
                          <SelectValue placeholder="Filter by difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Difficulties</SelectItem>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">
                            <Checkbox
                              checked={selectedResults.length === filteredResults.length && filteredResults.length > 0}
                              onCheckedChange={handleSelectAll}
                            />
                          </TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Topic</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Difficulty</TableHead>
                          <TableHead>Time Taken</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredResults.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              No results found
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredResults.map((result) => (
                            <TableRow key={result.id}>
                              <TableCell>
                                <Checkbox
                                  checked={selectedResults.includes(result.id)}
                                  onCheckedChange={() => handleSelectResult(result.id)}
                                />
                              </TableCell>
                              <TableCell className="font-medium">{result.studentName}</TableCell>
                              <TableCell>{result.topic}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span>
                                    {result.score}/{result.totalQuestions}
                                  </span>
                                  <Badge
                                    variant={
                                      result.score / result.totalQuestions >= 0.8
                                        ? "default"
                                        : result.score / result.totalQuestions >= 0.6
                                          ? "secondary"
                                          : result.score / result.totalQuestions >= 0.4
                                            ? "outline"
                                            : "destructive"
                                    }
                                  >
                                    {Math.round((result.score / result.totalQuestions) * 100)}%
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {result.difficulty}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatTime(result.timeTaken)}</TableCell>
                              <TableCell>{formatDate(result.date)}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
                <CardFooter className="bg-card/30 rounded-b-lg pt-4 flex flex-wrap gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedResults.length} of {filteredResults.length} selected
                    </span>
                    {selectedResults.length > 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete Selected
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete {selectedResults.length} selected result(s). This action
                              cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteSelected}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                  <Button variant="outline" onClick={handleExportResults}>
                    <Download className="h-4 w-4 mr-2" />
                    Export to CSV
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="statistics">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="quiz-card animated-bg">
                  <CardHeader className="bg-card/50 rounded-t-lg">
                    <CardTitle className="flex items-center text-xl">
                      <Users className="h-5 w-5 mr-2 text-primary" />
                      Student Performance
                    </CardTitle>
                    <CardDescription>Average scores by student</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {Object.keys(studentStats).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No student data available</div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(studentStats)
                          .sort((a, b) => b[1].avgScore - a[1].avgScore)
                          .map(([student, stats]) => (
                            <div key={student} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h3 className="font-medium">{student}</h3>
                                  <p className="text-xs text-muted-foreground">
                                    {stats.count} {stats.count === 1 ? "quiz" : "quizzes"} taken
                                  </p>
                                </div>
                                <Badge variant="outline">{stats.avgScore}%</Badge>
                              </div>
                              <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500 ease-out"
                                  style={{
                                    width: `${stats.avgScore}%`,
                                    background:
                                      stats.avgScore >= 80
                                        ? "linear-gradient(90deg, hsl(142, 76%, 36%), hsl(142, 71%, 45%))"
                                        : stats.avgScore >= 60
                                          ? "linear-gradient(90deg, hsl(217, 91%, 60%), hsl(217, 91%, 65%))"
                                          : stats.avgScore >= 40
                                            ? "linear-gradient(90deg, hsl(45, 93%, 47%), hsl(45, 93%, 55%))"
                                            : "linear-gradient(90deg, hsl(0, 84%, 60%), hsl(0, 84%, 65%))",
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="quiz-card animated-bg">
                  <CardHeader className="bg-card/50 rounded-t-lg">
                    <CardTitle className="flex items-center text-xl">
                      <PieChart className="h-5 w-5 mr-2 text-primary" />
                      Topic Difficulty
                    </CardTitle>
                    <CardDescription>Average scores by topic</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {Object.keys(topicStats).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">No topic data available</div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(topicStats)
                          .sort((a, b) => a[1].avgScore - b[1].avgScore)
                          .map(([topic, stats]) => (
                            <div key={topic} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div>
                                  <h3 className="font-medium">{topic}</h3>
                                  <p className="text-xs text-muted-foreground">
                                    {stats.count} {stats.count === 1 ? "attempt" : "attempts"}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    stats.avgScore >= 80
                                      ? "default"
                                      : stats.avgScore >= 60
                                        ? "secondary"
                                        : stats.avgScore >= 40
                                          ? "outline"
                                          : "destructive"
                                  }
                                >
                                  {stats.avgScore}%
                                </Badge>
                              </div>
                              <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500 ease-out"
                                  style={{
                                    width: `${stats.avgScore}%`,
                                    background:
                                      stats.avgScore >= 80
                                        ? "linear-gradient(90deg, hsl(142, 76%, 36%), hsl(142, 71%, 45%))"
                                        : stats.avgScore >= 60
                                          ? "linear-gradient(90deg, hsl(217, 91%, 60%), hsl(217, 91%, 65%))"
                                          : stats.avgScore >= 40
                                            ? "linear-gradient(90deg, hsl(45, 93%, 47%), hsl(45, 93%, 55%))"
                                            : "linear-gradient(90deg, hsl(0, 84%, 60%), hsl(0, 84%, 65%))",
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card className="quiz-card">
                <CardHeader className="bg-card/50 rounded-t-lg">
                  <CardTitle className="flex items-center text-xl">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Quiz Activity
                  </CardTitle>
                  <CardDescription>Recent quiz activity</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {results.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No quiz activity available</div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Total Quizzes Taken</h3>
                        </div>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {results.length}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Average Score</h3>
                        </div>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {results.length > 0
                            ? Math.round(
                                results.reduce((acc, result) => acc + (result.score / result.totalQuestions) * 100, 0) /
                                  results.length,
                              )
                            : 0}
                          %
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Most Popular Topic</h3>
                        </div>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {Object.entries(topicStats).sort((a, b) => b[1].count - a[1].count)[0]?.[0] || "N/A"}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Most Active Student</h3>
                        </div>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {Object.entries(studentStats).sort((a, b) => b[1].count - a[1].count)[0]?.[0] || "N/A"}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card className="quiz-card mb-8">
                <CardHeader className="bg-card/50 rounded-t-lg">
                  <CardTitle className="flex items-center text-2xl">
                    <Timer className="h-6 w-6 mr-2 text-primary" />
                    Timer Settings
                  </CardTitle>
                  <CardDescription>Configure quiz timer settings</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium">Use Custom Timer by Default</h3>
                        <p className="text-sm text-muted-foreground">Override difficulty-based timers</p>
                      </div>
                      <Switch checked={useCustomTimerByDefault} onCheckedChange={setUseCustomTimerByDefault} />
                    </div>

                    {useCustomTimerByDefault && (
                      <div className="space-y-4 pl-0 sm:pl-6 border-l-0 sm:border-l border-border/50 mt-4 pt-0 sm:pt-2">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="customTimer">Custom Time per Question</Label>
                            <span className="text-sm font-medium">{timerSettings.custom || 45} seconds</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <Slider
                              id="customTimer"
                              min={10}
                              max={120}
                              step={5}
                              value={[timerSettings.custom || 45]}
                              onValueChange={(value) => setTimerSettings({ ...timerSettings, custom: value[0] })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-border/50">
                      <h3 className="text-lg font-medium mb-4">Difficulty-Based Timers</h3>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="easyTimer">Easy Difficulty</Label>
                            <span className="text-sm font-medium">{timerSettings.easy} seconds</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <Slider
                              id="easyTimer"
                              min={20}
                              max={120}
                              step={5}
                              value={[timerSettings.easy]}
                              onValueChange={(value) => setTimerSettings({ ...timerSettings, easy: value[0] })}
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="mediumTimer">Medium Difficulty</Label>
                            <span className="text-sm font-medium">{timerSettings.medium} seconds</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <Slider
                              id="mediumTimer"
                              min={15}
                              max={90}
                              step={5}
                              value={[timerSettings.medium]}
                              onValueChange={(value) => setTimerSettings({ ...timerSettings, medium: value[0] })}
                              className="flex-1"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="hardTimer">Hard Difficulty</Label>
                            <span className="text-sm font-medium">{timerSettings.hard} seconds</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <Slider
                              id="hardTimer"
                              min={10}
                              max={60}
                              step={5}
                              value={[timerSettings.hard]}
                              onValueChange={(value) => setTimerSettings({ ...timerSettings, hard: value[0] })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-card/30 rounded-b-lg pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => router.push("/")}>
                    Back to Home
                  </Button>
                  <Button onClick={saveTimerSettings}>
                    <Sliders className="h-4 w-4 mr-2" />
                    Save Settings
                  </Button>
                </CardFooter>
              </Card>

              <Card className="quiz-card">
                <CardHeader className="bg-card/50 rounded-t-lg">
                  <CardTitle className="flex items-center text-2xl">
                    <Settings className="h-6 w-6 mr-2 text-primary" />
                    Data Management
                  </CardTitle>
                  <CardDescription>Manage quiz data and results</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Reset All Quiz Data</h3>
                    <p className="text-sm text-muted-foreground">
                      This will permanently delete all quiz results and reset all settings. This action cannot be
                      undone.
                    </p>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="mt-2">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Reset All Data
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete all quiz results and reset all settings. This action cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => {
                              try {
                                localStorage.removeItem("quizResults")
                                localStorage.removeItem("timerEasy")
                                localStorage.removeItem("timerMedium")
                                localStorage.removeItem("timerHard")
                                localStorage.removeItem("customTimeLimit")
                                localStorage.removeItem("useCustomTime")

                                setResults([])
                                setFilteredResults([])
                                setSelectedResults([])
                                setStudentStats({})
                                setTopicStats({})

                                setTimerSettings({
                                  easy: 60,
                                  medium: 45,
                                  hard: 30,
                                  custom: null,
                                })

                                setUseCustomTimerByDefault(false)

                                toast({
                                  title: "Data Reset Complete",
                                  description: "All quiz data has been reset",
                                })
                              } catch (error) {
                                console.error("Error resetting data:", error)
                                toast({
                                  title: "Error",
                                  description: "There was a problem resetting your data",
                                  variant: "destructive",
                                })
                              }
                            }}
                          >
                            Reset Everything
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-border/50">
                    <h3 className="text-lg font-medium">Export All Data</h3>
                    <p className="text-sm text-muted-foreground">Export all quiz results and settings to a CSV file.</p>

                    <Button variant="outline" className="mt-2" onClick={handleExportResults}>
                      <Download className="h-4 w-4 mr-2" />
                      Export All Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>
    </div>
  )
}

