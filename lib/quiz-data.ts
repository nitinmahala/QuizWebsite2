export const quizData = [
  {
    topic: "Data Structures & Algorithms",
    questions: [
      {
        question: "What is the time complexity of binary search?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctAnswer: "O(log n)",
        hint: "Think about how the search space is divided in each step.",
      },
      {
        question: "Which data structure operates on a LIFO principle?",
        options: ["Queue", "Stack", "Linked List", "Tree"],
        correctAnswer: "Stack",
        hint: "LIFO stands for Last In, First Out.",
      },
      {
        question: "What is the worst-case time complexity of quicksort?",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(2ⁿ)"],
        correctAnswer: "O(n²)",
        hint: "Consider what happens when the pivot is always the smallest or largest element.",
      },
      {
        question: "Which of these is not a sorting algorithm?",
        options: ["Bubble Sort", "Merge Sort", "Binary Sort", "Insertion Sort"],
        correctAnswer: "Binary Sort",
        hint: "Binary Search is an algorithm, but Binary Sort is not a standard sorting algorithm.",
      },
      {
        question: "What data structure would you use for implementing a priority queue?",
        options: ["Array", "Linked List", "Heap", "Hash Table"],
        correctAnswer: "Heap",
        hint: "This data structure allows efficient access to the element with highest/lowest priority.",
      },
      {
        question: "What is the space complexity of depth-first search (DFS)?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswer: "O(n)",
        hint: "Think about what needs to be stored during the traversal in the worst case.",
      },
      {
        question: "Which algorithm is used to find the shortest path in a weighted graph?",
        options: ["Breadth-First Search", "Depth-First Search", "Dijkstra's Algorithm", "Binary Search"],
        correctAnswer: "Dijkstra's Algorithm",
        hint: "This algorithm uses a priority queue to always explore the path with the smallest weight first.",
      },
    ],
  },
  {
    topic: "Object-Oriented Programming",
    questions: [
      {
        question: "Which of the following is not a principle of OOP?",
        options: ["Encapsulation", "Inheritance", "Polymorphism", "Fragmentation"],
        correctAnswer: "Fragmentation",
        hint: "There are four main principles of OOP: Encapsulation, Inheritance, Polymorphism, and Abstraction.",
      },
      {
        question: "What is the concept of hiding the internal details and showing only the functionality called?",
        options: ["Abstraction", "Encapsulation", "Polymorphism", "Inheritance"],
        correctAnswer: "Abstraction",
        hint: "This principle focuses on showing only essential features while hiding implementation details.",
      },
      {
        question: "Which OOP concept allows a class to use properties and methods of another class?",
        options: ["Encapsulation", "Abstraction", "Inheritance", "Polymorphism"],
        correctAnswer: "Inheritance",
        hint: "This concept enables code reuse by allowing a class to inherit from another class.",
      },
      {
        question: "What is it called when a derived class method overrides a base class method?",
        options: ["Overloading", "Overriding", "Hiding", "Extending"],
        correctAnswer: "Overriding",
        hint: "This allows a subclass to provide a specific implementation of a method already defined in its superclass.",
      },
      {
        question: "Which access modifier makes a class member accessible only within the same class?",
        options: ["Public", "Protected", "Private", "Default"],
        correctAnswer: "Private",
        hint: "This modifier provides the highest level of encapsulation.",
      },
      {
        question: "What is a constructor in OOP?",
        options: [
          "A method that destroys objects",
          "A special method that is called when an object is created",
          "A method that copies objects",
          "A method that converts objects to strings",
        ],
        correctAnswer: "A special method that is called when an object is created",
        hint: "This method initializes the object's state when it's instantiated.",
      },
      {
        question: "What is the concept of treating an object as an instance of its parent class called?",
        options: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"],
        correctAnswer: "Polymorphism",
        hint: "This allows objects to be treated as instances of their parent class rather than their actual class.",
      },
    ],
  },
  {
    topic: "Computer Graphics",
    questions: [
      {
        question: "Which algorithm is used for line drawing in computer graphics?",
        options: ["Dijkstra's Algorithm", "Bresenham's Algorithm", "A* Algorithm", "Floyd-Warshall Algorithm"],
        correctAnswer: "Bresenham's Algorithm",
        hint: "This algorithm determines which pixels should be plotted to form a straight line.",
      },
      {
        question: "What is the process of removing hidden surfaces called?",
        options: ["Rendering", "Shading", "Culling", "Z-buffering"],
        correctAnswer: "Z-buffering",
        hint: "This technique determines which elements are visible in a 3D scene.",
      },
      {
        question: "Which color model is based on human perception of color?",
        options: ["RGB", "CMYK", "HSL", "YUV"],
        correctAnswer: "HSL",
        hint: "This model represents colors in terms of Hue, Saturation, and Lightness.",
      },
      {
        question: "What technique is used to smooth jagged edges in computer graphics?",
        options: ["Dithering", "Anti-aliasing", "Texture mapping", "Ray tracing"],
        correctAnswer: "Anti-aliasing",
        hint: "This technique reduces the jagged appearance of diagonal lines and curves.",
      },
      {
        question: "Which transformation preserves parallel lines but not angles?",
        options: ["Translation", "Rotation", "Scaling", "Shearing"],
        correctAnswer: "Shearing",
        hint: "This transformation slants the shape of an object.",
      },
      {
        question: "What is the technique of mapping a 2D texture onto a 3D object called?",
        options: ["Bump mapping", "Texture mapping", "Displacement mapping", "Normal mapping"],
        correctAnswer: "Texture mapping",
        hint: "This process applies an image to the surface of a 3D model.",
      },
      {
        question: "Which rendering technique simulates the physical behavior of light?",
        options: ["Flat shading", "Gouraud shading", "Phong shading", "Ray tracing"],
        correctAnswer: "Ray tracing",
        hint: "This technique traces the path of light through pixels in an image plane and simulates the effects of its encounters with virtual objects.",
      },
    ],
  },
  {
    topic: "Web Development",
    questions: [
      {
        question: "Which of the following is not a JavaScript framework or library?",
        options: ["React", "Angular", "Vue", "Django"],
        correctAnswer: "Django",
        hint: "Three of these are JavaScript technologies, but one is for a different language.",
      },
      {
        question: "What does CSS stand for?",
        options: ["Computer Style Sheets", "Creative Style Sheets", "Cascading Style Sheets", "Colorful Style Sheets"],
        correctAnswer: "Cascading Style Sheets",
        hint: "The 'cascading' part refers to how styles can override each other based on specificity.",
      },
      {
        question: "Which HTTP method is used to update a resource?",
        options: ["GET", "POST", "PUT", "DELETE"],
        correctAnswer: "PUT",
        hint: "This method replaces all current representations of the target resource with the request payload.",
      },
      {
        question: "What is the purpose of localStorage in web browsers?",
        options: [
          "To store data with no expiration date",
          "To store session data",
          "To cache HTTP requests",
          "To store cookies",
        ],
        correctAnswer: "To store data with no expiration date",
        hint: "This storage mechanism persists even after the browser is closed.",
      },
      {
        question: "Which technology is primarily used for creating responsive web designs?",
        options: ["HTML5", "JavaScript", "CSS3", "WebAssembly"],
        correctAnswer: "CSS3",
        hint: "This technology includes media queries that allow content to adapt to different screen sizes.",
      },
      {
        question: "What is the purpose of a CDN in web development?",
        options: [
          "To create dynamic content",
          "To deliver content from servers closest to the user",
          "To compress HTML files",
          "To convert JavaScript to TypeScript",
        ],
        correctAnswer: "To deliver content from servers closest to the user",
        hint: "CDNs help reduce latency by distributing content across multiple geographic locations.",
      },
      {
        question: "Which of the following is a client-side storage technology?",
        options: ["MySQL", "MongoDB", "IndexedDB", "PostgreSQL"],
        correctAnswer: "IndexedDB",
        hint: "This is a low-level API for client-side storage of significant amounts of structured data.",
      },
    ],
  },
  {
    topic: "Machine Learning",
    questions: [
      {
        question: "Which algorithm is used for classification problems?",
        options: ["Linear Regression", "K-Means", "Random Forest", "Principal Component Analysis"],
        correctAnswer: "Random Forest",
        hint: "This ensemble learning method constructs multiple decision trees during training.",
      },
      {
        question: "What is the purpose of regularization in machine learning?",
        options: [
          "To increase model complexity",
          "To prevent overfitting",
          "To speed up training",
          "To visualize data",
        ],
        correctAnswer: "To prevent overfitting",
        hint: "This technique adds a penalty term to the loss function to discourage complex models.",
      },
      {
        question: "Which of the following is an unsupervised learning algorithm?",
        options: ["Logistic Regression", "Support Vector Machines", "K-Means Clustering", "Decision Trees"],
        correctAnswer: "K-Means Clustering",
        hint: "This algorithm groups similar data points together without labeled training data.",
      },
      {
        question: "What does CNN stand for in deep learning?",
        options: [
          "Complex Neural Network",
          "Convolutional Neural Network",
          "Cascading Neural Network",
          "Computational Neural Network",
        ],
        correctAnswer: "Convolutional Neural Network",
        hint: "This type of neural network is commonly used for image processing tasks.",
      },
      {
        question: "Which metric is used to evaluate regression models?",
        options: ["Accuracy", "Precision", "Recall", "Mean Squared Error"],
        correctAnswer: "Mean Squared Error",
        hint: "This metric measures the average squared difference between predicted and actual values.",
      },
      {
        question: "What is the purpose of the activation function in neural networks?",
        options: [
          "To initialize weights",
          "To introduce non-linearity",
          "To normalize input data",
          "To reduce dimensionality",
        ],
        correctAnswer: "To introduce non-linearity",
        hint: "Without this, a neural network would behave like a linear regression model regardless of depth.",
      },
      {
        question: "Which algorithm is used for dimensionality reduction?",
        options: ["Random Forest", "Gradient Boosting", "Principal Component Analysis", "Naive Bayes"],
        correctAnswer: "Principal Component Analysis",
        hint: "This technique transforms the data into a new coordinate system to maximize variance.",
      },
    ],
  },
]

