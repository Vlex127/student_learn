"use client";
import React, { useState, useEffect } from "react";
import { 
  Upload, 
  FileText, 
  BookOpen, 
  Clock, 
  Users, 
  Search, 
  Plus,
  Filter,
  Grid,
  List,
  Star,
  Download,
  Eye,
  Calendar,
  Tag,
  TrendingUp,
  Heart,
  Share2,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { getCourses, Course, transformCourseForUI } from "@/lib/api";

export default function LibraryPage() {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      const result = await getCourses();
      
      if (result.data) {
        // Transform courses data for UI
        const transformedCourses = result.data.map(transformCourseForUI);
        setCourses(transformedCourses);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch courses');
        console.error('Failed to fetch courses:', result.error);
      }
      
      setLoading(false);
    };

    fetchCourses();
  }, []);

  // Mock library statistics
  const libraryStats = {
    totalBooks: 1247,
    totalCourses: 24,
    recentUploads: 12,
    favoriteBooks: 89
  };

  // Mock recent books/documents
  const recentBooks = [
    {
      id: 1,
      title: "Advanced JavaScript Concepts",
      author: "John Smith",
      category: "Programming",
      pages: 324,
      rating: 4.8,
      downloadCount: 1250,
      uploadDate: "2024-01-15",
      isFavorite: true,
      color: "bg-blue-500"
    },
    {
      id: 2,
      title: "Data Structures & Algorithms",
      author: "Sarah Johnson",
      category: "Computer Science",
      pages: 456,
      rating: 4.9,
      downloadCount: 2100,
      uploadDate: "2024-01-12",
      isFavorite: false,
      color: "bg-green-500"
    },
    {
      id: 3,
      title: "Machine Learning Fundamentals",
      author: "Dr. Michael Chen",
      category: "AI/ML",
      pages: 289,
      rating: 4.7,
      downloadCount: 890,
      uploadDate: "2024-01-10",
      isFavorite: true,
      color: "bg-purple-500"
    },
    {
      id: 4,
      title: "Web Development Bootcamp",
      author: "Lisa Anderson",
      category: "Web Development",
      pages: 512,
      rating: 4.6,
      downloadCount: 1680,
      uploadDate: "2024-01-08",
      isFavorite: false,
      color: "bg-orange-500"
    },
    {
      id: 5,
      title: "Python for Data Science",
      author: "Dr. Emily Davis",
      category: "Data Science",
      pages: 398,
      rating: 4.8,
      downloadCount: 1420,
      uploadDate: "2024-01-05",
      isFavorite: true,
      color: "bg-red-500"
    },
    {
      id: 6,
      title: "React Native Development",
      author: "Mark Thompson",
      category: "Mobile Development",
      pages: 367,
      rating: 4.5,
      downloadCount: 980,
      uploadDate: "2024-01-03",
      isFavorite: false,
      color: "bg-orange-500"
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', count: 1247 },
    { id: 'programming', name: 'Programming', count: 324 },
    { id: 'computer-science', name: 'Computer Science', count: 289 },
    { id: 'web-dev', name: 'Web Development', count: 198 },
    { id: 'ai-ml', name: 'AI/ML', count: 156 },
    { id: 'data-science', name: 'Data Science', count: 142 },
    { id: 'mobile-dev', name: 'Mobile Development', count: 98 },
    { id: 'mathematics', name: 'Mathematics', count: 134 }
  ];

  // Courses data now comes from the backend API via useEffect

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileNames = Array.from(files).map(file => file.name);
      setUploadedFiles(prev => [...prev, ...fileNames]);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Upload Section */}
      <section className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Upload size={20} />
          Upload Documents for Summarization
        </h2>
        <p className="text-muted-foreground mb-6">
          Upload your study materials, notes, or documents to get AI-powered summaries and insights.
        </p>
        
        <div className="border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
          <Upload size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-medium mb-2">Drop files here or click to upload</p>
          <p className="text-sm text-muted-foreground mb-4">
            Supports PDF, DOC, TXT, and other text formats
          </p>
          <label className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg cursor-pointer transition">
            Choose Files
            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="mt-6">
            <h3 className="font-medium mb-3">Uploaded Files:</h3>
            <div className="space-y-2">
              {uploadedFiles.map((fileName, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                  <FileText size={16} className="text-gray-500" />
                  <span className="text-sm">{fileName}</span>
                  <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900 px-2 py-1 rounded">
                    Processing...
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Courses Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BookOpen size={20} />
            Available Courses
          </h2>
          
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${course.color} flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">{course.title}</span>
                </div>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg transition" title="Add course">
                  <Plus size={16} />
                </button>
              </div>
              
              <h3 className="font-semibold text-lg mb-1">{course.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {course.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{course.students} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{course.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">No courses found</p>
            <p className="text-muted-foreground">Try adjusting your search terms</p>
          </div>
        )}
      </section>
    </div>
  );
}
