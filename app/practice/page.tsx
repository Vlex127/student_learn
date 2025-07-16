'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Clock, Target, TrendingUp, Play, BarChart3 } from 'lucide-react'
import Link from 'next/link'

const subjects = [
  {
    id: 1,
    name: 'Mathematics',
    description: 'Algebra, Calculus, Geometry, Statistics',
    icon: '📐',
    color: 'bg-blue-500',
    questions: 150,
    difficulty: 'Medium'
  },
  {
    id: 2,
    name: 'Physics',
    description: 'Mechanics, Thermodynamics, Electromagnetism',
    icon: '⚡',
    color: 'bg-purple-500',
    questions: 120,
    difficulty: 'Hard'
  },
  {
    id: 3,
    name: 'Chemistry',
    description: 'Organic, Inorganic, Physical Chemistry',
    icon: '🧪',
    color: 'bg-green-500',
    questions: 100,
    difficulty: 'Medium'
  },
  {
    id: 4,
    name: 'Biology',
    description: 'Cell Biology, Genetics, Ecology',
    icon: '🧬',
    color: 'bg-red-500',
    questions: 80,
    difficulty: 'Easy'
  },
  {
    id: 5,
    name: 'Computer Science',
    description: 'Programming, Algorithms, Data Structures',
    icon: '💻',
    color: 'bg-orange-500',
    questions: 200,
    difficulty: 'Medium'
  }
]

const stats = [
  { label: 'Total Questions', value: '650+', icon: BookOpen },
  { label: 'Practice Sessions', value: '12', icon: Clock },
  { label: 'Average Score', value: '78%', icon: Target },
  { label: 'Improvement', value: '+15%', icon: TrendingUp }
]

export default function PracticePage() {
  const [selectedSubject, setSelectedSubject] = useState<number | null>(null)

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Choose Your Practice Subject
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Select a subject to start practicing. Each subject contains multiple-choice questions 
          with detailed explanations to help you learn and improve.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center space-x-3">
              <stat.icon className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {stat.label}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject, index) => (
          <motion.div
            key={subject.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className={`${subject.color} p-3 rounded-lg`}>
                  <span className="text-2xl">{subject.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {subject.difficulty} Level
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {subject.description}
              </p>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {subject.questions} questions available
                </span>
              </div>
              
              <div className="space-y-2">
                <Link
                  href={`/practice/${subject.id}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  <span>Start Practice</span>
                </Link>
                
                <button className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                  <BarChart3 className="h-4 w-4" />
                  <span>View Progress</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <Target className="h-6 w-6 text-blue-600" />
            <span className="text-blue-900 dark:text-blue-100 font-medium">
              Take Assessment Test
            </span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <TrendingUp className="h-6 w-6 text-green-600" />
            <span className="text-green-900 dark:text-green-100 font-medium">
              View Analytics
            </span>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            <BookOpen className="h-6 w-6 text-purple-600" />
            <span className="text-purple-900 dark:text-purple-100 font-medium">
              Study Materials
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
